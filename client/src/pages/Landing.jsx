import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaChartBar, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaTruck, 
  FaMoneyBillWave 
} from "react-icons/fa";
import { shopApi } from "../api/shopApi.js";
import { authApi } from "../api/authApi.js";
import { BranchRevenueBarChart, TopBranchesBarChart, StaffPerformanceBar } from "../components/common/ChartContainer.jsx";
import dashboardImg from "../assets/POS Dashboard.jpeg";
import logoImg from "../assets/logo.png";

export const Landing = () => {
  const [metrics, setMetrics] = useState({
    activeShops: 42,
    todayDispatches: 1250,
    dailyRevenue: 850000,
    activeStaff: 156
  });

  const [previewData, setPreviewData] = useState(null);
  const [dataError, setDataError] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [superAdminExists, setSuperAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const res = await authApi.adminExists();
        setAdminExists(res.data.data.adminExists);
        setSuperAdminExists(res.data.data.superAdminExists);
      } catch (err) {
        console.error("Failed to fetch admin status", err);
      } finally {
        setCheckingAdmin(false);
      }
    };

    fetchAdminStatus();
  }, []);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await shopApi.getPreviewData();
        if (response.data.success) {
          setPreviewData(response.data.data);
          setDataError(false);
        }
      } catch (error) {
        console.error("Preview data fetch failed:", error);
        setDataError(true);
        // Fallback data
        setPreviewData({
          performance: [
            { shopName: "Kharadi Branch", actualRevenue: 45000, expectedRevenue: 48000 },
            { shopName: "Viman Nagar", actualRevenue: 52000, expectedRevenue: 50000 },
            { shopName: "Kalyani Nagar", actualRevenue: 38000, expectedRevenue: 40000 },
            { shopName: "Magarpatta", actualRevenue: 41000, expectedRevenue: 41000 }
          ],
          topBranches: [
            { shopName: "Viman Nagar", revenue: 52000, totalTransactions: 124 },
            { shopName: "Kharadi Branch", revenue: 45000, totalTransactions: 98 },
            { shopName: "Magarpatta", revenue: 41000, totalTransactions: 87 }
          ],
          staff: [
            { name: "Rahul D.", sales: 18, amount: 24500 },
            { name: "Amit S.", sales: 15, amount: 19800 },
            { name: "Priya M.", sales: 12, amount: 16400 }
          ]
        });
      }
    };

    fetchPreview();
  }, []);

  const adminLink = checkingAdmin ? "#" : adminExists ? "/login?role=admin" : "/admin/register";
  const superAdminLink = checkingAdmin ? "#" : superAdminExists ? "/login?role=super-admin" : "/super-admin/register";

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#2B2721] font-sans selection:bg-[#5B7A4F] selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-[#E3DACB] bg-[#FAF7F0]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="Kiran Dairy Logo" className="w-16 h-auto md:w-20 object-contain" />
              <span className="font-serif text-2xl font-bold tracking-tight">Kiran Dairy</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to={superAdminLink} 
                className="text-sm font-semibold hover:text-[#5B7A4F] transition-colors"
              >
                Owner Portal
              </Link>
              <Link 
                to={adminLink}
                className="text-sm font-semibold hover:text-[#5B7A4F] transition-colors"
              >
                Admin Register
              </Link>
              <Link 
                to="/login?role=shop" 
                className="px-5 py-2.5 bg-[#5B7A4F] text-[#FAF7F0] text-sm font-semibold rounded hover:bg-[#4a6340] transition-colors shadow-sm"
              >
                Open POS
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E3DACB] bg-white text-xs font-semibold mb-8 text-[#5B7A4F]">
          <span className="w-2 h-2 rounded-full bg-[#5B7A4F] animate-pulse"></span>
          System Online
        </div>
        
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
          Run your dairy operations <br className="hidden md:block" />
          <span className="text-[#5B7A4F]">from farm to counter.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#2B2721]/80 mb-10 font-medium">
          A robust, physical-first ERP and Point of Sale built specifically for the daily demands of milk processing, dispatch logistics, and retail branches.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link 
            to={adminLink} 
            className="w-full sm:w-auto px-8 py-3.5 bg-[#5B7A4F] text-[#FAF7F0] font-semibold rounded hover:bg-[#4a6340] transition-colors shadow-sm text-lg"
          >
            Start Operations
          </Link>
          <a 
            href="#metrics" 
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent border-2 border-[#2B2721] text-[#2B2721] font-semibold rounded hover:bg-[#2B2721] hover:text-[#FAF7F0] transition-colors text-lg"
          >
            View Live Ledger
          </a>
        </div>
      </div>

      {/* Dashboard Preview - Styled as a Physical Ledger/Invoice Book */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="relative bg-[#FAF7F0] p-2 md:p-4 rounded-sm border-[3px] border-[#2B2721] shadow-[8px_8px_0px_#2B2721] max-w-5xl mx-auto">
          {/* Subtle inner border to mimic a page inset */}
          <div className="border border-[#E3DACB] bg-white p-1 md:p-2 h-full w-full">
            <img 
              src={dashboardImg} 
              alt="Kiran Dairy POS Dashboard" 
              className="w-full rounded shadow-sm border border-[#E3DACB]"
            />
          </div>
          {/* Decorative Stamp Detail */}
          <div className="absolute -bottom-4 -right-4 w-12 h-12 border-2 border-[#C77B3F] text-[#C77B3F] font-serif font-bold rounded-full flex items-center justify-center rotate-12 bg-[#FAF7F0]">
            OK
          </div>
        </div>
      </div>

      {/* Process Strip Section */}
      <div className="border-y border-[#E3DACB] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">The Dairy Supply Chain</h2>
            <p className="text-[#2B2721]/70 max-w-2xl mx-auto">Complete oversight of your milk's journey. Track every liter, every crate, and every rupee across your entire operation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-0 items-start relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-[#E3DACB]"></div>

            {[
              { title: "Farm", desc: "Milk collection & testing", icon: FaUsers },
              { title: "Processing", desc: "Batch management & inventory", icon: FaChartBar },
              { title: "Dispatch", desc: "Route & crate logistics", icon: FaTruck, highlight: true },
              { title: "Shop", desc: "Daily retail POS", icon: FaMapMarkerAlt },
              { title: "Customer", desc: "Billing & accounts", icon: FaMoneyBillWave },
            ].map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center px-2">
                <div className={`w-12 h-12 flex items-center justify-center rounded bg-white border-2 z-10 mb-4 transition-colors ${
                  step.highlight ? "border-[#C77B3F] text-[#C77B3F]" : "border-[#2B2721] text-[#2B2721]"
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg mb-1">{step.title}</h3>
                <p className="text-sm text-[#2B2721]/70 leading-snug">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live System Metrics (Khata/Ledger Style) */}
      <div id="metrics" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 border-b-2 border-[#2B2721] pb-4">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">Daily Operations Ledger</h2>
            <p className="text-[#2B2721]/70">Real-time performance metrics across all active branches.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#5B7A4F]/10 border border-[#5B7A4F]/20 rounded text-sm font-semibold text-[#5B7A4F]">
            <span className={`w-2 h-2 rounded-full ${dataError ? "bg-amber-500" : "bg-[#5B7A4F] animate-pulse"}`}></span>
            {dataError ? "OFFLINE FALLBACK" : "LIVE SYNCED"}
          </div>
        </div>

        {previewData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-[#E3DACB] p-6 rounded-none">
              <div className="border-b border-[#E3DACB] pb-4 mb-6">
                <h3 className="font-serif font-bold text-xl">Branch Revenue vs Expected</h3>
              </div>
              <div className="h-[300px]">
                <BranchRevenueBarChart data={previewData.performance} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="bg-white border border-[#E3DACB] p-6 rounded-none">
                <div className="border-b border-[#E3DACB] pb-4 mb-6">
                  <h3 className="font-serif font-bold text-xl">Top Branches</h3>
                </div>
                <div className="h-[200px]">
                  <TopBranchesBarChart data={previewData.topBranches} />
                </div>
              </div>
              
              <div className="bg-white border border-[#E3DACB] p-6 rounded-none">
                <div className="border-b border-[#E3DACB] pb-4 mb-6">
                  <h3 className="font-serif font-bold text-xl">Staff Performance</h3>
                </div>
                <div className="h-[200px]">
                  <StaffPerformanceBar data={previewData.staff} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-[#2B2721] text-[#FAF7F0] py-24 border-t-8 border-[#5B7A4F]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Ready to digitize your dairy?</h2>
          <p className="text-[#FAF7F0]/80 text-lg mb-10 max-w-2xl mx-auto">
            Replace manual ledgers and guesswork with exact inventory tracking, streamlined dispatch, and fast point-of-sale billing.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to={adminLink} 
              className="px-8 py-3.5 bg-[#5B7A4F] text-[#FAF7F0] font-semibold rounded hover:bg-[#4a6340] transition-colors text-lg"
            >
              Register Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E3DACB] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Kiran Dairy Logo" className="w-12 h-auto md:w-16 object-contain" />
            <span className="font-serif font-bold tracking-tight text-lg">Kiran Dairy ERP</span>
          </div>
          
          <div className="text-sm text-[#2B2721]/60">
            &copy; {new Date().getFullYear()} Kiran Dairy Operations. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;