import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiHome, FiInfo, FiCreditCard, FiMail, FiLogOut, FiLogIn, FiUserPlus } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/about', label: 'About', icon: FiInfo },
    { to: '/plans', label: 'Plans', icon: FiCreditCard },
    { to: '/contact', label: 'Contact', icon: FiMail },
  ];

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl sticky top-0 z-50 border-b-4 border-yellow-400">
      <nav className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl md:text-2xl font-bold text-yellow-300 hover:text-yellow-200 transition-all transform hover:scale-105"
          >
            <div className="bg-yellow-400 text-indigo-900 p-2 rounded-xl shadow-xl border-2 border-yellow-300">
              <FiHome size={20} />
            </div>
            <span className="hidden sm:inline drop-shadow-lg">ELITE FITNESS</span>
            <span className="sm:hidden drop-shadow-lg">ELITE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-xl transition-all font-semibold ${
                    isActive(link.to)
                      ? 'bg-yellow-400 text-indigo-900 shadow-xl font-bold border-2 border-yellow-300'
                      : 'text-white hover:bg-purple-500/50 hover:text-yellow-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            {user ? (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l-2 border-yellow-400">
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white hover:bg-purple-500/50 hover:text-yellow-300 transition-all"
                >
                  <FiUser size={18} />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 px-4 py-2 rounded-xl transition-all font-bold shadow-lg hover:shadow-xl border-2 border-yellow-300"
                >
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l-2 border-yellow-400">
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white hover:bg-purple-500/50 hover:text-yellow-300 transition-all"
                >
                  <FiLogIn size={18} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 px-4 py-2 rounded-xl transition-all font-bold shadow-lg hover:shadow-xl border-2 border-yellow-300"
                >
                  <FiUserPlus size={18} />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-yellow-300 transition-colors p-2 rounded-xl hover:bg-purple-500/50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4 border-t-2 border-yellow-400 pt-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive(link.to)
                      ? 'bg-yellow-400 text-indigo-900 font-bold shadow-xl border-2 border-yellow-300'
                      : 'text-white hover:bg-purple-500/50 hover:text-yellow-300'
                  }`}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            {user ? (
              <>
                <div className="border-t-2 border-yellow-400 pt-2 mt-2">
                  <Link
                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white hover:bg-purple-500/50 hover:text-yellow-300 transition-all"
                  >
                    <FiUser size={20} />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-indigo-900 transition-all font-bold mt-2 shadow-xl border-2 border-yellow-300"
                  >
                    <FiLogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t-2 border-yellow-400 pt-2 mt-2 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white hover:bg-purple-500/50 hover:text-yellow-300 transition-all"
                >
                  <FiLogIn size={20} />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-indigo-900 transition-all font-bold shadow-xl border-2 border-yellow-300"
                >
                  <FiUserPlus size={20} />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

