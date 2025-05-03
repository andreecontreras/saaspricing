// Content script for Savvy Shop Whisper Chrome Extension

// Global state
let overlayContainer = null;
let productData = null;
let isOverlayVisible = false;
let currentSiteSelectors = null;
let userPreferences = {
  isEnabled: true,
  prioritizeBy: 'balanced',
  showTrustScores: true,
  showAlternatives: true,
  notifyPriceDrops: true
};

// Initialize the extension
async function initialize() {
  // Load user preferences first
  await loadUserPreferences();
  
  if (!userPreferences.isEnabled) {
    console.log('Savvy Shop Whisper: Extension disabled by user');
    return;
  }
  
  // Check if we're on a supported e-commerce site
  const SUPPORTED_SITES = {
    'amazon.com': {
      productContainer: '#dp, .dp-container',
      priceSelector: '.a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice',
      titleSelector: '#productTitle',
      imageSelector: '#landingImage, #imgBlkFront',
      reviewSelector: '#acrCustomerReviewText, .a-icon-star'
    },
    'bestbuy.com': {
      productContainer: '.shop-product-detail, .shop-product',
      priceSelector: '.priceView-customer-price span, .pb-current-price',
      titleSelector: '.heading-5, .v-fw-regular',
      imageSelector: '.primary-image, .product-image',
      reviewSelector: '.customer-rating, .c-ratings-reviews'
    },
    'walmart.com': {
      productContainer: '[data-tl-id="ProductPage"], #product-overview',
      priceSelector: '[data-automation="product-price"], .price-characteristic',
      titleSelector: '.prod-ProductTitle, .f3, [data-automation="product-title"]',
      imageSelector: '.hover-zoom-hero-image, .prod-HeroImage',
      reviewSelector: '.stars-reviews-count, [data-automation="product-review-count"]'
    },
    'target.com': {
      productContainer: '[data-test="product-detail"], .WIEdV',
      priceSelector: '[data-test="product-price"], .style__PriceFontSize',
      titleSelector: '[data-test="product-title"], .Heading__StyledHeading',
      imageSelector: '[data-test="product-image"], .slideDeckPicture',
      reviewSelector: '.h-padding-h-default, .RatingsMdsV2'
    },
    'ebay.com': {
      productContainer: '#CenterPanelDF, .vim-buybox',
      priceSelector: '#prcIsum, .x-price-primary',
      titleSelector: '#itemTitle, .x-item-title',
      imageSelector: '#icImg, .ux-image-carousel-item',
      reviewSelector: '.reviews, .ux-seller-section__item--seller'
    },
    'aliexpress.com': {
      productContainer: '.product-info, .pdp-info',
      priceSelector: '.product-price-value, .uniform-banner-box-price',
      titleSelector: '.product-title-text, .pdp-title h1',
      imageSelector: '.images-view-item img, .pdp-img img',
      reviewSelector: '.overview-rating-average, .rating-scores'
    }
  };
  
  // Get the current domain
  const domain = window.location.hostname.replace('www.', '');
  
  // Find matching site configuration
  const matchedSite = Object.keys(SUPPORTED_SITES).find(site => domain.includes(site));
  
  if (!matchedSite) {
    console.log('Savvy Shop Whisper: Not a supported shopping site');
    return;
  }
  
  currentSiteSelectors = SUPPORTED_SITES[matchedSite];
  
  // Wait for the product container to be available in the DOM
  waitForElement(currentSiteSelectors.productContainer, initializeProductPage);
}

// Wait for an element to appear in the DOM
function waitForElement(selector, callback, maxAttempts = 10) {
  let attempts = 0;
  
  const checkForElement = () => {
    attempts++;
    const element = document.querySelector(selector);
    
    if (element) {
      callback(element);
      return;
    } else if (attempts < maxAttempts) {
      setTimeout(checkForElement, 500);
    } else {
      console.log(`Savvy Shop Whisper: Couldn't find element ${selector} after ${maxAttempts} attempts`);
    }
  };
  
  checkForElement();
}

