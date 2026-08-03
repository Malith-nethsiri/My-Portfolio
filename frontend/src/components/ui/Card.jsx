export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}
