// Background service worker for Scout.io Chrome Extension
import { initApifyIntegration, searchProductPrices, processScrapedData, quickScrapeProductURL, testApifyApiKey } from './apify-integration.js';

// Track currently active product
let activeProduct = null;

// Store current product data
let currentProductData = null;

// Track price history
const priceHistory = {};

// Track notification check interval
let priceCheckInterval = null;

// Listen for installation event
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      theme: 'light',
      priceDropAlerts: true,
      alertSound: true,
      checkFrequency: '15 minutes',
      notifications: true,
      compactMode: false,
      shareAnalytics: true,
      searchHistory: true,
      currency: 'USD'
    });

    // Start price check interval
    setupPriceCheckInterval();
  }
});

// Listen for theme changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.theme) {
    // Apply theme to all extension pages
    const newTheme = changes.theme.newValue;
    applyTheme(newTheme);
  }
});

// Apply theme to extension pages
function applyTheme(theme) {
  // Get all extension tabs
  chrome.tabs.query({ url: chrome.runtime.getURL('/*') }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'THEME_CHANGED', theme });
      }
    });
  });
}

// Setup price check interval based on settings
async function setupPriceCheckInterval() {
  // Clear existing interval if any
  if (priceCheckInterval) {
    clearInterval(priceCheckInterval);
  }

  // Get current settings
  const { priceDropAlerts, checkFrequency } = await chrome.storage.sync.get([
    'priceDropAlerts',
    'checkFrequency'
  ]);

  // Only setup interval if price drop alerts are enabled
  if (priceDropAlerts) {
    // Convert frequency setting to milliseconds
    const frequencyMap = {
      '5 minutes': 5 * 60 * 1000,
      '15 minutes': 15 * 60 * 1000,
      '30 minutes': 30 * 60 * 1000,
      '1 hour': 60 * 60 * 1000
    };

    const interval = frequencyMap[checkFrequency] || frequencyMap['15 minutes'];

    // Setup new interval
    priceCheckInterval = setInterval(() => {
      checkPriceAlerts();
    }, interval);

    // Do an initial check
    checkPriceAlerts();
  }
}

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SCRAPE_PRODUCT') {
    handleProductScraping(request.url, sendResponse);
    return true; // Will respond asynchronously
  }

  if (request.type === 'CHECK_PRICE_ALERTS') {
    checkPriceAlerts();
    sendResponse({ success: true });
  }

  if (request.type === 'PRODUCT_DETECTED') {
    console.log('Product detected:', request.data);
    activeProduct = request.data;
    handleProductDetection(request.data, sender.tab?.id);
    sendResponse({ success: true });
    return true; // Keep the messaging channel open for async response
  } else if (request.type === 'GET_PRODUCT_DATA') {
    console.log('Product data requested, sending:', currentProductData);
    sendResponse({ success: true, data: currentProductData });
    return false;
  } else if (request.type === 'CHECK_ACTIVE_PRODUCT') {
    console.log('Checking for active product:', activeProduct !== null);
    sendResponse({ hasActiveProduct: activeProduct !== null });
    return false;
  } else if (request.type === 'SAVE_APIFY_API_KEY') {
    saveApifyApiKey(request.apiKey).then(sendResponse);
    return true; // Keep the messaging channel open for async response
  } else if (request.type === 'TEST_APIFY_API_KEY') {
    console.log('Testing Apify API key:', request.apiKey);
    testApifyApiKey(request.apiKey)
      .then(result => {
        console.log('API key test result:', result);
        sendResponse({ success: result });
      })
      .catch(error => {
        console.error('API key test error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep messaging channel open
  } else if (request.type === 'SCRAPE_PRODUCT_URL') {
    scrapeProductURL(request.url, sender.tab?.id)
      .then(result => {
        if (result) {
          activeProduct = result;
        }
        sendResponse({ success: true, data: result });
      })
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the messaging channel open for async response
  } else if (request.type === 'CLEAR_ACTIVE_PRODUCT') {
    console.log('Clearing active product');
    activeProduct = null;
    currentProductData = null;
    sendResponse({ success: true });
    return false;
  } else if (request.type === 'TRACK_PRICE_DROPS') {
    trackPriceDrops(request.productUrl, request.currentPrice);
    sendResponse({ success: true });
    return false;
  } else if (request.type === 'CHECK_PRICE_HISTORY') {
    const history = getPriceHistory(request.productUrl);
    sendResponse({ success: true, history: history });
    return false;
  } else if (request.type === 'FORCE_PRODUCT_DETECTION') {
    // Force detection of a product for testing purposes
    console.log('Force product detection received');

    const mockProduct = {
      title: "Test Product - Premium Wireless Headphones",
      price: 99.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=320&q=80",
      url: "https://example.com/product/wireless-headphones"
    };

    console.log('Forcing product detection:', mockProduct);
    activeProduct = mockProduct;

    // Handle the product detection with the active tab
    const tabId = request.tabId || (sender.tab && sender.tab.id);
    if (tabId) {
      handleProductDetection(mockProduct, tabId);

      // Notify popup to refresh product display
      chrome.runtime.sendMessage({
        type: 'PRODUCT_DETECTED'
      }).catch(error => {
        // Ignore error if popup is not open
        console.log('Could not notify popup, probably not open');
      });

      sendResponse({ success: true });
    } else {
      console.error('No tab ID provided for forced product detection');
      sendResponse({ success: false, error: 'No tab ID provided' });
    }
    return true;
  } else if (request.type === 'REFRESH_PRODUCT_DISPLAY') {
    // Just send back the current product data
    if (currentProductData) {
      sendResponse({ success: true, data: currentProductData });
    } else {
      // If we don't have data yet, create some mock data for testing
      console.log('No product data available, creating mock data for testing');

      // Create mock product data
      const mockProduct = {
        title: "Test Product - Premium Wireless Headphones",
        price: 99.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=320&q=80",
        url: "https://example.com/product/wireless-headphones"
      };

      // Force product detection with the mock product
      activeProduct = mockProduct;
      handleProductDetection(mockProduct, null);

      // Try again after a short delay
      setTimeout(() => {
        if (currentProductData) {
          try {
            chrome.runtime.sendMessage({
              type: 'REFRESH_PRODUCT_DISPLAY_RESPONSE',
              data: currentProductData
            });
          } catch (error) {
            console.log('Error sending refresh response:', error);
          }
        }
      }, 500);

      sendResponse({ success: false, error: 'Product data being generated' });
    }
    return false;
  } else if (request.type === 'PRODUCT_DATA') {
    console.log('Product data received:', request.data);
    sendResponse({ status: 'success' });
  }

  // Add handler for notification setting changes
  if (request.type === 'NOTIFICATION_SETTINGS_CHANGED') {
    setupPriceCheckInterval();
    sendResponse({ success: true });
  }
});

// Save Apify API key
async function saveApifyApiKey(apiKey) {
  try {
    await chrome.storage.sync.set({ apifyApiKey: apiKey });
    const initResult = await initApifyIntegration();
    return { success: initResult };
  } catch (error) {
    console.error('Error saving Apify API key:', error);
    return { success: false, error: error.message };
  }
}

// Track price drops for a product
function trackPriceDrops(productUrl, currentPrice) {
  if (!productUrl || !currentPrice) return;

  // Get or initialize price history for this product
  if (!priceHistory[productUrl]) {
    priceHistory[productUrl] = [];
  }

  // Add current price to history
  const timestamp = Date.now();
  priceHistory[productUrl].push({
    price: currentPrice,
    date: timestamp
  });

  console.log(`Added price point for ${productUrl}: $${currentPrice} at ${new Date(timestamp).toLocaleString()}`);
  console.log('Updated price history:', priceHistory[productUrl]);

  // Limit history to 100 entries per product
  if (priceHistory[productUrl].length > 100) {
    priceHistory[productUrl] = priceHistory[productUrl].slice(-100);
  }

  // Save updated price history to storage
  chrome.storage.local.set({ 'priceHistory': priceHistory }, () => {
    console.log('Price history saved to storage');
  });

  // Check if this is a price drop
  checkForPriceDrop(productUrl, currentPrice);
}

// Get price history for a product
function getPriceHistory(productUrl) {
  return priceHistory[productUrl] || [];
}

// Check if the current price represents a significant drop
function checkForPriceDrop(productUrl, currentPrice) {
  const history = priceHistory[productUrl];
  if (!history || history.length < 2) return;

  // Get previous price (not including the one we just added)
  const previousPrices = history.slice(0, -1);
  const lastPrice = previousPrices[previousPrices.length - 1].price;

  // Calculate percentage drop
  const priceDrop = ((lastPrice - currentPrice) / lastPrice) * 100;

  console.log(`Price drop calculation: Previous price $${lastPrice}, Current price $${currentPrice}, Drop: ${priceDrop.toFixed(2)}%`);

  // Get minimum drop percentage from settings
  chrome.storage.sync.get('minimumPriceDropPercent', (data) => {
    const minDropPercent = data.minimumPriceDropPercent || 5;

    // Check if we should notify
    chrome.storage.sync.get('notifyPriceDrops', (dropData) => {
      if (dropData.notifyPriceDrops && priceDrop >= minDropPercent) {
        console.log(`Significant price drop detected: ${priceDrop.toFixed(2)}% - Creating notification`);

        // Create notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Price Drop Alert!',
          message: `The price has dropped by ${priceDrop.toFixed(2)}%! Now: $${currentPrice.toFixed(2)}`,
          priority: 2
        });
      } else {
        console.log(`Price drop ${priceDrop.toFixed(2)}% is below threshold ${minDropPercent}% or notifications are disabled`);
      }
    });
  });
}

