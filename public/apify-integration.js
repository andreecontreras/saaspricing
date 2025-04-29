
// Apify Integration Module for Scout.io

// Apify API configuration
const APIFY_BASE_URL = 'https://api.apify.com/v2';
let APIFY_API_KEY = ''; // Will be set from user preferences

// Initialize the module
async function initApifyIntegration() {
  try {
    const data = await chrome.storage.sync.get(['apifyApiKey']);
    APIFY_API_KEY = data.apifyApiKey || '';
    console.log('Apify integration initialized');
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
    
    // Call the Apify API to run a web scraping task
    const response = await fetch(`${APIFY_BASE_URL}/acts/apify~web-scraper/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_API_KEY}`
      },
      body: JSON.stringify({
        "startUrls": [
          { "url": `https://www.google.com/search?q=${encodeURIComponent(productData.title + " price")}` }
        ],
        "pseudoUrls": [
          { "purl": "https://[.+]/[.+]" }
        ],
        "linkSelector": "a",
        "pageFunction": `async function pageFunction(context) {
          const { request, log, jQuery } = context;
          const $ = jQuery;
          const result = {
            title: $('title').text(),
            url: request.url,
            prices: []
          };
          
          // Extract prices with currency symbols
          const priceRegex = /\\$\\d+(\\.\\d{1,2})?/g;
          const pageText = $('body').text();
          const priceMatches = pageText.match(priceRegex);
          
          if (priceMatches) {
            result.prices = priceMatches.map(price => ({
              value: parseFloat(price.replace('$', '')),
              currency: '$',
              text: price
            }));
          }
          
          return result;
        }`,
        "maxRequestsPerCrawl": 10,
        "maxCrawlingDepth": 1
      })
    });
    
    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status}`);
    }
    
    const runData = await response.json();
    const runId = runData.data.id;
    
    // Wait for the task to complete (polling)
    return await waitForTaskCompletion(runId);
  } catch (error) {
    console.error('Error searching product prices:', error);
    return null;
  }
}

// Poll the Apify API for task completion
async function waitForTaskCompletion(runId, maxAttempts = 10) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const response = await fetch(`${APIFY_BASE_URL}/acts/apify~web-scraper/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${APIFY_API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Apify API error: ${response.status}`);
      }
      
      const runInfo = await response.json();
      
      if (runInfo.data.status === 'SUCCEEDED') {
        // Get the dataset items
        return await fetchDatasetItems(runInfo.data.defaultDatasetId);
      } else if (runInfo.data.status === 'FAILED' || runInfo.data.status === 'ABORTED') {
        throw new Error(`Apify task ${runInfo.data.status}`);
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 2000));
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
    
    return await response.json();
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
    
    // Extract all prices from the scraped data
    const allPrices = [];
    
    scrapedData.forEach(item => {
      if (item.prices && item.prices.length > 0) {
        item.prices.forEach(price => {
          allPrices.push({
            price: price.value,
            seller: new URL(item.url).hostname.replace('www.', ''),
            url: item.url
          });
        });
      }
    });
    
    // Sort prices from lowest to highest
    allPrices.sort((a, b) => a.price - b.price);
    
    // Filter out prices that are too low (likely errors or different products)
    const reasonablePrices = allPrices.filter(item => 
      item.price >= productData.price * 0.5 && item.price <= productData.price * 1.5
    );
    
    if (reasonablePrices.length === 0) {
      console.log('No reasonable prices found, using mock data');
      return null;
    }
    
    return {
      lowestPrice: reasonablePrices[0],
      allPrices: reasonablePrices
    };
  } catch (error) {
    console.error('Error processing scraped data:', error);
    return null;
  }
}

// Export the module functions
export {
  initApifyIntegration,
  searchProductPrices,
  processScrapedData
};

