export default function Button({ children, className = "", variant = "primary", ...props }) {
  const base = "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition";
  const styles = {
    primary:  "bg-brandNavy text-white hover:opacity-90",
    secondary:"bg-white text-brandNavy border border-brandNavy/30 hover:bg-brandNavy/5",
    danger:   "bg-red-600 text-white hover:bg-red-700",
    muted:    "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
