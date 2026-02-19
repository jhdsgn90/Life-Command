import { useState, useEffect, useRef } from 'react';
import { 
  List, Link2, FileText, Tag, Image, Plus, Trash2, Edit3, Save, X, 
  ChevronDown, ChevronUp, Moon, Sun, Download, Upload, Search, 
  ExternalLink, GripVertical, Check, Copy, Menu, PanelLeftClose,
  PanelLeft, Bold, Italic, ListOrdered, List as ListIcon, Filter
} from 'lucide-react';

// ============================================================================
// LIFE COMMAND v7.0 - Complete Redesign
// ============================================================================

const CLOUDINARY_CLOUD_NAME = 'dccblqxuy';
const CLOUDINARY_UPLOAD_PRESET = 'Life Command';

export default function App() {
  // Core state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('lifeCommandDarkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('projects');
  
  // Data state
  const [projects, setProjects] = useState([]);
  const [links, setLinks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [inspirations, setInspirations] = useState([]);
  
  // Tag navigation state
  const [activeTagFilter, setActiveTagFilter] = useState(null);
  
  // Current time for sidebar
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load data from localStorage
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

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('lifeCommandProjects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('lifeCommandLinks', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('lifeCommandNotes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('lifeCommandInspirations', JSON.stringify(inspirations));
  }, [inspirations]);

  useEffect(() => {
    localStorage.setItem('lifeCommandDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Responsive sidebar collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Project functions
  const addProject = () => {
    const newProject = {
      id: `project_${Date.now()}`,
      title: 'New Project',
      subItems: [],
      tags: [],
      completed: false,
      createdAt: new Date().toISOString()
    };
    setProjects([newProject, ...projects]);
  };

  const updateProject = (id, updates) => {
    setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  // Link functions
  const addLink = () => {
    const newLink = {
      id: `link_${Date.now()}`,
      title: 'New Link',
      url: 'https://',
      tags: [],
      createdAt: new Date().toISOString()
    };
    setLinks([newLink, ...links]);
  };

  const updateLink = (id, updates) => {
    setLinks(links.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLink = (id) => {
    setLinks(links.filter(l => l.id !== id));
  };

  // Note functions
  const addNote = () => {
    const newNote = {
      id: `note_${Date.now()}`,
      title: 'New Note',
      content: '',
      tags: [],
      createdAt: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
  };

  const updateNote = (id, updates) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  // Inspiration functions
  const addInspiration = async (file, name, tags) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'life-command');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      
      const newInspiration = {
        id: `inspo_${Date.now()}`,
        name: name || 'Untitled',
        cloudinaryId: data.public_id,
        url: data.secure_url,
        thumbnail: data.secure_url.replace('/upload/', '/upload/w_600,q_auto/'),
        originalUrl: data.secure_url,
        tags: tags || [],
        dimensions: { width: data.width, height: data.height },
        fileSize: data.bytes,
        createdAt: new Date().toISOString()
      };
      
      setInspirations([newInspiration, ...inspirations]);
      return newInspiration;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const deleteInspiration = (id) => {
    setInspirations(inspirations.filter(i => i.id !== id));
  };

  // Tag navigation handler
  const handleTagClick = (tagName) => {
    setActiveView('tags');
    setActiveTagFilter(tagName);
  };

  // Get all unique tags
  const getAllTags = () => {
    const allTags = new Set();
    projects.forEach(p => p.tags?.forEach(t => allTags.add(t)));
    links.forEach(l => l.tags?.forEach(t => allTags.add(t)));
    notes.forEach(n => n.tags?.forEach(t => allTags.add(t)));
    inspirations.forEach(i => i.tags?.forEach(t => allTags.add(t)));
    return Array.from(allTags).sort();
  };

  // Export data
  const exportData = () => {
    const data = {
      version: '7.0',
      exportedAt: new Date().toISOString(),
      projects,
      links,
      notes,
      inspirations
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-command-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data
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
      } catch (err) {
        console.error('Import failed:', err);
      }
    };
    reader.readAsText(file);
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <style>{`
        /* ============================================
           DESIGN SYSTEM v7.0
           ============================================ */
        
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          /* Typography */
          --font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif;
          
          /* Spacing */
          --space-xs: 4px;
          --space-sm: 8px;
          --space-md: 16px;
          --space-lg: 24px;
          --space-xl: 32px;
          --space-2xl: 48px;
          
          /* Border Radius */
          --radius: 6px;
          --radius-lg: 8px;
          --radius-full: 9999px;
          
          /* Transitions */
          --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Light Mode */
        .app.light {
          --bg-primary: #F5F5F0;
          --bg-secondary: #ECEAE4;
          --bg-card: #E8E6E0;
          --bg-card-hover: #DEDAD4;
          --bg-sidebar: #E8E6E0;
          --text-primary: #1A1A1A;
          --text-secondary: #6B6B6B;
          --text-tertiary: #9CA3AF;
          --border: #D4D2CC;
          --border-light: #E8E6E0;
          
          /* Accent */
          --accent: #1A9A8A;
          --accent-hover: #158578;
          --accent-light: #E6F5F3;
          
          /* Status */
          --status-working: #1A9A8A;
          --status-new: #2DD4BF;
          --status-paused: #6B7280;
          --status-stuck: #F87171;
          
          /* Priority */
          --priority-low: #6EE7B7;
          --priority-medium: #FCD34D;
          --priority-high: #FCA5A5;
          --priority-urgent: #F472B6;
          
          /* Note colors */
          --note-yellow: #FEF08A;
          --note-pink: #FBCFE8;
          --note-orange: #FDBA74;
          --note-cyan: #67E8F9;
          --note-green: #6EE7B7;
          --note-purple: #C4B5FD;
          --note-coral: #FCA5A5;
          --note-peach: #FECACA;
        }

        /* Dark Mode */
        .app.dark {
          --bg-primary: #1E1E1E;
          --bg-secondary: #252525;
          --bg-card: #2D2D2D;
          --bg-card-hover: #3A3A3A;
          --bg-sidebar: #252525;
          --text-primary: #FFFFFF;
          --text-secondary: #A1A1A1;
          --text-tertiary: #6B6B6B;
          --border: #3D3D3D;
          --border-light: #333333;
          
          /* Accent */
          --accent: #2DD4BF;
          --accent-hover: #14B8A6;
          --accent-light: #134E48;
          
          /* Status */
          --status-working: #2DD4BF;
          --status-new: #2DD4BF;
          --status-paused: #6B7280;
          --status-stuck: #F87171;
          
          /* Priority */
          --priority-low: #6EE7B7;
          --priority-medium: #FCD34D;
          --priority-high: #FCA5A5;
          --priority-urgent: #F472B6;
          
          /* Note colors */
          --note-yellow: #FEF08A;
          --note-pink: #FBCFE8;
          --note-orange: #FDBA74;
          --note-cyan: #67E8F9;
          --note-green: #6EE7B7;
          --note-purple: #C4B5FD;
          --note-coral: #FCA5A5;
          --note-peach: #FECACA;
        }

        /* ============================================
           BASE STYLES
           ============================================ */

        .app {
          font-family: var(--font-family);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          min-height: 100vh;
          display: flex;
          transition: var(--transition);
        }

        /* ============================================
           SIDEBAR
           ============================================ */

        .sidebar {
          width: 220px;
          background-color: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 100;
          height: 100vh;
          position: sticky;
          top: 0;
        }

        .sidebar.collapsed {
          width: 72px;
        }

        .sidebar-header {
          padding: var(--space-lg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
        }

        .sidebar.collapsed .sidebar-header {
          padding: var(--space-md);
          justify-content: center;
        }

        .logo {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
        }

        .logo span {
          color: var(--text-secondary);
          font-weight: 400;
        }

        .sidebar.collapsed .logo {
          display: none;
        }

        .collapse-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: var(--space-sm);
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .collapse-btn:hover {
          background-color: var(--bg-card);
          color: var(--text-primary);
        }

        .sidebar-nav {
          flex: 1;
          padding: var(--space-md);
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          margin-bottom: var(--space-xs);
          border-radius: var(--radius);
          cursor: pointer;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 14px;
          transition: var(--transition);
          position: relative;
        }

        .sidebar.collapsed .nav-item {
          justify-content: center;
          padding: var(--space-md);
        }

        .sidebar.collapsed .nav-item .nav-label,
        .sidebar.collapsed .nav-item .nav-count {
          display: none;
        }

        .nav-item:hover {
          background-color: var(--bg-card);
          color: var(--text-primary);
        }

        .nav-item.active {
          background-color: var(--accent);
          color: white;
        }

        .nav-item.active:hover {
          background-color: var(--accent-hover);
        }

        .nav-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }

        .nav-count {
          margin-left: auto;
          background-color: var(--bg-primary);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .nav-item.active .nav-count {
          background-color: rgba(255,255,255,0.2);
          color: white;
        }

        .sidebar-footer {
          padding: var(--space-lg);
          border-top: 1px solid var(--border);
        }

        .sidebar.collapsed .sidebar-footer {
          padding: var(--space-md);
        }

        .time-display {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .date-display {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: var(--space-xs);
        }

        .sidebar.collapsed .time-display {
          font-size: 14px;
          text-align: center;
        }

        .sidebar.collapsed .date-display {
          display: none;
        }

        /* ============================================
           MAIN CONTENT
           ============================================ */

        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: var(--space-lg);
          padding: var(--space-lg) var(--space-xl);
          border-bottom: 1px solid var(--border);
          background-color: var(--bg-secondary);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .theme-toggle {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm);
          background-color: var(--bg-card);
          border-radius: var(--radius-full);
          border: 1px solid var(--border);
        }

        .theme-btn {
          padding: var(--space-sm);
          border-radius: var(--radius-full);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .theme-btn.active {
          background-color: var(--accent);
          color: white;
        }

        .header-btn {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          font-family: var(--font-family);
        }

        .header-btn:hover {
          color: var(--text-primary);
        }

        .greeting {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--text-secondary);
          font-size: 14px;
        }

        .greeting strong {
          color: var(--text-primary);
        }

        .content {
          flex: 1;
          padding: var(--space-xl);
          overflow-y: auto;
        }

        .content-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-lg);
          flex-wrap: wrap;
          gap: var(--space-md);
        }

        .content-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .content-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: var(--space-xs);
        }

        .content-actions {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .view-toggle {
          display: flex;
          background-color: var(--bg-card);
          border-radius: var(--radius);
          padding: 2px;
          border: 1px solid var(--border);
        }

        .view-btn {
          padding: var(--space-sm) var(--space-md);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: var(--radius);
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .view-btn.active {
          background-color: var(--bg-primary);
          color: var(--text-primary);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-lg);
          background-color: var(--accent);
          color: white;
          border: none;
          border-radius: var(--radius);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          font-family: var(--font-family);
        }

        .btn-primary:hover {
          background-color: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-lg);
          background-color: var(--bg-card);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          font-family: var(--font-family);
        }

        .btn-secondary:hover {
          background-color: var(--bg-card-hover);
        }

        /* ============================================
           FILTERS
           ============================================ */

        .filters {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
          flex-wrap: wrap;
        }

        .filter-dropdown {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
        }

        .filter-pills {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }

        .filter-pill {
          padding: var(--space-sm) var(--space-md);
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          font-family: var(--font-family);
        }

        .filter-pill:hover {
          border-color: var(--accent);
          color: var(--text-primary);
        }

        .filter-pill.active {
          background-color: var(--accent);
          border-color: var(--accent);
          color: white;
        }

        .tag-pill {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-sm);
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 12px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
        }

        .tag-pill:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        /* ============================================
           PROJECT CARDS
           ============================================ */

        .projects-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .project-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--space-lg);
          transition: var(--transition);
        }

        .project-card:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .project-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-md);
        }

        .project-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
        }

        .project-title:hover {
          color: var(--accent);
        }

        .project-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .icon-btn {
          padding: var(--space-sm);
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          border-radius: var(--radius);
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }

        .icon-btn.danger:hover {
          background-color: #FEE2E2;
          color: #DC2626;
        }

        .project-progress {
          margin-bottom: var(--space-md);
        }

        .progress-text {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: var(--space-xs);
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background-color: var(--bg-primary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: var(--accent);
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }

        .project-tags {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
          margin-bottom: var(--space-md);
        }

        .sub-items-toggle {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) 0;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
        }

        .sub-items-toggle:hover {
          color: var(--text-primary);
        }

        .sub-items-list {
          margin-top: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .sub-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background-color: var(--bg-primary);
          border-radius: var(--radius);
          transition: var(--transition);
        }

        .sub-item:hover {
          background-color: var(--bg-secondary);
        }

        .sub-item-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid var(--border);
          border-radius: var(--radius);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          flex-shrink: 0;
        }

        .sub-item-checkbox.checked {
          background-color: var(--accent);
          border-color: var(--accent);
          color: white;
        }

        .sub-item-text {
          flex: 1;
          font-size: 14px;
          color: var(--text-primary);
        }

        .sub-item-text.completed {
          text-decoration: line-through;
          color: var(--text-tertiary);
        }

        .sub-item-badges {
          display: flex;
          gap: var(--space-sm);
          align-items: center;
        }

        .status-badge {
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius);
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .status-badge.working {
          background-color: var(--status-working);
          color: white;
        }

        .status-badge.new {
          background-color: var(--status-new);
          color: white;
        }

        .status-badge.paused {
          background-color: var(--status-paused);
          color: white;
        }

        .status-badge.stuck {
          background-color: var(--status-stuck);
          color: white;
        }

        .priority-badge {
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius);
          font-size: 12px;
          font-weight: 500;
        }

        .priority-badge.low {
          background-color: var(--priority-low);
          color: #065F46;
        }

        .priority-badge.medium {
          background-color: var(--priority-medium);
          color: #92400E;
        }

        .priority-badge.high {
          background-color: var(--priority-high);
          color: #991B1B;
        }

        .priority-badge.urgent {
          background-color: var(--priority-urgent);
          color: #831843;
        }

        .sub-item-actions {
          display: flex;
          gap: var(--space-xs);
        }

        /* ============================================
           LINKS GRID
           ============================================ */

        .links-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-md);
        }

        @media (max-width: 1200px) {
          .links-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .links-grid {
            grid-template-columns: 1fr;
          }
        }

        .link-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          transition: var(--transition);
          position: relative;
        }

        .link-card:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .link-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-sm);
        }

        .link-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
        }

        .link-title:hover {
          color: var(--accent);
        }

        .link-url {
          font-size: 13px;
          color: var(--accent);
          text-decoration: none;
          display: block;
          margin-bottom: var(--space-md);
          word-break: break-all;
        }

        .link-url:hover {
          text-decoration: underline;
        }

        .link-tags {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
          margin-top: auto;
          padding-top: var(--space-md);
        }

        .link-actions {
          position: absolute;
          bottom: var(--space-md);
          right: var(--space-md);
          display: flex;
          gap: var(--space-xs);
        }

        /* ============================================
           NOTES GRID
           ============================================ */

        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-md);
        }

        .note-card {
          padding: var(--space-lg);
          border-radius: var(--radius);
          position: relative;
          transition: var(--transition);
          min-height: 150px;
          display: flex;
          flex-direction: column;
        }

        .note-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .note-card.yellow { background-color: var(--note-yellow); }
        .note-card.pink { background-color: var(--note-pink); }
        .note-card.orange { background-color: var(--note-orange); }
        .note-card.cyan { background-color: var(--note-cyan); }
        .note-card.green { background-color: var(--note-green); }
        .note-card.purple { background-color: var(--note-purple); }
        .note-card.coral { background-color: var(--note-coral); }
        .note-card.peach { background-color: var(--note-peach); }

        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-sm);
        }

        .note-title {
          font-size: 16px;
          font-weight: 600;
          color: #1A1A1A;
          cursor: pointer;
        }

        .note-content {
          font-size: 14px;
          color: #1A1A1A;
          opacity: 0.8;
          line-height: 1.5;
          flex: 1;
        }

        .note-tags {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
          margin-top: var(--space-md);
        }

        .note-tag {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-sm);
          background-color: rgba(0,0,0,0.1);
          border-radius: var(--radius);
          font-size: 11px;
          font-weight: 500;
          color: #1A1A1A;
          cursor: pointer;
        }

        .note-actions {
          position: absolute;
          top: var(--space-md);
          right: var(--space-md);
          display: flex;
          gap: var(--space-xs);
        }

        .note-actions .icon-btn {
          color: rgba(0,0,0,0.4);
        }

        .note-actions .icon-btn:hover {
          color: rgba(0,0,0,0.7);
          background-color: rgba(0,0,0,0.1);
        }

        .note-delete {
          position: absolute;
          bottom: var(--space-md);
          right: var(--space-md);
        }

        .note-delete .icon-btn {
          color: rgba(0,0,0,0.3);
        }

        .note-delete .icon-btn:hover {
          color: #DC2626;
          background-color: rgba(220,38,38,0.1);
        }

        /* ============================================
           DESIGN INSPO (Masonry)
           ============================================ */

        .inspo-grid {
          column-count: 4;
          column-gap: var(--space-md);
        }

        @media (max-width: 1400px) {
          .inspo-grid { column-count: 3; }
        }

        @media (max-width: 1000px) {
          .inspo-grid { column-count: 2; }
        }

        @media (max-width: 600px) {
          .inspo-grid { column-count: 1; }
        }

        .inspo-card {
          break-inside: avoid;
          margin-bottom: var(--space-md);
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          transition: var(--transition);
          cursor: pointer;
        }

        .inspo-card:hover {
          border-color: var(--accent);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          transform: translateY(-2px);
        }

        .inspo-image {
          width: 100%;
          display: block;
        }

        .inspo-info {
          padding: var(--space-md);
        }

        .inspo-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-sm);
        }

        .inspo-tags {
          display: flex;
          gap: var(--space-xs);
          flex-wrap: wrap;
        }

        .inspo-actions {
          display: flex;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md) var(--space-md);
          border-top: 1px solid var(--border);
        }

        /* Upload area */
        .upload-area {
          border: 2px dashed var(--border);
          border-radius: var(--radius-lg);
          padding: var(--space-2xl);
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
          margin-bottom: var(--space-lg);
        }

        .upload-area:hover {
          border-color: var(--accent);
          background-color: var(--bg-card);
        }

        .upload-area.dragging {
          border-color: var(--accent);
          background-color: var(--accent-light);
        }

        .upload-icon {
          color: var(--text-tertiary);
          margin-bottom: var(--space-md);
        }

        .upload-text {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .upload-text strong {
          color: var(--accent);
        }

        /* ============================================
           TAGS VIEW
           ============================================ */

        .tags-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-md);
        }

        .tag-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--space-lg);
          cursor: pointer;
          transition: var(--transition);
        }

        .tag-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .tag-card.active {
          border-color: var(--accent);
          background-color: var(--accent-light);
        }

        .tag-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-sm);
        }

        .tag-count {
          font-size: 13px;
          color: var(--text-secondary);
        }

        /* ============================================
           MODAL
           ============================================ */

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-lg);
        }

        .modal {
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-lg);
          border-bottom: 1px solid var(--border);
        }

        .modal-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .modal-body {
          padding: var(--space-lg);
        }

        .modal-footer {
          display: flex;
          gap: var(--space-md);
          justify-content: flex-end;
          padding: var(--space-lg);
          border-top: 1px solid var(--border);
        }

        /* ============================================
           FORMS
           ============================================ */

        .form-group {
          margin-bottom: var(--space-lg);
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: var(--space-sm);
        }

        .form-input {
          width: 100%;
          padding: var(--space-md);
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 14px;
          color: var(--text-primary);
          font-family: var(--font-family);
          transition: var(--transition);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-light);
        }

        .form-input::placeholder {
          color: var(--text-tertiary);
        }

        /* ============================================
           QUILL EDITOR
           ============================================ */

        .quill-wrapper {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }

        .quill-wrapper .ql-toolbar {
          background-color: var(--bg-primary);
          border: none;
          border-bottom: 1px solid var(--border);
        }

        .quill-wrapper .ql-container {
          border: none;
          background-color: var(--bg-card);
        }

        .quill-wrapper .ql-editor {
          min-height: 150px;
          font-family: var(--font-family);
          font-size: 14px;
          color: var(--text-primary);
        }

        /* ============================================
           EMPTY STATE
           ============================================ */

        .empty-state {
          text-align: center;
          padding: var(--space-2xl);
          color: var(--text-secondary);
        }

        .empty-state-icon {
          color: var(--text-tertiary);
          margin-bottom: var(--space-md);
        }

        .empty-state-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-sm);
        }

        .empty-state-text {
          font-size: 14px;
          margin-bottom: var(--space-lg);
        }

        /* ============================================
           LIGHTBOX
           ============================================ */

        .lightbox {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: var(--space-xl);
        }

        .lightbox-image {
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
        }

        .lightbox-close {
          position: absolute;
          top: var(--space-lg);
          right: var(--space-lg);
          padding: var(--space-md);
          background-color: rgba(255,255,255,0.1);
          border: none;
          border-radius: var(--radius-full);
          color: white;
          cursor: pointer;
          transition: var(--transition);
        }

        .lightbox-close:hover {
          background-color: rgba(255,255,255,0.2);
        }

        .lightbox-actions {
          position: absolute;
          bottom: var(--space-xl);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: var(--space-md);
        }

        .lightbox-btn {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-lg);
          background-color: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: var(--radius);
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: var(--transition);
        }

        .lightbox-btn:hover {
          background-color: rgba(255,255,255,0.2);
        }

        /* ============================================
           RESPONSIVE
           ============================================ */

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 1000;
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .sidebar.collapsed {
            width: 220px;
            transform: translateX(-100%);
          }

          .sidebar.collapsed.open {
            transform: translateX(0);
          }

          .content {
            padding: var(--space-md);
          }

          .header {
            padding: var(--space-md);
          }

          .greeting {
            display: none;
          }
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            Life <span>Command</span>
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeView === 'projects' ? 'active' : ''}`}
            onClick={() => { setActiveView('projects'); setActiveTagFilter(null); }}
          >
            <List className="nav-icon" size={20} />
            <span className="nav-label">Projects</span>
            <span className="nav-count">{projects.filter(p => !p.completed).length}</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'links' ? 'active' : ''}`}
            onClick={() => { setActiveView('links'); setActiveTagFilter(null); }}
          >
            <Link2 className="nav-icon" size={20} />
            <span className="nav-label">Links</span>
            <span className="nav-count">{links.length}</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'notes' ? 'active' : ''}`}
            onClick={() => { setActiveView('notes'); setActiveTagFilter(null); }}
          >
            <FileText className="nav-icon" size={20} />
            <span className="nav-label">Notes</span>
            <span className="nav-count">{notes.length}</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'tags' ? 'active' : ''}`}
            onClick={() => setActiveView('tags')}
          >
            <Tag className="nav-icon" size={20} />
            <span className="nav-label">Tags</span>
            <span className="nav-count">{getAllTags().length}</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'inspo' ? 'active' : ''}`}
            onClick={() => { setActiveView('inspo'); setActiveTagFilter(null); }}
          >
            <Image className="nav-icon" size={20} />
            <span className="nav-label">Design Inspo</span>
            <span className="nav-count">{inspirations.length}</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="time-display">{formatTime(currentTime)}</div>
          <div className="date-display">{formatDate(currentTime)}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        {/* Header */}
        <header className="header">
          <div className="header-actions">
            <div className="theme-toggle">
              <button 
                className={`theme-btn ${!darkMode ? 'active' : ''}`}
                onClick={() => setDarkMode(false)}
              >
                <Sun size={16} />
              </button>
              <button 
                className={`theme-btn ${darkMode ? 'active' : ''}`}
                onClick={() => setDarkMode(true)}
              >
                <Moon size={16} />
              </button>
            </div>

            <button className="header-btn" onClick={exportData}>
              <Download size={16} />
              Export
            </button>

            <label className="header-btn" style={{ cursor: 'pointer' }}>
              <Upload size={16} />
              Import
              <input 
                type="file" 
                accept=".json" 
                onChange={importData}
                style={{ display: 'none' }}
              />
            </label>

            <div className="greeting">
              <span>👋</span>
              Let's work, <strong>Jake</strong>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="content">
          {activeView === 'projects' && (
            <ProjectsView 
              projects={projects}
              addProject={addProject}
              updateProject={updateProject}
              deleteProject={deleteProject}
              onTagClick={handleTagClick}
              darkMode={darkMode}
            />
          )}

          {activeView === 'links' && (
            <LinksView 
              links={links}
              addLink={addLink}
              updateLink={updateLink}
              deleteLink={deleteLink}
              onTagClick={handleTagClick}
              darkMode={darkMode}
            />
          )}

          {activeView === 'notes' && (
            <NotesView 
              notes={notes}
              addNote={addNote}
              updateNote={updateNote}
              deleteNote={deleteNote}
              onTagClick={handleTagClick}
              darkMode={darkMode}
            />
          )}

          {activeView === 'tags' && (
            <TagsView 
              projects={projects}
              links={links}
              notes={notes}
              inspirations={inspirations}
              activeTagFilter={activeTagFilter}
              setActiveTagFilter={setActiveTagFilter}
              darkMode={darkMode}
            />
          )}

          {activeView === 'inspo' && (
            <InspoView 
              inspirations={inspirations}
              addInspiration={addInspiration}
              deleteInspiration={deleteInspiration}
              onTagClick={handleTagClick}
              darkMode={darkMode}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// PROJECTS VIEW
// ============================================================================

function ProjectsView({ projects, addProject, updateProject, deleteProject, onTagClick, darkMode }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');

  const getProjectProgress = (project) => {
    if (!project.subItems || project.subItems.length === 0) return 0;
    const completed = project.subItems.filter(item => item.completed).length;
    return Math.round((completed / project.subItems.length) * 100);
  };

  const filteredProjects = projects.filter(project => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'completed') return project.completed;
    // Filter by sub-item status
    return project.subItems?.some(item => item.status === statusFilter);
  });

  const activeCount = projects.filter(p => !p.completed).length;
  const completedCount = projects.filter(p => p.completed).length;

  return (
    <div>
      <div className="content-header">
        <div>
          <h1 className="content-title">Projects</h1>
          <p className="content-subtitle">{activeCount} Active • {completedCount} Completed</p>
        </div>
        <div className="content-actions">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
            </button>
          </div>
          <button className="btn-primary" onClick={addProject}>
            <Plus size={16} />
            New Project
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="filter-dropdown">
          <Filter size={16} />
          Filter by Status
          <ChevronDown size={16} />
        </div>
        <div className="filter-pills">
          {['all', 'new', 'working', 'paused', 'stuck'].map(status => (
            <button
              key={status}
              className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <List size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No projects yet</h3>
          <p className="empty-state-text">Create your first project to get started</p>
          <button className="btn-primary" onClick={addProject}>
            <Plus size={16} />
            New Project
          </button>
        </div>
      ) : (
        <div className="projects-list">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project.id}
              project={project}
              updateProject={updateProject}
              deleteProject={deleteProject}
              onTagClick={onTagClick}
              getProgress={getProjectProgress}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROJECT CARD
// ============================================================================

function ProjectCard({ project, updateProject, deleteProject, onTagClick, getProgress, darkMode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.title);
  const [showSubItems, setShowSubItems] = useState(true);
  const [newSubItem, setNewSubItem] = useState('');
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const progress = getProgress(project);
  const completedCount = project.subItems?.filter(item => item.completed).length || 0;
  const totalCount = project.subItems?.length || 0;

  const saveTitle = () => {
    if (editedTitle.trim()) {
      updateProject(project.id, { title: editedTitle });
    }
    setIsEditing(false);
  };

  const addSubItem = () => {
    if (newSubItem.trim()) {
      const newItem = {
        id: `subitem_${Date.now()}`,
        text: newSubItem,
        completed: false,
        status: 'new',
        priority: 'medium'
      };
      updateProject(project.id, { 
        subItems: [...(project.subItems || []), newItem] 
      });
      setNewSubItem('');
    }
  };

  const updateSubItem = (subItemId, updates) => {
    const updatedSubItems = project.subItems.map(item =>
      item.id === subItemId ? { ...item, ...updates } : item
    );
    updateProject(project.id, { subItems: updatedSubItems });
  };

  const deleteSubItem = (subItemId) => {
    const updatedSubItems = project.subItems.filter(item => item.id !== subItemId);
    updateProject(project.id, { subItems: updatedSubItems });
  };

  const addTag = () => {
    if (tagInput.trim() && !project.tags?.includes(tagInput.trim())) {
      updateProject(project.id, { 
        tags: [...(project.tags || []), tagInput.trim()] 
      });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    updateProject(project.id, { 
      tags: project.tags.filter(t => t !== tag) 
    });
  };

  return (
    <div className="project-card">
      <div className="project-header">
        <div style={{ flex: 1 }}>
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
              className="form-input"
              autoFocus
            />
          ) : (
            <h3 className="project-title" onClick={() => setIsEditing(true)}>
              {project.title}
            </h3>
          )}
        </div>
        <div className="project-actions">
          <button className="icon-btn danger" onClick={() => deleteProject(project.id)}>
            <Trash2 size={16} />
          </button>
          <button className="icon-btn">
            <GripVertical size={16} />
          </button>
        </div>
      </div>

      <div className="project-progress">
        <p className="progress-text">Progress {completedCount}/{totalCount} ({progress}%)</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="project-tags">
        {project.tags?.map(tag => (
          <span 
            key={tag} 
            className="tag-pill"
            onClick={() => onTagClick(tag)}
          >
            <Tag size={10} />
            {tag}
          </span>
        ))}
        {editingTags ? (
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add tag..."
              className="form-input"
              style={{ padding: '4px 8px', fontSize: '12px', width: '100px' }}
              autoFocus
            />
            <button className="icon-btn" onClick={() => setEditingTags(false)}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <button 
            className="tag-pill" 
            style={{ cursor: 'pointer' }}
            onClick={() => setEditingTags(true)}
          >
            <Plus size={10} />
            Add
          </button>
        )}
      </div>

      <div 
        className="sub-items-toggle"
        onClick={() => setShowSubItems(!showSubItems)}
      >
        {showSubItems ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        Sub Items
      </div>

      {showSubItems && (
        <div className="sub-items-list">
          {project.subItems?.map(item => (
            <SubItem 
              key={item.id}
              item={item}
              updateSubItem={(updates) => updateSubItem(item.id, updates)}
              deleteSubItem={() => deleteSubItem(item.id)}
            />
          ))}
          <div className="sub-item" style={{ background: 'transparent' }}>
            <input
              type="text"
              value={newSubItem}
              onChange={(e) => setNewSubItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSubItem()}
              placeholder="Add new sub-item..."
              className="form-input"
              style={{ flex: 1 }}
            />
            <button className="btn-secondary" onClick={addSubItem}>
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUB ITEM
// ============================================================================

function SubItem({ item, updateSubItem, deleteSubItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(item.text);

  const saveText = () => {
    if (editedText.trim()) {
      updateSubItem({ text: editedText });
    }
    setIsEditing(false);
  };

  return (
    <div className="sub-item">
      <div 
        className={`sub-item-checkbox ${item.completed ? 'checked' : ''}`}
        onClick={() => updateSubItem({ completed: !item.completed })}
      >
        {item.completed && <Check size={12} />}
      </div>
      
      {isEditing ? (
        <input
          type="text"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          onBlur={saveText}
          onKeyDown={(e) => e.key === 'Enter' && saveText()}
          className="form-input"
          style={{ flex: 1 }}
          autoFocus
        />
      ) : (
        <span 
          className={`sub-item-text ${item.completed ? 'completed' : ''}`}
          onClick={() => setIsEditing(true)}
        >
          {item.text}
        </span>
      )}

      <div className="sub-item-badges">
        <select 
          value={item.status || 'new'}
          onChange={(e) => updateSubItem({ status: e.target.value })}
          className={`status-badge ${item.status || 'new'}`}
          style={{ border: 'none', cursor: 'pointer' }}
        >
          <option value="new">New</option>
          <option value="working">Working</option>
          <option value="paused">Paused</option>
          <option value="stuck">Stuck</option>
        </select>

        <select 
          value={item.priority || 'medium'}
          onChange={(e) => updateSubItem({ priority: e.target.value })}
          className={`priority-badge ${item.priority || 'medium'}`}
          style={{ border: 'none', cursor: 'pointer' }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="sub-item-actions">
        <button className="icon-btn" onClick={() => navigator.clipboard.writeText(item.text)}>
          <Copy size={14} />
        </button>
        <button className="icon-btn danger" onClick={deleteSubItem}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// LINKS VIEW
// ============================================================================

function LinksView({ links, addLink, updateLink, deleteLink, onTagClick, darkMode }) {
  const [tagFilter, setTagFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const allTags = [...new Set(links.flatMap(l => l.tags || []))];
  
  const filteredLinks = tagFilter === 'all' 
    ? links 
    : links.filter(l => l.tags?.includes(tagFilter));

  return (
    <div>
      <div className="content-header">
        <div>
          <h1 className="content-title">Links</h1>
          <p className="content-subtitle">{links.length} Saved Links</p>
        </div>
        <div className="content-actions">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
            </button>
          </div>
          <button className="btn-primary" onClick={addLink}>
            <Plus size={16} />
            New Link
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="filter-pills">
          <button
            className={`filter-pill ${tagFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTagFilter('all')}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`filter-pill ${tagFilter === tag ? 'active' : ''}`}
              onClick={() => setTagFilter(tag)}
            >
              <Tag size={12} />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {filteredLinks.length === 0 ? (
        <div className="empty-state">
          <Link2 size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No links yet</h3>
          <p className="empty-state-text">Save useful links for easy access</p>
          <button className="btn-primary" onClick={addLink}>
            <Plus size={16} />
            New Link
          </button>
        </div>
      ) : (
        <div className="links-grid">
          {filteredLinks.map(link => (
            <LinkCard 
              key={link.id}
              link={link}
              updateLink={updateLink}
              deleteLink={deleteLink}
              onTagClick={onTagClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LINK CARD
// ============================================================================

function LinkCard({ link, updateLink, deleteLink, onTagClick }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(link.title);
  const [editedUrl, setEditedUrl] = useState(link.url);
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const saveChanges = () => {
    updateLink(link.id, { title: editedTitle, url: editedUrl });
    setIsEditing(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !link.tags?.includes(tagInput.trim())) {
      updateLink(link.id, { tags: [...(link.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  return (
    <div className="link-card">
      <div className="link-header">
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={saveChanges}
            className="form-input"
            style={{ fontSize: '16px', fontWeight: 600 }}
            autoFocus
          />
        ) : (
          <h3 className="link-title" onClick={() => setIsEditing(true)}>
            {link.title}
          </h3>
        )}
        <button className="icon-btn">
          <GripVertical size={16} />
        </button>
      </div>

      {isEditing ? (
        <input
          type="text"
          value={editedUrl}
          onChange={(e) => setEditedUrl(e.target.value)}
          onBlur={saveChanges}
          className="form-input"
          style={{ marginBottom: '16px' }}
        />
      ) : (
        <a 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="link-url"
        >
          {link.url}
        </a>
      )}

      <div className="link-tags">
        {link.tags?.map(tag => (
          <span 
            key={tag}
            className="tag-pill"
            onClick={() => onTagClick(tag)}
          >
            <Tag size={10} />
            {tag}
          </span>
        ))}
        {editingTags ? (
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add tag..."
              className="form-input"
              style={{ padding: '4px 8px', fontSize: '12px', width: '80px' }}
              autoFocus
            />
            <button className="icon-btn" onClick={() => setEditingTags(false)}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <button 
            className="tag-pill"
            onClick={() => setEditingTags(true)}
          >
            <Plus size={10} />
          </button>
        )}
      </div>

      <div className="link-actions">
        <button className="icon-btn danger" onClick={() => deleteLink(link.id)}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// NOTES VIEW
// ============================================================================

function NotesView({ notes, addNote, updateNote, deleteNote, onTagClick, darkMode }) {
  const [tagFilter, setTagFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const noteColors = ['yellow', 'pink', 'orange', 'cyan', 'green', 'purple', 'coral', 'peach'];
  const getNoteColor = (id) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return noteColors[hash % noteColors.length];
  };

  const allTags = [...new Set(notes.flatMap(n => n.tags || []))];
  
  const filteredNotes = tagFilter === 'all' 
    ? notes 
    : notes.filter(n => n.tags?.includes(tagFilter));

  return (
    <div>
      <div className="content-header">
        <div>
          <h1 className="content-title">Notes</h1>
          <p className="content-subtitle">{notes.length} Notes</p>
        </div>
        <div className="content-actions">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
            </button>
          </div>
          <button className="btn-primary" onClick={addNote}>
            <Plus size={16} />
            New Note
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="filter-pills">
          <button
            className={`filter-pill ${tagFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTagFilter('all')}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`filter-pill ${tagFilter === tag ? 'active' : ''}`}
              onClick={() => setTagFilter(tag)}
            >
              <Tag size={12} />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No notes yet</h3>
          <p className="empty-state-text">Create your first note</p>
          <button className="btn-primary" onClick={addNote}>
            <Plus size={16} />
            New Note
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map(note => (
            <NoteCard 
              key={note.id}
              note={note}
              color={getNoteColor(note.id)}
              updateNote={updateNote}
              deleteNote={deleteNote}
              onTagClick={onTagClick}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// NOTE CARD
// ============================================================================

function NoteCard({ note, color, updateNote, deleteNote, onTagClick, darkMode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const saveChanges = () => {
    updateNote(note.id, { title: editedTitle, content: editedContent });
    setIsEditing(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !note.tags?.includes(tagInput.trim())) {
      updateNote(note.id, { tags: [...(note.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  // Strip HTML tags for preview
  const getPlainText = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return div.textContent || div.innerText || '';
  };

  if (isEditing) {
    return (
      <div className={`note-card ${color}`}>
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="form-input"
          style={{ 
            marginBottom: '12px', 
            fontWeight: 600,
            background: 'rgba(255,255,255,0.5)'
          }}
          autoFocus
        />
        <RichTextEditor
          value={editedContent}
          onChange={setEditedContent}
          darkMode={false}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button className="btn-primary" onClick={saveChanges}>
            <Save size={14} />
            Save
          </button>
          <button className="btn-secondary" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`note-card ${color}`}>
      <div className="note-header">
        <h3 className="note-title" onClick={() => setIsEditing(true)}>
          {note.title}
        </h3>
      </div>
      
      <div className="note-content" onClick={() => setIsEditing(true)}>
        {getPlainText(note.content) || 'Click to add content...'}
      </div>

      <div className="note-tags">
        {note.tags?.map(tag => (
          <span 
            key={tag}
            className="note-tag"
            onClick={() => onTagClick(tag)}
          >
            <Tag size={8} />
            {tag}
          </span>
        ))}
        {editingTags ? (
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              placeholder="Tag..."
              style={{ 
                padding: '2px 6px', 
                fontSize: '11px', 
                width: '60px',
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.5)'
              }}
              autoFocus
            />
            <button 
              onClick={() => setEditingTags(false)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                color: 'rgba(0,0,0,0.5)'
              }}
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <span 
            className="note-tag"
            style={{ cursor: 'pointer' }}
            onClick={() => setEditingTags(true)}
          >
            <Plus size={8} />
          </span>
        )}
      </div>

      <div className="note-actions">
        <button className="icon-btn">
          <GripVertical size={16} />
        </button>
      </div>

      <div className="note-delete">
        <button className="icon-btn" onClick={() => deleteNote(note.id)}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// RICH TEXT EDITOR (Quill-based)
// ============================================================================

function RichTextEditor({ value, onChange, darkMode }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current && window.Quill) {
      quillRef.current = new window.Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }]
          ]
        },
        placeholder: 'Start typing...'
      });

      if (value) {
        quillRef.current.root.innerHTML = value;
      }

      quillRef.current.on('text-change', () => {
        onChange(quillRef.current.root.innerHTML);
      });
    }
  }, []);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div className="quill-wrapper">
      <div ref={editorRef} style={{ minHeight: '100px' }} />
    </div>
  );
}

// ============================================================================
// TAGS VIEW
// ============================================================================

function TagsView({ projects, links, notes, inspirations, activeTagFilter, setActiveTagFilter, darkMode }) {
  const getTagCounts = () => {
    const counts = {};
    
    projects.forEach(p => p.tags?.forEach(t => {
      counts[t] = (counts[t] || 0) + 1;
    }));
    links.forEach(l => l.tags?.forEach(t => {
      counts[t] = (counts[t] || 0) + 1;
    }));
    notes.forEach(n => n.tags?.forEach(t => {
      counts[t] = (counts[t] || 0) + 1;
    }));
    inspirations.forEach(i => i.tags?.forEach(t => {
      counts[t] = (counts[t] || 0) + 1;
    }));
    
    return counts;
  };

  const tagCounts = getTagCounts();
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

  const getItemsWithTag = (tag) => {
    const items = [];
    projects.filter(p => p.tags?.includes(tag)).forEach(p => items.push({ type: 'project', item: p }));
    links.filter(l => l.tags?.includes(tag)).forEach(l => items.push({ type: 'link', item: l }));
    notes.filter(n => n.tags?.includes(tag)).forEach(n => items.push({ type: 'note', item: n }));
    inspirations.filter(i => i.tags?.includes(tag)).forEach(i => items.push({ type: 'inspo', item: i }));
    return items;
  };

  return (
    <div>
      <div className="content-header">
        <div>
          <h1 className="content-title">Tags</h1>
          <p className="content-subtitle">{sortedTags.length} Tags</p>
        </div>
      </div>

      {sortedTags.length === 0 ? (
        <div className="empty-state">
          <Tag size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No tags yet</h3>
          <p className="empty-state-text">Add tags to your projects, links, and notes to organize them</p>
        </div>
      ) : (
        <>
          <div className="tags-grid" style={{ marginBottom: '32px' }}>
            {sortedTags.map(tag => (
              <div 
                key={tag}
                className={`tag-card ${activeTagFilter === tag ? 'active' : ''}`}
                onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
              >
                <h3 className="tag-name">
                  <Tag size={16} style={{ marginRight: '8px' }} />
                  {tag}
                </h3>
                <p className="tag-count">{tagCounts[tag]} items</p>
              </div>
            ))}
          </div>

          {activeTagFilter && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Items tagged "{activeTagFilter}"
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {getItemsWithTag(activeTagFilter).map(({ type, item }) => (
                  <div 
                    key={item.id}
                    style={{
                      padding: '16px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    {type === 'project' && <List size={16} />}
                    {type === 'link' && <Link2 size={16} />}
                    {type === 'note' && <FileText size={16} />}
                    {type === 'inspo' && <Image size={16} />}
                    <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {type}
                    </span>
                    <span style={{ fontWeight: 500 }}>{item.title || item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// DESIGN INSPO VIEW
// ============================================================================

function InspoView({ inspirations, addInspiration, deleteInspiration, onTagClick, darkMode }) {
  const [tagFilter, setTagFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadPreview, setUploadPreview] = useState(null);

  const allTags = [...new Set(inspirations.flatMap(i => i.tags || []))];
  
  const filteredInspirations = tagFilter === 'all' 
    ? inspirations 
    : inspirations.filter(i => i.tags?.includes(tagFilter));

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadName(file.name.split('.')[0]);
      const reader = new FileReader();
      reader.onload = (e) => setUploadPreview(e.target.result);
      reader.readAsDataURL(file);
      setUploadModal(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadFile(file);
      setUploadName(file.name.split('.')[0]);
      const reader = new FileReader();
      reader.onload = (e) => setUploadPreview(e.target.result);
      reader.readAsDataURL(file);
      setUploadModal(true);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    
    const tags = uploadTags.split(',').map(t => t.trim()).filter(Boolean);
    await addInspiration(uploadFile, uploadName, tags);
    
    setUploading(false);
    setUploadModal(false);
    setUploadFile(null);
    setUploadName('');
    setUploadTags('');
    setUploadPreview(null);
  };

  const downloadImage = (url, name) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name || 'inspiration';
    a.click();
  };

  return (
    <div>
      <div className="content-header">
        <div>
          <h1 className="content-title">Design Inspiration</h1>
          <p className="content-subtitle">{inspirations.length} Images</p>
        </div>
        <div className="content-actions">
          <label className="btn-primary" style={{ cursor: 'pointer' }}>
            <Plus size={16} />
            Upload Image
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="filters">
        <div className="filter-pills">
          <button
            className={`filter-pill ${tagFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTagFilter('all')}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`filter-pill ${tagFilter === tag ? 'active' : ''}`}
              onClick={() => setTagFilter(tag)}
            >
              <Tag size={12} />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div 
        className={`upload-area ${dragOver ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.querySelector('input[type="file"]').click()}
      >
        <Upload size={48} className="upload-icon" />
        <p className="upload-text">
          <strong>Click to upload</strong> or drag and drop
        </p>
        <p className="upload-text" style={{ fontSize: '12px', marginTop: '8px' }}>
          PNG, JPG up to 10MB
        </p>
      </div>

      {filteredInspirations.length === 0 ? (
        <div className="empty-state">
          <Image size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No inspiration yet</h3>
          <p className="empty-state-text">Upload images to build your inspiration library</p>
        </div>
      ) : (
        <div className="inspo-grid">
          {filteredInspirations.map(inspo => (
            <div key={inspo.id} className="inspo-card">
              <img 
                src={inspo.thumbnail || inspo.url} 
                alt={inspo.name}
                className="inspo-image"
                onClick={() => setLightbox(inspo)}
              />
              <div className="inspo-info">
                <h4 className="inspo-name">{inspo.name}</h4>
                <div className="inspo-tags">
                  {inspo.tags?.map(tag => (
                    <span 
                      key={tag}
                      className="tag-pill"
                      onClick={() => onTagClick(tag)}
                      style={{ fontSize: '11px', padding: '2px 6px' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="inspo-actions">
                <button 
                  className="icon-btn"
                  onClick={() => downloadImage(inspo.originalUrl || inspo.url, inspo.name)}
                >
                  <Download size={14} />
                </button>
                <button 
                  className="icon-btn danger"
                  onClick={() => deleteInspiration(inspo.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModal && (
        <div className="modal-overlay" onClick={() => setUploadModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Upload Inspiration</h3>
              <button className="icon-btn" onClick={() => setUploadModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {uploadPreview && (
                <img 
                  src={uploadPreview} 
                  alt="Preview" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '200px', 
                    objectFit: 'contain',
                    marginBottom: '16px',
                    borderRadius: '6px'
                  }}
                />
              )}
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="form-input"
                  placeholder="Give it a name..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  className="form-input"
                  placeholder="ui, dashboard, minimal..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setUploadModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close">
            <X size={24} />
          </button>
          <img 
            src={lightbox.originalUrl || lightbox.url} 
            alt={lightbox.name}
            className="lightbox-image"
            onClick={e => e.stopPropagation()}
          />
          <div className="lightbox-actions" onClick={e => e.stopPropagation()}>
            <button 
              className="lightbox-btn"
              onClick={() => downloadImage(lightbox.originalUrl || lightbox.url, lightbox.name)}
            >
              <Download size={16} />
              Download Original
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
