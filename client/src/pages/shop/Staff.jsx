import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { staffApi } from "../../api/staffApi.js";
import { shopApi } from "../../api/shopApi.js";
import { useAuth } from "../../hooks/useAuth.js";
import { Card } from "../../components/ui/Card.jsx";
import { StaffPerformanceModal } from "../../components/StaffPerformanceModal.jsx";

export const ShopStaff = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);

  // Fetch staff on mount
  useEffect(() => {
    if (user?.shopId) {
      fetchStaff();
    }
  }, [user?.shopId]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getStaffByShop(user.shopId);
      setStaff(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch staff");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPerformance = async (staffMember) => {
    setSelectedStaff(staffMember);
    setShowPerformanceModal(true);
    setPerformanceLoading(true);
    
    try {
      const response = await shopApi.getStaffDetailedPerformance(staffMember._id);
      setPerformanceData(response.data.data);
    } catch (error) {
      toast.error("Failed to load performance data");
      console.error(error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const handleClosePerformanceModal = () => {
    setShowPerformanceModal(false);
    setSelectedStaff(null);
    setPerformanceData(null);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Directory</h1>
        <p className="text-sm text-gray-600 mt-1">
          View branch staff performance. Contact admin to manage staff details.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="ml-3 text-gray-500">Loading staff directory...</p>
        </div>
      ) : staff.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">No staff members assigned to this branch.</p>
        </Card>
      ) : (
        /* Staff Grid Layout - Consistent with ERP Plan Section 2 */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {staff.map((member) => (
            <Card key={member._id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                    <p className="text-xs text-gray-500">{member.phone}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {member.status}
                  </span>
                </div>

                {/* Shift Badges */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {member.shifts?.map((shift) => (
                    <span key={shift} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded border border-blue-100">
                      {shift}
                    </span>
                  ))}
                </div>

                {/* Performance Metric - Highlighted as per plan */}
                <div className="bg-emerald-50 p-3 rounded-lg mb-4">
                  <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Weekly Sales</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {member.perfMetrics?.weeklySales || 0} <span className="text-sm font-normal">units</span>
                  </p>
                </div>

                {/* Advance Balance Info */}
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Advance Balance</span>
                  <span className={`text-sm font-bold ${
                    member.advanceBalance > 0 ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    ₹{member.advanceBalance || 0}
                  </span>
                </div>

                <button
                  onClick={() => handleViewPerformance(member)}
                  disabled={performanceLoading}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg font-bold text-sm transition-colors duration-200 flex justify-center items-center"
                >
                  {performanceLoading && selectedStaff?._id === member._id ? (
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    "View Detailed Performance"
                  )}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Performance Modal Integration */}
      {showPerformanceModal && selectedStaff && (
        <StaffPerformanceModal
          isOpen={showPerformanceModal}
          onClose={handleClosePerformanceModal}
          staff={selectedStaff}
          performance={performanceData}
          loading={performanceLoading}
        />
      )}
    </div>
  );
};