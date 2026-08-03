export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base font-bold text-slate-900">M</div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">MyPortfolio</p>
            </div>
          </div>
          <p className="max-w-sm text-sm text-slate-400">
            Build a beautiful portfolio, publish your work, and manage your creative business from one place.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Product</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Portfolio builder</li>
            <li>Blog publishing</li>
            <li>Money management</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Support</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Privacy</li>
            <li>Terms</li>
            <li>Contact</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        © 2026 MyPortfolio. Crafted for creators.
      </div>
    </footer>
  );
}

export default Footer;
