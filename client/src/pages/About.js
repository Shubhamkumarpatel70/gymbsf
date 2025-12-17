import React from 'react';
import { FiAward, FiTrendingUp, FiClock, FiShield } from 'react-icons/fi';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 drop-shadow-2xl">
            About <span className="text-yellow-300 drop-shadow-xl">Elite Fitness</span>
          </h1>
          <p className="text-xl text-center text-blue-100 max-w-2xl mx-auto drop-shadow-lg font-medium">
            We're dedicated to helping you achieve your fitness goals with world-class facilities and expert guidance
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700">Our Story</h2>
            <div className="mx-auto text-indigo-900">
              <p className="text-base md:text-lg mb-4 leading-relaxed font-semibold">
                Elite Fitness was founded with a simple mission: to make premium fitness accessible to everyone. 
                Since our opening, we've helped thousands of members transform their lives through fitness.
              </p>
              <p className="text-base md:text-lg mb-4 leading-relaxed font-semibold">
                Our state-of-the-art facility features the latest equipment, expert trainers, and a supportive 
                community that motivates you to push beyond your limits. We believe that fitness is not just about 
                physical strength, but mental resilience and overall well-being.
              </p>
              <p className="text-base md:text-lg leading-relaxed font-semibold">
                Whether you're a beginner or a seasoned athlete, we have the resources, expertise, and community 
                to help you achieve your goals. Join us and become part of the Elite Fitness family.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-indigo-700">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-2xl border-4 border-cyan-400 shadow-2xl">
              <div className="bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-yellow-300">
                <FiAward className="text-indigo-900" size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Excellence</h3>
              <p className="text-blue-100 font-semibold">
                We strive for excellence in everything we do, from our facilities to our service
              </p>
            </div>

            <div className="text-center bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-2xl border-4 border-pink-400 shadow-2xl">
              <div className="bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-yellow-300">
                <FiTrendingUp className="text-indigo-900" size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Progress</h3>
              <p className="text-pink-100 font-semibold">
                We celebrate every step of your journey, no matter how small
              </p>
            </div>

            <div className="text-center bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl border-4 border-emerald-400 shadow-2xl">
              <div className="bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-yellow-300">
                <FiClock className="text-indigo-900" size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Commitment</h3>
              <p className="text-emerald-100 font-semibold">
                We're committed to your success and will support you every step of the way
              </p>
            </div>

            <div className="text-center bg-gradient-to-br from-violet-500 to-purple-600 p-6 rounded-2xl border-4 border-violet-400 shadow-2xl">
              <div className="bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-yellow-300">
                <FiShield className="text-indigo-900" size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Safety</h3>
              <p className="text-violet-100 font-semibold">
                Your safety and well-being are our top priorities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-purple-600/40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-yellow-300 drop-shadow-2xl">10+</div>
              <div className="text-lg text-blue-100 font-semibold">Years of Excellence</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-yellow-300 drop-shadow-2xl">5000+</div>
              <div className="text-lg text-blue-100 font-semibold">Happy Members</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-yellow-300 drop-shadow-2xl">50+</div>
              <div className="text-lg text-blue-100 font-semibold">Expert Trainers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-yellow-300 drop-shadow-2xl">24/7</div>
              <div className="text-lg text-blue-100 font-semibold">Access Available</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