// Initialize product page
function initializeProductPage(productContainer) {
  console.log('Savvy Shop Whisper: Product page detected');
  
  // Extract product data
  productData = extractProductData();
  
  if (!productData) {
    console.log('Savvy Shop Whisper: Could not extract product data');
    return;
  }
  
  // Notify background script about product detection
  chrome.runtime.sendMessage({
    type: 'PRODUCT_DETECTED',
    data: productData
  });
  
  // Create and insert trigger button
  createTriggerButton(productContainer);
  
  // Create overlay (hidden initially)
  createOverlay();
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PRODUCT_DATA_READY') {
      updateOverlayWithData(message.data);
    } else if (message.type === 'SCRAPING_STATUS') {
      updateScrapingStatus(message);
    } else if (message.type === 'PRODUCT_ANALYSIS_STATUS') {
      updateAnalysisStatus(message);
    }
  });
}

// Update the UI with scraping status
function updateScrapingStatus(message) {
  const statusElement = document.getElementById('savvy-scraping-status');
  if (!statusElement) return;
  
  if (message.status === 'started') {
    statusElement.innerHTML = `
      <div class="inline-flex items-center text-gray-500">
        <span class="w-4 h-4 border-2 border-t-savvy-purple border-blue-500 border-opacity-30 rounded-full animate-spin mr-2"></span>
        <span>${message.message || 'Scraping...'}</span>
      </div>
    `;
  } else if (message.status === 'success') {
    statusElement.innerHTML = `
      <div class="inline-flex items-center text-savvy-green">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>${message.message || 'Scraping completed'}</span>
      </div>
    `;
    
    // If we have scraped data, update the display
    if (message.data) {
      const productInfoElement = document.getElementById('savvy-scraped-product-info');
      if (productInfoElement) {
        productInfoElement.innerHTML = `
          <div class="p-4 border border-gray-200 rounded-lg bg-white shadow-sm mt-3">
            <h3 class="font-medium">${message.data.title || 'Product'}</h3>
            <div class="text-lg font-bold text-savvy-purple mt-1">${message.data.price ? `$${message.data.price}` : 'Price not found'}</div>
            <div class="text-xs text-gray-500 mt-1">${new URL(message.data.url).hostname}</div>
          </div>
        `;
      }
    }
  } else if (message.status === 'error') {
    statusElement.innerHTML = `
      <div class="inline-flex items-center text-savvy-red">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span>${message.message || 'Error during scraping'}</span>
      </div>
    `;
  }
}

// Update the UI with analysis status
function updateAnalysisStatus(message) {
  const statusElement = document.getElementById('savvy-analysis-status');
  if (!statusElement) return;
  
  if (message.status === 'started') {
    statusElement.innerHTML = `
      <div class="inline-flex items-center text-gray-500">
        <span class="w-4 h-4 border-2 border-t-savvy-purple border-blue-500 border-opacity-30 rounded-full animate-spin mr-2"></span>
        <span>${message.message || 'Analyzing...'}</span>
      </div>
    `;
    document.getElementById('savvy-loading').classList.remove('hidden');
  } else if (message.status === 'completed') {
    statusElement.innerHTML = `
      <div class="inline-flex items-center text-savvy-green">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>${message.message || 'Analysis completed'}</span>
      </div>
    `;
  } else if (message.status === 'error') {
    statusElement.innerHTML = `
      <div class="inline-flex items-center text-savvy-red">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span>${message.message || 'Error during analysis'}</span>
      </div>
    `;
    // Still show the regular info if there's an error, but with a visual indication
    document.getElementById('savvy-loading').classList.add('hidden');
    document.getElementById('savvy-product-info').classList.remove('hidden');
    document.getElementById('savvy-tabs').classList.remove('hidden');
    document.getElementById('savvy-tab-content').classList.remove('hidden');
  }
}

// Extract product data from the page
function extractProductData() {
  try {
    const priceElement = document.querySelector(currentSiteSelectors.priceSelector);
    const titleElement = document.querySelector(currentSiteSelectors.titleSelector);
    const imageElement = document.querySelector(currentSiteSelectors.imageSelector);
    
    if (!priceElement || !titleElement) {
      return null;
    }
    
    // Clean up price text to extract numeric value
    const priceText = priceElement.textContent.trim();
    const priceMatch = priceText.match(/[\d,]+\.\d{2}/) || priceText.match(/[\d,]+/);
    const price = priceMatch ? parseFloat(priceMatch[0].replace(',', '')) : null;
    
    return {
      title: titleElement.textContent.trim(),
      price: price,
      image: imageElement ? (imageElement.src || imageElement.getAttribute('src')) : null,
      url: window.location.href
    };
  } catch (error) {
    console.error('Savvy Shop Whisper: Error extracting product data', error);
    return null;
  }
}

