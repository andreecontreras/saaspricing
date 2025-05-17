import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PopupPreview from './components/PopupPreview';
import { Toaster } from "@/components/ui/toaster";
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ProductDemo from './pages/ProductDemo';
import SettingsPage from './pages/SettingsPage';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/demo" element={<ProductDemo />} />
            <Route path="/" element={
              <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Scout.io</h1>
                    <p className="text-gray-600 dark:text-gray-300">Your browser extension for smarter shopping</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-black text-white rounded-lg">
                      <div>
                        <h2 className="text-lg font-semibold">Browser Extension Preview</h2>
                        <p className="text-sm text-gray-200">See how it works in action</p>
                      </div>
                      <button
                        onClick={() => setOpen(true)}
                        className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-100 transition-colors"
                      >
                        View Demo
                      </button>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <h3 className="text-md font-medium text-black dark:text-white mb-2">Key Features</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center text-green-600 dark:text-green-400">
                          <span className="mr-2">•</span>
                          Find better prices across multiple sites
                        </li>
                        <li className="flex items-center text-black dark:text-white">
                          <span className="mr-2">•</span>
                          Compare product reviews and quality ratings
                        </li>
                        <li className="flex items-center text-green-600 dark:text-green-400">
                          <span className="mr-2">•</span>
                          Get notified about price drops
                        </li>
                        <li className="flex items-center text-black dark:text-white">
                          <span className="mr-2">•</span>
                          View shipping times at a glance
                        </li>
                        <li className="flex items-center text-green-600 dark:text-green-400">
                          <span className="mr-2">•</span>
                          Smart product recommendations
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            } />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>

          <PopupPreview open={open} onOpenChange={setOpen} />
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
