import React, { useState } from 'react';
import { Check, Star, X } from 'lucide-react';
import TermsContent from './TermsContent';
import PaymentPopup from './PaymentPopup';

const PricingSection: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  const plans = [
    {
      id: 'standard',
      name: 'Standard Pack',
      storage: '1TB',
      originalPrice: null,
      price: '₹ 9,999',
      popular: false,
      tagline: 'Best for beginners'
    },
    {
      id: 'studio',
      name: 'Studio Pack',
      storage: '2TB',
      originalPrice: '₹ 19,999',
      price: '₹ 18,999',
      popular: false,
      tagline: 'Best for intermediate users'
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      storage: '4TB',
      originalPrice: '₹ 39,999',
      price: '₹ 35,999',
      popular: true,
      tagline: 'Ideal for serious producers'
    },
    {
      id: 'ultimate',
      name: 'Ultimate Pack',
      storage: '8TB',
      originalPrice: '₹ 79,999',
      price: '₹ 60,999',
      popular: false,
      tagline: 'Most valuable pack — Limited time ₹49,999 offer!'
    }
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlan);

  return (
    <>
      <section className="py-12 sm:py-16 lg:py-20 bg-black">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-left mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your <span className="text-yellow-400">Perfect Package</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">
              Select the plan that fits your music production needs
            </p>
          </div>

          <div className="max-w-4xl mx-auto flex flex-col items-start bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl w-full">
            <div className="w-full space-y-4 sm:space-y-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
                    selectedPlan === plan.id
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  } ${plan.popular ? 'ring-2 ring-yellow-400/50' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 w-full">
                    <div className="flex items-start space-x-3 w-full">
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                          selectedPlan === plan.id
                            ? 'border-yellow-400 bg-yellow-400'
                            : 'border-gray-400'
                        }`}
                      >
                        {selectedPlan === plan.id && (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                        )}
                      </div>
                      <div className="flex flex-col items-start text-left space-y-0.5">
                        <h3 className="text-base sm:text-xl font-bold text-white">
                          {plan.name}: {plan.storage}
                        </h3>
                        <p
                          className={`text-xs sm:text-sm text-yellow-300 ${
                            plan.id === 'ultimate' ? 'blinking-offer' : ''
                          }`}
                        >
                          {plan.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="pl-8 sm:pl-0 mt-1 sm:mt-0 w-full sm:w-auto text-left">
                      {plan.originalPrice && (
                        <div className="text-gray-400 line-through text-sm">
                          {plan.originalPrice}
                        </div>
                      )}
                      <div className="text-xl sm:text-2xl font-bold text-yellow-400 whitespace-nowrap">
                        {plan.price}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="w-full mt-6 sm:mt-8 flex flex-col items-start text-left space-y-5">
              <div className="w-full">
                <label className="block text-white font-semibold mb-2">Enter your email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start text-left gap-2">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-400"
                />
                <p className="text-gray-300 text-sm">
                  I agree to{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    terms & conditions
                  </button>
                </p>
              </div>

              <button
                disabled={!email || !agreedToTerms}
                onClick={() => setShowPaymentPopup(true)}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xl rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative p-6">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X className="w-6 h-6" />
            </button>
            <TermsContent
              onAgree={() => {
                setAgreedToTerms(true);
                setShowTermsModal(false);
              }}
            />
          </div>
        </div>
      )}

      {showPaymentPopup && currentPlan && (
        <PaymentPopup
          onClose={() => setShowPaymentPopup(false)}
          email={email}
          selectedPlan={currentPlan}
        />
      )}
    </>
  );
};

export default PricingSection;
