import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaCrown, FaUserTie, FaStore, FaArrowLeft } from "react-icons/fa";
import { authApi } from "../../api/authApi.js";
import { useAuth } from "../../hooks/useAuth.js";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import logoImg from "../../assets/logo.png";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    if (roleParam && !selectedRole) {
      handleRoleSelect(roleParam);
    }
  }, [roleParam, selectedRole]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);


    setError("");
  };

  const handleBackToRoleSelect = () => {
    setSelectedRole(null);
    setEmail("");
    setPhone("");
    setPassword("");
    setError("");
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const payload = {
        email: selectedRole === "shop" ? email.trim() : email.trim().toLowerCase(),
        password
      };

      const response = await authApi.login(payload);

      const { token, user } = response.data.data;

      if (user.role !== selectedRole) {
        setError(
          `This account is not a ${selectedRole} account. Please use the correct credentials.`
        );
        toast.error(`Account role mismatch. Expected ${selectedRole}, got ${user.role}`);
        setLoading(false);
        return;
      }

      console.log('Login successful. User data:', user);

      login(user, token);

      let dashboardRoute;
      if (selectedRole === "super-admin") {
        dashboardRoute = "/super-admin/dashboard";
      } else if (selectedRole === "admin") {
        dashboardRoute = "/admin/dashboard";
      } else {
        dashboardRoute = "/shop/dashboard";
      }

      toast.success(
        `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} login successful!`
      );
      navigate(dashboardRoute);
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
      // Removed navigate("/", { replace: true }) to allow user to retry without losing selected role
    } finally {
      setLoading(false);
    }
  };

  // Skip role selection if role from URL param
  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-8 relative z-10 shadow-sm">
          <div className="text-center mb-8">
            <img src={logoImg} alt="Kiran Dairy Logo" className="w-32 h-auto mx-auto object-contain mb-2" />
            <h1 className="text-3xl font-sans font-bold text-gray-900 tracking-tight">
              Kiran Dairy
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Select access level</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect("super-admin")}
              className="w-full group bg-white hover:bg-gray-50 border-[2px] border-gray-200 hover:border-gray-900 text-gray-900 p-4 rounded-lg transition-all duration-300 flex items-center gap-4"
            >
              <div className="w-10 h-10 border border-gray-200 bg-white flex items-center justify-center group-hover:border-gray-900 transition-colors text-gray-900">
                <FaCrown size={18} />
              </div>
              <div className="text-left">
                <div className="font-bold font-sans">Super Admin</div>
                <div className="text-xs text-gray-500">System owner access</div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect("admin")}
              className="w-full group bg-white hover:bg-gray-50 border-[2px] border-gray-200 hover:border-gray-900 text-gray-900 p-4 rounded-lg transition-all duration-300 flex items-center gap-4"
            >
              <div className="w-10 h-10 border border-gray-200 bg-white flex items-center justify-center group-hover:border-gray-900 transition-colors text-gray-900">
                <FaUserTie size={18} />
              </div>
              <div className="text-left">
                <div className="font-bold font-sans">Admin</div>
                <div className="text-xs text-gray-500">Manage shops & inventory</div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect("shop")}
              className="w-full group bg-white hover:bg-gray-50 border-[2px] border-gray-200 hover:border-gray-900 text-gray-900 p-4 rounded-lg transition-all duration-300 flex items-center gap-4"
            >
              <div className="w-10 h-10 border border-gray-200 bg-white flex items-center justify-center group-hover:border-gray-900 transition-colors text-gray-900">
                <FaStore size={18} />
              </div>
              <div className="text-left">
                <div className="font-bold font-sans">Shop POS</div>
                <div className="text-xs text-gray-500">Point of sale access</div>
              </div>
            </button>
          </div>

          <div className="mt-8 text-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/admin/register")}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Need an Admin Account? Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 relative font-sans selection:bg-blue-600 selection:text-white py-8">
      <div className="-mb-6 z-10">
        <img src={logoImg} alt="Kiran Dairy Logo" className="w-32 md:w-36 h-auto object-contain mx-auto" />
      </div>
      <Card
        className="w-full max-w-md relative z-10"
        title={`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Sign In`}
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedRole === "admin" || selectedRole === "super-admin" || selectedRole === "shop" ? (
            <Input
              label={selectedRole === "shop" ? "Shop Name" : "Email Address"}
              type={selectedRole === "shop" ? "text" : "email"}
              placeholder={
                selectedRole === "shop"
                  ? "Enter shop identifier"
                  : "name@kirandairy.com"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          ) : null}

          <div className="space-y-3">
            <Input
              label="Secure Password"
              type={showPassword ? "text" : "password"}
              autoComplete={showPassword ? "off" : "current-password"}
              placeholder="Enter your credentials"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            {selectedRole === "shop" && (
              <p className="text-xs text-gray-400 font-medium">
                Note: Shop associates must use the credentials assigned by the administrative office.
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3 rounded-md font-bold transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-sm"
          >
            {loading ? "Authenticating..." : "Access Ledger"}
          </button>
        </form>

        {roleParam && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full text-center py-2.5 border-[2px] border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white text-gray-900 font-bold transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              <FaArrowLeft className="text-sm" /> Return to Home
            </button>
          </div>
        )}
        {!roleParam && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleBackToRoleSelect}
              className="w-full text-center py-2.5 border-[2px] border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white text-gray-900 font-bold transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              <FaArrowLeft className="text-sm" /> Change Role
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};