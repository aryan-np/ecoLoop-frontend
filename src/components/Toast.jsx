import React, { useState, useEffect } from "react";

export default function Toast({ message, type = "success", duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const bgColor = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  }[type] || "bg-green-50 border-green-200";

  const textColor = {
    success: "text-green-700",
    error: "text-red-700",
    warning: "text-yellow-700",
    info: "text-blue-700",
  }[type] || "text-green-700";

  const icon = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  }[type] || "✓";

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`${bgColor} border rounded-lg shadow-md px-4 py-2 flex items-center gap-2 max-w-xs opacity-90 animate-fade-out`}>
        <span className={`text-lg font-bold ${textColor}`}>{icon}</span>
        <p className={`${textColor} font-medium text-sm`}>{message}</p>
      </div>
      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-out {
          animation: fadeOut 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
