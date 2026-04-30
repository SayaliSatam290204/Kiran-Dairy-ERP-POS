//client/src/pages/admin/AdminProfile.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth.js";
import { authApi } from "../../api/authApi.js"; // ✅ Added API import
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Badge } from "../../components/ui/Badge.jsx";

export const AdminProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Updated with actual API Call and backend error handling
  const handlePasswordSave = async () => {
    if (!passwordData.currentPassword.trim()) {
      toast.error("Current password is required");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success(response.data.message || "Password changed successfully");
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const doLogout = () => {
    setConfirmLogout(false);
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-purple-50/30 p-8 shadow-xl shadow-slate-300/10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-100/40 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-100/30 blur-3xl" />

        <div className="relative max-w-6xl mx-auto grid gap-8 md:grid-cols-[1.6fr_1fr] items-center">
          <div>
            <p className="text-xs uppercase font-bold tracking-[0.4em] text-purple-600 mb-2">Management Portal</p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-purple-700">{user?.name || "Admin"}</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-lg">
              Welcome to your admin control center. Keep your credentials updated and manage your security settings here.
            </p>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/40 backdrop-blur-md p-6 shadow-sm ring-1 ring-slate-900/5">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-4xl font-bold text-white shadow-xl">
                {(user?.name || "A").trim().charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400">System Role</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 leading-none">
                   {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || "Admin"}
                </p>
                <Badge className="mt-2 bg-emerald-500/10 text-emerald-700 border-none">● Online Now</Badge>
              </div>
            </div>
            
            <div className="mt-6 space-y-3 rounded-2xl bg-white/60 p-4 text-sm border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">ID:</span>
                <span className="font-mono text-slate-400 uppercase">ADM-{user?._id?.slice(-6) || "77821"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verified Email:</span>
                <span className="font-medium text-slate-900">{user?.email || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid gap-8 xl:grid-cols-[1.3fr_0.95fr]">
        {/* Profile Details Card */}
        <Card className="overflow-hidden border-none shadow-xl shadow-slate-300/10 bg-white">
          <div className="h-2 bg-gradient-to-r from-blue-400 to-purple-500" />
          <div className="p-8 space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Profile Details</h2>
                <p className="text-sm text-slate-500 italic">Personal information and contact data</p>
              </div>
              <Button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className={`rounded-xl px-8 py-4 transition-all duration-300 shadow-lg ${
                  isEditing ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:scale-105"
                } text-white`}
              >
                {isEditing ? "✓ Save Changes" : "✎ Edit Profile"}
              </Button>
            </div>

            <div className="grid gap-6">
              <div className={`rounded-2xl border transition-colors p-6 ${isEditing ? 'bg-blue-50/30 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                <div className="space-y-6">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Name</label>
                    {!isEditing ? (
                      <p className="text-xl font-semibold text-slate-900">{user?.name || "Admin User"}</p>
                    ) : (
                      <Input name="name" value={formData.name} onChange={handleInputChange} className="bg-white border-blue-200 focus:ring-blue-500 text-lg py-6" />
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Email Address</label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-medium text-slate-900">{user?.email || "N/A"}</p>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px]">Read Only</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl text-slate-500">
                    Dismiss
                  </Button>
                  <Button onClick={handleSave} className="rounded-xl bg-emerald-600 px-10 text-white">
                    Apply Now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Security & Logout Sidebar */}
        <div className="space-y-6">
          <Card className="border-none bg-purple-50/50 p-6 shadow-lg shadow-purple-200/20">
            <div className="flex flex-col gap-5">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Security Center</h2>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">Update your password regularly to keep your dairy records safe.</p>
              </div>
              <Button 
                onClick={() => setShowPasswordModal(true)} 
                className="w-full rounded-xl bg-purple-600 text-white hover:bg-purple-700 py-4 font-bold transition-all shadow-md shadow-purple-200"
              >
                Change Password
              </Button>
            </div>
          </Card>

          <Card className="border-none bg-red-50/50 p-6 shadow-lg shadow-red-200/20">
            <div className="flex flex-col gap-5">
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                <span className="text-2xl">🚪</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 text-red-950">End Session</h2>
                <p className="mt-1 text-sm text-red-600/70 leading-relaxed">Securely sign out of the Kiran Dairy ERP system.</p>
              </div>
              <Button 
                onClick={() => setConfirmLogout(true)} 
                className="w-full rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-200 py-4 font-bold transition-transform active:scale-95"
              >
                Logout Now
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={confirmLogout} title="Security Alert" onClose={() => setConfirmLogout(false)}>
        <div className="text-center py-4">
          <div className="mx-auto h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to leave?</h3>
          <p className="text-slate-500 mb-8">Make sure you have saved all pending records before logging out.</p>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setConfirmLogout(false)} className="flex-1 rounded-xl py-3">Wait, Go Back</Button>
            <Button variant="danger" onClick={doLogout} className="flex-1 rounded-xl bg-red-600 text-white py-3 shadow-lg shadow-red-200">Yes, Logout</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showPasswordModal}
        title="Update Credentials"
        onClose={() => setShowPasswordModal(false)}
      >
        <div className="space-y-6 pt-4">
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 mb-2">Current Password</label>
            <Input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="bg-slate-50 border-slate-200" />
          </div>
          <div className="grid gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-2">New Password</label>
              <Input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="bg-slate-50 border-slate-200" />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-2">Confirm New Password</label>
              <Input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="bg-slate-50 border-slate-200" />
            </div>
          </div>
          <Button
            onClick={handlePasswordSave}
            disabled={passwordLoading}
            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg mt-4 shadow-xl disabled:opacity-50"
          >
            {passwordLoading ? "Processing..." : "Update Password"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};