// Alternative products functionality

// Define alternative products data (as fallback if API doesn't work)
const alternativeProducts = [
  {
    name: "Wireless Headphones",
    price: 39.99,
    oldPrice: 64.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=320&q=80",
    tag: "Deal!",
    reviews: 4.7,
    shipping: "Fast",
    quality: "High"
  },
  {
    name: "Ultra Smart Speaker",
    price: 59.00,
    oldPrice: 79.00,
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=320&q=80",
    tag: "Deal!",
    reviews: 4.8,
    shipping: "Fast", 
    quality: "Medium"
  },
  {
    name: "Eco LED Desk Lamp",
    price: 24.49,
    oldPrice: 34.00,
    image: "https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=320&q=80",
    tag: "Lowest Price",
    reviews: 4.2,
    shipping: "Standard",
    quality: "High"
  },
  {
    name: "HD Web Camera",
    price: 45.99,
    oldPrice: 59.99,
    image: "https://images.unsplash.com/photo-1544113559-d0769346e428?auto=format&fit=crop&w=320&q=80",
    tag: "Top Rated",
    reviews: 4.9,
    shipping: "Standard",
    quality: "High"
  },
  {
    name: "Portable Monitor",
    price: 129.99,
    oldPrice: 169.99,
    image: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=320&q=80",
    tag: "Fast Shipping",
    reviews: 4.5,
    shipping: "Fast",
    quality: "Medium"
  }
];

// Store for real product data from API
let realProductData = null;

// Initialize Alternative Products section
export function initializeAlternativeProducts() {
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
    sectionDescription.textContent = 'Similar products with better prices will appear when browsing.';
    alternativesSection.appendChild(sectionDescription);
    
    // Create products container
    const productsContainer = document.createElement('div');
    productsContainer.className = 'alternative-products-container';
    productsContainer.id = 'alternative-products-container';
    
    // Default state - show the message since no product is being browsed initially
    showNoProductsMessage(productsContainer);
    
    alternativesSection.appendChild(productsContainer);
    
    // Find where to insert the section (before the API Integration section)
    const apiSection = document.querySelector('.section:last-child');
    if (apiSection) {
      apiSection.parentNode.insertBefore(alternativesSection, apiSection);
    } else {
      // If no API section, append to content
      document.querySelector('.content').appendChild(alternativesSection);
    }
    
    // Add event listener for product detection message from the background script
    chrome.runtime.onMessage.addListener(function(message) {
      console.log('Alternative products received message:', message.type);
      
      if (message.type === 'PRODUCT_DATA_READY') {
        console.log('Product data ready, showing alternatives');
        // Store the real product data
        realProductData = message.data;
        // Product detected, show relevant alternatives
        chrome.storage.sync.get('prioritizeBy', function(data) {
          const mode = data.prioritizeBy || 'balanced';
          refreshAlternativeProducts(mode);
        });
      }
      else if (message.type === 'PRODUCT_DETECTED') {
        console.log('Product detected, refreshing alternatives');
        // Product detected, show relevant alternatives
        chrome.storage.sync.get('prioritizeBy', function(data) {
          const mode = data.prioritizeBy || 'balanced';
          refreshAlternativeProducts(mode);
        });
      }
      else if (message.type === 'REFRESH_PRODUCT_DISPLAY') {
        console.log('Refreshing product display from message');
        forceShowProducts();
      }
    });
    
    // Check if we already have an active product when popup opens
    chrome.runtime.sendMessage({type: 'CHECK_ACTIVE_PRODUCT'}, function(response) {
      console.log('Active product check response:', response);
      if (response && response.hasActiveProduct) {
        console.log('Active product found on popup open, showing alternatives');
        // Product already detected, show relevant alternatives
        chrome.storage.sync.get('prioritizeBy', function(data) {
          const mode = data.prioritizeBy || 'balanced';
          refreshAlternativeProducts(mode);
        });
      } else {
        console.log("No active product found, showing initial message");
        // Make sure we show the "no products" message
        const productsContainer = document.getElementById('alternative-products-container');
        if (productsContainer) {
          showNoProductsMessage(productsContainer);
        }
      }
    });
    
    // Add CSS for the alternative products section
    addAlternativeProductsStyles();
  }
}

