export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${className}`}
      {...props}
    />
  );
}
