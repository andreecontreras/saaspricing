// Add this to your popup.js file

// Save API key button
document.getElementById('save-api-key').addEventListener('click', function() {
  const apiKeyInput = document.getElementById('apify-api-key');
  const apiKey = apiKeyInput.value.trim();
  
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
        
        setTimeout(function() {
          saveBtn.textContent = originalText;
          saveBtn.style.backgroundColor = '';
        }, 2000);
      } else {
        // Show error
        console.error('Failed to save API key:', response ? response.error : 'Unknown error');
        alert('Failed to save API key. Please try again.');
      }
    });
  } else {
    alert('Please enter a valid API key');
  }
});

// Load saved API key when popup opens
document.addEventListener('DOMContentLoaded', function() {
  // Load existing API key if available
  chrome.storage.sync.get(['apifyApiKey'], function(data) {
    if (data.apifyApiKey) {
      document.getElementById('apify-api-key').value = data.apifyApiKey;
    }
  });
  
  // Get references to the toggle and trial banner elements
  const enableToggle = document.getElementById('enable-toggle');
  const trialBanner = document.getElementById('trial-banner');
  const daysRemaining = document.getElementById('days-remaining');
  const subscriptionBadge = document.getElementById('subscription-badge');

  // Load saved state of the toggle
  chrome.storage.sync.get('isEnabled', function(data) {
    enableToggle.checked = data.isEnabled !== false; // Default to true
  });

  // Add listener to the toggle
  enableToggle.addEventListener('change', function() {
    chrome.storage.sync.set({ 'isEnabled': enableToggle.checked });
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "TOGGLE_OVERLAY", enabled: enableToggle.checked});
    });
  });

  // Load and display trial information
  chrome.storage.sync.get(['userSubscription', 'trialEndDate'], function(data) {
    const now = new Date();
    const trialEnd = new Date(data.trialEndDate || 0);

    if (data.userSubscription === 'trial' && trialEnd > now) {
      // Calculate days remaining
      const timeLeft = trialEnd.getTime() - now.getTime();
      const days = Math.ceil(timeLeft / (1000 * 3600 * 24));
      daysRemaining.textContent = days;
    } else {
      // Hide the trial banner if not in trial or trial has ended
      trialBanner.style.display = 'none';
      subscriptionBadge.textContent = 'Free';
    }
  });

  // Load and set the prioritize by option
  const prioritizePrice = document.getElementById('prioritize-price');
  const prioritizeReviews = document.getElementById('prioritize-reviews');
  const prioritizeShipping = document.getElementById('prioritize-shipping');
  const prioritizeBalanced = document.getElementById('prioritize-balanced');

  chrome.storage.sync.get('prioritizeBy', function(data) {
    switch (data.prioritizeBy) {
      case 'price':
        prioritizePrice.checked = true;
        break;
      case 'reviews':
        prioritizeReviews.checked = true;
        break;
      case 'shipping':
        prioritizeShipping.checked = true;
        break;
      default:
        prioritizeBalanced.checked = true;
    }
  });

  // Add listeners to the prioritize by options
  prioritizePrice.addEventListener('change', function() {
    chrome.storage.sync.set({ 'prioritizeBy': 'price' });
  });

  prioritizeReviews.addEventListener('change', function() {
    chrome.storage.sync.set({ 'prioritizeBy': 'reviews' });
  });

  prioritizeShipping.addEventListener('change', function() {
    chrome.storage.sync.set({ 'prioritizeBy': 'shipping' });
  });

  prioritizeBalanced.addEventListener('change', function() {
    chrome.storage.sync.set({ 'prioritizeBy': 'balanced' });
  });

  // Load and set the display options
  const showTrustScores = document.getElementById('show-trust-scores');
  const showAlternatives = document.getElementById('show-alternatives');
  const notifyPriceDrops = document.getElementById('notify-price-drops');

  chrome.storage.sync.get(['showTrustScores', 'showAlternatives', 'notifyPriceDrops'], function(data) {
    showTrustScores.checked = data.showTrustScores !== false; // Default to true
    showAlternatives.checked = data.showAlternatives !== false; // Default to true
    notifyPriceDrops.checked = data.notifyPriceDrops === true; // Default to false
  });

  // Add listeners to the display options
  showTrustScores.addEventListener('change', function() {
    chrome.storage.sync.set({ 'showTrustScores': showTrustScores.checked });
  });

  showAlternatives.addEventListener('change', function() {
    chrome.storage.sync.set({ 'showAlternatives': showAlternatives.checked });
  });

  notifyPriceDrops.addEventListener('change', function() {
    chrome.storage.sync.set({ 'notifyPriceDrops': notifyPriceDrops.checked });
  });
});
