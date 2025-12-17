import React, { useState, useEffect, useContext } from 'react';
import { FiUser, FiCalendar, FiActivity, FiEdit2, FiCheck, FiTarget, FiTrendingUp, FiAward, FiCreditCard, FiFilter, FiPlus, FiX } from 'react-icons/fi';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import API_URL from '../config/api';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', gender: '' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [progressStats, setProgressStats] = useState({
    totalWorkouts: 0,
    streak: 0,
    achievedGoals: 0
  });
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [workoutForm, setWorkoutForm] = useState({
    date: new Date().toISOString().split('T')[0],
    duration: '',
    notes: '',
    exercises: [{ name: '', sets: '', reps: '', weight: '', duration: '' }]
  });

  useEffect(() => {
    fetchUserData();
    fetchProgressStats();
    if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchUserData = async () => {
    try {
      const userId = user.id || user._id;
      const res = await axios.get(`${API_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUserData(res.data);
      setFormData({
        name: res.data.name || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
        gender: res.data.gender || '',
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const userId = user.id || user._id;
      const res = await axios.get(`${API_URL}/api/payments/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchProgressStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [workoutStatsRes, goalStatsRes] = await Promise.all([
        axios.get('${API_URL}/api/workouts/stats', { headers }),
        axios.get('${API_URL}/api/goals/stats', { headers })
      ]);
      
      setProgressStats({
        totalWorkouts: workoutStatsRes.data.totalWorkouts || 0,
        streak: workoutStatsRes.data.streak || 0,
        achievedGoals: goalStatsRes.data.achievedGoals || 0
      });
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    }
  };

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const exercises = workoutForm.exercises
        .filter(ex => ex.name.trim())
        .map(ex => ({
          name: ex.name,
          sets: parseInt(ex.sets) || 0,
          reps: parseInt(ex.reps) || 0,
          weight: parseFloat(ex.weight) || 0,
          duration: parseInt(ex.duration) || 0
        }));
      
      await axios.post(
        '${API_URL}/api/workouts',
        {
          date: workoutForm.date,
          exercises,
          duration: parseInt(workoutForm.duration) || 0,
          notes: workoutForm.notes
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setShowWorkoutForm(false);
      setWorkoutForm({
        date: new Date().toISOString().split('T')[0],
        duration: '',
        notes: '',
        exercises: [{ name: '', sets: '', reps: '', weight: '', duration: '' }]
      });
      fetchProgressStats();
    } catch (error) {
      console.error('Error adding workout:', error);
      alert('Failed to add workout. Please try again.');
    }
  };

  const addExerciseField = () => {
    setWorkoutForm({
      ...workoutForm,
      exercises: [...workoutForm.exercises, { name: '', sets: '', reps: '', weight: '', duration: '' }]
    });
  };

  const removeExerciseField = (index) => {
    setWorkoutForm({
      ...workoutForm,
      exercises: workoutForm.exercises.filter((_, i) => i !== index)
    });
  };

  const updateExerciseField = (index, field, value) => {
    const updatedExercises = [...workoutForm.exercises];
    updatedExercises[index][field] = value;
    setWorkoutForm({ ...workoutForm, exercises: updatedExercises });
  };

  const handleUpdate = async () => {
    try {
      const userId = user.id || user._id;
      await axios.put(
        `${API_URL}/api/users/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      await fetchUserData();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  const getDaysRemaining = () => {
    if (!userData?.subscription?.endDate) return 0;
    const endDate = new Date(userData.subscription.endDate);
    const today = new Date();
    const diff = endDate - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();

  const convertToINR = (usd) => {
    return Math.round(usd * 83);
  };

  const getFilteredTransactions = () => {
    if (transactionFilter === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.status === transactionFilter);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg border-2 border-emerald-400">
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-indigo-900 shadow-lg border-2 border-yellow-500">
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg border-2 border-red-400">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-400 text-white">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-8 drop-shadow-lg">
          Welcome, <span className="text-purple-600">{userData?.name}</span>
        </h1>

        {/* Tab Navigation */}
        <div className="mb-6 flex flex-wrap gap-2 border-b-4 border-indigo-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-bold rounded-t-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl border-2 border-indigo-500 border-b-0'
                : 'bg-white text-indigo-700 hover:bg-indigo-50 border-2 border-transparent'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 font-bold rounded-t-xl transition-all flex items-center space-x-2 ${
              activeTab === 'transactions'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl border-2 border-indigo-500 border-b-0'
                : 'bg-white text-indigo-700 hover:bg-indigo-50 border-2 border-transparent'
            }`}
          >
            <FiCreditCard />
            <span>Transactions</span>
          </button>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-4 border-indigo-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-indigo-700 flex items-center space-x-2">
                  <FiUser />
                  <span>Profile Information</span>
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 font-bold shadow-xl border-2 border-indigo-500"
                  >
                    <FiEdit2 />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-indigo-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-indigo-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-indigo-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-indigo-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={handleUpdate}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl flex items-center justify-center space-x-2 font-bold shadow-xl border-2 border-indigo-500"
                    >
                      <FiCheck />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        fetchUserData();
                      }}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-indigo-600 font-semibold mb-1">Membership ID</p>
                    {userData?.membershipId ? (
                      <p className="text-lg font-bold text-indigo-900 bg-gradient-to-r from-yellow-400 to-yellow-300 px-4 py-2 rounded-lg border-2 border-yellow-500 shadow-lg inline-block">
                        {userData.membershipId}
                      </p>
                    ) : (
                      <p className="text-lg font-bold text-indigo-600 italic">Not assigned</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-indigo-600 font-semibold mb-1">Email</p>
                    <p className="text-lg font-bold text-indigo-900">{userData?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-600 font-semibold mb-1">Phone</p>
                    <p className="text-lg font-bold text-indigo-900">
                      {userData?.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-600 font-semibold mb-1">Gender</p>
                    <p className="text-lg font-bold text-indigo-900 capitalize">
                      {userData?.gender || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-600 font-semibold mb-1">Address</p>
                    <p className="text-lg font-bold text-indigo-900">
                      {userData?.address || 'Not provided'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Section */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-4 border-indigo-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-indigo-700 flex items-center space-x-2">
                  <FiTrendingUp />
                  <span>Your Progress</span>
                </h2>
                <button
                  onClick={() => setShowWorkoutForm(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 font-bold shadow-xl border-2 border-indigo-500"
                >
                  <FiPlus />
                  <span>Log Workout</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-xl text-center shadow-xl border-2 border-cyan-400">
                  <div className="text-3xl font-bold text-white mb-2">{progressStats.totalWorkouts}</div>
                  <div className="text-sm text-blue-100 font-semibold">Workouts Completed</div>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-4 rounded-xl text-center shadow-xl border-2 border-pink-400">
                  <div className="text-3xl font-bold text-white mb-2">{progressStats.streak}</div>
                  <div className="text-sm text-pink-100 font-semibold">Days Streak</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-xl text-center shadow-xl border-2 border-emerald-400">
                  <div className="text-3xl font-bold text-white mb-2">{progressStats.achievedGoals}</div>
                  <div className="text-sm text-emerald-100 font-semibold">Goals Achieved</div>
                </div>
              </div>
            </div>

            {/* Log Workout Modal */}
            {showWorkoutForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 border-4 border-indigo-200 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-indigo-700">Log Your Workout</h3>
                    <button
                      onClick={() => {
                        setShowWorkoutForm(false);
                        setWorkoutForm({
                          date: new Date().toISOString().split('T')[0],
                          duration: '',
                          notes: '',
                          exercises: [{ name: '', sets: '', reps: '', weight: '', duration: '' }]
                        });
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                  <form onSubmit={handleAddWorkout} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-indigo-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={workoutForm.date}
                        onChange={(e) => setWorkoutForm({ ...workoutForm, date: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-indigo-700 mb-2">Total Duration (minutes)</label>
                      <input
                        type="number"
                        value={workoutForm.duration}
                        onChange={(e) => setWorkoutForm({ ...workoutForm, duration: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                        placeholder="e.g., 60"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-indigo-700 mb-2">Exercises</label>
                      {workoutForm.exercises.map((exercise, index) => (
                        <div key={index} className="mb-4 p-4 bg-blue-50 rounded-xl border-2 border-indigo-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-indigo-700">Exercise {index + 1}</span>
                            {workoutForm.exercises.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExerciseField(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiX size={18} />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={(e) => updateExerciseField(index, 'name', e.target.value)}
                              className="col-span-2 px-3 py-2 border-2 border-indigo-300 rounded-lg bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                              placeholder="Exercise name"
                            />
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => updateExerciseField(index, 'sets', e.target.value)}
                              className="px-3 py-2 border-2 border-indigo-300 rounded-lg bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                              placeholder="Sets"
                              min="0"
                            />
                            <input
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => updateExerciseField(index, 'reps', e.target.value)}
                              className="px-3 py-2 border-2 border-indigo-300 rounded-lg bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                              placeholder="Reps"
                              min="0"
                            />
                            <input
                              type="number"
                              value={exercise.weight}
                              onChange={(e) => updateExerciseField(index, 'weight', e.target.value)}
                              className="px-3 py-2 border-2 border-indigo-300 rounded-lg bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                              placeholder="Weight (kg)"
                              min="0"
                              step="0.1"
                            />
                            <input
                              type="number"
                              value={exercise.duration}
                              onChange={(e) => updateExerciseField(index, 'duration', e.target.value)}
                              className="px-3 py-2 border-2 border-indigo-300 rounded-lg bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                              placeholder="Duration (min)"
                              min="0"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addExerciseField}
                        className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-xl font-bold border-2 border-indigo-300 flex items-center justify-center space-x-2"
                      >
                        <FiPlus />
                        <span>Add Exercise</span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-indigo-700 mb-2">Notes (optional)</label>
                      <textarea
                        value={workoutForm.notes}
                        onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                        rows="3"
                        placeholder="Add any notes about your workout..."
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-bold shadow-xl border-2 border-indigo-500 flex items-center justify-center space-x-2"
                      >
                        <FiCheck />
                        <span>Save Workout</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowWorkoutForm(false);
                          setWorkoutForm({
                            date: new Date().toISOString().split('T')[0],
                            duration: '',
                            notes: '',
                            exercises: [{ name: '', sets: '', reps: '', weight: '', duration: '' }]
                          });
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

          {/* Subscription Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-4 border-indigo-200">
              <h2 className="text-xl md:text-2xl font-bold text-indigo-700 mb-6 flex items-center space-x-2">
                <FiCalendar />
                <span>Subscription</span>
              </h2>
              {userData?.subscription && userData.subscription.planId ? (
                userData.subscription.status === 'pending' ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-4 rounded-xl border-2 border-yellow-500 shadow-xl">
                      <p className="text-sm text-indigo-900 font-bold mb-2">Subscription Status</p>
                      <p className="text-xl font-bold text-indigo-900 mb-2">
                        Pending Approval
                      </p>
                      <p className="text-sm text-indigo-800 font-semibold">
                        Your subscription request is pending admin approval. You will be notified once it's reviewed.
                      </p>
                    </div>
                    {userData.subscription.planId && (
                      <div className="bg-blue-50 p-4 rounded-xl border-2 border-indigo-200">
                        <p className="text-sm text-indigo-600 font-semibold">Requested Plan</p>
                        <p className="font-bold text-indigo-900">
                          {userData.subscription.planId?.name || 'N/A'}
                        </p>
                      </div>
                    )}
                    {userData.subscription.requestedAt && (
                      <div className="bg-blue-50 p-4 rounded-xl border-2 border-indigo-200">
                        <p className="text-sm text-indigo-600 font-semibold">Requested Date</p>
                        <p className="font-bold text-indigo-900">
                          {new Date(userData.subscription.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : userData.subscription.status === 'rejected' ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 rounded-xl border-2 border-red-400 shadow-xl">
                      <p className="text-sm text-white font-bold mb-2">Subscription Status</p>
                      <p className="text-xl font-bold text-white mb-2">
                        Subscription Rejected
                      </p>
                      {userData.subscription.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-600/50 rounded-xl">
                          <p className="text-sm text-white font-semibold mb-1">Rejection Reason:</p>
                          <p className="text-white font-medium">{userData.subscription.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                    {userData.subscription.planId && (
                      <div className="bg-blue-50 p-4 rounded-xl border-2 border-indigo-200">
                        <p className="text-sm text-indigo-600 font-semibold">Requested Plan</p>
                        <p className="font-bold text-indigo-900">
                          {userData.subscription.planId?.name || 'N/A'}
                        </p>
                      </div>
                    )}
                    <a
                      href="/plans"
                      className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-bold shadow-xl border-2 border-indigo-500"
                    >
                      Subscribe to a New Plan
                    </a>
                  </div>
                ) : userData.subscription.isActive ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-xl shadow-xl border-2 border-indigo-500">
                      <p className="text-sm text-white font-semibold">Current Plan</p>
                      <p className="text-xl font-bold text-white">
                        {userData.subscription.planId?.name || 'Active Plan'}
                      </p>
                      {userData.subscription.planId && (
                        <p className="text-sm text-yellow-300 mt-1 font-semibold">
                          ₹{convertToINR(userData.subscription.planId.price).toLocaleString('en-IN')}/{userData.subscription.planId.duration}mo
                        </p>
                      )}
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border-2 border-indigo-200">
                      <p className="text-sm text-indigo-600 font-semibold">Start Date</p>
                      <p className="font-bold text-indigo-900">
                        {new Date(userData.subscription.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border-2 border-indigo-200">
                      <p className="text-sm text-indigo-600 font-semibold">End Date</p>
                      <p className="font-bold text-indigo-900">
                        {new Date(userData.subscription.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    {daysRemaining > 0 && (
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-4 rounded-xl shadow-xl border-2 border-yellow-500">
                        <p className="text-sm text-indigo-900 font-semibold">Days Remaining</p>
                        <p className="text-2xl font-bold text-indigo-900">{daysRemaining}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 rounded-xl border-2 border-red-400 shadow-xl">
                      <p className="text-sm text-white font-bold mb-2">Subscription Status</p>
                      <p className="text-xl font-bold text-white mb-2">
                        Your subscription is terminated
                      </p>
                      <p className="text-sm text-white">
                        Your subscription has been terminated by the administrator. Please contact support for more information.
                      </p>
                    </div>
                    {userData.subscription.planId && (
                      <div className="bg-blue-50 p-4 rounded-xl border-2 border-indigo-200">
                        <p className="text-sm text-indigo-600 font-semibold">Previous Plan</p>
                        <p className="font-bold text-indigo-900">
                          {userData.subscription.planId?.name || 'N/A'}
                        </p>
                      </div>
                    )}
                    <div className="bg-blue-50 p-4 rounded-xl border-2 border-indigo-200">
                      <p className="text-sm text-indigo-600 font-semibold">Terminated Date</p>
                      <p className="font-bold text-indigo-900">
                        {userData.subscription.terminatedAt 
                          ? new Date(userData.subscription.terminatedAt).toLocaleDateString()
                          : userData.subscription.endDate 
                          ? new Date(userData.subscription.endDate).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <a
                      href="/plans"
                      className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-bold shadow-xl border-2 border-indigo-500"
                    >
                      Subscribe to a New Plan
                    </a>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200 mb-6">
                    <p className="text-2xl font-bold text-indigo-900 mb-2">You have no subscription</p>
                    <p className="text-indigo-700 font-semibold mb-4">
                      Get started by choosing a subscription plan that fits your fitness goals.
                    </p>
                  </div>
                  <a
                    href="/plans"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl inline-block font-bold shadow-xl border-2 border-indigo-500 text-lg transition-all hover:shadow-2xl"
                  >
                    Buy Subscription
                  </a>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-4 border-indigo-200">
              <h2 className="text-xl md:text-2xl font-bold text-indigo-700 mb-6 flex items-center space-x-2">
                <FiActivity />
                <span>Quick Stats</span>
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-600 font-semibold">Member Since</span>
                  <span className="font-bold text-indigo-900">
                    {new Date(userData?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-600 font-semibold">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    userData?.subscription?.isActive 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                      : 'bg-gray-400 text-white'
                  }`}>
                    {userData?.subscription?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-600 font-semibold">Gender</span>
                  <span className="font-bold text-indigo-900 capitalize">
                    {userData?.gender || 'Not set'}
                  </span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-4 border-indigo-200">
              <h2 className="text-xl md:text-2xl font-bold text-indigo-700 mb-6 flex items-center space-x-2">
                <FiAward />
                <span>Achievements</span>
              </h2>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl flex items-center space-x-3 shadow-xl border-2 border-indigo-500">
                  <FiTarget className="text-yellow-300" size={24} />
                  <div>
                    <p className="font-bold text-white">New Member</p>
                    <p className="text-sm text-blue-100">Welcome to Elite Fitness!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Transactions Tab Content */}
        {activeTab === 'transactions' && (
          <div>
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-4 border-indigo-200 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-indigo-700 flex items-center space-x-2">
                  <FiCreditCard />
                  <span>Your Transactions</span>
                </h2>
                
                {/* Filter Options */}
                <div className="flex items-center space-x-2">
                  <FiFilter className="text-indigo-600" />
                  <select
                    value={transactionFilter}
                    onChange={(e) => setTransactionFilter(e.target.value)}
                    className="px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold"
                  >
                    <option value="all">All Transactions</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <FiCreditCard className="mx-auto text-6xl text-indigo-300 mb-4" />
                  <p className="text-indigo-900 font-semibold text-lg">No transactions found</p>
                  <p className="text-indigo-600 mt-2">Your payment history will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 border-b-4 border-indigo-500">
                      <tr>
                        <th className="px-4 py-3 text-left text-white font-bold">Plan</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Original Amount</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Discount</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Final Amount</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Coupon Code</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Transaction ID</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Status</th>
                        <th className="px-4 py-3 text-left text-white font-bold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredTransactions().map((transaction) => (
                        <tr key={transaction._id} className="border-b-2 border-indigo-200 hover:bg-blue-50 bg-white">
                          <td className="px-4 py-3">
                            <span className="font-bold text-indigo-900">
                              {transaction.planId?.name || 'N/A'}
                            </span>
                            {transaction.planId?.duration && (
                              <span className="text-sm text-indigo-600 block">
                                {transaction.planId.duration} months
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-indigo-900">
                              ₹{Math.round(transaction.originalAmount || transaction.amount).toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {transaction.discountAmount > 0 ? (
                              <span className="font-bold text-emerald-600">
                                -₹{Math.round(transaction.discountAmount).toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-indigo-600 font-semibold">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-indigo-900">
                              ₹{Math.round(transaction.amount).toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {transaction.couponCode ? (
                              <span className="font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg border-2 border-purple-300">
                                {transaction.couponCode}
                              </span>
                            ) : (
                              <span className="text-indigo-600 font-semibold">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {transaction.transactionId ? (
                              <span className="font-bold text-indigo-900 text-sm bg-blue-50 px-3 py-1 rounded-lg border-2 border-indigo-300">
                                {transaction.transactionId}
                              </span>
                            ) : (
                              <span className="text-indigo-600 font-semibold italic">Not provided</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="px-4 py-3 text-indigo-700 font-semibold">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                            <span className="text-xs text-indigo-600 block">
                              {new Date(transaction.createdAt).toLocaleTimeString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {getFilteredTransactions().length === 0 && transactions.length > 0 && (
                    <div className="text-center py-8">
                      <p className="text-indigo-900 font-semibold">No transactions match the selected filter</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

