import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { paymentApi } from '../../api/paymentApi.js';
import { loadRazorpay } from '../../utils/loadRazorpay.js';
import { FaMoneyBillWave } from 'react-icons/fa';

export const RazorpayButton = ({ amount, receipt, onSuccess, className, label = "Pay Now" }) => {
  const [loading, setLoading] = useState(false);

  const displayRazorpay = async () => {
    setLoading(true);
    try {
      const res = await loadRazorpay();

      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      const result = await paymentApi.createOrder({ amount, receipt });

      if (!result.data.success) {
        toast.error('Server error. Are you online?');
        setLoading(false);
        return;
      }

      const { amount: orderAmount, id: order_id, currency } = result.data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: orderAmount.toString(),
        currency,
        name: 'Kiran Dairy',
        description: 'Test Payment',
        order_id,
        handler: async function (response) {
          const verifyData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          try {
            const verifyResult = await paymentApi.verifyPayment(verifyData);
            if (verifyResult.data.success) {
              toast.success('Payment Successful!');
              if (onSuccess) {
                onSuccess(verifyData);
              }
            } else {
              toast.error('Payment Verification Failed!');
            }
          } catch (err) {
            console.error(err);
            toast.error('Payment Verification Error!');
          }
        },
        prefill: {
          name: 'Demo User',
          email: 'demo@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#2563eb', // blue-600
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      toast.error('Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={displayRazorpay}
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors disabled:opacity-50 ${className || ''}`}
    >
      <FaMoneyBillWave />
      {loading ? 'Processing...' : label}
    </button>
  );
};
