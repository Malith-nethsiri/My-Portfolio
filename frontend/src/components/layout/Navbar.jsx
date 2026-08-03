import {
  Menu,
  X,
  Sparkles,
  Wallet,
  LogOut,
  ChevronDown,
  UserCircle2,
  BookOpenText,
  FolderKanban,
  Home,
  Mail,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isPortfolioPage = /^\/[a-zA-Z0-9._-]+$/.test(location.pathname);

  const publicLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "#about", label: "About", icon: Sparkles, isAnchor: true },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/blog", label: "Blog", icon: BookOpenText },
    { to: "#contact", label: "Contact", icon: Mail, isAnchor: true },
  ];

  const handleLogout = () => {
    logout();
    setAvatarOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to={isAuthenticated && user ? `/${user.email.split("@")[0]}` : "/"}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
            M
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              MyPortfolio
            </p>
            <p className="text-xs text-slate-400">Create your digital story</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {!isAuthenticated &&
            publicLinks.map((link) =>
              link.isAnchor ? (
                <a
                  key={link.label}
                  href={link.to}
                  className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-2 text-sm font-medium transition ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`
                  }
                >
                  {link.label}
                </NavLink>
              ),
            )}

          {isAuthenticated && user && (
            <>
              <NavLink
                to={`/${user.email.split("@")[0]}`}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`
                }
              >
                Portfolio
              </NavLink>
              <NavLink
                to={`/${user.email.split("@")[0]}/projects`}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`
                }
              >
                Projects
              </NavLink>
              <NavLink
                to={`/${user.email.split("@")[0]}/blog`}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`
                }
              >
                Blog
              </NavLink>
              <NavLink
                to={`/${user.email.split("@")[0]}/money`}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`
                }
              >
                Money
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-slate-300"
              >
                <img
                  src={
                    user.avatar_url ||
                    "https://placehold.co/80x80/f8fafc/0f172a?text=U"
                  }
                  alt={user.display_name || "User avatar"}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden text-sm font-medium text-slate-700 md:block">
                  {user.display_name || user.email.split("@")[0]}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>

              {avatarOpen && (
                <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() =>
                      navigate(`/${user.email.split("@")[0]}?edit=true`)
                    }
                  >
                    <UserCircle2 className="h-4 w-4" /> Settings
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/auth/google/login`}
              className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 md:inline-flex"
            >
              Sign Up with Google
            </a>
          )}

          <button
            type="button"
            className="ml-2 rounded-full border border-slate-200 p-2 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
            {publicLinks.map((link) => (
              <a
                key={link.label}
                href={link.to}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </a>
            ))}
            {isAuthenticated && user && (
              <>
                <Link
                  to={`/${user.email.split("@")[0]}`}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Portfolio
                </Link>
                <Link
                  to={`/${user.email.split("@")[0]}/money`}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Money
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
