import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import LandingPage from "./pages/Landing";
import PortfolioPage from "./pages/PortfolioPage";
import ProjectsPage from "./pages/ProjectsPage";
import BlogPage from "./pages/BlogPage";
import MoneyPage from "./pages/MoneyPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import "./index.css";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading your workspace…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppShell() {
  const location = useLocation();
  const HideNavbarpaths = ["/login", "/signup", "/auth/callback", "/"];
  const ShouldhideNavbar = HideNavbarpaths.includes(location.pathname);

  const showFooterPaths = ["/", "/login", "/signup", "/auth/callback"];
  const shouldHideFooter = !showFooterPaths.includes(location.pathname);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {!ShouldhideNavbar && <Navbar />}
      <main
        className={`min-h-[calc(100vh-140px)] ${ShouldhideNavbar ? "" : "pt-16"} ${shouldHideFooter ? "" : "pb-16"}`}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/:username" element={<PortfolioPage />} />
          <Route path="/:username/projects" element={<ProjectsPage />} />
          <Route path="/:username/blog" element={<BlogPage />} />
          <Route
            path="/:username/money"
            element={
              <ProtectedRoute>
                <MoneyPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!shouldHideFooter && <Footer />}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
