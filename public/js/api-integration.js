
// API integration functionality

// Initialize API key functionality
export function initializeApiKey() {
  const apiKey = 'apify_api_y9gocF4ETXbAde3CoqrbjiDOYpztOQ4zcywQ';
  
  // Save the API key directly without user input
  saveApiKeyInternal(apiKey);
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
  chrome.runtime.sendMessage({
    type: 'TEST_APIFY_API_KEY',
    apiKey: apiKey
  }, function(response) {
    console.log('API key test result:', response ? response.success : 'No response');
  });
}
