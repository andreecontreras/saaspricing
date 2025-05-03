// Background service worker for Scout.io Chrome Extension
import { initApifyIntegration, searchProductPrices, processScrapedData, quickScrapeProductURL, testApifyApiKey } from './apify-integration.js';
import { analyzeReviews, extractKeyInsights } from './js/huggingface-integration.js';

// Track currently active product
let activeProduct = null;

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
  initApifyIntegration();
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
    sendResponse({ success: true });
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
        type: 'REFRESH_PRODUCT_DISPLAY'
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
    
    // Notify popup about product detection in case popup is open
    chrome.runtime.sendMessage({
      type: 'PRODUCT_DETECTED', 
      data: productData
    }).catch(() => {
      // Ignore error if popup is not open
    });
    
    // Generate mock data since we're testing
    const mockResult = generateMockProductData(productData);
    
    // Send the processed data back to any listeners
    chrome.runtime.sendMessage({
      type: 'PRODUCT_DATA_READY',
      data: mockResult
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
          message: 'Using test product data'
        });
        
        // Send the product data to the content script
        chrome.tabs.sendMessage(tabId, {
          type: 'PRODUCT_DATA_READY',
          data: mockResult
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

// Generate mock product data for demo purposes
function generateMockProductData(productData) {
  const currentPrice = productData.price || 99.99;
  
  return {
    product: {
      title: productData.title || "Product Title",
      image: productData.image || "https://via.placeholder.com/150",
      currentPrice: currentPrice,
      currency: "$"
    },
    priceData: {
      lowestPrice: {
        price: (currentPrice * 0.85).toFixed(2),
        seller: "BestValueStore",
        url: "#"
      },
      priceHistory: [
        { date: "Jan", price: currentPrice * 1.1 },
        { date: "Feb", price: currentPrice * 1.05 },
        { date: "Mar", price: currentPrice * 1.15 },
        { date: "Apr", price: currentPrice * 1.1 },
        { date: "May", price: currentPrice },
        { date: "Jun", price: currentPrice * 0.95 }
      ],
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
    alternatives: [
      {
        title: "Similar Premium Model",
        rating: (Math.random() * 1 + 4).toFixed(1),
        price: (currentPrice * (Math.random() * 0.3 + 1.1)).toFixed(2),
        image: "https://via.placeholder.com/100",
        url: "#",
        advantage: "Higher rated"
      },
      {
        title: "Budget Alternative",
        rating: (Math.random() * 0.5 + 3.8).toFixed(1),
        price: (currentPrice * (Math.random() * 0.2 + 0.7)).toFixed(2),
        image: "https://via.placeholder.com/100",
        url: "#",
        advantage: "Best value"
      },
      {
        title: "Popular Choice",
        rating: (Math.random() * 0.5 + 4.2).toFixed(1),
        price: (currentPrice * (Math.random() * 0.15 + 0.9)).toFixed(2),
        image: "https://via.placeholder.com/100",
        url: "#",
        advantage: "Most popular"
      }
    ]
  };
}
