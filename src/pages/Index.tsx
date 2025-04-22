
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading the extension files
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <Toaster position="top-center" />
      
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full">
        <div className="flex items-center mb-8">
          <div className="bg-savvy-purple p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Savvy Shop Whisper</h1>
            <p className="text-gray-600">Chrome Extension Development Project</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Installation Instructions</h2>
          
          <div className="space-y-4">
            <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-50'}`}>
              <div className="flex items-center mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${isLoaded ? 'bg-savvy-green text-white' : 'bg-gray-200'}`}>
                  {isLoaded ? '✓' : '1'}
                </div>
                <span className="font-medium">Building extension files</span>
              </div>
              <div className="ml-9 text-sm text-gray-600">All required extension files have been created</div>
            </div>

            <div className="opacity-100">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-savvy-purple text-white flex items-center justify-center mr-3">
                  2
                </div>
                <span className="font-medium">Load the extension in Chrome</span>
              </div>
              <div className="ml-9 text-sm text-gray-600">
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Open Chrome and navigate to <code className="bg-gray-100 px-1 rounded">chrome://extensions</code></li>
                  <li>Enable "Developer mode" in the top-right corner</li>
                  <li>Click "Load unpacked" and select the <code className="bg-gray-100 px-1 rounded">/public</code> folder from this project</li>
                </ol>
              </div>
            </div>

            <div className="opacity-80">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center mr-3">
                  3
                </div>
                <span className="font-medium">Test the extension</span>
              </div>
              <div className="ml-9 text-sm text-gray-600">
                Visit one of the supported sites to see the extension in action:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Amazon.com</li>
                  <li>BestBuy.com</li>
                  <li>Walmart.com</li>
                  <li>Target.com</li>
                  <li>eBay.com</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-violet-50 rounded-xl p-6 border border-violet-100">
            <h3 className="font-semibold text-savvy-purple mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              Key Features
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="bg-savvy-purple/10 text-savvy-purple p-1 rounded mr-2 mt-0.5">✓</span>
                Price comparison and history tracking
              </li>
              <li className="flex items-start">
                <span className="bg-savvy-purple/10 text-savvy-purple p-1 rounded mr-2 mt-0.5">✓</span>
                Review aggregation with sentiment analysis
              </li>
              <li className="flex items-start">
                <span className="bg-savvy-purple/10 text-savvy-purple p-1 rounded mr-2 mt-0.5">✓</span>
                Similar product recommendations
              </li>
              <li className="flex items-start">
                <span className="bg-savvy-purple/10 text-savvy-purple p-1 rounded mr-2 mt-0.5">✓</span>
                Trust scoring and price prediction
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="font-semibold text-savvy-blue mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="M12 8v4"></path>
                <path d="M12 16h.01"></path>
              </svg>
              Next Steps
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="bg-savvy-blue/10 text-savvy-blue p-1 rounded mr-2 mt-0.5">1</span>
                Connect to Apify for product data scraping
              </li>
              <li className="flex items-start">
                <span className="bg-savvy-blue/10 text-savvy-blue p-1 rounded mr-2 mt-0.5">2</span>
                Integrate Hugging Face for AI review analysis
              </li>
              <li className="flex items-start">
                <span className="bg-savvy-blue/10 text-savvy-blue p-1 rounded mr-2 mt-0.5">3</span>
                Implement subscription payment processing
              </li>
              <li className="flex items-start">
                <span className="bg-savvy-blue/10 text-savvy-blue p-1 rounded mr-2 mt-0.5">4</span>
                Deploy to Chrome Web Store
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-gray-500 text-sm">
        Savvy Shop Whisper &copy; {new Date().getFullYear()} | Chrome Extension Version 0.1.0
      </p>
    </div>
  );
};

export default Index;