// Function to display "no products" message
function showNoProductsMessage(container) {
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
}

// Function to update the visibility of the alternatives section
export function updateAlternativesSection(show) {
  const alternativesSection = document.getElementById('alternative-products-section');
  if (alternativesSection) {
    alternativesSection.style.display = show ? 'block' : 'none';
  }
}

// Function to filter products based on prioritization mode
export function filterProductsByMode(products, mode) {
  // Define products with high reviews (4.5+ stars)
  const highReviewProducts = products.filter(product => {
    // Account for both our mock data format and API data format
    const reviews = product.reviews || product.rating;
    return reviews >= 4.5;
  });
  console.log("High review products:", highReviewProducts.map(p => p.name || p.title));
  
  // Define products with fast shipping
  const fastShippingProducts = products.filter(product => {
    // Account for both our mock data format and API data format
    return product.shipping === "Fast" || 
           (product.advantage && product.advantage.toLowerCase().includes('fast'));
  });
  console.log("Fast shipping products:", fastShippingProducts.map(p => p.name || p.title));
  
  // Define products with good deals (lower prices)
  const lowestPriceProducts = products.filter(product => {
    // Account for both our mock data format and API data format
    return (product.oldPrice && (product.oldPrice - product.price) > 10) ||
           (product.tag && product.tag.includes('Deal')) ||
           (product.tag && product.tag.includes('Lowest')) ||
           (product.advantage && product.advantage.toLowerCase().includes('price') || 
            product.advantage && product.advantage.toLowerCase().includes('value'));
  });
  console.log("Lowest price products:", lowestPriceProducts.map(p => p.name || p.title));
  
  // Define high quality products
  const highQualityProducts = products.filter(product => {
    // Account for both our mock data format and API data format
    return product.quality === "High" || 
           (product.advantage && product.advantage.toLowerCase().includes('quality'));
  });
  console.log("High quality products:", highQualityProducts.map(p => p.name || p.title));
  
  let filteredProducts;
  
  switch(mode) {
    case 'price':
      filteredProducts = lowestPriceProducts.length > 0 ? lowestPriceProducts : products;
      // Further sort by price
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'reviews':
      filteredProducts = highReviewProducts.length > 0 ? highReviewProducts : products;
      // Further sort by rating
      filteredProducts.sort((a, b) => {
        const ratingA = a.reviews || a.rating || 0;
        const ratingB = b.reviews || b.rating || 0;
        return ratingB - ratingA;
      });
      break;
    case 'shipping':
      filteredProducts = fastShippingProducts.length > 0 ? fastShippingProducts : products;
      break;
    case 'balanced':
      // For balanced mode, we need to show a mix of all criteria
      // Guarantee at least one product from each category for a truly balanced view
      let balancedSelection = [];
      
      // Always include one fast shipping product in balanced view
      if (fastShippingProducts.length > 0) {
        balancedSelection.push(fastShippingProducts[0]);
      }
      
      // Always include one high review product (if not already included)
      if (highReviewProducts.length > 0) {
        const reviewProduct = highReviewProducts.find(p => 
          !balancedSelection.some(item => {
            const itemName = item.name || item.title;
            const pName = p.name || p.title;
            return itemName === pName;
          })
        );
        
        if (reviewProduct) {
          balancedSelection.push(reviewProduct);
        }
      }
      
      // Always include one lowest price product (if not already included)
      if (lowestPriceProducts.length > 0) {
        const priceProduct = lowestPriceProducts.find(p => 
          !balancedSelection.some(item => {
            const itemName = item.name || item.title;
            const pName = p.name || p.title;
            return itemName === pName;
          })
        );
        
        if (priceProduct) {
          balancedSelection.push(priceProduct);
        }
      }
      
      // If we still have room, add other products to round out the mix
      for (const product of products) {
        const pName = product.name || product.title;
        if (balancedSelection.length < 5 && 
            !balancedSelection.some(item => (item.name || item.title) === pName)) {
          balancedSelection.push(product);
        }
        
        if (balancedSelection.length >= 5) break;
      }
      
      console.log("Balanced filtered products:", balancedSelection.map(p => p.name || p.title));
      filteredProducts = balancedSelection;
      break;
    default:
      filteredProducts = products;
  }
  
  console.log("Final filtered products:", filteredProducts.map(p => p.name || p.title));
  return filteredProducts;
}