// Scrape a specific product URL
async function scrapeProductURL(url, tabId) {
  try {
    // Notify content script that scraping has started
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        type: 'SCRAPING_STATUS',
        status: 'started',
        message: 'Starting to scrape product data...'
      }).catch(err => console.log('Error sending message to tab, may not be active yet:', err));
    }

    // Scrape the URL
    const productData = await quickScrapeProductURL(url);

    // Notify content script with results
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        type: 'SCRAPING_STATUS',
        status: productData ? 'success' : 'error',
        message: productData ? 'Successfully scraped product data' : 'Failed to scrape product data',
        data: productData
      }).catch(err => console.log('Error sending message to tab, may not be active yet:', err));
    }

    return productData;
  } catch (error) {
    console.error('Error scraping product URL:', error);

    // Notify content script of error
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        type: 'SCRAPING_STATUS',
        status: 'error',
        message: `Error: ${error.message}`
      }).catch(err => console.log('Error sending message to tab, may not be active yet:', err));
    }

    throw error;
  }
}

// Handle product detection
async function handleProductDetection(productData, tabId) {
  try {
    // Store as active product
    activeProduct = productData;

    // Track price for this product
    if (productData.price && productData.url) {
      trackPriceDrops(productData.url, productData.price);
    }

    // Notify popup about product detection in case popup is open
    chrome.runtime.sendMessage({
      type: 'PRODUCT_DETECTED',
      data: productData
    }).catch(() => {
      // Ignore error if popup is not open
    });

    // Try to find similar products with better prices using Apify
    console.log('Searching for alternative products...');
    let alternatives = [];

    try {
      // Use Apify to search for similar products across multiple websites
      const scrapedData = await searchProductPrices(productData);
      console.log('Scraped data from Apify:', scrapedData);

      if (scrapedData && scrapedData.length > 0) {
        const processedData = processScrapedData(scrapedData, productData);
        console.log('Processed data:', processedData);

        if (processedData && processedData.allPrices) {
          alternatives = processedData.allPrices.map(item => ({
            title: item.title || "Product",
            rating: item.rating || ((Math.random() * 0.5) + 4).toFixed(1),
            price: item.price,
            image: item.image || "https://via.placeholder.com/100",
            url: item.url || "#",
            seller: item.seller || item.domain.split('.')[0].charAt(0).toUpperCase() + item.domain.split('.')[0].slice(1),
            advantage: item.advantage || (item.price < productData.price ? "Better price" : "Alternative")
          }));
          console.log('Generated alternatives from Apify data:', alternatives);
        }
      }
    } catch (error) {
      console.error('Error scraping alternatives:', error);
    }

    // If we couldn't get real alternatives, use mock data
    if (!alternatives || alternatives.length === 0) {
      console.log('Using mock alternatives since Apify did not return usable data');
      alternatives = generateMockAlternatives(productData);
    }

    // Generate mock or real result
    const result = {
      product: {
        title: productData.title || "Product Title",
        image: productData.image || "https://via.placeholder.com/150",
        currentPrice: productData.price || 99.99,
        currency: "$"
      },
      priceData: {
        lowestPrice: {
          price: alternatives && alternatives.length > 0 ?
            Math.min(productData.price * 0.85, alternatives[0].price).toFixed(2) :
            (productData.price * 0.85).toFixed(2),
          seller: alternatives && alternatives.length > 0 ?
            (alternatives[0].seller || alternatives[0].title.substring(0, 15) + "...") : "BestValueStore",
          url: alternatives && alternatives.length > 0 ? alternatives[0].url : "#"
        },
        priceHistory: getPriceChartData(productData.url),
        priceDropPrediction: {
          isLikely: Math.random() > 0.5,
          confidence: Math.floor(Math.random() * 30) + 70,
          estimatedDrop: Math.floor(Math.random() * 15) + 5
        }
      },
      reviewData: {
        averageRating: (Math.random() * 2 + 3).toFixed(1),
        totalReviews: Math.floor(Math.random() * 1000) + 100,
        sentimentSummary: {
          positive: Math.floor(Math.random() * 30) + 60,
          neutral: Math.floor(Math.random() * 20) + 5,
          negative: Math.floor(Math.random() * 15) + 5
        },
        trustScore: Math.floor(Math.random() * 30) + 70,
        topPros: [
          "Great value for money",
          "Excellent build quality",
          "Fast shipping"
        ],
        topCons: [
          "Customer service could be better",
          "Some reported minor issues"
        ]
      },
      alternatives: alternatives || []
    };

    // Store the processed data so it can be requested by the popup
    currentProductData = result;
    console.log('Updated current product data:', currentProductData);

    // Send the processed data back to any listeners
    chrome.runtime.sendMessage({
      type: 'PRODUCT_DATA_READY',
      data: result
    }).catch(() => {
      // Ignore error if popup is not open
    });

    // If we have a tab ID, notify that content script as well
    if (tabId) {
      try {
        // Notify content script that product analysis has completed
        chrome.tabs.sendMessage(tabId, {
          type: 'PRODUCT_ANALYSIS_STATUS',
          status: 'completed',
          message: 'Product analysis completed'
        });

        // Send the product data to the content script
        chrome.tabs.sendMessage(tabId, {
          type: 'PRODUCT_DATA_READY',
          data: result
        });
      } catch (error) {
        console.error('Error sending message to tab:', error);
      }
    }

  } catch (error) {
    console.error('Error handling product detection:', error);

    if (tabId) {
      // Notify content script of error
      chrome.tabs.sendMessage(tabId, {
        type: 'PRODUCT_ANALYSIS_STATUS',
        status: 'error',
        message: `Error: ${error.message}`
      }).catch(() => {
        // Ignore error if content script is not ready
      });
    }
  }
}