// Create and add trigger button to the page - Updated to match Lovable style
function createTriggerButton(container) {
  const button = document.createElement('div');
  button.className = 'savvy-trigger-btn hardware-accelerated';
  button.setAttribute('title', 'Scout.io - Find better deals');
  button.innerHTML = `
    <button aria-label="Open Scout Assistant">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    </button>
  `;
  
  document.body.appendChild(button);
  
  button.addEventListener('click', toggleOverlay);
}

// Create overlay container - Updated to match Lovable style
function createOverlay() {
  overlayContainer = document.createElement('div');
  overlayContainer.className = 'savvy-overlay';
  overlayContainer.setAttribute('aria-hidden', 'true');
  overlayContainer.style.display = 'none';
  overlayContainer.innerHTML = `
    <div class="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity animate-fade-in" id="savvy-overlay-backdrop"></div>
    <div class="savvy-side-panel hardware-accelerated">
      <div class="savvy-panel-header">
        <div class="flex items-center space-x-2">
          <span class="bg-savvy-purple text-white p-1 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </span>
          <h3 class="font-bold text-lg">Scout.io</h3>
          <span class="text-xs bg-savvy-purple/10 text-savvy-purple px-2 py-0.5 rounded-full">BETA</span>
        </div>
        <div class="flex items-center space-x-2">
          <button class="p-2 hover:bg-gray-100 rounded-lg text-gray-500" id="savvy-settings-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <button class="p-2 hover:bg-gray-100 rounded-lg text-gray-500" id="savvy-close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="savvy-panel-content">
        <div class="flex flex-col space-y-6">
          <!-- Status bar -->
          <div id="savvy-analysis-status" class="text-sm"></div>
          
          <!-- Loading state -->
          <div id="savvy-loading" class="py-12 flex flex-col items-center justify-center">
            <div class="w-16 h-16 border-4 border-savvy-purple/30 border-t-savvy-purple rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-500">Analyzing prices and reviews...</p>
          </div>
          
          <!-- Product info section (hidden initially) -->
          <div id="savvy-product-info" class="hidden">
            <!-- Content will be populated dynamically -->
          </div>
          
          <!-- Tabs navigation - Styled like Lovable tabs -->
          <div id="savvy-tabs" class="hidden border-b border-gray-200">
            <div class="flex space-x-4">
              <button class="savvy-tab-btn active py-2 border-b-2 border-savvy-purple font-medium text-savvy-purple" data-tab="prices">
                Best Prices
              </button>
              <button class="savvy-tab-btn py-2 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700" data-tab="reviews">
                Reviews
              </button>
              <button class="savvy-tab-btn py-2 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700" data-tab="alternatives">
                Similar Products
              </button>
              <button class="savvy-tab-btn py-2 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700" data-tab="scraper">
                Web Scraper
              </button>
            </div>
          </div>
          
          <!-- Tab content sections -->
          <div id="savvy-tab-content" class="hidden">
            <div id="savvy-prices-tab" class="savvy-tab-panel">
              <!-- Content will be populated dynamically -->
            </div>
            
            <div id="savvy-reviews-tab" class="savvy-tab-panel hidden">
              <!-- Content will be populated dynamically -->
            </div>
            
            <div id="savvy-alternatives-tab" class="savvy-tab-panel hidden">
              <!-- Content will be populated dynamically -->
            </div>
            
            <div id="savvy-scraper-tab" class="savvy-tab-panel hidden">
              <div class="space-y-4">
                <h3 class="font-semibold">Web Scraper</h3>
                <p class="text-sm text-gray-500">Scrape product data from this page or any other URL.</p>
                
                <div class="flex items-center space-x-2">
                  <button id="savvy-scrape-current" class="savvy-button savvy-button-primary">
                    Scrape Current Page
                  </button>
                  <div class="relative flex-grow">
                    <input id="savvy-url-input" type="text" placeholder="Enter product URL to scrape" class="savvy-input" />
                  </div>
                  <button id="savvy-scrape-url" class="savvy-button savvy-button-secondary">
                    Scrape URL
                  </button>
                </div>
                
                <div id="savvy-scraping-status" class="text-sm min-h-[24px]"></div>
                
                <div id="savvy-scraped-product-info"></div>
                
                <div class="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-6">
                  <h4 class="font-medium text-sm">Supported Sites</h4>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    <div class="bg-white p-2 rounded border border-gray-200 text-xs">Amazon</div>
                    <div class="bg-white p-2 rounded border border-gray-200 text-xs">Walmart</div>
                    <div class="bg-white p-2 rounded border border-gray-200 text-xs">Target</div>
                    <div class="bg-white p-2 rounded border border-gray-200 text-xs">Best Buy</div>
                    <div class="bg-white p-2 rounded border border-gray-200 text-xs">eBay</div>
                    <div class="bg-white p-2 rounded border border-gray-200 text-xs">AliExpress</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Trial/Premium banner - Lovable style -->
          <div id="savvy-subscription-banner" class="mt-4 p-4 bg-gradient-to-r from-savvy-purple to-savvy-blue rounded-lg text-white hidden">
            <!-- Content will be populated dynamically -->
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlayContainer);
  
  // Add event listeners to overlay buttons
  document.getElementById('savvy-close-btn').addEventListener('click', toggleOverlay);
  document.getElementById('savvy-overlay-backdrop').addEventListener('click', toggleOverlay);
  
  // Tab switching functionality
  const tabButtons = document.querySelectorAll('.savvy-tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
  
  // Add scrape buttons functionality
  document.getElementById('savvy-scrape-current').addEventListener('click', function() {
    scrapeCurrentPage();
  });
  
  document.getElementById('savvy-scrape-url').addEventListener('click', function() {
    const urlInput = document.getElementById('savvy-url-input');
    const url = urlInput.value.trim();
    if (url) {
      scrapeUrl(url);
    } else {
      document.getElementById('savvy-scraping-status').innerHTML = `
        <div class="inline-flex items-center text-savvy-red">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Please enter a valid URL</span>
        </div>
      `;
    }
  });
}

// Function to scrape the current page
function scrapeCurrentPage() {
  const statusEl = document.getElementById('savvy-scraping-status');
  statusEl.innerHTML = `
    <div class="inline-flex items-center text-gray-500">
      <span class="w-4 h-4 border-2 border-t-savvy-purple border-opacity-30 rounded-full animate-spin mr-2"></span>
      <span>Scraping current page...</span>
    </div>
  `;
  
  chrome.runtime.sendMessage({
    type: 'SCRAPE_PRODUCT_URL',
    url: window.location.href
  }, function(response) {
    console.log('Scrape response:', response);
    // The status updates will come through the message listener
  });
}

// Function to scrape a specific URL
function scrapeUrl(url) {
  const statusEl = document.getElementById('savvy-scraping-status');
  statusEl.innerHTML = `
    <div class="inline-flex items-center text-gray-500">
      <span class="w-4 h-4 border-2 border-t-savvy-purple border-opacity-30 rounded-full animate-spin mr-2"></span>
      <span>Scraping ${url}...</span>
    </div>
  `;
  
  chrome.runtime.sendMessage({
    type: 'SCRAPE_PRODUCT_URL',
    url: url
  }, function(response) {
    console.log('Scrape response:', response);
    // The status updates will come through the message listener
  });
}

// Toggle overlay visibility - Updated for smooth transitions
function toggleOverlay() {
  isOverlayVisible = !isOverlayVisible;
  
  if (isOverlayVisible) {
    overlayContainer.style.display = 'block';
    document.body.classList.add('overflow-hidden');
    
    // Force a reflow to ensure animations work properly
    void overlayContainer.offsetWidth;
  } else {
    // Add a slight delay before hiding to allow animations to complete
    setTimeout(() => {
      overlayContainer.style.display = 'none';
      document.body.classList.remove('overflow-hidden');
    }, 300);
    
    // Start hiding animation immediately
    const sidePanel = overlayContainer.querySelector('.savvy-side-panel');
    if (sidePanel) {
      sidePanel.style.transform = 'translateX(100%)';
      sidePanel.style.transition = 'transform 0.3s ease-out';
    }
    
    const backdrop = overlayContainer.querySelector('#savvy-overlay-backdrop');
    if (backdrop) {
      backdrop.style.opacity = '0';
      backdrop.style.transition = 'opacity 0.3s ease-out';
    }
  }
}

// Switch between tabs
function switchTab(tabName) {
  // Remove active class from all tabs
  document.querySelectorAll('.savvy-tab-btn').forEach(tab => {
    tab.classList.remove('active', 'border-savvy-purple', 'text-savvy-purple');
    tab.classList.add('border-transparent', 'text-gray-500');
  });
  
  // Hide all tab panels
  document.querySelectorAll('.savvy-tab-panel').forEach(panel => {
    panel.classList.add('hidden');
  });
  
  // Activate the selected tab
  const activeTab = document.querySelector(`.savvy-tab-btn[data-tab="${tabName}"]`);
  activeTab.classList.add('active', 'border-savvy-purple', 'text-savvy-purple');
  activeTab.classList.remove('border-transparent', 'text-gray-500');
  
  // Show the selected tab panel
  document.getElementById(`savvy-${tabName}-tab`).classList.remove('hidden');
}

// Update overlay with product data
function updateOverlayWithData(data) {
  // Hide loading state
  document.getElementById('savvy-loading').classList.add('hidden');
  
  // Show product info, tabs, and content
  document.getElementById('savvy-product-info').classList.remove('hidden');
  document.getElementById('savvy-tabs').classList.remove('hidden');
  document.getElementById('savvy-tab-content').classList.remove('hidden');
  
  // Update product info section
  document.getElementById('savvy-product-info').innerHTML = `
    <div class="flex items-start space-x-4">
      <img src="${data.product.image || 'https://via.placeholder.com/100'}" alt="${data.product.title}" 
           class="w-20 h-20 object-contain rounded-lg border border-gray-200 dark:border-gray-700">
      <div>
        <h2 class="font-medium text-lg">${data.product.title}</h2>
        <div class="flex items-baseline mt-1 space-x-2">
          <span class="text-xl font-bold">${data.product.currency}${data.product.currentPrice}</span>
          ${data.priceData.lowestPrice.price < data.product.currentPrice 
            ? `<span class="text-sm text-savvy-green font-medium">
                 Save ${data.product.currency}${(data.product.currentPrice - data.priceData.lowestPrice.price).toFixed(2)}
               </span>` 
            : ''}
        </div>
        ${data.priceData.priceDropPrediction.isLikely 
          ? `<div class="mt-1 flex items-center text-xs text-savvy-blue">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                 <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                 <polyline points="16 7 22 7 22 13"></polyline>
               </svg>
               Price drop likely in the next 14 days (${data.priceData.priceDropPrediction.confidence}% confidence)
             </div>`
          : ''}
      </div>
    </div>
  `;
  
  // Update prices tab
  document.getElementById('savvy-prices-tab').innerHTML = `
    <div class="space-y-6">
      <div>
        <h3 class="font-semibold mb-2">Best Prices Available</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 rounded-lg border border-savvy-green bg-savvy-green/5">
            <div class="flex items-center space-x-2">
              <span class="rounded-full bg-savvy-green text-white p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <div>
                <div class="font-medium">${data.priceData.lowestPrice.seller}</div>
                <div class="text-xs text-gray-500">Free shipping • Trusted seller</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-lg">${data.product.currency}${data.priceData.lowestPrice.price}</div>
              <a href="${data.priceData.lowestPrice.url}" class="text-xs text-savvy-purple font-medium hover:underline">
                Visit Store
              </a>
            </div>
          </div>
          
          <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-2">
              <span class="rounded-full bg-gray-200 dark:bg-gray-700 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </span>
              <div>
                <div class="font-medium">Current Seller</div>
                <div class="text-xs text-gray-500">Current website</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-lg">${data.product.currency}${data.product.currentPrice}</div>
              <div class="text-xs text-gray-500">You are here</div>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 class="font-semibold mb-2">Price History</h3>
        <div class="h-48 w-full bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center">
          <div class="w-full h-32 relative">
            <!-- This would be a real chart in production -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-xs text-gray-400">
                Price history chart will appear here
              </div>
            </div>
            <svg viewBox="0 0 300 100" class="w-full h-full stroke-savvy-purple stroke-2 fill-none">
              <path d="M0,80 C20,70 40,90 60,85 C80,80 100,50 120,45 C140,40 160,60 180,40 C200,20 220,30 240,15 C260,5 280,10 300,5" />
              <circle cx="300" cy="5" r="3" class="fill-savvy-purple" />
            </svg>
          </div>
        </div>
        <div class="mt-2 flex justify-between text-xs text-gray-500">
          <span>6 months ago</span>
          <span>3 months ago</span>
          <span>Today</span>
        </div>
      </div>
      
      <div>
        <h3 class="font-semibold mb-2">Price Analysis</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
            <div class="text-2xl font-bold text-savvy-blue">
              ${data.priceData.priceHistory[0].price < data.product.currentPrice ? '+' : ''}${(((data.product.currentPrice / data.priceData.priceHistory[0].price) - 1) * 100).toFixed(1)}%
            </div>
            <div class="text-xs text-gray-500 mt-1">vs 6 months ago</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
            <div class="text-2xl font-bold ${data.priceData.priceDropPrediction.isLikely ? 'text-savvy-green' : 'text-savvy-red'}">
              ${data.priceData.priceDropPrediction.isLikely ? 'Yes' : 'No'}
            </div>
            <div class="text-xs text-gray-500 mt-1">Expected price drop</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
            <div class="text-2xl font-bold">
              ${data.priceData.priceDropPrediction.isLikely ? `~${data.priceData.priceDropPrediction.estimatedDrop}%` : 'N/A'}
            </div>
            <div class="text-xs text-gray-500 mt-1">Estimated drop</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Update reviews tab
  document.getElementById('savvy-reviews-tab').innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold">Review Summary</h3>
          <div class="text-xs text-gray-500">Based on ${data.reviewData.totalReviews} reviews</div>
        </div>
        
        <div class="flex items-baseline space-x-1">
          <span class="text-3xl font-bold">${data.reviewData.averageRating}</span>
          <div>
            <div class="flex items-center">
              ${renderStars(data.reviewData.averageRating)}
            </div>
            <div class="text-xs text-gray-500 text-right">Average rating</div>
          </div>
        </div>
      </div>
      
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 class="font-medium mb-3">Sentiment Analysis</h4>
        <div class="space-y-2">
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span>Positive</span>
              <span>${data.reviewData.sentimentSummary.positive}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div class="bg-savvy-green h-2 rounded-full" style="width: ${data.reviewData.sentimentSummary.positive}%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span>Neutral</span>
              <span>${data.reviewData.sentimentSummary.neutral}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div class="bg-savvy-yellow h-2 rounded-full" style="width: ${data.reviewData.sentimentSummary.neutral}%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span>Negative</span>
              <span>${data.reviewData.sentimentSummary.negative}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div class="bg-savvy-red h-2 rounded-full" style="width: ${data.reviewData.sentimentSummary.negative}%"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <div class="flex items-center space-x-2 mb-3">
          <h4 class="font-medium">Trust Score</h4>
          <div class="text-xs bg-savvy-green/15 text-savvy-green px-2 py-0.5 rounded-full">
            ${data.reviewData.trustScore}/100
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h5 class="text-sm font-medium mb-2">What Reviewers Like</h5>
            <ul class="space-y-2">
              ${data.reviewData.topPros.map(pro => `
                <li class="text-sm flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-savvy-green mr-2 mt-0.5">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                  ${pro}
                </li>
              `).join('')}
            </ul>
          </div>
          <div>
            <h5 class="text-sm font-medium mb-2">Common Concerns</h5>
            <ul class="space-y-2">
              ${data.reviewData.topCons.map(con => `
                <li class="text-sm flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-savvy-yellow mr-2 mt-0.5">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="M12 8v4"></path>
                    <path d="M12 16h.01"></path>
                  </svg>
                  ${con}
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Update alternatives tab
  document.getElementById('savvy-alternatives-tab').innerHTML = `
    <div class="space-y-6">
      <h3 class="font-semibold">Similar Products You Might Prefer</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${data.alternatives.map(alt => `
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-savvy-purple hover:shadow-md transition-all">
            <div class="h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <img src="${alt.image}" alt="${alt.title}" class="h-full w-full object-contain">
            </div>
            <div class="p-3">
              <h4 class="font-medium text-sm line-clamp-2">${alt.title}</h4>
              <div class="flex items-center mt-1">
                <div class="flex items-center">
                  ${renderStars(alt.rating)}
                </div>
                <span class="text-xs text-gray-500 ml-1">${alt.rating}</span>
              </div>
              <div class="mt-2 flex justify-between items-center">
                <span class="font-bold">${data.product.currency}${alt.price}</span>
                <span class="savvy-badge bg-savvy-blue/15 text-savvy-blue px-2 py-0.5">${alt.advantage}</span>
              </div>
              <a href="${alt.url}" class="mt-2 block text-center bg-savvy-purple/10 text-savvy-purple text-sm py-1 rounded-md hover:bg-savvy-purple hover:text-white transition-colors">
                View Product
              </a>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="flex justify-center pt-4">
        <button class="bg-white border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
          See More Alternatives
        </button>
      </div>
    </div>
  `;
  
  // Check subscription status and update banner
  checkSubscriptionStatus();
}

// Helper function to render star ratings
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let starsHTML = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="text-savvy-yellow">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>`;
  }
  
  // Half star if needed
  if (hasHalfStar) {
    starsHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" class="text-savvy-yellow">
      <path fill="currentColor" d="M12,2 L12,17.77 L5.82,21.02 L7,14.14 L2,9.27 L8.91,8.26 L12,2 Z"></path>
      <path fill="none" stroke="currentColor" stroke-width="1" d="M12,2 L15.09,8.26 L22,9.27 L17,14.14 L18.18,21.02 L12,17.77 L5.82,21.02 L7,14.14 L2,9.27 L8.91,8.26 L12,2 Z"></path>
    </svg>`;
  }
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-gray-300 dark:text-gray-600">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>`;
  }
  
  return starsHTML;
}

// Check subscription status and update subscription banner
async function checkSubscriptionStatus() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_SUBSCRIPTION_STATUS'
    });
    
    const subscriptionBanner = document.getElementById('savvy-subscription-banner');
    
    if (response.status === 'trial') {
      // Show trial banner with days remaining
      subscriptionBanner.classList.remove('hidden');
      document.getElementById('savvy-trial-days').textContent = response.daysRemaining;
    } else if (response.status === 'free') {
      // Show upgrade banner
      subscriptionBanner.classList.remove('hidden');
      subscriptionBanner.innerHTML = `
        <div class="flex justify-between items-center">
          <div>
            <h4 class="font-semibold">Upgrade to Premium</h4>
            <p class="text-sm opacity-90">Get unlimited price alerts and alternative suggestions.</p>
          </div>
          <button class="bg-white text-savvy-purple px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow">
            Upgrade Now
          </button>
        </div>
      `;
    } else if (response.status === 'premium') {
      // Hide banner for premium users
      subscriptionBanner.classList.add('hidden');
    }
  } catch (error) {
    console.error('Error checking subscription status:', error);
  }
}

