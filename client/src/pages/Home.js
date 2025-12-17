import React from 'react';
import { Link } from 'react-router-dom';
import { FiActivity, FiHeart, FiTarget, FiUsers } from 'react-icons/fi';

const Home = () => {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-indigo-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
              Transform Your Body,{' '}
              <span className="text-yellow-300 drop-shadow-xl">Transform Your Life</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 drop-shadow-lg font-medium">
              Join Elite Fitness and start your journey to a healthier, stronger you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/plans"
                className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-110 shadow-2xl border-4 border-yellow-300"
              >
                Get Started
              </Link>
              <Link
                to="/about"
                className="bg-white hover:bg-blue-50 text-indigo-600 px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-110 shadow-2xl border-4 border-white"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-indigo-700">
            Why Choose <span className="text-purple-600">Elite Fitness?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-2xl shadow-2xl text-center hover:shadow-cyan-500/50 transition-all transform hover:scale-110 border-4 border-cyan-400">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-yellow-300">
                <FiActivity className="text-indigo-900" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Modern Equipment</h3>
              <p className="text-blue-100 font-semibold">
                State-of-the-art fitness equipment for all your training needs
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-2xl shadow-2xl text-center hover:shadow-pink-500/50 transition-all transform hover:scale-110 border-4 border-pink-400">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-yellow-300">
                <FiHeart className="text-indigo-900" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Expert Trainers</h3>
              <p className="text-pink-100 font-semibold">
                Certified professionals to guide you on your fitness journey
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-2xl text-center hover:shadow-emerald-500/50 transition-all transform hover:scale-110 border-4 border-emerald-400">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-yellow-300">
                <FiTarget className="text-indigo-900" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Personalized Plans</h3>
              <p className="text-emerald-100 font-semibold">
                Custom workout and nutrition plans tailored to your goals
              </p>
            </div>

            <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-6 rounded-2xl shadow-2xl text-center hover:shadow-violet-500/50 transition-all transform hover:scale-110 border-4 border-violet-400">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-yellow-300">
                <FiUsers className="text-indigo-900" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Community Support</h3>
              <p className="text-violet-100 font-semibold">
                Join a supportive community of fitness enthusiasts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-purple-600/40"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-300 drop-shadow-2xl">
            Ready to Start Your Fitness Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100 font-bold">
            Choose a plan that fits your lifestyle and goals
          </p>
          <Link
            to="/plans"
            className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 px-8 py-4 rounded-xl text-lg font-bold inline-block transition-all transform hover:scale-110 shadow-2xl border-4 border-yellow-300"
          >
            View Plans
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