// Get price history data formatted for charts
function getPriceChartData(productUrl) {
  const history = getPriceHistory(productUrl);

  if (!history || history.length === 0) {
    // Return mock data if no history
    return [
      { date: "Jan", price: 110 },
      { date: "Feb", price: 105 },
      { date: "Mar", price: 115 },
      { date: "Apr", price: 110 },
      { date: "May", price: 100 },
      { date: "Jun", price: 95 }
    ];
  }

  // Format actual history data
  return history.slice(-6).map(entry => {
    const date = new Date(entry.date);
    const month = date.toLocaleString('default', { month: 'short' });
    return {
      date: month,
      price: entry.price
    };
  });
}

// Generate mock alternative products
function generateMockAlternatives(productData) {
  const currentPrice = productData.price || 99.99;

  return [
    {
      title: "Similar Premium Model",
      rating: (Math.random() * 1 + 4).toFixed(1),
      price: (currentPrice * (Math.random() * 0.3 + 1.1)).toFixed(2),
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=320&q=80",
      url: "https://amazon.com/dp/B08MVDKZ84",
      advantage: "Higher rated",
      seller: "Amazon"
    },
    {
      title: "Budget Alternative",
      rating: (Math.random() * 0.5 + 3.8).toFixed(1),
      price: (currentPrice * (Math.random() * 0.2 + 0.7)).toFixed(2),
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=320&q=80",
      url: "https://walmart.com/ip/987654",
      advantage: "Best value",
      seller: "Walmart"
    },
    {
      title: "Popular Choice",
      rating: (Math.random() * 0.5 + 4.2).toFixed(1),
      price: (currentPrice * (Math.random() * 0.15 + 0.9)).toFixed(2),
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=320&q=80",
      url: "https://bestbuy.com/site/12345",
      advantage: "Most popular",
      seller: "Best Buy"
    }
  ];
}

