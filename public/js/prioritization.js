
// Prioritization options functionality
import { refreshAlternativeProducts } from './alternative-products.js';

// Initialize prioritization options
export function initializePrioritization() {
  const prioritizePrice = document.getElementById('prioritize-price');
  const prioritizeReviews = document.getElementById('prioritize-reviews');
  const prioritizeShipping = document.getElementById('prioritize-shipping');
  const prioritizeBalanced = document.getElementById('prioritize-balanced');
  
  // Load saved prioritization mode
  chrome.storage.sync.get('prioritizeBy', function(data) {
    const mode = data.prioritizeBy || 'balanced';
    updatePrioritization(mode);
  });

  // Add listeners to the prioritize by options
  prioritizePrice.addEventListener('change', function() {
    updatePrioritization('price');
  });

  prioritizeReviews.addEventListener('change', function() {
    updatePrioritization('reviews');
  });

  prioritizeShipping.addEventListener('change', function() {
    updatePrioritization('shipping');
  });

  prioritizeBalanced.addEventListener('change', function() {
    updatePrioritization('balanced');
  });
}

// Function to update active class and handle prioritization
export function updatePrioritization(mode) {
  const prioritizePrice = document.getElementById('prioritize-price');
  const prioritizeReviews = document.getElementById('prioritize-reviews');
  const prioritizeShipping = document.getElementById('prioritize-shipping');
  const prioritizeBalanced = document.getElementById('prioritize-balanced');

  // Remove active class from all options
  [prioritizePrice, prioritizeReviews, prioritizeShipping, prioritizeBalanced].forEach(option => {
    if (option && option.parentElement) {
      option.parentElement.classList.remove('active-option');
    }
  });
  
  // Add active class to the selected option
  let selectedOption;
  switch(mode) {
    case 'price':
      selectedOption = prioritizePrice;
      break;
    case 'reviews':
      selectedOption = prioritizeReviews;
      break;
    case 'shipping':
      selectedOption = prioritizeShipping;
      break;
    default:
      selectedOption = prioritizeBalanced;
  }
  
  if (selectedOption && selectedOption.parentElement) {
    selectedOption.parentElement.classList.add('active-option');
  }
  
  // Update storage and refresh any visible alternative products
  chrome.storage.sync.set({ 'prioritizeBy': mode });
  refreshAlternativeProducts(mode);
  
  // Update the description for balanced mode
  if (mode === 'balanced') {
    const descriptionElement = document.querySelector('.content .section:nth-child(2) p');
    if (descriptionElement) {
      descriptionElement.textContent = 'A smart mix of price, speed, quality, and reviews.';
    }
  }
}
