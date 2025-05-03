
// API integration functionality

// Initialize API key functionality
export function initializeApiKey() {
  // Use hardcoded API key that's stored in the code - hidden from users
  const apiKey = 'apify_api_y9gocF4ETXbAde3CoqrbjiDOYpztOQ4zcywQ';
  
  console.log('Initializing Scout.io with API key');
  
  // Save the API key directly without user input
  saveApiKeyInternal(apiKey);
  
  // Test the key immediately after initialization
  testApiKey(apiKey);
  
  // Return the API key for immediate use
  return apiKey;
}

// Internal function to save the API key
function saveApiKeyInternal(apiKey) {
  if (apiKey) {
    console.log('Saving API key to storage');
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
  console.log('Testing API key connection');
  chrome.runtime.sendMessage({
    type: 'TEST_APIFY_API_KEY',
    apiKey: apiKey
  }, function(response) {
    console.log('API key test result:', response ? response.success : 'No response');
    if (response && response.success) {
      // If successful, refresh product display to show products immediately
      chrome.runtime.sendMessage({type: 'REFRESH_PRODUCT_DISPLAY'});
      
      // Force a product detection since we know the API key is working
      setTimeout(() => {
        testProductDetection();
      }, 500);
    }
  });
}

// Function to directly trigger product detection for testing
export function testProductDetection() {
  console.log('Manually triggering product detection for testing');
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs && tabs[0] && tabs[0].id) {
      console.log('Found active tab:', tabs[0].id);
      chrome.runtime.sendMessage({
        type: 'FORCE_PRODUCT_DETECTION',
        tabId: tabs[0].id
      }, function(response) {
        if (response && response.success) {
          console.log("Forced product detection successful");
          // Update UI to show products
          chrome.runtime.sendMessage({type: 'REFRESH_PRODUCT_DISPLAY'});
          
          // Force refresh the alternative products section
          setTimeout(() => {
            forceShowProductsInternal();
          }, 300);
        } else {
          console.error("Forced product detection failed:", response);
        }
      });
    } else {
      console.error("No active tab found");
    }
  });
}

// Internal function to force display products
function forceShowProductsInternal() {
  console.log('Internal function: Forcing product display refresh');
  // Get the container for alternative products
  const productsContainer = document.getElementById('alternative-products-container');
  if (productsContainer) {
    // Show loading message
    productsContainer.innerHTML = '<div class="loading-message">Loading alternative products...</div>';
    
    // Request product data from background script
    chrome.runtime.sendMessage({
      type: 'GET_PRODUCT_DATA'
    }, function(response) {
      if (response && response.data) {
        console.log('Received product data for display:', response.data);
        updateProductDisplay(response.data);
      } else {
        console.log('No product data available yet');
        productsContainer.innerHTML = '<div class="no-products-message">No product data available yet. Try browsing a product page first.</div>';
      }
    });
  }
}

// Function to update the product display with received data
function updateProductDisplay(data) {
  console.log('Updating product display with data:', data);
  
  // Get the container for alternative products
  const productsContainer = document.getElementById('alternative-products-container');
  if (!productsContainer) {
    console.error('Could not find products container');
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
      
      // Add each alternative product to the container
      sortedAlternatives.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
      });
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

// Function to create a product card
function createProductCard(product) {
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
