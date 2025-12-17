import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      // Check if account not found, redirect to register
      if (result.code === 'ACCOUNT_NOT_FOUND' || result.message?.includes('Account not found')) {
        navigate('/register', { state: { email: formData.email, message: 'Account not found. Please create an account.' } });
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-4 border-yellow-400">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-2">
          Welcome <span className="text-purple-600">Back</span>
        </h2>
        <p className="text-center text-indigo-900 mb-8 font-semibold">Login to your account</p>

        {error && (
          <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-4 rounded-xl mb-6 shadow-xl font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold transition-all shadow-xl hover:shadow-2xl border-2 border-indigo-500"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-indigo-900 font-semibold">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-600 hover:text-purple-700 font-bold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

