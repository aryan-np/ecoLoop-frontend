export default function Input({ label, name, id, ...props }) {
  const inputId = id || name;
  return (
    <div>
      {label && <label htmlFor={inputId} className="block text-sm mb-1 text-[color:var(--text-secondary)]">{label}</label>}
      <input
        id={inputId}
        name={name}
        className="input"
        aria-label={label || name}
        {...props}
      />
    </div>
  );
}
