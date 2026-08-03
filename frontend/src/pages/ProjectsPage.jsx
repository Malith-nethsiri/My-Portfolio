import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowUpRight, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { getTechBadge } from '../utils/techIcons';

function ProjectsPage() {
  const { username } = useParams();
  const { user, token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(Boolean(user && user.email.split('@')[0] === username));

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await apiFetch(`/public/projects/${username}`);
        setProjects(result);
      } catch (err) {
        setError(err.message || 'Unable to load projects');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  const isOwner = Boolean(user && user.email.split('@')[0] === username);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16"><div className="skeleton h-72 rounded-3xl" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Portfolio projects</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Selected work</h1>
        </div>
        {isOwner && (
          <Button className="gap-2"><Plus className="h-4 w-4" /> Manage Projects</Button>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : projects.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No projects yet.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden p-0">
              <div className="h-52 bg-gradient-to-br from-slate-800 via-slate-700 to-primary-600" />
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900">{project.title}</h3>
                  {editing && <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><Trash2 className="h-4 w-4" /></button>}
                </div>
                <p className="text-sm text-slate-600">{project.description || 'A project story with impact and momentum.'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(project.tech_stack || []).map((tech) => (
                    <span key={tech} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600">
                      <span>{getTechBadge(tech)}</span>
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3">
                  {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900">Code <ArrowUpRight className="h-4 w-4" /></a>}
                  {project.deployed_url && <a href={project.deployed_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800">Live <ArrowUpRight className="h-4 w-4" /></a>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
