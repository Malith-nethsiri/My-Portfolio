import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Auto redirect to login after successful signup
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <Card className="w-full max-w-md p-8 space-y-8 bg-white border border-slate-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-jakarta text-slate-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4"
            >
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-slate-600">Already have an account? </span>
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Log in
            </Link>
          </div>
        </form>
        <br />
      </Card>
    </div>
  );
}
