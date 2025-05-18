// Listen for theme change messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'THEME_CHANGED') {
        applyTheme(request.theme);
    }
});

// Apply theme to the current page
function applyTheme(theme) {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
}

// Load initial theme
chrome.storage.sync.get(['theme'], (result) => {
    if (result.theme) {
        applyTheme(result.theme);
    }
}); 