import React from 'react';
import { Link } from 'react-router-dom';

export const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-900">Kiran Dairy</Link>
          <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">Back to Home</Link>
        </div>
      </nav>
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Terms and Conditions</h1>
        <div className="prose max-w-none text-gray-700 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p className="leading-relaxed text-gray-600">Welcome to Kiran Dairy ERP. By accessing our system, you agree to these terms and conditions. These terms govern your use of the ERP and POS system provided for our branch operations. We reserve the right to update these terms at any time.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. System Usage</h2>
            <p className="leading-relaxed text-gray-600">The system is strictly for authorized personnel of Kiran Dairy. Any unauthorized access, data extraction, or sharing of credentials is strictly prohibited and will lead to immediate termination of access and potential legal action.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Privacy</h2>
            <p className="leading-relaxed text-gray-600">All sales, inventory, and staff data entered into the system remains the property of Kiran Dairy. Users must maintain the confidentiality of this data and use it solely for daily operational purposes. Do not share operational data with third parties.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Accountability</h2>
            <p className="leading-relaxed text-gray-600">Branch managers and staff are accountable for the accurate entry of sales, expenses, and inventory data. Discrepancies between system data and physical stock will be audited regularly.</p>
          </section>
        </div>
      </main>
    </div>
  );
};
