
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
    chrome.storage.sync.set({ apifyApiKey: apiKey }, function() {
      console.log('API key saved to storage');
      
      // Verify that the key is working by testing it
      testApiKey(apiKey);
    });
  }
}

// Function to test if API key is working
function testApiKey(apiKey) {
  console.log('Testing API key connection');
  
  // Send a message to the background script to test the API key
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
            updateProductDisplay();
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

// Function to update product display
export function updateProductDisplay() {
  console.log('Updating product display');
  
  // Get the container for alternative products
  const productsSection = document.getElementById('alternative-products-section');
  if (!productsSection) {
    console.error('Could not find products section');
    return;
  }
  
  // Clear existing container if it exists
  let productsContainer = document.getElementById('alternative-products-container');
  if (!productsContainer) {
    // Create the container if it doesn't exist
    productsContainer = document.createElement('div');
    productsContainer.id = 'alternative-products-container';
    productsContainer.className = 'alternative-products-container';
    productsSection.appendChild(productsContainer);
  } else {
    // Clear existing content
    productsContainer.innerHTML = '';
  }
  
  // Show loading message
  productsContainer.innerHTML = '<div class="loading-message">Loading alternative products...</div>';
  
  // Request product data from background script
  chrome.runtime.sendMessage({
    type: 'GET_PRODUCT_DATA'
  }, function(response) {
    if (response && response.data) {
      console.log('Received product data for display:', response.data);
      processProductData(response.data, productsContainer);
    } else {
      console.log('No product data available yet');
      productsContainer.innerHTML = '<div class="no-products-message">No product data available yet. Try browsing a product page or clicking "Force Detect" below.</div>';
      
      // Add a force detect button
      const forceButton = document.createElement('button');
      forceButton.className = 'upgrade-btn';
      forceButton.textContent = 'Force Detect';
      forceButton.style.marginTop = '10px';
      forceButton.addEventListener('click', testProductDetection);
      productsContainer.appendChild(forceButton);
    }
  });
}

// Process and display product data
function processProductData(data, container) {
  // Clear current content
  container.innerHTML = '';
  
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
          sortedAlternatives.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
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
        container.appendChild(productCard);
      });
    });
  } else {
    // Show no alternatives message
    const noAlternativesMsg = document.createElement('div');
    noAlternativesMsg.className = 'no-products-message';
    noAlternativesMsg.textContent = 'No alternative products found for this item';
    container.appendChild(noAlternativesMsg);
    
    // Add a force detect button
    const forceButton = document.createElement('button');
    forceButton.className = 'upgrade-btn';
    forceButton.textContent = 'Force Detect';
    forceButton.style.marginTop = '10px';
    forceButton.addEventListener('click', testProductDetection);
    container.appendChild(forceButton);
  }
}

