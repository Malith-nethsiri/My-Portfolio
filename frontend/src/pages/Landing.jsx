import {
  ArrowRight,
  CheckCircle2,
  Palette,
  NotebookText,
  WalletCards,
  Sparkles,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const features = [
  {
    icon: Palette,
    title: "Customizable designs",
    description:
      "Style every section with a polished theme system and tone that feels personal.",
  },
  {
    icon: NotebookText,
    title: "Rich content",
    description:
      "Write portfolio bios, blog entries, and project stories with a modern editor.",
  },
  {
    icon: WalletCards,
    title: "Money tracker",
    description:
      "Track income, expenses, and active credits with real-time summaries.",
  },
];

const stats = [
  { label: "Designs", value: "5+" },
  { label: "Launch time", value: "Minutes" },
  { label: "Tools", value: "All-in-one" },
];

function LandingPage() {
  return (
    <div className="pb-16">
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div>
            <h1 className="max-w-xl font-quicksand text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
              Create your portfolio
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              Show off your work, publish your ideas, and manage your creative
              income with a modern portfolio experience built for founders,
              designers, and developers.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/signup">
                <Button className="px-6 py-3 text-base">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
