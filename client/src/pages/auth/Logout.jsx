import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

export const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    logout();          // clear auth
    navigate("/", { replace: true });  // ALWAYS go to landing
  }, [logout, navigate]);

  return null;
};