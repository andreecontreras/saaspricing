import React from 'react';
import { ArrowLeft, Shield, Lock, AlertTriangle, FileCheck, UserX, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
            {/* Header with animated gradient */}
            <div className="bg-black text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 animate-gradient"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <Link to="/" className="inline-flex items-center text-white hover:text-gray-200 mb-8 group">
                        <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-4 mb-6">
                        <Scale className="h-10 w-10 text-purple-400" />
                        <h1 className="text-5xl font-bold">Terms of Service</h1>
                    </div>
                    <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">Please read these terms carefully before using Scout.io. Your use of the service constitutes acceptance of these terms.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                {/* Quick Overview Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    {[
                        { icon: <FileCheck className="h-6 w-6" />, title: "Agreement", desc: "Terms you accept" },
                        { icon: <Lock className="h-6 w-6" />, title: "License", desc: "Usage rights" },
                        { icon: <Shield className="h-6 w-6" />, title: "Protection", desc: "Your obligations" },
                        { icon: <AlertTriangle className="h-6 w-6" />, title: "Liability", desc: "Legal boundaries" }
                    ].map((item, i) => (
                        <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                            <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-purple-600">
                                {item.icon}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-8">
                    <section className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <h2 className="text-2xl font-bold text-black mb-8 flex items-center gap-3">
                            <span className="bg-purple-50 p-2 rounded-lg">
                                <FileCheck className="h-6 w-6 text-purple-600" />
                            </span>
                            Acceptance of Terms
                        </h2>
                        <div className="space-y-6">
                            <div className="p-6 bg-purple-50/50 rounded-xl border border-purple-100">
                                <p className="text-gray-700 leading-relaxed">By installing and using Scout.io, you agree to these Terms of Service. If you do not agree to these terms, please uninstall the extension and discontinue its use.</p>
                                <p className="text-gray-700 leading-relaxed mt-4">We reserve the right to update these terms at any time. Continued use of Scout.io after changes constitutes acceptance of the new terms.</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <h2 className="text-2xl font-bold text-black mb-8 flex items-center gap-3">
                            <span className="bg-blue-50 p-2 rounded-lg">
                                <Lock className="h-6 w-6 text-blue-600" />
                            </span>
                            License and Usage
                        </h2>
                        <div className="space-y-6">
                            <p className="text-gray-600 text-lg">Scout.io grants you a limited, non-exclusive, non-transferable license to:</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { title: "Personal Use", desc: "Install and use the extension for non-commercial purposes", icon: <UserX className="h-5 w-5" /> },
                                    { title: "Price Comparison", desc: "Access our price comparison and analysis features", icon: <Scale className="h-5 w-5" /> },
                                    { title: "Notifications", desc: "Receive price drop and product alerts", icon: <AlertTriangle className="h-5 w-5" /> },
                                    { title: "Recommendations", desc: "View personalized product suggestions", icon: <FileCheck className="h-5 w-5" /> }
                                ].map((item, i) => (
                                    <div key={i} className="group flex items-start p-6 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:border-blue-100 transition-colors duration-300">
                                        <div className="mr-4 p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                            <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <h2 className="text-2xl font-bold text-black mb-8 flex items-center gap-3">
                            <span className="bg-red-50 p-2 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </span>
                            User Responsibilities
                        </h2>
                        <div className="space-y-6">
                            <p className="text-gray-600 text-lg">You agree not to:</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { title: "Modification", desc: "Modify, reverse engineer, or decompile the extension" },
                                    { title: "Misuse", desc: "Use the service for any illegal or unauthorized purposes" },
                                    { title: "Security", desc: "Attempt to bypass any security measures" },
                                    { title: "Distribution", desc: "Share or distribute the extension without permission" },
                                    { title: "Automation", desc: "Use automated systems to access the service" }
                                ].map((item, i) => (
                                    <div key={i} className="group flex items-start p-6 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:border-red-100 transition-colors duration-300">
                                        <span className="h-2 w-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                            <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg p-10 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                        <div className="relative">
                            <h2 className="text-3xl font-bold mb-8">Disclaimer</h2>
                            <div className="space-y-8">
                                <p className="text-gray-300 text-lg">Scout.io is provided "as is" without warranties of any kind. We do not guarantee:</p>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {[
                                        { title: "Price Accuracy", desc: "100% accuracy of prices and information" },
                                        { title: "Service Uptime", desc: "Uninterrupted service availability" },
                                        { title: "Performance", desc: "Error-free operation at all times" },
                                        { title: "Features", desc: "Continuous availability of all features" }
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-purple-400"></span>
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10 flex items-center gap-6">
                                    <a href="mailto:legal@scout.io" className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                                        <Scale className="h-5 w-5" />
                                        Contact Legal Team
                                    </a>
                                    <a href="#" className="text-white hover:text-purple-400 transition-colors inline-flex items-center gap-2">
                                        View Full Terms
                                        <ArrowLeft className="h-4 w-4 rotate-180" />
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

export default Terms; 