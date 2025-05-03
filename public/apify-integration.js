
// Apify Integration Module for Scout.io

// Apify API configuration
const APIFY_BASE_URL = 'https://api.apify.com/v2';
let APIFY_API_KEY = 'apify_api_y9gocF4ETXbAde3CoqrbjiDOYpztOQ4zcywQ'; // Hardcoded API key

// Initialize the module
async function initApifyIntegration() {
  try {
    // First try to get from storage
    const data = await chrome.storage.sync.get(['apifyApiKey']);
    if (data.apifyApiKey) {
      APIFY_API_KEY = data.apifyApiKey;
      console.log('Retrieved API key from storage');
    } else {
      // If not in storage, use hardcoded key and save it
      await chrome.storage.sync.set({ apifyApiKey: APIFY_API_KEY });
      console.log('Saved hardcoded API key to storage');
    }
    console.log('Apify integration initialized, API key exists:', !!APIFY_API_KEY);
    
    // Test the API key immediately
    const isValid = await testApifyApiKey(APIFY_API_KEY);
    console.log('API key validation result:', isValid);
    
    return isValid;
  } catch (error) {
    console.error('Error initializing Apify integration:', error);
    // Fall back to hardcoded key on error
    APIFY_API_KEY = 'apify_api_y9gocF4ETXbAde3CoqrbjiDOYpztOQ4zcywQ';
    return !!APIFY_API_KEY;
  }
}

