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
  
  // Initialize alternative products
  initializeAlternativeProducts();
  
  // Update Hugging Face status to disabled
  initializeHuggingFace();
});

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