// Handle product scraping requests
async function handleProductScraping(url, sendResponse) {
  try {
    // Get API credentials from storage
    const { apifyApiKey, apifyActorId } = await chrome.storage.sync.get([
      'apifyApiKey',
      'apifyActorId'
    ]);

    if (!apifyApiKey || !apifyActorId) {
      sendResponse({ error: 'API credentials not configured' });
      return;
    }

    // Make API request to Apify
    const response = await fetch('https://api.apify.com/v2/acts/' + apifyActorId + '/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apifyApiKey}`
      },
      body: JSON.stringify({
        startUrls: [{ url }],
        maxRequestsPerCrawl: 1
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    sendResponse({ success: true, runId: data.id });

  } catch (error) {
    console.error('Scraping error:', error);
    sendResponse({ error: error.message });
  }
}

// Check price alerts periodically
async function checkPriceAlerts() {
  try {
    const { priceDropAlerts, watchedProducts, alertSound } = await chrome.storage.sync.get([
      'priceDropAlerts',
      'watchedProducts',
      'alertSound'
    ]);

    if (!priceDropAlerts || !watchedProducts?.length) {
      return;
    }

    console.log('Checking price alerts for', watchedProducts.length, 'products');

    // Check each watched product
    for (const product of watchedProducts) {
      try {
        const currentPrice = await fetchCurrentPrice(product.url);

        if (currentPrice && currentPrice < product.targetPrice) {
          showPriceAlert(product, currentPrice, alertSound);

          // Update the target price to the new lower price
          await updateWatchedProduct(product.url, {
            ...product,
            targetPrice: currentPrice,
            lastChecked: Date.now()
          });
        }
      } catch (error) {
        console.error('Error checking price for product:', product.url, error);
      }
    }
  } catch (error) {
    console.error('Error checking price alerts:', error);
  }
}

// Show price alert notification
function showPriceAlert(product, currentPrice, playSound = true) {
  // Create notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Price Drop Alert!',
    message: `${product.title} is now $${currentPrice.toFixed(2)}! (Was: $${product.price.toFixed(2)})`,
    buttons: [{ title: 'View Deal' }],
    priority: 2
  });

  // Play notification sound if enabled
  if (playSound) {
    const audio = new Audio(chrome.runtime.getURL('sounds/notification.mp3'));
    audio.play().catch(error => {
      console.error('Error playing notification sound:', error);
    });
  }
}

