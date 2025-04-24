// Popup script for Savvy Shop Whisper Chrome Extension

document.addEventListener('DOMContentLoaded', async () => {
  // Get references to UI elements
  const enableToggle = document.getElementById('enable-toggle');
  const prioritizePrice = document.getElementById('prioritize-price');
  const prioritizeReviews = document.getElementById('prioritize-reviews');
  const prioritizeShipping = document.getElementById('prioritize-shipping');
  const prioritizeBalanced = document.getElementById('prioritize-balanced');
  const showTrustScores = document.getElementById('show-trust-scores');
  const showAlternatives = document.getElementById('show-alternatives');
  const notifyPriceDrops = document.getElementById('notify-price-drops');
  const daysRemaining = document.getElementById('days-remaining');
  const trialBanner = document.getElementById('trial-banner');
  const subscriptionBadge = document.getElementById('subscription-badge');
  const settingsBtn = document.getElementById('settings-btn');
  
  // Load saved preferences
  loadPreferences();
  
  // Load subscription status
  loadSubscriptionStatus();
  
  // Set up event listeners for preference changes
  enableToggle.addEventListener('change', savePreferences);
  prioritizePrice.addEventListener('change', savePreferences);
  prioritizeReviews.addEventListener('change', savePreferences);
  prioritizeShipping.addEventListener('change', savePreferences);
  prioritizeBalanced.addEventListener('change', savePreferences);
  showTrustScores.addEventListener('change', savePreferences);
  showAlternatives.addEventListener('change', savePreferences);
  notifyPriceDrops.addEventListener('change', savePreferences);
  
  // Set up events for upgrade buttons
  document.querySelectorAll('.upgrade-btn').forEach(button => {
    button.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://savvyshopwhisper.com/upgrade' });
    });
  });
  
  // Load saved user preferences
  async function loadPreferences() {
    try {
      const data = await chrome.storage.sync.get([
        'isEnabled',
        'prioritizeBy',
        'showTrustScores',
        'showAlternatives',
        'notifyPriceDrops'
      ]);
      
      // Apply loaded preferences to UI
      enableToggle.checked = data.isEnabled !== undefined ? data.isEnabled : true;
      
      const prioritizeValue = data.prioritizeBy || 'balanced';
      prioritizePrice.checked = prioritizeValue === 'price';
      prioritizeReviews.checked = prioritizeValue === 'reviews';
      prioritizeShipping.checked = prioritizeValue === 'shipping';
      prioritizeBalanced.checked = prioritizeValue === 'balanced';
      
      showTrustScores.checked = data.showTrustScores !== undefined ? data.showTrustScores : true;
      showAlternatives.checked = data.showAlternatives !== undefined ? data.showAlternatives : true;
      notifyPriceDrops.checked = data.notifyPriceDrops !== undefined ? data.notifyPriceDrops : true;
      
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }
  
  // Save preferences when they change
  async function savePreferences() {
    try {
      // Determine which prioritization option is selected
      let prioritizeBy = 'balanced';
      if (prioritizePrice.checked) prioritizeBy = 'price';
      if (prioritizeReviews.checked) prioritizeBy = 'reviews';
      if (prioritizeShipping.checked) prioritizeBy = 'shipping';
      
      // Save to chrome storage
      await chrome.storage.sync.set({
        isEnabled: enableToggle.checked,
        prioritizeBy: prioritizeBy,
        showTrustScores: showTrustScores.checked,
        showAlternatives: showAlternatives.checked,
        notifyPriceDrops: notifyPriceDrops.checked
      });
      
      // Provide visual feedback that settings are saved
      showSavedIndicator();
      
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }
  
  // Load subscription status
  async function loadSubscriptionStatus() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_SUBSCRIPTION_STATUS'
      });
      
      if (response.status === 'trial') {
        // Update trial banner
        daysRemaining.textContent = response.daysRemaining;
        trialBanner.style.display = 'flex';
        subscriptionBadge.textContent = 'Free Trial';
        subscriptionBadge.style.backgroundColor = '#8B5CF6'; // Purple
      } else if (response.status === 'premium') {
        // Hide trial banner, show premium badge
        trialBanner.style.display = 'none';
        subscriptionBadge.textContent = 'Premium';
        subscriptionBadge.style.backgroundColor = '#10B981'; // Green
      } else {
        // Free tier
        trialBanner.innerHTML = `
          <div>
            <h3>Upgrade to Premium</h3>
            <p>Unlock all premium features</p>
          </div>
          <button class="upgrade-btn">Upgrade</button>
        `;
        trialBanner.style.display = 'flex';
        subscriptionBadge.textContent = 'Free';
        subscriptionBadge.style.backgroundColor = '#6B7280'; // Gray
      }
      
    } catch (error) {
      console.error('Error loading subscription status:', error);
    }
  }
  
  // Show a saved indicator briefly
  function showSavedIndicator() {
    const savedIndicator = document.createElement('div');
    savedIndicator.className = 'saved-indicator';
    savedIndicator.textContent = 'Settings saved';
    savedIndicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(16, 185, 129, 0.9);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1000;
    `;
    
    document.body.appendChild(savedIndicator);
    
    // Fade in
    setTimeout(() => {
      savedIndicator.style.opacity = '1';
    }, 10);
    
    // Fade out and remove
    setTimeout(() => {
      savedIndicator.style.opacity = '0';
      setTimeout(() => {
        savedIndicator.remove();
      }, 300);
    }, 2000);
  }
  
  // Settings button functionality
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
