import React, { useState, useRef } from "react";

export default function OTPInput({ value, onChange, length = 6 }) {
  const [otp, setOtp] = useState(value.split("") || Array(length).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (index, digit) => {
    if (!/^\d*$/.test(digit)) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Auto focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-between">
      {Array(length)
        .fill("")
        .map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength="1"
            inputMode="numeric"
            value={otp[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-14 h-14 text-2xl font-bold text-center border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition"
          />
        ))}
    </div>
  );
}
