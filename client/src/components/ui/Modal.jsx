import { Button } from './Button.jsx';

export const Modal = ({ isOpen, title, onClose, children, className = '', size = 'md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
          {
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl',
            '2xl': 'max-w-3xl',
            '3xl': 'max-w-5xl'
          }[size] || 'max-w-md'
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        <div className="p-6">
          {children}
        </div>

      </div>
    </div>
  );
};

