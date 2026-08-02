import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost:8000/api'

const emptyPortfolio = {
  bio: '',
  skills: '',
  design_settings: '{\n  "primary": "#000000"\n}',
  social_links: '{\n  "github": ""\n}',
}

const emptyProject = {
  title: '',
  description: '',
  github_url: '',
  deployed_url: '',
  tech_stack: '',
  is_featured: false,
}

const emptyBlog = {
  title: '',
  content: '',
  is_public: false,
}

const emptyMoney = {
  type: 'INCOME',
  amount: '',
  category: '',
  note: '',
  date: new Date().toISOString().slice(0, 10),
}

function readToken() {
  return localStorage.getItem('myportfolio_token') || ''
}

async function apiFetch(path, options = {}) {
  const token = readToken()
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  })

  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    throw new Error(data?.detail || JSON.stringify(data) || 'Request failed')
  }

  return data
}

async function apiUpload(path, formData) {
  const token = readToken()
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    throw new Error(data?.detail || JSON.stringify(data) || 'Upload failed')
  }
  return data
}

function App() {
  const [route, setRoute] = useState(window.location.pathname)
  const [token, setToken] = useState(readToken())
  const [user, setUser] = useState(null)
  const [portfolio, setPortfolio] = useState(null)
  const [projects, setProjects] = useState([])
  const [posts, setPosts] = useState([])
  const [money, setMoney] = useState([])
  const [credits, setCredits] = useState([])
  const [publicData, setPublicData] = useState(null)
  const [portfolioForm, setPortfolioForm] = useState(emptyPortfolio)
  const [projectForm, setProjectForm] = useState(emptyProject)
  const [blogForm, setBlogForm] = useState(emptyBlog)
  const [moneyForm, setMoneyForm] = useState(emptyMoney)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (token) {
      loadDashboardData()
    }
  }, [token])

  const authUser = useMemo(() => user || JSON.parse(localStorage.getItem('myportfolio_user') || 'null'), [user])

  async function loadDashboardData() {
    try {
      const me = await apiFetch('/me')
      setUser(me)
      localStorage.setItem('myportfolio_user', JSON.stringify(me))
      const portfolioData = await apiFetch('/portfolio')
      setPortfolio(portfolioData)
      setPortfolioForm({
        bio: portfolioData.bio || '',
        skills: portfolioData.skills || '',
        design_settings: JSON.stringify(portfolioData.design_settings || {}, null, 2),
        social_links: JSON.stringify(portfolioData.social_links || {}, null, 2),
      })

      const projectsData = await apiFetch('/projects')
      setProjects(projectsData)

      const blogData = await apiFetch('/blog')
      setPosts(blogData)

      const moneyData = await apiFetch('/money')
      setMoney(moneyData)

      const creditsData = await apiFetch('/money/credits')
      setCredits(creditsData)
    } catch (error) {
      setStatus(error.message)
    }
  }

  async function handleGoogleLogin() {
    try {
      setLoading(true)
      const data = await fetch(`${API_BASE}/auth/google/login`).then((r) => r.json())
      window.location.href = data.authorization_url
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenFromQuery = params.get('token')
    if (tokenFromQuery) {
      localStorage.setItem('myportfolio_token', tokenFromQuery)
      setToken(tokenFromQuery)
      window.history.replaceState({}, '', '/')
    }
  }, [])

  async function handlePortfolioSave(e) {
    e.preventDefault()
    try {
      setLoading(true)
      const payload = {
        bio: portfolioForm.bio,
        skills: portfolioForm.skills,
        design_settings: JSON.parse(portfolioForm.design_settings || '{}'),
        social_links: JSON.parse(portfolioForm.social_links || '{}'),
      }
      await apiFetch('/portfolio', { method: 'PUT', body: JSON.stringify(payload) })
      setStatus('Portfolio updated')
      await loadDashboardData()
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePortfolioUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    try {
      setLoading(true)
      await apiUpload('/portfolio/gallery/upload', formData)
      setStatus('Gallery images uploaded')
      await loadDashboardData()
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  async function handleProjectSave(e) {
    e.preventDefault()
    try {
      setLoading(true)
      const payload = {
        ...projectForm,
        tech_stack: projectForm.tech_stack ? projectForm.tech_stack.split(',').map((v) => v.trim()).filter(Boolean) : [],
      }
      if (projectForm.id) {
        await apiFetch(`/projects/${projectForm.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await apiFetch('/projects', { method: 'POST', body: JSON.stringify(payload) })
      }
      setProjectForm(emptyProject)
      setStatus('Project saved')
      await loadDashboardData()
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleBlogSave(e) {
    e.preventDefault()
    try {
      setLoading(true)
      const payload = {
        title: blogForm.title,
        content: blogForm.content,
        is_public: blogForm.is_public,
      }
      if (blogForm.id) {
        await apiFetch(`/blog/${blogForm.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await apiFetch('/blog', { method: 'POST', body: JSON.stringify(payload) })
      }
      setBlogForm(emptyBlog)
      setStatus('Blog post saved')
      await loadDashboardData()
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleMoneySave(e) {
    e.preventDefault()
    try {
      setLoading(true)
      const payload = { ...moneyForm }
      if (moneyForm.id) {
        await apiFetch(`/money/${moneyForm.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await apiFetch('/money', { method: 'POST', body: JSON.stringify(payload) })
      }
      setMoneyForm(emptyMoney)
      setStatus('Money entry saved')
      await loadDashboardData()
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePublicView() {
    try {
      setLoading(true)
      const username = authUser?.email || 'test@example.com'
      const data = await fetch(`${API_BASE}/public/portfolio/${username}`).then((r) => r.json())
      setPublicData(data)
      setRoute(`/public/${username}`)
      window.history.pushState({}, '', `/public/${username}`)
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function onDeleteAccount() {
    if (!window.confirm('Delete account?')) return
    await apiFetch('/account', { method: 'DELETE' })
    localStorage.removeItem('myportfolio_token')
    localStorage.removeItem('myportfolio_user')
    setToken('')
    setUser(null)
    setRoute('/')
    window.history.pushState({}, '', '/')
  }

  if (!token) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
        <h1>MyPortfolio</h1>
        <button onClick={handleGoogleLogin} disabled={loading}>Sign Up with Google</button>
        {status && <pre>{status}</pre>}
      </div>
    )
  }

  if (route.startsWith('/public/')) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
        <button onClick={() => { setRoute('/dashboard'); window.history.pushState({}, '', '/dashboard') }}>Back to dashboard</button>
        <h2>Public portfolio preview</h2>
        {publicData ? (
          <pre>{JSON.stringify(publicData, null, 2)}</pre>
        ) : (
          <p>Loading public portfolio…</p>
        )}
      </div>
    )
  }

  if (route === '/dashboard') {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
        <h1>Dashboard</h1>
        <p>Welcome {authUser?.display_name || authUser?.email}</p>
        <ul>
          <li><button onClick={() => { setRoute('/dashboard/portfolio'); window.history.pushState({}, '', '/dashboard/portfolio') }}>Edit Portfolio</button></li>
          <li><button onClick={() => { setRoute('/dashboard/projects'); window.history.pushState({}, '', '/dashboard/projects') }}>Projects</button></li>
          <li><button onClick={() => { setRoute('/dashboard/blog'); window.history.pushState({}, '', '/dashboard/blog') }}>Blog</button></li>
          <li><button onClick={() => { setRoute('/dashboard/money'); window.history.pushState({}, '', '/dashboard/money') }}>Money</button></li>
          <li><button onClick={() => { setRoute('/dashboard/credits'); window.history.pushState({}, '', '/dashboard/credits') }}>Credits</button></li>
          <li><button onClick={handlePublicView}>Public View</button></li>
        </ul>
        <button onClick={onDeleteAccount}>Delete Account</button>
        {status && <pre>{status}</pre>}
      </div>
    )
  }

  if (route === '/dashboard/portfolio') {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
        <button onClick={() => { setRoute('/dashboard'); window.history.pushState({}, '', '/dashboard') }}>Back</button>
        <h2>Portfolio</h2>
        <form onSubmit={handlePortfolioSave}>
          <textarea value={portfolioForm.bio} onChange={(e) => setPortfolioForm({ ...portfolioForm, bio: e.target.value })} rows={8} style={{ width: '100%' }} placeholder="Bio" /><br />
          <textarea value={portfolioForm.skills} onChange={(e) => setPortfolioForm({ ...portfolioForm, skills: e.target.value })} rows={3} style={{ width: '100%' }} placeholder="Skills comma-separated" /><br />
          <textarea value={portfolioForm.design_settings} onChange={(e) => setPortfolioForm({ ...portfolioForm, design_settings: e.target.value })} rows={8} style={{ width: '100%' }} placeholder="Design settings JSON" /><br />
          <textarea value={portfolioForm.social_links} onChange={(e) => setPortfolioForm({ ...portfolioForm, social_links: e.target.value })} rows={8} style={{ width: '100%' }} placeholder="Social links JSON" /><br />
          <button type="submit" disabled={loading}>Save Portfolio</button>
        </form>
        <h3>Upload gallery</h3>
        <input type="file" multiple onChange={handlePortfolioUpload} />
        {portfolio && portfolio.sections && <pre>{JSON.stringify(portfolio.sections, null, 2)}</pre>}
      </div>
    )
  }

  if (route === '/dashboard/projects') {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
        <button onClick={() => { setRoute('/dashboard'); window.history.pushState({}, '', '/dashboard') }}>Back</button>
        <h2>Projects</h2>
        <form onSubmit={handleProjectSave}>
          <input value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} placeholder="Title" /><br />
          <textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} rows={6} placeholder="Description" /><br />
          <input value={projectForm.github_url} onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })} placeholder="GitHub URL" /><br />
          <input value={projectForm.deployed_url} onChange={(e) => setProjectForm({ ...projectForm, deployed_url: e.target.value })} placeholder="Deployed URL" /><br />
          <input value={projectForm.tech_stack} onChange={(e) => setProjectForm({ ...projectForm, tech_stack: e.target.value })} placeholder="Tech stack comma-separated" /><br />
          <label><input type="checkbox" checked={projectForm.is_featured} onChange={(e) => setProjectForm({ ...projectForm, is_featured: e.target.checked })} /> Featured</label><br />
          <button type="submit" disabled={loading}>{projectForm.id ? 'Update project' : 'Add project'}</button>
        </form>
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <strong>{project.title}</strong>
              <button onClick={() => { setProjectForm({ ...project, tech_stack: (project.tech_stack || []).join(', ') }); setRoute('/dashboard/projects') }}>Edit</button>
              <button onClick={async () => { await apiFetch(`/projects/${project.id}`, { method: 'DELETE' }); await loadDashboardData() }}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (route === '/dashboard/blog') {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
        <button onClick={() => { setRoute('/dashboard'); window.history.pushState({}, '', '/dashboard') }}>Back</button>
        <h2>Blog</h2>
        <form onSubmit={handleBlogSave}>
          <input value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} placeholder="Title" /><br />
          <textarea value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} rows={8} placeholder="Content" /><br />
          <label><input type="checkbox" checked={blogForm.is_public} onChange={(e) => setBlogForm({ ...blogForm, is_public: e.target.checked })} /> Public</label><br />
          <button type="submit" disabled={loading}>{blogForm.id ? 'Update post' : 'Add post'}</button>
        </form>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <strong>{post.title}</strong>
              <button onClick={() => setBlogForm(post)}>Edit</button>
              <button onClick={async () => { await apiFetch(`/blog/${post.id}`, { method: 'DELETE' }); await loadDashboardData() }}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (route === '/dashboard/money') {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
        <button onClick={() => { setRoute('/dashboard'); window.history.pushState({}, '', '/dashboard') }}>Back</button>
        <h2>Money</h2>
        <form onSubmit={handleMoneySave}>
          <select value={moneyForm.type} onChange={(e) => setMoneyForm({ ...moneyForm, type: e.target.value })}>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
            <option value="CREDIT">Credit</option>
          </select><br />
          <input value={moneyForm.amount} onChange={(e) => setMoneyForm({ ...moneyForm, amount: e.target.value })} placeholder="Amount" /><br />
          <input value={moneyForm.category} onChange={(e) => setMoneyForm({ ...moneyForm, category: e.target.value })} placeholder="Category" /><br />
          <input value={moneyForm.note} onChange={(e) => setMoneyForm({ ...moneyForm, note: e.target.value })} placeholder="Note" /><br />
          <input type="date" value={moneyForm.date} onChange={(e) => setMoneyForm({ ...moneyForm, date: e.target.value })} /><br />
          <button type="submit" disabled={loading}>{moneyForm.id ? 'Update entry' : 'Add entry'}</button>
        </form>
        <table border="1" cellPadding="6">
          <thead>
            <tr><th>Type</th><th>Amount</th><th>Category</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {money.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.type}</td>
                <td>{entry.amount}</td>
                <td>{entry.category}</td>
                <td>{entry.date}</td>
                <td>
                  <button onClick={() => setMoneyForm(entry)}>Edit</button>
                  <button onClick={async () => { await apiFetch(`/money/${entry.id}`, { method: 'DELETE' }); await loadDashboardData() }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (route === '/dashboard/credits') {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
        <button onClick={() => { setRoute('/dashboard'); window.history.pushState({}, '', '/dashboard') }}>Back</button>
        <h2>Credits</h2>
        <ul>
          {credits.map((credit) => (
            <li key={credit.id}>
              {credit.counterparty} - {credit.amount} - {credit.credit_status}
              <button onClick={async () => { await apiFetch(`/money/credits/${credit.id}/paid`, { method: 'PUT' }); await loadDashboardData() }}>Mark Paid</button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (<div>Unsupported route</div>)
}

export default App
