import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import '../styles/animations.css';

const Privacy = () => {
    useScrollReveal();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
            {/* Header with animated gradient */}
            <div className="bg-black text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 animate-gradientFlow"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <Link to="/" className="inline-flex items-center text-white hover:text-gray-200 mb-8 group animate-fadeInLeft">
                        <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-4 mb-6 animate-fadeInUp">
                        <Shield className="h-10 w-10 text-blue-400" />
                        <h1 className="text-5xl font-bold">Privacy Policy</h1>
                    </div>
                    <p className="text-gray-300 text-xl max-w-2xl leading-relaxed animate-fadeInUp delay-200">
                        We value your privacy and are committed to protecting your personal information with the highest standards of security and transparency.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                {/* Quick Overview Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-12 stagger-children">
                    {[
                        { icon: <Lock className="h-6 w-6" />, title: "Secure", desc: "End-to-end encryption" },
                        { icon: <Eye className="h-6 w-6" />, title: "Transparent", desc: "Clear data usage" },
                        { icon: <Database className="h-6 w-6" />, title: "Minimal", desc: "Only what's needed" },
                        { icon: <UserCog className="h-6 w-6" />, title: "Control", desc: "Your data, your rules" }
                    ].map((item, i) => (
                        <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover-lift hover-glow [--glow-color:59_130_246] border border-gray-100">
                            <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                                {item.icon}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-8">
                    <section className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 reveal-on-scroll">
                        <h2 className="text-2xl font-bold text-black mb-8 flex items-center gap-3">
                            <span className="bg-blue-50 p-2 rounded-lg">
                                <Database className="h-6 w-6 text-blue-600" />
                            </span>
                            Information We Collect
                        </h2>
                        <div className="space-y-6">
                            <p className="text-gray-600 text-lg leading-relaxed">We collect only the minimum information necessary to provide you with the best shopping experience:</p>
                            <div className="grid md:grid-cols-2 gap-4 mt-4 stagger-children">
                                {[
                                    { title: "Browsing History", desc: "Limited to supported shopping websites", color: "blue" },
                                    { title: "Product Preferences", desc: "Your watch list and saved items", color: "indigo" },
                                    { title: "Alert Settings", desc: "Your price and availability notifications", color: "violet" },
                                    { title: "Usage Statistics", desc: "Anonymous data to improve our service", color: "purple" }
                                ].map((item, i) => (
                                    <div key={i} className={`flex items-start p-6 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:border-blue-100 transition-colors duration-300 hover-lift`}>
                                        <span className={`h-2 w-2 rounded-full bg-${item.color}-500 mt-2 mr-3 flex-shrink-0`}></span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                            <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 reveal-on-scroll">
                        <h2 className="text-2xl font-bold text-black mb-8 flex items-center gap-3">
                            <span className="bg-green-50 p-2 rounded-lg">
                                <Lock className="h-6 w-6 text-green-600" />
                            </span>
                            How We Use Your Information
                        </h2>
                        <div className="space-y-6">
                            <p className="text-gray-600 text-lg">Your information is used exclusively for:</p>
                            <div className="grid md:grid-cols-2 gap-4 stagger-children">
                                {[
                                    { title: "Price Analysis", desc: "Providing accurate price comparisons and alerts", icon: <Database className="h-5 w-5" /> },
                                    { title: "Quality Assessment", desc: "Analyzing product reviews and ratings", icon: <Eye className="h-5 w-5" /> },
                                    { title: "Recommendations", desc: "Improving product suggestions", icon: <UserCog className="h-5 w-5" /> },
                                    { title: "Service Enhancement", desc: "Optimizing your shopping experience", icon: <Shield className="h-5 w-5" /> }
                                ].map((item, i) => (
                                    <div key={i} className="group flex items-start p-6 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:border-green-100 transition-colors duration-300 hover-lift">
                                        <div className="mr-4 p-2 rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                            <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100 animate-fadeInUp">
                                <p className="text-green-800 font-medium flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    We never sell your personal information to third parties.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg p-10 text-white relative overflow-hidden reveal-on-scroll">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 animate-shimmer"></div>
                        <div className="relative">
                            <h2 className="text-3xl font-bold mb-8">Your Privacy Rights</h2>
                            <div className="space-y-8">
                                <p className="text-gray-300 text-lg">You have complete control over your data and can exercise these rights at any time:</p>
                                <div className="grid sm:grid-cols-2 gap-6 stagger-children">
                                    {[
                                        { title: "Access Data", desc: "View your personal information" },
                                        { title: "Delete Data", desc: "Request complete data removal" },
                                        { title: "Opt Out", desc: "Stop data collection" },
                                        { title: "Modify", desc: "Update your preferences" }
                                    ].map((right, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors hover-lift">
                                            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                                                {right.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm">{right.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10 flex items-center gap-6">
                                    <a href="mailto:privacy@scout.io" className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors hover-lift inline-flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Contact Privacy Team
                                    </a>
                                    <a href="#" className="text-white hover:text-blue-400 transition-colors group inline-flex items-center gap-2">
                                        Learn More
                                        <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Privacy; 