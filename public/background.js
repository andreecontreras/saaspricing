
// Background service worker for Scout.io Chrome Extension
import { initApifyIntegration, searchProductPrices, processScrapedData, quickScrapeProductURL, testApifyApiKey } from './apify-integration.js';
import { analyzeReviews, extractKeyInsights } from './js/huggingface-integration.js';

// Track currently active product
let activeProduct = null;

// Store current product data
let currentProductData = null;

// Track price history
const priceHistory = {};

// Listen for installation event
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Scout.io extension installed');
  
  // Set default user preferences
  await chrome.storage.sync.set({
    isEnabled: true,
    prioritizeBy: 'balanced', // 'price', 'reviews', 'shipping', 'balanced'
    showTrustScores: true,
    showAlternatives: true,
    notifyPriceDrops: true,
    minimumPriceDropPercent: 5, // Notify only for 5% or more price drop
    userSubscription: 'trial', // 'trial', 'free', 'premium'
    trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7-day trial
    apifyApiKey: 'apify_api_y9gocF4ETXbAde3CoqrbjiDOYpztOQ4zcywQ' // Initialize with hardcoded API key
  });
  
  // Initialize Apify integration
  const apifyInitialized = await initApifyIntegration();
  console.log('Apify integration initialized:', apifyInitialized);

  // Load any saved price history from storage
  chrome.storage.local.get('priceHistory', (data) => {
    if (data.priceHistory) {
      Object.assign(priceHistory, data.priceHistory);
      console.log('Loaded price history:', priceHistory);
    }
  });
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background script received message:', message.type);
  
  if (message.type === 'PRODUCT_DETECTED') {
    console.log('Product detected:', message.data);
    activeProduct = message.data;
    handleProductDetection(message.data, sender.tab.id);
    sendResponse({ success: true });
    return true; // Keep the messaging channel open for async response
  } else if (message.type === 'GET_PRODUCT_DATA') {
    console.log('Product data requested, sending:', currentProductData);
    sendResponse({ success: true, data: currentProductData });
    return false;
  } else if (message.type === 'CHECK_ACTIVE_PRODUCT') {
    console.log('Checking for active product:', activeProduct !== null);
    sendResponse({ hasActiveProduct: activeProduct !== null });
    return false;
  } else if (message.type === 'GET_SUBSCRIPTION_STATUS') {
    getSubscriptionStatus().then(sendResponse);
    return true; // Keep the messaging channel open for async response
  } else if (message.type === 'SAVE_APIFY_API_KEY') {
    saveApifyApiKey(message.apiKey).then(sendResponse);
    return true; // Keep the messaging channel open for async response
  } else if (message.type === 'TEST_APIFY_API_KEY') {
    console.log('Testing Apify API key:', message.apiKey);
    testApifyApiKey(message.apiKey)
      .then(result => {
        console.log('API key test result:', result);
        sendResponse({ success: result });
      })
      .catch(error => {
        console.error('API key test error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep messaging channel open
  } else if (message.type === 'SCRAPE_PRODUCT_URL') {
    scrapeProductURL(message.url, sender.tab.id)
      .then(result => {
        if (result) {
          activeProduct = result;
        }
        sendResponse({ success: true, data: result });
      })
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the messaging channel open for async response
  } else if (message.type === 'ANALYZE_REVIEWS') {
    analyzeProductReviews(message.reviews)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the messaging channel open for async response
  } else if (message.type === 'CLEAR_ACTIVE_PRODUCT') {
    console.log('Clearing active product');
    activeProduct = null;
    currentProductData = null;
    sendResponse({ success: true });
    return false;
  } else if (message.type === 'TRACK_PRICE_DROPS') {
    trackPriceDrops(message.productUrl, message.currentPrice);
    sendResponse({ success: true });
    return false;
  } else if (message.type === 'CHECK_PRICE_HISTORY') {
    const history = getPriceHistory(message.productUrl);
    sendResponse({ success: true, history: history });
    return false;
  } else if (message.type === 'FORCE_PRODUCT_DETECTION') {
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
    const tabId = message.tabId || (sender.tab && sender.tab.id);
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
  } else if (message.type === 'REFRESH_PRODUCT_DISPLAY') {
    // Just send back the current product data
    if (currentProductData) {
      sendResponse({ success: true, data: currentProductData });
    } else {
      sendResponse({ success: false, error: 'No product data available' });
    }
    return false;
  }
});

// Analyze product reviews using mock data (Hugging Face disabled)
async function analyzeProductReviews(reviews) {
  try {
    console.log('Using mock data for product reviews (Hugging Face disabled)');
    
    // Create mock sentiment analysis data
    const sentimentAnalysis = {
      positiveCount: Math.floor(reviews.length * 0.7),
      negativeCount: Math.floor(reviews.length * 0.1),
      positivePct: 70,
      negativePct: 10,
      neutralPct: 20,
      averageSentiment: 0.7
    };
    
    // Create mock insights
    const keyInsights = {
      topPros: [
        "Good value for money",
        "Fast shipping",
        "Quality product"
      ],
      topCons: [
        "Some issues reported",
        "Could be improved"
      ]
    };
    
    return {
      sentimentAnalysis,
      keyInsights
    };
  } catch (error) {
    console.error('Error with mock product reviews:', error);
    throw error;
  }
}

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
    chrome.tabs.sendMessage(tabId, {
      type: 'SCRAPING_STATUS',
      status: 'started',
      message: 'Starting to scrape product data...'
    });
    
    // Scrape the URL
    const productData = await quickScrapeProductURL(url);
    
    // Notify content script with results
    chrome.tabs.sendMessage(tabId, {
      type: 'SCRAPING_STATUS',
      status: productData ? 'success' : 'error',
      message: productData ? 'Successfully scraped product data' : 'Failed to scrape product data',
      data: productData
    });
    
    return productData;
  } catch (error) {
    console.error('Error scraping product URL:', error);
    
    // Notify content script of error
    chrome.tabs.sendMessage(tabId, {
      type: 'SCRAPING_STATUS',
      status: 'error',
      message: `Error: ${error.message}`
    });
    
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
      image: "https://via.placeholder.com/100",
      url: "https://amazon.com/dp/B08MVDKZ84",
      advantage: "Higher rated",
      seller: "Amazon"
    },
    {
      title: "Budget Alternative",
      rating: (Math.random() * 0.5 + 3.8).toFixed(1),
      price: (currentPrice * (Math.random() * 0.2 + 0.7)).toFixed(2),
      image: "https://via.placeholder.com/100",
      url: "https://walmart.com/ip/987654",
      advantage: "Best value",
      seller: "Walmart"
    },
    {
      title: "Popular Choice",
      rating: (Math.random() * 0.5 + 4.2).toFixed(1),
      price: (currentPrice * (Math.random() * 0.15 + 0.9)).toFixed(2),
      image: "https://via.placeholder.com/100",
      url: "https://bestbuy.com/site/12345",
      advantage: "Most popular",
      seller: "Best Buy"
    }
  ];
}

// Get user subscription status
async function getSubscriptionStatus() {
  try {
    const data = await chrome.storage.sync.get([
      'userSubscription', 
      'trialEndDate'
    ]);
    
    const now = new Date();
    const trialEnd = new Date(data.trialEndDate || 0);
    
    let status = data.userSubscription || 'free';
    let daysRemaining = 0;
    
    if (status === 'trial' && trialEnd > now) {
      daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
    } else if (status === 'trial' && trialEnd <= now) {
      // Trial expired, update to free
      status = 'free';
      await chrome.storage.sync.set({ userSubscription: 'free' });
    }
    
    return {
      status,
      daysRemaining,
      trialEndDate: data.trialEndDate
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return { status: 'error', error: error.message };
  }
}
