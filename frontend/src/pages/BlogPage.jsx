import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CalendarDays, Plus, Trash2, Pencil, Eye } from 'lucide-react';

function BlogPage() {
  const { username } = useParams();
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwner = Boolean(user && user.email.split('@')[0] === username);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await apiFetch(`/public/blog/${username}`);
        setPosts(result);
      } catch (err) {
        setError(err.message || 'Unable to load blog posts');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16"><div className="skeleton h-80 rounded-3xl" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Writing</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Latest posts</h1>
        </div>
        {isOwner && <Button className="gap-2"><Plus className="h-4 w-4" /> New Post</Button>}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : posts.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No public posts yet.</div>
      ) : (
        <div className="space-y-10">
          {posts.map((post, index) => (
            <Card key={post.id} className="overflow-hidden border-slate-200 p-0">
              <div className="grid gap-0 md:grid-cols-2">
                <div className={`order-1 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  {post.images?.length ? (
                    <img src={post.images[0].url} alt={post.title} className="h-full min-h-[260px] w-full object-cover" />
                  ) : (
                    <div className="flex min-h-[260px] items-center justify-center bg-gradient-to-br from-slate-800 to-primary-600 text-2xl font-black text-white">Journal</div>
                  )}
                </div>
                <div className={`px-6 py-8 md:px-10 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <div className="mb-4 flex items-center gap-3 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h2 className="text-3xl font-black text-slate-950">{post.title}</h2>
                  <div className="prose-rich mt-4 text-slate-700" dangerouslySetInnerHTML={{ __html: post.content || '<p>Story content coming soon.</p>' }} />
                  {isOwner && (
                    <div className="mt-6 flex gap-3">
                      <button type="button" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"><Pencil className="h-4 w-4" /> Edit</button>
                      <button type="button" className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"><Trash2 className="h-4 w-4" /> Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlogPage;
