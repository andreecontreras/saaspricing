
// Main popup.js file - imports and coordinates all functionality
import { initializeApiKey } from './js/api-integration.js';
import { initializePrioritization } from './js/prioritization.js';
import { initializeDisplayOptions } from './js/display-options.js';
import { initializeAlternativeProducts } from './js/alternative-products.js';
import { initSentimentAnalysis } from './js/huggingface-integration.js';

// Initialize all features when popup is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("Scout.io popup loaded");
  
  // Apply hardware acceleration class to key elements for smoother animations
  applyHardwareAcceleration();
  
  // Initialize API integration (now using hardcoded key)
  initializeApiKey();
  
  // Initialize toggle and trial banner
  initializeToggleAndTrial();
  
  // Initialize prioritization options
  initializePrioritization();
  
  // Initialize display options
  initializeDisplayOptions();
  
  // Initialize alternative products section
  initializeAlternativeProducts();
  
  // Initialize Hugging Face
  initializeHuggingFace();
  
  // Check for active product - this will update the UI if a product is being browsed
  console.log("Checking for active product on DOM content load...");
  checkForActiveProduct();
  
  // Apply Lovable style classes to ensure consistency
  applyLovableStyleClasses();
});

// Function to apply hardware acceleration to interactive elements
function applyHardwareAcceleration() {
  const interactiveElements = document.querySelectorAll('.option, .checkbox, button, .product-card');
  interactiveElements.forEach(el => {
    el.classList.add('hardware-accelerated');
  });
}

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
      showNoProductsMessage();
    }
  });
}

// Function to show no products message with improved UI consistency
function showNoProductsMessage() {
  const productsContainer = document.getElementById('alternative-products-container');
  if (!productsContainer) {
    const section = document.getElementById('alternative-products-section');
    if (section) {
      // Create container if it doesn't exist
      const container = document.createElement('div');
      container.id = 'alternative-products-container';
      container.className = 'alternative-products-container';
      section.appendChild(container);
      
      // Add the no products message
      addNoProductsMessageToContainer(container);
    }
  } else {
    // Container exists, just update the message
    addNoProductsMessageToContainer(productsContainer);
  }
}

// Helper function to add no products message to container with Lovable styling
function addNoProductsMessageToContainer(container) {
  // Clear the container first
  container.innerHTML = '';
  
  // Add the no products message with Lovable-like styling
  const initialMessage = document.createElement('div');
  initialMessage.className = 'no-products-message';
  initialMessage.innerHTML = `
    <div class="text-center py-6">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 text-gray-400" style="margin: 0 auto 12px; color: #94a3b8;">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <p style="color: #64748b; font-size: 14px;">Browse a product online to see similar items with better prices</p>
    </div>
  `;
  container.appendChild(initialMessage);
}

// Function to initialize Hugging Face integration status - Lovable style
function initializeHuggingFace() {
  const hfStatus = document.getElementById('hf-status');
  if (hfStatus) {
    hfStatus.textContent = 'Disabled';
    hfStatus.classList.add('not-connected');
  }
  
  // Initialize sentiment analysis feature
  initSentimentAnalysis();
}

// Function to initialize the toggle and trial banner - Lovable style
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
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "TOGGLE_OVERLAY", enabled: enableToggle.checked});
      }
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

// Function to apply Lovable style classes to ensure UI/UX consistency
function applyLovableStyleClasses() {
  // Set active option styles
  document.querySelectorAll('.option input:checked').forEach(input => {
    const parent = input.closest('.option');
    if (parent) {
      parent.classList.add('active-option');
    }
  });

  // Add click event listeners for option selection with animation
  document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', function() {
      // Remove active class from all options in the same group
      const name = this.querySelector('input').getAttribute('name');
      document.querySelectorAll(`.option input[name="${name}"]`).forEach(input => {
        input.closest('.option').classList.remove('active-option');
      });
      
      // Add active class to selected option
      this.classList.add('active-option');
      
      // Trigger animation
      this.style.animation = 'none';
      setTimeout(() => {
        this.style.animation = 'optionSelected 0.3s ease';
      }, 5);
    });
  });
  
  // Fix checkbox styling
  document.querySelectorAll('.checkbox input').forEach(checkbox => {
    checkbox.style.accentColor = '#6366f1';
  });
  
  // Add smooth transitions to buttons
  document.querySelectorAll('button').forEach(button => {
    button.style.transition = 'all 0.2s ease';
  });
  
  // Add subtle hover effect to cards
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-3px)';
      card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}
