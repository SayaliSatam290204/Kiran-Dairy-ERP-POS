import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { staffPaymentApi } from "../../api/staffPaymentApi.js";
import { staffApi } from "../../api/staffApi.js";
import { useAuth } from "../../hooks/useAuth.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Card } from "../../components/ui/Card.jsx";

export const StaffPayment = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    month: "",
    status: "",
    staffId: ""
});
  
const [formData, setFormData] = useState({
    staffId: "",
    amount: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "cash",
    month: "",
    notes: "",
    isAdvance: false
  });
  const [selectedStaffAdvance, setSelectedStaffAdvance] = useState(0);

// Fetch payments and staff on mount
  useEffect(() => {
    fetchPayments();
    fetchStaff();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await staffPaymentApi.getAllPayments(filters);
      setPayments(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

const fetchStaff = async () => {
    try {
      const response = await staffApi.getAllStaff();
      const staffData = response.data.data;
      setStaff(staffData);
      
      // Check for pre-filled staff payment from Staff page
      const prefillData = localStorage.getItem('prefillStaffPayment');
      if (prefillData) {
        try {
          const data = JSON.parse(prefillData);
          if (data.staffId) {
            setFormData(prev => ({ ...prev, staffId: data.staffId, isAdvance: data.isAdvance || false }));
            // Set advance balance preview
            const selectedStaffMember = staffData.find(s => s._id === data.staffId);
            if (selectedStaffMember) {
              setSelectedStaffAdvance(selectedStaffMember.advanceBalance || 0);
            }
            // Show modal after brief delay to ensure modal is ready
            setTimeout(() => {
              setShowModal(true);
            }, 150);
          }
        } catch (e) {
          console.error('Error parsing prefill data', e);
        }
        // Clear the prefill data after use
        localStorage.removeItem('prefillStaffPayment');
      }
    } catch (error) {
      toast.error("Failed to fetch staff");
    }
  };

const handleOpenModal = (payment = null) => {
    if (payment) {
      setEditingId(payment._id);
      setFormData({
        staffId: payment.staffId._id,
        amount: payment.amount,
        paymentDate: payment.paymentDate.split('T')[0],
        paymentMethod: payment.paymentMethod,
        month: payment.month,
        notes: payment.notes || "",
        isAdvance: payment.isAdvance || false
      });
    }
    setShowModal(true);
    
    // When staff is selected, show their advance balance
    if (formData.staffId) {
      const selectedStaffMember = staff.find(s => s._id === formData.staffId);
      if (selectedStaffMember) {
        setSelectedStaffAdvance(selectedStaffMember.advanceBalance || 0);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      staffId: "",
      amount: "",
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: "cash",
      month: "",
      notes: "",
      isAdvance: false
    });
  };

const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // When staff is selected, show their advance balance
    if (name === 'staffId' && value) {
      const selectedStaffMember = staff.find(s => s._id === value);
      setSelectedStaffAdvance(selectedStaffMember?.advanceBalance || 0);
    }
  };

  const handleChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchPayments();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffId || !formData.amount || !formData.month) {
      return toast.error("Please fill all required fields");
    }

    try {
      const payload = {
        ...formData,
        paymentPeriod: {
          startDate: new Date(formData.month + '-01'),
          endDate: new Date(formData.month + '-28')
        }
      };

      if (editingId) {
        await staffPaymentApi.updatePayment(editingId, payload);
        toast.success("Payment updated successfully");
      } else {
        await staffPaymentApi.createPayment(payload);
        toast.success("Payment created successfully");
      }
      handleCloseModal();
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;

    try {
      await staffPaymentApi.deletePayment(id);
      toast.success("Payment deleted successfully");
      fetchPayments();
    } catch (error) {
      toast.error("Failed to delete payment");
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await staffPaymentApi.updatePayment(id, { status: 'completed' });
      toast.success("Payment marked as completed");
      fetchPayments();
    } catch (error) {
      toast.error("Failed to update payment");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Staff Payments</h1>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          + Add Payment
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-gray-800">Staff</label>
            <select
              name="staffId"
              value={filters.staffId}
              onChange={handleChangeFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Staff</option>
              {staff.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Month"
            name="month"
            type="month"
            value={filters.month}
            onChange={handleChangeFilter}
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-gray-800">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleChangeFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleApplyFilters}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">No payments found. Add one to get started.</p>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
<tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Staff Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Deductions</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Month</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment Method</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment Date</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map(payment => (
<tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.staffId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">₹{payment.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {payment.deductionAmount > 0 ? (
                      <span className="text-red-600 font-semibold">₹{payment.deductionAmount}</span>
                    ) : payment.isAdvance ? (
                      <span className="text-green-600 font-semibold">-₹{payment.advanceAmount}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.month}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.paymentMethod}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    {payment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleMarkPaid(payment._id)}
                          className="text-green-600 hover:text-green-700 font-semibold"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => handleOpenModal(payment)}
                          className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(payment._id)}
                          className="text-red-600 hover:text-red-700 font-semibold"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {payment.status !== 'pending' && (
                      <button
                        onClick={() => handleOpenModal(payment)}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? "Edit Payment" : "Create Payment"}>
          <form onSubmit={handleSubmit} className="space-y-4">
<div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-800">Staff *</label>
              <select
                name="staffId"
                value={formData.staffId}
                onChange={handleChangeForm}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Staff</option>
                {staff.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              {formData.staffId && selectedStaffAdvance > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm font-semibold text-yellow-800">
                    Outstanding Advance: ₹{selectedStaffAdvance}
                  </p>
                  <p className="text-xs text-yellow-600">
                    This amount will be deducted from the salary payment
                  </p>
                </div>
              )}
            </div>

<Input
              label="Amount *"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChangeForm}
              required
            />
            
            {/* Deduction Preview - Shows when staff has outstanding advance */}
            {formData.staffId && formData.amount && selectedStaffAdvance > 0 && !formData.isAdvance && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-bold text-red-800 mb-2">💰 Salary Deduction Calculation:</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Outstanding Advance: <span className="font-semibold">₹{selectedStaffAdvance}</span></p>
                  <p>Salary Amount: <span className="font-semibold">₹{formData.amount}</span></p>
                  <p className="border-t border-red-200 my-1"></p>
                  {selectedStaffAdvance >= formData.amount ? (
                    <>
                      <p>Deduction: <span className="font-semibold text-red-600">₹{formData.amount}</span></p>
                      <p>Remaining Balance After: <span className="font-semibold">₹{selectedStaffAdvance - formData.amount}</span></p>
                      <p className="text-xs text-gray-500 mt-1">(Full salary will be deducted as advance repayment)</p>
                    </>
                  ) : (
                    <>
                      <p>Deduction: <span className="font-semibold text-red-600">₹{selectedStaffAdvance}</span></p>
                      <p>Net Salary to Pay: <span className="font-semibold text-green-600">₹{formData.amount - selectedStaffAdvance}</span></p>
                    </>
                  )}
                </div>
              </div>
            )}

            <Input
              label="Payment Month *"
              name="month"
              type="month"
              value={formData.month}
              onChange={handleChangeForm}
              required
            />

            <Input
              label="Payment Date"
              name="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={handleChangeForm}
            />

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-800">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChangeForm}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
<option value="online">Online</option>
              </select>
            </div>

            <Input
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChangeForm}
            />

<div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isAdvance"
                  checked={formData.isAdvance}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAdvance: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-sm font-semibold text-gray-800">Is Advance Payment?</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Check this if giving an advance (increments staff's advance balance)
              </p>
            </div>

            {/* Advance Payment Preview - Shows when giving advance */}
            {formData.staffId && formData.amount && formData.isAdvance && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm font-bold text-green-800 mb-2">📌 Advance Payment Summary:</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Current Balance: <span className="font-semibold">₹{selectedStaffAdvance}</span></p>
                  <p>New Advance: <span className="font-semibold text-green-600">+₹{formData.amount}</span></p>
                  <p className="border-t border-green-200 my-1"></p>
                  <p>New Total Balance: <span className="font-bold text-green-700">₹{selectedStaffAdvance + parseFloat(formData.amount || 0)}</span></p>
                  <p className="text-xs text-gray-500 mt-1">(This amount will be deducted from future salary payments)</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {editingId ? "Update Payment" : "Create Payment"}
              </Button>
              <Button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
