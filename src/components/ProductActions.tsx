import React, { useState } from 'react';
import { Shield, Layers } from 'lucide-react';
import '../styles/animations.css';

interface TrustScore {
    overall: number;
    reviews: number;
    quality: number;
    seller: number;
}

const ProductActions = () => {
    const [showTrustScore, setShowTrustScore] = useState(false);
    const [showSimilar, setShowSimilar] = useState(false);

    const trustScore: TrustScore = {
        overall: 4.5,
        reviews: 4.2,
        quality: 4.7,
        seller: 4.6
    };

    return (
        <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={() => setShowTrustScore(!showTrustScore)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl 
                             hover-lift hover-glow [--glow-color:34_197_94] animate-scaleIn"
                >
                    <Shield className="h-5 w-5" />
                    Trust Scores
                </button>

                <button
                    onClick={() => setShowSimilar(!showSimilar)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl 
                             hover-lift hover-glow [--glow-color:59_130_246] animate-scaleIn delay-200"
                >
                    <Layers className="h-5 w-5" />
                    Similar Products
                </button>
            </div>

            {/* Trust Score Panel */}
            {showTrustScore && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 stagger-children animate-fadeInUp">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        Trust Score Analysis
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(trustScore).map(([key, value], index) => (
                            <div key={key} className="p-4 bg-gray-50 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                                <div className="text-sm text-gray-600 capitalize">{key}</div>
                                <div className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                                    {value}
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Similar Products Panel */}
            {showSimilar && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-fadeInUp">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Layers className="h-5 w-5 text-blue-600" />
                        Similar Products
                    </h3>
                    <div className="space-y-4 stagger-children">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                                <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div>
                                    <div className="font-medium">Product {item}</div>
                                    <div className="text-sm text-gray-600">$99.99</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductActions; 