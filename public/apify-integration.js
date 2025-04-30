
// Apify Integration Module for Scout.io

// Apify API configuration
const APIFY_BASE_URL = 'https://api.apify.com/v2';
let APIFY_API_KEY = ''; // Will be set from user preferences

// Initialize the module
async function initApifyIntegration() {
  try {
    const data = await chrome.storage.sync.get(['apifyApiKey']);
    APIFY_API_KEY = data.apifyApiKey || '';
    console.log('Apify integration initialized, API key exists:', !!APIFY_API_KEY);
    return !!APIFY_API_KEY;
  } catch (error) {
    console.error('Error initializing Apify integration:', error);
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
    
    // Site-specific selectors for different e-commerce websites
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
      }
    };

    // Generate start URLs based on the product title for different sites
    const encodedQuery = encodeURIComponent(productData.title);
    const startUrls = [
      { url: `https://www.walmart.com/search?q=${encodedQuery}` },
      { url: `https://www.target.com/s?searchTerm=${encodedQuery}` },
      { url: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodedQuery}` },
      { url: `https://www.aliexpress.com/wholesale?SearchText=${encodedQuery}` }
    ];

    // Create pseudo URLs for product pages
    const pseudoUrls = [
      { purl: 'https://www.walmart.com/ip/[.+]' },
      { purl: 'https://www.target.com/p/[.+]' },
      { purl: 'https://www.bestbuy.com/site/[.+]/[.+].p' },
      { purl: 'https://www.aliexpress.com/item/[.+].html' },
      { purl: 'https://www.amazon.com/[.+]/dp/[.+]' }
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
      } 
      else if (domain.includes('target.com')) {
        result.title = $('[data-test="product-title"], .Heading__StyledHeading').text().trim();
        const priceText = $('[data-test="product-price"], .style__PriceFontSize').text().trim();
        result.price = parsePrice(priceText);
        result.currency = '$';
      }
      else if (domain.includes('bestbuy.com')) {
        result.title = $('.heading-5, .v-fw-regular').text().trim();
        const priceText = $('.priceView-customer-price span, .pb-current-price').text().trim();
        result.price = parsePrice(priceText);
        result.currency = '$';
      }
      else if (domain.includes('aliexpress.com')) {
        result.title = $('.product-title-text, .pdp-title').text().trim();
        const priceText = $('.product-price-value, .pdp-price').text().trim();
        result.price = parsePrice(priceText);
        result.currency = '$';
      }
      else if (domain.includes('amazon.com')) {
        result.title = $('#productTitle').text().trim();
        const priceText = $('.a-price .a-offscreen, #priceblock_ourprice').text().trim();
        result.price = parsePrice(priceText);
        result.currency = '$';
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
        "maxRequestsPerCrawl": 20,
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
      title: item.title,
      price: item.price,
      currency: item.currency || '$',
      url: item.url,
      domain: item.domain || new URL(item.url).hostname.replace('www.', '')
    }));
    
    // Sort by price (lowest first)
    formattedResults.sort((a, b) => a.price - b.price);
    
    return {
      lowestPrice: formattedResults[0],
      allPrices: formattedResults
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
        '.priceView-customer-price', '.product-price-value'
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
        '#productTitle', '.prod-ProductTitle', '.pdp-title'
      ];
      
      // Try each selector until we find one that works
      for (const selector of titleSelectors) {
        const titleElement = $(selector);
        if (titleElement.length > 0) {
          result.title = titleElement.text().trim();
          break;
        }
      }
      
      // If we found both price and title, return the result
      if (result.title && result.price) {
        return result;
      }
      
      // If we couldn't extract structured data, return the page title at minimum
      result.title = $('title').text().trim();
      return result;
    }`;

    // Call the Apify API to run a web scraping task
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
    
    // Wait for the task to complete (polling with shorter timeout)
    const result = await waitForTaskCompletion(runId, 5, 2000);
    
    if (result && result.length > 0) {
      return result[0];
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
  searchProductPrices,
  processScrapedData,
  quickScrapeProductURL
};
