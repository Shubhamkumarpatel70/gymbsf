import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin, FiHome, FiInfo, FiCreditCard, FiClock, FiHeart, FiActivity } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/about', label: 'About Us', icon: FiInfo },
    { to: '/plans', label: 'Plans', icon: FiCreditCard },
    { to: '/contact', label: 'Contact', icon: FiMail },
  ];

  const services = [
    { name: 'Personal Training', icon: FiActivity },
    { name: 'Group Classes', icon: FiHeart },
    { name: 'Nutrition Plans', icon: FiClock },
    { name: 'Online Coaching', icon: FiActivity },
  ];

  return (
    <footer className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white mt-auto border-t-4 border-yellow-400">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* About Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-yellow-400 text-indigo-900 p-2 rounded-xl shadow-xl border-2 border-yellow-300">
                <FiHome size={20} />
              </div>
              <h3 className="text-xl font-bold text-yellow-300 drop-shadow-lg">ELITE FITNESS</h3>
            </div>
            <p className="text-blue-100 mb-4 leading-relaxed font-medium">
              Transform your body, transform your life. Join us on your fitness journey with expert guidance and a supportive community.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 p-2 rounded-xl transition-all transform hover:scale-110 shadow-xl border-2 border-yellow-300"
                aria-label="Facebook"
              >
                <FiFacebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 p-2 rounded-xl transition-all transform hover:scale-110 shadow-xl border-2 border-yellow-300"
                aria-label="Twitter"
              >
                <FiTwitter size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 p-2 rounded-xl transition-all transform hover:scale-110 shadow-xl border-2 border-yellow-300"
                aria-label="Instagram"
              >
                <FiInstagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-yellow-300 flex items-center space-x-2 drop-shadow-lg">
              <FiActivity size={20} className="text-yellow-400" />
              <span>Quick Links</span>
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.to}>
                    <Link 
                      to={link.to} 
                      className="flex items-center space-x-2 text-blue-100 hover:text-yellow-300 transition-all hover:translate-x-1 font-medium"
                    >
                      <Icon size={16} />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-yellow-300 flex items-center space-x-2 drop-shadow-lg">
              <FiHeart size={20} className="text-yellow-400" />
              <span>Services</span>
            </h4>
            <ul className="space-y-3">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <li key={index} className="flex items-center space-x-2 text-blue-100 hover:text-yellow-300 transition-all font-medium">
                    <Icon size={16} />
                    <span>{service.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-yellow-300 flex items-center space-x-2 drop-shadow-lg">
              <FiMail size={20} className="text-yellow-400" />
              <span>Contact Us</span>
            </h4>
            <ul className="space-y-3 text-blue-100">
              <li className="flex items-start space-x-3">
                <FiMapPin className="text-yellow-400 mt-1 flex-shrink-0" size={18} />
                <span>123 Fitness Street, City, State 12345, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="text-yellow-400 flex-shrink-0" size={18} />
                <a href="tel:+919876543210" className="hover:text-yellow-300 transition-colors font-medium">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="text-yellow-400 flex-shrink-0" size={18} />
                <a href="mailto:info@elitefitness.com" className="hover:text-yellow-300 transition-colors break-all font-medium">
                  info@elitefitness.com
                </a>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-yellow-400 rounded-xl shadow-xl border-2 border-yellow-300">
              <p className="text-sm font-bold text-indigo-900 mb-1">Business Hours</p>
              <p className="text-xs text-indigo-800 font-semibold">Mon-Fri: 5:00 AM - 11:00 PM</p>
              <p className="text-xs text-indigo-800 font-semibold">Sat-Sun: 6:00 AM - 10:00 PM</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-yellow-400 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-blue-100 text-sm font-medium">
                &copy; {currentYear} Elite Fitness. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/about" className="text-blue-100 hover:text-yellow-300 transition-colors font-medium">
                Privacy Policy
              </Link>
              <span className="text-blue-100">|</span>
              <Link to="/contact" className="text-blue-100 hover:text-yellow-300 transition-colors font-medium">
                Terms of Service
              </Link>
              <span className="text-blue-100">|</span>
              <Link to="/contact" className="text-blue-100 hover:text-yellow-300 transition-colors font-medium">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

