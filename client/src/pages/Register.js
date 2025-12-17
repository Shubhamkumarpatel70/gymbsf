import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', gender: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If redirected from login, pre-fill email and show message
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
      if (location.state?.message) {
        setInfo(location.state.message);
      }
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const result = await register(formData.name, formData.email, formData.password, formData.gender);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-4 border-yellow-400">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-2">
          Create Your <span className="text-purple-600">Account</span>
        </h2>
        <p className="text-center text-indigo-900 mb-8 font-semibold">Join Elite Fitness today</p>

        {info && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-indigo-900 p-4 rounded-xl mb-6 shadow-xl font-semibold border-2 border-yellow-500">
            {info}
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-4 rounded-xl mb-6 shadow-xl font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-indigo-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-indigo-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-indigo-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-indigo-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-bold text-indigo-700 mb-2">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl border-2 border-indigo-500"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-indigo-900 font-semibold">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 hover:text-purple-700 font-bold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

