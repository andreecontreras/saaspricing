
// Background service worker for Scout.io Chrome Extension
import { initApifyIntegration, searchProductPrices, processScrapedData, quickScrapeProductURL } from './apify-integration.js';

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
    apifyApiKey: '' // Initialize empty Apify API key
  });
  
  // Initialize Apify integration
  initApifyIntegration();
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PRODUCT_DETECTED') {
    handleProductDetection(message.data, sender.tab.id);
    sendResponse({ success: true });
    return true; // Keep the messaging channel open for async response
  } else if (message.type === 'GET_SUBSCRIPTION_STATUS') {
    getSubscriptionStatus().then(sendResponse);
    return true; // Keep the messaging channel open for async response
  } else if (message.type === 'SAVE_APIFY_API_KEY') {
    saveApifyApiKey(message.apiKey).then(sendResponse);
    return true; // Keep the messaging channel open for async response
  } else if (message.type === 'SCRAPE_PRODUCT_URL') {
    scrapeProductURL(message.url, sender.tab.id)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the messaging channel open for async response
  }
});

// Save Apify API key
async function saveApifyApiKey(apiKey) {
  try {
    await chrome.storage.sync.set({ apifyApiKey: apiKey });
    await initApifyIntegration();
    return { success: true };
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
    // Notify content script that product analysis has started
    chrome.tabs.sendMessage(tabId, {
      type: 'PRODUCT_ANALYSIS_STATUS',
      status: 'started',
      message: 'Analyzing product across multiple stores...'
    });
    
    // Use Apify to search for product prices
    const scrapedData = await searchProductPrices(productData);
    let processedData = null;
    
    if (scrapedData) {
      processedData = processScrapedData(scrapedData, productData);
    }
    
    // If we got real data from Apify, use it; otherwise, use mock data
    const mockResult = generateMockProductData(productData);
    let finalResult = {...mockResult};
    
    // Replace mock price data with real data if available
    if (processedData && processedData.lowestPrice) {
      finalResult.priceData.lowestPrice = processedData.lowestPrice;
      finalResult.priceData.allPrices = processedData.allPrices || [processedData.lowestPrice];
      
      // Update price history to show some realistic variation
      const lowestPrice = processedData.lowestPrice.price;
      finalResult.priceData.priceHistory = [
        { date: "Jan", price: lowestPrice * 1.1 },
        { date: "Feb", price: lowestPrice * 1.05 },
        { date: "Mar", price: lowestPrice * 1.15 },
        { date: "Apr", price: lowestPrice * 1.1 },
        { date: "May", price: lowestPrice },
        { date: "Jun", price: lowestPrice * 0.95 }
      ];
    }
    
    // Notify content script of completion status
    chrome.tabs.sendMessage(tabId, {
      type: 'PRODUCT_ANALYSIS_STATUS',
      status: 'completed',
      message: processedData ? 'Found price data from multiple stores' : 'Using estimated price data'
    });
    
    // Send the processed data back to the content script
    chrome.tabs.sendMessage(tabId, {
      type: 'PRODUCT_DATA_READY',
      data: finalResult
    });
    
  } catch (error) {
    console.error('Error handling product detection:', error);
    
    // Notify content script of error
    chrome.tabs.sendMessage(tabId, {
      type: 'PRODUCT_ANALYSIS_STATUS',
      status: 'error',
      message: `Error: ${error.message}`
    });
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
