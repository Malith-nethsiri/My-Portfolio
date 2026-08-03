import { ArrowRight, CheckCircle2, Palette, NotebookText, WalletCards, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const features = [
  { icon: Palette, title: 'Customizable designs', description: 'Style every section with a polished theme system and tone that feels personal.' },
  { icon: NotebookText, title: 'Rich content', description: 'Write portfolio bios, blog entries, and project stories with a modern editor.' },
  { icon: WalletCards, title: 'Money tracker', description: 'Track income, expenses, and active credits with real-time summaries.' },
];

const stats = [
  { label: 'Designs', value: '5+' },
  { label: 'Launch time', value: 'Minutes' },
  { label: 'Tools', value: 'All-in-one' },
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
              Show off your work, publish your ideas, and manage your creative income with a modern portfolio experience built for founders, designers, and developers.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/signup">
                <Button className="px-6 py-3 text-base">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/google/login`}>
                <Button variant="outline" className="px-6 py-3 text-base bg-white">
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"/>
                  </svg>
                  Google
                </Button>
              </a>
              <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900">Sign in</Link>
            </div>
            </div>
          </div>
      </section>
    </div>
  );
}

export default LandingPage;
