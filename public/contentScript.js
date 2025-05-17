// Product detection patterns for different websites
const PRODUCT_PATTERNS = {
    'amazon.com': {
        titleSelector: '#productTitle',
        priceSelector: '.a-price-whole',
        imageSelector: '#landingImage',
        reviewSelector: '#acrPopover .a-text-bold'
    },
    'ebay.com': {
        titleSelector: '.x-item-title__mainTitle',
        priceSelector: '.x-price-primary',
        imageSelector: '.ux-image-carousel-item img',
        reviewSelector: '.reviews-star-rating'
    }
};

// State management
let currentProduct = null;
let observer = null;

// Initialize the content script
function initialize() {
    // Check if we're on a supported shopping site
    const hostname = window.location.hostname;
    if (!isShoppingWebsite(hostname)) {
        return;
    }

    // Set up mutation observer to detect dynamic content changes
    setupObserver();

    // Initial product detection
    detectProduct();
}

// Check if the current website is supported
function isShoppingWebsite(hostname) {
    return Object.keys(PRODUCT_PATTERNS).some(domain => hostname.includes(domain));
}

// Set up mutation observer to detect dynamic content changes
function setupObserver() {
    if (observer) {
        observer.disconnect();
    }

    observer = new MutationObserver(debounce(() => {
        detectProduct();
    }, 1000));

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Detect product information on the page
function detectProduct() {
    const hostname = window.location.hostname;
    const patterns = getPatterns(hostname);
    if (!patterns) return;

    try {
        const productInfo = {
            title: getElementText(patterns.titleSelector),
            price: extractPrice(getElementText(patterns.priceSelector)),
            image: getElementAttribute(patterns.imageSelector, 'src'),
            reviews: extractReviews(getElementText(patterns.reviewSelector)),
            url: window.location.href,
            timestamp: Date.now()
        };

        // Only update if product information has changed
        if (hasProductChanged(productInfo)) {
            currentProduct = productInfo;
            notifyBackgroundScript(productInfo);
        }
    } catch (error) {
        console.error('Error detecting product:', error);
    }
}

// Get patterns for the current website
function getPatterns(hostname) {
    return Object.entries(PRODUCT_PATTERNS).find(([domain]) => hostname.includes(domain))?.[1];
}

// Helper functions for DOM manipulation
function getElementText(selector) {
    const element = document.querySelector(selector);
    return element ? element.textContent.trim() : '';
}

function getElementAttribute(selector, attribute) {
    const element = document.querySelector(selector);
    return element ? element.getAttribute(attribute) : '';
}

// Extract and normalize price
function extractPrice(priceText) {
    if (!priceText) return null;
    const matches = priceText.match(/[\d,.]+/);
    return matches ? parseFloat(matches[0].replace(/,/g, '')) : null;
}

// Extract and normalize review score
function extractReviews(reviewText) {
    if (!reviewText) return null;
    const matches = reviewText.match(/[\d.]+/);
    return matches ? parseFloat(matches[0]) : null;
}

// Check if product information has significantly changed
function hasProductChanged(newProduct) {
    if (!currentProduct) return true;

    return (
        currentProduct.title !== newProduct.title ||
        currentProduct.price !== newProduct.price ||
        currentProduct.image !== newProduct.image ||
        currentProduct.reviews !== newProduct.reviews
    );
}

// Notify background script of product detection
function notifyBackgroundScript(productInfo) {
    chrome.runtime.sendMessage({
        type: 'PRODUCT_DETECTED',
        data: productInfo
    });
}

// Utility function to debounce frequent calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_PRODUCT_INFO') {
        sendResponse({ product: currentProduct });
        return true;
    }
});

// Initialize the content script
initialize(); 