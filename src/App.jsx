import { useState, useEffect, useRef } from 'react';
import { 
  List, Link2, FileText, Tag, Image, Plus, Trash2, Save, X, 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Moon, Sun, 
  Download, Upload, GripVertical, Check, Copy, Filter, User
} from 'lucide-react';

// ============================================================================
// LIFE COMMAND v7.0.2
// ============================================================================

const CLOUDINARY_CLOUD_NAME = 'dccblqxuy';
const CLOUDINARY_UPLOAD_PRESET = 'Life Command';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('lifeCommandDarkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('projects');
  
  const [projects, setProjects] = useState([]);
  const [links, setLinks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [inspirations, setInspirations] = useState([]);
  const [activeTagFilter, setActiveTagFilter] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const savedProjects = localStorage.getItem('lifeCommandProjects');
    const savedLinks = localStorage.getItem('lifeCommandLinks');
    const savedNotes = localStorage.getItem('lifeCommandNotes');
    const savedInspirations = localStorage.getItem('lifeCommandInspirations');
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedLinks) setLinks(JSON.parse(savedLinks));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedInspirations) setInspirations(JSON.parse(savedInspirations));
  }, []);

  useEffect(() => { localStorage.setItem('lifeCommandProjects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('lifeCommandLinks', JSON.stringify(links)); }, [links]);
  useEffect(() => { localStorage.setItem('lifeCommandNotes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('lifeCommandInspirations', JSON.stringify(inspirations)); }, [inspirations]);
  useEffect(() => { localStorage.setItem('lifeCommandDarkMode', JSON.stringify(darkMode)); }, [darkMode]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth < 900) setSidebarCollapsed(true); };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // CRUD Operations
  const addProject = () => {
    setProjects([{ id: `project_${Date.now()}`, title: 'New Project', subItems: [], tags: [], completed: false, createdAt: new Date().toISOString() }, ...projects]);
  };
  const updateProject = (id, updates) => setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
  const deleteProject = (id) => setProjects(projects.filter(p => p.id !== id));

  const addLink = () => {
    setLinks([{ id: `link_${Date.now()}`, title: 'New Link', url: 'https://', tags: [], createdAt: new Date().toISOString() }, ...links]);
  };
  const updateLink = (id, updates) => setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
  const deleteLink = (id) => setLinks(links.filter(l => l.id !== id));

  const addNote = () => {
    setNotes([{ id: `note_${Date.now()}`, title: 'New Note', content: '', tags: [], createdAt: new Date().toISOString() }, ...notes]);
  };
  const updateNote = (id, updates) => setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
  const deleteNote = (id) => setNotes(notes.filter(n => n.id !== id));

  const addInspiration = async (file, name, tags) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'life-command');
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      const data = await response.json();
      const newInspiration = {
        id: `inspo_${Date.now()}`, name: name || 'Untitled', cloudinaryId: data.public_id,
        url: data.secure_url, thumbnail: data.secure_url.replace('/upload/', '/upload/w_600,q_auto/'),
        originalUrl: data.secure_url, tags: tags || [], dimensions: { width: data.width, height: data.height },
        createdAt: new Date().toISOString()
      };
      setInspirations([newInspiration, ...inspirations]);
      return newInspiration;
    } catch (error) { console.error('Upload failed:', error); return null; }
  };
  const deleteInspiration = (id) => setInspirations(inspirations.filter(i => i.id !== id));

  // Navigation
  const handleTagClick = (tagName) => { setActiveView('tags'); setActiveTagFilter(tagName); };
  
  const navigateToItem = (type, id) => {
    if (type === 'Project') setActiveView('projects');
    else if (type === 'Link') setActiveView('links');
    else if (type === 'Note') setActiveView('notes');
    else if (type === 'Inspo') setActiveView('inspo');
    setActiveTagFilter(null);
  };

  const getAllTags = () => {
    const allTags = new Set();
    projects.forEach(p => p.tags?.forEach(t => allTags.add(t)));
    links.forEach(l => l.tags?.forEach(t => allTags.add(t)));
    notes.forEach(n => n.tags?.forEach(t => allTags.add(t)));
    inspirations.forEach(i => i.tags?.forEach(t => allTags.add(t)));
    return Array.from(allTags).sort();
  };

  const exportData = () => {
    const data = { version: '7.0.2', exportedAt: new Date().toISOString(), projects, links, notes, inspirations };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `life-command-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.projects) setProjects(data.projects);
        if (data.links) setLinks(data.links);
        if (data.notes) setNotes(data.notes);
        if (data.inspirations) setInspirations(data.inspirations);
      } catch (err) { console.error('Import failed:', err); }
    };
    reader.readAsText(file);
  };

  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const viewConfig = {
    projects: { title: 'Projects', subtitle: `${projects.filter(p => !p.completed).length} Active, ${projects.filter(p => p.completed).length} Completed` },
    links: { title: 'Links', subtitle: `${links.length} Saved Links` },
    notes: { title: 'Notes', subtitle: `${notes.length} Notes` },
    tags: { title: 'Tags', subtitle: `${getAllTags().length} Tags` },
    inspo: { title: 'Design Inspo', subtitle: `${inspirations.length} Images` }
  };

  const current = viewConfig[activeView];

  return (
    <div className={`lc ${darkMode ? 'dark' : 'light'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        :root{--font:'Inter Tight',-apple-system,BlinkMacSystemFont,sans-serif;--radius:6px;--transition:0.15s ease}
        
        .lc.dark{
          --bg-app:#1C1C1C;--bg-sidebar:#232323;--bg-header:#232323;--bg-card:#2A2A2A;--bg-card-hover:#333;
          --bg-input:#333;--text-1:#FFF;--text-2:#A0A0A0;--text-3:#666;--border:#383838;
          --accent:#1A9A8A;--accent-hover:#168A7A;--accent-soft:rgba(26,154,138,0.12);
        }
        .lc.light{
          --bg-app:#F2F2ED;--bg-sidebar:#E8E8E3;--bg-header:#E8E8E3;--bg-card:#DDDDD8;--bg-card-hover:#D0D0CB;
          --bg-input:#FFF;--text-1:#1A1A1A;--text-2:#666;--text-3:#999;--border:#C8C8C3;
          --accent:#1A9A8A;--accent-hover:#168A7A;--accent-soft:rgba(26,154,138,0.08);
        }
        
        .lc{font-family:var(--font);background:var(--bg-app);color:var(--text-1);min-height:100vh;display:flex;font-size:13px;line-height:1.5}
        
        /* SIDEBAR */
        .sb{width:220px;background:var(--bg-sidebar);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;height:100vh;position:sticky;top:0;transition:width 0.2s ease}
        .sb.collapsed{width:60px}
        .sb-head{height:52px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)}
        .sb.collapsed .sb-head{justify-content:center;padding:0}
        .logo{font-size:15px;font-weight:700;white-space:nowrap}
        .logo span{font-weight:400;color:var(--text-2)}
        .sb.collapsed .logo{display:none}
        .collapse-btn{width:24px;height:24px;display:flex;align-items:center;justify-content:center;background:none;border:none;color:var(--text-3);cursor:pointer;border-radius:var(--radius);transition:var(--transition)}
        .collapse-btn:hover{background:var(--bg-card);color:var(--text-1)}
        
        .sb-nav{flex:1;padding:8px;overflow-y:auto}
        .nav-item{display:flex;align-items:center;gap:12px;padding:10px 12px;margin-bottom:2px;border-radius:var(--radius);cursor:pointer;color:var(--text-2);font-size:13px;font-weight:500;transition:var(--transition)}
        .sb.collapsed .nav-item{justify-content:center;padding:12px}
        .sb.collapsed .nav-label,.sb.collapsed .nav-count{display:none}
        .nav-item:hover{background:var(--bg-card);color:var(--text-1)}
        .nav-item.active{background:var(--accent);color:#fff}
        .nav-icon{width:18px;height:18px;flex-shrink:0}
        .nav-count{margin-left:auto;font-size:11px;font-weight:600;min-width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:var(--bg-app);border-radius:11px;color:var(--text-2)}
        .nav-item.active .nav-count{background:rgba(255,255,255,0.2);color:#fff}
        
        .sb-foot{padding:16px;border-top:1px solid var(--border)}
        .sb.collapsed .sb-foot{padding:12px 8px;text-align:center}
        .time{font-size:20px;font-weight:700;line-height:1}
        .sb.collapsed .time{font-size:11px}
        .date{font-size:11px;color:var(--text-2);margin-top:4px}
        .sb.collapsed .date{display:none}
        
        /* MAIN */
        .main{flex:1;display:flex;flex-direction:column;min-width:0}
        
        /* HEADER - Only: Title, Subtitle, Theme, Export, Import, Greeting */
        .hd{height:52px;padding:0 24px;display:flex;align-items:center;gap:16px;background:var(--bg-header);border-bottom:1px solid var(--border)}
        .hd-title{font-size:18px;font-weight:700}
        .hd-sub{font-size:12px;color:var(--text-2)}
        .hd-spacer{flex:1}
        .hd-actions{display:flex;align-items:center;gap:4px}
        
        .theme-toggle{display:flex;background:var(--bg-card);border-radius:16px;padding:3px}
        .theme-btn{width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:none;border:none;color:var(--text-3);cursor:pointer;border-radius:13px;transition:var(--transition)}
        .theme-btn.active{background:var(--accent);color:#fff}
        
        .hd-btn{display:flex;align-items:center;gap:6px;padding:8px 12px;background:none;border:none;color:var(--text-2);font-size:12px;font-weight:500;cursor:pointer;font-family:var(--font);transition:var(--transition)}
        .hd-btn:hover{color:var(--text-1)}
        
        .greeting{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-2);padding-left:12px;border-left:1px solid var(--border)}
        .greeting strong{color:var(--text-1)}
        .user-icon{width:28px;height:28px;background:var(--bg-card);border-radius:14px;display:flex;align-items:center;justify-content:center;color:var(--text-2)}
        
        /* CONTENT */
        .content{flex:1;padding:24px;overflow-y:auto}
        
        /* CONTENT TOOLBAR - View toggle and action buttons go here */
        .content-toolbar{display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap}
        .toolbar-left{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .toolbar-right{display:flex;align-items:center;gap:8px;margin-left:auto}
        
        .filter-label{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-2)}
        .filter-pills{display:flex;gap:6px;flex-wrap:wrap}
        .filter-pill{padding:6px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);color:var(--text-2);font-size:12px;font-weight:500;cursor:pointer;font-family:var(--font);transition:var(--transition);display:flex;align-items:center;gap:4px}
        .filter-pill:hover{border-color:var(--accent);color:var(--text-1)}
        .filter-pill.active{background:var(--accent);border-color:var(--accent);color:#fff}
        
        .view-toggle{display:flex;background:var(--bg-card);border-radius:var(--radius);padding:3px}
        .view-btn{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:none;border:none;color:var(--text-3);cursor:pointer;border-radius:4px;transition:var(--transition)}
        .view-btn.active{background:var(--bg-app);color:var(--text-1)}
        
        .btn-primary{display:flex;align-items:center;gap:6px;padding:8px 16px;background:var(--accent);color:#fff;border:none;border-radius:var(--radius);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font);transition:var(--transition);white-space:nowrap}
        .btn-primary:hover{background:var(--accent-hover)}
        
        .btn-secondary{display:flex;align-items:center;gap:6px;padding:8px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);font-size:12px;font-weight:500;color:var(--text-1);cursor:pointer;font-family:var(--font);transition:var(--transition)}
        .btn-secondary:hover{background:var(--bg-card-hover)}
        
        /* CARDS */
        .projects-list{display:flex;flex-direction:column;gap:12px}
        .project-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;transition:var(--transition)}
        .project-card:hover{border-color:var(--accent)}
        .project-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}
        .project-title{font-size:16px;font-weight:600;cursor:pointer}
        .project-title:hover{color:var(--accent)}
        .project-actions{display:flex;gap:4px}
        
        .icon-btn{width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:none;border:none;color:var(--text-3);cursor:pointer;border-radius:var(--radius);transition:var(--transition)}
        .icon-btn:hover{background:var(--bg-app);color:var(--text-1)}
        .icon-btn.danger:hover{background:#3D2020;color:#F87171}
        
        .project-progress{margin-bottom:12px}
        .progress-text{font-size:11px;color:var(--text-2);margin-bottom:4px}
        .progress-bar{width:100%;height:4px;background:var(--bg-app);border-radius:2px;overflow:hidden}
        .progress-fill{height:100%;background:var(--accent);border-radius:2px;transition:width 0.3s ease}
        
        .project-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
        .tag-pill{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;background:var(--bg-app);border:1px solid var(--border);border-radius:4px;font-size:11px;color:var(--text-2);cursor:pointer;transition:var(--transition)}
        .tag-pill:hover{border-color:var(--accent);color:var(--accent)}
        
        .sub-toggle{display:flex;align-items:center;gap:6px;padding:6px 0;color:var(--text-2);font-size:12px;font-weight:500;cursor:pointer}
        .sub-toggle:hover{color:var(--text-1)}
        .sub-list{margin-top:8px;display:flex;flex-direction:column;gap:6px}
        .sub-item{display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--bg-app);border-radius:var(--radius)}
        .sub-checkbox{width:16px;height:16px;border:2px solid var(--border);border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:var(--transition)}
        .sub-checkbox.checked{background:var(--accent);border-color:var(--accent);color:#fff}
        .sub-text{flex:1;font-size:13px}
        .sub-text.done{text-decoration:line-through;color:var(--text-3)}
        .sub-badges{display:flex;gap:6px}
        .status-badge,.priority-badge{padding:4px 8px;border-radius:4px;font-size:11px;font-weight:500;border:none;cursor:pointer;font-family:var(--font)}
        .status-badge.new{background:#2AA89A;color:#fff}
        .status-badge.working{background:#1A9A8A;color:#fff}
        .status-badge.paused{background:#666;color:#fff}
        .status-badge.stuck{background:#E85D5D;color:#fff}
        .priority-badge.low{background:#5DD0A8;color:#064E3B}
        .priority-badge.medium{background:#E8C547;color:#78350F}
        .priority-badge.high{background:#E89A9A;color:#7F1D1D}
        .priority-badge.urgent{background:#D66BA0;color:#831843}
        .sub-actions{display:flex;gap:2px}
        
        /* LINKS GRID */
        .links-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        @media(max-width:1100px){.links-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:700px){.links-grid{grid-template-columns:1fr}}
        .link-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;transition:var(--transition);display:flex;flex-direction:column}
        .link-card:hover{border-color:var(--accent)}
        .link-header{display:flex;justify-content:space-between;margin-bottom:6px}
        .link-title{font-size:14px;font-weight:600;cursor:pointer}
        .link-title:hover{color:var(--accent)}
        .link-url{font-size:12px;color:var(--accent);text-decoration:none;display:block;margin-bottom:12px;word-break:break-all}
        .link-url:hover{text-decoration:underline}
        .link-footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto}
        .link-tags{display:flex;gap:4px;flex-wrap:wrap}
        
        /* NOTES GRID */
        .notes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
        .note-card{padding:16px;border-radius:var(--radius);position:relative;min-height:140px;display:flex;flex-direction:column;transition:var(--transition)}
        .note-card:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,0.15)}
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
        .note-content{font-size:12px;color:#1A1A1A;opacity:0.75;line-height:1.5;flex:1}
        .note-tags{display:flex;gap:4px;flex-wrap:wrap;margin-top:12px}
        .note-tag{padding:3px 6px;background:rgba(0,0,0,0.12);border-radius:4px;font-size:10px;font-weight:500;color:#1A1A1A;cursor:pointer;display:flex;align-items:center;gap:3px}
        .note-actions{position:absolute;top:10px;right:10px;display:flex;gap:2px}
        .note-actions .icon-btn{color:rgba(0,0,0,0.35);width:26px;height:26px}
        .note-actions .icon-btn:hover{color:rgba(0,0,0,0.7);background:rgba(0,0,0,0.1)}
        
        /* Note editing - better contrast */
        .note-edit-input{width:100%;padding:8px 10px;background:rgba(255,255,255,0.9);border:1px solid rgba(0,0,0,0.2);border-radius:var(--radius);font-size:14px;font-weight:600;color:#1A1A1A;font-family:var(--font);margin-bottom:8px}
        .note-edit-input:focus{outline:none;border-color:rgba(0,0,0,0.4)}
        
        /* INSPO GRID */
        .inspo-grid{column-count:4;column-gap:16px}
        @media(max-width:1200px){.inspo-grid{column-count:3}}
        @media(max-width:900px){.inspo-grid{column-count:2}}
        @media(max-width:500px){.inspo-grid{column-count:1}}
        .inspo-card{break-inside:avoid;margin-bottom:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:var(--transition)}
        .inspo-card:hover{border-color:var(--accent);transform:translateY(-2px)}
        .inspo-image{width:100%;display:block;cursor:pointer}
        .inspo-info{padding:12px}
        .inspo-name{font-size:13px;font-weight:600;margin-bottom:6px}
        .inspo-tags{display:flex;gap:4px;flex-wrap:wrap}
        .inspo-actions{display:flex;gap:4px;padding:8px 12px;border-top:1px solid var(--border)}
        
        .upload-area{border:2px dashed var(--border);border-radius:var(--radius);padding:32px;text-align:center;cursor:pointer;transition:var(--transition);margin-bottom:20px}
        .upload-area:hover{border-color:var(--accent);background:var(--accent-soft)}
        .upload-icon{color:var(--text-3);margin-bottom:8px}
        .upload-text{color:var(--text-2);font-size:13px}
        .upload-text strong{color:var(--accent)}
        
        /* TAGS VIEW */
        .tags-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
        .tag-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;cursor:pointer;transition:var(--transition)}
        .tag-card:hover{border-color:var(--accent)}
        .tag-card.active{border-color:var(--accent);background:var(--accent-soft)}
        .tag-name{font-size:14px;font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:6px}
        .tag-count{font-size:12px;color:var(--text-2)}
        .tagged-items{margin-top:24px}
        .tagged-items h3{font-size:14px;font-weight:600;margin-bottom:12px}
        .tagged-item{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:8px;cursor:pointer;transition:var(--transition)}
        .tagged-item:hover{border-color:var(--accent);background:var(--bg-card-hover)}
        .tagged-item-type{font-size:11px;color:var(--text-2);text-transform:uppercase;font-weight:500}
        .tagged-item-name{font-size:13px;font-weight:500}
        
        /* EMPTY STATE */
        .empty{text-align:center;padding:60px 24px}
        .empty-title{font-size:16px;font-weight:600;margin-bottom:6px}
        .empty-text{font-size:13px;color:var(--text-2)}
        
        /* FORM */
        .form-input{width:100%;padding:8px 12px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius);font-size:13px;color:var(--text-1);font-family:var(--font)}
        .form-input:focus{outline:none;border-color:var(--accent)}
        
        /* LIGHTBOX */
        .lightbox{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;z-index:2000;padding:40px}
        .lightbox-image{max-width:90%;max-height:90%;object-fit:contain}
        .lightbox-close{position:absolute;top:16px;right:16px;width:40px;height:40px;background:rgba(255,255,255,0.1);border:none;border-radius:20px;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}
        .lightbox-close:hover{background:rgba(255,255,255,0.2)}
        .lightbox-actions{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);display:flex;gap:12px}
        .lightbox-btn{display:flex;align-items:center;gap:6px;padding:10px 18px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:var(--radius);color:#fff;font-size:13px;cursor:pointer}
        .lightbox-btn:hover{background:rgba(255,255,255,0.2)}
        
        /* QUILL */
        .quill-wrapper{border:1px solid rgba(0,0,0,0.2);border-radius:var(--radius);overflow:hidden;background:rgba(255,255,255,0.9)}
        .quill-wrapper .ql-toolbar{background:rgba(0,0,0,0.05);border:none;border-bottom:1px solid rgba(0,0,0,0.1);padding:6px}
        .quill-wrapper .ql-container{border:none}
        .quill-wrapper .ql-editor{min-height:80px;font-family:var(--font);font-size:13px;color:#1A1A1A}
      `}</style>

      <aside className={`sb ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sb-head">
          <div className="logo">Life <span>Command</span></div>
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <nav className="sb-nav">
          {[
            { id: 'projects', icon: List, label: 'Projects', count: projects.filter(p => !p.completed).length },
            { id: 'links', icon: Link2, label: 'Links', count: links.length },
            { id: 'notes', icon: FileText, label: 'Notes', count: notes.length },
            { id: 'tags', icon: Tag, label: 'Tags', count: getAllTags().length },
            { id: 'inspo', icon: Image, label: 'Design Inspo', count: inspirations.length },
          ].map(item => (
            <div key={item.id} className={`nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => { setActiveView(item.id); setActiveTagFilter(null); }}>
              <item.icon className="nav-icon" size={18} />
              <span className="nav-label">{item.label}</span>
              <span className="nav-count">{item.count}</span>
            </div>
          ))}
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
              Let's work, <strong>Jake</strong>
              <div className="user-icon"><User size={14} /></div>
            </div>
          </div>
        </header>

        <div className="content">
          {activeView === 'projects' && <ProjectsView projects={projects} addProject={addProject} updateProject={updateProject} deleteProject={deleteProject} onTagClick={handleTagClick} />}
          {activeView === 'links' && <LinksView links={links} addLink={addLink} updateLink={updateLink} deleteLink={deleteLink} onTagClick={handleTagClick} />}
          {activeView === 'notes' && <NotesView notes={notes} addNote={addNote} updateNote={updateNote} deleteNote={deleteNote} onTagClick={handleTagClick} />}
          {activeView === 'tags' && <TagsView projects={projects} links={links} notes={notes} inspirations={inspirations} activeTagFilter={activeTagFilter} setActiveTagFilter={setActiveTagFilter} navigateToItem={navigateToItem} />}
          {activeView === 'inspo' && <InspoView inspirations={inspirations} addInspiration={addInspiration} deleteInspiration={deleteInspiration} onTagClick={handleTagClick} />}
        </div>
      </main>
    </div>
  );
}

function GridIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="0" width="6" height="6" rx="1" /><rect x="8" y="0" width="6" height="6" rx="1" /><rect x="0" y="8" width="6" height="6" rx="1" /><rect x="8" y="8" width="6" height="6" rx="1" /></svg>;
}

// ============================================================================
// PROJECTS VIEW
// ============================================================================
function ProjectsView({ projects, addProject, updateProject, deleteProject, onTagClick }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  
  const getProgress = (p) => { if (!p.subItems?.length) return 0; return Math.round((p.subItems.filter(i => i.completed).length / p.subItems.length) * 100); };
  const filtered = projects.filter(p => { if (statusFilter === 'all') return true; return p.subItems?.some(i => i.status === statusFilter); });

  return (
    <div>
      <div className="content-toolbar">
        <div className="toolbar-left">
          <span className="filter-label"><Filter size={12} /> Filter by Status</span>
          <div className="filter-pills">
            {['all', 'new', 'working', 'paused', 'stuck'].map(s => (
              <button key={s} className={`filter-pill ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
            ))}
          </div>
        </div>
        <div className="toolbar-right">
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={14} /></button>
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><GridIcon /></button>
          </div>
          <button className="btn-primary" onClick={addProject}><Plus size={14} /> New Project</button>
        </div>
      </div>
      
      {filtered.length === 0 ? (
        <div className="empty"><div className="empty-title">No projects yet</div><div className="empty-text">Create your first project to get started</div></div>
      ) : (
        <div className="projects-list">{filtered.map(p => <ProjectCard key={p.id} project={p} updateProject={updateProject} deleteProject={deleteProject} onTagClick={onTagClick} getProgress={getProgress} />)}</div>
      )}
    </div>
  );
}

function ProjectCard({ project, updateProject, deleteProject, onTagClick, getProgress }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.title);
  const [showSub, setShowSub] = useState(true);
  const [newSub, setNewSub] = useState('');
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const progress = getProgress(project);
  const completed = project.subItems?.filter(i => i.completed).length || 0;
  const total = project.subItems?.length || 0;

  const saveTitle = () => { if (editedTitle.trim()) updateProject(project.id, { title: editedTitle }); setIsEditing(false); };
  const addSub = () => { if (newSub.trim()) { updateProject(project.id, { subItems: [...(project.subItems || []), { id: `sub_${Date.now()}`, text: newSub, completed: false, status: 'new', priority: 'medium' }] }); setNewSub(''); } };
  const updateSub = (subId, updates) => updateProject(project.id, { subItems: project.subItems.map(i => i.id === subId ? { ...i, ...updates } : i) });
  const deleteSub = (subId) => updateProject(project.id, { subItems: project.subItems.filter(i => i.id !== subId) });
  const addTag = () => { if (tagInput.trim() && !project.tags?.includes(tagInput.trim())) { updateProject(project.id, { tags: [...(project.tags || []), tagInput.trim()] }); setTagInput(''); } };

  return (
    <div className="project-card">
      <div className="project-header">
        {isEditing ? <input className="form-input" value={editedTitle} onChange={e => setEditedTitle(e.target.value)} onBlur={saveTitle} onKeyDown={e => e.key === 'Enter' && saveTitle()} autoFocus style={{ flex: 1, marginRight: 12 }} />
          : <div className="project-title" onClick={() => setIsEditing(true)}>{project.title}</div>}
        <div className="project-actions">
          <button className="icon-btn danger" onClick={() => deleteProject(project.id)}><Trash2 size={14} /></button>
          <button className="icon-btn"><GripVertical size={14} /></button>
        </div>
      </div>
      <div className="project-progress">
        <span className="progress-text">Progress {completed}/{total} ({progress}%)</span>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="project-tags">
        {project.tags?.map(t => <span key={t} className="tag-pill" onClick={() => onTagClick(t)}><Tag size={10} />{t}</span>)}
        {editingTags ? <>
          <input className="form-input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Tag..." style={{ width: 80, padding: '4px 8px', fontSize: 11 }} autoFocus />
          <button className="icon-btn" onClick={() => setEditingTags(false)} style={{ width: 24, height: 24 }}><X size={12} /></button>
        </> : <span className="tag-pill" onClick={() => setEditingTags(true)} style={{ cursor: 'pointer' }}><Plus size={10} /></span>}
      </div>
      <div className="sub-toggle" onClick={() => setShowSub(!showSub)}>{showSub ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Sub Items ({total})</div>
      {showSub && (
        <div className="sub-list">
          {project.subItems?.map(item => (
            <div key={item.id} className="sub-item">
              <div className={`sub-checkbox ${item.completed ? 'checked' : ''}`} onClick={() => updateSub(item.id, { completed: !item.completed })}>{item.completed && <Check size={10} />}</div>
              <span className={`sub-text ${item.completed ? 'done' : ''}`}>{item.text}</span>
              <div className="sub-badges">
                <select className={`status-badge ${item.status}`} value={item.status} onChange={e => updateSub(item.id, { status: e.target.value })}><option value="new">New</option><option value="working">Working</option><option value="paused">Paused</option><option value="stuck">Stuck</option></select>
                <select className={`priority-badge ${item.priority}`} value={item.priority} onChange={e => updateSub(item.id, { priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
              </div>
              <div className="sub-actions">
                <button className="icon-btn" onClick={() => navigator.clipboard.writeText(item.text)}><Copy size={12} /></button>
                <button className="icon-btn danger" onClick={() => deleteSub(item.id)}><X size={12} /></button>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input className="form-input" value={newSub} onChange={e => setNewSub(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSub()} placeholder="Add sub-item..." style={{ flex: 1 }} />
            <button className="btn-secondary" onClick={addSub}><Plus size={12} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LINKS VIEW
// ============================================================================
function LinksView({ links, addLink, updateLink, deleteLink, onTagClick }) {
  const [tagFilter, setTagFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  
  const allTags = [...new Set(links.flatMap(l => l.tags || []))];
  const filtered = tagFilter === 'all' ? links : links.filter(l => l.tags?.includes(tagFilter));

  return (
    <div>
      <div className="content-toolbar">
        <div className="toolbar-left">
          <div className="filter-pills">
            <button className={`filter-pill ${tagFilter === 'all' ? 'active' : ''}`} onClick={() => setTagFilter('all')}>All</button>
            {allTags.map(t => <button key={t} className={`filter-pill ${tagFilter === t ? 'active' : ''}`} onClick={() => setTagFilter(t)}><Tag size={10} />{t}</button>)}
          </div>
        </div>
        <div className="toolbar-right">
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={14} /></button>
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><GridIcon /></button>
          </div>
          <button className="btn-primary" onClick={addLink}><Plus size={14} /> New Link</button>
        </div>
      </div>
      
      {filtered.length === 0 ? (
        <div className="empty"><div className="empty-title">No links yet</div><div className="empty-text">Save useful links for easy access</div></div>
      ) : (
        <div className="links-grid">{filtered.map(l => <LinkCard key={l.id} link={l} updateLink={updateLink} deleteLink={deleteLink} onTagClick={onTagClick} />)}</div>
      )}
    </div>
  );
}

function LinkCard({ link, updateLink, deleteLink, onTagClick }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(link.title);
  const [editedUrl, setEditedUrl] = useState(link.url);
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const save = () => { updateLink(link.id, { title: editedTitle, url: editedUrl }); setIsEditing(false); };
  const addTag = () => { if (tagInput.trim() && !link.tags?.includes(tagInput.trim())) { updateLink(link.id, { tags: [...(link.tags || []), tagInput.trim()] }); setTagInput(''); } };

  return (
    <div className="link-card">
      <div className="link-header">
        {isEditing ? <input className="form-input" value={editedTitle} onChange={e => setEditedTitle(e.target.value)} onBlur={save} style={{ fontSize: 14, fontWeight: 600 }} autoFocus />
          : <div className="link-title" onClick={() => setIsEditing(true)}>{link.title}</div>}
        <button className="icon-btn"><GripVertical size={14} /></button>
      </div>
      {isEditing ? <input className="form-input" value={editedUrl} onChange={e => setEditedUrl(e.target.value)} onBlur={save} style={{ marginBottom: 12 }} />
        : <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-url">{link.url}</a>}
      <div className="link-footer">
        <div className="link-tags">
          {link.tags?.map(t => <span key={t} className="tag-pill" onClick={() => onTagClick(t)}><Tag size={9} />{t}</span>)}
          {editingTags ? <>
            <input className="form-input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Tag" style={{ width: 60, padding: '3px 6px', fontSize: 10 }} autoFocus />
            <button className="icon-btn" onClick={() => setEditingTags(false)} style={{ width: 20, height: 20 }}><X size={10} /></button>
          </> : <span className="tag-pill" onClick={() => setEditingTags(true)} style={{ cursor: 'pointer' }}><Plus size={9} /></span>}
        </div>
        <button className="icon-btn danger" onClick={() => deleteLink(link.id)}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

// ============================================================================
// NOTES VIEW
// ============================================================================
function NotesView({ notes, addNote, updateNote, deleteNote, onTagClick }) {
  const [tagFilter, setTagFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  
  const colors = ['yellow', 'pink', 'orange', 'cyan', 'green', 'purple', 'coral', 'peach'];
  const getColor = (id) => colors[id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
  const allTags = [...new Set(notes.flatMap(n => n.tags || []))];
  const filtered = tagFilter === 'all' ? notes : notes.filter(n => n.tags?.includes(tagFilter));

  return (
    <div>
      <div className="content-toolbar">
        <div className="toolbar-left">
          <div className="filter-pills">
            <button className={`filter-pill ${tagFilter === 'all' ? 'active' : ''}`} onClick={() => setTagFilter('all')}>All</button>
            {allTags.map(t => <button key={t} className={`filter-pill ${tagFilter === t ? 'active' : ''}`} onClick={() => setTagFilter(t)}><Tag size={10} />{t}</button>)}
          </div>
        </div>
        <div className="toolbar-right">
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={14} /></button>
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><GridIcon /></button>
          </div>
          <button className="btn-primary" onClick={addNote}><Plus size={14} /> New Note</button>
        </div>
      </div>
      
      {filtered.length === 0 ? (
        <div className="empty"><div className="empty-title">No notes yet</div><div className="empty-text">Create your first note</div></div>
      ) : (
        <div className="notes-grid">{filtered.map(n => <NoteCard key={n.id} note={n} color={getColor(n.id)} updateNote={updateNote} deleteNote={deleteNote} onTagClick={onTagClick} />)}</div>
      )}
    </div>
  );
}

function NoteCard({ note, color, updateNote, deleteNote, onTagClick }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const save = () => { updateNote(note.id, { title: editedTitle, content: editedContent }); setIsEditing(false); };
  const addTag = () => { if (tagInput.trim() && !note.tags?.includes(tagInput.trim())) { updateNote(note.id, { tags: [...(note.tags || []), tagInput.trim()] }); setTagInput(''); } };
  const getText = (html) => { const d = document.createElement('div'); d.innerHTML = html || ''; return d.textContent || ''; };

  if (isEditing) {
    return (
      <div className={`note-card ${color}`}>
        <input className="note-edit-input" value={editedTitle} onChange={e => setEditedTitle(e.target.value)} autoFocus />
        <RichTextEditor value={editedContent} onChange={setEditedContent} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="btn-primary" onClick={save}><Save size={12} /> Save</button>
          <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`note-card ${color}`}>
      <div className="note-header"><div className="note-title" onClick={() => setIsEditing(true)}>{note.title}</div></div>
      <div className="note-content" onClick={() => setIsEditing(true)}>{getText(note.content) || 'Click to add content...'}</div>
      <div className="note-tags">
        {note.tags?.map(t => <span key={t} className="note-tag" onClick={() => onTagClick(t)}><Tag size={8} />{t}</span>)}
        {editingTags ? <>
          <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Tag" style={{ width: 50, padding: '3px 5px', fontSize: 10, border: '1px solid rgba(0,0,0,0.2)', borderRadius: 4, background: 'rgba(255,255,255,0.8)' }} autoFocus />
          <button onClick={() => setEditingTags(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.5)' }}><X size={10} /></button>
        </> : <span className="note-tag" onClick={() => setEditingTags(true)} style={{ cursor: 'pointer' }}><Plus size={8} /></span>}
      </div>
      <div className="note-actions">
        <button className="icon-btn"><GripVertical size={14} /></button>
        <button className="icon-btn" onClick={() => deleteNote(note.id)}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current && window.Quill) {
      quillRef.current = new window.Quill(editorRef.current, {
        theme: 'snow', modules: { toolbar: [['bold', 'italic'], [{ list: 'ordered' }, { list: 'bullet' }]] }, placeholder: 'Start typing...'
      });
      if (value) quillRef.current.root.innerHTML = value;
      quillRef.current.on('text-change', () => onChange(quillRef.current.root.innerHTML));
    }
  }, []);

  useEffect(() => { if (quillRef.current && value !== quillRef.current.root.innerHTML) quillRef.current.root.innerHTML = value || ''; }, [value]);

  return <div className="quill-wrapper"><div ref={editorRef} style={{ minHeight: 80 }} /></div>;
}

// ============================================================================
// TAGS VIEW
// ============================================================================
function TagsView({ projects, links, notes, inspirations, activeTagFilter, setActiveTagFilter, navigateToItem }) {
  const getCounts = () => {
    const c = {};
    projects.forEach(p => p.tags?.forEach(t => c[t] = (c[t] || 0) + 1));
    links.forEach(l => l.tags?.forEach(t => c[t] = (c[t] || 0) + 1));
    notes.forEach(n => n.tags?.forEach(t => c[t] = (c[t] || 0) + 1));
    inspirations.forEach(i => i.tags?.forEach(t => c[t] = (c[t] || 0) + 1));
    return c;
  };
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
      {tags.length === 0 ? (
        <div className="empty"><div className="empty-title">No tags yet</div><div className="empty-text">Add tags to organize your items</div></div>
      ) : <>
        <div className="tags-grid">
          {tags.map(t => (
            <div key={t} className={`tag-card ${activeTagFilter === t ? 'active' : ''}`} onClick={() => setActiveTagFilter(activeTagFilter === t ? null : t)}>
              <div className="tag-name"><Tag size={14} />{t}</div>
              <div className="tag-count">{counts[t]} items</div>
            </div>
          ))}
        </div>
        {activeTagFilter && (
          <div className="tagged-items">
            <h3>Items tagged "{activeTagFilter}"</h3>
            {getItems(activeTagFilter).map(({ type, item }) => (
              <div key={item.id} className="tagged-item" onClick={() => navigateToItem(type, item.id)}>
                {type === 'Project' && <List size={14} />}
                {type === 'Link' && <Link2 size={14} />}
                {type === 'Note' && <FileText size={14} />}
                {type === 'Inspo' && <Image size={14} />}
                <span className="tagged-item-type">{type}</span>
                <span className="tagged-item-name">{item.title || item.name}</span>
              </div>
            ))}
          </div>
        )}
      </>}
    </div>
  );
}

// ============================================================================
// INSPO VIEW
// ============================================================================
function InspoView({ inspirations, addInspiration, deleteInspiration, onTagClick }) {
  const [tagFilter, setTagFilter] = useState('all');
  const [lightbox, setLightbox] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const allTags = [...new Set(inspirations.flatMap(i => i.tags || []))];
  const filtered = tagFilter === 'all' ? inspirations : inspirations.filter(i => i.tags?.includes(tagFilter));

  const handleFileSelect = (file) => {
    if (file?.type.startsWith('image/')) {
      const name = prompt('Name this inspiration:', file.name.split('.')[0]);
      const tags = prompt('Tags (comma separated):', '');
      if (name !== null) addInspiration(file, name, tags?.split(',').map(t => t.trim()).filter(Boolean) || []);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const download = (url, name) => { const a = document.createElement('a'); a.href = url; a.download = name || 'inspiration'; a.click(); };

  return (
    <div>
      <div className="content-toolbar">
        <div className="toolbar-left">
          <div className="filter-pills">
            <button className={`filter-pill ${tagFilter === 'all' ? 'active' : ''}`} onClick={() => setTagFilter('all')}>All</button>
            {allTags.map(t => <button key={t} className={`filter-pill ${tagFilter === t ? 'active' : ''}`} onClick={() => setTagFilter(t)}><Tag size={10} />{t}</button>)}
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn-primary" onClick={handleUploadClick}><Plus size={14} /> Upload Image</button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={e => handleFileSelect(e.target.files?.[0])} style={{ display: 'none' }} />
        </div>
      </div>

      <div 
        className={`upload-area ${dragOver ? 'dragging' : ''}`} 
        onClick={handleUploadClick}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }} 
        onDragLeave={() => setDragOver(false)} 
        onDrop={handleDrop}
      >
        <Upload size={28} className="upload-icon" />
        <p className="upload-text"><strong>Click to upload</strong> or drag and drop</p>
        <p className="upload-text" style={{ fontSize: 11, marginTop: 4 }}>PNG, JPG up to 10MB</p>
      </div>

      {filtered.length === 0 ? (
        <div className="empty"><div className="empty-title">No inspiration yet</div><div className="empty-text">Upload images to build your library</div></div>
      ) : (
        <div className="inspo-grid">
          {filtered.map(i => (
            <div key={i.id} className="inspo-card">
              <img src={i.thumbnail || i.url} alt={i.name} className="inspo-image" onClick={() => setLightbox(i)} />
              <div className="inspo-info">
                <div className="inspo-name">{i.name}</div>
                <div className="inspo-tags">{i.tags?.map(t => <span key={t} className="tag-pill" onClick={() => onTagClick(t)} style={{ fontSize: 10, padding: '3px 6px' }}>{t}</span>)}</div>
              </div>
              <div className="inspo-actions">
                <button className="icon-btn" onClick={() => download(i.originalUrl || i.url, i.name)}><Download size={12} /></button>
                <button className="icon-btn danger" onClick={() => deleteInspiration(i.id)}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close"><X size={20} /></button>
          <img src={lightbox.originalUrl || lightbox.url} alt={lightbox.name} className="lightbox-image" onClick={e => e.stopPropagation()} />
          <div className="lightbox-actions" onClick={e => e.stopPropagation()}>
            <button className="lightbox-btn" onClick={() => download(lightbox.originalUrl || lightbox.url, lightbox.name)}><Download size={14} /> Download Original</button>
          </div>
        </div>
      )}
    </div>
  );
}
