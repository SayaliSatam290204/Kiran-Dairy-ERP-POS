// src/components/ui/Input.jsx
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-semibold mb-2 text-[#2B2721]">{label}</label>}
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full px-3 py-2 border-[2px] rounded-sm outline-none transition font-sans
            ${disabled ? "bg-gray-100 cursor-not-allowed text-[#2B2721]/50" : "bg-white text-[#2B2721]"}
            border-[#E3DACB] focus:ring-0 focus:border-[#5B7A4F]
            ${isPassword ? "pr-10" : ""}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#2B2721]/50 hover:text-[#2B2721] transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
    </div>
  );
};