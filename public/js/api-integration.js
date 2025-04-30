
// API integration functionality

// Initialize API key functionality
export function initializeApiKey() {
  // Set the default API key value
  document.getElementById('apify-api-key').value = 'apify_api_y9gocF4ETXbAde3CoqrbjiDOYpztOQ4zcywQ';
  
  // Automatically trigger the save button
  document.getElementById('save-api-key').click();
  
  // Load existing API key if available
  chrome.storage.sync.get(['apifyApiKey'], function(data) {
    if (data.apifyApiKey) {
      document.getElementById('apify-api-key').value = data.apifyApiKey;
      document.getElementById('api-status').textContent = 'Connected';
      document.getElementById('api-status').className = 'api-status connected';
    } else {
      document.getElementById('api-status').textContent = 'Not connected';
      document.getElementById('api-status').className = 'api-status not-connected';
    }
  });
  
  // Add event listener for save button
  document.getElementById('save-api-key').addEventListener('click', saveApiKey);
}

// Save API key function
function saveApiKey() {
  const apiKeyInput = document.getElementById('apify-api-key');
  const apiKey = apiKeyInput.value.trim();
  const statusElement = document.getElementById('api-status');
  
  statusElement.textContent = 'Connecting...';
  statusElement.className = 'api-status';
  statusElement.innerHTML = '<span class="loading-spinner"></span> Connecting...';
  
  if (apiKey) {
    chrome.runtime.sendMessage({ 
      type: 'SAVE_APIFY_API_KEY', 
      apiKey: apiKey 
    }, function(response) {
      if (response && response.success) {
        // Show success message
        const saveBtn = document.getElementById('save-api-key');
        const originalText = saveBtn.textContent;
        
        saveBtn.textContent = 'Saved!';
        saveBtn.style.backgroundColor = '#10b981';
        
        statusElement.textContent = 'Connected';
        statusElement.className = 'api-status connected';
        
        setTimeout(function() {
          saveBtn.textContent = originalText;
          saveBtn.style.backgroundColor = '';
        }, 2000);
      } else {
        // Show error
        console.error('Failed to save API key:', response ? response.error : 'Unknown error');
        statusElement.textContent = 'Connection failed';
        statusElement.className = 'api-status not-connected';
        alert('Failed to save API key. Please try again.');
      }
    });
  } else {
    statusElement.textContent = 'API key required';
    statusElement.className = 'api-status not-connected';
    alert('Please enter a valid API key');
  }
}
