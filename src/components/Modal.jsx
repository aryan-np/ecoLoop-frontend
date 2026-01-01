import { useEffect } from "react";

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = "info", 
  autoClose = true, 
  duration = 4000 
}) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      bg: "bg-green-50",
      border: "border-green-300",
      icon: "✓",
      iconBg: "bg-green-500",
      textColor: "text-green-700",
      title: "Success",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-300",
      icon: "✕",
      iconBg: "bg-red-500",
      textColor: "text-red-700",
      title: "Error",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      icon: "⚠",
      iconBg: "bg-yellow-500",
      textColor: "text-yellow-700",
      title: "Warning",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-300",
      icon: "ℹ",
      iconBg: "bg-blue-500",
      textColor: "text-blue-700",
      title: "Info",
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative ${config.bg} border-2 ${config.border} rounded-lg shadow-2xl max-w-sm mx-4 p-8 animate-in fade-in zoom-in-95 duration-300`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition text-2xl"
        >
          ✕
        </button>

        {/* Icon */}
        <div className={`${config.iconBg} text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold mb-4 mx-auto`}>
          {config.icon}
        </div>

        {/* Title */}
        <h2 className={`text-xl font-bold ${config.textColor} text-center mb-2`}>
          {title || config.title}
        </h2>

        {/* Message */}
        <p className={`${config.textColor} text-center mb-6 text-sm leading-relaxed`}>
          {message}
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition ${config.iconBg} hover:opacity-90`}
        >
          OK
        </button>
      </div>
    </div>
  );
}
