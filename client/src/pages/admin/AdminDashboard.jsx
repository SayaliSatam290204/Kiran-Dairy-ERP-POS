import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FaStore,
  FaBoxes,
  FaTruck,
  FaRupeeSign,
  FaUsers,
  FaUndoAlt,
} from "react-icons/fa";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { adminApi } from "../../api/adminApi.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalShops: 0,
    totalStock: 0,
    totalDispatches: 0,
    dispatchesByStatus: [],
    totalStaff: 0,
    activeStaff: 0,
    totalRevenue: 0,
    pendingReturns: 0,
    topPerformers: [],
    activeShops: [],
  });
  const [rawResponse, setRawResponse] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getDashboard();
        // Debug: log response to help identify missing/incorrect data shape
        console.debug("[AdminDashboard] dashboard response:", response);
        setRawResponse(response.data || response);
        setStats(response.data?.data || {});

      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
        toast.error(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Shops Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Shops</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalShops}</p>
                  <p className="text-xs text-gray-500 mt-1">Active branches</p>
                </div>
                <FaStore className="text-4xl text-blue-400 opacity-30" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Stock</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalStock}</p>
                  <p className="text-xs text-gray-500 mt-1">Units in inventory</p>
                </div>
                <FaBoxes className="text-3xl text-green-400" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Dispatches</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalDispatches}</p>
                  <p className="text-xs text-gray-500 mt-1">All shipments</p>
                  {stats.dispatchesByStatus && stats.dispatchesByStatus.length > 0 && (
                    <div className="mt-2 text-xs space-y-1">
                      {stats.dispatchesByStatus.map((status) => (
                        <p key={status._id} className="text-gray-600">
                          {status._id || "Unknown"}:{" "}
                          <span className="font-semibold">{status.count}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <FaTruck className="text-4xl text-purple-400 opacity-30" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
                  <p className="text-3xl font-bold text-orange-600">{formatCurrency(stats.totalRevenue || 0)}</p>
                  <p className="text-xs text-gray-500 mt-1">Overall earnings</p>
                </div>
                <FaRupeeSign className="text-4xl text-orange-400 opacity-30" />
              </div>
            </Card>
          </div>

          {/* Staff & Returns Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Shop Management Card */}
            <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Shops</p>
                  <p className="text-3xl font-bold text-cyan-600">{stats.totalShops}</p>
                  <p className="text-xs text-gray-500 mt-1">Active branches</p>
                </div>
                <FaStore className="text-4xl text-cyan-400 opacity-30" />
              </div>
              <Button
                onClick={() => navigate("/admin/shops")}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-sm"
              >
                Manage Shops
              </Button>
            </Card>

            {/* Staff Management Card */}
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Staff Management</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {stats.activeStaff}/{stats.totalStaff}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Active / Total staff</p>
                </div>
                <FaUsers className="text-4xl text-indigo-400 opacity-30" />
              </div>
              <Button
                onClick={() => navigate("/admin/staff")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
              >
                Manage Staff
              </Button>
            </Card>

            {/* Returns Card */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Pending Returns</p>
                  <p className="text-3xl font-bold text-red-600">{stats.pendingReturns}</p>
                  <p className="text-xs text-gray-500 mt-1">Return requests</p>
                </div>
                <FaUndoAlt className="text-4xl text-red-400 opacity-30" />
              </div>
              <Button
                onClick={() => navigate("/admin/returns")}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                View Returns
              </Button>
            </Card>
          </div>

          {/* Top Performers */}
          {stats.topPerformers && stats.topPerformers.length > 0 && (
            <Card
            title="Top Performers"
            className="bg-gradient-to-r from-gray-50 to-gray-100"
            >
              <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                {/* Table Header */}
                <thead>
                  <tr className="border-b bg-gray-50">
                    
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                      Name
                    </th>

                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                      Shop
                    </th>

                    <th className="px-3 py-2 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">
                    Monthly Revenue
                    </th>

                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-gray-200">
                  
                  {stats.topPerformers.slice(0, 5).map((performer, idx) => (
                    <tr
                    key={idx}
                    className="hover:bg-white transition duration-150"
                    >
                      
                {/* Name */}
                <td className="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {performer.name}
                </td>
                
                {/* Shop */}
                <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                  {performer.shopId?.name || "N/A"}
                </td>

                {/* Revenue */}
                <td className="px-3 py-2 text-sm text-right font-semibold text-green-600 whitespace-nowrap">
                  {formatCurrency(
                    performer.monthlyPerformance?.totalAmount || 0
                  )}
                </td>

            </tr>
          ))}

        </tbody>
      </table>
    </div>
  </Card>
)}
        </>
      )}

      {import.meta.env.DEV && (
        <>
          <button
            onClick={() => setShowDebug((s) => !s)}
            className="fixed right-4 bottom-4 z-50 bg-black/70 text-white px-3 py-2 rounded-lg text-sm shadow-lg"
          >
            {showDebug ? "Hide" : "Show"} Debug
          </button>

          {showDebug && rawResponse && (
            <div className="fixed right-4 bottom-16 z-50 w-[420px] max-h-[60vh] overflow-auto bg-white/95 border border-slate-200 rounded-lg p-3 shadow-2xl text-xs">
              <div className="flex justify-between items-center mb-2">
                <strong className="text-sm">Dashboard Response</strong>
                <button onClick={() => setRawResponse(null)} className="text-red-500 text-xs">Clear</button>
              </div>
              <pre className="whitespace-pre-wrap break-words text-[11px]">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};
