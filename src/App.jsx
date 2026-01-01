import React, { useState, useEffect, useRef } from 'react';
import { Plus, Check, Circle, Pause, AlertCircle, Trash2, Link2, StickyNote, List, ExternalLink, X, Edit2, Save, Calendar, ChevronLeft, ChevronRight, Clock, Copy, Moon, Sun, Tag, ChevronDown, ChevronUp, Bold, Italic, ListOrdered, Grid3x3, LayoutList, User, Camera } from 'lucide-react';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function LifeDashboard() {
  const [activeView, setActiveView] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [events, setEvents] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState({ name: 'User', imageUrl: '' });
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showNewLinkForm, setShowNewLinkForm] = useState(false);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [highlightedItemId, setHighlightedItemId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewModes, setViewModes] = useState({
    tasks: 'list',
    calendar: 'calendar',
    links: 'grid',
    notes: 'grid'
  });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Clear highlight after 3 seconds
  useEffect(() => {
    if (highlightedItemId) {
      const timer = setTimeout(() => {
        setHighlightedItemId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedItemId]);

  // Auto-complete tasks when all subtasks are done
  useEffect(() => {
    tasks.forEach(task => {
      if (task.subtasks && task.subtasks.length > 0 && task.status !== 'completed') {
        const allCompleted = task.subtasks.every(st => st.completed);
        if (allCompleted) {
          updateTask(task.id, { status: 'completed' });
        }
      }
    });
  }, [tasks]);

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('lifeDashboard_tasks');
      const savedLinks = localStorage.getItem('lifeDashboard_links');
      const savedNotes = localStorage.getItem('lifeDashboard_notes');
      const savedEvents = localStorage.getItem('lifeDashboard_events');
      const savedDarkMode = localStorage.getItem('lifeDashboard_darkMode');
      const savedProfile = localStorage.getItem('lifeDashboard_profile');
      const savedViewModes = localStorage.getItem('lifeDashboard_viewModes');
      
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedLinks) setLinks(JSON.parse(savedLinks));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedViewModes) setViewModes(JSON.parse(savedViewModes));
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('lifeDashboard_tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }, [tasks]);

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
      localStorage.setItem('lifeDashboard_events', JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events:', error);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem('lifeDashboard_darkMode', JSON.stringify(darkMode));
    } catch (error) {
      console.error('Error saving dark mode:', error);
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
      console.error('Error saving view modes:', error);
    }
  }, [viewModes]);

  const toggleViewMode = (view, mode) => {
    setViewModes(prev => ({ ...prev, [view]: mode }));
  };

  const addTask = (taskData) => {
    const newTask = {
      id: generateId(),
      ...taskData,
      status: 'new',
      priority: 'medium',
      linkedItems: [],
      subtasks: [],
      tags: taskData.tags || [],
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
    setShowNewTaskForm(false);
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updates } : task));
  };

  const deleteTask = (id) => {
    if (window.confirm('Delete this task?')) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const clearCompletedTasks = () => {
    if (window.confirm('Clear all completed tasks?')) {
      setTasks(tasks.filter(task => task.status !== 'completed'));
    }
  };

  const addLink = (linkData) => {
    const newLink = {
      id: generateId(),
      ...linkData,
      tags: linkData.tags || [],
      createdAt: new Date().toISOString(),
    };
    setLinks([newLink, ...links]);
    setShowNewLinkForm(false);
  };

  const updateLink = (id, updates) => {
    setLinks(links.map(link => link.id === id ? { ...link, ...updates } : link));
  };

  const deleteLink = (id) => {
    if (window.confirm('Delete this link?')) {
      setLinks(links.filter(link => link.id !== id));
      setTasks(tasks.map(task => ({
        ...task,
        linkedItems: task.linkedItems.filter(item => item.id !== id)
      })));
      setEvents(events.map(event => ({
        ...event,
        linkedItems: event.linkedItems?.filter(item => item.id !== id) || []
      })));
    }
  };

  const addNote = (noteData) => {
    const newNote = {
      id: generateId(),
      ...noteData,
      tags: noteData.tags || [],
      createdAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setShowNewNoteForm(false);
  };

  const updateNote = (id, updates) => {
    setNotes(notes.map(note => note.id === id ? { ...note, ...updates } : note));
  };

  const deleteNote = (id) => {
    if (window.confirm('Delete this note?')) {
      setNotes(notes.filter(note => note.id !== id));
      setTasks(tasks.map(task => ({
        ...task,
        linkedItems: task.linkedItems.filter(item => item.id !== id)
      })));
      setEvents(events.map(event => ({
        ...event,
        linkedItems: event.linkedItems?.filter(item => item.id !== id) || []
      })));
    }
  };

  const addEvent = (eventData) => {
    const newEvent = {
      id: generateId(),
      ...eventData,
      linkedItems: [],
      tags: eventData.tags || [],
      createdAt: new Date().toISOString(),
    };
    setEvents([...events, newEvent]);
    setShowNewEventForm(false);
    setSelectedDate(null);
  };

  const updateEvent = (id, updates) => {
    setEvents(events.map(event => event.id === id ? { ...event, ...updates } : event));
  };

  const deleteEvent = (id) => {
    if (window.confirm('Delete this event?')) {
      setEvents(events.filter(event => event.id !== id));
    }
  };

  const toggleLinkToTask = (taskId, item, type) => {
    setTasks(tasks.map(task => {
      if (task.id !== taskId) return task;
      
      const existingIndex = task.linkedItems.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        return {
          ...task,
          linkedItems: task.linkedItems.filter(i => i.id !== item.id)
        };
      } else {
        return {
          ...task,
          linkedItems: [...task.linkedItems, { id: item.id, type, title: item.title || item.url }]
        };
      }
    }));
  };

  const toggleLinkToEvent = (eventId, item, type) => {
    setEvents(events.map(event => {
      if (event.id !== eventId) return event;
      
      const linkedItems = event.linkedItems || [];
      const existingIndex = linkedItems.findIndex(i => i.id === item.id);
      
      if (existingIndex >= 0) {
        return {
          ...event,
          linkedItems: linkedItems.filter(i => i.id !== item.id)
        };
      } else {
        return {
          ...event,
          linkedItems: [...linkedItems, { id: item.id, type, title: item.title || item.url }]
        };
      }
    }));
  };

  const getLinkedItem = (linkedItem) => {
    if (linkedItem.type === 'link') {
      return links.find(l => l.id === linkedItem.id);
    } else if (linkedItem.type === 'note') {
      return notes.find(n => n.id === linkedItem.id);
    } else if (linkedItem.type === 'task') {
      return tasks.find(t => t.id === linkedItem.id);
    }
    return null;
  };

  const navigateToLinkedItem = (linkedItem) => {
    if (linkedItem.type === 'link') {
      setActiveView('links');
      setHighlightedItemId(linkedItem.id);
    } else if (linkedItem.type === 'note') {
      setActiveView('notes');
      setHighlightedItemId(linkedItem.id);
    } else if (linkedItem.type === 'task') {
      setActiveView('tasks');
      setHighlightedItemId(linkedItem.id);
    }

    setTimeout(() => {
      const element = document.getElementById(`item-${linkedItem.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Get all tags from all items
  const allTags = [...new Set([
    ...tasks.flatMap(t => t.tags || []),
    ...events.flatMap(e => e.tags || []),
    ...links.flatMap(l => l.tags || []),
    ...notes.flatMap(n => n.tags || [])
  ])];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-stone-50 to-neutral-100'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Crimson+Text:wght@600;700&display=swap');
        
        * {
          font-family: 'DM Sans', sans-serif;
        }
        
        .accent-font {
          font-family: 'Crimson Text', serif;
        }
        
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

        @keyframes highlight {
          0% { background-color: rgba(20, 184, 166, 0.2); }
          100% { background-color: transparent; }
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
        
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-highlight {
          animation: highlight 2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .task-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.12);
        }
        
        .status-badge {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .status-badge:hover {
          transform: scale(1.05);
        }

        .rich-text-editor {
          min-height: 200px;
        }

        .rich-text-editor ul {
          list-style-type: disc;
          margin-left: 1.5em;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        .rich-text-editor ol {
          list-style-type: decimal;
          margin-left: 1.5em;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        .rich-text-editor li {
          margin-bottom: 0.25em;
        }

        .rich-text-editor strong {
          font-weight: 600;
        }

        .rich-text-editor em {
          font-style: italic;
        }

        .sticky-nav {
          position: sticky;
          top: 0;
          max-height: 100vh;
          overflow-y: auto;
        }

        button, a {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <div className="flex min-h-screen">
        <aside className={`w-72 ${darkMode ? 'bg-gradient-to-b from-slate-950 to-slate-900' : 'bg-gradient-to-b from-slate-900 to-slate-800'} text-white flex flex-col shadow-2xl sticky-nav`}>
          <div className="p-8 pb-6">
            <h1 className="text-3xl font-bold accent-font mb-2 bg-gradient-to-r from-teal-300 to-cyan-200 bg-clip-text text-transparent">
              Life Command
            </h1>
            <p className={`${darkMode ? 'text-slate-500' : 'text-slate-400'} text-sm`}>Your personal dashboard</p>
          </div>
          
          <nav className="px-8 space-y-2 flex-1">
            <NavButton 
              active={activeView === 'tasks'} 
              onClick={() => setActiveView('tasks')}
              icon={<List size={20} />}
              label="Tasks"
              count={tasks.filter(t => t.status !== 'completed').length}
              darkMode={darkMode}
            />
            <NavButton 
              active={activeView === 'calendar'} 
              onClick={() => setActiveView('calendar')}
              icon={<Calendar size={20} />}
              label="Calendar"
              count={events.length}
              darkMode={darkMode}
            />
            <NavButton 
              active={activeView === 'links'} 
              onClick={() => setActiveView('links')}
              icon={<Link2 size={20} />}
              label="Links"
              count={links.length}
              darkMode={darkMode}
            />
            <NavButton 
              active={activeView === 'notes'} 
              onClick={() => setActiveView('notes')}
              icon={<StickyNote size={20} />}
              label="Notes"
              count={notes.length}
              darkMode={darkMode}
            />
            <NavButton 
              active={activeView === 'tags'} 
              onClick={() => setActiveView('tags')}
              icon={<Tag size={20} />}
              label="Tags"
              count={allTags.length}
              darkMode={darkMode}
            />
          </nav>
          
          <div className={`p-8 pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-700'}`}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg mb-4 transition-all ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span className="text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header with Clock and Profile */}
          <div className={`${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-slate-200'} backdrop-blur-sm border-b px-12 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex-1" />
              
              <div className="text-center">
                <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} accent-font`}>
                  {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
                <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              <div className="flex-1 flex justify-end">
                <button
                  onClick={() => setShowProfileEditor(true)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                    darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                  }`}
                >
                  {profile.imageUrl ? (
                    <img src={profile.imageUrl} alt={profile.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <User size={20} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
                    </div>
                  )}
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{profile.name}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-12 overflow-y-auto">
            {activeView === 'tasks' && (
              <TasksView 
                tasks={tasks}
                addTask={addTask}
                updateTask={updateTask}
                deleteTask={deleteTask}
                clearCompletedTasks={clearCompletedTasks}
                showNewTaskForm={showNewTaskForm}
                setShowNewTaskForm={setShowNewTaskForm}
                links={links}
                notes={notes}
                toggleLinkToTask={toggleLinkToTask}
                getLinkedItem={getLinkedItem}
                navigateToLinkedItem={navigateToLinkedItem}
                highlightedItemId={highlightedItemId}
                darkMode={darkMode}
                allTags={allTags}
                viewMode={viewModes.tasks}
                toggleViewMode={toggleViewMode}
              />
            )}
            
            {activeView === 'calendar' && (
              <CalendarView 
                events={events}
                addEvent={addEvent}
                updateEvent={updateEvent}
                deleteEvent={deleteEvent}
                showNewEventForm={showNewEventForm}
                setShowNewEventForm={setShowNewEventForm}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                tasks={tasks}
                links={links}
                notes={notes}
                toggleLinkToEvent={toggleLinkToEvent}
                getLinkedItem={getLinkedItem}
                navigateToLinkedItem={navigateToLinkedItem}
                darkMode={darkMode}
                allTags={allTags}
              />
            )}
            
            {activeView === 'links' && (
              <LinksView 
                links={links}
                addLink={addLink}
                updateLink={updateLink}
                deleteLink={deleteLink}
                showNewLinkForm={showNewLinkForm}
                setShowNewLinkForm={setShowNewLinkForm}
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
                showNewNoteForm={showNewNoteForm}
                setShowNewNoteForm={setShowNewNoteForm}
                highlightedItemId={highlightedItemId}
                darkMode={darkMode}
                allTags={allTags}
                viewMode={viewModes.notes}
                toggleViewMode={toggleViewMode}
              />
            )}

            {activeView === 'tags' && (
              <TagsView
                tasks={tasks}
                events={events}
                links={links}
                notes={notes}
                allTags={allTags}
                navigateToLinkedItem={navigateToLinkedItem}
                darkMode={darkMode}
              />
            )}
          </div>
        </main>
      </div>

      {/* Profile Editor Modal */}
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

function NavButton({ active, onClick, icon, label, count, darkMode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
        active 
          ? 'bg-teal-600 text-white shadow-lg scale-105' 
          : darkMode 
            ? 'text-slate-400 hover:bg-slate-800 hover:text-white hover:scale-102'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:scale-102'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {count > 0 && (
        <span className={`text-xs px-2 py-1 rounded-full transition-all ${
          active ? 'bg-teal-700' : darkMode ? 'bg-slate-700' : 'bg-slate-600'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div 
        className={`relative w-full max-w-md ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-2xl border p-6 animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Edit Profile</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'} transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
              Profile Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={`w-full px-4 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {imageUrl && (
            <div className="flex justify-center">
              <img src={imageUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Save Profile
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'} rounded-lg transition-colors`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Rich Text Editor Component
function RichTextEditor({ value, onChange, placeholder, darkMode, rows = 10 }) {
  const editorRef = useRef(null);

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div className={`border ${darkMode ? 'border-slate-600' : 'border-slate-300'} rounded-lg overflow-hidden`}>
      <div className={`flex gap-1 p-2 border-b ${darkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-slate-50'}`}>
        <button
          type="button"
          onClick={() => applyFormat('bold')}
          className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}
          title="Bold"
        >
          <Bold size={16} className={darkMode ? 'text-slate-300' : 'text-slate-600'} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('italic')}
          className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}
          title="Italic"
        >
          <Italic size={16} className={darkMode ? 'text-slate-300' : 'text-slate-600'} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('insertUnorderedList')}
          className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}
          title="Bullet List"
        >
          <List size={16} className={darkMode ? 'text-slate-300' : 'text-slate-600'} />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('insertOrderedList')}
          className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}
          title="Numbered List"
        >
          <ListOrdered size={16} className={darkMode ? 'text-slate-300' : 'text-slate-600'} />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className={`rich-text-editor p-3 focus:outline-none ${
          darkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'
        }`}
        style={{ minHeight: `${rows * 1.5}em` }}
        data-placeholder={placeholder}
      />
    </div>
  );
}

// Link Items Modal Component
function LinkItemsModal({ isOpen, onClose, items, onToggleLink, linkedItems, darkMode }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { tasks, links, notes } = items;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div 
        className={`relative w-full max-w-2xl max-h-[80vh] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-2xl border overflow-hidden animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'} flex items-center justify-between sticky top-0 ${darkMode ? 'bg-slate-800' : 'bg-white'} z-10`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Link Items</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
          {tasks && tasks.length > 0 && (
            <div className="mb-6">
              <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-3 flex items-center gap-2`}>
                <List size={16} />
                Tasks
              </h4>
              <div className="space-y-2">
                {tasks.map(task => {
                  const isLinked = linkedItems?.some(i => i.id === task.id);
                  return (
                    <button
                      key={task.id}
                      onClick={() => onToggleLink(task, 'task')}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        isLinked 
                          ? 'bg-teal-50 border-teal-200 text-teal-900 scale-[0.98]'
                          : darkMode 
                            ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:scale-[0.98]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:scale-[0.98]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isLinked ? 'border-teal-600 bg-teal-600 scale-110' : darkMode ? 'border-slate-500' : 'border-slate-300'
                        }`}>
                          {isLinked && <Check size={14} className="text-white" />}
                        </div>
                        <span className="font-medium">{task.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {links && links.length > 0 && (
            <div className="mb-6">
              <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-3 flex items-center gap-2`}>
                <Link2 size={16} />
                Links
              </h4>
              <div className="space-y-2">
                {links.map(link => {
                  const isLinked = linkedItems?.some(i => i.id === link.id);
                  return (
                    <button
                      key={link.id}
                      onClick={() => onToggleLink(link, 'link')}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        isLinked 
                          ? 'bg-teal-50 border-teal-200 text-teal-900 scale-[0.98]'
                          : darkMode 
                            ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:scale-[0.98]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:scale-[0.98]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isLinked ? 'border-teal-600 bg-teal-600 scale-110' : darkMode ? 'border-slate-500' : 'border-slate-300'
                        }`}>
                          {isLinked && <Check size={14} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{link.title || link.url}</div>
                          {link.title && <div className="text-xs opacity-60 truncate">{link.url}</div>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {notes && notes.length > 0 && (
            <div>
              <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-3 flex items-center gap-2`}>
                <StickyNote size={16} />
                Notes
              </h4>
              <div className="space-y-2">
                {notes.map(note => {
                  const isLinked = linkedItems?.some(i => i.id === note.id);
                  return (
                    <button
                      key={note.id}
                      onClick={() => onToggleLink(note, 'note')}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        isLinked 
                          ? 'bg-teal-50 border-teal-200 text-teal-900 scale-[0.98]'
                          : darkMode 
                            ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:scale-[0.98]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:scale-[0.98]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isLinked ? 'border-teal-600 bg-teal-600 scale-110' : darkMode ? 'border-slate-500' : 'border-slate-300'
                        }`}>
                          {isLinked && <Check size={14} className="text-white" />}
                        </div>
                        <span className="font-medium">{note.title || 'Untitled Note'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tasks?.length === 0 && links?.length === 0 && notes?.length === 0 && (
            <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <StickyNote size={48} className="mx-auto mb-4 opacity-30" />
              <p>No items available to link yet.</p>
              <p className="text-sm mt-2">Create some tasks, links, or notes first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// Tags View - New unified tag browser
function TagsView({ tasks, events, links, notes, allTags, navigateToLinkedItem, darkMode }) {
  const [selectedTag, setSelectedTag] = useState('all');

  const getItemsByTag = (tag) => {
    if (tag === 'all') {
      return {
        tasks: tasks.filter(t => t.tags && t.tags.length > 0),
        events: events.filter(e => e.tags && e.tags.length > 0),
        links: links.filter(l => l.tags && l.tags.length > 0),
        notes: notes.filter(n => n.tags && n.tags.length > 0)
      };
    }
    
    return {
      tasks: tasks.filter(t => t.tags && t.tags.includes(tag)),
      events: events.filter(e => e.tags && e.tags.includes(tag)),
      links: links.filter(l => l.tags && l.tags.includes(tag)),
      notes: notes.filter(n => n.tags && n.tags.includes(tag))
    };
  };

  const itemsByTag = getItemsByTag(selectedTag);
  const totalItems = itemsByTag.tasks.length + itemsByTag.events.length + itemsByTag.links.length + itemsByTag.notes.length;

  return (
    <div className="max-w-6xl animate-fadeIn">
      <div className="mb-8">
        <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} accent-font mb-2`}>Tags</h2>
        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{allTags.length} tags • {totalItems} items</p>
      </div>

      {allTags.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTag === 'all' 
                  ? 'bg-teal-600 text-white scale-105' 
                  : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Tags
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTag === tag 
                    ? 'bg-teal-600 text-white scale-105' 
                    : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Tag size={14} />
                {tag}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {itemsByTag.tasks.length > 0 && (
              <div>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'} mb-4 flex items-center gap-2`}>
                  <List size={20} />
                  Tasks ({itemsByTag.tasks.length})
                </h3>
                <div className="space-y-3">
                  {itemsByTag.tasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => navigateToLinkedItem({ id: task.id, type: 'task' })}
                      className={`w-full text-left p-4 rounded-lg border transition-all hover:scale-[0.99] ${
                        darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{task.title}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            {task.tags.map(t => (
                              <span key={t} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">
                                <Tag size={10} />
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ExternalLink size={16} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {itemsByTag.events.length > 0 && (
              <div>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'} mb-4 flex items-center gap-2`}>
                  <Calendar size={20} />
                  Events ({itemsByTag.events.length})
                </h3>
                <div className="space-y-3">
                  {itemsByTag.events.map(event => (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                      }`}
                    >
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{event.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        {event.tags.map(t => (
                          <span key={t} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">
                            <Tag size={10} />
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {itemsByTag.links.length > 0 && (
              <div>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'} mb-4 flex items-center gap-2`}>
                  <Link2 size={20} />
                  Links ({itemsByTag.links.length})
                </h3>
                <div className="space-y-3">
                  {itemsByTag.links.map(link => (
                    <button
                      key={link.id}
                      onClick={() => navigateToLinkedItem({ id: link.id, type: 'link' })}
                      className={`w-full text-left p-4 rounded-lg border transition-all hover:scale-[0.99] ${
                        darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{link.title || link.url}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            {link.tags.map(t => (
                              <span key={t} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">
                                <Tag size={10} />
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ExternalLink size={16} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {itemsByTag.notes.length > 0 && (
              <div>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'} mb-4 flex items-center gap-2`}>
                  <StickyNote size={20} />
                  Notes ({itemsByTag.notes.length})
                </h3>
                <div className="space-y-3">
                  {itemsByTag.notes.map(note => (
                    <button
                      key={note.id}
                      onClick={() => navigateToLinkedItem({ id: note.id, type: 'note' })}
                      className={`w-full text-left p-4 rounded-lg border transition-all hover:scale-[0.99] ${
                        darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{note.title || 'Untitled Note'}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            {note.tags.map(t => (
                              <span key={t} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">
                                <Tag size={10} />
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ExternalLink size={16} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {totalItems === 0 && (
              <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <Tag size={48} className="mx-auto mb-4 opacity-30" />
                <p>No items with this tag yet.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <Tag size={48} className="mx-auto mb-4 opacity-30" />
          <p>No tags yet. Add tags to your tasks, events, links, and notes!</p>
        </div>
      )}
    </div>
  );
}


// Tasks View with sorting and drag-drop
function TasksView({ 
  tasks, 
  addTask, 
  updateTask, 
  deleteTask, 
  clearCompletedTasks,
  showNewTaskForm,
  setShowNewTaskForm,
  links,
  notes,
  toggleLinkToTask,
  getLinkedItem,
  navigateToLinkedItem,
  highlightedItemId,
  darkMode,
  allTags,
  viewMode,
  toggleViewMode
}) {
  const [sortBy, setSortBy] = useState('manual');
  const [filterTag, setFilterTag] = useState('all');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingTaskId, setLinkingTaskId] = useState(null);

  const openLinkModal = (taskId) => {
    setLinkingTaskId(taskId);
    setShowLinkModal(true);
  };

  const handleToggleLink = (item, type) => {
    if (linkingTaskId) {
      toggleLinkToTask(linkingTaskId, item, type);
    }
  };

  const currentTask = tasks.find(t => t.id === linkingTaskId);

  // Filter by tag
  let filteredTasks = filterTag === 'all' ? activeTasks : activeTasks.filter(t => t.tags && t.tags.includes(filterTag));
  
  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch(sortBy) {
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'status':
        const statusOrder = { stuck: 0, paused: 1, working: 2, new: 3, completed: 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const handleDragStart = (e, task) => {
    setDraggedItem(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, task) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== task.id) {
      setDragOverItem(task);
    }
  };

  const handleDrop = (e, targetTask) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetTask.id) return;

    const allTasksCopy = [...tasks];
    const draggedIndex = allTasksCopy.findIndex(t => t.id === draggedItem.id);
    const targetIndex = allTasksCopy.findIndex(t => t.id === targetTask.id);

    // Remove dragged item
    const [removed] = allTasksCopy.splice(draggedIndex, 1);
    // Insert at new position
    allTasksCopy.splice(targetIndex, 0, removed);

    // Update all tasks with new order
    allTasksCopy.forEach((task, index) => {
      updateTask(task.id, { ...task });
    });

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const taskTags = [...new Set(tasks.flatMap(t => t.tags || []))];

  return (
    <div className="max-w-6xl animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} accent-font`}>Tasks</h2>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>{activeTasks.length} active • {completedTasks.length} completed</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
            <button
              onClick={() => toggleViewMode('tasks', 'list')}
              className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : 'hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              title="List view"
            >
              <LayoutList size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
            </button>
            <button
              onClick={() => toggleViewMode('tasks', 'grid')}
              className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : 'hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              title="Grid view"
            >
              <Grid3x3 size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
            </button>
          </div>
          <button
            onClick={() => setShowNewTaskForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`px-4 py-2 rounded-lg border transition-all ${
            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
          }`}
        >
          <option value="manual">Manual Order (Drag & Drop)</option>
          <option value="priority">Sort by Priority</option>
          <option value="status">Sort by Status</option>
          <option value="date">Sort by Date</option>
        </select>

        {taskTags.length > 0 && (
          <>
            <div className={`w-px h-8 ${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
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
            {taskTags.map(tag => (
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
          </>
        )}
      </div>

      {showNewTaskForm && (
        <NewTaskForm 
          onSave={addTask} 
          onCancel={() => setShowNewTaskForm(false)}
          darkMode={darkMode}
          allTags={allTags}
        />
      )}

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-8' : 'space-y-4 mb-8'}>
        {sortedTasks.map((task, index) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            updateTask={updateTask}
            deleteTask={deleteTask}
            getLinkedItem={getLinkedItem}
            navigateToLinkedItem={navigateToLinkedItem}
            onOpenLinkModal={() => openLinkModal(task.id)}
            isHighlighted={highlightedItemId === task.id}
            darkMode={darkMode}
            allTags={allTags}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            isDragging={draggedItem?.id === task.id}
            isDragOver={dragOverItem?.id === task.id}
            isDraggable={sortBy === 'manual'}
            style={{ animationDelay: `${index * 0.03}s` }}
          />
        ))}
      </div>

      {sortedTasks.length === 0 && !showNewTaskForm && (
        <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <List size={48} className="mx-auto mb-4 opacity-30" />
          <p>No active tasks. Click "New Task" to get started!</p>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className={`mt-12 pt-8 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Completed</h3>
            <button
              onClick={clearCompletedTasks}
              className={`text-sm ${darkMode ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-600'} transition-colors`}
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2 opacity-60">
            {completedTasks.map(task => (
              <div key={task.id} className={`p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border`}>
                <div className="flex items-center gap-3">
                  <Check className="text-green-600" size={20} />
                  <span className={`line-through ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{task.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <LinkItemsModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        items={{ tasks: null, links, notes }}
        onToggleLink={handleToggleLink}
        linkedItems={currentTask?.linkedItems || []}
        darkMode={darkMode}
      />
    </div>
  );
}

function NewTaskForm({ onSave, onCancel, darkMode, allTags }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({ title, description, tags: selectedTags });
      setTitle('');
      setDescription('');
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
        placeholder="Task title..."
        className={`w-full text-lg font-medium mb-3 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
        autoFocus
      />
      <RichTextEditor
        value={description}
        onChange={setDescription}
        placeholder="Description (optional) - Use toolbar for formatting"
        darkMode={darkMode}
        rows={6}
      />
      
      {/* Tags */}
      <div className="mt-4">
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

      <div className="flex gap-2 mt-4">
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

function TaskCard({ 
  task, 
  updateTask, 
  deleteTask, 
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
  isDraggable,
  style 
}) {
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [newSubtask, setNewSubtask] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskText, setEditingSubtaskText] = useState('');
  const descriptionRef = useRef(null);

  const statusConfig = {
    new: { label: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Circle },
    working: { label: 'Working on it', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Circle },
    paused: { label: 'Paused', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Pause },
    stuck: { label: 'Stuck', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200', icon: Check },
  };

  const priorityConfig = {
    urgent: { label: 'Urgent', color: 'bg-red-500 text-white' },
    high: { label: 'High', color: 'bg-orange-500 text-white' },
    medium: { label: 'Medium', color: 'bg-yellow-500 text-white' },
    low: { label: 'Low', color: 'bg-slate-400 text-white' },
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const subtasks = task.subtasks || [];
      updateTask(task.id, {
        subtasks: [...subtasks, { id: generateId(), text: newSubtask, completed: false }]
      });
      setNewSubtask('');
    }
  };

  const toggleSubtask = (subtaskId) => {
    const subtasks = task.subtasks || [];
    updateTask(task.id, {
      subtasks: subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    });
  };

  const deleteSubtask = (subtaskId) => {
    const subtasks = task.subtasks || [];
    updateTask(task.id, {
      subtasks: subtasks.filter(st => st.id !== subtaskId)
    });
  };

  const startEditingSubtask = (subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskText(subtask.text);
  };

  const saveSubtaskEdit = () => {
    if (editingSubtaskText.trim()) {
      const subtasks = task.subtasks || [];
      updateTask(task.id, {
        subtasks: subtasks.map(st =>
          st.id === editingSubtaskId ? { ...st, text: editingSubtaskText } : st
        )
      });
    }
    setEditingSubtaskId(null);
    setEditingSubtaskText('');
  };

  const copySubtask = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  return (
    <div 
      id={`item-${task.id}`}
      draggable={isDraggable}
      onDragStart={(e) => onDragStart(e, task)}
      onDragOver={(e) => onDragOver(e, task)}
      onDrop={(e) => onDrop(e, task)}
      onDragEnd={onDragEnd}
      className={`task-card p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-md border animate-slideUp ${
        isHighlighted ? 'animate-highlight ring-2 ring-teal-500' : ''
      } ${isDragging ? 'opacity-50 scale-95' : ''} ${isDragOver ? 'border-teal-500 border-2' : ''} ${isDraggable ? 'cursor-move' : ''}`} 
      style={style}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'} mb-2`}>{task.title}</h3>
          {task.description && (
            <div 
              ref={descriptionRef}
              className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} text-sm mb-3 rich-text-editor`}
              dangerouslySetInnerHTML={{ __html: task.description }}
              style={{ 
                maxHeight: 'none',
                overflow: 'visible'
              }}
            />
          )}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs border border-teal-200">
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => deleteTask(task.id)}
          className={`${darkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-600'} transition-all ml-4 hover:scale-110`}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex gap-1 flex-wrap">
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => updateTask(task.id, { status: key })}
              className={`status-badge px-3 py-1 rounded-full text-xs font-medium border ${
                task.status === key ? config.color : darkMode ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Priority:</span>
        <div className="flex gap-1">
          {Object.entries(priorityConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => updateTask(task.id, { priority: key })}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                task.priority === key ? config.color + ' scale-105' : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`mb-4 pb-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
        <button
          onClick={() => setShowSubtasks(!showSubtasks)}
          className={`flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2 transition-all hover:text-teal-600`}
        >
          {showSubtasks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          Subtasks {task.subtasks && task.subtasks.length > 0 && `(${task.subtasks.filter(st => st.completed).length}/${task.subtasks.length})`}
        </button>
        
        {showSubtasks && (
          <div className="space-y-2">
            {task.subtasks && task.subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center gap-2 group">
                <button
                  onClick={() => toggleSubtask(subtask.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    subtask.completed 
                      ? 'bg-teal-600 border-teal-600 scale-110' 
                      : darkMode ? 'border-slate-600 hover:border-teal-500' : 'border-slate-300 hover:border-teal-500'
                  }`}
                >
                  {subtask.completed && <Check size={12} className="text-white" />}
                </button>
                
                {editingSubtaskId === subtask.id ? (
                  <input
                    type="text"
                    value={editingSubtaskText}
                    onChange={(e) => setEditingSubtaskText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && saveSubtaskEdit()}
                    onBlur={saveSubtaskEdit}
                    className={`flex-1 px-2 py-1 text-sm border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded focus:outline-none focus:ring-1 focus:ring-teal-500`}
                    autoFocus
                  />
                ) : (
                  <span 
                    onClick={() => startEditingSubtask(subtask)}
                    className={`flex-1 text-sm cursor-pointer ${
                      subtask.completed 
                        ? darkMode ? 'line-through text-slate-500' : 'line-through text-slate-400'
                        : darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    {subtask.text}
                  </span>
                )}
                
                <button
                  onClick={() => copySubtask(subtask.text)}
                  className={`opacity-0 group-hover:opacity-100 transition-all ${darkMode ? 'text-slate-500 hover:text-teal-400' : 'text-slate-400 hover:text-teal-600'}`}
                  title="Copy subtask"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={() => deleteSubtask(subtask.id)}
                  className={`opacity-0 group-hover:opacity-100 transition-all ${darkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-600'}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                placeholder="Add subtask..."
                className={`flex-1 px-2 py-1 text-sm border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'border-slate-300'} rounded focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all`}
              />
              <button
                onClick={addSubtask}
                className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 transition-all hover:scale-105"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {task.linkedItems && task.linkedItems.length > 0 && (
        <div className={`mb-3 pt-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex flex-wrap gap-2">
            {task.linkedItems.map(linkedItem => {
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


// Calendar View (unchanged from v4, adding tags support)
function CalendarView({ 
  events, 
  addEvent, 
  updateEvent, 
  deleteEvent,
  showNewEventForm,
  setShowNewEventForm,
  selectedDate,
  setSelectedDate,
  tasks,
  links,
  notes,
  toggleLinkToEvent,
  getLinkedItem,
  navigateToLinkedItem,
  darkMode,
  allTags
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingEventId, setLinkingEventId] = useState(null);
  
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
  
  const days = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDateStr = event.date;
      const checkDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return eventDateStr === checkDateStr;
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowNewEventForm(true);
  };

  const openLinkModal = (eventId) => {
    setLinkingEventId(eventId);
    setShowLinkModal(true);
  };

  const handleToggleLink = (item, type) => {
    if (linkingEventId) {
      toggleLinkToEvent(linkingEventId, item, type);
    }
  };

  const currentEvent = events.find(e => e.id === linkingEventId);

  return (
    <div className="max-w-7xl animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} accent-font`}>Calendar</h2>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>{events.length} events scheduled</p>
        </div>
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setShowNewEventForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus size={20} />
          New Event
        </button>
      </div>

      {showNewEventForm && (
        <NewEventForm 
          onSave={addEvent} 
          onCancel={() => {
            setShowNewEventForm(false);
            setSelectedDate(null);
          }}
          initialDate={selectedDate}
          darkMode={darkMode}
          allTags={allTags}
        />
      )}

      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-lg border p-6 mb-6 transition-all`}>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className={`p-2 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} rounded-lg transition-all hover:scale-110`}
          >
            <ChevronLeft size={24} className={darkMode ? 'text-white' : ''} />
          </button>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={nextMonth}
            className={`p-2 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} rounded-lg transition-all hover:scale-110`}
          >
            <ChevronRight size={24} className={darkMode ? 'text-white' : ''} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className={`text-center font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'} text-sm py-2`}>
              {day}
            </div>
          ))}
          
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const dayEvents = getEventsForDate(day);
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all hover:scale-105 ${
                  darkMode 
                    ? isCurrentMonth ? 'bg-slate-700 border-slate-600' : 'bg-slate-800 border-slate-700'
                    : isCurrentMonth ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'
                } ${isToday ? 'ring-2 ring-teal-500' : ''} hover:border-teal-300 hover:shadow-md`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-teal-600 font-bold' : 
                  darkMode ? (isCurrentMonth ? 'text-slate-200' : 'text-slate-500') :
                  (isCurrentMonth ? 'text-slate-700' : 'text-slate-400')
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded transition-all ${
                        event.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                        event.color === 'green' ? 'bg-green-100 text-green-700' :
                        event.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                        event.color === 'red' ? 'bg-red-100 text-red-700' :
                        'bg-teal-100 text-teal-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.startTime && (
                        <div className="text-xs opacity-75">{event.startTime}</div>
                      )}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} px-2`}>
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>All Events</h3>
        {events
          .sort((a, b) => {
            if (a.date < b.date) return -1;
            if (a.date > b.date) return 1;
            if (a.startTime && b.startTime) {
              return a.startTime.localeCompare(b.startTime);
            }
            return 0;
          })
          .map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              updateEvent={updateEvent}
              deleteEvent={deleteEvent}
              getLinkedItem={getLinkedItem}
              navigateToLinkedItem={navigateToLinkedItem}
              onOpenLinkModal={() => openLinkModal(event.id)}
              darkMode={darkMode}
              allTags={allTags}
              style={{ animationDelay: `${index * 0.03}s` }}
            />
          ))}
        {events.length === 0 && (
          <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <Calendar size={48} className="mx-auto mb-4 opacity-30" />
            <p>No events yet. Click a date to add one!</p>
          </div>
        )}
      </div>

      <LinkItemsModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        items={{ tasks, links, notes }}
        onToggleLink={handleToggleLink}
        linkedItems={currentEvent?.linkedItems || []}
        darkMode={darkMode}
      />
    </div>
  );
}

function NewEventForm({ onSave, onCancel, initialDate, darkMode, allTags }) {
  const [title, setTitle] = useState('');
  const formatDateForInput = (date) => {
    if (!date) date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [date, setDate] = useState(formatDateForInput(initialDate));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('teal');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const colors = {
    teal: 'bg-teal-100 border-teal-300',
    blue: 'bg-blue-100 border-blue-300',
    green: 'bg-green-100 border-green-300',
    purple: 'bg-purple-100 border-purple-300',
    red: 'bg-red-100 border-red-300',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && date) {
      onSave({ title, date, startTime, endTime, description, color, tags: selectedTags });
      setTitle('');
      setDate(formatDateForInput(new Date()));
      setStartTime('09:00');
      setEndTime('10:00');
      setDescription('');
      setColor('teal');
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
        placeholder="Event title..."
        className={`w-full text-lg font-medium mb-3 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
        autoFocus
      />
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={`block text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-1`}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
          />
        </div>
        <div>
          <label className={`block text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-1`}>Color</label>
          <div className="flex gap-2 pt-2">
            {Object.entries(colors).map(([colorName, colorClass]) => (
              <button
                key={colorName}
                type="button"
                onClick={() => setColor(colorName)}
                className={`w-8 h-8 rounded-full border-2 ${colorClass} transition-all ${
                  color === colorName ? 'ring-2 ring-teal-500 ring-offset-2 scale-110' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={`block text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-1`}>Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
          />
        </div>
        <div>
          <label className={`block text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-1`}>End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
          />
        </div>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none transition-all`}
        rows={3}
      />

      {/* Tags */}
      <div className="mt-4">
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
            list="event-tags"
            className={`flex-1 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
          />
          <datalist id="event-tags">
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
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
        >
          <Save size={16} />
          Save Event
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

function EventCard({ event, updateEvent, deleteEvent, getLinkedItem, navigateToLinkedItem, onOpenLinkModal, darkMode, allTags, style }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);

  const formatDisplayDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSave = () => {
    updateEvent(event.id, editedEvent);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-md border animate-slideUp`} style={style}>
        <input
          type="text"
          value={editedEvent.title}
          onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
          placeholder="Event title"
          className={`w-full mb-3 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium transition-all`}
        />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className={`block text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-1`}>Date</label>
            <input
              type="date"
              value={editedEvent.date}
              onChange={(e) => setEditedEvent({ ...editedEvent, date: e.target.value })}
              className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
            />
          </div>
          <div>
            <label className={`block text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-1`}>Start Time</label>
            <input
              type="time"
              value={editedEvent.startTime || '09:00'}
              onChange={(e) => setEditedEvent({ ...editedEvent, startTime: e.target.value })}
              className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
            />
          </div>
        </div>
        <div className="mb-3">
          <label className={`block text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-1`}>End Time</label>
          <input
            type="time"
            value={editedEvent.endTime || '10:00'}
            onChange={(e) => setEditedEvent({ ...editedEvent, endTime: e.target.value })}
            className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
          />
        </div>
        <textarea
          value={editedEvent.description || ''}
          onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
          placeholder="Description"
          className={`w-full mb-3 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none transition-all`}
          rows={3}
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm transition-all"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className={`px-3 py-1.5 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'} rounded-lg text-sm transition-all`}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-card p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-md border animate-slideUp`} style={style}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
            event.color === 'blue' ? 'bg-blue-100 text-blue-700' :
            event.color === 'green' ? 'bg-green-100 text-green-700' :
            event.color === 'purple' ? 'bg-purple-100 text-purple-700' :
            event.color === 'red' ? 'bg-red-100 text-red-700' :
            'bg-teal-100 text-teal-700'
          }`}>
            {formatDisplayDate(event.date)}
          </div>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'} mb-2`}>{event.title}</h3>
          {(event.startTime || event.endTime) && (
            <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'} text-sm mb-2`}>
              <Clock size={16} />
              <span>{event.startTime} - {event.endTime}</span>
            </div>
          )}
          {event.description && (
            <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} text-sm mb-3`}>{event.description}</p>
          )}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {event.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs border border-teal-200">
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setIsEditing(true)}
            className={`${darkMode ? 'text-slate-500 hover:text-teal-400' : 'text-slate-400 hover:text-teal-600'} transition-all hover:scale-110`}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => deleteEvent(event.id)}
            className={`${darkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-600'} transition-all hover:scale-110`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {event.linkedItems && event.linkedItems.length > 0 && (
        <div className={`mb-3 pt-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex flex-wrap gap-2">
            {event.linkedItems.map(linkedItem => {
              const item = getLinkedItem(linkedItem);
              if (!item) return null;
              
              return (
                <button
                  key={linkedItem.id}
                  onClick={() => navigateToLinkedItem(linkedItem)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm border border-teal-200 hover:bg-teal-100 transition-all hover:scale-105"
                >
                  {linkedItem.type === 'link' ? <Link2 size={14} /> : 
                   linkedItem.type === 'note' ? <StickyNote size={14} /> : 
                   <List size={14} />}
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

// Note: Links and Notes views would be added here following the same pattern
// Due to file size, this is provided as the core framework
// The pattern is: View component → Form component → Card component with drag-drop
// All following the same structure as TasksView above

// For the complete working version, the full file is available in the tar.gz package

// Links View with drag-drop and grid/list toggle
function LinksView({ links, addLink, updateLink, deleteLink, showNewLinkForm, setShowNewLinkForm, highlightedItemId, darkMode, allTags, viewMode, toggleViewMode }) {
  const [filterTag, setFilterTag] = useState('all');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  
  const categories = [...new Set(links.map(l => l.category).filter(Boolean))];
  const linkTags = [...new Set(links.flatMap(l => l.tags || []))];

  const filteredLinks = filterTag === 'all' 
    ? links 
    : links.filter(l => l.tags && l.tags.includes(filterTag));

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

    const allLinksCopy = [...links];
    const draggedIndex = allLinksCopy.findIndex(l => l.id === draggedItem.id);
    const targetIndex = allLinksCopy.findIndex(l => l.id === targetLink.id);

    const [removed] = allLinksCopy.splice(draggedIndex, 1);
    allLinksCopy.splice(targetIndex, 0, removed);

    allLinksCopy.forEach((link) => {
      updateLink(link.id, { ...link });
    });

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="max-w-6xl animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} accent-font`}>Links</h2>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>{links.length} saved</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
            <button
              onClick={() => toggleViewMode('links', 'list')}
              className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : 'hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              title="List view"
            >
              <LayoutList size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
            </button>
            <button
              onClick={() => toggleViewMode('links', 'grid')}
              className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : 'hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              title="Grid view"
            >
              <Grid3x3 size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
            </button>
          </div>
          <button
            onClick={() => setShowNewLinkForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus size={20} />
            New Link
          </button>
        </div>
      </div>

      {showNewLinkForm && (
        <NewLinkForm 
          onSave={addLink} 
          onCancel={() => setShowNewLinkForm(false)}
          existingCategories={categories}
          darkMode={darkMode}
          allTags={allTags}
        />
      )}

      {linkTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
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
      )}

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
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
          <p>No links yet. Start adding your inspirations!</p>
        </div>
      )}
    </div>
  );
}

function NewLinkForm({ onSave, onCancel, existingCategories, darkMode, allTags }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      let finalUrl = url.trim();
      if (!finalUrl.match(/^https?:\/\//i)) {
        finalUrl = 'https://' + finalUrl;
      }
      onSave({ url: finalUrl, title, category, description, tags: selectedTags });
      setUrl('');
      setTitle('');
      setCategory('');
      setDescription('');
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
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="example.com or https://example.com"
        className={`w-full text-lg font-medium mb-3 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
        autoFocus
      />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className={`w-full mb-3 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
      />
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category (optional)"
        list="categories"
        className={`w-full mb-3 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
      />
      <datalist id="categories">
        {existingCategories.map(cat => (
          <option key={cat} value={cat} />
        ))}
      </datalist>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none transition-all`}
        rows={2}
      />

      <div className="mt-4">
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

function LinkCard({ link, updateLink, deleteLink, isHighlighted, darkMode, allTags, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, isDragOver, style }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLink, setEditedLink] = useState(link);

  const handleSave = () => {
    let finalUrl = editedLink.url.trim();
    if (!finalUrl.match(/^https?:\/\//i)) {
      finalUrl = 'https://' + finalUrl;
    }
    updateLink(link.id, { ...editedLink, url: finalUrl });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-md border animate-slideUp`} style={style}>
        <input
          type="text"
          value={editedLink.url}
          onChange={(e) => setEditedLink({ ...editedLink, url: e.target.value })}
          className={`w-full mb-2 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
        />
        <input
          type="text"
          value={editedLink.title || ''}
          onChange={(e) => setEditedLink({ ...editedLink, title: e.target.value })}
          placeholder="Title"
          className={`w-full mb-2 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
        />
        <input
          type="text"
          value={editedLink.category || ''}
          onChange={(e) => setEditedLink({ ...editedLink, category: e.target.value })}
          placeholder="Category"
          className={`w-full mb-2 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm transition-all"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className={`px-3 py-1.5 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'} rounded-lg text-sm transition-all`}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`item-${link.id}`}
      draggable
      onDragStart={(e) => onDragStart(e, link)}
      onDragOver={(e) => onDragOver(e, link)}
      onDrop={(e) => onDrop(e, link)}
      onDragEnd={onDragEnd}
      className={`task-card p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-md border animate-slideUp cursor-move ${
        isHighlighted ? 'animate-highlight ring-2 ring-teal-500' : ''
      } ${isDragging ? 'opacity-50 scale-95' : ''} ${isDragOver ? 'border-teal-500 border-2' : ''}`} 
      style={style}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {link.title && (
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'} mb-1`}>{link.title}</h3>
          )}
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-700 text-sm flex items-center gap-1 break-all transition-all hover:scale-105"
          >
            {link.url}
            <ExternalLink size={14} />
          </a>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setIsEditing(true)}
            className={`${darkMode ? 'text-slate-500 hover:text-teal-400' : 'text-slate-400 hover:text-teal-600'} transition-all hover:scale-110`}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => deleteLink(link.id)}
            className={`${darkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-600'} transition-all hover:scale-110`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {link.description && (
        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-3`}>{link.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2">
        {link.category && (
          <span className={`inline-block px-3 py-1 ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} rounded-full text-xs font-medium`}>
            {link.category}
          </span>
        )}
        {link.tags && link.tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs border border-teal-200">
            <Tag size={10} />
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}


// Notes View with drag-drop and grid/list toggle
function NotesView({ notes, addNote, updateNote, deleteNote, showNewNoteForm, setShowNewNoteForm, highlightedItemId, darkMode, allTags, viewMode, toggleViewMode }) {
  const [sortBy, setSortBy] = useState('date');
  const [filterTag, setFilterTag] = useState('all');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  
  const noteTags = [...new Set(notes.flatMap(n => n.tags || []))];
  
  const filteredNotes = filterTag === 'all' 
    ? notes 
    : notes.filter(n => n.tags && n.tags.includes(filterTag));

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

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

    const allNotesCopy = [...notes];
    const draggedIndex = allNotesCopy.findIndex(n => n.id === draggedItem.id);
    const targetIndex = allNotesCopy.findIndex(n => n.id === targetNote.id);

    const [removed] = allNotesCopy.splice(draggedIndex, 1);
    allNotesCopy.splice(targetIndex, 0, removed);

    allNotesCopy.forEach((note) => {
      updateNote(note.id, { ...note });
    });

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="max-w-6xl animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} accent-font`}>Notes</h2>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>{notes.length} notes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
            <button
              onClick={() => toggleViewMode('notes', 'list')}
              className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : 'hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              title="List view"
            >
              <LayoutList size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
            </button>
            <button
              onClick={() => toggleViewMode('notes', 'grid')}
              className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : 'hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              title="Grid view"
            >
              <Grid3x3 size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
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

      {showNewNoteForm && (
        <NewNoteForm 
          onSave={addNote} 
          onCancel={() => setShowNewNoteForm(false)}
          darkMode={darkMode}
          existingTags={allTags}
        />
      )}

      {noteTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
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
      )}

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {sortedNotes.map((note, index) => (
          <NoteCard 
            key={note.id} 
            note={note} 
            updateNote={updateNote}
            deleteNote={deleteNote}
            isHighlighted={highlightedItemId === note.id}
            darkMode={darkMode}
            existingTags={allTags}
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

      {sortedNotes.length === 0 && !showNewNoteForm && (
        <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <StickyNote size={48} className="mx-auto mb-4 opacity-30" />
          <p>No notes yet. Capture your thoughts!</p>
        </div>
      )}
    </div>
  );
}

function NewNoteForm({ onSave, onCancel, darkMode, existingTags }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('yellow');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const colors = {
    yellow: 'bg-yellow-100 border-yellow-300',
    blue: 'bg-blue-100 border-blue-300',
    green: 'bg-green-100 border-green-300',
    pink: 'bg-pink-100 border-pink-300',
    purple: 'bg-purple-100 border-purple-300',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() || content.trim()) {
      onSave({ title, content, color, tags: selectedTags });
      setTitle('');
      setContent('');
      setColor('yellow');
      setTagInput('');
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
        placeholder="Your thoughts... Use toolbar for formatting"
        darkMode={darkMode}
        rows={15}
      />
      
      <div className="mt-4 mb-4">
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
            list="existing-tags"
            className={`flex-1 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all`}
          />
          <datalist id="existing-tags">
            {existingTags.filter(t => !selectedTags.includes(t)).map(tag => (
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
        {existingTags.length > 0 && (
          <div className="mt-2 text-xs text-slate-500">
            Existing tags: {existingTags.slice(0, 5).join(', ')}{existingTags.length > 5 ? '...' : ''}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Color:</span>
        {Object.entries(colors).map(([colorName, colorClass]) => (
          <button
            key={colorName}
            type="button"
            onClick={() => setColor(colorName)}
            className={`w-8 h-8 rounded-full border-2 ${colorClass} transition-all ${
              color === colorName ? 'ring-2 ring-teal-500 ring-offset-2 scale-110' : ''
            }`}
          />
        ))}
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

function NoteCard({ note, updateNote, deleteNote, isHighlighted, darkMode, existingTags, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, isDragOver, style }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(note);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState(note.tags || []);

  const colors = {
    yellow: 'bg-yellow-100 border-yellow-300 hover:shadow-yellow-200',
    blue: 'bg-blue-100 border-blue-300 hover:shadow-blue-200',
    green: 'bg-green-100 border-green-300 hover:shadow-green-200',
    pink: 'bg-pink-100 border-pink-300 hover:shadow-pink-200',
    purple: 'bg-purple-100 border-purple-300 hover:shadow-purple-200',
  };

  const handleSave = () => {
    updateNote(note.id, { ...editedNote, tags: selectedTags });
    setIsEditing(false);
  };

  const copyToClipboard = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    const text = `${note.title}\n\n${tempDiv.textContent || tempDiv.innerText}`;
    navigator.clipboard.writeText(text).then(() => {
      // Could add toast notification
    });
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

  if (isEditing) {
    return (
      <div className={`p-6 rounded-xl shadow-md border-2 ${colors[note.color || 'yellow']} animate-slideUp`} style={style}>
        <input
          type="text"
          value={editedNote.title || ''}
          onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
          placeholder="Title"
          className="w-full mb-2 px-2 py-1 bg-white/50 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
        />
        <RichTextEditor
          value={editedNote.content || ''}
          onChange={(content) => setEditedNote({ ...editedNote, content })}
          placeholder="Content"
          darkMode={false}
          rows={15}
        />
        <div className="mt-4 mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-white/70 rounded-full text-xs">
                <Tag size={10} />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-600"
                >
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
              list="existing-tags-edit"
              className="flex-1 px-2 py-1 bg-white/50 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
            <datalist id="existing-tags-edit">
              {existingTags.filter(t => !selectedTags.includes(t)).map(tag => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={() => addTag(tagInput)}
              className="px-2 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 transition-all"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm transition-all"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 bg-white/50 text-slate-600 hover:bg-white rounded text-sm transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`item-${note.id}`}
      draggable
      onDragStart={(e) => onDragStart(e, note)}
      onDragOver={(e) => onDragOver(e, note)}
      onDrop={(e) => onDrop(e, note)}
      onDragEnd={onDragEnd}
      className={`task-card p-6 rounded-xl shadow-md border-2 ${colors[note.color || 'yellow']} animate-slideUp cursor-move relative group ${
        isHighlighted ? 'animate-highlight ring-2 ring-teal-500' : ''
      } ${isDragging ? 'opacity-50 scale-95' : ''} ${isDragOver ? 'border-teal-500 border-4' : ''}`}
      style={style}
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-slate-800 flex-1">{note.title || 'Untitled Note'}</h3>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard();
            }}
            className="text-slate-400 hover:text-teal-600 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            title="Copy note"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteNote(note.id);
            }}
            className="text-slate-400 hover:text-red-600 transition-all hover:scale-110"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div 
        className="text-slate-700 text-sm mb-3 rich-text-editor"
        dangerouslySetInnerHTML={{ __html: note.content }}
      />
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-white/50 rounded text-xs text-slate-600">
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
