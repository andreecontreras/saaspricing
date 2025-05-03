
// Main popup.js file - imports and coordinates all functionality
import { initializeApiKey, testProductDetection, trackPriceDrops, checkPriceHistory } from './js/api-integration.js';
import { initializePrioritization } from './js/prioritization.js';
import { initializeDisplayOptions } from './js/display-options.js';
import { initializeAlternativeProducts, forceShowProducts } from './js/alternative-products.js';
import { initSentimentAnalysis } from './js/huggingface-integration.js';

// Initialize all features when popup is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("Scout.io popup loaded");
  
  // Apply hardware acceleration class to key elements for smoother animations
  applyHardwareAcceleration();
  
  // Initialize API integration first (now using hardcoded key)
  const apiKey = initializeApiKey();
  console.log('API key initialized successfully');
  
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
  
  // Add test button for forcing product display
  addTestButton();
  
  // Check for active product - this will update the UI if a product is being browsed
  console.log("Checking for active product on DOM content load...");
  checkForActiveProduct();
  
  // Apply Lovable style classes to ensure consistency
  applyLovableStyleClasses();
  
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener(function(message) {
    console.log("Popup received message:", message.type);
    if (message.type === 'REFRESH_PRODUCT_DISPLAY') {
      console.log("Refreshing product display");
      forceShowProducts();
    } else if (message.type === 'PRODUCT_DATA_READY') {
      console.log("Received product data:", message.data);
      updateProductDisplay(message.data);
    } else if (message.type === 'PRODUCT_DETECTED') {
      console.log("Product detected, refreshing display");
      // Force refresh after a short delay to ensure data is ready
      setTimeout(() => {
        forceShowProducts();
      }, 300);
    }
  });
  
  // Check for product data immediately on popup open
  requestProductData();
});

// Function to request product data from background script
function requestProductData() {
  console.log('Requesting product data from background script...');
  chrome.runtime.sendMessage({
    type: 'GET_PRODUCT_DATA'
  }, function(response) {
    if (response && response.data) {
      console.log('Received product data on popup open:', response.data);
      updateProductDisplay(response.data);
    } else {
      console.log('No product data available yet on popup open');
    }
  });
}

// Function to update the product display with real data
function updateProductDisplay(data) {
  if (!data) return;
  
  console.log("Updating product display with data:", data);
  
  // Get the container for alternative products
  const productsContainer = document.getElementById('alternative-products-container');
  if (!productsContainer) {
    console.error('Products container not found');
    return;
  }
  
  // Clear current content
  productsContainer.innerHTML = '';
  
  if (data.alternatives && data.alternatives.length > 0) {
    // Get prioritization mode
    chrome.storage.sync.get('prioritizeBy', function(modeSetting) {
      const mode = modeSetting.prioritizeBy || 'balanced';
      console.log("Displaying alternatives with mode:", mode);
      
      // Sort alternatives based on prioritization mode
      let sortedAlternatives = [...data.alternatives];
      
      switch(mode) {
        case 'price':
          sortedAlternatives.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'reviews':
          sortedAlternatives.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
          break;
        case 'shipping':
          // For shipping, we'll prioritize ones with "Fast" advantage
          sortedAlternatives.sort((a, b) => {
            if (a.advantage && a.advantage.includes('Fast')) return -1;
            if (b.advantage && b.advantage.includes('Fast')) return 1;
            return 0;
          });
          break;
        // balanced mode uses the default order
      }
      
      // Limit to 5 alternatives
      sortedAlternatives = sortedAlternatives.slice(0, 5);
      
      console.log("Displaying sorted alternatives:", sortedAlternatives);
      
      // Add each alternative product to the container
      sortedAlternatives.forEach(product => {
        const productCard = createDynamicProductCard(product);
        productsContainer.appendChild(productCard);
      });
      
      // Add price information if available
      if (data.priceData && data.priceData.lowestPrice) {
        const priceSummary = document.createElement('div');
        priceSummary.className = 'price-summary';
        priceSummary.innerHTML = `
          <div class="text-center mt-3 p-3 bg-green-50 rounded-md border border-green-200">
            <p class="text-green-700 font-medium">Lowest price found: $${data.priceData.lowestPrice.price}</p>
            <p class="text-green-600 text-sm">at ${data.priceData.lowestPrice.seller}</p>
          </div>
        `;
        productsContainer.appendChild(priceSummary);
      }
    });
  } else {
    // Show no alternatives message
    const noAlternativesMsg = document.createElement('div');
    noAlternativesMsg.className = 'no-products-message';
    noAlternativesMsg.innerHTML = `
      <div class="text-center py-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 text-gray-400">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p class="text-gray-500">No alternative products found for this item</p>
      </div>
    `;
    productsContainer.appendChild(noAlternativesMsg);
  }
}