// Function to create a product card
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.style.overflow = 'hidden';
  card.style.borderRadius = '8px';
  card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
  card.style.backgroundColor = 'white';
  card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
  card.style.cursor = 'pointer';
  
  // Create product image
  const imageContainer = document.createElement('div');
  imageContainer.style.height = '100px';
  imageContainer.style.overflow = 'hidden';
  imageContainer.style.display = 'flex';
  imageContainer.style.justifyContent = 'center';
  imageContainer.style.alignItems = 'center';
  imageContainer.style.backgroundColor = '#f8fafc';
  
  const image = document.createElement('img');
  image.src = product.image || "https://via.placeholder.com/100";
  image.alt = product.title || "Product";
  image.style.maxWidth = '100%';
  image.style.maxHeight = '100%';
  image.style.objectFit = 'contain';
  image.onerror = function() {
    this.src = "https://via.placeholder.com/100";
  };
  
  imageContainer.appendChild(image);
  card.appendChild(imageContainer);
  
  // Create product info container
  const info = document.createElement('div');
  info.style.padding = '10px';
  
  // Product name
  const name = document.createElement('h3');
  name.textContent = product.title || "Product";
  name.style.margin = '0 0 5px 0';
  name.style.fontSize = '14px';
  name.style.fontWeight = '600';
  name.style.lineHeight = '1.2';
  name.style.height = '34px';
  name.style.overflow = 'hidden';
  name.style.textOverflow = 'ellipsis';
  name.style.display = '-webkit-box';
  name.style.webkitLineClamp = '2';
  name.style.webkitBoxOrient = 'vertical';
  
  info.appendChild(name);
  
  // Price container
  const priceContainer = document.createElement('div');
  priceContainer.style.display = 'flex';
  priceContainer.style.alignItems = 'center';
  priceContainer.style.marginBottom = '5px';
  
  // Current price
  const price = document.createElement('span');
  price.className = 'current-price';
  price.textContent = product.price ? `$${product.price}` : "Price unavailable";
  price.style.fontWeight = '700';
  price.style.color = '#111';
  priceContainer.appendChild(price);
  
  // Add seller information if available
  if (product.seller) {
    const sellerInfo = document.createElement('span');
    sellerInfo.textContent = ` from ${product.seller}`;
    sellerInfo.style.fontSize = '12px';
    sellerInfo.style.color = '#666';
    sellerInfo.style.marginLeft = '5px';
    priceContainer.appendChild(sellerInfo);
  }
  
  info.appendChild(priceContainer);
  
  // Tag container
  const tagContainer = document.createElement('div');
  tagContainer.style.display = 'flex';
  tagContainer.style.gap = '5px';
  tagContainer.style.flexWrap = 'wrap';
  
  // Review score if available
  if (product.rating) {
    const reviewTag = document.createElement('span');
    reviewTag.textContent = `★ ${product.rating}`;
    reviewTag.style.backgroundColor = '#FFC107';
    reviewTag.style.color = '#333';
    reviewTag.style.padding = '2px 6px';
    reviewTag.style.borderRadius = '4px';
    reviewTag.style.fontSize = '12px';
    reviewTag.style.fontWeight = '500';
    tagContainer.appendChild(reviewTag);
  }
  
  // Advantage tag if available
  if (product.advantage) {
    const advantageTag = document.createElement('span');
    
    // Style tag based on advantage type
    if (product.advantage.toLowerCase().includes('price') || product.advantage.toLowerCase().includes('value') || product.advantage.toLowerCase().includes('cheaper')) {
      advantageTag.style.backgroundColor = '#10b981'; // Green for price advantages
    } else if (product.advantage.toLowerCase().includes('fast') || product.advantage.toLowerCase().includes('ship')) {
      advantageTag.style.backgroundColor = '#3B82F6'; // Blue for shipping advantages
    } else if (product.advantage.toLowerCase().includes('rate') || product.advantage.toLowerCase().includes('review')) {
      advantageTag.style.backgroundColor = '#F59E0B'; // Yellow for review advantages
    } else {
      advantageTag.style.backgroundColor = '#8B5CF6'; // Purple for other advantages
    }
    
    advantageTag.textContent = product.advantage;
    advantageTag.style.color = 'white';
    advantageTag.style.padding = '2px 6px';
    advantageTag.style.borderRadius = '4px';
    advantageTag.style.fontSize = '12px';
    advantageTag.style.fontWeight = '500';
    tagContainer.appendChild(advantageTag);
  }
  
  info.appendChild(tagContainer);
  card.appendChild(info);
  
  // Make the card clickable
  card.addEventListener('click', function() {
    if (product.url && product.url !== '#') {
      // Visual feedback on click
      this.style.transform = 'scale(0.97)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
      
      // Log the click
      console.log('Product clicked:', product.title, 'URL:', product.url);
      
      // Open in new tab
      chrome.tabs.create({ url: product.url });
    } else {
      console.warn('Product has no URL or invalid URL:', product);
      // Visual feedback for error
      this.style.border = '2px solid #ef4444';
      setTimeout(() => {
        this.style.border = '';
      }, 500);
    }
  });
  
  // Add hover effects
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-3px)';
    this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.transform = '';
    this.style.boxShadow = '';
  });
  
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

// Initialize the product section when the popup loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup loaded, initializing products section');
  // Initialize API key first, then update product display
  initializeApiKey();
  
  // Add event listener to the settings button for testing
  const settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function() {
      console.log('Settings button clicked, forcing product detection');
      testProductDetection();
    });
  }
  
  // Setup the initial product display
  setTimeout(updateProductDisplay, 300);
});