// Function to refresh alternative products based on prioritization mode
export function refreshAlternativeProducts(mode) {
  console.log('Refreshing alternative products with mode:', mode);
  const productsContainer = document.getElementById('alternative-products-container');
  if (!productsContainer) return;
  
  // Clear current products
  productsContainer.innerHTML = '';
  
  // Add a loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.textContent = 'Loading products...';
  productsContainer.appendChild(loadingIndicator);
  
  // Check if we have real product data from the API
  if (realProductData && realProductData.alternatives && realProductData.alternatives.length > 0) {
    console.log('Using real product data with alternatives:', realProductData.alternatives.length);
    
    // Remove loading indicator
    productsContainer.innerHTML = '';
    
    // Filter alternatives based on mode
    const filteredAlternatives = filterProductsByMode(realProductData.alternatives, mode);
    
    // Display the alternatives
    if (filteredAlternatives.length > 0) {
      filteredAlternatives.forEach(product => {
        const productCard = createAPIProductCard(product);
        productsContainer.appendChild(productCard);
      });
    } else {
      showNoProductsMessage(productsContainer);
    }
    return;
  }
  
  // If no real data, fall back to checking active product and using mock data
  chrome.runtime.sendMessage({type: 'CHECK_ACTIVE_PRODUCT'}, function(response) {
    console.log('Checking for active product:', response);
    
    // Remove loading indicator
    productsContainer.innerHTML = '';
    
    if (response && response.hasActiveProduct) {
      console.log('Active product confirmed, showing alternatives');
      // Filter products based on mode
      const filteredProducts = filterProductsByMode(alternativeProducts, mode);
      
      // Add filtered products
      if (filteredProducts.length > 0) {
        filteredProducts.forEach(product => {
          const productCard = createProductCard(product);
          productsContainer.appendChild(productCard);
        });
      } else {
        showNoProductsMessage(productsContainer);
      }
    } else {
      console.log('No active product, showing message');
      // No product detected, show initial message
      showNoProductsMessage(productsContainer);
    }
  });
}

// Function to create a product card from API data
function createAPIProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  // Create product image
  const imageContainer = document.createElement('div');
  imageContainer.className = 'product-image';
  const image = document.createElement('img');
  image.src = product.image;
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
  if (product.rating && product.rating >= 4.5) {
    const reviewTag = document.createElement('span');
    reviewTag.className = 'product-tag review-tag';
    reviewTag.textContent = `★ ${product.rating}`;
    reviewTag.style.backgroundColor = '#FFC107';
    reviewTag.style.color = '#333';
    tagContainer.appendChild(reviewTag);
  }
  
  // Fast shipping tag if available
  if (product.advantage && product.advantage.toLowerCase().includes('fast')) {
    const shippingTag = document.createElement('span');
    shippingTag.className = 'product-tag shipping-tag';
    shippingTag.textContent = `🚚 Fast`;
    shippingTag.style.backgroundColor = '#3B82F6';
    shippingTag.style.color = '#FFF';
    tagContainer.appendChild(shippingTag);
  }
  
  // Price advantage tag if available
  if (product.advantage && (product.advantage.toLowerCase().includes('price') || 
      product.advantage.toLowerCase().includes('value'))) {
    const priceTag = document.createElement('span');
    priceTag.className = 'product-tag price-tag';
    priceTag.textContent = `💰 Best Price`;
    priceTag.style.backgroundColor = '#10b981';
    priceTag.style.color = '#FFF';
    tagContainer.appendChild(priceTag);
  }
  
  // Trust badge
  const trustBadge = document.createElement('span');
  trustBadge.className = 'trust-badge';
  trustBadge.textContent = 'Scout Trust';
  tagContainer.appendChild(trustBadge);
  
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