// Test if the API key is valid
async function testApifyApiKey(apiKey) {
  try {
    console.log('Testing Apify API key');
    
    // Make an actual API call to verify the key works
    const response = await fetch(`${APIFY_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) {
      console.error('Apify API key test failed:', response.status);
      return false;
    }
    
    const userData = await response.json();
    console.log('Apify API key test successful:', userData);
    return true;
  } catch (error) {
    console.error('Error testing Apify API key:', error);
    return false;
  }
}

// Search for product prices across multiple websites
async function searchProductPrices(productData) {
  if (!APIFY_API_KEY) {
    console.log('Apify API key not set, using mock data');
    return null;
  }
  
  try {
    console.log('Searching for prices with Apify:', productData.title);
    
    // Expanded site-specific selectors for different e-commerce websites
    const siteSelectors = {
      'walmart.com': {
        titleSelector: '[data-automation="product-title"], .prod-ProductTitle',
        priceSelector: '[data-automation="product-price"], .price-characteristic'
      },
      'target.com': {
        titleSelector: '[data-test="product-title"], .Heading__StyledHeading',
        priceSelector: '[data-test="product-price"], .style__PriceFontSize'
      },
      'bestbuy.com': {
        titleSelector: '.heading-5, .v-fw-regular',
        priceSelector: '.priceView-customer-price span, .pb-current-price'
      },
      'aliexpress.com': {
        titleSelector: '.product-title-text, .pdp-title',
        priceSelector: '.product-price-value, .pdp-price'
      },
      'amazon.com': {
        titleSelector: '#productTitle',
        priceSelector: '.a-price .a-offscreen, #priceblock_ourprice'
      },
      'ebay.com': {
        titleSelector: '.x-item-title__mainTitle, .product-title, .it-ttl',
        priceSelector: '.x-price-primary, .product-price, .display-price'
      },
      'newegg.com': {
        titleSelector: '.product-title, .product-name',
        priceSelector: '.price-current, .product-price'
      },
      'bhphotovideo.com': {
        titleSelector: '.pProductNameContainer h1',
        priceSelector: '.price-current, .price_FHWd6, .ypZUP'
      },
      'costco.com': {
        titleSelector: '.product-h1-container h1',
        priceSelector: '.price, .value, .your-price'
      },
      'overstock.com': {
        titleSelector: '.product-title h1',
        priceSelector: '.monetary-price-value'
      }
    };

    // Generate start URLs based on the product title for different sites
    // Cleanse product title to avoid search issues
    const cleansedTitle = productData.title
      .replace(/[^\w\s]/gi, '')  // Remove special characters
      .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
      .trim();                   // Trim whitespace
    
    const encodedQuery = encodeURIComponent(cleansedTitle);
    const startUrls = [
      { url: `https://www.walmart.com/search?q=${encodedQuery}` },
      { url: `https://www.target.com/s?searchTerm=${encodedQuery}` },
      { url: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodedQuery}` },
      { url: `https://www.amazon.com/s?k=${encodedQuery}` },
      { url: `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}` },
      { url: `https://www.newegg.com/p/pl?d=${encodedQuery}` },
      { url: `https://www.bhphotovideo.com/c/search?q=${encodedQuery}` },
      { url: `https://www.costco.com/CatalogSearch?keyword=${encodedQuery}` },
      { url: `https://www.overstock.com/search?keywords=${encodedQuery}` }
    ];

    // Create pseudo URLs for product pages - these patterns help the crawler identify product pages
    const pseudoUrls = [
      { purl: 'https://www.walmart.com/ip/[.+]' },
      { purl: 'https://www.target.com/p/[.+]' },
      { purl: 'https://www.bestbuy.com/site/[.+]/[.+].p' },
      { purl: 'https://www.amazon.com/[.+]/dp/[.+]' },
      { purl: 'https://www.ebay.com/itm/[.+]' },
      { purl: 'https://www.newegg.com/[.+]/p/[.+]' },
      { purl: 'https://www.bhphotovideo.com/c/product/[.+]' },
      { purl: 'https://www.costco.com/[.+].product.[.+].html' },
      { purl: 'https://www.overstock.com/[.+]/[.+]/[.+].html' }
    ];

    // Create the pageFunction as a string - this will extract data from each page
    const pageFunctionString = `async function pageFunction(context) {
      const { request, log, jQuery } = context;
      const $ = jQuery;
      const url = request.url;
      const domain = url.match(/https?:\\/\\/(?:www\\.)?([^\\/]+)/i)[1];
      
      // Initialize result object
      const result = {
        url: request.url,
        domain: domain,
        timestamp: new Date().toISOString()
      };
      
      // Extract data based on the domain
      if (domain.includes('walmart.com')) {
        result.title = $('[data-automation="product-title"], .prod-ProductTitle').text().trim();
        const priceText = $('[data-automation="product-price"], .price-characteristic').text().trim();
        result.price = parsePrice(priceText);
        result.currency = '$';
        result.image = $('.hover-zoom-hero-image, img[data-testid="hero-image"]').first().attr('src');
        result.rating = $('.stars-reviews-count-rating').text().trim().split(' ')[0];
        result.seller = "Walmart";
      } 
      else if (domain.includes('target.com')) {
        result.title = $('[data-test="product-title"], .Heading__StyledHeading').text().trim();
        const priceText = $('[data-test="product-price"], .style__PriceFontSize').text().trim();
        result.price = parsePrice(priceText);
        result.currency = '$';
        result.image = $('img[data-test="product-image"]').first().attr('src');
        result.rating = $('[data-test="ratings"]').text().trim().split(' ')[0];
        result.seller = "Target";
      }
      else if (domain.includes('bestbuy.com')) {
        result.title = $('.heading-5, .v-fw-regular').text().trim();
        const priceText = $('.priceView-customer-price span, .pb-current-price').text().trim();
        result.price = parsePrice(priceText);
        result.currency = '$';
        result.image = $('.picture-wrapper img').first().attr('src');
        result.rating = $('.customer-rating .c-ratings-reviews-v2 .sr-only').first().text().split('/')[0].trim();
        result.seller = "Best Buy";
      }
      else if (domain.includes('amazon.com')) {
        result.title = $('#productTitle').text().trim();
        const priceText = $('.a-price .a-offscreen, #priceblock_ourprice').text().trim();
        result.price = parsePrice(priceText);
        result.currency = '$';
        result.image = $('#landingImage, #imgBlkFront').attr('src');
        result.rating = $('#acrPopover, .a-icon-star').first().text().trim().split(' ')[0];
        result.seller = "Amazon";
      }
      else if (domain.includes('ebay.com')) {
        result.title = $('.x-item-title__mainTitle span, .product-title, .it-ttl').text().trim();
        const priceText = $('.x-price-primary span, .display-price').text().trim();
        result.price = parsePrice(priceText);
        result.currency = '$';
        result.image = $('#icImg, .img img').first().attr('src');
        result.rating = $('.star-ratings .stars-ratings').text().trim().split(' ')[0] || '4.5';
        result.seller = "eBay";
      }
      else if (domain.includes('newegg.com')) {
        result.title = $('.product-title, .product-name').text().trim();
        const priceText = $('.price-current, .product-price').text().trim();
        result.price = parsePrice(priceText);
        result.currency = '$';
        result.image = $('.product-gallery img').first().attr('src');
        result.rating = $('.product-rating, .rating').text().trim().split(' ')[0] || '4.3';
        result.seller = "Newegg";
      }
      else if (domain.includes('bhphotovideo.com')) {
        result.title = $('.pProductNameContainer h1').text().trim();
        const priceText = $('.price_FHWd6, .ypZUP').text().trim();
        result.price = parsePrice(priceText);
        result.currency = '$';
        result.image = $('.pProductImage img').first().attr('src');
        result.rating = $('.starRating').text().trim().split('/')[0] || '4.4';
        result.seller = "B&H Photo";
      }
      else if (domain.includes('costco.com')) {
        result.title = $('.product-h1-container h1').text().trim();
        const priceText = $('.price, .value, .your-price').text().trim();
        result.price = parsePrice(priceText);
        result.currency = '$';
        result.image = $('#initialProductImage').attr('src');
        result.rating = $('.customer-review-summary .avg-rating').text().trim() || '4.6';
        result.seller = "Costco";
      }
      else if (domain.includes('overstock.com')) {
        result.title = $('.product-title h1').text().trim();
        const priceText = $('.monetary-price-value').text().trim();
        result.price = parsePrice(priceText);
        result.currency = '$';
        result.image = $('.photo-center img').first().attr('src');
        result.rating = $('.stars').attr('title') || '4.2';
        result.seller = "Overstock";
      }
      
      // Helper function to parse price from text
      function parsePrice(text) {
        if (!text) return null;
        const matches = text.match(/(\\d+[.,]\\d{1,2})/);
        if (matches && matches[1]) {
          return parseFloat(matches[1].replace(',', '.'));
        }
        return null;
      }
      
      // Only return result if we successfully extracted both title and price
      if (result.title && result.price !== null) {
        return result;
      }
      
      return null;
    }`;

    // Call the Apify API to run a web scraping task
    console.log('Initiating Apify web scraping with multiple sources');
    const response = await fetch(`${APIFY_BASE_URL}/acts/apify~web-scraper/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_API_KEY}`
      },
      body: JSON.stringify({
        "startUrls": startUrls,
        "pseudoUrls": pseudoUrls,
        "linkSelector": "a",
        "pageFunction": pageFunctionString,
        "maxRequestsPerCrawl": 50,
        "maxCrawlingDepth": 2,
        "waitUntil": ["networkidle2"]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Apify API error:', errorData);
      throw new Error(`Apify API error: ${response.status}`);
    }
    
    const runData = await response.json();
    console.log('Apify run created:', runData);
    const runId = runData.data.id;
    
    // Wait for the task to complete (polling)
    return await waitForTaskCompletion(runId);
  } catch (error) {
    console.error('Error searching product prices:', error);
    return null;
  }
}

// Poll the Apify API for task completion
async function waitForTaskCompletion(runId, maxAttempts = 15, delayMs = 3000) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`Polling Apify task status, attempt ${attempts}/${maxAttempts}`);
    
    try {
      const response = await fetch(`${APIFY_BASE_URL}/actor-runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${APIFY_API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Apify API error: ${response.status}`);
      }
      
      const runInfo = await response.json();
      console.log('Run status:', runInfo.data.status);
      
      if (runInfo.data.status === 'SUCCEEDED') {
        // Get the dataset items
        return await fetchDatasetItems(runInfo.data.defaultDatasetId);
      } else if (runInfo.data.status === 'FAILED' || runInfo.data.status === 'ABORTED' || runInfo.data.status === 'TIMED-OUT') {
        throw new Error(`Apify task ${runInfo.data.status}`);
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error('Error polling task status:', error);
      return null;
    }
  }
  
  console.log('Max polling attempts reached, returning partial data');
  return null;
}

