import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCreditCard, FiUser, FiPackage, FiDollarSign, FiCheck, FiX, FiTag, FiMaximize2 } from 'react-icons/fi';
import axios from 'axios';
import API_URL from '../config/api';
import AuthContext from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

const Payment = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [userData, setUserData] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        // Fetch payment settings
        const settingsRes = await axios.get('${API_URL}/api/payment-settings');
        setPaymentSettings(settingsRes.data);

        // Get payment ID from URL params or location state
        const paymentId = new URLSearchParams(location.search).get('id') || location.state?.paymentId;
        
        if (paymentId) {
          const res = await axios.get(`${API_URL}/api/payments/${paymentId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          setPayment(res.data);
          setPlan(res.data.planId);
          setUserData(res.data.userId);
          setTransactionId(res.data.transactionId || '');
          setOriginalAmount(res.data.originalAmount || res.data.amount);
          setFinalAmount(res.data.amount);
          if (res.data.couponCode) {
            setAppliedCoupon({ code: res.data.couponCode });
          }
        } else if (location.state?.planId) {
          // Create new payment if coming from plans page
          const planRes = await axios.get(`${API_URL}/api/plans/${location.state.planId}`);
          const planData = planRes.data;
          setPlan(planData);
          
          const userId = user.id || user._id;
          const userRes = await axios.get(`${API_URL}/api/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          setUserData(userRes.data);

          // Create pending subscription first
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + planData.duration);
          
          await axios.post(
            `${API_URL}/api/users/${userId}/subscribe`,
            {
              planId: planData._id,
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );

          // Calculate initial amount and create payment
          const convertToINR = (usd) => Math.round(usd * 83);
          const amount = convertToINR(planData.price);
          setOriginalAmount(amount);
          setFinalAmount(amount);

          // Create payment
          const paymentRes = await axios.post(
            '${API_URL}/api/payments',
            {
              userId: userId,
              planId: planData._id,
              amount: amount,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          setPayment(paymentRes.data);
        }
      } catch (error) {
        console.error('Error fetching payment data:', error);
        alert('Error loading payment page. Please try again.');
        navigate('/plans');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPaymentData();
    } else {
      navigate('/login');
    }
  }, [location, user, navigate]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      alert('Please enter a coupon code');
      return;
    }

    if (!payment || !plan) {
      alert('Please wait for payment to be created');
      return;
    }

    try {
      const userId = user.id || user._id;
      const planId = plan._id;
      const convertToINR = (usd) => Math.round(usd * 83);
      const baseAmount = originalAmount || convertToINR(plan.price);

      // Delete old payment and create new one with coupon
      if (payment._id) {
        try {
          await axios.delete(`${API_URL}/api/payments/${payment._id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
        } catch (error) {
          // Ignore delete errors
        }
      }

      // Create payment with coupon
      const paymentRes = await axios.post(
        '${API_URL}/api/payments',
        {
          userId: userId,
          planId: planId,
          amount: baseAmount,
          couponCode: couponCode.toUpperCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setPayment(paymentRes.data);
      setFinalAmount(paymentRes.data.amount);
      setAppliedCoupon({ code: paymentRes.data.couponCode });
      setCouponCode('');
      
      if (paymentRes.data.discountAmount > 0) {
        alert(`Coupon applied! Discount: ₹${paymentRes.data.discountAmount.toLocaleString('en-IN')}`);
      } else {
        alert('Invalid or expired coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      alert(error.response?.data?.message || 'Error applying coupon. Please try again.');
    }
  };

  const handleSubmitTransactionId = async () => {
    if (!transactionId.trim()) {
      alert('Please enter a transaction ID');
      return;
    }

    if (!payment) {
      alert('Payment not found');
      return;
    }

    try {
      const res = await axios.put(
        `${API_URL}/api/payments/${payment._id}/transaction`,
        { transactionId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setPayment(res.data);
      alert('Transaction ID submitted successfully!');
    } catch (error) {
      console.error('Error submitting transaction ID:', error);
      alert('Error submitting transaction ID. Please try again.');
    }
  };

  const convertToINR = (usd) => {
    return Math.round(usd * 83);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!payment || !plan || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50">
        <div className="text-center">
          <p className="text-indigo-900 font-semibold mb-4">Payment information not found</p>
          <button
            onClick={() => navigate('/plans')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-bold shadow-xl border-2 border-indigo-500"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  const amount = finalAmount || payment?.amount || convertToINR(plan.price);
  const isCompleted = payment?.status === 'completed';
  const isPending = payment?.status === 'pending';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-8 text-center drop-shadow-lg">
            Payment <span className="text-purple-600">Details</span>
          </h1>

          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-4 border-indigo-200 mb-6">
            {/* Status Badge */}
            <div className="text-center mb-6">
              {isCompleted ? (
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl border-2 border-emerald-400">
                  <FiCheck size={24} />
                  <span>Payment Completed</span>
                </div>
              ) : isPending ? (
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-300 text-indigo-900 px-6 py-3 rounded-xl font-bold shadow-xl border-2 border-yellow-500">
                  <FiCreditCard size={24} />
                  <span>Payment Pending</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl border-2 border-red-400">
                  <FiX size={24} />
                  <span>Payment Failed</span>
                </div>
              )}
            </div>

            {/* User Information */}
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
              <h2 className="text-xl font-bold text-indigo-700 mb-4 flex items-center space-x-2">
                <FiUser />
                <span>User Information</span>
              </h2>
              <p className="text-indigo-900 font-bold text-lg">{userData.name}</p>
              <p className="text-indigo-700 font-semibold">{userData.email}</p>
            </div>

            {/* Plan Information */}
            <div className="mb-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
              <h2 className="text-xl font-bold text-indigo-700 mb-4 flex items-center space-x-2">
                <FiPackage />
                <span>Plan Details</span>
              </h2>
              <p className="text-indigo-900 font-bold text-lg">{plan.name}</p>
              <p className="text-indigo-700 font-semibold">{plan.description}</p>
              <p className="text-indigo-600 font-semibold mt-2">Duration: {plan.duration} month{plan.duration > 1 ? 's' : ''}</p>
            </div>

            {/* Coupon Section */}
            {isPending && !appliedCoupon && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                <h2 className="text-xl font-bold text-indigo-700 mb-4 flex items-center space-x-2">
                  <FiTag />
                  <span>Apply Coupon</span>
                </h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-2 border-2 border-indigo-300 rounded-xl bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-bold shadow-xl border-2 border-indigo-500"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* Applied Coupon Display */}
            {appliedCoupon && (
              <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                <p className="text-indigo-900 font-bold">
                  <span className="text-emerald-600">Coupon Applied:</span> {appliedCoupon.code}
                </p>
                {payment?.discountAmount > 0 && (
                  <p className="text-indigo-700 font-semibold mt-1">
                    Discount: ₹{payment.discountAmount.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}

            {/* Payment Amount */}
            <div className="mb-6 p-6 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-xl border-4 border-yellow-500 shadow-xl">
              <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center space-x-2">
                <FiDollarSign />
                <span>Payment Amount</span>
              </h2>
              {originalAmount > amount && (
                <p className="text-lg text-indigo-800 line-through mb-2">₹{originalAmount.toLocaleString('en-IN')}</p>
              )}
              <p className="text-4xl font-bold text-indigo-900">₹{amount.toLocaleString('en-IN')}</p>
            </div>

            {/* UPI QR Code */}
            {isPending && paymentSettings?.upiId && (
              <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-4 border-indigo-200 shadow-xl">
                <h2 className="text-xl font-bold text-indigo-700 mb-4 flex items-center space-x-2">
                  <FiMaximize2 />
                  <span>Scan & Pay</span>
                </h2>
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl border-4 border-indigo-300 mb-4">
                    <QRCodeSVG value={`upi://pay?pa=${paymentSettings.upiId}&pn=Elite Fitness&am=${amount}&cu=INR`} size={200} />
                  </div>
                  <p className="text-indigo-900 font-bold text-lg mb-2">UPI ID: {paymentSettings.upiId}</p>
                  <p className="text-indigo-700 font-semibold">Amount: ₹{amount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}

            {/* Transaction ID Input */}
            {isPending && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <h2 className="text-xl font-bold text-indigo-700 mb-4">Transaction ID</h2>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter your transaction ID"
                    className="flex-1 px-4 py-2 border-2 border-indigo-300 rounded-xl bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                  />
                  <button
                    onClick={handleSubmitTransactionId}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-bold shadow-xl border-2 border-indigo-500"
                  >
                    Save
                  </button>
                </div>
                <p className="text-sm text-indigo-600 font-semibold mb-4">
                  After making payment, enter your transaction ID here
                </p>
              </div>
            )}

            {/* Payment Details */}
            {payment.transactionId && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-indigo-200">
                <p className="text-indigo-700 font-semibold">
                  <span className="font-bold">Transaction ID:</span> {payment.transactionId}
                </p>
                {payment.paidAt && (
                  <p className="text-indigo-700 font-semibold mt-2">
                    <span className="font-bold">Paid At:</span> {new Date(payment.paidAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Success Message */}
            {isPending && isSubmitted && (
              <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-4 border-emerald-300 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-emerald-500 rounded-full p-2">
                    <FiCheck className="text-white" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-emerald-700">Payment Submitted Successfully!</h2>
                </div>
                <p className="text-indigo-700 font-semibold mb-4">
                  Your payment has been submitted for admin review. You will be notified once it's approved.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {isPending && isSubmitted && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-bold shadow-xl border-2 border-emerald-400"
                >
                  Go to Dashboard
                </button>
              )}
              {isPending && !isSubmitted && payment.transactionId && (
                <button
                  onClick={async () => {
                    try {
                      setIsSubmitted(true);
                      if (payment._id) {
                        const res = await axios.get(`${API_URL}/api/payments/${payment._id}`, {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                          },
                        });
                        setPayment(res.data);
                      }
                    } catch (error) {
                      console.error('Error refreshing payment:', error);
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-bold shadow-xl border-2 border-emerald-400"
                >
                  Submit Payment
                </button>
              )}
              {isCompleted && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-bold shadow-xl border-2 border-emerald-400"
                >
                  Go to Dashboard
                </button>
              )}
              <button
                onClick={() => navigate('/plans')}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-xl border-2 border-indigo-500"
              >
                Back to Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

