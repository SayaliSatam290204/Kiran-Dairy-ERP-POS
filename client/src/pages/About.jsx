import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';

export const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-900">Kiran Dairy</Link>
          <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">Back to Home</Link>
        </div>
      </nav>
      <main className="flex-grow max-w-4xl mx-auto px-6 py-16 w-full flex flex-col items-center text-center">
        <img src={logoImg} alt="Kiran Dairy" className="w-32 md:w-40 h-auto mb-8 drop-shadow-sm" />
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">About Kiran Dairy</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed mb-12">
          Kiran Dairy is committed to delivering the freshest, highest quality milk and dairy products directly from local farms to your neighborhood counter. Our modern digital infrastructure ensures that every liter is tracked, maintaining quality and transparency across our entire supply chain.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 font-bold text-xl">1</div>
            <h3 className="font-bold text-xl mb-2 text-gray-900">Freshness First</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Sourced daily and processed with strict quality checks to ensure the best taste.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 font-bold text-xl">2</div>
            <h3 className="font-bold text-xl mb-2 text-gray-900">Efficient Logistics</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Optimized dispatch routing ensures timely delivery to all our branches every morning.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 font-bold text-xl">3</div>
            <h3 className="font-bold text-xl mb-2 text-gray-900">Premium Quality</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Adhering to the highest standards of food safety from the farm to the final customer.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