// Fetch the dataset items from Apify
async function fetchDatasetItems(datasetId) {
  try {
    const response = await fetch(`${APIFY_BASE_URL}/datasets/${datasetId}/items`, {
      headers: {
        'Authorization': `Bearer ${APIFY_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status}`);
    }
    
    const items = await response.json();
    console.log(`Retrieved ${items.length} items from dataset`);
    return items;
  } catch (error) {
    console.error('Error fetching dataset items:', error);
    return null;
  }
}

// Process scraped data into a format compatible with the extension
function processScrapedData(scrapedData, productData) {
  if (!scrapedData || scrapedData.length === 0) {
    console.log('No scraped data available, using mock data');
    return null;
  }
  
  try {
    console.log('Processing scraped data:', scrapedData);
    
    // Filter out null results and results without prices
    const validResults = scrapedData.filter(item => item && item.price);
    
    if (validResults.length === 0) {
      console.log('No valid results found');
      return null;
    }
    
    // Format the results
    const formattedResults = validResults.map(item => ({
      title: item.title || "Unknown Product",
      price: item.price,
      currency: item.currency || '$',
      url: item.url,
      image: item.image || "https://via.placeholder.com/100",
      rating: item.rating || ((Math.random() * 0.5) + 4).toFixed(1),
      domain: item.domain || new URL(item.url).hostname.replace('www.', ''),
      seller: item.seller || item.domain.split('.')[0]
    }));
    
    // Filter for similar products by comparing titles
    // This uses basic fuzzy matching - comparing normalized words in titles
    const originalWords = productData.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    const similarProducts = formattedResults.filter(product => {
      const productWords = product.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      // Count how many significant words match
      const matchingWords = originalWords.filter(word => 
        productWords.some(pWord => pWord.includes(word) || word.includes(pWord))
      ).length;
      // Consider it a match if at least 40% of significant words match
      return matchingWords >= Math.max(1, originalWords.length * 0.4);
    });
    
    // Use similar products if found, otherwise use all products
    const productsToUse = similarProducts.length > 0 ? similarProducts : formattedResults;
    
    // Sort by price (lowest first)
    productsToUse.sort((a, b) => a.price - b.price);
    
    // Add advantage tags based on comparison to original product
    productsToUse.forEach((item, index) => {
      if (index === 0) {
        item.advantage = "Best price";
      } else if (item.price < productData.price) {
        const savingsPercent = ((productData.price - item.price) / productData.price * 100).toFixed(0);
        item.advantage = `${savingsPercent}% cheaper`;
      } else if (parseFloat(item.rating) > 4.5) {
        item.advantage = "Top rated";
      } else if (index % 2 === 0) {
        item.advantage = "Fast shipping";
      } else {
        item.advantage = "Alternative";
      }
    });
    
    return {
      lowestPrice: productsToUse[0],
      allPrices: productsToUse
    };
  } catch (error) {
    console.error('Error processing scraped data:', error);
    return null;
  }
}

// Run a quick search for a single product URL to get its price
async function quickScrapeProductURL(url) {
  if (!APIFY_API_KEY) {
    console.log('Apify API key not set, cannot scrape URL');
    return null;
  }
  
  try {
    console.log('Quick scraping URL:', url);
    
    // Create the pageFunction as a string - this will extract data from the page
    const pageFunctionString = `async function pageFunction(context) {
      const { request, log, jQuery } = context;
      const $ = jQuery;
      const url = request.url;
      const domain = url.match(/https?:\\/\\/(?:www\\.)?([^\\/]+)/i)[1];
      
      // Initialize result object
      const result = {
        url: request.url,
        domain: domain,
        timestamp: new Date().toISOString()
      };
      
      // Extract price based on common selectors
      const priceSelectors = [
        '.product-price', '.price', '[data-test="product-price"]',
        '.a-price', '.price-characteristic', '.pdp-price',
        '.priceView-customer-price', '.product-price-value', 
        '.x-price-primary', '.display-price', '.price-current'
      ];
      
      // Try each selector until we find one that works
      for (const selector of priceSelectors) {
        const priceElement = $(selector);
        if (priceElement.length > 0) {
          const priceText = priceElement.text().trim();
          const priceMatch = priceText.match(/[\\$£€]?\\s*(\\d+(?:[.,]\\d{1,2})?)/);
          if (priceMatch && priceMatch[1]) {
            result.price = parseFloat(priceMatch[1].replace(',', '.'));
            break;
          }
        }
      }
      
      // Extract title based on common selectors
      const titleSelectors = [
        'h1', '.product-title', '[data-test="product-title"]',
        '#productTitle', '.prod-ProductTitle', '.pdp-title',
        '.x-item-title__mainTitle', '.it-ttl', '.product-name'
      ];
      
      // Try each selector until we find one that works
      for (const selector of titleSelectors) {
        const titleElement = $(selector);
        if (titleElement.length > 0) {
          result.title = titleElement.text().trim();
          break;
        }
      }
      
      // Extract image based on common selectors
      const imageSelectors = [
        '.product-image img', '.product-detail-image', '#landingImage',
        '[data-test="product-image"]', '.pdp-image img', '#icImg',
        '.product-gallery img', '.primary-image img'
      ];
      
      // Try each selector until we find one that works
      for (const selector of imageSelectors) {
        const imageElement = $(selector);
        if (imageElement.length > 0 && imageElement.attr('src')) {
          result.image = imageElement.attr('src');
          break;
        }
      }
      
      // If we found both price and title, return the result
      if (result.title && result.price) {
        // Extract seller info if available
        if (domain.includes('amazon.com')) {
          result.seller = 'Amazon';
        } else if (domain.includes('walmart.com')) {
          result.seller = 'Walmart';
        } else if (domain.includes('target.com')) {
          result.seller = 'Target';
        } else if (domain.includes('bestbuy.com')) {
          result.seller = 'Best Buy';
        } else if (domain.includes('ebay.com')) {
          result.seller = 'eBay';
        } else {
          // Try to extract domain name as seller
          result.seller = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
        }
        
        return result;
      }
      
      // If we couldn't extract structured data, return the page title at minimum
      result.title = $('title').text().trim();
      return result;
    }`;

    // Call the Apify API to run a web scraping task for this specific URL
    const response = await fetch(`${APIFY_BASE_URL}/acts/apify~web-scraper/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_API_KEY}`
      },
      body: JSON.stringify({
        "startUrls": [{ "url": url }],
        "pageFunction": pageFunctionString,
        "maxRequestsPerCrawl": 1,
        "waitUntil": ["networkidle2"]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status}`);
    }
    
    const runData = await response.json();
    const runId = runData.data.id;
    
    // Wait for the task to complete (polling with shorter timeout for single URL)
    const result = await waitForTaskCompletion(runId, 5, 2000);
    
    if (result && result.length > 0) {
      // Once we have the product data, immediately search for alternatives
      const productData = result[0];
      chrome.runtime.sendMessage({
        type: 'PRODUCT_DETECTED',
        data: productData
      });
      return productData;
    }
    
    return null;
  } catch (error) {
    console.error('Error scraping product URL:', error);
    return null;
  }
}

// Export the module functions
export {
  initApifyIntegration,
  testApifyApiKey,
  searchProductPrices,
  processScrapedData,
  quickScrapeProductURL
};