// Function to create a product card from our mock data
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
    
    // Style tag based on type
    if (product.tag.includes('Deal') || product.tag.includes('Lowest')) {
      tag.style.backgroundColor = '#10b981'; // Green for price advantages
      tag.className += ' price-tag';
    } else if (product.tag.includes('Fast')) {
      tag.style.backgroundColor = '#3B82F6'; // Blue for shipping advantages
      tag.className += ' shipping-tag';
    } else if (product.tag.includes('Top') || product.tag.includes('Rate')) {
      tag.style.backgroundColor = '#F59E0B'; // Yellow for review advantages
      tag.className += ' review-tag';
    }
    
    tag.textContent = product.tag;
    tagContainer.appendChild(tag);
  }
  
  // Review score if high
  if (product.reviews >= 4.5) {
    const reviewTag = document.createElement('span');
    reviewTag.className = 'product-tag review-tag';
    reviewTag.textContent = `★ ${product.reviews}`;
    reviewTag.style.backgroundColor = '#FFC107';
    reviewTag.style.color = '#333';
    tagContainer.appendChild(reviewTag);
  }
  
  // Fast shipping tag - always show when product has fast shipping
  if (product.shipping === "Fast") {
    const shippingTag = document.createElement('span');
    shippingTag.className = 'product-tag shipping-tag';
    shippingTag.textContent = `🚚 Fast`;
    shippingTag.style.backgroundColor = '#3B82F6';
    shippingTag.style.color = '#FFF';
    tagContainer.appendChild(shippingTag);
  }
  
  // Trust badge
  const trustBadge = document.createElement('span');
  trustBadge.className = 'trust-badge';
  trustBadge.textContent = 'Scout Trust';
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
      flex-wrap: wrap;
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
    
    /* Style for active prioritize option */
    .active-option {
      background-color: #6366f1;
      color: white;
    }
    
    .option.active-option span {
      color: white;
    }
    
    .no-products-message {
      grid-column: 1 / -1;
      color: #6b7280;
    }
  `;
  document.head.appendChild(style);
}

// Export function to force refresh products (for testing)
export function forceShowProducts() {
  console.log('Force showing products');
  const productsContainer = document.getElementById('alternative-products-container');
  if (!productsContainer) {
    console.error('Products container not found');
    return;
  }
  
  // Clear current products
  productsContainer.innerHTML = '';
  
  // Add loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.textContent = 'Loading product alternatives...';
  loadingIndicator.style.textAlign = 'center';
  loadingIndicator.style.padding = '20px';
  loadingIndicator.style.color = '#666';
  productsContainer.appendChild(loadingIndicator);
  
  // Check if we have real product data from the API
  if (realProductData && realProductData.alternatives && realProductData.alternatives.length > 0) {
    console.log('Using real product data for forced display');
    
    // Get current prioritization mode
    chrome.storage.sync.get('prioritizeBy', function(data) {
      const mode = data.prioritizeBy || 'balanced';
      console.log("Forcing products display with mode:", mode);
      
      // Remove loading indicator after a short delay to show it's working
      setTimeout(() => {
        // Clear container again
        productsContainer.innerHTML = '';
        
        // Filter alternatives based on mode
        const filteredAlternatives = filterProductsByMode(realProductData.alternatives, mode);
        
        // Display the alternatives
        if (filteredAlternatives.length > 0) {
          filteredAlternatives.forEach(product => {
            const productCard = createAPIProductCard(product);
            productsContainer.appendChild(productCard);
          });
        } else {
          showNoProductsMessage(productsContainer);
        }
      }, 500);
    });
    return;
  }
  
  // If no real data, fall back to mock data
  // Get current prioritization mode
  chrome.storage.sync.get('prioritizeBy', function(data) {
    const mode = data.prioritizeBy || 'balanced';
    console.log("Forcing mock products display with mode:", mode);
    
    // Remove loading indicator after a short delay to show it's working
    setTimeout(() => {
      // Clear container again
      productsContainer.innerHTML = '';
      
      // Filter products based on mode
      const filteredProducts = filterProductsByMode(alternativeProducts, mode);
      
      // Add filtered products
      if (filteredProducts.length > 0) {
        console.log('Adding filtered products:', filteredProducts.length);
        filteredProducts.forEach(product => {
          const productCard = createProductCard(product);
          productsContainer.appendChild(productCard);
        });
      } else {
        console.log('No filtered products to show');
        showNoProductsMessage(productsContainer);
      }
    }, 500);
  });
}
