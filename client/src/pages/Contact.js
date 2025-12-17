import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Sending...' });

    try {
      const res = await axios.post('http://localhost:5000/api/contact', formData);
      setStatus({ type: 'success', message: 'Message sent successfully!' });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to send message. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-700 mb-4 drop-shadow-lg">
            Get in <span className="text-purple-600">Touch</span>
          </h1>
          <p className="text-xl text-indigo-900 font-semibold">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl border-4 border-indigo-200">
              <h2 className="text-2xl font-bold text-indigo-700 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-xl border-2 border-cyan-400">
                    <FiMapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-700 mb-1">Address</h3>
                    <p className="text-indigo-900 font-semibold">
                      123 Fitness Street<br />
                      City, State 12345
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-3 rounded-xl shadow-xl border-2 border-pink-400">
                    <FiPhone className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-700 mb-1">Phone</h3>
                    <p className="text-indigo-900 font-semibold">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-xl border-2 border-emerald-400">
                    <FiMail className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-700 mb-1">Email</h3>
                    <p className="text-indigo-900 font-semibold">info@elitefitness.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t-4 border-indigo-200">
                <h3 className="font-bold text-indigo-700 mb-2">Business Hours</h3>
                <div className="text-indigo-900 space-y-1 font-semibold">
                  <p>Monday - Friday: 5:00 AM - 11:00 PM</p>
                  <p>Saturday: 6:00 AM - 10:00 PM</p>
                  <p>Sunday: 7:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl border-4 border-indigo-200">
              <h2 className="text-2xl font-bold text-indigo-700 mb-6">Send us a Message</h2>
              
              {status.message && (
                <div
                  className={`mb-6 p-4 rounded-xl shadow-xl font-semibold ${
                    status.type === 'success'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                      : status.type === 'error'
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-indigo-900'
                  }`}
                >
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-indigo-700 mb-2">
                    Name *
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
                    Email *
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
                  <label htmlFor="phone" className="block text-sm font-bold text-indigo-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-indigo-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-indigo-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-indigo-300 rounded-xl bg-blue-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-indigo-400 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl border-2 border-indigo-500"
                >
                  <FiSend />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

