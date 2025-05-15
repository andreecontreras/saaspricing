import { useState } from 'react';
import PopupPreview from './components/PopupPreview';
import { Toaster } from "@/components/ui/toaster";
import './App.css';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="app">
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black mb-2">Scout.io</h1>
            <p className="text-gray-600">Your browser extension for smarter shopping</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-black rounded-lg text-white">
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

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-md font-medium text-black mb-2">Key Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center text-green-600">
                  <span className="mr-2">•</span>
                  Find better prices across multiple sites
                </li>
                <li className="flex items-center text-black">
                  <span className="mr-2">•</span>
                  Compare product reviews and quality ratings
                </li>
                <li className="flex items-center text-green-600">
                  <span className="mr-2">•</span>
                  Get notified about price drops
                </li>
                <li className="flex items-center text-black">
                  <span className="mr-2">•</span>
                  View shipping times at a glance
                </li>
                <li className="flex items-center text-green-600">
                  <span className="mr-2">•</span>
                  Smart product recommendations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <PopupPreview open={open} onOpenChange={setOpen} />
      <Toaster />
    </div>
  );
}

export default App;
