export default function Alert({ type = "error", children }) {
  const base = "alert";
  const classes = type === "error" ? `${base} alert-error` : type === "success" ? `${base} alert-success` : `${base} alert-info`;
  return <div className={classes}>{children}</div>;
}