// Function to create a product card from API data
function createDynamicProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  // Create product image
  const imageContainer = document.createElement('div');
  imageContainer.className = 'product-image';
  const image = document.createElement('img');
  image.src = product.image || "https://via.placeholder.com/100";
  image.alt = product.title;
  image.onerror = function() {
    this.src = "https://via.placeholder.com/100";
  };
  imageContainer.appendChild(image);
  card.appendChild(imageContainer);
  
  // Create product info
  const info = document.createElement('div');
  info.className = 'product-info';
  
  // Product name
  const name = document.createElement('h3');
  name.textContent = product.title;
  info.appendChild(name);
  
  // Add seller if available
  if (product.seller) {
    const seller = document.createElement('div');
    seller.className = 'product-seller';
    seller.textContent = product.seller;
    seller.style.fontSize = '11px';
    seller.style.color = '#666';
    seller.style.marginBottom = '3px';
    info.appendChild(seller);
  }
  
  // Price container
  const priceContainer = document.createElement('div');
  priceContainer.className = 'product-price';
  
  // Current price
  const price = document.createElement('span');
  price.className = 'current-price';
  price.textContent = `$${product.price}`;
  priceContainer.appendChild(price);
  
  info.appendChild(priceContainer);
  
  // Tag container
  const tagContainer = document.createElement('div');
  tagContainer.className = 'product-tags';
  
  // Review score if available
  if (product.rating) {
    const reviewTag = document.createElement('span');
    reviewTag.className = 'product-tag review-tag';
    reviewTag.textContent = `★ ${product.rating}`;
    reviewTag.style.backgroundColor = '#FFC107';
    reviewTag.style.color = '#333';
    tagContainer.appendChild(reviewTag);
  }
  
  // Advantage tag if available
  if (product.advantage) {
    const advantageTag = document.createElement('span');
    advantageTag.className = 'product-tag';
    
    // Style tag based on advantage type
    if (product.advantage.includes('price') || product.advantage.includes('value')) {
      advantageTag.style.backgroundColor = '#10b981'; // Green for price advantages
    } else if (product.advantage.includes('Fast') || product.advantage.includes('ship')) {
      advantageTag.style.backgroundColor = '#3B82F6'; // Blue for shipping advantages
    } else if (product.advantage.includes('rate') || product.advantage.includes('review')) {
      advantageTag.style.backgroundColor = '#F59E0B'; // Yellow for review advantages
    } else {
      advantageTag.style.backgroundColor = '#8B5CF6'; // Purple for other advantages
    }
    
    advantageTag.textContent = product.advantage;
    tagContainer.appendChild(advantageTag);
  }
  
  info.appendChild(tagContainer);
  
  // Make the card clickable
  card.style.cursor = 'pointer';
  card.addEventListener('click', function() {
    if (product.url && product.url !== '#') {
      chrome.tabs.create({ url: product.url });
    }
  });
  
  card.appendChild(info);
  
  return card;
}

// Function to add a test button for developer testing
function addTestButton() {
  const footer = document.querySelector('.footer');
  
  if (footer) {
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Product Detection';
    testButton.className = 'test-button';
    testButton.style.cssText = `
      background: #8b5cf6;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      margin-top: 10px;
      cursor: pointer;
      font-size: 12px;
      display: block;
      margin-left: auto;
      margin-right: auto;
      transition: background-color 0.2s, transform 0.1s;
    `;
    
    testButton.addEventListener('mouseenter', function() {
      this.style.backgroundColor = '#7c3aed';
      this.style.transform = 'translateY(-1px)';
    });
    
    testButton.addEventListener('mouseleave', function() {
      this.style.backgroundColor = '#8b5cf6';
      this.style.transform = '';
    });
    
    testButton.addEventListener('click', function() {
      console.log("Clicking test product detection button...");
      
      // Show loading indicator on the button
      const originalText = this.textContent;
      this.innerHTML = '<span class="loading-spinner"></span> Testing...';
      this.disabled = true;
      
      // First clear any message displayed previously
      const productsContainer = document.getElementById('alternative-products-container');
      if (productsContainer) {
        productsContainer.innerHTML = '<div class="loading-message">Testing product detection...</div>';
      }
      
      // Use the direct test function from api-integration.js
      testProductDetection();
      
      // Reset button after 2 seconds
      setTimeout(() => {
        testButton.innerHTML = originalText;
        testButton.disabled = false;
      }, 2000);
    });
    
    footer.appendChild(testButton);
  }
}

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
          // Also request latest product data
          requestProductData();
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

// Function to initialize Hugging Face integration status
function initializeHuggingFace() {
  const hfStatus = document.getElementById('hf-status');
  if (hfStatus) {
    hfStatus.textContent = 'Disabled';
    hfStatus.classList.add('not-connected');
  }
  
  // Initialize sentiment analysis feature
  initSentimentAnalysis();
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
