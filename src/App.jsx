import { useState, useEffect, useRef } from 'react';
import { 
  List, Link2, FileText, Tag, Image, Plus, Trash2, Save, X, 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Moon, Sun, 
  Download, Upload, Check, Copy, User, Search, Edit2, Settings,
  LogOut, Mail, Lock, Loader, UploadCloud, AlertCircle
} from 'lucide-react';
import { supabase } from './supabase';

// ============================================================================
// LIFE COMMAND v7.1.1 - Password Reset & Auth Updates
// ============================================================================

const CLOUDINARY_CLOUD_NAME = 'dccblqxuy';
const CLOUDINARY_UPLOAD_PRESET = 'Life Command';

const NOTE_COLORS = [
  { id: 'yellow', bg: '#FEF08A', name: 'Yellow' },
  { id: 'pink', bg: '#FBCFE8', name: 'Pink' },
  { id: 'orange', bg: '#FDBA74', name: 'Orange' },
  { id: 'cyan', bg: '#67E8F9', name: 'Cyan' },
  { id: 'green', bg: '#6EE7B7', name: 'Green' },
  { id: 'purple', bg: '#C4B5FD', name: 'Purple' },
  { id: 'coral', bg: '#FCA5A5', name: 'Coral' },
  { id: 'peach', bg: '#FECACA', name: 'Peach' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showMigration, setShowMigration] = useState(false);
  const [migrating, setMigrating] = useState(false);
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('lifeCommandDarkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const [userName, setUserName] = useState('User');
  const [userGreeting, setUserGreeting] = useState("Let's work");
  
  const [projects, setProjects] = useState([]);
  const [links, setLinks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [inspirations, setInspirations] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [activeTagFilter, setActiveTagFilter] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [highlightedItemId, setHighlightedItemId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) checkForLocalData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkForLocalData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkForLocalData = () => {
    const hasLocalProjects = localStorage.getItem('lifeCommandProjects');
    const hasLocalLinks = localStorage.getItem('lifeCommandLinks');
    const hasLocalNotes = localStorage.getItem('lifeCommandNotes');
    const hasLocalInspirations = localStorage.getItem('lifeCommandInspirations');
    
    if (hasLocalProjects || hasLocalLinks || hasLocalNotes || hasLocalInspirations) {
      const localProjects = hasLocalProjects ? JSON.parse(hasLocalProjects) : [];
      const localLinks = hasLocalLinks ? JSON.parse(hasLocalLinks) : [];
      const localNotes = hasLocalNotes ? JSON.parse(hasLocalNotes) : [];
      const localInspirations = hasLocalInspirations ? JSON.parse(hasLocalInspirations) : [];
      
      if (localProjects.length || localLinks.length || localNotes.length || localInspirations.length) {
        setShowMigration(true);
      }
    }
  };

  const migrateLocalData = async () => {
    setMigrating(true);
    try {
      const localProjects = JSON.parse(localStorage.getItem('lifeCommandProjects') || '[]');
      const localLinks = JSON.parse(localStorage.getItem('lifeCommandLinks') || '[]');
      const localNotes = JSON.parse(localStorage.getItem('lifeCommandNotes') || '[]');
      const localInspirations = JSON.parse(localStorage.getItem('lifeCommandInspirations') || '[]');
      const localUserName = localStorage.getItem('lifeCommandUserName') || 'User';
      const localGreeting = localStorage.getItem('lifeCommandGreeting') || "Let's work";

      for (const p of localProjects) {
        await supabase.from('projects').insert({
          user_id: user.id, title: p.title, sub_items: p.subItems || [], tags: p.tags || [], archived: p.archived || false
        });
      }

      for (const l of localLinks) {
        await supabase.from('links').insert({
          user_id: user.id, title: l.title, url: l.url, tags: l.tags || []
        });
      }

      for (const n of localNotes) {
        await supabase.from('notes').insert({
          user_id: user.id, title: n.title, content: n.content || '', color: n.color || 'yellow', tags: n.tags || []
        });
      }

      for (const i of localInspirations) {
        await supabase.from('inspirations').insert({
          user_id: user.id, name: i.name, url: i.url, thumbnail: i.thumbnail, original_url: i.originalUrl,
          cloudinary_id: i.cloudinaryId, tags: i.tags || [], dimensions: i.dimensions || { width: 0, height: 0 }
        });
      }

      await supabase.from('user_settings').upsert({ user_id: user.id, user_name: localUserName, greeting: localGreeting });

      localStorage.removeItem('lifeCommandProjects');
      localStorage.removeItem('lifeCommandLinks');
      localStorage.removeItem('lifeCommandNotes');
      localStorage.removeItem('lifeCommandInspirations');
      localStorage.removeItem('lifeCommandUserName');
      localStorage.removeItem('lifeCommandGreeting');

      await loadData();
      setShowMigration(false);
    } catch (error) {
      console.error('Migration failed:', error);
      alert('Migration failed. Please try again.');
    }
    setMigrating(false);
  };

  const skipMigration = () => {
    localStorage.removeItem('lifeCommandProjects');
    localStorage.removeItem('lifeCommandLinks');
    localStorage.removeItem('lifeCommandNotes');
    localStorage.removeItem('lifeCommandInspirations');
    setShowMigration(false);
  };

  const loadData = async () => {
    if (!user) return;
    setDataLoading(true);

    try {
      const { data: projectsData } = await supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setProjects((projectsData || []).map(p => ({
        id: p.id, title: p.title, subItems: p.sub_items || [], tags: p.tags || [], archived: p.archived || false, createdAt: p.created_at
      })));

      const { data: linksData } = await supabase.from('links').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setLinks((linksData || []).map(l => ({
        id: l.id, title: l.title, url: l.url, tags: l.tags || [], createdAt: l.created_at
      })));

      const { data: notesData } = await supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setNotes((notesData || []).map(n => ({
        id: n.id, title: n.title, content: n.content || '', color: n.color || 'yellow', tags: n.tags || [], createdAt: n.created_at
      })));

      const { data: inspoData } = await supabase.from('inspirations').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setInspirations((inspoData || []).map(i => ({
        id: i.id, name: i.name, url: i.url, thumbnail: i.thumbnail, originalUrl: i.original_url,
        cloudinaryId: i.cloudinary_id, tags: i.tags || [], dimensions: i.dimensions || { width: 0, height: 0 }, createdAt: i.created_at
      })));

      const { data: settingsData } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single();
      if (settingsData) {
        setUserName(settingsData.user_name || 'User');
        setUserGreeting(settingsData.greeting || "Let's work");
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }

    setDataLoading(false);
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  useEffect(() => {
    if (!user) return;

    const projectsSub = supabase.channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${user.id}` }, () => loadData())
      .subscribe();

    const linksSub = supabase.channel('links-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'links', filter: `user_id=eq.${user.id}` }, () => loadData())
      .subscribe();

    const notesSub = supabase.channel('notes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${user.id}` }, () => loadData())
      .subscribe();

    const inspoSub = supabase.channel('inspirations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inspirations', filter: `user_id=eq.${user.id}` }, () => loadData())
      .subscribe();

    return () => { projectsSub.unsubscribe(); linksSub.unsubscribe(); notesSub.unsubscribe(); inspoSub.unsubscribe(); };
  }, [user]);

  const addProject = async () => {
    const { data } = await supabase.from('projects').insert({ user_id: user.id, title: 'New Project', sub_items: [], tags: [], archived: false }).select().single();
    if (data) setProjects([{ id: data.id, title: data.title, subItems: [], tags: [], archived: false, createdAt: data.created_at }, ...projects]);
  };

  const updateProject = async (id, updates) => {
    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.subItems !== undefined) dbUpdates.sub_items = updates.subItems;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.archived !== undefined) dbUpdates.archived = updates.archived;
    await supabase.from('projects').update(dbUpdates).eq('id', id);
    setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = async (id) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(projects.filter(p => p.id !== id));
  };

  const reorderProjects = (fromIndex, toIndex) => {
    const newProjects = [...projects];
    const [moved] = newProjects.splice(fromIndex, 1);
    newProjects.splice(toIndex, 0, moved);
    setProjects(newProjects);
  };

  const addLink = async () => {
    const { data } = await supabase.from('links').insert({ user_id: user.id, title: 'New Link', url: 'https://', tags: [] }).select().single();
    if (data) setLinks([{ id: data.id, title: data.title, url: data.url, tags: [], createdAt: data.created_at }, ...links]);
  };

  const updateLink = async (id, updates) => {
    await supabase.from('links').update(updates).eq('id', id);
    setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLink = async (id) => {
    await supabase.from('links').delete().eq('id', id);
    setLinks(links.filter(l => l.id !== id));
  };

  const reorderLinks = (fromIndex, toIndex) => {
    const newLinks = [...links];
    const [moved] = newLinks.splice(fromIndex, 1);
    newLinks.splice(toIndex, 0, moved);
    setLinks(newLinks);
  };

  const addNote = async () => {
    const { data } = await supabase.from('notes').insert({ user_id: user.id, title: 'New Note', content: '', color: 'yellow', tags: [] }).select().single();
    if (data) setNotes([{ id: data.id, title: data.title, content: '', color: 'yellow', tags: [], createdAt: data.created_at }, ...notes]);
  };

  const updateNote = async (id, updates) => {
    await supabase.from('notes').update(updates).eq('id', id);
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNote = async (id) => {
    await supabase.from('notes').delete().eq('id', id);
    setNotes(notes.filter(n => n.id !== id));
  };

  const addInspiration = async (file, name, tags) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'life-command');
    
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      const cloudData = await response.json();
      
      const { data } = await supabase.from('inspirations').insert({
        user_id: user.id, name: name || 'Untitled', url: cloudData.secure_url,
        thumbnail: cloudData.secure_url.replace('/upload/', '/upload/w_600,q_auto/'),
        original_url: cloudData.secure_url, cloudinary_id: cloudData.public_id, tags: tags || [],
        dimensions: { width: cloudData.width, height: cloudData.height }
      }).select().single();
      
      if (data) {
        setInspirations([{
          id: data.id, name: data.name, url: data.url, thumbnail: data.thumbnail, originalUrl: data.original_url,
          cloudinaryId: data.cloudinary_id, tags: data.tags || [], dimensions: data.dimensions, createdAt: data.created_at
        }, ...inspirations]);
      }
      return data;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const updateInspiration = async (id, updates) => {
    await supabase.from('inspirations').update(updates).eq('id', id);
    setInspirations(inspirations.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteInspiration = async (id) => {
    await supabase.from('inspirations').delete().eq('id', id);
    setInspirations(inspirations.filter(i => i.id !== id));
  };

  const updateUserSettings = async (newName, newGreeting) => {
    setUserName(newName);
    setUserGreeting(newGreeting);
    await supabase.from('user_settings').upsert({ user_id: user.id, user_name: newName, greeting: newGreeting });
  };

  useEffect(() => { localStorage.setItem('lifeCommandDarkMode', JSON.stringify(darkMode)); }, [darkMode]);
  useEffect(() => { const timer = setInterval(() => setCurrentTime(new Date()), 60000); return () => clearInterval(timer); }, []);
  useEffect(() => { const handleResize = () => { if (window.innerWidth < 900) setSidebarCollapsed(true); }; handleResize(); window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize); }, []);
  useEffect(() => { if (highlightedItemId) { const timer = setTimeout(() => setHighlightedItemId(null), 2000); return () => clearTimeout(timer); } }, [highlightedItemId]);

  const getAllTags = () => {
    const allTags = new Set();
    projects.forEach(p => p.tags?.forEach(t => allTags.add(t)));
    links.forEach(l => l.tags?.forEach(t => allTags.add(t)));
    notes.forEach(n => n.tags?.forEach(t => allTags.add(t)));
    inspirations.forEach(i => i.tags?.forEach(t => allTags.add(t)));
    return Array.from(allTags).sort();
  };

  const handleTagClick = (tagName) => { setActiveView('tags'); setActiveTagFilter(tagName); };
  
  const navigateToItem = (type, id) => {
    if (type === 'Project') setActiveView('projects');
    else if (type === 'Link') setActiveView('links');
    else if (type === 'Note') setActiveView('notes');
    else if (type === 'Inspo') setActiveView('inspo');
    setActiveTagFilter(null);
    setShowSearch(false);
    setSearchQuery('');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'center' }); setHighlightedItemId(id); }
    }, 100);
  };

  const getSearchResults = () => {
    if (!searchQuery.trim()) return { projects: [], links: [], notes: [], inspirations: [] };
    const q = searchQuery.toLowerCase();
    return {
      projects: projects.filter(p => p.title.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q))),
      links: links.filter(l => l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q) || l.tags?.some(t => t.toLowerCase().includes(q))),
      notes: notes.filter(n => n.title.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q) || n.tags?.some(t => t.toLowerCase().includes(q))),
      inspirations: inspirations.filter(i => i.name.toLowerCase().includes(q) || i.tags?.some(t => t.toLowerCase().includes(q)))
    };
  };

  const exportData = () => {
    const data = { version: '7.1.1', exportedAt: new Date().toISOString(), projects, links, notes, inspirations, settings: { userName, userGreeting } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `life-command-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const importData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.projects) { for (const p of data.projects) { await supabase.from('projects').insert({ user_id: user.id, title: p.title, sub_items: p.subItems || [], tags: p.tags || [], archived: p.archived || false }); } }
        if (data.links) { for (const l of data.links) { await supabase.from('links').insert({ user_id: user.id, title: l.title, url: l.url, tags: l.tags || [] }); } }
        if (data.notes) { for (const n of data.notes) { await supabase.from('notes').insert({ user_id: user.id, title: n.title, content: n.content || '', color: n.color || 'yellow', tags: n.tags || [] }); } }
        if (data.inspirations) { for (const i of data.inspirations) { await supabase.from('inspirations').insert({ user_id: user.id, name: i.name, url: i.url, thumbnail: i.thumbnail, original_url: i.originalUrl, cloudinary_id: i.cloudinaryId, tags: i.tags || [], dimensions: i.dimensions || { width: 0, height: 0 } }); } }
        if (data.settings) { await updateUserSettings(data.settings.userName || 'User', data.settings.userGreeting || "Let's work"); }
        await loadData();
      } catch (err) { console.error('Import failed:', err); }
    };
    reader.readAsText(file);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProjects([]); setLinks([]); setNotes([]); setInspirations([]);
  };

  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  if (authLoading) {
    return (
      <div className="lc dark">
        <Styles />
        <div className="auth-loading"><Loader className="spin" size={32} /><p>Loading...</p></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="lc dark">
        <Styles />
        <AuthScreen />
      </div>
    );
  }

  if (showMigration) {
    return (
      <div className="lc dark">
        <Styles />
        <MigrationPrompt onMigrate={migrateLocalData} onSkip={skipMigration} migrating={migrating} />
      </div>
    );
  }

  const viewConfig = {
    projects: { title: 'Projects', subtitle: `${projects.filter(p => !p.archived).length} Active, ${projects.filter(p => p.archived).length} Archived` },
    links: { title: 'Links', subtitle: `${links.length} Saved Links` },
    notes: { title: 'Notes', subtitle: `${notes.length} Notes` },
    tags: { title: 'Tags', subtitle: `${getAllTags().length} Tags` },
    inspo: { title: 'Design Inspo', subtitle: `${inspirations.length} Images` },
    settings: { title: 'Settings', subtitle: 'Customize your experience' }
  };

  const current = viewConfig[activeView];

  return (
    <div className={`lc ${darkMode ? 'dark' : 'light'}`}>
      <Styles />

      <aside className={`sb ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sb-head">
          <div className="logo">Life <span>Command</span></div>
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <nav className="sb-nav">
          {[
            { id: 'projects', icon: List, label: 'Projects', count: projects.filter(p => !p.archived).length },
            { id: 'links', icon: Link2, label: 'Links', count: links.length },
            { id: 'notes', icon: FileText, label: 'Notes', count: notes.length },
            { id: 'tags', icon: Tag, label: 'Tags', count: getAllTags().length },
            { id: 'inspo', icon: Image, label: 'Design Inspo', count: inspirations.length },
          ].map(item => (
            <div key={item.id} className={`nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => { setActiveView(item.id); setActiveTagFilter(null); setShowSearch(false); }}>
              <item.icon className="nav-icon" size={18} />
              <span className="nav-label">{item.label}</span>
              <span className="nav-count">{item.count}</span>
            </div>
          ))}
          <div className="nav-spacer" />
          <div className={`nav-item ${activeView === 'settings' ? 'active' : ''}`} onClick={() => { setActiveView('settings'); setShowSearch(false); }}>
            <Settings className="nav-icon" size={18} />
            <span className="nav-label">Settings</span>
          </div>
        </nav>
        <div className="sb-foot">
          <div className="time">{formatTime(currentTime)}</div>
          <div className="date">{formatDate(currentTime)}</div>
        </div>
      </aside>

      <main className="main">
        <header className="hd">
          <span className="hd-title">{current.title}</span>
          <span className="hd-sub">{current.subtitle}</span>
          <div className="hd-spacer" />
          <div className="hd-actions">
            <button className={`search-btn ${showSearch ? 'active' : ''}`} onClick={() => setShowSearch(!showSearch)}><Search size={16} /></button>
            <div className="theme-toggle">
              <button className={`theme-btn ${!darkMode ? 'active' : ''}`} onClick={() => setDarkMode(false)}><Sun size={14} /></button>
              <button className={`theme-btn ${darkMode ? 'active' : ''}`} onClick={() => setDarkMode(true)}><Moon size={14} /></button>
            </div>
            <button className="hd-btn" onClick={exportData}><Download size={14} /> Export</button>
            <label className="hd-btn" style={{ cursor: 'pointer' }}>
              <Upload size={14} /> Import
              <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
            </label>
            <div className="greeting">
              {userGreeting}, <strong>{userName}</strong>
              <div className="user-icon"><User size={14} /></div>
            </div>
          </div>
        </header>

        {showSearch && <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} results={getSearchResults()} navigateToItem={navigateToItem} />}

        <div className="content">
          {dataLoading ? (
            <div className="loading-data"><Loader className="spin" size={24} /><p>Loading your data...</p></div>
          ) : (
            <>
              {activeView === 'projects' && <ProjectsView projects={projects} addProject={addProject} updateProject={updateProject} deleteProject={deleteProject} reorderProjects={reorderProjects} onTagClick={handleTagClick} allTags={getAllTags()} highlightedItemId={highlightedItemId} />}
              {activeView === 'links' && <LinksView links={links} addLink={addLink} updateLink={updateLink} deleteLink={deleteLink} reorderLinks={reorderLinks} onTagClick={handleTagClick} allTags={getAllTags()} highlightedItemId={highlightedItemId} />}
              {activeView === 'notes' && <NotesView notes={notes} addNote={addNote} updateNote={updateNote} deleteNote={deleteNote} onTagClick={handleTagClick} allTags={getAllTags()} highlightedItemId={highlightedItemId} />}
              {activeView === 'tags' && <TagsView projects={projects} links={links} notes={notes} inspirations={inspirations} activeTagFilter={activeTagFilter} setActiveTagFilter={setActiveTagFilter} navigateToItem={navigateToItem} />}
              {activeView === 'inspo' && <InspoView inspirations={inspirations} addInspiration={addInspiration} updateInspiration={updateInspiration} deleteInspiration={deleteInspiration} onTagClick={handleTagClick} allTags={getAllTags()} highlightedItemId={highlightedItemId} />}
              {activeView === 'settings' && <SettingsView userName={userName} userGreeting={userGreeting} updateUserSettings={updateUserSettings} userEmail={user.email} onLogout={handleLogout} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email to confirm your account!');
        setMode('login');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage('Check your email for a password reset link!');
        setMode('login');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">Life <span>Command</span></h1>
          <p className="auth-tagline">Your personal productivity dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'reset' && 'Reset Password'}
          </h2>
          
          {error && <div className="auth-error"><AlertCircle size={14} /> {error}</div>}
          {message && <div className="auth-message"><Check size={14} /> {message}</div>}
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input type="email" className="form-input with-icon" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
          </div>
          
          {mode !== 'reset' && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input type="password" className="form-input with-icon" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required minLength={6} />
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="auth-forgot">
              <button type="button" onClick={() => { setMode('reset'); setError(''); setMessage(''); }}>Forgot password?</button>
            </div>
          )}
          
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? <Loader className="spin" size={16} /> : (
              <>{mode === 'login' && 'Sign In'}{mode === 'signup' && 'Sign Up'}{mode === 'reset' && 'Send Reset Link'}</>
            )}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' && <p>Don't have an account? <button onClick={() => { setMode('signup'); setError(''); setMessage(''); }}>Sign up</button></p>}
          {mode === 'signup' && <p>Already have an account? <button onClick={() => { setMode('login'); setError(''); setMessage(''); }}>Sign in</button></p>}
          {mode === 'reset' && <p>Remember your password? <button onClick={() => { setMode('login'); setError(''); setMessage(''); }}>Sign in</button></p>}
        </div>
      </div>
    </div>
  );
}

function MigrationPrompt({ onMigrate, onSkip, migrating }) {
  return (
    <div className="migration-screen">
      <div className="migration-card">
        <UploadCloud size={48} className="migration-icon" />
        <h2>Local Data Found</h2>
        <p>You have existing data stored locally. Would you like to upload it to the cloud so you can access it from any device?</p>
        <div className="migration-actions">
          <button className="btn-primary" onClick={onMigrate} disabled={migrating}>
            {migrating ? <><Loader className="spin" size={14} /> Migrating...</> : 'Upload to Cloud'}
          </button>
          <button className="btn-secondary" onClick={onSkip} disabled={migrating}>Start Fresh</button>
        </div>
        <p className="migration-note">Note: Choosing "Start Fresh" will delete your local data.</p>
      </div>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap');
      *{margin:0;padding:0;box-sizing:border-box}
      :root{--font:'Inter Tight',-apple-system,BlinkMacSystemFont,sans-serif;--radius:6px;--transition:0.15s ease}
      
      .lc.dark{--bg-app:#1C1C1C;--bg-sidebar:#232323;--bg-header:#232323;--bg-card:#2A2A2A;--bg-card-hover:#333;--bg-input:#333;--text-1:#FFF;--text-2:#A0A0A0;--text-3:#666;--border:#383838;--accent:#1A9A8A;--accent-hover:#168A7A;--accent-soft:rgba(26,154,138,0.12)}
      .lc.light{--bg-app:#F5F5F0;--bg-sidebar:#EAEAE5;--bg-header:#EAEAE5;--bg-card:#E0E0DB;--bg-card-hover:#D5D5D0;--bg-input:#FFF;--text-1:#1A1A1A;--text-2:#666;--text-3:#999;--border:#D0D0CB;--accent:#1A9A8A;--accent-hover:#168A7A;--accent-soft:rgba(26,154,138,0.08)}
      
      .lc{font-family:var(--font);background:var(--bg-app);color:var(--text-1);min-height:100vh;display:flex;font-size:13px;line-height:1.5}
      
      .spin{animation:spin 1s linear infinite}
      @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      
      .auth-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;width:100%;gap:12px;color:var(--text-2)}
      
      .auth-screen{display:flex;align-items:center;justify-content:center;min-height:100vh;width:100%;padding:20px}
      .auth-card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:40px;width:100%;max-width:400px;box-shadow:0 4px 24px rgba(0,0,0,0.1)}
      .auth-header{text-align:center;margin-bottom:32px}
      .auth-logo{font-size:28px;font-weight:700;margin-bottom:8px}
      .auth-logo span{font-weight:400;color:var(--text-2)}
      .auth-tagline{color:var(--text-2);font-size:14px}
      .auth-form h2{font-size:18px;margin-bottom:20px}
      .auth-error{display:flex;align-items:center;gap:8px;padding:12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:var(--radius);color:#EF4444;font-size:12px;margin-bottom:16px}
      .auth-message{display:flex;align-items:center;gap:8px;padding:12px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:var(--radius);color:#10B981;font-size:12px;margin-bottom:16px}
      .form-group{margin-bottom:16px}
      .form-label{display:block;font-size:12px;font-weight:500;color:var(--text-2);margin-bottom:6px}
      .input-icon-wrap{position:relative}
      .input-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-3)}
      .form-input.with-icon{padding-left:40px}
      .auth-submit{width:100%;justify-content:center;padding:12px;font-size:14px;margin-top:8px}
      .auth-switch{text-align:center;margin-top:24px;padding-top:24px;border-top:1px solid var(--border);color:var(--text-2);font-size:13px}
      .auth-switch button{background:none;border:none;color:var(--accent);font-weight:600;cursor:pointer;font-family:var(--font)}
      .auth-switch button:hover{text-decoration:underline}
      .auth-forgot{text-align:right;margin-top:-8px;margin-bottom:16px}
      .auth-forgot button{background:none;border:none;color:var(--text-3);font-size:12px;cursor:pointer;font-family:var(--font)}
      .auth-forgot button:hover{color:var(--accent);text-decoration:underline}
      
      .migration-screen{display:flex;align-items:center;justify-content:center;min-height:100vh;width:100%;padding:20px}
      .migration-card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:40px;width:100%;max-width:440px;text-align:center}
      .migration-icon{color:var(--accent);margin-bottom:20px}
      .migration-card h2{font-size:20px;margin-bottom:12px}
      .migration-card p{color:var(--text-2);margin-bottom:24px;line-height:1.6}
      .migration-actions{display:flex;flex-direction:column;gap:12px}
      .migration-actions .btn-primary{justify-content:center;padding:14px}
      .migration-actions .btn-secondary{justify-content:center;padding:14px}
      .migration-note{font-size:11px;color:var(--text-3);margin-top:16px}
      
      .loading-data{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px;gap:12px;color:var(--text-2)}
      
      .sb{width:220px;background:var(--bg-sidebar);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;height:100vh;position:sticky;top:0;transition:width 0.2s ease}
      .sb.collapsed{width:60px}
      .sb-head{height:52px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)}
      .sb.collapsed .sb-head{justify-content:center;padding:0}
      .logo{font-size:15px;font-weight:700;white-space:nowrap}
      .logo span{font-weight:400;color:var(--text-2)}
      .sb.collapsed .logo{display:none}
      .collapse-btn{width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:none;border:none;color:var(--text-3);cursor:pointer;border-radius:var(--radius);transition:var(--transition)}
      .collapse-btn:hover{background:var(--bg-card);color:var(--text-1)}
      
      .sb-nav{flex:1;padding:8px;overflow-y:auto;display:flex;flex-direction:column}
      .nav-item{display:flex;align-items:center;gap:12px;padding:10px 12px;margin-bottom:2px;border-radius:var(--radius);cursor:pointer;color:var(--text-2);font-size:13px;font-weight:500;transition:var(--transition)}
      .sb.collapsed .nav-item{justify-content:center;padding:12px}
      .sb.collapsed .nav-label,.sb.collapsed .nav-count{display:none}
      .nav-item:hover{background:var(--bg-card);color:var(--text-1)}
      .nav-item.active{background:var(--accent);color:#fff}
      .nav-icon{width:18px;height:18px;flex-shrink:0}
      .nav-count{margin-left:auto;font-size:11px;font-weight:600;min-width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:var(--bg-app);border-radius:11px;color:var(--text-2)}
      .nav-item.active .nav-count{background:rgba(255,255,255,0.2);color:#fff}
      .nav-spacer{flex:1}
      
      .sb-foot{padding:16px;border-top:1px solid var(--border)}
      .sb.collapsed .sb-foot{padding:12px 8px;text-align:center}
      .time{font-size:20px;font-weight:700;line-height:1}
      .sb.collapsed .time{font-size:11px}
      .date{font-size:11px;color:var(--text-2);margin-top:4px}
      .sb.collapsed .date{display:none}
      
      .main{flex:1;display:flex;flex-direction:column;min-width:0}
      
      .hd{height:52px;padding:0 24px;display:flex;align-items:center;gap:16px;background:var(--bg-header);border-bottom:1px solid var(--border)}
      .hd-title{font-size:18px;font-weight:700}
      .hd-sub{font-size:12px;color:var(--text-2)}
      .hd-spacer{flex:1}
      .hd-actions{display:flex;align-items:center;gap:6px}
      
      .search-btn{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:var(--bg-card);border:none;color:var(--text-2);cursor:pointer;border-radius:var(--radius);transition:var(--transition)}
      .search-btn:hover{color:var(--text-1);background:var(--bg-card-hover)}
      .search-btn.active{background:var(--accent);color:#fff}
      
      .theme-toggle{display:flex;background:var(--bg-card);border-radius:16px;padding:3px}
      .theme-btn{width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:none;border:none;color:var(--text-3);cursor:pointer;border-radius:13px;transition:var(--transition)}
      .theme-btn.active{background:var(--accent);color:#fff}
      
      .hd-btn{display:flex;align-items:center;gap:6px;padding:8px 12px;background:none;border:none;color:var(--text-2);font-size:12px;font-weight:500;cursor:pointer;font-family:var(--font);transition:var(--transition)}
      .hd-btn:hover{color:var(--text-1)}
      
      .greeting{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-2);padding-left:12px;border-left:1px solid var(--border)}
      .greeting strong{color:var(--text-1)}
      .user-icon{width:28px;height:28px;background:var(--bg-card);border-radius:14px;display:flex;align-items:center;justify-content:center;color:var(--text-2)}
      
      .search-bar{padding:16px 24px;background:var(--bg-header);border-bottom:1px solid var(--border)}
      .search-input-wrap{position:relative}
      .search-input{width:100%;padding:10px 16px 10px 40px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);font-size:14px;color:var(--text-1);font-family:var(--font)}
      .search-input:focus{outline:none;border-color:var(--accent)}
      .search-input-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-3)}
      .search-results{margin-top:12px;max-height:400px;overflow-y:auto}
      .search-section{margin-bottom:16px}
      .search-section-title{font-size:11px;font-weight:600;color:var(--text-2);text-transform:uppercase;margin-bottom:8px}
      .search-item{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-card);border-radius:var(--radius);margin-bottom:4px;cursor:pointer;transition:var(--transition)}
      .search-item:hover{background:var(--bg-card-hover)}
      
      .content{flex:1;padding:24px;overflow-y:auto}
      
      .content-toolbar{display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap}
      .toolbar-left{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .toolbar-right{display:flex;align-items:center;gap:8px;margin-left:auto}
      
      .filter-label{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-2)}
      .filter-pills{display:flex;gap:6px;flex-wrap:wrap}
      .filter-pill{padding:6px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);color:var(--text-2);font-size:12px;font-weight:500;cursor:pointer;font-family:var(--font);transition:var(--transition);display:flex;align-items:center;gap:4px}
      .filter-pill:hover{border-color:var(--accent);color:var(--text-1)}
      .filter-pill.active{background:var(--accent);border-color:var(--accent);color:#fff}
      
      .btn-primary{display:flex;align-items:center;gap:6px;padding:8px 16px;background:var(--accent);color:#fff;border:none;border-radius:var(--radius);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font);transition:var(--transition);white-space:nowrap}
      .btn-primary:hover{background:var(--accent-hover);transform:translateY(-1px);box-shadow:0 2px 8px rgba(26,154,138,0.3)}
      .btn-primary:disabled{opacity:0.6;cursor:not-allowed;transform:none}
      
      .btn-secondary{display:flex;align-items:center;gap:6px;padding:8px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);font-size:12px;font-weight:500;color:var(--text-1);cursor:pointer;font-family:var(--font);transition:var(--transition)}
      .btn-secondary:hover{background:var(--bg-card-hover);border-color:var(--text-3)}
      
      .btn-danger{display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:var(--radius);font-size:12px;font-weight:500;color:#EF4444;cursor:pointer;font-family:var(--font);transition:var(--transition)}
      .btn-danger:hover{background:rgba(239,68,68,0.2)}
      
      .projects-list{display:flex;flex-direction:column;gap:12px}
      .project-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;transition:all 0.3s ease}
      .project-card:hover{border-color:var(--accent);box-shadow:0 2px 8px rgba(0,0,0,0.08)}
      .project-card.completed{border-color:#10B981;background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.08) 100%)}
      .project-card.highlighted{animation:highlight-pulse 2s ease-out}
      @keyframes highlight-pulse{0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 0 4px var(--accent-soft);border-color:var(--accent)}}
      
      .btn-archive{padding:6px 12px;background:#10B981;color:#fff;border:none;border-radius:var(--radius);font-size:11px;font-weight:600;cursor:pointer;font-family:var(--font);transition:var(--transition)}
      .btn-archive:hover{background:#059669}
      
      .progress-fill.complete{background:#10B981}
      
      .archive-section{margin-top:32px;border-top:1px solid var(--border);padding-top:16px}
      .archive-header{display:flex;align-items:center;gap:8px;padding:12px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;color:var(--text-2);font-size:13px;font-weight:500;transition:var(--transition)}
      .archive-header:hover{background:var(--bg-card-hover);color:var(--text-1)}
      .archive-list{margin-top:8px;display:flex;flex-direction:column;gap:6px}
      .archive-item{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);opacity:0.7;transition:var(--transition)}
      .archive-item:hover{opacity:1}
      .archive-item-title{font-size:13px;font-weight:500;color:var(--text-2)}
      .archive-item-actions{display:flex;align-items:center;gap:8px}
      
      .project-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;cursor:grab}
      .project-header:active{cursor:grabbing}
      .project-title{font-size:16px;font-weight:600;cursor:pointer;transition:var(--transition)}
      .project-title:hover{color:var(--accent)}
      .project-actions{display:flex;gap:4px}
      
      .icon-btn{width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:none;border:none;color:var(--text-3);cursor:pointer;border-radius:var(--radius);transition:var(--transition)}
      .icon-btn:hover{background:var(--bg-app);color:var(--text-1)}
      .icon-btn.danger:hover{background:#3D2020;color:#EF4444}
      
      .project-progress{margin-bottom:12px}
      .progress-text{font-size:11px;color:var(--text-2);margin-bottom:4px}
      .progress-bar{width:100%;height:4px;background:var(--bg-app);border-radius:2px;overflow:hidden}
      .progress-fill{height:100%;background:var(--accent);border-radius:2px;transition:width 0.3s ease}
      
      .project-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
      .tag-pill{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;background:var(--bg-app);border:1px solid var(--border);border-radius:4px;font-size:11px;color:var(--text-2);cursor:pointer;transition:var(--transition)}
      .tag-pill:hover{border-color:var(--accent);color:var(--accent)}
      
      .tag-input-wrap{position:relative;display:inline-block;z-index:10}
      .tag-dropdown{position:absolute;top:100%;left:0;min-width:150px;max-height:200px;overflow-y:auto;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:1000;margin-top:4px}
      .tag-dropdown-item{padding:8px 12px;cursor:pointer;font-size:12px;transition:var(--transition)}
      .tag-dropdown-item:hover{background:var(--accent-soft);color:var(--accent)}
      .tag-dropdown-item.new{color:var(--accent);font-weight:500}
      
      .sub-toggle{display:flex;align-items:center;gap:6px;padding:6px 0;color:var(--text-2);font-size:12px;font-weight:500;cursor:pointer;transition:var(--transition)}
      .sub-toggle:hover{color:var(--text-1)}
      .sub-list{margin-top:8px;display:flex;flex-direction:column;gap:6px}
      .sub-item{display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--bg-app);border-radius:var(--radius);transition:var(--transition)}
      .sub-item:hover{background:var(--bg-card-hover)}
      .sub-checkbox{width:16px;height:16px;border:2px solid var(--border);border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:var(--transition);color:transparent}
      .sub-checkbox.checked{background:var(--accent);border-color:var(--accent);color:#fff}
      .sub-text{flex:1;font-size:13px;cursor:text}
      .sub-text.done{text-decoration:line-through;color:var(--text-3)}
      .sub-text-input{flex:1;padding:4px 8px;background:var(--bg-input);border:1px solid var(--border);border-radius:4px;font-size:13px;color:var(--text-1);font-family:var(--font)}
      .sub-text-input:focus{outline:none;border-color:var(--accent)}
      .sub-badges{display:flex;gap:6px}
      
      .status-badge{padding:4px 20px 4px 8px;border-radius:4px;font-size:11px;font-weight:600;border:none;cursor:pointer;font-family:var(--font);transition:var(--transition);appearance:none;background-repeat:no-repeat;background-position:right 6px center;background-size:10px}
      .status-badge.new{background-color:#E5E7EB;color:#374151;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")}
      .status-badge.working{background-color:#0EA5E9;color:#FFF;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")}
      .status-badge.paused{background-color:#F59E0B;color:#FFF;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")}
      .status-badge.stuck{background-color:#EF4444;color:#FFF;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")}
      
      .priority-badge{padding:4px 20px 4px 8px;border-radius:4px;font-size:11px;font-weight:600;border:none;cursor:pointer;font-family:var(--font);transition:var(--transition);appearance:none;background-repeat:no-repeat;background-position:right 6px center;background-size:10px}
      .priority-badge.low{background-color:#E5E7EB;color:#6B7280;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")}
      .priority-badge.medium{background-color:#FCD34D;color:#92400E;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2392400E' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")}
      .priority-badge.high{background-color:#FB923C;color:#FFF;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")}
      .priority-badge.urgent{background-color:#EF4444;color:#FFF;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")}
      
      .sub-actions{display:flex;gap:2px}
      
      .links-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
      @media(max-width:1100px){.links-grid{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:700px){.links-grid{grid-template-columns:1fr}}
      .link-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;transition:all 0.3s ease;display:flex;flex-direction:column}
      .link-card:hover{border-color:var(--accent);box-shadow:0 2px 8px rgba(0,0,0,0.08)}
      .link-card.highlighted{animation:highlight-pulse 2s ease-out}
      .link-header{display:flex;justify-content:space-between;margin-bottom:6px;cursor:grab}
      .link-title{font-size:14px;font-weight:600;cursor:pointer;transition:var(--transition)}
      .link-title:hover{color:var(--accent)}
      .link-url{font-size:12px;color:var(--accent);text-decoration:none;display:block;margin-bottom:12px;word-break:break-all;transition:var(--transition)}
      .link-url:hover{text-decoration:underline}
      .link-footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto}
      .link-tags{display:flex;gap:4px;flex-wrap:wrap}
      
      .notes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
      .note-card{padding:16px;border-radius:var(--radius);position:relative;min-height:120px;display:flex;flex-direction:column;transition:all 0.3s ease}
      .note-card:focus-within{z-index:10}
      .note-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.15)}
      .note-card.highlighted{animation:highlight-pulse 2s ease-out}
      .note-card.yellow{background:#FEF08A}
      .note-card.pink{background:#FBCFE8}
      .note-card.orange{background:#FDBA74}
      .note-card.cyan{background:#67E8F9}
      .note-card.green{background:#6EE7B7}
      .note-card.purple{background:#C4B5FD}
      .note-card.coral{background:#FCA5A5}
      .note-card.peach{background:#FECACA}
      .note-header{display:flex;justify-content:space-between;margin-bottom:8px}
      .note-title{font-size:14px;font-weight:600;color:#1A1A1A;cursor:pointer}
      .note-content{font-size:12px;color:#1A1A1A;opacity:0.85;line-height:1.5;flex:1}
      .note-content ul{margin:4px 0 4px 1.5em;padding:0;list-style:disc inside}
      .note-content ol{margin:4px 0 4px 1.5em;padding:0;list-style:decimal inside}
      .note-tags{display:flex;gap:4px;flex-wrap:wrap;margin-top:12px}
      .note-tag{padding:3px 6px;background:rgba(0,0,0,0.12);border-radius:4px;font-size:10px;font-weight:500;color:#1A1A1A;cursor:pointer;display:flex;align-items:center;gap:3px;transition:var(--transition)}
      .note-tag:hover{background:rgba(0,0,0,0.2)}
      .note-card .tag-input-wrap .form-input{background:rgba(255,255,255,0.9);border-color:rgba(0,0,0,0.2);color:#1A1A1A}
      .note-card .tag-dropdown{background:#fff;border-color:rgba(0,0,0,0.15);color:#1A1A1A}
      .note-actions{position:absolute;top:10px;right:10px;display:flex;gap:2px;opacity:0;transition:var(--transition)}
      .note-card:hover .note-actions{opacity:1}
      .note-actions .icon-btn{color:rgba(0,0,0,0.35);width:26px;height:26px}
      .note-actions .icon-btn:hover{color:rgba(0,0,0,0.7);background:rgba(0,0,0,0.1)}
      
      .note-edit-input{width:100%;padding:8px 10px;background:rgba(255,255,255,0.95);border:1px solid rgba(0,0,0,0.25);border-radius:var(--radius);font-size:14px;font-weight:600;color:#1A1A1A;font-family:var(--font);margin-bottom:8px}
      .note-edit-input:focus{outline:none;border-color:rgba(0,0,0,0.5)}
      
      .color-picker{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
      .color-swatch{width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:var(--transition)}
      .color-swatch:hover{transform:scale(1.1)}
      .color-swatch.active{border-color:#1A1A1A}
      
      .inspo-grid{column-count:4;column-gap:16px}
      @media(max-width:1200px){.inspo-grid{column-count:3}}
      @media(max-width:900px){.inspo-grid{column-count:2}}
      @media(max-width:500px){.inspo-grid{column-count:1}}
      .inspo-card{break-inside:avoid;margin-bottom:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);transition:all 0.3s ease;position:relative}
      .inspo-card:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.1)}
      .inspo-card.highlighted{animation:highlight-pulse 2s ease-out}
      .inspo-card .inspo-image{border-radius:var(--radius) var(--radius) 0 0}
      .inspo-info{position:relative;overflow:visible;padding:12px}
      .inspo-image{width:100%;display:block;cursor:pointer}
      .inspo-name{font-size:13px;font-weight:600;margin-bottom:6px}
      .inspo-tags{display:flex;gap:4px;flex-wrap:wrap;align-items:center}
      .inspo-actions{display:flex;gap:4px;padding:8px 12px;border-top:1px solid var(--border)}
      
      .upload-area{border:2px dashed var(--border);border-radius:var(--radius);padding:40px;text-align:center;cursor:pointer;transition:var(--transition);margin-bottom:20px;display:flex;flex-direction:column;align-items:center;justify-content:center}
      .upload-area:hover{border-color:var(--accent);background:var(--accent-soft)}
      .upload-area.drag-over{border-color:var(--accent);background:var(--accent-soft)}
      .upload-icon{color:var(--text-3);margin-bottom:12px}
      .upload-text{color:var(--text-2);font-size:14px}
      .upload-text strong{color:var(--accent)}
      .upload-hint{font-size:12px;color:var(--text-3);margin-top:8px}
      
      .tags-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
      .tag-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;cursor:pointer;transition:var(--transition)}
      .tag-card:hover{border-color:var(--accent);transform:translateY(-1px)}
      .tag-card.active{border-color:var(--accent);background:var(--accent-soft)}
      .tag-name{font-size:14px;font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:6px}
      .tag-count{font-size:12px;color:var(--text-2)}
      .tagged-items{margin-top:24px}
      .tagged-items h3{font-size:14px;font-weight:600;margin-bottom:12px}
      .tagged-item{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:8px;cursor:pointer;transition:var(--transition)}
      .tagged-item:hover{border-color:var(--accent);background:var(--bg-card-hover);transform:translateX(4px)}
      .tagged-item-type{font-size:11px;color:var(--text-2);text-transform:uppercase;font-weight:500}
      .tagged-item-name{font-size:13px;font-weight:500}
      
      .settings-section{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:16px}
      .settings-section-title{font-size:14px;font-weight:600;margin-bottom:16px}
      .settings-row{display:flex;align-items:center;gap:16px;margin-bottom:12px}
      .settings-row:last-child{margin-bottom:0}
      .settings-label{font-size:13px;color:var(--text-2);min-width:120px}
      .settings-input{flex:1;max-width:300px}
      .settings-value{font-size:13px;color:var(--text-1)}
      
      .empty{text-align:center;padding:80px 24px}
      .empty-icon{width:64px;height:64px;margin:0 auto 16px;background:var(--bg-card);border-radius:16px;display:flex;align-items:center;justify-content:center;color:var(--text-3)}
      .empty-title{font-size:18px;font-weight:600;margin-bottom:8px}
      .empty-text{font-size:14px;color:var(--text-2);margin-bottom:20px}
      
      .form-input{width:100%;padding:8px 12px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius);font-size:13px;color:var(--text-1);font-family:var(--font);transition:var(--transition)}
      .form-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
      
      .lightbox{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;z-index:2000;padding:40px}
      .lightbox-image{max-width:90%;max-height:90%;object-fit:contain}
      .lightbox-close{position:absolute;top:16px;right:16px;width:40px;height:40px;background:rgba(255,255,255,0.1);border:none;border-radius:20px;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:var(--transition)}
      .lightbox-close:hover{background:rgba(255,255,255,0.2)}
      .lightbox-actions{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);display:flex;gap:12px}
      .lightbox-btn{display:flex;align-items:center;gap:6px;padding:10px 18px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:var(--radius);color:#fff;font-size:13px;cursor:pointer;transition:var(--transition)}
      .lightbox-btn:hover{background:rgba(255,255,255,0.2)}
      
      .quill-wrapper{border:1px solid rgba(0,0,0,0.2);border-radius:var(--radius);overflow:hidden;background:rgba(255,255,255,0.95)}
      .quill-wrapper .ql-toolbar{background:rgba(0,0,0,0.05);border:none;border-bottom:1px solid rgba(0,0,0,0.1);padding:8px}
      .quill-wrapper .ql-container{border:none}
      .quill-wrapper .ql-editor{min-height:100px;font-family:var(--font);font-size:13px;color:#1A1A1A}
      
      @media(max-width:768px){
        .hd{padding:0 16px;gap:8px}.hd-title{font-size:16px}.hd-sub{display:none}.hd-btn span{display:none}.hd-btn{padding:8px}.content{padding:16px}.greeting{display:none}
        .content-toolbar{flex-direction:column;align-items:stretch;gap:12px}.toolbar-left{flex-wrap:wrap}.toolbar-right{justify-content:flex-end}.filter-label{display:none}
        .settings-row{flex-direction:column;align-items:stretch;gap:8px}.settings-label{min-width:auto}.settings-input{max-width:none}
        .sub-item{flex-wrap:wrap;gap:8px}.sub-badges{width:100%}.sub-actions{margin-left:auto}
      }
      @media(max-width:480px){
        .sb{width:60px}.sb .nav-label,.sb .nav-count{display:none}.sb .nav-item{justify-content:center;padding:12px}.sb-foot .date{display:none}.sb-foot .time{font-size:12px}
        .hd{height:48px}.hd-actions{gap:4px}.theme-toggle{display:none}.links-grid{grid-template-columns:1fr}.tags-grid{grid-template-columns:repeat(2,1fr)}
        .btn-primary{padding:8px 12px;font-size:12px}.project-card{padding:12px}.project-title{font-size:14px}.link-card{padding:12px}.note-card{padding:12px}.inspo-info{padding:10px}
      }
    `}</style>
  );
}

function SearchBar({ searchQuery, setSearchQuery, results, navigateToItem }) {
  const inputRef = useRef(null);
  const totalResults = results.projects.length + results.links.length + results.notes.length + results.inspirations.length;
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="search-bar">
      <div className="search-input-wrap">
        <Search size={16} className="search-input-icon" />
        <input ref={inputRef} type="text" className="search-input" placeholder="Search projects, links, notes, inspiration..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>
      {searchQuery && (
        <div className="search-results">
          {totalResults === 0 ? <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-2)' }}>No results found</div> : (
            <>
              {results.projects.length > 0 && <div className="search-section"><div className="search-section-title">Projects</div>{results.projects.map(p => <div key={p.id} className="search-item" onClick={() => navigateToItem('Project', p.id)}><List size={14} /> <span>{p.title}</span></div>)}</div>}
              {results.links.length > 0 && <div className="search-section"><div className="search-section-title">Links</div>{results.links.map(l => <div key={l.id} className="search-item" onClick={() => navigateToItem('Link', l.id)}><Link2 size={14} /> <span>{l.title}</span></div>)}</div>}
              {results.notes.length > 0 && <div className="search-section"><div className="search-section-title">Notes</div>{results.notes.map(n => <div key={n.id} className="search-item" onClick={() => navigateToItem('Note', n.id)}><FileText size={14} /> <span>{n.title}</span></div>)}</div>}
              {results.inspirations.length > 0 && <div className="search-section"><div className="search-section-title">Inspiration</div>{results.inspirations.map(i => <div key={i.id} className="search-item" onClick={() => navigateToItem('Inspo', i.id)}><Image size={14} /> <span>{i.name}</span></div>)}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TagInput({ onAdd, allTags, existingTags, small }) {
  const [value, setValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const filteredTags = allTags.filter(t => t.toLowerCase().includes(value.toLowerCase()) && !existingTags?.includes(t));
  const handleAdd = (tag) => { onAdd(tag); setValue(''); setShowDropdown(false); };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && value.trim()) handleAdd(value.trim()); else if (e.key === 'Escape') { setShowDropdown(false); inputRef.current?.blur(); } };

  return (
    <div className="tag-input-wrap">
      <input ref={inputRef} className="form-input" value={value} onChange={e => { setValue(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} onBlur={() => setTimeout(() => setShowDropdown(false), 150)} onKeyDown={handleKeyDown} placeholder="Add tag..." style={{ width: small ? 80 : 100, padding: small ? '3px 6px' : '4px 8px', fontSize: small ? 10 : 11 }} />
      {showDropdown && (value || filteredTags.length > 0) && (
        <div className="tag-dropdown">
          {filteredTags.map(t => <div key={t} className="tag-dropdown-item" onClick={() => handleAdd(t)}>{t}</div>)}
          {value.trim() && !allTags.includes(value.trim()) && <div className="tag-dropdown-item new" onClick={() => handleAdd(value.trim())}>+ Create "{value.trim()}"</div>}
        </div>
      )}
    </div>
  );
}

function SettingsView({ userName, userGreeting, updateUserSettings, userEmail, onLogout }) {
  const [tempName, setTempName] = useState(userName);
  const [tempGreeting, setTempGreeting] = useState(userGreeting);
  const [saved, setSaved] = useState(false);
  const handleSave = () => { updateUserSettings(tempName, tempGreeting); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      <div className="settings-section">
        <div className="settings-section-title">User Profile</div>
        <div className="settings-row"><span className="settings-label">Your Name</span><input className="form-input settings-input" value={tempName} onChange={e => setTempName(e.target.value)} placeholder="Enter your name" /></div>
        <div className="settings-row"><span className="settings-label">Greeting Message</span><input className="form-input settings-input" value={tempGreeting} onChange={e => setTempGreeting(e.target.value)} placeholder="e.g., Let's work, Hello" /></div>
        <div className="settings-row" style={{ marginTop: 16 }}><span className="settings-label"></span><button className="btn-primary" onClick={handleSave}>{saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}</button></div>
      </div>
      <div className="settings-section">
        <div className="settings-section-title">Account</div>
        <div className="settings-row"><span className="settings-label">Email</span><span className="settings-value">{userEmail}</span></div>
        <div className="settings-row" style={{ marginTop: 16 }}><span className="settings-label"></span><button className="btn-danger" onClick={onLogout}><LogOut size={14} /> Sign Out</button></div>
      </div>
      <div className="settings-section">
        <div className="settings-section-title">About</div>
        <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: '1.6' }}>Life Command v7.1.1<br />A personal productivity dashboard with cloud sync.</p>
      </div>
    </div>
  );
}

function ProjectsView({ projects, addProject, updateProject, deleteProject, reorderProjects, onTagClick, allTags, highlightedItemId }) {
  const [tagFilter, setTagFilter] = useState('all');
  const [dragIndex, setDragIndex] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  
  const getProgress = (p) => { if (!p.subItems?.length) return 0; return Math.round((p.subItems.filter(i => i.completed).length / p.subItems.length) * 100); };
  const isProjectComplete = (p) => p.subItems?.length > 0 && p.subItems.every(i => i.completed);
  const projectTags = [...new Set(projects.flatMap(p => p.tags || []))];
  const activeProjects = projects.filter(p => !p.archived);
  const archivedProjects = projects.filter(p => p.archived);
  const filtered = tagFilter === 'all' ? activeProjects : activeProjects.filter(p => p.tags?.includes(tagFilter));

  const handleDragStart = (index) => { setDragIndex(index); };
  const handleDragOver = (e, index) => { e.preventDefault(); if (dragIndex !== null && dragIndex !== index) { reorderProjects(dragIndex, index); setDragIndex(index); } };
  const handleDragEnd = () => { setDragIndex(null); };
  const archiveProject = (id) => updateProject(id, { archived: true });
  const restoreProject = (id) => updateProject(id, { archived: false });

  return (
    <div>
      <div className="content-toolbar">
        <div className="toolbar-left">
          {projectTags.length > 0 && (<><span className="filter-label"><Tag size={12} /> Filter by Tag</span><div className="filter-pills"><button className={`filter-pill ${tagFilter === 'all' ? 'active' : ''}`} onClick={() => setTagFilter('all')}>All</button>{projectTags.map(t => <button key={t} className={`filter-pill ${tagFilter === t ? 'active' : ''}`} onClick={() => setTagFilter(t)}>{t}</button>)}</div></>)}
        </div>
        <div className="toolbar-right"><button className="btn-primary" onClick={addProject}><Plus size={14} /> New Project</button></div>
      </div>
      
      {filtered.length === 0 && archivedProjects.length === 0 ? (
        <div className="empty"><div className="empty-icon"><List size={28} /></div><div className="empty-title">No projects yet</div><div className="empty-text">Create your first project to start organizing your work</div></div>
      ) : (
        <>
          {filtered.length === 0 ? <div className="empty" style={{ padding: '40px 24px' }}><div className="empty-title">No active projects</div><div className="empty-text">All projects are archived or filtered out</div></div> : (
            <div className="projects-list">
              {filtered.map((p, index) => <ProjectCard key={p.id} project={p} index={index} updateProject={updateProject} deleteProject={deleteProject} onTagClick={onTagClick} getProgress={getProgress} isComplete={isProjectComplete(p)} onArchive={archiveProject} allTags={allTags} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} isHighlighted={highlightedItemId === p.id} />)}
            </div>
          )}
          {archivedProjects.length > 0 && (
            <div className="archive-section">
              <div className="archive-header" onClick={() => setShowArchived(!showArchived)}>{showArchived ? <ChevronUp size={16} /> : <ChevronDown size={16} />}<span>Archived ({archivedProjects.length})</span></div>
              {showArchived && <div className="archive-list">{archivedProjects.map(p => <div key={p.id} className="archive-item"><span className="archive-item-title">{p.title}</span><div className="archive-item-actions"><button className="btn-secondary" onClick={() => restoreProject(p.id)}>Restore</button><button className="icon-btn danger" onClick={() => deleteProject(p.id)}><Trash2 size={14} /></button></div></div>)}</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProjectCard({ project, index, updateProject, deleteProject, onTagClick, getProgress, isComplete, onArchive, allTags, onDragStart, onDragOver, onDragEnd, isHighlighted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.title);
  const [showSub, setShowSub] = useState(true);
  const [newSub, setNewSub] = useState('');
  const [editingTags, setEditingTags] = useState(false);

  const progress = getProgress(project);
  const completed = project.subItems?.filter(i => i.completed).length || 0;
  const total = project.subItems?.length || 0;

  const saveTitle = () => { if (editedTitle.trim()) updateProject(project.id, { title: editedTitle }); setIsEditing(false); };
  const addSub = () => { if (newSub.trim()) { updateProject(project.id, { subItems: [...(project.subItems || []), { id: `sub_${Date.now()}`, text: newSub, completed: false, status: 'new', priority: 'medium' }] }); setNewSub(''); } };
  const updateSub = (subId, updates) => updateProject(project.id, { subItems: project.subItems.map(i => i.id === subId ? { ...i, ...updates } : i) });
  const deleteSub = (subId) => updateProject(project.id, { subItems: project.subItems.filter(i => i.id !== subId) });
  const addTag = (tag) => { if (!project.tags?.includes(tag)) updateProject(project.id, { tags: [...(project.tags || []), tag] }); setEditingTags(false); };
  const removeTag = (tag) => updateProject(project.id, { tags: project.tags.filter(t => t !== tag) });

  return (
    <div id={project.id} className={`project-card ${isComplete ? 'completed' : ''} ${isHighlighted ? 'highlighted' : ''}`}>
      <div className="project-header" draggable onDragStart={() => onDragStart(index)} onDragOver={e => onDragOver(e, index)} onDragEnd={onDragEnd}>
        {isEditing ? <input className="form-input" value={editedTitle} onChange={e => setEditedTitle(e.target.value)} onBlur={saveTitle} onKeyDown={e => e.key === 'Enter' && saveTitle()} autoFocus style={{ flex: 1, marginRight: 12 }} /> : <div className="project-title" onClick={() => setIsEditing(true)}>{project.title}</div>}
        <div className="project-actions">{isComplete && <button className="btn-archive" onClick={() => onArchive(project.id)}>Archive</button>}<button className="icon-btn danger" onClick={() => deleteProject(project.id)}><Trash2 size={14} /></button></div>
      </div>
      <div className="project-progress"><span className="progress-text">{isComplete ? 'Complete!' : `Progress ${completed}/${total} (${progress}%)`}</span><div className="progress-bar"><div className={`progress-fill ${isComplete ? 'complete' : ''}`} style={{ width: `${progress}%` }} /></div></div>
      <div className="project-tags">
        {project.tags?.map(t => <span key={t} className="tag-pill" onClick={() => onTagClick(t)}><Tag size={10} />{t}<X size={10} style={{ marginLeft: 2, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); removeTag(t); }} /></span>)}
        {editingTags ? <TagInput onAdd={addTag} allTags={allTags} existingTags={project.tags} /> : <span className="tag-pill" onClick={() => setEditingTags(true)} style={{ cursor: 'pointer' }}><Plus size={10} /></span>}
      </div>
      <div className="sub-toggle" onClick={() => setShowSub(!showSub)}>{showSub ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Sub Items ({total})</div>
      {showSub && (
        <div className="sub-list">
          {project.subItems?.map(item => <SubItem key={item.id} item={item} updateSub={updateSub} deleteSub={deleteSub} />)}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}><input className="form-input" value={newSub} onChange={e => setNewSub(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSub()} placeholder="Add sub-item..." style={{ flex: 1 }} /><button className="btn-secondary" onClick={addSub}><Plus size={12} /></button></div>
        </div>
      )}
    </div>
  );
}

function SubItem({ item, updateSub, deleteSub }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(item.text);
  const saveText = () => { if (editedText.trim()) updateSub(item.id, { text: editedText }); setIsEditing(false); };

  return (
    <div className="sub-item">
      <div className={`sub-checkbox ${item.completed ? 'checked' : ''}`} onClick={() => updateSub(item.id, { completed: !item.completed })}><Check size={10} /></div>
      {isEditing ? <input className="sub-text-input" value={editedText} onChange={e => setEditedText(e.target.value)} onBlur={saveText} onKeyDown={e => { if (e.key === 'Enter') saveText(); if (e.key === 'Escape') { setEditedText(item.text); setIsEditing(false); } }} autoFocus /> : <span className={`sub-text ${item.completed ? 'done' : ''}`} onClick={() => setIsEditing(true)}>{item.text}</span>}
      <div className="sub-badges">
        <select className={`status-badge ${item.status}`} value={item.status} onChange={e => updateSub(item.id, { status: e.target.value })}><option value="new">New</option><option value="working">Working</option><option value="paused">Paused</option><option value="stuck">Stuck</option></select>
        <select className={`priority-badge ${item.priority}`} value={item.priority} onChange={e => updateSub(item.id, { priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
      </div>
      <div className="sub-actions"><button className="icon-btn" onClick={() => setIsEditing(true)}><Edit2 size={12} /></button><button className="icon-btn" onClick={() => navigator.clipboard.writeText(item.text)}><Copy size={12} /></button><button className="icon-btn danger" onClick={() => deleteSub(item.id)}><X size={12} /></button></div>
    </div>
  );
}

function LinksView({ links, addLink, updateLink, deleteLink, reorderLinks, onTagClick, allTags, highlightedItemId }) {
  const [tagFilter, setTagFilter] = useState('all');
  const [dragIndex, setDragIndex] = useState(null);
  const linkTags = [...new Set(links.flatMap(l => l.tags || []))];
  const filtered = tagFilter === 'all' ? links : links.filter(l => l.tags?.includes(tagFilter));
  const handleDragStart = (index) => { setDragIndex(index); };
  const handleDragOver = (e, index) => { e.preventDefault(); if (dragIndex !== null && dragIndex !== index) { reorderLinks(dragIndex, index); setDragIndex(index); } };
  const handleDragEnd = () => { setDragIndex(null); };

  return (
    <div>
      <div className="content-toolbar">
        <div className="toolbar-left"><div className="filter-pills"><button className={`filter-pill ${tagFilter === 'all' ? 'active' : ''}`} onClick={() => setTagFilter('all')}>All</button>{linkTags.map(t => <button key={t} className={`filter-pill ${tagFilter === t ? 'active' : ''}`} onClick={() => setTagFilter(t)}><Tag size={10} />{t}</button>)}</div></div>
        <div className="toolbar-right"><button className="btn-primary" onClick={addLink}><Plus size={14} /> New Link</button></div>
      </div>
      {filtered.length === 0 ? <div className="empty"><div className="empty-icon"><Link2 size={28} /></div><div className="empty-title">No links yet</div><div className="empty-text">Save useful links for quick access</div></div> : (
        <div className="links-grid">{filtered.map((l, index) => <LinkCard key={l.id} link={l} index={index} updateLink={updateLink} deleteLink={deleteLink} onTagClick={onTagClick} allTags={allTags} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} isHighlighted={highlightedItemId === l.id} />)}</div>
      )}
    </div>
  );
}

function LinkCard({ link, index, updateLink, deleteLink, onTagClick, allTags, onDragStart, onDragOver, onDragEnd, isHighlighted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(link.title);
  const [editedUrl, setEditedUrl] = useState(link.url);
  const [editingTags, setEditingTags] = useState(false);
  const save = () => { updateLink(link.id, { title: editedTitle, url: editedUrl }); setIsEditing(false); };
  const addTag = (tag) => { if (!link.tags?.includes(tag)) updateLink(link.id, { tags: [...(link.tags || []), tag] }); setEditingTags(false); };
  const removeTag = (tag) => updateLink(link.id, { tags: link.tags.filter(t => t !== tag) });

  return (
    <div id={link.id} className={`link-card ${isHighlighted ? 'highlighted' : ''}`}>
      <div className="link-header" draggable onDragStart={() => onDragStart(index)} onDragOver={e => onDragOver(e, index)} onDragEnd={onDragEnd}>
        {isEditing ? <input className="form-input" value={editedTitle} onChange={e => setEditedTitle(e.target.value)} onBlur={save} style={{ fontSize: 14, fontWeight: 600 }} autoFocus /> : <div className="link-title" onClick={() => setIsEditing(true)}>{link.title}</div>}
      </div>
      {isEditing ? <input className="form-input" value={editedUrl} onChange={e => setEditedUrl(e.target.value)} onBlur={save} style={{ marginBottom: 12 }} /> : <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-url">{link.url}</a>}
      <div className="link-footer">
        <div className="link-tags">
          {link.tags?.map(t => <span key={t} className="tag-pill" onClick={() => onTagClick(t)}><Tag size={9} />{t}<X size={9} style={{ marginLeft: 2, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); removeTag(t); }} /></span>)}
          {editingTags ? <TagInput onAdd={addTag} allTags={allTags} existingTags={link.tags} /> : <span className="tag-pill" onClick={() => setEditingTags(true)} style={{ cursor: 'pointer' }}><Plus size={9} /></span>}
        </div>
        <button className="icon-btn danger" onClick={() => deleteLink(link.id)}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

function NotesView({ notes, addNote, updateNote, deleteNote, onTagClick, allTags, highlightedItemId }) {
  const [tagFilter, setTagFilter] = useState('all');
  const noteTags = [...new Set(notes.flatMap(n => n.tags || []))];
  const filtered = tagFilter === 'all' ? notes : notes.filter(n => n.tags?.includes(tagFilter));

  return (
    <div>
      <div className="content-toolbar">
        <div className="toolbar-left"><div className="filter-pills"><button className={`filter-pill ${tagFilter === 'all' ? 'active' : ''}`} onClick={() => setTagFilter('all')}>All</button>{noteTags.map(t => <button key={t} className={`filter-pill ${tagFilter === t ? 'active' : ''}`} onClick={() => setTagFilter(t)}><Tag size={10} />{t}</button>)}</div></div>
        <div className="toolbar-right"><button className="btn-primary" onClick={addNote}><Plus size={14} /> New Note</button></div>
      </div>
      {filtered.length === 0 ? <div className="empty"><div className="empty-icon"><FileText size={28} /></div><div className="empty-title">No notes yet</div><div className="empty-text">Create notes to capture your thoughts</div></div> : (
        <div className="notes-grid">{filtered.map(n => <NoteCard key={n.id} note={n} updateNote={updateNote} deleteNote={deleteNote} onTagClick={onTagClick} allTags={allTags} isHighlighted={highlightedItemId === n.id} />)}</div>
      )}
    </div>
  );
}

function NoteCard({ note, updateNote, deleteNote, onTagClick, allTags, isHighlighted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);
  const [editedColor, setEditedColor] = useState(note.color || 'yellow');
  const [editingTags, setEditingTags] = useState(false);

  const save = () => { updateNote(note.id, { title: editedTitle, content: editedContent, color: editedColor }); setIsEditing(false); };
  const addTag = (tag) => { if (!note.tags?.includes(tag)) updateNote(note.id, { tags: [...(note.tags || []), tag] }); setEditingTags(false); };
  const removeTag = (tag) => updateNote(note.id, { tags: note.tags.filter(t => t !== tag) });
  const color = note.color || 'yellow';

  if (isEditing) {
    return (
      <div id={note.id} className={`note-card ${editedColor}`}>
        <div className="color-picker">{NOTE_COLORS.map(c => <div key={c.id} className={`color-swatch ${editedColor === c.id ? 'active' : ''}`} style={{ backgroundColor: c.bg }} onClick={() => setEditedColor(c.id)} title={c.name} />)}</div>
        <input className="note-edit-input" value={editedTitle} onChange={e => setEditedTitle(e.target.value)} autoFocus />
        <RichTextEditor value={editedContent} onChange={setEditedContent} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><button className="btn-primary" onClick={save}><Save size={12} /> Save</button><button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button></div>
      </div>
    );
  }

  return (
    <div id={note.id} className={`note-card ${color} ${isHighlighted ? 'highlighted' : ''}`}>
      <div className="note-header"><div className="note-title" onClick={() => setIsEditing(true)}>{note.title}</div></div>
      <div className="note-content" onClick={() => setIsEditing(true)} dangerouslySetInnerHTML={{ __html: note.content || '<span style="opacity:0.5">Click to add content...</span>' }} />
      <div className="note-tags">
        {note.tags?.map(t => <span key={t} className="note-tag" onClick={() => onTagClick(t)}><Tag size={8} />{t}<X size={8} style={{ marginLeft: 2, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); removeTag(t); }} /></span>)}
        {editingTags ? <TagInput onAdd={addTag} allTags={allTags} existingTags={note.tags} small /> : <span className="note-tag" onClick={() => setEditingTags(true)} style={{ cursor: 'pointer' }}><Plus size={8} /></span>}
      </div>
      <div className="note-actions"><button className="icon-btn" onClick={() => deleteNote(note.id)}><Trash2 size={14} /></button></div>
    </div>
  );
}

function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  useEffect(() => {
    if (editorRef.current && !quillRef.current && window.Quill) {
      quillRef.current = new window.Quill(editorRef.current, { theme: 'snow', modules: { toolbar: [['bold', 'italic'], [{ list: 'ordered' }, { list: 'bullet' }]] }, placeholder: 'Start typing...' });
      if (value) quillRef.current.root.innerHTML = value;
      quillRef.current.on('text-change', () => onChange(quillRef.current.root.innerHTML));
    }
  }, []);
  useEffect(() => { if (quillRef.current && value !== quillRef.current.root.innerHTML) quillRef.current.root.innerHTML = value || ''; }, [value]);
  return <div className="quill-wrapper"><div ref={editorRef} style={{ minHeight: 100 }} /></div>;
}

function TagsView({ projects, links, notes, inspirations, activeTagFilter, setActiveTagFilter, navigateToItem }) {
  const getCounts = () => { const c = {}; projects.forEach(p => p.tags?.forEach(t => c[t] = (c[t] || 0) + 1)); links.forEach(l => l.tags?.forEach(t => c[t] = (c[t] || 0) + 1)); notes.forEach(n => n.tags?.forEach(t => c[t] = (c[t] || 0) + 1)); inspirations.forEach(i => i.tags?.forEach(t => c[t] = (c[t] || 0) + 1)); return c; };
  const counts = getCounts();
  const tags = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const getItems = (tag) => {
    const items = [];
    projects.filter(p => p.tags?.includes(tag)).forEach(p => items.push({ type: 'Project', item: p }));
    links.filter(l => l.tags?.includes(tag)).forEach(l => items.push({ type: 'Link', item: l }));
    notes.filter(n => n.tags?.includes(tag)).forEach(n => items.push({ type: 'Note', item: n }));
    inspirations.filter(i => i.tags?.includes(tag)).forEach(i => items.push({ type: 'Inspo', item: i }));
    return items;
  };

  return (
    <div>
      {tags.length === 0 ? <div className="empty"><div className="empty-icon"><Tag size={28} /></div><div className="empty-title">No tags yet</div><div className="empty-text">Add tags to your items to organize them</div></div> : (
        <>
          <div className="tags-grid">{tags.map(t => <div key={t} className={`tag-card ${activeTagFilter === t ? 'active' : ''}`} onClick={() => setActiveTagFilter(activeTagFilter === t ? null : t)}><div className="tag-name"><Tag size={14} />{t}</div><div className="tag-count">{counts[t]} items</div></div>)}</div>
          {activeTagFilter && (
            <div className="tagged-items">
              <h3>Items tagged "{activeTagFilter}"</h3>
              {getItems(activeTagFilter).map(({ type, item }) => (
                <div key={item.id} className="tagged-item" onClick={() => navigateToItem(type, item.id)}>
                  {type === 'Project' && <List size={14} />}{type === 'Link' && <Link2 size={14} />}{type === 'Note' && <FileText size={14} />}{type === 'Inspo' && <Image size={14} />}
                  <span className="tagged-item-type">{type}</span><span className="tagged-item-name">{item.title || item.name}</span><ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-3)' }} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InspoView({ inspirations, addInspiration, updateInspiration, deleteInspiration, onTagClick, allTags, highlightedItemId }) {
  const [tagFilter, setTagFilter] = useState('all');
  const [lightbox, setLightbox] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const inspoTags = [...new Set(inspirations.flatMap(i => i.tags || []))];
  const filtered = tagFilter === 'all' ? inspirations : inspirations.filter(i => i.tags?.includes(tagFilter));

  const handleFileSelect = (file) => { if (file?.type.startsWith('image/')) { const name = prompt('Name this inspiration:', file.name.split('.')[0]); const tags = prompt('Tags (comma separated):', ''); if (name !== null) addInspiration(file, name, tags?.split(',').map(t => t.trim()).filter(Boolean) || []); } };
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files?.[0]); };
  const handleUploadClick = () => { fileInputRef.current?.click(); };
  const download = (url, name) => { const a = document.createElement('a'); a.href = url; a.download = name || 'inspiration'; a.click(); };

  return (
    <div>
      <div className="content-toolbar">
        <div className="toolbar-left"><div className="filter-pills"><button className={`filter-pill ${tagFilter === 'all' ? 'active' : ''}`} onClick={() => setTagFilter('all')}>All</button>{inspoTags.map(t => <button key={t} className={`filter-pill ${tagFilter === t ? 'active' : ''}`} onClick={() => setTagFilter(t)}><Tag size={10} />{t}</button>)}</div></div>
        <div className="toolbar-right"><button className="btn-primary" onClick={handleUploadClick}><Plus size={14} /> Upload Image</button><input ref={fileInputRef} type="file" accept="image/*" onChange={e => handleFileSelect(e.target.files?.[0])} style={{ display: 'none' }} /></div>
      </div>
      <div className={`upload-area ${dragOver ? 'drag-over' : ''}`} onClick={handleUploadClick} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
        <Upload size={32} className="upload-icon" /><p className="upload-text"><strong>Click to upload</strong> or drag and drop</p><p className="upload-hint">PNG, JPG, GIF up to 10MB</p>
      </div>
      {filtered.length === 0 ? <div className="empty"><div className="empty-icon"><Image size={28} /></div><div className="empty-title">No inspiration yet</div><div className="empty-text">Upload images to build your inspiration library</div></div> : (
        <div className="inspo-grid">{filtered.map(i => <InspoCard key={i.id} inspo={i} updateInspiration={updateInspiration} deleteInspiration={deleteInspiration} onTagClick={onTagClick} allTags={allTags} setLightbox={setLightbox} download={download} isHighlighted={highlightedItemId === i.id} />)}</div>
      )}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close"><X size={20} /></button>
          <img src={lightbox.originalUrl || lightbox.url} alt={lightbox.name} className="lightbox-image" onClick={e => e.stopPropagation()} />
          <div className="lightbox-actions" onClick={e => e.stopPropagation()}><button className="lightbox-btn" onClick={() => download(lightbox.originalUrl || lightbox.url, lightbox.name)}><Download size={14} /> Download Original</button></div>
        </div>
      )}
    </div>
  );
}

function InspoCard({ inspo, updateInspiration, deleteInspiration, onTagClick, allTags, setLightbox, download, isHighlighted }) {
  const [editingTags, setEditingTags] = useState(false);
  const [tagValue, setTagValue] = useState('');
  const addTag = (tag) => { if (tag && !inspo.tags?.includes(tag)) updateInspiration(inspo.id, { tags: [...(inspo.tags || []), tag] }); setTagValue(''); setEditingTags(false); };
  const removeTag = (tag) => { updateInspiration(inspo.id, { tags: inspo.tags.filter(t => t !== tag) }); };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && tagValue.trim()) addTag(tagValue.trim()); else if (e.key === 'Escape') { setTagValue(''); setEditingTags(false); } };

  return (
    <div id={inspo.id} className={`inspo-card ${isHighlighted ? 'highlighted' : ''}`}>
      <img src={inspo.thumbnail || inspo.url} alt={inspo.name} className="inspo-image" onClick={() => setLightbox(inspo)} />
      <div className="inspo-info">
        <div className="inspo-name">{inspo.name}</div>
        <div className="inspo-tags">
          {inspo.tags?.map(t => <span key={t} className="tag-pill" onClick={() => onTagClick(t)} style={{ fontSize: 10, padding: '3px 6px' }}>{t}<X size={8} style={{ marginLeft: 2, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); removeTag(t); }} /></span>)}
          {editingTags ? <input className="form-input" value={tagValue} onChange={e => setTagValue(e.target.value)} onKeyDown={handleKeyDown} onBlur={() => { if (tagValue.trim()) addTag(tagValue.trim()); else setEditingTags(false); }} placeholder="Type tag..." autoFocus style={{ width: 80, padding: '3px 6px', fontSize: 10 }} /> : <span className="tag-pill" onClick={() => setEditingTags(true)} style={{ fontSize: 10, padding: '3px 6px', cursor: 'pointer' }}><Plus size={8} /></span>}
        </div>
      </div>
      <div className="inspo-actions"><button className="icon-btn" onClick={() => download(inspo.originalUrl || inspo.url, inspo.name)}><Download size={12} /></button><button className="icon-btn danger" onClick={() => deleteInspiration(inspo.id)}><Trash2 size={12} /></button></div>
    </div>
  );
}
