import React from 'react';
import ProductActions from '../components/ProductActions';

const ProductDemo = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Demo Product Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-scaleIn">
                    <div className="flex gap-8">
                        {/* Product Image */}
                        <div className="w-64 h-64 bg-gray-100 rounded-xl animate-pulse"></div>

                        {/* Product Info */}
                        <div className="flex-1 space-y-4">
                            <h1 className="text-2xl font-bold">Demo Product</h1>
                            <p className="text-gray-600">
                                This is a demo product to showcase the Trust Scores and Similar Products
                                features with beautiful animations.
                            </p>
                            <div className="text-3xl font-bold text-blue-600">$199.99</div>
                        </div>
                    </div>
                </div>

                {/* Product Actions */}
                <ProductActions />
            </div>
        </div>
    );
};

export default ProductDemo; 