
// Alternative products functionality

// Define alternative products data
const alternativeProducts = [
  {
    name: "Wireless Headphones",
    price: 39.99,
    oldPrice: 64.99,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=320&q=80",
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
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=320&q=80",
    tag: "",
    reviews: 4.2,
    shipping: "Standard",
    quality: "High"
  }
];

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
    sectionDescription.textContent = 'A smart mix of price, speed, quality, and reviews.';
    alternativesSection.appendChild(sectionDescription);
    
    // Create products container
    const productsContainer = document.createElement('div');
    productsContainer.className = 'alternative-products-container';
    
    // Get current prioritization mode
    chrome.storage.sync.get('prioritizeBy', function(data) {
      const mode = data.prioritizeBy || 'balanced';
      
      // Add alternative products based on mode
      const filteredProducts = filterProductsByMode(alternativeProducts, mode);
      filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
      });
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

// Function to update the visibility of the alternatives section
export function updateAlternativesSection(show) {
  const alternativesSection = document.getElementById('alternative-products-section');
  if (alternativesSection) {
    alternativesSection.style.display = show ? 'block' : 'none';
  }
}

// Function to filter products based on prioritization mode
export function filterProductsByMode(products, mode) {
  console.log("Filtering by mode:", mode);
  
  // Define products with high reviews (4.5+ stars)
  const highReviewProducts = products.filter(product => product.reviews >= 4.5);
  console.log("High review products:", highReviewProducts.map(p => p.name));
  
  // Define products with fast shipping
  const fastShippingProducts = products.filter(product => product.shipping === "Fast");
  console.log("Fast shipping products:", fastShippingProducts.map(p => p.name));
  
  // Define products with good deals
  const dealProducts = products.filter(product => product.tag === "Deal!");
  console.log("Deal products:", dealProducts.map(p => p.name));
  
  // Define high quality products
  const highQualityProducts = products.filter(product => product.quality === "High");
  console.log("High quality products:", highQualityProducts.map(p => p.name));
  
  let filteredProducts;
  
  switch(mode) {
    case 'price':
      filteredProducts = dealProducts;
      break;
    case 'reviews':
      filteredProducts = highReviewProducts;
      break;
    case 'shipping':
      filteredProducts = fastShippingProducts;
      break;
    case 'balanced':
      // For balanced mode, we need to show a mix of all criteria
      const combinedSet = new Set();
      
      // ALWAYS ensure we include at least one fast shipping product in balanced mode
      if (fastShippingProducts.length > 0) {
        combinedSet.add(fastShippingProducts[0]);
      }
      
      // Add high review product if available and not already added
      if (highReviewProducts.length > 0) {
        const reviewProduct = highReviewProducts.find(p => !Array.from(combinedSet).some(item => item.name === p.name));
        if (reviewProduct) {
          combinedSet.add(reviewProduct);
        }
      }
      
      if (dealProducts.length > 0) {
        const dealProduct = dealProducts.find(p => !Array.from(combinedSet).some(item => item.name === p.name));
        if (dealProduct) {
          combinedSet.add(dealProduct);
        }
      }
      
      if (highQualityProducts.length > 0) {
        const qualityProduct = highQualityProducts.find(p => !Array.from(combinedSet).some(item => item.name === p.name));
        if (qualityProduct) {
          combinedSet.add(qualityProduct);
        }
      }
      
      // If we still have room, add other products
      for (const product of products) {
        if (combinedSet.size < 3 && !Array.from(combinedSet).some(item => item.name === product.name)) {
          combinedSet.add(product);
        }
      }
      
      console.log("Balanced mode products:", Array.from(combinedSet).map(p => p.name));
      filteredProducts = Array.from(combinedSet);
      break;
    default:
      filteredProducts = products;
  }
  
  return filteredProducts;
}

// Function to refresh alternative products based on prioritization mode
export function refreshAlternativeProducts(mode) {
  const productsContainer = document.querySelector('.alternative-products-container');
  if (!productsContainer) return;
  
  // Clear current products
  productsContainer.innerHTML = '';
  
  // Filter products based on mode
  const filteredProducts = filterProductsByMode(alternativeProducts, mode);
  
  // Add filtered products
  filteredProducts.forEach(product => {
    const productCard = createProductCard(product);
    productsContainer.appendChild(productCard);
  });
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
  
  // Review score if high
  if (product.reviews >= 4.5) {
    const reviewTag = document.createElement('span');
    reviewTag.className = 'product-tag review-tag';
    reviewTag.textContent = `★ ${product.reviews}`;
    reviewTag.style.backgroundColor = '#FFC107';
    reviewTag.style.color = '#333';
    tagContainer.appendChild(reviewTag);
  }
  
  // Fast shipping tag - ALWAYS show this tag when product has fast shipping
  // This ensures the fast shipping tag is displayed regardless of mode
  if (product.shipping === "Fast") {
    const shippingTag = document.createElement('span');
    shippingTag.className = 'product-tag shipping-tag';
    shippingTag.textContent = `🚚 Fast`;
    shippingTag.style.backgroundColor = '#3B82F6';
    shippingTag.style.color = '#FFF';
    tagContainer.appendChild(shippingTag);
  }
  
  // Quality tag if high
  if (product.quality === "High") {
    const qualityTag = document.createElement('span');
    qualityTag.className = 'product-tag quality-tag';
    qualityTag.textContent = `✨ Quality`;
    qualityTag.style.backgroundColor = '#8B5CF6';
    qualityTag.style.color = '#FFF';
    tagContainer.appendChild(qualityTag);
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
    
    /* Style for active prioritize option */
    .active-option {
      background-color: #6366f1;
      color: white;
    }
    
    .option.active-option span {
      color: white;
    }
  `;
  document.head.appendChild(style);
}
