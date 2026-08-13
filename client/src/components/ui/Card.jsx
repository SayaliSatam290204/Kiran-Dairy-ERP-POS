// src/components/ui/Card.jsx
export const Card = ({ children, title, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {title && <h2 className="text-xl font-sans font-bold mb-4 text-gray-900">{title}</h2>}
      {children}
    </div>
  );
};