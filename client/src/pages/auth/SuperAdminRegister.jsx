import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi.js";
import { useAuth } from "../../hooks/useAuth.js";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import logoImg from "../../assets/logo.png";

export const SuperAdminRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [superAdminKey, setSuperAdminKey] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await authApi.registerSuperAdmin({
        name,
        email,
        password,
        superAdminKey: superAdminKey || undefined,
      });

      const { user, token } = res.data.data;

      login(user, token);
      toast.success("Super Admin registered successfully!");
      navigate("/super-admin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 relative font-sans selection:bg-blue-600 selection:text-white py-8">
      <div className="-mb-6 z-10">
        <img src={logoImg} alt="Kiran Dairy Logo" className="w-32 md:w-36 h-auto object-contain mx-auto" />
      </div>
      <Card className="w-full max-w-md relative z-10" title="Super Admin Registration">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            label="Super Admin Key"
            type="password"
            value={superAdminKey}
            onChange={(e) => setSuperAdminKey(e.target.value)}
            placeholder="Required system key"
            required
            disabled={loading}
            autoComplete="new-password"
          />

          <Input
            label="Secure Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md font-bold transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-sm"
          >
            {loading ? "Creating Entry..." : "Create Super Admin"}
          </button>

          <div className="mt-4 text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link className="text-blue-600 hover:text-blue-700 font-semibold transition-colors" to="/login?role=super-admin">
                Go to Login
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};
