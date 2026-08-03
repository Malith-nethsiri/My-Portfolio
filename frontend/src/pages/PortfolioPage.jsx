import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { apiFetch, buildImageUrl } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ExternalLink, Eye, EyeOff, GripVertical, Pencil, Plus, Save, Sparkles, X } from 'lucide-react';
import { getTechBadge } from '../utils/techIcons';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';

const defaultSections = [
  { section_type: 'hero', visible: true, order_index: 0 },
  { section_type: 'about', visible: true, order_index: 1 },
  { section_type: 'skills', visible: true, order_index: 2 },
  { section_type: 'featured_projects', visible: true, order_index: 3 },
  { section_type: 'gallery', visible: true, order_index: 4 },
  { section_type: 'contact', visible: true, order_index: 5 },
];

function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, LinkExtension.configure({ openOnClick: false })],
    content: value || '<p>Start writing…</p>',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'min-h-[180px] w-full rounded-2xl border border-slate-200 bg-white p-4 prose-rich outline-none focus:ring-2 focus:ring-primary-200',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p>Start writing…</p>', { emitUpdate: false });
    }
  }, [editor, value]);

  return <EditorContent editor={editor} />;
}

function SectionHeader({ title, icon }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">{icon}</div>
      <h2 className="text-2xl font-black text-slate-900">{title}</h2>
    </div>
  );
}

