export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium " +
        "bg-gray-900 text-white hover:bg-gray-800 active:scale-[.99] " +
        "disabled:opacity-60 disabled:cursor-not-allowed " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
