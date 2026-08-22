import React from 'react';
import { Link } from 'react-router-dom';

export const FAQ = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-900">Kiran Dairy</Link>
          <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">Back to Home</Link>
        </div>
      </nav>
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Frequently Asked Questions</h1>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">How do I reset my POS password?</h3>
            <p className="text-gray-600 leading-relaxed">Please contact the central administrative team or your branch manager. For security reasons, passwords cannot be self-reset by shop staff.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What happens if the system goes offline?</h3>
            <p className="text-gray-600 leading-relaxed">The POS system requires an active internet connection to sync live data. In case of downtime, use manual ledgers as a temporary fallback and input the data once connectivity is restored.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">How do I report a discrepancy in dispatch?</h3>
            <p className="text-gray-600 leading-relaxed">Use the Returns section in your Shop Dashboard to report any damaged, leaked, or missing items received during the morning dispatch.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">How can I see my daily sales targets?</h3>
            <p className="text-gray-600 leading-relaxed">Your daily expected revenue and sales performance metrics can be viewed directly from your Shop Dashboard's main summary cards.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