function PortfolioPage() {
  const { username } = useParams();
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(Boolean(searchParams.get('edit')) && user && user.email.split('@')[0] === username);
  const [editorState, setEditorState] = useState(null);
  const [pendingDesign, setPendingDesign] = useState(null);
  const [showDesignPanel, setShowDesignPanel] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);

  const isOwner = Boolean(user && user.email && user.email.split('@')[0] === username);

  useEffect(() => {
    async function fetchPortfolio() {
      setLoading(true);
      try {
        const data = await apiFetch(`/public/portfolio/${username}`);
        setPortfolio(data);
      } catch (err) {
        setError(err.message || 'Portfolio unavailable');
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, [username]);

  useEffect(() => {
    if (editing && portfolio) {
      setPendingDesign(portfolio.design_settings || {});
    }
  }, [editing, portfolio]);

  const visibleSections = useMemo(() => {
    if (!portfolio || !Array.isArray(portfolio.sections)) return [];
    return [...portfolio.sections]
      .filter((section) => section.visible)
      .sort((a, b) => a.order_index - b.order_index);
  }, [portfolio]);

  const savePortfolio = async () => {
    if (!portfolio || !token) return;
    try {
      await apiFetch('/portfolio', {
        method: 'PUT',
        body: JSON.stringify({
          bio: portfolio.bio,
          skills: portfolio.skills,
          design_settings: pendingDesign || portfolio.design_settings,
          social_links: portfolio.social_links,
        }),
      });

      await apiFetch('/portfolio/sections', {
        method: 'PUT',
        body: JSON.stringify(
          (portfolio.sections || defaultSections).map((section) => ({
            section_type: section.section_type,
            visible: section.visible,
            order_index: section.order_index,
          }))
        ),
      });

      const fresh = await apiFetch(`/public/portfolio/${username}`);
      setPortfolio(fresh);
      setEditing(false);
      setSearchParams({});
    } catch (err) {
      setError(err.message || 'Could not save changes');
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16"><div className="skeleton h-72 rounded-3xl" /></div>;
  }

  if (error || !portfolio) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-4xl font-black">Portfolio not found</h1></div>;
  }

  const designStyles = {
    background: pendingDesign?.background || portfolio.design_settings?.background || '#f8fafc',
    color: pendingDesign?.text_color || portfolio.design_settings?.text_color || '#0f172a',
    fontFamily: pendingDesign?.font_family || portfolio.design_settings?.font_family || 'Inter, sans-serif',
    fontSize: `${pendingDesign?.base_font_size || portfolio.design_settings?.base_font_size || 18}px`,
    '--heading-scale': pendingDesign?.heading_scale || portfolio.design_settings?.heading_scale || 1,
  };

  return (
    <div className="pt-8" style={designStyles}>
      {isOwner && editing && (
        <div className="sticky top-20 z-40 mx-auto mb-6 flex max-w-5xl items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><Sparkles className="h-4 w-4 text-primary-600" /> Editing – {username}</div>
          <div className="flex gap-2">
            <Button onClick={savePortfolio} className="gap-2">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
            <Button variant="muted" onClick={() => setShowDesignPanel(true)}>Design</Button>
            <Button variant="muted" onClick={() => setShowAddSection(true)}>Add Section</Button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        {visibleSections.map((section) => {
          const key = section.section_type;

          if (key === 'hero') {
            return (
              <section key={key} className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-white to-violet-100" />
                <div className="relative grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Available for freelance work</p>
                    <h1 className="max-w-xl font-display text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
                      {portfolio.user.display_name || username}
                    </h1>
                    <div className="mt-4 max-w-xl text-lg text-slate-600" dangerouslySetInnerHTML={{ __html: portfolio.bio || '<p>Creative developer building meaningful digital experiences.</p>' }} />
                    {isOwner && editing && (
                      <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700" onClick={() => setEditorState('bio')}>
                        <Pencil className="h-4 w-4" /> Edit bio
                      </button>
                    )}
                  </div>
                  <div className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-glow">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-300">Featured</span>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200">Ready</span>
                    </div>
                    <div className="grid gap-3">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                          <div className="mb-2 h-20 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500" />
                          <div className="h-2.5 w-2/3 rounded bg-slate-700" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          if (key === 'about') {
            return (
              <section key={key} className="py-16">
                <SectionHeader title="About" icon="✦" />
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm" dangerouslySetInnerHTML={{ __html: portfolio.bio || '<p>More about this creator…</p>' }} />
              </section>
            );
          }

          if (key === 'skills') {
            return (
              <section key={key} className="py-10">
                <SectionHeader title="Skills" icon="⚡" />
                <div className="flex flex-wrap gap-3">
                  {(portfolio.skills || 'FastAPI, React, Design, Strategy').split(',').map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                      <span>{getTechBadge(skill)}</span>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </section>
            );
          }

          if (key === 'featured_projects') {
            return (
              <section key={key} className="py-10">
                <SectionHeader title="Featured Projects" icon="▣" />
                <div className="grid gap-6 md:grid-cols-3">
                  {(portfolio.featured_projects || []).map((project) => (
                    <Card key={project.id} className="overflow-hidden p-0">
                      <div className="h-48 bg-gradient-to-br from-slate-800 via-slate-700 to-primary-600" />
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-slate-900">{project.title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{project.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(project.tech_stack || []).slice(0, 4).map((tech) => (
                            <span key={tech} className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600">{getTechBadge(tech)} {tech}</span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            );
          }

          if (key === 'gallery') {
            return (
              <section key={key} className="py-10">
                <SectionHeader title="Gallery" icon="◌" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(portfolio.gallery || []).map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <img src={buildImageUrl(image.url)} alt={image.alt_text || 'Gallery'} className="h-64 w-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (key === 'contact') {
            return (
              <section key={key} id="contact" className="py-12">
                <div className="rounded-[2rem] bg-slate-950 p-8 text-white">
                  <h2 className="text-3xl font-black">Let’s build something meaningful.</h2>
                  <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-300">
                    <a href={`mailto:${portfolio.contact?.email || portfolio.user.email}`} className="rounded-full border border-slate-700 px-4 py-2 hover:border-slate-500">Email</a>
                    {portfolio.social_links && Object.entries(portfolio.social_links).map(([label, href]) => (
                      <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 hover:border-slate-500">
                        {label} <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          return null;
        })}
      </div>

      {isOwner && editing && editorState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Edit content</h3>
              <button type="button" onClick={() => setEditorState(null)} className="rounded-full p-2 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <RichTextEditor
              value={portfolio.bio || '<p>Tell your story…</p>'}
              onChange={(value) => {
                setPortfolio((prev) => ({ ...prev, bio: value }));
              }}
            />
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="muted" onClick={() => setEditorState(null)}>Cancel</Button>
              <Button onClick={() => setEditorState(null)}>Apply</Button>
            </div>
          </div>
        </div>
      )}

      {isOwner && editing && showDesignPanel && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-slate-200 bg-white p-6 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-black">Design settings</h3>
            <button type="button" onClick={() => setShowDesignPanel(false)} className="rounded-full p-2 hover:bg-slate-100"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {['light', 'dark', 'blue', 'violet'].map((theme) => (
                  <button key={theme} type="button" onClick={() => {
                    const themes = {
                      light: { background: '#f8fafc', text_color: '#0f172a', font_family: 'Inter, sans-serif' },
                      dark: { background: '#020617', text_color: '#e2e8f0', font_family: 'Inter, sans-serif' },
                      blue: { background: '#eff6ff', text_color: '#0f172a', font_family: 'Poppins, sans-serif' },
                      violet: { background: '#f5f3ff', text_color: '#1f2937', font_family: 'Poppins, sans-serif' },
                    };
                    setPendingDesign((prev) => ({ ...prev, ...themes[theme] }));
                  }} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                    {theme}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Base font size</label>
              <input type="range" min="14" max="22" value={pendingDesign?.base_font_size || 18} onChange={(event) => setPendingDesign((prev) => ({ ...prev, base_font_size: Number(event.target.value) }))} className="w-full" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Heading scale</label>
              <input type="range" min="0.8" max="1.5" step="0.05" value={pendingDesign?.heading_scale || 1} onChange={(event) => setPendingDesign((prev) => ({ ...prev, heading_scale: Number(event.target.value) }))} className="w-full" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Font family</label>
              <select value={pendingDesign?.font_family || 'Inter, sans-serif'} onChange={(event) => setPendingDesign((prev) => ({ ...prev, font_family: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <option value="Inter, sans-serif">Inter</option>
                <option value="Poppins, sans-serif">Poppins</option>
                <option value="Georgia, serif">Georgia</option>
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <Button variant="muted" onClick={() => setShowDesignPanel(false)}>Close</Button>
            <Button onClick={() => { setPortfolio((prev) => ({ ...prev, design_settings: pendingDesign || prev.design_settings })); setShowDesignPanel(false); }}>Apply</Button>
          </div>
        </div>
      )}

      {isOwner && editing && showAddSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Add section</h3>
              <button type="button" onClick={() => setShowAddSection(false)} className="rounded-full p-2 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              {['about', 'skills', 'gallery', 'featured_projects', 'contact'].map((name) => {
                const exists = (portfolio.sections || []).some((section) => section.section_type === name && section.visible);
                return (
                  <button key={name} type="button" disabled={exists} onClick={() => {
                    const next = [...(portfolio.sections || [])];
                    next.push({ section_type: name, visible: true, order_index: next.length });
                    setPortfolio((prev) => ({ ...prev, sections: next }));
                    setShowAddSection(false);
                  }} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
                    <span>{name}</span>
                    {exists ? <Eye className="h-4 w-4 text-emerald-600" /> : <Plus className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioPage;
