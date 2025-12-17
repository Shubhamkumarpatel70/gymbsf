import React, { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiMail, FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiCalendar, FiTag, FiCreditCard, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import API_URL from '../config/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState({ upiId: '', bankName: '', accountNumber: '', ifscCode: '' });
  const [rejectingSubscription, setRejectingSubscription] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [editingUser, setEditingUser] = useState(null);
  const [userEditForm, setUserEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    membershipId: '',
  });
  const [loading, setLoading] = useState(true);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    features: '',
    isBestValue: false,
    hasDiscount: false,
    originalPrice: '',
    discountPrice: '',
  });
  const [assigningSubscription, setAssigningSubscription] = useState(null);
  const [subscriptionForm, setSubscriptionForm] = useState({
    planId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const [terminatingUser, setTerminatingUser] = useState(null);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    usageLimit: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, plansRes, contactsRes, couponsRes, paymentsRes, settingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/users`, { headers }),
        axios.get(`${API_URL}/api/plans`),
        axios.get(`${API_URL}/api/contact`, { headers }),
        axios.get(`${API_URL}/api/coupons`, { headers }),
        axios.get(`${API_URL}/api/payments`, { headers }),
        axios.get(`${API_URL}/api/payment-settings`),
      ]);

      setUsers(usersRes.data);
      setPlans(plansRes.data);
      setContacts(contactsRes.data);
      setCoupons(couponsRes.data);
      setPayments(paymentsRes.data);
      setPaymentSettings(settingsRes.data || { upiId: '', bankName: '', accountNumber: '', ifscCode: '' });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchMember = () => {
    if (!searchQuery.trim()) {
      setSearchedUser(null);
      return;
    }

    const query = searchQuery.trim().toUpperCase();
    const foundUser = users.find(
      user => user.membershipId && user.membershipId.toUpperCase() === query
    );

    if (foundUser) {
      setSearchedUser(foundUser);
    } else {
      setSearchedUser(null);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const features = planForm.features.split('\n').filter(f => f.trim());
      
      // Convert ₹ to USD (divide by 83) before saving
      const priceInUSD = planForm.hasDiscount 
        ? parseFloat(planForm.discountPrice) / 83 
        : parseFloat(planForm.price) / 83;
      
      // Calculate discount amount if discount is enabled
      let discountAmount = 0;
      let originalPriceUSD = 0;
      let discountPriceUSD = 0;
      
      if (planForm.hasDiscount) {
        originalPriceUSD = parseFloat(planForm.originalPrice) / 83;
        discountPriceUSD = parseFloat(planForm.discountPrice) / 83;
        discountAmount = originalPriceUSD - discountPriceUSD;
      }
      
      const planData = {
        name: planForm.name,
        description: planForm.description,
        price: priceInUSD,
        duration: parseInt(planForm.duration),
        features,
        isBestValue: planForm.isBestValue,
        hasDiscount: planForm.hasDiscount,
        originalPrice: planForm.hasDiscount ? originalPriceUSD : priceInUSD,
        discountPrice: planForm.hasDiscount ? discountPriceUSD : 0,
        discountAmount: discountAmount,
      };
      
      if (editingPlan) {
        // Update existing plan
        await axios.put(
          `${API_URL}/api/plans/${editingPlan._id}`,
          planData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new plan
        await axios.post(
          '${API_URL}/api/plans',
          planData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      setShowPlanForm(false);
      setEditingPlan(null);
      setPlanForm({ name: '', description: '', price: '', duration: '', features: '', isBestValue: false, hasDiscount: false, originalPrice: '', discountPrice: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Error saving plan. Please try again.');
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    // Convert USD to ₹ (multiply by 83) for display
    const priceInINR = Math.round(plan.price * 83);
    const originalPriceInINR = plan.originalPrice ? Math.round(plan.originalPrice * 83) : '';
    const discountPriceInINR = plan.discountPrice ? Math.round(plan.discountPrice * 83) : '';
    
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.hasDiscount ? discountPriceInINR.toString() : priceInINR.toString(),
      duration: plan.duration.toString(),
      features: plan.features.join('\n'),
      isBestValue: plan.isBestValue || false,
      hasDiscount: plan.hasDiscount || false,
      originalPrice: originalPriceInINR.toString(),
      discountPrice: discountPriceInINR.toString(),
    });
    setShowPlanForm(true);
  };

  const handleCancelPlanForm = () => {
    setShowPlanForm(false);
    setEditingPlan(null);
    setPlanForm({ name: '', description: '', price: '', duration: '', features: '', isBestValue: false, hasDiscount: false, originalPrice: '', discountPrice: '' });
  };

  const getSubscribedUsers = (planId) => {
    return users.filter(user => 
      user.subscription?.isActive && 
      (user.subscription.planId?._id === planId || user.subscription.planId === planId)
    );
  };

  const handleAssignSubscription = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userId = assigningSubscription._id || assigningSubscription.id;
      
      // Calculate end date if not provided
      let endDate = subscriptionForm.endDate;
      if (!endDate) {
        const selectedPlan = plans.find(p => p._id === subscriptionForm.planId);
        if (selectedPlan) {
          const start = new Date(subscriptionForm.startDate);
          endDate = new Date(start);
          endDate.setMonth(endDate.getMonth() + selectedPlan.duration);
          endDate = endDate.toISOString().split('T')[0];
        }
      }

      await axios.post(
        `${API_URL}/api/users/${userId}/subscribe`,
        {
          planId: subscriptionForm.planId,
          startDate: subscriptionForm.startDate,
          endDate: endDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAssigningSubscription(null);
      setSubscriptionForm({ planId: '', startDate: new Date().toISOString().split('T')[0], endDate: '' });
      fetchData();
      alert('Subscription assigned successfully!');
    } catch (error) {
      console.error('Error assigning subscription:', error);
      alert('Error assigning subscription. Please try again.');
    }
  };

  const handlePlanSelect = (planId) => {
    const selectedPlan = plans.find(p => p._id === planId);
    if (selectedPlan && !subscriptionForm.endDate) {
      const start = new Date(subscriptionForm.startDate);
      const endDate = new Date(start);
      endDate.setMonth(endDate.getMonth() + selectedPlan.duration);
      setSubscriptionForm({
        ...subscriptionForm,
        planId,
        endDate: endDate.toISOString().split('T')[0],
      });
    } else {
      setSubscriptionForm({ ...subscriptionForm, planId });
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userId = editingUser._id || editingUser.id;
      
      await axios.put(
        `${API_URL}/api/users/${userId}`,
        userEditForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEditingUser(null);
      setUserEditForm({ name: '', email: '', phone: '', address: '', gender: '', membershipId: '' });
      fetchData();
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user. Please try again.');
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, status, transactionId = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/payments/${paymentId}/status`,
        { status, transactionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
      alert('Payment status updated successfully!');
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Error updating payment status. Please try again.');
    }
  };

  const handleApprovePaymentAndSubscription = async (paymentId, userId) => {
    try {
      const token = localStorage.getItem('token');
      const transactionId = prompt('Enter Transaction ID (optional):');
      
      // First approve the subscription
      await axios.post(
        `${API_URL}/api/users/${userId}/approve-subscription`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Then update payment status to completed
      await axios.put(
        `${API_URL}/api/payments/${paymentId}/status`,
        { status: 'completed', transactionId: transactionId || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchData();
      alert('Subscription and payment approved successfully!');
    } catch (error) {
      console.error('Error approving subscription and payment:', error);
      alert(error.response?.data?.message || 'Error approving. Please try again.');
    }
  };

  const handleApproveSubscription = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/users/${userId}/approve-subscription`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
      alert('Subscription approved successfully!');
    } catch (error) {
      console.error('Error approving subscription:', error);
      alert(error.response?.data?.message || 'Error approving subscription. Please try again.');
    }
  };

  const handleRejectSubscription = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = rejectingSubscription._id || rejectingSubscription.id;
      await axios.post(
        `${API_URL}/api/users/${userId}/reject-subscription`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRejectingSubscription(null);
      setRejectionReason('');
      fetchData();
      alert('Subscription rejected successfully!');
    } catch (error) {
      console.error('Error rejecting subscription:', error);
      alert(error.response?.data?.message || 'Error rejecting subscription. Please try again.');
    }
  };

  const handleUpdatePaymentSettings = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '${API_URL}/api/payment-settings',
        paymentSettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Payment settings updated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error updating payment settings:', error);
      alert('Error updating payment settings. Please try again.');
    }
  };

  const handleTerminateSubscription = async () => {
    if (!terminatingUser) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/users/${terminatingUser._id}/terminate-subscription`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTerminatingUser(null);
      fetchData();
      alert('Subscription terminated successfully!');
    } catch (error) {
      console.error('Error terminating subscription:', error);
      alert(error.response?.data?.message || 'Error terminating subscription. Please try again.');
    }
  };

  const handleUnterminateSubscription = async (userId) => {
    if (!window.confirm('Are you sure you want to reactivate this subscription?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/users/${userId}/unterminate-subscription`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
      alert('Subscription reactivated successfully!');
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      alert(error.response?.data?.message || 'Error reactivating subscription. Please try again.');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const couponData = {
        ...couponForm,
        discountValue: parseFloat(couponForm.discountValue),
        minPurchase: parseFloat(couponForm.minPurchase) || 0,
        maxDiscount: couponForm.maxDiscount ? parseFloat(couponForm.maxDiscount) : null,
        usageLimit: couponForm.usageLimit ? parseInt(couponForm.usageLimit) : null,
      };

      if (editingCoupon) {
        await axios.put(
          `${API_URL}/api/coupons/${editingCoupon._id}`,
          couponData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          '${API_URL}/api/coupons',
          couponData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowCouponForm(false);
      setEditingCoupon(null);
      setCouponForm({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchase: '',
        maxDiscount: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        usageLimit: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert(error.response?.data?.message || 'Error saving coupon. Please try again.');
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit?.toString() || '',
    });
    setShowCouponForm(true);
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/api/coupons/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting coupon:', error);
        alert('Error deleting coupon. Please try again.');
      }
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/api/plans/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/contact/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-DEFAULT"></div>
      </div>
    );
  }

  const activeUsers = users.filter(u => u.subscription?.isActive).length;
  const totalRevenue = users
    .filter(u => u.subscription?.isActive && u.subscription?.planId)
    .reduce((sum, u) => {
      const plan = plans.find(p => p._id === u.subscription.planId._id || p._id === u.subscription.planId);
      return sum + (plan?.price || 0);
    }, 0);
  const totalRevenueINR = Math.round(totalRevenue * 83);
  const unreadContacts = contacts.filter(c => !c.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-8 drop-shadow-lg">
          Admin <span className="text-purple-600">Dashboard</span>
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-2xl p-6 border-4 border-cyan-400 hover:shadow-cyan-500/50 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm md:text-base font-bold">Total Users</p>
                <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{users.length}</p>
              </div>
              <div className="bg-yellow-400 p-4 rounded-xl shadow-xl border-4 border-yellow-300">
                <FiUsers className="text-indigo-900" size={32} />
              </div>
            </div>
            <p className="text-sm text-blue-100 mt-2 font-bold">{activeUsers} active subscriptions</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-yellow-300 rounded-2xl shadow-2xl p-6 border-4 border-yellow-500 hover:shadow-yellow-500/50 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-800 text-sm md:text-base font-bold">Total Revenue</p>
                <p className="text-2xl md:text-3xl font-bold text-indigo-900 drop-shadow-lg">₹{totalRevenueINR.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-indigo-900 p-4 rounded-xl shadow-xl border-4 border-indigo-700">
                <FiDollarSign className="text-yellow-300" size={32} />
              </div>
            </div>
            <p className="text-sm text-indigo-800 mt-2 font-bold">Monthly recurring</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-2xl p-6 border-4 border-pink-400 hover:shadow-pink-500/50 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm md:text-base font-bold">Messages</p>
                <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{contacts.length}</p>
              </div>
              <div className="bg-yellow-400 p-4 rounded-xl shadow-xl border-4 border-yellow-300">
                <FiMail className="text-indigo-900" size={32} />
              </div>
            </div>
            <p className="text-sm text-pink-100 mt-2 font-bold">{unreadContacts} unread</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-indigo-200">
          <div className="border-b-2 border-indigo-200">
            <div className="flex flex-wrap space-x-4 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 border-b-4 font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-indigo-600 hover:text-purple-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-2 border-b-4 font-bold transition-all ${
                  activeTab === 'users'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-indigo-600 hover:text-purple-600'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className={`py-4 px-2 border-b-4 font-bold transition-all ${
                  activeTab === 'plans'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-indigo-600 hover:text-purple-600'
                }`}
              >
                Plans
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`py-4 px-2 border-b-4 font-bold transition-all ${
                  activeTab === 'subscriptions'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-indigo-600 hover:text-purple-600'
                }`}
              >
                Subscriptions
              </button>
              <button
                onClick={() => setActiveTab('coupons')}
                className={`py-4 px-2 border-b-4 font-bold transition-all ${
                  activeTab === 'coupons'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-indigo-600 hover:text-purple-600'
                }`}
              >
                Coupons
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`py-4 px-2 border-b-4 font-bold transition-all ${
                  activeTab === 'contacts'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-indigo-600 hover:text-purple-600'
                }`}
              >
                Messages
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-2 border-b-4 font-bold transition-all ${
                  activeTab === 'payments'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-indigo-600 hover:text-purple-600'
                }`}
              >
                Payments
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Member Search Section */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-4 border-indigo-200 shadow-xl">
                  <h2 className="text-2xl font-bold text-indigo-700 mb-4">Search Member by ID</h2>
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                      <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-600" size={20} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value.toUpperCase());
                          if (!e.target.value.trim()) {
                            setSearchedUser(null);
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSearchMember();
                          }
                        }}
                        placeholder="Enter Membership ID (e.g., ABC12345)"
                        className="w-full pl-12 pr-4 py-3 border-2 border-indigo-300 rounded-xl bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold uppercase"
                        maxLength={8}
                      />
                    </div>
                    <button
                      onClick={handleSearchMember}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-xl border-2 border-indigo-500 transition-all hover:shadow-2xl flex items-center gap-2"
                    >
                      <FiSearch size={20} />
                      Search
                    </button>
                  </div>

                  {/* Search Results */}
                  {searchedUser && (
                    <div className="mt-6 bg-white rounded-xl p-6 border-4 border-indigo-300 shadow-2xl">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-indigo-700">Member Details</h3>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSearchedUser(null);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FiX size={24} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border-2 border-yellow-300">
                          <p className="text-sm font-bold text-indigo-700 mb-1">Membership ID</p>
                          <p className="text-lg font-bold text-indigo-900 bg-gradient-to-r from-yellow-400 to-yellow-300 px-3 py-1 rounded-lg border-2 border-yellow-500 inline-block">
                            {searchedUser.membershipId || 'Not assigned'}
                          </p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-indigo-300">
                          <p className="text-sm font-bold text-indigo-700 mb-1">Date of Join</p>
                          <p className="text-lg font-bold text-indigo-900">
                            {new Date(searchedUser.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-300">
                          <p className="text-sm font-bold text-indigo-700 mb-1">Name</p>
                          <p className="text-lg font-bold text-indigo-900">{searchedUser.name}</p>
                        </div>

                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-xl border-2 border-cyan-300">
                          <p className="text-sm font-bold text-indigo-700 mb-1">Email</p>
                          <p className="text-lg font-bold text-indigo-900">{searchedUser.email}</p>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border-2 border-emerald-300">
                          <p className="text-sm font-bold text-indigo-700 mb-1">Phone</p>
                          <p className="text-lg font-bold text-indigo-900">{searchedUser.phone || 'Not provided'}</p>
                        </div>

                        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-xl border-2 border-rose-300">
                          <p className="text-sm font-bold text-indigo-700 mb-1">Gender</p>
                          <p className="text-lg font-bold text-indigo-900 capitalize">{searchedUser.gender || 'Not provided'}</p>
                        </div>

                        <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-xl border-2 border-violet-300">
                          <p className="text-sm font-bold text-indigo-700 mb-1">Address</p>
                          <p className="text-lg font-bold text-indigo-900">{searchedUser.address || 'Not provided'}</p>
                        </div>

                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-300">
                          <p className="text-sm font-bold text-indigo-700 mb-1">Role</p>
                          <span className={`px-3 py-1 rounded-xl text-sm font-bold ${
                            searchedUser.role === 'admin' 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-indigo-900 shadow-lg' 
                              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                          }`}>
                            {searchedUser.role}
                          </span>
                        </div>

                        <div className="md:col-span-2 bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-xl border-2 border-indigo-300">
                          <p className="text-sm font-bold text-indigo-700 mb-2">Subscription Status</p>
                          {searchedUser.subscription?.planId ? (
                            <div className="space-y-2">
                              {(() => {
                                const userPlan = plans.find(
                                  p => p._id === searchedUser.subscription?.planId?._id || p._id === searchedUser.subscription?.planId
                                );
                                const isActive = searchedUser.subscription?.isActive && 
                                                 searchedUser.subscription?.status === 'approved' &&
                                                 new Date(searchedUser.subscription?.endDate) > new Date();
                                const status = searchedUser.subscription?.status || 'pending';
                                
                                return (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <span className={`px-4 py-2 rounded-xl font-bold ${
                                        isActive 
                                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                                          : status === 'pending'
                                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-indigo-900 shadow-lg'
                                          : status === 'rejected'
                                          ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
                                          : status === 'terminated'
                                          ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                                          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg'
                                      }`}>
                                        {isActive ? 'Active' : status.charAt(0).toUpperCase() + status.slice(1)}
                                      </span>
                                      <span className="text-lg font-bold text-indigo-900">
                                        {userPlan?.name || 'Unknown Plan'}
                                      </span>
                                    </div>
                                    {searchedUser.subscription?.startDate && (
                                      <p className="text-sm text-indigo-700 font-semibold">
                                        Start: {new Date(searchedUser.subscription.startDate).toLocaleDateString('en-IN')}
                                      </p>
                                    )}
                                    {searchedUser.subscription?.endDate && (
                                      <p className="text-sm text-indigo-700 font-semibold">
                                        End: {new Date(searchedUser.subscription.endDate).toLocaleDateString('en-IN')}
                                      </p>
                                    )}
                                    {searchedUser.subscription?.rejectionReason && (
                                      <p className="text-sm text-red-700 font-semibold bg-red-50 p-2 rounded-lg border-2 border-red-200">
                                        Rejection Reason: {searchedUser.subscription.rejectionReason}
                                      </p>
                                    )}
                                    {searchedUser.subscription?.terminationReason && (
                                      <p className="text-sm text-red-700 font-semibold bg-red-50 p-2 rounded-lg border-2 border-red-200">
                                        Termination Reason: {searchedUser.subscription.terminationReason}
                                      </p>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          ) : (
                            <p className="text-lg font-bold text-indigo-600">No active subscription</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {searchQuery && !searchedUser && (
                    <div className="mt-4 text-center py-4 bg-red-50 rounded-xl border-2 border-red-200">
                      <p className="text-red-700 font-bold">No member found with Membership ID: {searchQuery}</p>
                    </div>
                  )}
                </div>

                {/* Recent Activity Section */}
                <div>
                  <h2 className="text-2xl font-bold text-indigo-700 mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    {contacts.slice(0, 5).map((contact) => (
                      <div key={contact._id} className="border-l-4 border-yellow-400 pl-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-r-xl shadow-lg">
                        <p className="font-bold text-indigo-900">{contact.name}</p>
                        <p className="text-sm text-indigo-700 font-semibold">{contact.email}</p>
                        <p className="text-sm text-indigo-800 mt-1 font-medium">{contact.message.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl font-bold text-indigo-700 mb-4">All Users</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 border-b-4 border-indigo-500">
                      <tr>
                        <th className="px-4 py-2 text-left text-white font-bold">Membership ID</th>
                        <th className="px-4 py-2 text-left text-white font-bold">Name</th>
                        <th className="px-4 py-2 text-left text-white font-bold">Email</th>
                        <th className="px-4 py-2 text-left text-white font-bold">Role</th>
                        <th className="px-4 py-2 text-left text-white font-bold">Subscription</th>
                        <th className="px-4 py-2 text-left text-white font-bold">Joined</th>
                        <th className="px-4 py-2 text-left text-white font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const userPlan = plans.find(
                          p => p._id === user.subscription?.planId?._id || p._id === user.subscription?.planId
                        );
                        return (
                          <tr key={user._id} className="border-b-2 border-indigo-200 hover:bg-blue-50 bg-white">
                            <td className="px-4 py-2">
                              {user.membershipId ? (
                                <span className="font-bold text-indigo-900 bg-gradient-to-r from-yellow-400 to-yellow-300 px-3 py-1 rounded-lg border-2 border-yellow-500 shadow-lg">
                                  {user.membershipId}
                                </span>
                              ) : (
                                <span className="text-indigo-600 font-semibold italic">Not assigned</span>
                              )}
                            </td>
                            <td className="px-4 py-2 font-bold text-indigo-900">{user.name}</td>
                            <td className="px-4 py-2 text-indigo-700 font-semibold">{user.email}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded-xl text-sm font-bold ${
                                user.role === 'admin' ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-indigo-900 shadow-lg' : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              {user.subscription?.isActive ? (
                                <div>
                                  <span className="text-indigo-700 font-bold">{userPlan?.name || 'Active'}</span>
                                  {user.subscription.endDate && (
                                    <p className="text-xs text-indigo-600 font-semibold">
                                      Until {new Date(user.subscription.endDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-indigo-600 font-semibold">None</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-indigo-700 font-semibold">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setUserEditForm({
                                    name: user.name || '',
                                    email: user.email || '',
                                    phone: user.phone || '',
                                    address: user.address || '',
                                    gender: user.gender || '',
                                    membershipId: user.membershipId || '',
                                  });
                                }}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3 py-1 rounded-xl text-sm flex items-center space-x-1 font-bold shadow-lg border-2 border-indigo-500"
                              >
                                <FiEdit size={14} />
                                <span>Edit User Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Edit User Details Modal */}
                {editingUser && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 border-4 border-indigo-200 shadow-2xl">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-indigo-700">
                          Edit User Details for {editingUser.name}
                        </h3>
                        <button
                          onClick={() => {
                            setEditingUser(null);
                            setUserEditForm({ name: '', email: '', phone: '', address: '', gender: '', membershipId: '' });
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FiX size={24} />
                        </button>
                      </div>
                      <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-indigo-700 mb-2">Membership ID</label>
                          <input
                            type="text"
                            value={userEditForm.membershipId}
                            onChange={(e) => setUserEditForm({ ...userEditForm, membershipId: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                            placeholder="Enter 8-character membership ID"
                            maxLength={8}
                            pattern="[A-Z0-9]{8}"
                            title="Membership ID must be 8 characters (A-Z, 0-9)"
                          />
                          <p className="text-xs text-indigo-600 mt-1 font-semibold">8 characters (A-Z, 0-9)</p>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-indigo-700 mb-2">Name</label>
                          <input
                            type="text"
                            value={userEditForm.name}
                            onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-indigo-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={userEditForm.email}
                            onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-indigo-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={userEditForm.phone}
                            onChange={(e) => setUserEditForm({ ...userEditForm, phone: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-indigo-700 mb-2">Address</label>
                          <input
                            type="text"
                            value={userEditForm.address}
                            onChange={(e) => setUserEditForm({ ...userEditForm, address: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-indigo-700 mb-2">Gender</label>
                          <select
                            value={userEditForm.gender}
                            onChange={(e) => setUserEditForm({ ...userEditForm, gender: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-bold shadow-xl border-2 border-indigo-500 flex items-center justify-center space-x-2"
                          >
                            <FiCheck />
                            <span>Update User</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(null);
                              setUserEditForm({ name: '', email: '', phone: '', address: '', gender: '', membershipId: '' });
                            }}
                            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-xl font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Subscription Assignment Modal */}
                {assigningSubscription && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 border-4 border-indigo-200 shadow-2xl">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-indigo-700">
                          Manage Subscription for {assigningSubscription.name}
                        </h3>
                        <button
                          onClick={() => {
                            setAssigningSubscription(null);
                            setSubscriptionForm({ planId: '', startDate: new Date().toISOString().split('T')[0], endDate: '' });
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FiX size={24} />
                        </button>
                      </div>
                      <form onSubmit={handleAssignSubscription} className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-indigo-700 mb-2">
                            Select Plan
                          </label>
                          <select
                            value={subscriptionForm.planId}
                            onChange={(e) => handlePlanSelect(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                            required
                          >
                            <option value="">Select a plan</option>
                            {plans.map((plan) => {
                              const priceINR = Math.round(plan.price * 83);
                              return (
                                <option key={plan._id} value={plan._id}>
                                  {plan.name} - ₹{priceINR.toLocaleString('en-IN')}/{plan.duration}mo
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-indigo-700 mb-2">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={subscriptionForm.startDate}
                            onChange={(e) => {
                              const newStartDate = e.target.value;
                              if (subscriptionForm.planId) {
                                const selectedPlan = plans.find(p => p._id === subscriptionForm.planId);
                                if (selectedPlan) {
                                  const start = new Date(newStartDate);
                                  const endDate = new Date(start);
                                  endDate.setMonth(endDate.getMonth() + selectedPlan.duration);
                                  setSubscriptionForm({
                                    ...subscriptionForm,
                                    startDate: newStartDate,
                                    endDate: endDate.toISOString().split('T')[0],
                                  });
                                } else {
                                  setSubscriptionForm({ ...subscriptionForm, startDate: newStartDate });
                                }
                              } else {
                                setSubscriptionForm({ ...subscriptionForm, startDate: newStartDate });
                              }
                            }}
                            className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-indigo-700 mb-2">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={subscriptionForm.endDate}
                            onChange={(e) => setSubscriptionForm({ ...subscriptionForm, endDate: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                            required
                          />
                        </div>
                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl flex items-center justify-center space-x-2 font-bold shadow-xl border-2 border-indigo-500"
                          >
                            <FiCheck />
                            <span>Save Subscription</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAssigningSubscription(null);
                              setSubscriptionForm({ planId: '', startDate: new Date().toISOString().split('T')[0], endDate: '' });
                            }}
                            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-xl font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Plans Tab */}
            {activeTab === 'plans' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-indigo-700">Subscription Plans</h2>
                  {!showPlanForm && (
                    <button
                      onClick={() => setShowPlanForm(true)}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-300 hover:to-yellow-200 text-indigo-900 px-4 py-2 rounded-xl flex items-center space-x-2 font-bold shadow-xl border-2 border-yellow-500"
                    >
                      <FiPlus />
                      <span>Add Plan</span>
                    </button>
                  )}
                </div>

                {showPlanForm && (
                  <form onSubmit={handleCreatePlan} className="bg-white border-4 border-indigo-200 p-6 rounded-2xl mb-6 space-y-4 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-indigo-700">
                        {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                      </h3>
                      <button
                        type="button"
                        onClick={handleCancelPlanForm}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FiX size={24} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Plan Name"
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
                      required
                    />
                    <textarea
                      placeholder="Description"
                      value={planForm.description}
                      onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
                      rows="3"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-indigo-700 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          step="1"
                          placeholder="2499"
                          value={planForm.hasDiscount ? planForm.discountPrice : planForm.price}
                          onChange={(e) => {
                            if (planForm.hasDiscount) {
                              setPlanForm({ ...planForm, discountPrice: e.target.value });
                            } else {
                              setPlanForm({ ...planForm, price: e.target.value });
                            }
                          }}
                          className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
                          required
                        />
                        {planForm.hasDiscount && (
                          <p className="text-xs text-indigo-600 mt-1 font-semibold">Final price (from discount price)</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-indigo-700 mb-1">Duration (months)</label>
                        <input
                          type="number"
                          placeholder="1"
                          value={planForm.duration}
                          onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* Best Value Checkbox */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isBestValue"
                        checked={planForm.isBestValue}
                        onChange={(e) => setPlanForm({ ...planForm, isBestValue: e.target.checked })}
                        className="w-5 h-5 text-indigo-600 border-2 border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <label htmlFor="isBestValue" className="text-sm font-bold text-indigo-700 cursor-pointer">
                        Mark as Best Value
                      </label>
                    </div>

                    {/* Has Discount Checkbox */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hasDiscount"
                        checked={planForm.hasDiscount}
                        onChange={(e) => setPlanForm({ ...planForm, hasDiscount: e.target.checked, originalPrice: e.target.checked ? planForm.originalPrice : '', discountPrice: e.target.checked ? planForm.discountPrice : '' })}
                        className="w-5 h-5 text-indigo-600 border-2 border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <label htmlFor="hasDiscount" className="text-sm font-bold text-indigo-700 cursor-pointer">
                        Has Discount
                      </label>
                    </div>

                    {/* Discount Fields */}
                    {planForm.hasDiscount && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-300 space-y-4">
                        <h4 className="text-sm font-bold text-indigo-700 mb-2">Discount Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-indigo-700 mb-1">Original Price (₹)</label>
                            <input
                              type="number"
                              step="1"
                              placeholder="2999"
                              value={planForm.originalPrice}
                              onChange={(e) => setPlanForm({ ...planForm, originalPrice: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-indigo-700 mb-1">Discount Price (₹)</label>
                            <input
                              type="number"
                              step="1"
                              placeholder="2499"
                              value={planForm.discountPrice}
                              onChange={(e) => setPlanForm({ ...planForm, discountPrice: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-indigo-700 mb-1">Discount Amount (₹)</label>
                          <input
                            type="number"
                            value={planForm.originalPrice && planForm.discountPrice ? (parseFloat(planForm.originalPrice) - parseFloat(planForm.discountPrice)).toFixed(0) : ''}
                            className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-gray-100 text-indigo-900 font-medium"
                            readOnly
                            disabled
                          />
                          <p className="text-xs text-indigo-600 mt-1 font-semibold">Auto-calculated</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold text-indigo-700 mb-1">Features (one per line)</label>
                      <textarea
                        placeholder="Access to all gym equipment&#10;Locker room access&#10;Free fitness assessment"
                        value={planForm.features}
                        onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
                        rows="5"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl flex items-center space-x-2 font-bold shadow-xl border-2 border-indigo-500"
                      >
                        <FiCheck />
                        <span>{editingPlan ? 'Update Plan' : 'Create Plan'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelPlanForm}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-xl font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans.map((plan) => {
                    const subscribedUsers = getSubscribedUsers(plan._id);
                    const priceINR = Math.round(plan.price * 83);
                    return (
                      <div key={plan._id} className="bg-white border-4 border-indigo-200 p-6 rounded-2xl shadow-2xl hover:shadow-indigo-500/50 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-indigo-700 mb-1">{plan.name}</h3>
                            <p className="text-2xl font-bold text-yellow-600 mb-2">
                              ₹{priceINR.toLocaleString('en-IN')}<span className="text-sm font-normal text-indigo-600">/{plan.duration}mo</span>
                            </p>
                          </div>
                          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 rounded-full shadow-lg border-2 border-indigo-500">
                            <span className="text-sm font-bold text-white">
                              {subscribedUsers.length} {subscribedUsers.length === 1 ? 'user' : 'users'}
                            </span>
                          </div>
                        </div>
                        <p className="text-indigo-700 mb-4 text-sm font-semibold">{plan.description}</p>
                        <div className="mb-4">
                          <p className="text-sm font-bold text-indigo-700 mb-2">Features:</p>
                          <ul className="space-y-1">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="text-sm text-indigo-900 flex items-start font-semibold">
                                <FiCheck className="text-indigo-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {subscribedUsers.length > 0 && (
                          <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                            <p className="text-xs font-bold text-indigo-700 mb-2">Subscribed Users:</p>
                            <div className="space-y-1">
                              {subscribedUsers.slice(0, 3).map((user) => (
                                <p key={user._id} className="text-xs text-indigo-800 font-semibold">
                                  • {user.name} ({user.email})
                                </p>
                              ))}
                              {subscribedUsers.length > 3 && (
                                <p className="text-xs text-indigo-800 font-semibold">
                                  +{subscribedUsers.length - 3} more
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPlan(plan)}
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl flex items-center justify-center space-x-2 font-bold shadow-lg border-2 border-indigo-500"
                          >
                            <FiEdit />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan._id)}
                            className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl flex items-center justify-center space-x-2 font-bold shadow-lg border-2 border-red-400"
                          >
                            <FiTrash2 />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <div>
                <h2 className="text-2xl font-bold text-indigo-700 mb-4">All Subscriptions</h2>
                <div className="overflow-x-auto bg-white rounded-2xl shadow-2xl border-4 border-indigo-200">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 border-b-4 border-indigo-500">
                      <tr>
                        <th className="px-4 py-3 text-left text-white font-bold">User</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Email</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Plan</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Price</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Start Date</th>
                        <th className="px-4 py-3 text-left text-white font-bold">End Date</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Status</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(user => user.subscription && (user.subscription.planId || user.subscription.planId?._id))
                        .map((user) => {
                          const plan = plans.find(
                            p => p._id === user.subscription.planId?._id || p._id === user.subscription.planId
                          );
                          const isExpired = user.subscription.endDate && new Date(user.subscription.endDate) < new Date();
                          const isTerminated = !user.subscription.isActive && user.subscription.terminatedAt;
                          const priceINR = plan ? Math.round(plan.price * 83) : 0;
                          
                          return (
                            <tr key={user._id} className={`border-b-2 border-indigo-200 hover:bg-blue-50 ${
                              isTerminated ? 'bg-red-50' : 'bg-white'
                            }`}>
                              <td className="px-4 py-3 font-bold text-indigo-900">{user.name}</td>
                              <td className="px-4 py-3 text-indigo-700 font-semibold">{user.email}</td>
                              <td className="px-4 py-3">
                                <span className="font-bold text-indigo-900">
                                  {plan?.name || 'Plan Not Found'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-bold text-yellow-600">
                                  ₹{priceINR.toLocaleString('en-IN')}/{plan?.duration || 1}mo
                                </span>
                              </td>
                              <td className="px-4 py-3 text-indigo-700 font-semibold">
                                {user.subscription.startDate
                                  ? new Date(user.subscription.startDate).toLocaleDateString()
                                  : 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-indigo-700 font-semibold">
                                {user.subscription.endDate
                                  ? new Date(user.subscription.endDate).toLocaleDateString()
                                  : 'N/A'}
                              </td>
                              <td className="px-4 py-3">
                                {isTerminated ? (
                                  <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                    Terminated
                                  </span>
                                ) : isExpired ? (
                                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-indigo-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                    Expired
                                  </span>
                                ) : (
                                  <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                    Active
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isTerminated ? (
                                  <button
                                    onClick={() => handleUnterminateSubscription(user._id)}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3 py-1 rounded-xl text-sm font-bold shadow-lg border-2 border-indigo-500"
                                  >
                                    Un-terminate
                                  </button>
                                ) : user.subscription.isActive ? (
                                  <button
                                    onClick={() => setTerminatingUser(user)}
                                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 py-1 rounded-xl text-sm font-bold shadow-lg border-2 border-red-400"
                                  >
                                    Terminate
                                  </button>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                      {users.filter(user => user.subscription && (user.subscription.planId || user.subscription.planId?._id)).length === 0 && (
                        <tr>
                          <td colSpan="8" className="px-4 py-8 text-center text-indigo-900 bg-blue-50 font-semibold">
                            No subscriptions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Subscription Statistics */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 border-4 border-emerald-400 text-white p-6 rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transition-all transform hover:scale-105">
                    <div className="flex items-center space-x-3 mb-2">
                      <FiCalendar size={24} className="text-white" />
                      <h3 className="text-lg font-bold">Active Subscriptions</h3>
                    </div>
                    <p className="text-3xl font-bold text-white drop-shadow-lg">
                      {users.filter(u => u.subscription?.isActive).length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-pink-600 border-4 border-red-400 text-white p-6 rounded-2xl shadow-2xl hover:shadow-red-500/50 transition-all transform hover:scale-105">
                    <div className="flex items-center space-x-3 mb-2">
                      <FiCalendar size={24} className="text-white" />
                      <h3 className="text-lg font-bold">Terminated</h3>
                    </div>
                    <p className="text-3xl font-bold text-white drop-shadow-lg">
                      {users.filter(u => u.subscription && !u.subscription.isActive && u.subscription.terminatedAt).length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-300 border-4 border-yellow-500 text-indigo-900 p-6 rounded-2xl shadow-2xl hover:shadow-yellow-500/50 transition-all transform hover:scale-105">
                    <div className="flex items-center space-x-3 mb-2">
                      <FiDollarSign size={24} className="text-indigo-900" />
                      <h3 className="text-lg font-bold">Monthly Revenue</h3>
                    </div>
                    <p className="text-3xl font-bold text-indigo-900 drop-shadow-lg">
                      ₹{totalRevenueINR.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-violet-500 to-purple-600 border-4 border-violet-400 text-white p-6 rounded-2xl shadow-2xl hover:shadow-violet-500/50 transition-all transform hover:scale-105">
                    <div className="flex items-center space-x-3 mb-2">
                      <FiUsers size={24} className="text-white" />
                      <h3 className="text-lg font-bold">Total Plans</h3>
                    </div>
                    <p className="text-3xl font-bold text-white drop-shadow-lg">{plans.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Terminate Subscription Modal */}
            {terminatingUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full border-4 border-indigo-200 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-indigo-700">
                      Terminate Subscription
                    </h3>
                    <button
                      onClick={() => setTerminatingUser(null)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                  <div className="mb-6">
                    <p className="text-indigo-900 mb-2 font-semibold">
                      Are you sure you want to terminate the subscription for:
                    </p>
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-xl shadow-xl border-2 border-indigo-500">
                      <p className="font-bold text-white">{terminatingUser.name}</p>
                      <p className="text-sm text-blue-100 font-semibold">{terminatingUser.email}</p>
                      {plans.find(p => p._id === terminatingUser.subscription?.planId?._id || p._id === terminatingUser.subscription?.planId) && (
                        <p className="text-sm text-yellow-300 mt-1 font-semibold">
                          Plan: {plans.find(p => p._id === terminatingUser.subscription?.planId?._id || p._id === terminatingUser.subscription?.planId)?.name}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-indigo-700 mt-4 font-semibold">
                      The subscription will be marked as terminated but will remain visible. You can reactivate it later if needed.
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleTerminateSubscription}
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-2 rounded-xl font-bold shadow-xl border-2 border-red-400"
                    >
                      Confirm Terminate
                    </button>
                    <button
                      onClick={() => setTerminatingUser(null)}
                      className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Coupons Tab */}
            {activeTab === 'coupons' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-indigo-700">Coupons</h2>
                  {!showCouponForm && (
                    <button
                      onClick={() => setShowCouponForm(true)}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-300 hover:to-yellow-200 text-indigo-900 px-4 py-2 rounded-xl flex items-center space-x-2 font-bold shadow-xl border-2 border-yellow-500"
                    >
                      <FiPlus />
                      <span>Add Coupon</span>
                    </button>
                  )}
                </div>

                {showCouponForm && (
                  <form onSubmit={handleCreateCoupon} className="bg-white border-4 border-indigo-200 p-6 rounded-2xl mb-6 space-y-4 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-indigo-700">
                        {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCouponForm(false);
                          setEditingCoupon(null);
                          setCouponForm({
                            code: '',
                            description: '',
                            discountType: 'percentage',
                            discountValue: '',
                            minPurchase: '',
                            maxDiscount: '',
                            validFrom: new Date().toISOString().split('T')[0],
                            validUntil: '',
                            usageLimit: '',
                          });
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FiX size={24} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-indigo-700 mb-2">Coupon Code</label>
                        <input
                          type="text"
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-indigo-700 mb-2">Discount Type</label>
                        <select
                          value={couponForm.discountType}
                          onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                          required
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-indigo-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={couponForm.description}
                        onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-indigo-700 mb-2">
                          Discount Value {couponForm.discountType === 'percentage' ? '(%)' : '(₹)'}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={couponForm.discountValue}
                          onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-indigo-700 mb-2">Min Purchase (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={couponForm.minPurchase}
                          onChange={(e) => setCouponForm({ ...couponForm, minPurchase: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-indigo-700 mb-2">Max Discount (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={couponForm.maxDiscount}
                          onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-indigo-700 mb-2">Valid From</label>
                        <input
                          type="date"
                          value={couponForm.validFrom}
                          onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-indigo-700 mb-2">Valid Until</label>
                        <input
                          type="date"
                          value={couponForm.validUntil}
                          onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-indigo-700 mb-2">Usage Limit</label>
                        <input
                          type="number"
                          value={couponForm.usageLimit}
                          onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border-2 border-indigo-300 bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
                          placeholder="Unlimited if empty"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl flex items-center space-x-2 font-bold shadow-xl border-2 border-indigo-500"
                      >
                        <FiCheck />
                        <span>{editingCoupon ? 'Update Coupon' : 'Create Coupon'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCouponForm(false);
                          setEditingCoupon(null);
                          setCouponForm({
                            code: '',
                            description: '',
                            discountType: 'percentage',
                            discountValue: '',
                            minPurchase: '',
                            maxDiscount: '',
                            validFrom: new Date().toISOString().split('T')[0],
                            validUntil: '',
                            usageLimit: '',
                          });
                        }}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-xl font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coupons.map((coupon) => {
                    const isExpired = new Date(coupon.validUntil) < new Date();
                    const isActive = coupon.isActive && !isExpired;
                    
                    return (
                      <div key={coupon._id} className="bg-white border-4 border-indigo-200 p-6 rounded-2xl shadow-2xl">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-yellow-600 mb-1">{coupon.code}</h3>
                            <p className="text-sm text-indigo-700 font-semibold">{coupon.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' : 'bg-gray-400 text-white'
                          }`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <p className="text-indigo-900 font-semibold">
                            <span className="font-bold">Discount: </span>
                            {coupon.discountType === 'percentage' 
                              ? `${coupon.discountValue}%` 
                              : `₹${coupon.discountValue.toLocaleString('en-IN')}`}
                          </p>
                          {coupon.minPurchase > 0 && (
                            <p className="text-indigo-700 text-sm font-semibold">
                              Min Purchase: ₹{coupon.minPurchase.toLocaleString('en-IN')}
                            </p>
                          )}
                          {coupon.maxDiscount && (
                            <p className="text-indigo-700 text-sm font-semibold">
                              Max Discount: ₹{coupon.maxDiscount.toLocaleString('en-IN')}
                            </p>
                          )}
                          <p className="text-indigo-700 text-sm font-semibold">
                            Valid: {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                          </p>
                          <p className="text-indigo-700 text-sm font-semibold">
                            Used: {coupon.usedCount} / {coupon.usageLimit || '∞'}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditCoupon(coupon)}
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl flex items-center justify-center space-x-2 font-bold shadow-lg border-2 border-indigo-500"
                          >
                            <FiEdit />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl flex items-center justify-center space-x-2 font-bold shadow-lg border-2 border-red-400"
                          >
                            <FiTrash2 />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {coupons.length === 0 && (
                    <div className="col-span-full text-center text-indigo-700 py-8 font-semibold">
                      No coupons available. Create your first coupon!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <div>
                <h2 className="text-2xl font-bold text-indigo-700 mb-4">Contact Messages</h2>
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div
                      key={contact._id}
                      className={`border-l-4 p-4 rounded-xl shadow-xl ${
                        contact.isRead 
                          ? 'border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50' 
                          : 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-indigo-900">{contact.name}</p>
                          <p className="text-sm text-indigo-700 font-semibold">{contact.email}</p>
                          {contact.phone && (
                            <p className="text-sm text-indigo-700 font-semibold">{contact.phone}</p>
                          )}
                        </div>
                        {!contact.isRead && (
                          <button
                            onClick={() => handleMarkRead(contact._id)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3 py-1 rounded-xl flex items-center space-x-1 text-sm font-bold shadow-lg border-2 border-indigo-500"
                          >
                            <FiCheck />
                            <span>Mark Read</span>
                          </button>
                        )}
                      </div>
                      {contact.subject && (
                        <p className="font-bold text-indigo-900 mb-2">{contact.subject}</p>
                      )}
                      <p className="text-indigo-800 font-semibold">{contact.message}</p>
                      <p className="text-xs text-indigo-600 mt-2 font-semibold">
                        {new Date(contact.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                <div className="mb-6 bg-white rounded-2xl shadow-2xl p-6 border-4 border-indigo-200">
                  <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center space-x-2">
                    <FiCreditCard />
                    <span>Payment Settings</span>
                  </h2>
                  <form onSubmit={handleUpdatePaymentSettings} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-indigo-700 mb-2">UPI ID (for Scan & Pay)</label>
                      <input
                        type="text"
                        value={paymentSettings.upiId || ''}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })}
                        placeholder="yourname@upi"
                        className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                      />
                      <p className="text-sm text-indigo-600 font-semibold mt-1">This will generate a QR code for users to scan and pay</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-indigo-700 mb-2">Bank Name</label>
                        <input
                          type="text"
                          value={paymentSettings.bankName || ''}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-indigo-700 mb-2">Account Number</label>
                        <input
                          type="text"
                          value={paymentSettings.accountNumber || ''}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, accountNumber: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-indigo-700 mb-2">IFSC Code</label>
                        <input
                          type="text"
                          value={paymentSettings.ifscCode || ''}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, ifscCode: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-bold shadow-xl border-2 border-indigo-500"
                    >
                      Save Payment Settings
                    </button>
                  </form>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                  <h2 className="text-2xl font-bold text-indigo-700">All Payments</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-indigo-700 font-bold">Filter:</span>
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold"
                    >
                      <option value="all">All Payments</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto bg-white rounded-2xl shadow-2xl border-4 border-indigo-200">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 border-b-4 border-indigo-500">
                      <tr>
                        <th className="px-4 py-3 text-left text-white font-bold">User</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Plan</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Amount</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Coupon</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Transaction ID</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Payment Status</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Subscription Status</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Date</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments
                        .filter(payment => {
                          if (paymentFilter === 'all') return true;
                          return payment.status === paymentFilter;
                        })
                        .map((payment) => {
                          const paymentUser = users.find(u => 
                            (u._id || u.id) === (payment.userId?._id || payment.userId)
                          );
                          const subscriptionStatus = paymentUser?.subscription?.status || 'N/A';
                        const userName = payment.userId?.name || 'N/A';
                        const userEmail = payment.userId?.email || 'N/A';
                        const planName = payment.planId?.name || 'N/A';
                        return (
                          <tr key={payment._id} className="border-b-2 border-indigo-200 hover:bg-blue-50 bg-white">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-bold text-indigo-900">{userName}</p>
                                <p className="text-sm text-indigo-700 font-semibold">{userEmail}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-indigo-900">{planName}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                {payment.originalAmount && payment.originalAmount > payment.amount && (
                                  <p className="text-xs text-indigo-600 line-through">₹{payment.originalAmount.toLocaleString('en-IN')}</p>
                                )}
                                <span className="font-bold text-yellow-600">₹{payment.amount?.toLocaleString('en-IN')}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {payment.couponCode ? (
                                <span className="font-bold text-emerald-600">{payment.couponCode}</span>
                              ) : (
                                <span className="text-indigo-600 font-semibold">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {payment.transactionId ? (
                                <span className="font-bold text-indigo-900 text-sm">{payment.transactionId}</span>
                              ) : (
                                <span className="text-indigo-600 font-semibold">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {payment.status === 'completed' ? (
                                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                  Completed
                                </span>
                              ) : payment.status === 'pending' ? (
                                <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-indigo-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                  Pending
                                </span>
                              ) : (
                                <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                  Failed
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {subscriptionStatus === 'approved' || subscriptionStatus === 'active' ? (
                                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                  Approved
                                </span>
                              ) : subscriptionStatus === 'pending' ? (
                                <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-indigo-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                  Pending
                                </span>
                              ) : subscriptionStatus === 'rejected' ? (
                                <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                  Rejected
                                </span>
                              ) : (
                                <span className="text-indigo-600 font-semibold">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-indigo-700 font-semibold">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              {payment.status === 'pending' && (
                                <div className="flex flex-col space-y-2">
                                  <button
                                    onClick={() => {
                                      const userId = payment.userId?._id || payment.userId;
                                      handleApprovePaymentAndSubscription(payment._id, userId);
                                    }}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3 py-1 rounded-xl text-sm font-bold shadow-lg border-2 border-emerald-400"
                                  >
                                    Approve Payment & Subscription
                                  </button>
                                  <button
                                    onClick={() => {
                                      const userId = payment.userId?._id || payment.userId;
                                      setRejectingSubscription({ _id: userId, name: paymentUser?.name || 'User' });
                                    }}
                                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 py-1 rounded-xl text-sm font-bold shadow-lg border-2 border-red-400"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              {payment.status === 'completed' && payment.transactionId && (
                                <p className="text-xs text-indigo-600 font-semibold">
                                  ID: {payment.transactionId}
                                </p>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {payments.filter(payment => {
                        if (paymentFilter === 'all') return true;
                        return payment.status === paymentFilter;
                      }).length === 0 && (
                        <tr>
                          <td colSpan="9" className="px-4 py-8 text-center text-indigo-900 bg-blue-50 font-semibold">
                            No payments found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reject Subscription Modal */}
            {rejectingSubscription && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 border-4 border-indigo-200 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-indigo-700">
                      Reject Subscription for {rejectingSubscription.name}
                    </h3>
                    <button
                      onClick={() => {
                        setRejectingSubscription(null);
                        setRejectionReason('');
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-indigo-700 mb-2">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      rows="4"
                      className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleRejectSubscription}
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-2 rounded-xl font-bold shadow-xl border-2 border-red-400"
                    >
                      Reject Subscription
                    </button>
                    <button
                      onClick={() => {
                        setRejectingSubscription(null);
                        setRejectionReason('');
                      }}
                      className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

