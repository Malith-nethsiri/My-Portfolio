import {
  Menu,
  X,
  Sparkles,
  Wallet,
  LogOut,
  ChevronDown,
  EditIcon,
  BookOpenText,
  FolderKanban,
  Home,
  Mail,
  Edit,
  Edit2Icon,
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
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            <img /*to here we needs to add the profile picture or a avatar or a user icon*/
              src={
                user.avatar_url ||
                "https://placehold.co/80x80/f8fafc/0f172a?text=U"
              }
              alt={user.display_name || "User avatar"}
              className="h-8 w-8 rounded-full object-cover"
            />
          </div>
        ) : (
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
              <p className="text-xs text-slate-400">
                Create your digital story
              </p>
            </div>
          </Link>
        )}

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
                end //
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

        {isAuthenticated && user ? (
          <div className="flex flex-row items-center gap-2">
            <button
              type="button"
              className=" items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              onClick={() => navigate(`/${user.email.split("@")[0]}?edit=true`)}
            >
              <EditIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              className=" items-center gap-3 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 md:inline-flex"
          >
            Login
          </a>
        )}

        <button
          type="button"
          className="ml-2 rounded-full border border-slate-200 p-2 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
