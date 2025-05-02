// Main popup.js file - imports and coordinates all functionality
import { initializeApiKey } from './js/api-integration.js';
import { initializePrioritization } from './js/prioritization.js';
import { initializeDisplayOptions } from './js/display-options.js';
import { initializeAlternativeProducts } from './js/alternative-products.js';
import { initSentimentAnalysis } from './js/huggingface-integration.js';

// Initialize all features when popup is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize API integration
  initializeApiKey();
  
  // Initialize toggle and trial banner
  initializeToggleAndTrial();
  
  // Initialize prioritization options
  initializePrioritization();
  
  // Initialize display options
  initializeDisplayOptions();
  
  // Initialize alternative products section
  initializeAlternativeProducts();
  
  // Update Hugging Face status to disabled
  initializeHuggingFace();
  
  // Check for active product - this will update the UI if a product is being browsed
  console.log("Checking for active product on DOM content load...");
  checkForActiveProduct();
});

// Function to check if there's an active product and update the UI accordingly
function checkForActiveProduct() {
  chrome.runtime.sendMessage({type: 'CHECK_ACTIVE_PRODUCT'}, function(response) {
    console.log("Active product check response:", response);
    
    if (response && response.hasActiveProduct) {
      console.log("Active product found, refreshing alternatives section");
      // Product detected, refresh the alternatives section
      chrome.storage.sync.get('prioritizeBy', function(data) {
        const mode = data.prioritizeBy || 'balanced';
        // Use the existing function from alternative-products.js
        import('./js/alternative-products.js').then(module => {
          module.refreshAlternativeProducts(mode);
        });
      });
    } else {
      console.log("No active product found, showing initial message");
      // No product found, make sure we're showing the no products message
      import('./js/alternative-products.js').then(module => {
        const productsContainer = document.getElementById('alternative-products-container');
        if (productsContainer) {
          // This function is defined in alternative-products.js
          const showNoProductsMessage = function(container) {
            // Clear the container first
            container.innerHTML = '';
            
            // Add the no products message
            const initialMessage = document.createElement('div');
            initialMessage.className = 'no-products-message';
            initialMessage.innerHTML = `
              <div class="text-center py-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 text-gray-400">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <p class="text-gray-500">Browse a product online to see similar items with better prices</p>
              </div>
            `;
            container.appendChild(initialMessage);
          };
          
          showNoProductsMessage(productsContainer);
        }
      });
    }
  });
}

// Function to initialize Hugging Face integration status as disabled
function initializeHuggingFace() {
  const hfStatus = document.getElementById('hf-status');
  if (hfStatus) {
    hfStatus.textContent = 'Disabled';
    hfStatus.classList.add('not-connected');
  }
}

// Function to initialize the toggle and trial banner
function initializeToggleAndTrial() {
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
}
