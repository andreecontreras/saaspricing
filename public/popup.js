
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

// Define alternative products data
const alternativeProducts = [
  {
    name: "Wireless Headphones",
    price: 39.99,
    oldPrice: 64.99,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=320&q=80",
    tag: "Deal!"
  },
  {
    name: "Ultra Smart Speaker",
    price: 59.00,
    oldPrice: 79.00,
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=320&q=80",
    tag: "Deal!"
  },
  {
    name: "Eco LED Desk Lamp",
    price: 24.49,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=320&q=80",
    tag: ""
  }
];

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
    
    // Update alternatives section visibility
    updateAlternativesSection(data.showAlternatives !== false);
  });

  // Add listeners to the display options
  showTrustScores.addEventListener('change', function() {
    chrome.storage.sync.set({ 'showTrustScores': showTrustScores.checked });
  });

  showAlternatives.addEventListener('change', function() {
    chrome.storage.sync.set({ 'showAlternatives': showAlternatives.checked });
    updateAlternativesSection(showAlternatives.checked);
  });

  notifyPriceDrops.addEventListener('change', function() {
    chrome.storage.sync.set({ 'notifyPriceDrops': notifyPriceDrops.checked });
  });
  
  // Initialize Alternative Products section
  initAlternativeProducts();
});

// Function to update the visibility of the alternatives section
function updateAlternativesSection(show) {
  const alternativesSection = document.getElementById('alternative-products-section');
  if (alternativesSection) {
    alternativesSection.style.display = show ? 'block' : 'none';
  }
}

// Function to initialize the Alternative Products section
function initAlternativeProducts() {
  // Check if the section already exists, if not, create it
  let alternativesSection = document.getElementById('alternative-products-section');
  
  if (!alternativesSection) {
    alternativesSection = document.createElement('div');
    alternativesSection.id = 'alternative-products-section';
    alternativesSection.className = 'section';
    
    // Create section header
    const sectionHeader = document.createElement('h2');
    sectionHeader.textContent = 'Alternative Products';
    alternativesSection.appendChild(sectionHeader);
    
    // Create section description
    const sectionDescription = document.createElement('p');
    sectionDescription.textContent = 'A smart mix of price, speed, and quality.';
    alternativesSection.appendChild(sectionDescription);
    
    // Create products container
    const productsContainer = document.createElement('div');
    productsContainer.className = 'alternative-products-container';
    
    // Add alternative products
    alternativeProducts.forEach(product => {
      const productCard = createProductCard(product);
      productsContainer.appendChild(productCard);
    });
    
    alternativesSection.appendChild(productsContainer);
    
    // Find where to insert the section (before the API Integration section)
    const apiSection = document.querySelector('.section:last-child');
    if (apiSection) {
      apiSection.parentNode.insertBefore(alternativesSection, apiSection);
    } else {
      // If no API section, append to content
      document.querySelector('.content').appendChild(alternativesSection);
    }
    
    // Add CSS for the alternative products section
    addAlternativeProductsStyles();
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
  image.src = product.image;
  image.alt = product.name;
  imageContainer.appendChild(image);
  card.appendChild(imageContainer);
  
  // Create product info
  const info = document.createElement('div');
  info.className = 'product-info';
  
  // Product name
  const name = document.createElement('h3');
  name.textContent = product.name;
  info.appendChild(name);
  
  // Price container
  const priceContainer = document.createElement('div');
  priceContainer.className = 'product-price';
  
  // Current price
  const price = document.createElement('span');
  price.className = 'current-price';
  price.textContent = `$${product.price}`;
  priceContainer.appendChild(price);
  
  // Old price if exists
  if (product.oldPrice) {
    const oldPrice = document.createElement('span');
    oldPrice.className = 'old-price';
    oldPrice.textContent = `$${product.oldPrice}`;
    priceContainer.appendChild(oldPrice);
  }
  
  info.appendChild(priceContainer);
  
  // Tag container
  const tagContainer = document.createElement('div');
  tagContainer.className = 'product-tags';
  
  // Deal tag if exists
  if (product.tag) {
    const tag = document.createElement('span');
    tag.className = 'product-tag';
    tag.textContent = product.tag;
    tagContainer.appendChild(tag);
  }
  
  // Trust badge
  const trustBadge = document.createElement('span');
  trustBadge.className = 'trust-badge';
  trustBadge.textContent = 'Trust';
  tagContainer.appendChild(trustBadge);
  
  info.appendChild(tagContainer);
  card.appendChild(info);
  
  return card;
}

// Function to add CSS for alternative products
function addAlternativeProductsStyles() {
  const style = document.createElement('style');
  style.textContent = `
    #alternative-products-section {
      margin-top: 15px;
      border-top: 1px solid #eaeaea;
      padding-top: 15px;
    }
    
    .alternative-products-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 15px;
      margin-top: 10px;
    }
    
    .product-card {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      background-color: white;
      transition: transform 0.2s ease;
    }
    
    .product-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .product-image {
      height: 100px;
      overflow: hidden;
    }
    
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .product-info {
      padding: 10px;
    }
    
    .product-info h3 {
      margin: 0 0 5px;
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .product-price {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
    }
    
    .current-price {
      font-weight: 600;
      color: #6366f1;
    }
    
    .old-price {
      text-decoration: line-through;
      font-size: 12px;
      color: #888;
    }
    
    .product-tags {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .product-tag {
      background-color: #10b981;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    
    .trust-badge {
      background-color: rgba(16, 185, 129, 0.1);
      color: #10b981;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
  `;
  document.head.appendChild(style);
}
