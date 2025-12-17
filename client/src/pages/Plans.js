import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiStar } from 'react-icons/fi';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/plans');
      setPlans(res.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const userId = user.id || user._id;
      const res = await axios.get(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUserData(res.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      alert('Please login to subscribe');
      return;
    }

    if (userData?.subscription?.isActive) {
      alert('You already have an active subscription. Please wait for it to expire or contact admin.');
      return;
    }

    // Navigate to payment page with plan ID
    navigate('/payment', { state: { planId } });
  };

  // Convert USD to INR (approximate rate: 1 USD = 83 INR)
  const convertToINR = (usd) => {
    return Math.round(usd * 83);
  };

  const isSubscribed = (planId) => {
    if (!userData?.subscription?.isActive) return false;
    const userPlanId = userData.subscription.planId?._id || userData.subscription.planId;
    return userPlanId === planId;
  };

  const hasActiveSubscription = userData?.subscription?.isActive;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-700 mb-4 drop-shadow-lg">
            Choose Your <span className="text-purple-600">Plan</span>
          </h1>
          <p className="text-xl text-indigo-900 font-semibold">
            Select the perfect plan that fits your fitness goals and lifestyle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.length === 0 ? (
            <div className="col-span-full text-center text-indigo-900 font-semibold">
              <p>No plans available at the moment. Please check back later.</p>
            </div>
          ) : (
            plans.map((plan, index) => {
              const subscribed = isSubscribed(plan._id);
              const priceINR = convertToINR(plan.price);
              
              return (
                <div
                  key={plan._id}
                  className={`bg-white rounded-2xl shadow-2xl overflow-hidden border-4 ${
                    index === 1 ? 'border-yellow-400 transform scale-105 shadow-yellow-400/50' : 'border-indigo-200'
                  } ${subscribed ? 'ring-4 ring-yellow-400' : ''}`}
                >
                  {index === 1 && (
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-indigo-900 text-center py-2 font-bold shadow-xl border-b-2 border-yellow-500">
                      <FiStar className="inline mr-2" />
                      Most Popular
                    </div>
                  )}
                  {subscribed && (
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-2 font-bold shadow-xl">
                      ✓ Subscribed
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-indigo-700 mb-2">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-yellow-500">₹{priceINR.toLocaleString('en-IN')}</span>
                      <span className="text-indigo-600 font-semibold">/{plan.duration} month{plan.duration > 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-indigo-900 mb-6 font-semibold">{plan.description}</p>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <FiCheck className="text-indigo-600 flex-shrink-0 mt-1" size={20} />
                          <span className="text-indigo-900 font-semibold">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {user ? (
                      <button
                        onClick={() => handleSubscribe(plan._id)}
                        disabled={hasActiveSubscription || subscribed}
                        className={`w-full py-3 rounded-xl font-bold transition-all shadow-xl ${
                          subscribed || hasActiveSubscription
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-2xl border-2 border-indigo-500'
                        }`}
                      >
                        {subscribed ? 'Subscribed' : hasActiveSubscription ? 'Already Subscribed' : 'Subscribe Now'}
                      </button>
                    ) : (
                      <Link
                        to="/register"
                        className="block w-full text-center py-3 rounded-xl font-bold transition-all bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl border-2 border-indigo-500"
                      >
                        Sign Up to Subscribe
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Plans;

