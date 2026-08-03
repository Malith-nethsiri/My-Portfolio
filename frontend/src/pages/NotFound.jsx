import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-20 text-center">
      <div>
        <div className="mb-4 text-7xl font-black text-primary-600">404</div>
        <h1 className="text-4xl font-black text-slate-950">This page doesn’t exist.</h1>
        <p className="mt-4 text-lg text-slate-600">The portfolio or route you’re looking for may have moved or never existed.</p>
        <Link to="/" className="mt-8 inline-flex">
          <Button className="gap-2"><Home className="h-4 w-4" /> Back home</Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
