import React from 'react';
import { ArrowLeft, MessageCircle, Lightbulb, HelpCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import '../styles/animations.css';

const Help = () => {
    useScrollReveal();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-black text-white py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 animate-gradientFlow"></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <Link to="/" className="inline-flex items-center text-white hover:text-gray-200 mb-6 group animate-fadeInLeft">
                        <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold mb-4 animate-fadeInUp">How can we help you?</h1>
                    <p className="text-gray-300 text-lg max-w-2xl animate-fadeInUp delay-200">Find answers to common questions and learn how to make the most of Scout.io</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                {/* Search Box */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-12 transform -translate-y-4 hover:shadow-xl transition-all duration-300 animate-scaleIn">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for help..."
                            className="w-full pl-4 pr-12 py-4 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                        />
                        <Send className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500 cursor-pointer transition-colors" />
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid md:grid-cols-3 gap-6 mb-12 stagger-children">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm hover-lift hover-glow [--glow-color:34_197_94]">
                        <MessageCircle className="h-8 w-8 text-green-600 mb-4" />
                        <h3 className="font-semibold text-lg mb-2">Live Chat Support</h3>
                        <p className="text-gray-600">Get help from our team in real-time</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm hover-lift hover-glow [--glow-color:59_130_246]">
                        <Lightbulb className="h-8 w-8 text-blue-600 mb-4" />
                        <h3 className="font-semibold text-lg mb-2">Tips & Tricks</h3>
                        <p className="text-gray-600">Learn how to use Scout.io like a pro</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm hover-lift hover-glow [--glow-color:147_51_234]">
                        <HelpCircle className="h-8 w-8 text-purple-600 mb-4" />
                        <h3 className="font-semibold text-lg mb-2">FAQs</h3>
                        <p className="text-gray-600">Find answers to common questions</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-8 pb-16">
                    <section className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-8 reveal-on-scroll">
                        <h2 className="text-2xl font-bold text-black mb-6">Getting Started</h2>
                        <div className="space-y-6 stagger-children">
                            <div className="border-l-4 border-green-500 pl-6">
                                <h3 className="font-semibold text-lg text-gray-900">How to Use Scout.io</h3>
                                <p className="mt-2 text-gray-600 leading-relaxed">Scout.io automatically activates when you visit supported shopping websites. Look for the Scout.io icon in your browser's toolbar to access features and settings.</p>
                            </div>
                            <div className="border-l-4 border-blue-500 pl-6">
                                <h3 className="font-semibold text-lg text-gray-900">Features Overview</h3>
                                <ul className="mt-2 space-y-3 text-gray-600">
                                    <li className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-green-500 mr-3"></span>
                                        Price comparison across multiple retailers
                                    </li>
                                    <li className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-3"></span>
                                        Product quality and review analysis
                                    </li>
                                    <li className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-purple-500 mr-3"></span>
                                        Shipping time estimates
                                    </li>
                                    <li className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-red-500 mr-3"></span>
                                        Price drop notifications
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-8 reveal-on-scroll">
                        <h2 className="text-2xl font-bold text-black mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-6 stagger-children">
                            <div className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <h3 className="font-semibold text-lg text-gray-900">How accurate are the prices?</h3>
                                <p className="mt-2 text-gray-600">We update prices in real-time and verify them across multiple sources to ensure accuracy.</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <h3 className="font-semibold text-lg text-gray-900">How do I enable price drop notifications?</h3>
                                <p className="mt-2 text-gray-600">Click the Scout.io icon, select "Display Options," and enable "Notify on Price Drops" for products you're interested in.</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <h3 className="font-semibold text-lg text-gray-900">Which retailers are supported?</h3>
                                <p className="mt-2 text-gray-600">We currently support major retailers including Walmart, with plans to expand to more stores soon.</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg p-8 text-white reveal-on-scroll">
                        <h2 className="text-2xl font-bold mb-6">Need More Help?</h2>
                        <p className="text-gray-300 mb-6">Our support team is available 24/7 to assist you with any questions or concerns.</p>
                        <div className="flex items-center space-x-4">
                            <a href="mailto:support@scout.io" className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors hover-lift">
                                Contact Support
                            </a>
                            <a href="#" className="text-white hover:text-gray-300 transition-colors group">
                                View Documentation <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Help; 