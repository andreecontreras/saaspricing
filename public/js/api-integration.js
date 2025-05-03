
// API integration functionality

// Initialize API key functionality
export function initializeApiKey() {
  const apiKey = 'apify_api_y9gocF4ETXbAde3CoqrbjiDOYpztOQ4zcywQ';
  
  // Save the API key directly without user input
  saveApiKeyInternal(apiKey);
  
  // Log that we've set the API key
  console.log('API key initialized with hardcoded value');
  
  // Test the key immediately after initialization
  testApiKey(apiKey);
  
  // Return the API key for immediate use
  return apiKey;
}

// Internal function to save the API key
function saveApiKeyInternal(apiKey) {
  if (apiKey) {
    chrome.runtime.sendMessage({ 
      type: 'SAVE_APIFY_API_KEY', 
      apiKey: apiKey 
    }, function(response) {
      if (response && response.success) {
        console.log('API key set successfully');
        
        // Verify that the key is working by testing it
        testApiKey(apiKey);
      } else {
        console.error('Failed to save API key:', response ? response.error : 'Unknown error');
      }
    });
  }
}

// Function to test if API key is working
function testApiKey(apiKey) {
  console.log('Testing API key: ' + apiKey);
  chrome.runtime.sendMessage({
    type: 'TEST_APIFY_API_KEY',
    apiKey: apiKey
  }, function(response) {
    console.log('API key test result:', response ? response.success : 'No response');
  });
}

// Function to directly trigger product detection for testing
export function testProductDetection() {
  console.log('Manually triggering product detection for testing');
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs && tabs[0] && tabs[0].id) {
      chrome.runtime.sendMessage({
        type: 'FORCE_PRODUCT_DETECTION',
        tabId: tabs[0].id
      }, function(response) {
        if (response && response.success) {
          console.log("Forced product detection successful");
          // Update UI to show products
          chrome.runtime.sendMessage({type: 'REFRESH_PRODUCT_DISPLAY'});
        } else {
          console.error("Forced product detection failed:", response);
        }
      });
    } else {
      console.error("No active tab found");
    }
  });
}

// Function to trigger price drop tracking
export function trackPriceDrops(productUrl, currentPrice) {
  console.log('Tracking price drops for:', productUrl, 'Current price:', currentPrice);
  
  chrome.runtime.sendMessage({
    type: 'TRACK_PRICE_DROPS',
    productUrl: productUrl,
    currentPrice: currentPrice
  }, function(response) {
    console.log('Price tracking response:', response);
  });
}

// Function to check price history
export function checkPriceHistory(productUrl) {
  console.log('Checking price history for:', productUrl);
  
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      type: 'CHECK_PRICE_HISTORY',
      productUrl: productUrl
    }, function(response) {
      console.log('Price history response:', response);
      resolve(response);
    });
  });
}
