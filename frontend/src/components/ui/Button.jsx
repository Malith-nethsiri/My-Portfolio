export function Button({ children, variant = 'primary', className = '', type = 'button', ...props }) {
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-500 shadow-glow',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800',
    muted: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
    ghost: 'bg-white/5 text-slate-700 hover:bg-slate-100 border border-slate-200',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
