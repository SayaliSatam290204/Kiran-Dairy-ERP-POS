import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi.js";
import { useAuth } from "../../hooks/useAuth.js";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import logoImg from "../../assets/logo.png";

export const AdminRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [adminKey, setAdminKey] = useState("");
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
      const res = await authApi.registerAdmin({
        name,
        email,
        password,
        adminKey: adminKey || undefined,
      });

      const { user, token } = res.data.data;

      login(user, token);
      toast.success("Admin registered successfully!");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F0] p-4 relative font-sans selection:bg-[#5B7A4F] selection:text-white py-8">
      <div className="-mb-6 z-10">
        <img src={logoImg} alt="Kiran Dairy Logo" className="w-32 md:w-36 h-auto object-contain mx-auto" />
      </div>
      <Card className="w-full max-w-md relative z-10" title="Admin Registration">
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
            label="Admin Key"
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
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
            className="w-full py-3 rounded-sm font-bold transition-colors bg-[#5B7A4F] hover:bg-[#4a6340] text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-sm"
          >
            {loading ? "Creating Entry..." : "Create Admin Account"}
          </button>

          <div className="mt-4 text-center pt-4 border-t border-[#E3DACB]">
            <p className="text-sm text-[#2B2721]/70">
              Already have an account?{" "}
              <Link className="text-[#5B7A4F] hover:text-[#4a6340] font-semibold transition-colors" to="/login?role=admin">
                Go to Login
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};