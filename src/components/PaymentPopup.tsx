import React, { useState } from 'react';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { X, Copy, CreditCard, Tag, Check, AlertCircle } from 'lucide-react';
import SuccessPopup from './SuccessPopup';
import { motion, AnimatePresence } from "framer-motion";

interface PaymentPopupProps {
  onClose: () => void;
  email: string;
  selectedPlan: {
    name: string;
    storage: string;
    price: string;
  };
}

interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minAmount?: number;
  description: string;
}

const VALID_COUPONS: Coupon[] = [
  { code: 'STUD20', discount: 20, type: 'percentage', description: '20% off on all plans' },
  { code: 'WELCOME10', discount: 10, type: 'percentage', description: '10% welcome discount' },
  { code: 'STUDENT15', discount: 15, type: 'percentage', description: '15% student discount' },
  { code: 'FIRST50', discount: 50, type: 'percentage', minAmount: 10000, description: '50% off for orders above ₹10,000' },
];

const PaymentPopup: React.FC<PaymentPopupProps> = ({ onClose, email, selectedPlan }) => {
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState({
    plan: '',
    amount: '',
    transactionId: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const upiId = '9710404619@idfcfirst';
  const apiBase = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');

  const originalPrice = parseInt(selectedPlan.price.replace(/[₹,]/g, '').trim());
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.round(originalPrice * appliedCoupon.discount / 100)
      : appliedCoupon.discount
    : 0;
  const finalPrice = originalPrice - discountAmount;

  const handleCopy = () => navigator.clipboard.writeText(upiId);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    await new Promise(resolve => setTimeout(resolve, 800));
    const normalizedCode = couponCode.trim().toUpperCase();
    const coupon = VALID_COUPONS.find(c => c.code === normalizedCode);

    if (!coupon) {
      setCouponError('Invalid coupon code');
      setCouponLoading(false);
      return;
    }

    if (coupon.minAmount && originalPrice < coupon.minAmount) {
      setCouponError(`Minimum order of ₹${coupon.minAmount.toLocaleString()} required`);
      setCouponLoading(false);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponError('');
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleConfirmPayment = async () => {
    if (!transactionId.trim()) return;
    setIsSubmitting(true);
    const normalizedId = transactionId.trim().toLowerCase();

    try {
      const { data: existing } = await axios.get(`${apiBase}/payments?transactionId=${normalizedId}`);
      if (Array.isArray(existing) && existing.length > 0) {
        alert('❌ Transaction ID already used.');
        setIsSubmitting(false);
        return;
      }

      const orderId = `ORD-${Date.now()}`;
      const finalPriceStr = finalPrice.toString();

      const paymentData = {
        email,
        plan: selectedPlan.name,
        storage: selectedPlan.storage,
        price: `₹${finalPrice.toLocaleString()}`,
        originalPrice: selectedPlan.price,
        couponCode: appliedCoupon?.code || null,
        discountAmount: discountAmount,
        transactionId: normalizedId,
        timestamp: new Date().toISOString()
      };

      await axios.post(`${apiBase}/payments`, paymentData);

      await emailjs.send(
        'service_qnqab1c',
        'template_yfrfahd',
        {
          email,
          order_id: orderId,
          orders: [
            {
              name: selectedPlan.name,
              units: 1,
              price: finalPriceStr,
              originalPrice: selectedPlan.price.replace(/[₹,]/g, '').trim(),
              couponCode: appliedCoupon?.code || '',
              discount: discountAmount,
              timestamp: new Date().toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            }
          ],
          cost: {
            shipping: 0,
            tax: 0,
            total: finalPriceStr,
            originalTotal: selectedPlan.price.replace(/[₹,]/g, '').trim(),
            savings: discountAmount
          }
        },
        '7T1_Ty4C7WFeI74xF'
      );

      setSuccessData({
        plan: selectedPlan.name,
        amount: `₹${finalPrice.toLocaleString()}`,
        transactionId: normalizedId
      });

      setTransactionId('');
      setShowSuccessPopup(true);
    } catch (err: any) {
      console.error('Payment error:', err);
      alert(err.response?.status === 409
        ? '❌ Transaction ID already exists.'
        : 'Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessPopup(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center px-4 py-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative border border-gray-700 text-white p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center mb-6 mt-2">
            <div className="bg-yellow-400 p-2 rounded-full mb-2">
              <CreditCard className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-xl font-bold">Complete Payment</h2>
            <p className="text-sm text-gray-400 text-center">Scan QR or use UPI ID to pay</p>
          </div>

           
     
 
 
 
{/* Coupon Section - Slide + Bounce Motion */}
<motion.div
  initial={{ opacity: 0, x: 60 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -60 }}
  transition={{ type: "spring", stiffness: 120, damping: 15 }}
  className="my-8 p-6  rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900/80 via-gray-800/90 to-gray-900/80 shadow-2xl"
>
  {/* Header */}
  <motion.div
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.2, type: "spring" }}
    className="flex items-center gap-2 mb-6"
  >
    <Tag className="w-5 h-5 text-green-400" />
    <h4 className="text-lg font-semibold text-white tracking-wide">Coupon Code</h4>
  </motion.div>

  {/* Input + Button */}
  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
    <motion.input
      whileFocus={{ scale: 1.05, boxShadow: "0px 0px 12px rgba(34,197,94,0.5)" }}
      type="text"
      placeholder="e.g., SAVE20"
      value={couponCode}
      onChange={(e) => {
        setCouponCode(e.target.value.toUpperCase());
        setCouponError('');
        setAppliedCoupon(null);
      }}
      className="flex-1 px-4 py-3 rounded-xl bg-gray-950/80 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none transition disabled:opacity-50"
      disabled={couponLoading || !!appliedCoupon}
    />

    {!appliedCoupon ? (
      <motion.button
        whileHover={{ scale: 1.08, rotate: 1 }}
        whileTap={{ scale: 0.92, rotate: -1 }}
        onClick={handleApplyCoupon}
        disabled={!couponCode.trim() || couponLoading}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold text-sm shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {couponLoading ? (
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="inline-block"
          >
            ⏳
          </motion.span>
        ) : (
          'Apply'
        )}
      </motion.button>
    ) : (
      <motion.button
        whileHover={{ scale: 1.08, rotate: -1 }}
        whileTap={{ scale: 0.92, rotate: 1 }}
        onClick={handleRemoveCoupon}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-sm shadow-lg transition"
      >
        Remove
      </motion.button>
    )}
  </div>

  {/* Success */}
  <AnimatePresence>
    {appliedCoupon && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 180, damping: 12 }}
        className="mt-5 flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30"
      >
        <Check className="w-5 h-5 text-green-400" />
        <p className="text-sm text-green-300">
          Coupon <span className="font-semibold">{appliedCoupon.code}</span> applied 🎉  
          You saved <span className="font-bold">₹{discountAmount.toLocaleString()}</span>.
        </p>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Error */}
  <AnimatePresence>
    {couponError && (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="mt-5 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
      >
        <AlertCircle className="w-5 h-5 text-red-400" />
        <p className="text-sm text-red-300">{couponError}</p>
      </motion.div>
    )}
  </AnimatePresence>
</motion.div>







          <div className="bg-[#131A22] rounded-xl p-4 mb-6 border border-gray-700">
            <h3 className="text-yellow-400 font-bold text-sm mb-4">Order Summary</h3>
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Package:</span>
              <span className="text-white">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Storage:</span>
              <span className="text-white">{selectedPlan.storage}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mb-3">
              <span>Email:</span>
              <span className="text-white break-all">{email}</span>
            </div>
            <hr className="border-gray-700 my-2" />
            <div className="flex justify-between text-sm text-gray-400 mt-3">
              <span>Subtotal:</span>
              <span className="text-white">₹{originalPrice.toLocaleString()}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-400 mt-1">
                <span>Discount ({appliedCoupon.code}):</span>
                <span>-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-sm mt-3 pt-2 border-t border-gray-700">
              <span className="text-gray-400">Total Amount:</span>
              <div className="flex flex-col items-end">
                {appliedCoupon && (
                  <span className="text-xs text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
                )}
                <span className="text-yellow-400">₹{finalPrice.toLocaleString()}</span>
              </div>
            </div>
            {appliedCoupon && (
              <div className="text-xs text-green-400 text-right mt-1">
                You save ₹{discountAmount.toLocaleString()}!
              </div>
            )}
          </div>

          <div className="flex justify-center mb-4">
            <img src="/scanner.png" alt="QR Code" className="w-40 h-40 rounded-lg" />
          </div>
          <p className="text-center text-sm text-gray-400 mb-4">Scan with any UPI app to pay</p>

          <div className="bg-gray-800 rounded-md px-3 py-2 flex items-center justify-between mb-4 border border-gray-700">
            <span className="text-sm text-blue-400 font-mono">{upiId}</span>
            <button onClick={handleCopy} className="text-sm text-white hover:text-yellow-400">
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full px-4 py-2 mb-4 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
          />

          <button
            onClick={handleConfirmPayment}
            disabled={!transactionId.trim() || isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing…' : `Pay ₹${finalPrice.toLocaleString()}`}
          </button>
        </div>
      </div>

      {showSuccessPopup && (
        <SuccessPopup
          onClose={handleCloseSuccess}
          plan={successData.plan}
          amount={successData.amount}
          transactionId={successData.transactionId}
        />
      )}
    </>
  );
};

export default PaymentPopup;
