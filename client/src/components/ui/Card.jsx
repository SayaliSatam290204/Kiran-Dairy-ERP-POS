// src/components/ui/Card.jsx
export const Card = ({ children, title, className = "" }) => {
  return (
    <div className={`bg-white rounded-none border border-[#E3DACB] p-6 ${className}`}>
      {title && <h2 className="text-xl font-serif font-bold mb-4 text-[#2B2721]">{title}</h2>}
      {children}
    </div>
  );
};