// Load user preferences from storage
async function loadUserPreferences() {
  try {
    const data = await chrome.storage.sync.get([
      'isEnabled',
      'prioritizeBy',
      'showTrustScores',
      'showAlternatives',
      'notifyPriceDrops'
    ]);
    
    userPreferences = {
      isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
      prioritizeBy: data.prioritizeBy || 'balanced',
      showTrustScores: data.showTrustScores !== undefined ? data.showTrustScores : true,
      showAlternatives: data.showAlternatives !== undefined ? data.showAlternatives : true,
      notifyPriceDrops: data.notifyPriceDrops !== undefined ? data.notifyPriceDrops : true
    };
    
  } catch (error) {
    console.error('Error loading user preferences:', error);
  }
}

// Initialize the extension when DOM is ready
window.addEventListener('load', initialize);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE_OVERLAY') {
    handleOverlayVisibility(message.enabled);
    sendResponse({ success: true });
  }
});

// Handle overlay visibility
function handleOverlayVisibility(enabled) {
  userPreferences.isEnabled = enabled;
  
  if (overlayContainer) {
    if (enabled) {
      overlayContainer.style.display = productData ? 'block' : 'none';
    } else {
      overlayContainer.style.display = 'none';
    }
  }
  
  // If enabling and we have product data, show the overlay
  if (enabled && productData) {
    showOverlay();
  }
}