// Update watched product in storage
async function updateWatchedProduct(productUrl, updatedProduct) {
  const { watchedProducts } = await chrome.storage.sync.get(['watchedProducts']);

  const updatedProducts = watchedProducts.map(product =>
    product.url === productUrl ? updatedProduct : product
  );

  await chrome.storage.sync.set({ watchedProducts: updatedProducts });
}

// Fetch current price for a product
async function fetchCurrentPrice(productUrl) {
  try {
    const data = await quickScrapeProductURL(productUrl);
    return data?.price || null;
  } catch (error) {
    console.error('Error fetching current price:', error);
    return null;
  }
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) { // "View Deal" button
    chrome.storage.sync.get(['watchedProducts'], (result) => {
      const product = result.watchedProducts.find(p => p.id === notificationId);
      if (product) {
        chrome.tabs.create({ url: product.url });
      }
    });
  }
});

// Handle tab updates to inject content script when needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const url = new URL(tab.url);
      if (isShoppingWebsite(url.hostname)) {
        chrome.scripting.executeScript({
          target: { tabId },
          files: ['contentScript.js']
        });
      }
    } catch (error) {
      console.error('Error processing URL:', error);
    }
  }
});

// Helper function to check if the website is a supported shopping site
function isShoppingWebsite(hostname) {
  const supportedDomains = [
    'amazon.com',
    'ebay.com',
    // Add more supported domains here
  ];
  return supportedDomains.some(domain => hostname.includes(domain));
}
