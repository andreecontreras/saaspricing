import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Zap, Star, Crown } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for getting started',
        features: [
            '100 searches per month',
            'Basic price tracking',
            'Email notifications',
            'Browser extension'
        ],
        icon: <Zap className="w-5 h-5" />,
        color: 'gray'
    },
    {
        name: 'Pro',
        price: '$9',
        period: 'per month',
        description: 'Best for power users',
        features: [
            'Unlimited searches',
            'Advanced price analytics',
            'Priority notifications',
            'API access',
            'Premium support',
            'Custom alerts'
        ],
        icon: <Star className="w-5 h-5" />,
        color: 'blue',
        popular: true
    },
    {
        name: 'Enterprise',
        price: '$29',
        period: 'per month',
        description: 'For teams and businesses',
        features: [
            'Everything in Pro',
            'Team collaboration',
            'Advanced analytics',
            'Custom integrations',
            'Dedicated support',
            'SLA guarantee'
        ],
        icon: <Crown className="w-5 h-5" />,
        color: 'purple'
    }
];

const PlanUpgradePage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState('Free');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpgrade = async (planName: string) => {
        setIsProcessing(true);
        try {
            // Here you would typically make an API call to handle the upgrade
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
            navigate('/settings');
        } catch (error) {
            console.error('Failed to upgrade plan:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Settings
                    </button>
                </div>

                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Select the perfect plan for your needs
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${plan.popular ? 'ring-2 ring-blue-500' : ''
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                                    Popular
                                </div>
                            )}

                            <div className="p-8">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-${plan.color}-100 text-${plan.color}-600 mb-4`}>
                                    {plan.icon}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline mb-2">
                                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                                    <span className="ml-2 text-gray-500">/{plan.period}</span>
                                </div>
                                <p className="text-gray-500 mb-6">{plan.description}</p>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <Check className={`w-5 h-5 text-${plan.color}-500 mr-2 mt-0.5`} />
                                            <span className="text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleUpgrade(plan.name)}
                                    disabled={isProcessing || plan.name === selectedPlan}
                                    className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-colors
                                        ${plan.name === selectedPlan
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : `bg-${plan.color}-600 text-white hover:bg-${plan.color}-700`
                                        }`}
                                >
                                    {plan.name === selectedPlan
                                        ? 'Current Plan'
                                        : isProcessing
                                            ? 'Processing...'
                                            : `Upgrade to ${plan.name}`}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center text-sm text-gray-500">
                    <p>All plans include a 14-day money-back guarantee</p>
                    <p className="mt-2">Need help choosing? Contact our support team</p>
                </div>
            </div>
        </div>
    );
};

export default PlanUpgradePage; 