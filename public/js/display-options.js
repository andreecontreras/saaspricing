
// Display options functionality
import { updateAlternativesSection } from './alternative-products.js';

// Initialize display options
export function initializeDisplayOptions() {
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
}
