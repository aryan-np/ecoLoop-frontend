export default function Button({ children, className = "", type = "button", ariaLabel, ...props }) {
  return (
    <button
      {...props}
      type={type}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-2 ${className} btn-primary disabled:opacity-70`}
    >
      {children}
    </button>
  );
}
