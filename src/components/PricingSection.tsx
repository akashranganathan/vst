import React, { useEffect, useState } from "react";
import axios from "axios";
import { Check, Star, X, ChevronRight } from "lucide-react";
import TermsContent from "./TermsContent";
import PaymentPopup from "./PaymentPopup";

interface Plan {
  id: string;
  name: string;
  storage?: string;
  priceIndia: string;
  priceForeign: string;
  originalPrice?: string;
  tagline?: string;
  popular: boolean;
  features: string[];
}

const PricingSection: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [email, setEmail] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  const apiUrl = `${import.meta.env.VITE_API_BASE_URL?.replace(
    /\/+$/,
    ""
  )}/api/plans`;

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(apiUrl);
        let fetchedPlans: Plan[] = Array.isArray(res.data) ? res.data : [];

        // SAFE SORTING – prevents crash if priceIndia is missing/empty
        fetchedPlans = fetchedPlans.sort((a, b) => {
          const getNumericPrice = (priceStr: string | undefined): number => {
            if (!priceStr || typeof priceStr !== "string") return Infinity;
            const cleaned = priceStr.replace(/[^0-9.-]+/g, "").trim();
            const num = parseFloat(cleaned);
            return isNaN(num) ? Infinity : num;
          };

          const priceA = getNumericPrice(a.priceIndia);
          const priceB = getNumericPrice(b.priceIndia);

          return priceA - priceB;
        });

        setPlans(fetchedPlans);

        // Auto-select first plan (cheapest)
        if (fetchedPlans.length > 0 && !selectedPlan) {
          setSelectedPlan(fetchedPlans[0].id);
        }
      } catch (err) {
        console.error("Failed to load plans:", err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [apiUrl]);

  const currentPlan = plans.find((p) => p.id === selectedPlan);

  if (loading) {
    return (
      <section className="py-20 bg-black text-center">
        <p className="text-white text-xl">Loading plans...</p>
      </section>
    );
  }

  if (plans.length === 0) {
    return (
      <section className="py-20 bg-black text-center">
        <p className="text-gray-400 text-xl">
          No plans available at the moment.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="py-12 sm:py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Choose Your{" "}
              <span className="text-yellow-400">Perfect Package</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Best value for music producers worldwide
            </p>
          </div>

          {/* Plans Grid */}
          <div className="max-w-5xl mx-auto space-y-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 sm:p-8 rounded-2xl border-4 cursor-pointer transition-all hover:scale-105 ${
                  selectedPlan === plan.id
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-gray-700 bg-gray-800/70"
                } ${plan.popular ? "ring-4 ring-yellow-400/50" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full font-bold flex items-center gap-2">
                    <Star className="w-5 h-5" fill="currentColor" /> MOST
                    POPULAR
                  </div>
                )}

                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  {/* Left: Details + Features */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-6 h-6 shrink-0
 rounded-full border-4 flex items-center justify-center ${
   selectedPlan === plan.id
     ? "border-yellow-400 bg-yellow-400"
     : "border-gray-500"
 }`}
                      >
                        {selectedPlan === plan.id && (
                          <Check className="w-4 h-4 text-black" />
                        )}
                      </div>
                      <div>
                        <h3
                          className="text-2xl sm:text-3xl font-bold text-white -mt-[7px]
"
                        >
                          {plan.name}
                        </h3>
                        {plan.storage && (
                          <p className="text-gray-400 text-lg mt-1">
                            {plan.storage} Storage
                          </p>
                        )}
                        {plan.tagline && (
                          <p className="text-yellow-300 text-lg mt-2">
                            {plan.tagline}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Features List */}
                    {plan.features && plan.features.length > 0 && (
                      <ul className="mt-6 space-y-3 text-gray-300">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <ChevronRight className="w-5 h-5 text-yellow-400  animate-pulse shrink-0" />
                            <span
                              className="text-sm
"
                            >
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Right: Pricing */}
                  <div className="text-right">
                    {plan.originalPrice && (
                      <p className="text-gray-500 line-through text-lg mb-2">
                        {plan.originalPrice}
                      </p>
                    )}
                    <p className="text-3xl sm:text-4xl font-bold text-yellow-400">
                      India: {plan.priceIndia}
                    </p>
                    <p className="text-xl text-gray-300 mt-2">
                      Foreign: {plan.priceForeign}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Buy Section */}
          <div className="max-w-4xl mx-auto mt-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">
                Enter your email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-6 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />
            </div>

            <div className="flex items-start gap-3 mb-8">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-6 h-6 text-yellow-400 rounded mt-1 accent-yellow-400"
              />
              <p className="text-gray-300 text-sm">
                I agree to{" "}
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
              disabled={!email || !agreedToTerms || !currentPlan}
              onClick={() => setShowPaymentPopup(true)}
              className="w-full py-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-2xl rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
            >
              Buy Now – {currentPlan?.priceIndia || "Select a plan"}
            </button>
          </div>
        </div>
      </section>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-black"
            >
              <X className="w-8 h-8" />
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

      {/* Payment Popup */}
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
