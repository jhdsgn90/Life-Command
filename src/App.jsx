import React, { useState, useEffect, useRef } from 'react';
import { Plus, Check, Circle, Pause, AlertCircle, Trash2, Link2, StickyNote, List, ExternalLink, X, Edit2, Save, Calendar, ChevronLeft, ChevronRight, Clock, Copy, Moon, Sun, Tag, ChevronDown, ChevronUp, Bold, Italic, ListOrdered, Grid, LayoutList, User, Camera, Filter, Download, Upload, Move } from 'lucide-react';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function LifeDashboard() {
  const [activeView, setActiveView] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [links, setLinks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState({ name: 'User', imageUrl: '' });
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showNewLinkForm, setShowNewLinkForm] = useState(false);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewModes, setViewModes] = useState({
    projects: 'list',
    links: 'grid',
    notes: 'grid',
    tags: 'grid'
  });

  // DATA MIGRATION: Convert old v5.1 tasks to v6.0 projects
  useEffect(() => {
    const migrateOldData = () => {
      const oldTasks = localStorage.getItem('lifeDashboard_tasks');
      const existingProjects = localStorage.getItem('lifeDashboard_projects');
      
      if (oldTasks && !existingProjects) {
        try {
          const tasks = JSON.parse(oldTasks);
          const migratedProjects = tasks.map(task => {
            const subItems = (task.subtasks || []).map(st => ({
              id: st.id || generateId(),
              text: st.text,
              completed: st.completed || false,
              status: 'new',
              priority: 'medium'
            }));

            return {
              id: task.id,
              title: task.title,
              description: task.description,
              tags: task.tags || [],
              subItems: subItems,
              linkedItems: task.linkedItems || [],
              completed: task.status === 'completed',
              createdAt: task.createdAt || new Date().toISOString()
            };
          });
          
          localStorage.setItem('lifeDashboard_projects', JSON.stringify(migratedProjects));
          console.log('✅ Migrated', migratedProjects.length, 'tasks to projects');
        } catch (error) {
          console.error('Migration error:', error);
        }
      }
    };

    migrateOldData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (highlightedItemId) {
      const timer = setTimeout(() => {
        setHighlightedItemId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedItemId]);

  useEffect(() => {
    projects.forEach(project => {
      if (project.subItems && project.subItems.length > 0) {
        const allCompleted = project.subItems.every(si => si.completed);
        
        if (allCompleted && !project.completed) {
          updateProject(project.id, { completed: true });
        } else if (!allCompleted && project.completed) {
          updateProject(project.id, { completed: false });
        }
      }
    });
  }, [projects]);

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('lifeDashboard_projects');
      const savedLinks = localStorage.getItem('lifeDashboard_links');
      const savedNotes = localStorage.getItem('lifeDashboard_notes');
      const savedDarkMode = localStorage.getItem('lifeDashboard_darkMode');
      const savedProfile = localStorage.getItem('lifeDashboard_profile');
      const savedViewModes = localStorage.getItem('lifeDashboard_viewModes');
      
      if (savedProjects) setProjects(JSON.parse(savedProjects));
      if (savedLinks) setLinks(JSON.parse(savedLinks));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedViewModes) setViewModes(JSON.parse(savedViewModes));
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('lifeDashboard_projects', JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('lifeDashboard_links', JSON.stringify(links));
    } catch (error) {
      console.error('Error saving links:', error);
    }
  }, [links]);

  useEffect(() => {
    try {
      localStorage.setItem('lifeDashboard_notes', JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('lifeDashboard_darkMode', JSON.stringify(darkMode));
    } catch (error) {
      console.error('Error saving darkMode:', error);
    }
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem('lifeDashboard_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('lifeDashboard_viewModes', JSON.stringify(viewModes));
    } catch (error) {
      console.error('Error saving viewModes:', error);
    }
  }, [viewModes]);

  const toggleViewMode = (view, mode) => {
    setViewModes(prev => ({ ...prev, [view]: mode }));
  };

  const exportData = () => {
    const dataToExport = {
      projects,
      links,
      notes,
      profile,
      darkMode,
      viewModes,
      exportDate: new Date().toISOString(),
      version: '6.2'
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `life-command-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          
          if (window.confirm('This will replace all your current data. Are you sure?')) {
            if (imported.projects) setProjects(imported.projects);
            if (imported.links) setLinks(imported.links);
            if (imported.notes) setNotes(imported.notes);
            if (imported.profile) setProfile(imported.profile);
            if (typeof imported.darkMode !== 'undefined') setDarkMode(imported.darkMode);
            if (imported.viewModes) setViewModes(imported.viewModes);
            
            alert('✅ Data imported successfully!');
          }
        } catch (error) {
          alert('❌ Error importing data. Please check the file format.');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const addProject = (projectData) => {
    const newProject = {
      id: generateId(),
      ...projectData,
      subItems: [],
      linkedItems: [],
      completed: false,
      createdAt: new Date().toISOString()
    };
    setProjects([...projects, newProject]);
    setShowNewProjectForm(false);
  };

  const updateProject = (id, updates) => {
    setProjects(projects.map(project => project.id === id ? { ...project, ...updates } : project));
  };

  const deleteProject = (id) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const clearCompletedProjects = () => {
    setProjects(projects.filter(project => !project.completed));
  };

  const reorderProjects = (newOrder) => {
    setProjects(newOrder);
  };

  const addLink = (linkData) => {
    const newLink = {
      id: generateId(),
      ...linkData,
      createdAt: new Date().toISOString()
    };
    setLinks([...links, newLink]);
    setShowNewLinkForm(false);
  };

  const updateLink = (id, updates) => {
    setLinks(links.map(link => link.id === id ? { ...link, ...updates } : link));
  };

  const deleteLink = (id) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const reorderLinks = (newOrder) => {
    setLinks(newOrder);
  };

  const addNote = (noteData) => {
    const newNote = {
      id: generateId(),
      ...noteData,
      createdAt: new Date().toISOString()
    };
    setNotes([...notes, newNote]);
    setShowNewNoteForm(false);
  };

  const updateNote = (id, updates) => {
    setNotes(notes.map(note => note.id === id ? { ...note, ...updates } : note));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const reorderNotes = (newOrder) => {
    setNotes(newOrder);
  };


  const getLinkedItem = (linkedItem) => {
    if (linkedItem.type === 'link') {
      return links.find(l => l.id === linkedItem.id);
    } else if (linkedItem.type === 'note') {
      return notes.find(n => n.id === linkedItem.id);
    } else if (linkedItem.type === 'project') {
      return projects.find(p => p.id === linkedItem.id);
    }
    return null;
  };

  const navigateToLinkedItem = (linkedItem) => {
    if (linkedItem.type === 'link') {
      setActiveView('links');
    } else if (linkedItem.type === 'note') {
      setActiveView('notes');
    } else if (linkedItem.type === 'project') {
      setActiveView('projects');
    }
    
    setTimeout(() => {
      setHighlightedItemId(linkedItem.id);
      const element = document.getElementById(`item-${linkedItem.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const allTags = [...new Set([
    ...projects.flatMap(p => p.tags || []),
    ...links.flatMap(l => l.tags || []),
    ...notes.flatMap(n => n.tags || [])
  ])];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'} transition-colors duration-300`}>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes highlight {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(20, 184, 166, 0.1); }
        }

        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-highlight {
          animation: highlight 2s ease-in-out;
        }

        .task-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .task-card:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .status-badge {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .status-badge:hover {
          transform: scale(1.05);
        }

        .accent-font {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .rich-text-editor {
          line-height: 1.6;
          direction: ltr !important;
          text-align: left !important;
        }

        .rich-text-editor * {
          direction: ltr !important;
          text-align: left !important;
        }

        div[contenteditable] {
          direction: ltr !important;
          text-align: left !important;
        }

        div[contenteditable] * {
          direction: ltr !important;
        }

        .rich-text-editor strong {
          font-weight: 600;
        }

        .rich-text-editor em {
          font-style: italic;
        }

        .rich-text-editor ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .rich-text-editor ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .rich-text-editor li {
          margin: 0.25em 0;
        }

        /* 2-COLUMN MASONRY (not 3) */
        .masonry {
          column-count: 2;
          column-gap: 1rem;
        }

        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1rem;
        }

        * {
          transition-property: background-color, border-color, color, fill, stroke;
          transition-duration: 0.2s;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        button, a, .task-card {
          transition-property: all;
        }
      `}</style>

      <div className="flex h-screen overflow-hidden">
        <aside className={`w-64 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-r flex flex-col sticky top-0 h-screen`}>
          <div className="p-6 flex-shrink-0">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} accent-font`}>
              Life Command
            </h1>
            <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'} mt-1`}>v6.0</p>
          </div>
          
          <nav className="flex-1 px-3 overflow-y-auto">
            <NavButton 
              active={activeView === 'projects'} 
              onClick={() => setActiveView('projects')} 
              icon={List} 
              label="Projects"
              count={projects.filter(p => !p.completed).length}
              darkMode={darkMode}
            />
            <NavButton 
              active={activeView === 'links'} 
              onClick={() => setActiveView('links')} 
              icon={Link2} 
              label="Links"
              count={links.length}
              darkMode={darkMode}
            />
            <NavButton 
              active={activeView === 'notes'} 
              onClick={() => setActiveView('notes')} 
              icon={StickyNote} 
              label="Notes"
              count={notes.length}
              darkMode={darkMode}
            />
            <NavButton 
              active={activeView === 'tags'} 
              onClick={() => setActiveView('tags')} 
              icon={Tag} 
              label="Tags"
              count={allTags.length}
              darkMode={darkMode}
            />
          </nav>

          <div className={`px-4 py-3 border-t ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50/50'} flex-shrink-0`}>
            <div className={`text-center ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <div className="text-2xl font-bold tabular-nums tracking-tight">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </div>
              <div className={`text-xs mt-0.5 font-medium ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <header className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10`}>
            <div className="flex items-center gap-4">
              <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportData}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 ${darkMode ? 'bg-slate-700 text-teal-400 hover:bg-slate-600' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}
                title="Export all data"
              >
                <Download size={18} />
                <span className="text-sm font-medium">Export</span>
              </button>
              <button
                onClick={importData}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 ${darkMode ? 'bg-slate-700 text-purple-400 hover:bg-slate-600' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                title="Import data"
              >
                <Upload size={18} />
                <span className="text-sm font-medium">Import</span>
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all hover:scale-110 ${darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setShowProfileEditor(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                {profile.imageUrl ? (
                  <img src={profile.imageUrl} alt={profile.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`}>
                    <User size={18} className={darkMode ? 'text-slate-300' : 'text-slate-600'} />
                  </div>
                )}
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-700'}`}>{profile.name}</span>
              </button>
            </div>
          </header>

          <div className="p-8">
            {activeView === 'projects' && (
              <ProjectsView 
                projects={projects}
                addProject={addProject}
                updateProject={updateProject}
                deleteProject={deleteProject}
                clearCompletedProjects={clearCompletedProjects}
                reorderProjects={reorderProjects}
                showNewProjectForm={showNewProjectForm}
                setShowNewProjectForm={setShowNewProjectForm}
                links={links}
                notes={notes}
                toggleLinkToProject={toggleLinkToProject}
                getLinkedItem={getLinkedItem}
                navigateToLinkedItem={navigateToLinkedItem}
                highlightedItemId={highlightedItemId}
                darkMode={darkMode}
                allTags={allTags}
                viewMode={viewModes.projects}
                toggleViewMode={toggleViewMode}
              />
            )}
            {activeView === 'links' && (
              <LinksView
                links={links}
                addLink={addLink}
                updateLink={updateLink}
                deleteLink={deleteLink}
                reorderLinks={reorderLinks}
                showNewLinkForm={showNewLinkForm}
                setShowNewLinkForm={setShowNewLinkForm}
                projects={projects}
                notes={notes}
                getLinkedItem={getLinkedItem}
                navigateToLinkedItem={navigateToLinkedItem}
                highlightedItemId={highlightedItemId}
                darkMode={darkMode}
                allTags={allTags}
                viewMode={viewModes.links}
                toggleViewMode={toggleViewMode}
              />
            )}
            {activeView === 'notes' && (
              <NotesView
                notes={notes}
                addNote={addNote}
                updateNote={updateNote}
                deleteNote={deleteNote}
                reorderNotes={reorderNotes}
                showNewNoteForm={showNewNoteForm}
                setShowNewNoteForm={setShowNewNoteForm}
                projects={projects}
                links={links}
                getLinkedItem={getLinkedItem}
                navigateToLinkedItem={navigateToLinkedItem}
                highlightedItemId={highlightedItemId}
                darkMode={darkMode}
                allTags={allTags}
                viewMode={viewModes.notes}
                toggleViewMode={toggleViewMode}
              />
            )}
            {activeView === 'tags' && (
              <TagsView
                projects={projects}
                links={links}
                notes={notes}
                navigateToLinkedItem={navigateToLinkedItem}
                darkMode={darkMode}
                allTags={allTags}
              />
            )}
          </div>
        </main>
      </div>

      {showProfileEditor && (
        <ProfileEditor
          profile={profile}
          onSave={(newProfile) => {
            setProfile(newProfile);
            setShowProfileEditor(false);
          }}
          onClose={() => setShowProfileEditor(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label, count, darkMode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-all ${
        active 
          ? 'bg-teal-600 text-white shadow-md scale-102' 
          : darkMode 
            ? 'text-slate-300 hover:bg-slate-700' 
            : 'text-slate-600 hover:bg-slate-100'
      } hover:scale-102`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </div>
      {count > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          active ? 'bg-white/20' : darkMode ? 'bg-slate-700' : 'bg-slate-200'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function ProfileEditor({ profile, onSave, onClose, darkMode }) {
  const [name, setName] = useState(profile.name);
  const [imageUrl, setImageUrl] = useState(profile.imageUrl);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, imageUrl });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-6 animate-scaleIn`}>
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'} mb-4`}>Edit Profile</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
              placeholder="Your name"
            />
          </div>
          <div className="mb-4">
            <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
              Profile Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <div className="mt-2">
                <img src={profileimageUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} rounded-lg transition-all`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RichTextEditor({ value, onChange, placeholder, darkMode, rows = 10 }) {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const [isUnordered, setIsUnordered] = useState(false);
  const editorRef = useRef(null);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = (e) => {
    onChange(e.currentTarget.innerHTML);
  };

  return (
    <div className={`border ${darkMode ? 'border-slate-600' : 'border-slate-300'} rounded-lg overflow-hidden`}>
      <div className={`flex gap-1 p-2 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'} border-b`}>
        <button
          type="button"
          onClick={() => {
            execCommand('bold');
            setIsBold(!isBold);
          }}
          className={`p-2 rounded transition-all hover:scale-110 ${isBold ? 'bg-teal-600 text-white' : darkMode ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-slate-200'}`}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            execCommand('italic');
            setIsItalic(!isItalic);
          }}
          className={`p-2 rounded transition-all hover:scale-110 ${isItalic ? 'bg-teal-600 text-white' : darkMode ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-slate-200'}`}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            execCommand('insertOrderedList');
            setIsOrdered(!isOrdered);
          }}
          className={`p-2 rounded transition-all hover:scale-110 ${isOrdered ? 'bg-teal-600 text-white' : darkMode ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-slate-200'}`}
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            execCommand('insertUnorderedList');
            setIsUnordered(!isUnordered);
          }}
          className={`p-2 rounded transition-all hover:scale-110 ${isUnordered ? 'bg-teal-600 text-white' : darkMode ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-slate-200'}`}
        >
          <List size={16} />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        dir="ltr"
        className={`p-3 focus:outline-none ${darkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'} rich-text-editor`}
        style={{ 
          minHeight: `${rows * 24}px`,
          direction: 'ltr',
          textAlign: 'left'
        }}
        data-placeholder={placeholder}
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: ${darkMode ? '#94a3b8' : '#64748b'};
        }
        [contenteditable] {
          direction: ltr !important;
          text-align: left !important;
        }
      `}</style>
    </div>
  );
}

// PROJECTS VIEW - With all filters and features
function ProjectsView({ 
  projects, 
  addProject, 
  updateProject, 
  deleteProject, 
  clearCompletedProjects,
  reorderProjects,
  showNewProjectForm,
  setShowNewProjectForm,
  links,
  notes,
  toggleLinkToProject,
  getLinkedItem,
  navigateToLinkedItem,
  highlightedItemId,
  darkMode,
  allTags,
  viewMode,
  toggleViewMode
}) {
  const [filterType, setFilterType] = useState('none');
  const [filterValue, setFilterValue] = useState('all');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  
  const activeProjects = projects.filter(p => !p.completed);
  const completedProjects = projects.filter(p => p.completed);
  
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingProjectId, setLinkingProjectId] = useState(null);

  const openLinkModal = (projectId) => {
    setLinkingProjectId(projectId);
    setShowLinkModal(true);
  };

  const handleToggleLink = (item, type) => {
    if (linkingProjectId) {
      toggleLinkToProject(linkingProjectId, item, type);
    }
  };

  const currentProject = projects.find(p => p.id === linkingProjectId);

  const allStatuses = ['new', 'working', 'paused', 'stuck'];
  const allPriorities = ['urgent', 'high', 'medium', 'low'];
  const projectTags = [...new Set(activeProjects.flatMap(p => p.tags || []))];

  let filteredData = [];
  
  if (filterType === 'none' || filterValue === 'all') {
    filteredData = activeProjects.map(p => ({ project: p, subItems: p.subItems || [] }));
  } else if (filterType === 'priority') {
    activeProjects.forEach(project => {
      const matchingSubItems = (project.subItems || []).filter(si => si.priority === filterValue);
      if (matchingSubItems.length > 0) {
        filteredData.push({ project, subItems: matchingSubItems });
      }
    });
  } else if (filterType === 'status') {
    activeProjects.forEach(project => {
      const matchingSubItems = (project.subItems || []).filter(si => si.status === filterValue);
      if (matchingSubItems.length > 0) {
        filteredData.push({ project, subItems: matchingSubItems });
      }
    });
  } else if (filterType === 'tag') {
    filteredData = activeProjects
      .filter(p => p.tags && p.tags.includes(filterValue))
      .map(p => ({ project: p, subItems: p.subItems || [] }));
  }

  const handleDragStart = (e, project) => {
    setDraggedItem(project);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, project) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== project.id) {
      setDragOverItem(project);
    }
  };

  const handleDrop = (e, targetProject) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetProject.id) return;

    const allProjectsCopy = [...projects];
    const draggedIndex = allProjectsCopy.findIndex(p => p.id === draggedItem.id);
    const targetIndex = allProjectsCopy.findIndex(p => p.id === targetProject.id);

    const [removed] = allProjectsCopy.splice(draggedIndex, 1);
    allProjectsCopy.splice(targetIndex, 0, removed);

    reorderProjects(allProjectsCopy);

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="max-w-7xl animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} accent-font`}>Projects</h2>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>{activeProjects.length} active • {completedProjects.length} completed</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex gap-1 p-1 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <button
              onClick={() => toggleViewMode('projects', 'list')}
              className={`p-2 rounded transition-all ${viewMode === 'list' ? (darkMode ? 'bg-slate-600 shadow' : 'bg-white shadow') : (darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-300')}`}
              title="List view"
            >
              <LayoutList size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
            </button>
            <button
              onClick={() => toggleViewMode('projects', 'grid')}
              className={`p-2 rounded transition-all ${viewMode === 'grid' ? (darkMode ? 'bg-slate-600 shadow' : 'bg-white shadow') : (darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-300')}`}
              title="Grid view"
            >
              <Grid size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
            </button>
          </div>
          <button
            onClick={() => setShowNewProjectForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Filter size={18} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setFilterValue('all');
            }}
            className={`px-4 py-2 rounded-lg border transition-all ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          >
            <option value="none">No Filter</option>
            <option value="priority">Filter by Priority</option>
            <option value="status">Filter by Status</option>
            <option value="tag">Filter by Tag</option>
          </select>

          {filterType === 'priority' && (
            <div className="flex gap-2">
              <button
                onClick={() => setFilterValue('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterValue === 'all' 
                    ? 'bg-teal-600 text-white' 
                    : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {allPriorities.map(priority => (
                <button
                  key={priority}
                  onClick={() => setFilterValue(priority)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    filterValue === priority 
                      ? 'bg-teal-600 text-white' 
                      : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          )}

          {filterType === 'status' && (
            <div className="flex gap-2">
              <button
                onClick={() => setFilterValue('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterValue === 'all' 
                    ? 'bg-teal-600 text-white' 
                    : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {allStatuses.map(status => (
                <button
                  key={status}
                  onClick={() => setFilterValue(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    filterValue === status 
                      ? 'bg-teal-600 text-white' 
                      : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'working' ? 'Working on it' : status}
                </button>
              ))}
            </div>
          )}

          {filterType === 'tag' && projectTags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterValue('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterValue === 'all' 
                    ? 'bg-teal-600 text-white' 
                    : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {projectTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterValue(tag)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterValue === tag 
                      ? 'bg-teal-600 text-white' 
                      : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Tag size={14} />
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {filterType !== 'none' && filterValue !== 'all' && (
          <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Showing {filteredData.length} project{filteredData.length !== 1 ? 's' : ''} with {filterType} = "{filterValue}"
          </div>
        )}
      </div>

      {showNewProjectForm && (
        <NewProjectForm 
          onSave={addProject} 
          onCancel={() => setShowNewProjectForm(false)}
          darkMode={darkMode}
          allTags={allTags}
        />
      )}

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="masonry mb-8">
          {filteredData.map(({ project, subItems }, index) => (
            <div key={project.id} className="masonry-item">
              <ProjectCard 
                project={project}
                visibleSubItems={subItems}
                showingFilteredSubItems={filterType !== 'none' && filterValue !== 'all' && (filterType === 'priority' || filterType === 'status')}
                updateProject={updateProject}
                deleteProject={deleteProject}
                getLinkedItem={getLinkedItem}
                navigateToLinkedItem={navigateToLinkedItem}
                onOpenLinkModal={() => openLinkModal(project.id)}
                isHighlighted={highlightedItemId === project.id}
                darkMode={darkMode}
                allTags={allTags}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                isDragging={draggedItem?.id === project.id}
                isDragOver={dragOverItem?.id === project.id}
                style={{ animationDelay: `${index * 0.03}s` }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {filteredData.map(({ project, subItems }, index) => (
            <ProjectCard 
              key={project.id}
              project={project}
              visibleSubItems={subItems}
              showingFilteredSubItems={filterType !== 'none' && filterValue !== 'all' && (filterType === 'priority' || filterType === 'status')}
              updateProject={updateProject}
              deleteProject={deleteProject}
              getLinkedItem={getLinkedItem}
              navigateToLinkedItem={navigateToLinkedItem}
              onOpenLinkModal={() => openLinkModal(project.id)}
              isHighlighted={highlightedItemId === project.id}
              darkMode={darkMode}
              allTags={allTags}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragging={draggedItem?.id === project.id}
              isDragOver={dragOverItem?.id === project.id}
              style={{ animationDelay: `${index * 0.03}s` }}
            />
          ))}
        </div>
      )}

      {filteredData.length === 0 && !showNewProjectForm && (
        <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <List size={48} className="mx-auto mb-4 opacity-30" />
          <p>No projects match your filter. Try changing the filter or add a new project!</p>
        </div>
      )}

      {completedProjects.length > 0 && (
        <div className={`mt-12 pt-8 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Completed</h3>
            <button
              onClick={clearCompletedProjects}
              className={`text-sm ${darkMode ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-600'} transition-colors`}
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2 opacity-60">
            {completedProjects.map(project => (
              <div key={project.id} className={`p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border`}>
                <div className="flex items-center gap-3">
                  <Check className="text-green-600" size={20} />
                  <span className={`line-through ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{project.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <LinkItemsModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        items={{ links, notes }}
        onToggleLink={handleToggleLink}
        linkedItems={currentProject?.linkedItems || []}
        darkMode={darkMode}
      />
    </div>
  );
}

function LinkItemsModal({ isOpen, onClose, items, onToggleLink, linkedItems, darkMode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={onClose}>
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scaleIn`} onClick={(e) => e.stopPropagation()}>
        <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Link Items</h3>
            <button onClick={onClose} className={`${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'} transition-all hover:scale-110`}>
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {items.links && items.links.length > 0 && (
            <div className="mb-6">
              <h4 className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-3 uppercase tracking-wide`}>Links</h4>
              <div className="space-y-2">
                {items.links.map(link => {
                  const isLinked = linkedItems.some(li => li.id === link.id && li.type === 'link');
                  return (
                    <button
                      key={link.id}
                      onClick={() => onToggleLink(link, 'link')}
                      className={`w-full text-left p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                        isLinked 
                          ? 'bg-teal-50 border-teal-300 dark:bg-teal-900/20 dark:border-teal-700' 
                          : darkMode ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isLinked ? 'bg-teal-600 border-teal-600' : darkMode ? 'border-slate-500' : 'border-slate-300'
                        }`}>
                          {isLinked && <Check size={14} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          {link.title && <div className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{link.title}</div>}
                          <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} truncate`}>{link.url}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {items.notes && items.notes.length > 0 && (
            <div>
              <h4 className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-3 uppercase tracking-wide`}>Notes</h4>
              <div className="space-y-2">
                {items.notes.map(note => {
                  const isLinked = linkedItems.some(li => li.id === note.id && li.type === 'note');
                  return (
                    <button
                      key={note.id}
                      onClick={() => onToggleLink(note, 'note')}
                      className={`w-full text-left p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                        isLinked 
                          ? 'bg-teal-50 border-teal-300 dark:bg-teal-900/20 dark:border-teal-700' 
                          : darkMode ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isLinked ? 'bg-teal-600 border-teal-600' : darkMode ? 'border-slate-500' : 'border-slate-300'
                        }`}>
                          {isLinked && <Check size={14} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{note.title || 'Untitled Note'}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(!items.links || items.links.length === 0) && (!items.notes || items.notes.length === 0) && (
            <div className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              No items available to link
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewProjectForm({ onSave, onCancel, darkMode, allTags }) {
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({ title, tags: selectedTags });
      setTitle('');
      setSelectedTags([]);
    }
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(t => t !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className={`mb-6 p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-lg border animate-slideUp`}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Project title..."
        className={`w-full text-lg font-medium mb-4 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
        autoFocus
      />
      
      <div className="mb-4">
        <label className={`block text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-2`}>Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
              <Tag size={12} />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-teal-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder="Add tag and press Enter..."
            list="all-tags"
            className={`flex-1 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
          />
          <datalist id="all-tags">
            {allTags.filter(t => !selectedTags.includes(t)).map(tag => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={() => addTag(tagInput)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
        >
          <Save size={16} />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'} rounded-lg transition-all`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// PROJECT CARD - With ALL bug fixes
function ProjectCard({ 
  project,
  visibleSubItems,
  showingFilteredSubItems,
  updateProject,
  deleteProject,
  getLinkedItem,
  navigateToLinkedItem,
  onOpenLinkModal,
  isHighlighted,
  darkMode,
  allTags,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver,
  style
}) {
  const [showSubItems, setShowSubItems] = useState(true);
  const [newSubItemText, setNewSubItemText] = useState('');
  const [editingSubItemId, setEditingSubItemId] = useState(null);
  const [editingSubItemText, setEditingSubItemText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.title);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [editingTags, setEditingTags] = useState(project.tags || []);

  const statusConfig = {
    new: { label: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Circle },
    working: { label: 'Working', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Circle },
    paused: { label: 'Paused', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Pause },
    stuck: { label: 'Stuck', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
  };

  const priorityConfig = {
    urgent: { label: 'Urgent', color: 'bg-red-500 text-white' },
    high: { label: 'High', color: 'bg-orange-500 text-white' },
    medium: { label: 'Medium', color: 'bg-yellow-500 text-white' },
    low: { label: 'Low', color: 'bg-slate-400 text-white' },
  };

  const allSubItems = project.subItems || [];
  const totalSubItems = allSubItems.length;
  const completedSubItems = allSubItems.filter(si => si.completed).length;
  const progressPercent = totalSubItems > 0 ? Math.round((completedSubItems / totalSubItems) * 100) : 0;

  const addSubItem = () => {
    if (newSubItemText.trim()) {
      const subItems = project.subItems || [];
      updateProject(project.id, {
        subItems: [...subItems, {
          id: generateId(),
          text: newSubItemText,
          completed: false,
          status: 'new',
          priority: 'medium'
        }]
      });
      setNewSubItemText('');
    }
  };

  const toggleSubItem = (subItemId) => {
    const subItems = project.subItems || [];
    updateProject(project.id, {
      subItems: subItems.map(si => 
        si.id === subItemId ? { ...si, completed: !si.completed } : si
      )
    });
  };

  const deleteSubItem = (subItemId) => {
    const subItems = project.subItems || [];
    updateProject(project.id, {
      subItems: subItems.filter(si => si.id !== subItemId)
    });
  };

  const updateSubItem = (subItemId, updates) => {
    const subItems = project.subItems || [];
    updateProject(project.id, {
      subItems: subItems.map(si => 
        si.id === subItemId ? { ...si, ...updates } : si
      )
    });
  };

  const startEditingSubItem = (subItem) => {
    setEditingSubItemId(subItem.id);
    setEditingSubItemText(subItem.text);
  };

  const saveSubItemEdit = () => {
    if (editingSubItemText.trim()) {
      updateSubItem(editingSubItemId, { text: editingSubItemText });
    }
    setEditingSubItemId(null);
    setEditingSubItemText('');
  };

  const copySubItem = (text) => {
    navigator.clipboard.writeText(text);
  };

  const saveTitle = () => {
    if (editedTitle.trim()) {
      updateProject(project.id, { title: editedTitle });
    }
    setIsEditingTitle(false);
  };

  const saveTags = () => {
    // FIX: Properly update with the editing tags state
    updateProject(project.id, { tags: editingTags });
    setIsEditingTags(false);
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !editingTags.includes(trimmedTag)) {
      setEditingTags([...editingTags, trimmedTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setEditingTags(editingTags.filter(t => t !== tagToRemove));
  };

  return (
    <div 
      id={`item-${project.id}`}
      onDragOver={(e) => onDragOver(e, project)}
      onDrop={(e) => onDrop(e, project)}
      className={`task-card p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-md border animate-slideUp group relative ${
        isHighlighted ? 'animate-highlight ring-2 ring-teal-500' : ''
      } ${isDragging ? 'opacity-50 scale-95' : ''} ${isDragOver ? 'border-teal-500 border-2' : ''}`} 
      style={style}
    >
      {/* IMPROVED DRAG HANDLE - Always visible with hover effect */}
      <div
        draggable
        onDragStart={(e) => onDragStart(e, project)}
        onDragEnd={onDragEnd}
        className={`absolute top-4 right-4 p-2 rounded cursor-move transition-all ${
          darkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-teal-400' : 'text-slate-500 hover:bg-slate-100 hover:text-teal-600'
        }`}
        title="Drag to reorder"
      >
        <Move size={20} />
      </div>

      <div className="flex items-start justify-between mb-4 pr-10">
        <div className="flex-1">
          {isEditingTitle ? (
            <div className="mb-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveTitle()}
                onBlur={saveTitle}
                className={`w-full text-xl font-semibold px-2 py-1 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'} rounded focus:outline-none focus:ring-2 focus:ring-teal-500`}
                autoFocus
              />
            </div>
          ) : (
            <h3 
              onClick={() => setIsEditingTitle(true)}
              className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'} mb-2 cursor-pointer hover:text-teal-600 transition-colors`}
            >
              {project.title}
            </h3>
          )}

          {/* Progress Bar */}
          {totalSubItems > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Progress: {completedSubItems}/{totalSubItems} ({progressPercent}%)
                </span>
              </div>
              <div className={`w-full h-2 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                <div 
                  className="h-full bg-teal-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
          

          {/* EDITABLE TAGS - MORE SPACING ABOVE */}
          {isEditingTags ? (
            <div className="mb-3 mt-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {editingTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">
                    <Tag size={10} />
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-teal-900">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  placeholder="Add tag..."
                  list="edit-tags"
                  className={`flex-1 px-2 py-1 text-sm border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'} rounded focus:outline-none focus:ring-1 focus:ring-teal-500`}
                />
                <datalist id="edit-tags">
                  {allTags.filter(t => !editingTags.includes(t)).map(tag => (
                    <option key={tag} value={tag} />
                  ))}
                </datalist>
                <button
                  onClick={() => addTag(tagInput)}
                  className="px-2 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveTags}
                  className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingTags(project.tags || []);
                    setIsEditingTags(false);
                  }}
                  className={`px-3 py-1 text-sm rounded ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (project.tags && project.tags.length > 0) ? (
            <div className="flex flex-wrap gap-1 mb-3 mt-4 group/tags relative">
              {project.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs border border-teal-200">
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
              <button
                onClick={() => {
                  setEditingTags(project.tags || []);
                  setIsEditingTags(true);
                }}
                className={`ml-1 px-2 py-1 text-xs rounded opacity-0 group-hover/tags:opacity-100 transition-opacity ${darkMode ? 'bg-slate-700 text-teal-400 hover:bg-slate-600' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}
              >
                <Edit2 size={10} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditingTags([]);
                setIsEditingTags(true);
              }}
              className={`text-sm ${darkMode ? 'text-slate-500 hover:text-teal-400' : 'text-slate-400 hover:text-teal-600'} mb-3 mt-4`}
            >
              + Add tags
            </button>
          )}
        </div>
        <button
          onClick={() => deleteProject(project.id)}
          className={`${darkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-600'} transition-all ml-4 hover:scale-110`}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* SUB ITEMS WITH BORDERS */}
      <div className={`mb-4 pb-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
        <button
          onClick={() => setShowSubItems(!showSubItems)}
          className={`flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2 transition-all hover:text-teal-600`}
        >
          {showSubItems ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          Sub Items {totalSubItems > 0 && `(${completedSubItems}/${totalSubItems})`}
        </button>
        
        {showingFilteredSubItems && (
          <div className={`text-xs ${darkMode ? 'text-teal-400' : 'text-teal-600'} mb-2`}>
            Showing filtered sub-items only
          </div>
        )}
        
        {showSubItems && (
          <div>
            {visibleSubItems.map((subItem, index) => (
              <div 
                key={subItem.id} 
                className={`flex items-start gap-2 group/subitem py-2 ${
                  index > 0 ? (darkMode ? 'border-t border-slate-700' : 'border-t border-slate-100') : ''
                }`}
              >
                <button
                  onClick={() => toggleSubItem(subItem.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-0.5 ${
                    subItem.completed 
                      ? 'bg-teal-600 border-teal-600 scale-110' 
                      : darkMode ? 'border-slate-600 hover:border-teal-500' : 'border-slate-300 hover:border-teal-500'
                  }`}
                >
                  {subItem.completed && <Check size={12} className="text-white" />}
                </button>
                
                <div className="flex-1">
                  {editingSubItemId === subItem.id ? (
                    <input
                      type="text"
                      value={editingSubItemText}
                      onChange={(e) => setEditingSubItemText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveSubItemEdit()}
                      onBlur={saveSubItemEdit}
                      onMouseDown={(e) => e.stopPropagation()}
                      className={`w-full px-2 py-1 text-sm border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded focus:outline-none focus:ring-1 focus:ring-teal-500`}
                      autoFocus
                    />
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span 
                          onClick={() => startEditingSubItem(subItem)}
                          className={`text-sm cursor-pointer flex-1 ${
                            subItem.completed 
                              ? darkMode ? 'line-through text-slate-500' : 'line-through text-slate-400'
                              : darkMode ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {subItem.text}
                        </span>
                        
                        <select
                          value={subItem.status}
                          onChange={(e) => updateSubItem(subItem.id, { status: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-xs px-2 py-0.5 rounded border ${
                            statusConfig[subItem.status].color
                          } cursor-pointer font-medium`}
                        >
                          <option value="new">New</option>
                          <option value="working">Working</option>
                          <option value="paused">Paused</option>
                          <option value="stuck">Stuck</option>
                        </select>

                        <select
                          value={subItem.priority}
                          onChange={(e) => updateSubItem(subItem.id, { priority: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-xs px-2 py-0.5 rounded ${
                            priorityConfig[subItem.priority].color
                          } cursor-pointer font-medium`}
                        >
                          <option value="urgent">Urgent</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>

                        <button
                          onClick={() => copySubItem(subItem.text)}
                          className={`opacity-0 group-hover/subitem:opacity-100 transition-all ${darkMode ? 'text-slate-500 hover:text-teal-400' : 'text-slate-400 hover:text-teal-600'}`}
                          title="Copy sub-item"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => deleteSubItem(subItem.id)}
                          className={`opacity-0 group-hover/subitem:opacity-100 transition-all ${darkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-600'}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {!showingFilteredSubItems && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newSubItemText}
                  onChange={(e) => setNewSubItemText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubItem()}
                  placeholder="Add sub-item..."
                  className={`flex-1 px-2 py-1 text-sm border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'border-slate-300'} rounded focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all`}
                />
                <button
                  onClick={addSubItem}
                  className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 transition-all hover:scale-105"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {project.linkedItems && project.linkedItems.length > 0 && (
        <div className={`mb-3 pt-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex flex-wrap gap-2">
            {project.linkedItems.map(linkedItem => {
              const item = getLinkedItem(linkedItem);
              if (!item) return null;
              
              return (
                <button
                  key={linkedItem.id}
                  onClick={() => navigateToLinkedItem(linkedItem)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm border border-teal-200 hover:bg-teal-100 transition-all hover:scale-105"
                >
                  {linkedItem.type === 'link' ? <Link2 size={14} /> : <StickyNote size={14} />}
                  <span className="truncate max-w-[150px]">{linkedItem.title}</span>
                  <ExternalLink size={12} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={onOpenLinkModal}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105 ${
          darkMode ? 'bg-slate-700 text-teal-400 hover:bg-slate-600' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
        }`}
      >
        <Link2 size={16} />
        <span className="text-sm font-medium">Link Items</span>
      </button>
    </div>
  );
}

// LINKS VIEW - Complete with filtering and tag editing
function LinksView({
  links,
  addLink,
  updateLink,
  deleteLink,
  reorderLinks,
  showNewLinkForm,
  setShowNewLinkForm,
  projects,
  notes,
  getLinkedItem,
  navigateToLinkedItem,
  highlightedItemId,
  darkMode,
  allTags,
  viewMode,
  toggleViewMode
}) {
  const [filterTag, setFilterTag] = useState('all');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  const linkTags = [...new Set(links.flatMap(l => l.tags || []))];

  const filteredLinks = filterTag === 'all' 
    ? links 
    : links.filter(link => link.tags && link.tags.includes(filterTag));

  const handleDragStart = (e, link) => {
    setDraggedItem(link);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, link) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== link.id) {
      setDragOverItem(link);
    }
  };

  const handleDrop = (e, targetLink) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetLink.id) return;

    const linksCopy = [...links];
    const draggedIndex = linksCopy.findIndex(l => l.id === draggedItem.id);
    const targetIndex = linksCopy.findIndex(l => l.id === targetLink.id);

    const [removed] = linksCopy.splice(draggedIndex, 1);
    linksCopy.splice(targetIndex, 0, removed);

    reorderLinks(linksCopy);

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="max-w-7xl animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} accent-font`}>Links</h2>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>{links.length} saved links</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewLinkForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus size={20} />
            New Link
          </button>
        </div>
      </div>

      {/* Filter by Tags */}
      {linkTags.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Filter size={18} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
            <button
              onClick={() => setFilterTag('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterTag === 'all'
                  ? 'bg-teal-600 text-white'
                  : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {linkTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterTag === tag
                    ? 'bg-teal-600 text-white'
                    : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Tag size={14} />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {showNewLinkForm && (
        <NewLinkForm
          onSave={addLink}
          onCancel={() => setShowNewLinkForm(false)}
          darkMode={darkMode}
          allTags={allTags}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filteredLinks.map((link, index) => (
          <LinkCard
            key={link.id}
            link={link}
            updateLink={updateLink}
            deleteLink={deleteLink}
            isHighlighted={highlightedItemId === link.id}
            darkMode={darkMode}
            allTags={allTags}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            isDragging={draggedItem?.id === link.id}
            isDragOver={dragOverItem?.id === link.id}
            style={{ animationDelay: `${index * 0.03}s` }}
          />
        ))}
      </div>

      {filteredLinks.length === 0 && !showNewLinkForm && (
        <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <Link2 size={48} className="mx-auto mb-4 opacity-30" />
          <p>No links yet. Add your first link!</p>
        </div>
      )}
    </div>
  );
}

function NewLinkForm({ onSave, onCancel, darkMode, allTags }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSave({ url, title, tags: selectedTags });
      setUrl('');
      setTitle('');
      setSelectedTags([]);
    }
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(t => t !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className={`mb-6 p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-lg border animate-slideUp`}>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        className={`w-full text-lg mb-3 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
        autoFocus
      />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Link label (optional)"
        className={`w-full mb-3 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
      />

      <div className="mt-4">
        <label className={`block text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-2`}>Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
              <Tag size={12} />
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-teal-900">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder="Add tag and press Enter..."
            list="link-tags"
            className={`flex-1 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
          />
          <datalist id="link-tags">
            {allTags.filter(t => !selectedTags.includes(t)).map(tag => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={() => addTag(tagInput)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all">
          <Save size={16} />
          Save
        </button>
        <button type="button" onClick={onCancel} className={`px-4 py-2 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'} rounded-lg transition-all`}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function LinkCard({ link, updateLink, deleteLink, isHighlighted, darkMode, allTags, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, isDragOver, style }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(link.title || '');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editedUrl, setEditedUrl] = useState(link.url);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [editingTags, setEditingTags] = useState(link.tags || []);

  const saveTitle = () => {
    updateLink(link.id, { title: editedTitle });
    setIsEditingTitle(false);
  };

  const saveUrl = () => {
    if (editedUrl.trim()) {
      updateLink(link.id, { url: editedUrl });
    }
    setIsEditingUrl(false);
  };

  const saveTags = () => {
    updateLink(link.id, { tags: editingTags });
    setIsEditingTags(false);
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !editingTags.includes(trimmedTag)) {
      setEditingTags([...editingTags, trimmedTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setEditingTags(editingTags.filter(t => t !== tagToRemove));
  };

  return (
    <div
      id={`item-${link.id}`}
      onDragOver={(e) => onDragOver(e, link)}
      onDrop={(e) => onDrop(e, link)}
      className={`task-card p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-md border animate-slideUp group relative ${
        isHighlighted ? 'animate-highlight ring-2 ring-teal-500' : ''
      } ${isDragging ? 'opacity-50 scale-95' : ''} ${isDragOver ? 'border-teal-500 border-2' : ''}`}
      style={style}
    >
      <div
        draggable
        onDragStart={(e) => onDragStart(e, link)}
        onDragEnd={onDragEnd}
        className={`absolute top-3 right-3 p-1.5 rounded cursor-move transition-all ${
          darkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-teal-400' : 'text-slate-500 hover:bg-slate-100 hover:text-teal-600'
        }`}
        title="Drag to reorder"
      >
        <Move size={18} />
      </div>

      <div className="mb-3 pr-8">
        {isEditingTitle ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && saveTitle()}
            onBlur={saveTitle}
            placeholder="Link label..."
            className={`w-full font-medium px-2 py-1 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'} rounded focus:outline-none focus:ring-2 focus:ring-teal-500`}
            autoFocus
          />
        ) : link.title ? (
          <div
            onClick={() => setIsEditingTitle(true)}
            className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'} cursor-pointer hover:text-teal-600 transition-colors`}
          >
            {link.title}
          </div>
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className={`text-sm ${darkMode ? 'text-slate-500 hover:text-teal-400' : 'text-slate-400 hover:text-teal-600'}`}
          >
            + Add label
          </button>
        )}
      </div>

      {isEditingUrl ? (
        <div className="mb-3">
          <input
            type="url"
            value={editedUrl}
            onChange={(e) => setEditedUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && saveUrl()}
            onBlur={saveUrl}
            className={`w-full text-sm px-2 py-1 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'} rounded focus:outline-none focus:ring-2 focus:ring-teal-500`}
            autoFocus
          />
        </div>
      ) : (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm ${darkMode ? 'text-teal-400' : 'text-teal-600'} hover:underline mb-3 block truncate`}
          onDoubleClick={(e) => {
            e.preventDefault();
            setIsEditingUrl(true);
          }}
        >
          {link.url}
        </a>
      )}

      {isEditingTags ? (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1 mb-2">
            {editingTags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 rounded text-xs">
                <Tag size={10} />
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-teal-900">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
              placeholder="Add tag..."
              list="edit-link-tags"
              className={`flex-1 px-2 py-1 text-xs border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'} rounded focus:outline-none focus:ring-1 focus:ring-teal-500`}
            />
            <datalist id="edit-link-tags">
              {allTags.filter(t => !editingTags.includes(t)).map(tag => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
            <button onClick={() => addTag(tagInput)} className="px-2 py-1 bg-teal-600 text-white rounded text-xs hover:bg-teal-700">
              <Plus size={12} />
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={saveTags} className="px-2 py-1 bg-teal-600 text-white rounded text-xs hover:bg-teal-700">
              Save
            </button>
            <button
              onClick={() => {
                setEditingTags(link.tags || []);
                setIsEditingTags(false);
              }}
              className={`px-2 py-1 text-xs rounded ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (link.tags && link.tags.length > 0) ? (
        <div className="flex flex-wrap gap-1 mb-3 group/tags relative">
          {link.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs border border-teal-200">
              <Tag size={10} />
              {tag}
            </span>
          ))}
          <button
            onClick={() => {
              setEditingTags(link.tags || []);
              setIsEditingTags(true);
            }}
            className={`ml-1 px-2 py-0.5 text-xs rounded opacity-0 group-hover/tags:opacity-100 transition-opacity ${darkMode ? 'bg-slate-700 text-teal-400 hover:bg-slate-600' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}
          >
            <Edit2 size={10} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setEditingTags([]);
            setIsEditingTags(true);
          }}
          className={`text-xs ${darkMode ? 'text-slate-500 hover:text-teal-400' : 'text-slate-400 hover:text-teal-600'} mb-3`}
        >
          + Add tags
        </button>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => deleteLink(link.id)}
          className={`${darkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-600'} transition-all hover:scale-110`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// NOTES VIEW - With masonry and drag-drop
function NotesView({
  notes,
  addNote,
  updateNote,
  deleteNote,
  reorderNotes,
  showNewNoteForm,
  setShowNewNoteForm,
  projects,
  links,
  getLinkedItem,
  navigateToLinkedItem,
  highlightedItemId,
  darkMode,
  allTags,
  viewMode,
  toggleViewMode
}) {
  const [filterTag, setFilterTag] = useState('all');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  const noteTags = [...new Set(notes.flatMap(n => n.tags || []))];

  const filteredNotes = filterTag === 'all'
    ? notes
    : notes.filter(note => note.tags && note.tags.includes(filterTag));

  const handleDragStart = (e, note) => {
    setDraggedItem(note);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, note) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== note.id) {
      setDragOverItem(note);
    }
  };

  const handleDrop = (e, targetNote) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetNote.id) return;

    const notesCopy = [...notes];
    const draggedIndex = notesCopy.findIndex(n => n.id === draggedItem.id);
    const targetIndex = notesCopy.findIndex(n => n.id === targetNote.id);

    const [removed] = notesCopy.splice(draggedIndex, 1);
    notesCopy.splice(targetIndex, 0, removed);

    reorderNotes(notesCopy);

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="max-w-7xl animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} accent-font`}>Notes</h2>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>{notes.length} notes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex gap-1 p-1 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <button
              onClick={() => toggleViewMode('notes', 'list')}
              className={`p-2 rounded transition-all ${viewMode === 'list' ? (darkMode ? 'bg-slate-600 shadow' : 'bg-white shadow') : (darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-300')}`}
              title="List view"
            >
              <LayoutList size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
            </button>
            <button
              onClick={() => toggleViewMode('notes', 'grid')}
              className={`p-2 rounded transition-all ${viewMode === 'grid' ? (darkMode ? 'bg-slate-600 shadow' : 'bg-white shadow') : (darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-300')}`}
              title="Grid view"
            >
              <Grid size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
            </button>
          </div>
          <button
            onClick={() => setShowNewNoteForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus size={20} />
            New Note
          </button>
        </div>
      </div>

      {noteTags.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Filter size={18} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
            <button
              onClick={() => setFilterTag('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterTag === 'all'
                  ? 'bg-teal-600 text-white'
                  : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {noteTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterTag === tag
                    ? 'bg-teal-600 text-white'
                    : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Tag size={14} />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {showNewNoteForm && (
        <NewNoteForm
          onSave={addNote}
          onCancel={() => setShowNewNoteForm(false)}
          darkMode={darkMode}
          allTags={allTags}
        />
      )}

      {viewMode === 'grid' ? (
        <div className="masonry mb-8">
          {filteredNotes.map((note, index) => (
            <div key={note.id} className="masonry-item">
              <NoteCard
                note={note}
                updateNote={updateNote}
                deleteNote={deleteNote}
                isHighlighted={highlightedItemId === note.id}
                darkMode={darkMode}
                allTags={allTags}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                isDragging={draggedItem?.id === note.id}
                isDragOver={dragOverItem?.id === note.id}
                style={{ animationDelay: `${index * 0.03}s` }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {filteredNotes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              updateNote={updateNote}
              deleteNote={deleteNote}
              isHighlighted={highlightedItemId === note.id}
              darkMode={darkMode}
              allTags={allTags}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragging={draggedItem?.id === note.id}
              isDragOver={dragOverItem?.id === note.id}
              style={{ animationDelay: `${index * 0.03}s` }}
            />
          ))}
        </div>
      )}

      {filteredNotes.length === 0 && !showNewNoteForm && (
        <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <StickyNote size={48} className="mx-auto mb-4 opacity-30" />
          <p>No notes yet. Create your first note!</p>
        </div>
      )}
    </div>
  );
}

function NewNoteForm({ onSave, onCancel, darkMode, allTags }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({ title, content, tags: selectedTags });
      setTitle('');
      setContent('');
      setSelectedTags([]);
    }
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(t => t !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className={`mb-6 p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-lg border animate-slideUp`}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title..."
        className={`w-full text-lg font-medium mb-3 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
        autoFocus
      />
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Note content..."
        darkMode={darkMode}
        rows={10}
      />

      <div className="mt-4">
        <label className={`block text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-2`}>Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
              <Tag size={12} />
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-teal-900">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder="Add tag and press Enter..."
            list="note-tags"
            className={`flex-1 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
          />
          <datalist id="note-tags">
            {allTags.filter(t => !selectedTags.includes(t)).map(tag => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={() => addTag(tagInput)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all">
          <Save size={16} />
          Save
        </button>
        <button type="button" onClick={onCancel} className={`px-4 py-2 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'} rounded-lg transition-all`}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function NoteCard({ note, updateNote, deleteNote, isHighlighted, darkMode, allTags, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, isDragOver, style }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content || '');
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [editingTags, setEditingTags] = useState(note.tags || []);

  // Post-it note colors (pastel shades)
  const noteColors = [
    'bg-yellow-100 border-yellow-200',
    'bg-pink-100 border-pink-200',
    'bg-blue-100 border-blue-200',
    'bg-green-100 border-green-200',
    'bg-purple-100 border-purple-200',
    'bg-orange-100 border-orange-200',
    'bg-teal-100 border-teal-200',
    'bg-rose-100 border-rose-200'
  ];

  // Get consistent color based on note ID
  const getNoteColor = () => {
    if (darkMode) return 'bg-slate-800 border-slate-700';
    const hash = note.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return noteColors[hash % noteColors.length];
  };

  const saveNote = () => {
    if (editedTitle.trim()) {
      updateNote(note.id, { title: editedTitle, content: editedContent });
    }
    setIsEditing(false);
  };

  const saveTags = () => {
    updateNote(note.id, { tags: editingTags });
    setIsEditingTags(false);
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !editingTags.includes(trimmedTag)) {
      setEditingTags([...editingTags, trimmedTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setEditingTags(editingTags.filter(t => t !== tagToRemove));
  };

  return (
    <div
      id={`item-${note.id}`}
      onDragOver={(e) => onDragOver(e, note)}
      onDrop={(e) => onDrop(e, note)}
      className={`task-card p-6 ${getNoteColor()} rounded-xl shadow-md border animate-slideUp group relative ${
        isHighlighted ? 'animate-highlight ring-2 ring-teal-500' : ''
      } ${isDragging ? 'opacity-50 scale-95' : ''} ${isDragOver ? 'border-teal-500 border-2' : ''}`}
      style={style}
    >
      {/* Hide drag handle when editing */}
      {!isEditing && (
        <div
          draggable
          onDragStart={(e) => onDragStart(e, note)}
          onDragEnd={onDragEnd}
          className={`absolute top-4 right-4 p-2 rounded cursor-move transition-all ${
            darkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-teal-400' : 'text-slate-500 hover:bg-slate-100 hover:text-teal-600'
          }`}
          title="Drag to reorder"
        >
          <Move size={20} />
        </div>
      )}

      {isEditing ? (
        <div>
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className={`w-full text-xl font-semibold mb-3 px-2 py-1 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'} rounded focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
          <RichTextEditor
            value={editedContent}
            onChange={setEditedContent}
            placeholder="Note content..."
            darkMode={darkMode}
            rows={10}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={saveNote}
              className="flex items-center gap-1 px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700"
            >
              <Save size={14} />
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className={`px-3 py-1 text-sm rounded ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between mb-3 pr-10">
            <h3
              onClick={() => setIsEditing(true)}
              className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'} cursor-pointer hover:text-teal-600 transition-colors`}
            >
              {note.title}
            </h3>
            <button
              onClick={() => deleteNote(note.id)}
              className={`${darkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-600'} transition-all hover:scale-110`}
            >
              <Trash2 size={18} />
            </button>
          </div>

          {note.content && (
            <div
              onClick={() => setIsEditing(true)}
              className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} text-sm mb-3 cursor-pointer rich-text-editor`}
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          )}

          {isEditingTags ? (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1 mb-2">
                {editingTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">
                    <Tag size={10} />
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-teal-900">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  placeholder="Add tag..."
                  list="edit-note-tags"
                  className={`flex-1 px-2 py-1 text-xs border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'} rounded focus:outline-none focus:ring-1 focus:ring-teal-500`}
                />
                <datalist id="edit-note-tags">
                  {allTags.filter(t => !editingTags.includes(t)).map(tag => (
                    <option key={tag} value={tag} />
                  ))}
                </datalist>
                <button onClick={() => addTag(tagInput)} className="px-2 py-1 bg-teal-600 text-white rounded text-xs hover:bg-teal-700">
                  <Plus size={12} />
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={saveTags} className="px-2 py-1 bg-teal-600 text-white rounded text-xs hover:bg-teal-700">
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingTags(note.tags || []);
                    setIsEditingTags(false);
                  }}
                  className={`px-2 py-1 text-xs rounded ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (note.tags && note.tags.length > 0) ? (
            <div className="flex flex-wrap gap-1 group/tags relative">
              {note.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs border border-teal-200">
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
              <button
                onClick={() => {
                  setEditingTags(note.tags || []);
                  setIsEditingTags(true);
                }}
                className={`ml-1 px-2 py-1 text-xs rounded opacity-0 group-hover/tags:opacity-100 transition-opacity ${darkMode ? 'bg-slate-700 text-teal-400 hover:bg-slate-600' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}
              >
                <Edit2 size={10} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditingTags([]);
                setIsEditingTags(true);
              }}
              className={`text-xs ${darkMode ? 'text-slate-500 hover:text-teal-400' : 'text-slate-400 hover:text-teal-600'}`}
            >
              + Add tags
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// CALENDAR VIEW - Simple event list for now
// TAGS VIEW - Shows all items with a specific tag
function TagsView({
  projects,
  links,
  notes,
  navigateToLinkedItem,
  darkMode,
  allTags
}) {
  const [selectedTag, setSelectedTag] = useState(allTags[0] || '');
  const [viewMode, setViewMode] = useState('grid');

  const getItemsWithTag = (tag) => {
    const items = [];

    projects.forEach(p => {
      if (p.tags && p.tags.includes(tag)) {
        items.push({ ...p, type: 'project', icon: List });
      }
    });

    links.forEach(l => {
      if (l.tags && l.tags.includes(tag)) {
        items.push({ ...l, type: 'link', icon: Link2 });
      }
    });

    notes.forEach(n => {
      if (n.tags && n.tags.includes(tag)) {
        items.push({ ...n, type: 'note', icon: StickyNote });
      }
    });

    return items;
  };

  const itemsWithTag = selectedTag ? getItemsWithTag(selectedTag) : [];

  return (
    <div className="max-w-7xl animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} accent-font`}>Tags</h2>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>{allTags.length} tags</p>
        </div>
      </div>

      {allTags.length === 0 ? (
        <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <Tag size={48} className="mx-auto mb-4 opacity-30" />
          <p>No tags yet. Add tags to your items to see them here!</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedTag === tag
                      ? 'bg-teal-600 text-white shadow-lg scale-105'
                      : darkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Tag size={16} />
                  <span className="font-medium">{tag}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      selectedTag === tag ? 'bg-white/20' : darkMode ? 'bg-slate-600' : 'bg-slate-200'
                    }`}
                  >
                    {getItemsWithTag(tag).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedTag && (
            <div>
              <h3 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'} mb-6`}>
                Items tagged with "{selectedTag}"
              </h3>

              {itemsWithTag.length === 0 ? (
                <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <p>No items with this tag</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {itemsWithTag.map((item, index) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => navigateToLinkedItem({ id: item.id, type: item.type })}
                      className={`text-left p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border hover:shadow-lg transition-all animate-slideUp hover:scale-105`}
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <item.icon size={20} className="text-teal-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'} mb-1`}>
                            {item.title || item.url}
                          </div>
                          <div className={`text-xs uppercase font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {item.type}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
// Update the main App component render to use all views properly - this replaces the placeholder sections

// This export is already at the top, so we're just making sure everything is connected
