import React, { useState, useEffect, useRef } from 'react';
import { Plus, Check, Circle, Pause, AlertCircle, Trash2, Link2, StickyNote, List, ExternalLink, X, Edit2, Save, Calendar, ChevronLeft, ChevronRight, Clock, Copy, Moon, Sun, Tag, ChevronDown, ChevronUp, Bold, Italic, ListOrdered, Grid, LayoutList, User, Camera, Filter } from 'lucide-react';

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
    notes: 'grid',
    tags: 'grid'
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

  // Task CRUD
  const addTask = (taskData) => {
    const newTask = {
      id: generateId(),
      ...taskData,
      status: 'new',
      priority: 'medium',
      subtasks: [],
      linkedItems: [],
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    setShowNewTaskForm(false);
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updates } : task));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const clearCompletedTasks = () => {
    setTasks(tasks.filter(task => task.status !== 'completed'));
  };

  const reorderTasks = (newOrder) => {
    setTasks(newOrder);
  };

  // Link CRUD
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

  // Note CRUD
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

  // Event CRUD
  const addEvent = (eventData) => {
    const newEvent = {
      id: generateId(),
      ...eventData,
      linkedItems: [],
      createdAt: new Date().toISOString()
    };
    setEvents([...events, newEvent]);
    setShowNewEventForm(false);
    setSelectedDate(null);
  };

  const updateEvent = (id, updates) => {
    setEvents(events.map(event => event.id === id ? { ...event, ...updates } : event));
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  // Linking functions
  const toggleLinkToTask = (taskId, item, type) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const linkedItems = task.linkedItems || [];
    const existingIndex = linkedItems.findIndex(li => li.id === item.id && li.type === type);

    if (existingIndex > -1) {
      updateTask(taskId, {
        linkedItems: linkedItems.filter((_, i) => i !== existingIndex)
      });
    } else {
      updateTask(taskId, {
        linkedItems: [...linkedItems, { id: item.id, type, title: item.title || item.url }]
      });
    }
  };

  const toggleLinkToEvent = (eventId, item, type) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const linkedItems = event.linkedItems || [];
    const existingIndex = linkedItems.findIndex(li => li.id === item.id && li.type === type);

    if (existingIndex > -1) {
      updateEvent(eventId, {
        linkedItems: linkedItems.filter((_, i) => i !== existingIndex)
      });
    } else {
      updateEvent(eventId, {
        linkedItems: [...linkedItems, { id: item.id, type, title: item.title || item.url }]
      });
    }
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
    } else if (linkedItem.type === 'note') {
      setActiveView('notes');
    } else if (linkedItem.type === 'task') {
      setActiveView('tasks');
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
    ...tasks.flatMap(t => t.tags || []),
    ...events.flatMap(e => e.tags || []),
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

        .rich-text-editor li {
          margin: 0.25em 0;
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
        {/* Sidebar with persistent clock */}
        <aside className={`w-64 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-r flex flex-col sticky top-0 h-screen`}>
          <div className="p-6 flex-shrink-0">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} accent-font`}>
              Life Command
            </h1>
          </div>
          
          <nav className="flex-1 px-3 overflow-y-auto">
            <NavButton 
              active={activeView === 'tasks'} 
              onClick={() => setActiveView('tasks')} 
              icon={List} 
              label="Tasks"
              count={tasks.filter(t => t.status !== 'completed').length}
              darkMode={darkMode}
            />
            <NavButton 
              active={activeView === 'calendar'} 
              onClick={() => setActiveView('calendar')} 
              icon={Calendar} 
              label="Calendar"
              count={events.length}
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

          {/* Persistent Clock at Bottom - TASTEFUL DESIGN */}
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <header className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10`}>
            <div className="flex items-center gap-4">
              <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
              </h2>
            </div>
            <div className="flex items-center gap-3">
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
            {activeView === 'tasks' && (
              <TasksView 
                tasks={tasks}
                addTask={addTask}
                updateTask={updateTask}
                deleteTask={deleteTask}
                clearCompletedTasks={clearCompletedTasks}
                reorderTasks={reorderTasks}
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
                reorderLinks={reorderLinks}
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
                reorderNotes={reorderNotes}
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
                viewMode={viewModes.tags}
                toggleViewMode={toggleViewMode}
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
                <img src={imageUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover" onError={(e) => e.target.style.display = 'none'} />
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
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className={`p-3 min-h-[${rows * 24}px] focus:outline-none ${darkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900'} rich-text-editor`}
        style={{ minHeight: `${rows * 24}px` }}
        data-placeholder={placeholder}
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: ${darkMode ? '#94a3b8' : '#64748b'};
        }
      `}</style>
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

// TASKS VIEW - Complete with all fixes and features

function TasksView({ 
  tasks, 
  addTask, 
  updateTask, 
  deleteTask, 
  clearCompletedTasks,
  reorderTasks,
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
  const [filterType, setFilterType] = useState('none'); // none, priority, status, tag
  const [filterValue, setFilterValue] = useState('all');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status !== 'completed');
  
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

  // Get all unique values for filters
  const taskTags = [...new Set(activeTasks.flatMap(t => t.tags || []))];
  const priorities = ['urgent', 'high', 'medium', 'low'];
  const statuses = ['stuck', 'paused', 'working', 'new'];

  // Apply filter
  let filteredTasks = activeTasks;
  if (filterType === 'priority' && filterValue !== 'all') {
    filteredTasks = activeTasks.filter(t => t.priority === filterValue);
  } else if (filterType === 'status' && filterValue !== 'all') {
    filteredTasks = activeTasks.filter(t => t.status === filterValue);
  } else if (filterType === 'tag' && filterValue !== 'all') {
    filteredTasks = activeTasks.filter(t => t.tags && t.tags.includes(filterValue));
  }

  // Drag and drop handlers
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

    const [removed] = allTasksCopy.splice(draggedIndex, 1);
    allTasksCopy.splice(targetIndex, 0, removed);

    reorderTasks(allTasksCopy);

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
              <Grid size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
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
              {priorities.map(priority => (
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
              {statuses.map(status => (
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

          {filterType === 'tag' && (
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
              {taskTags.map(tag => (
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
            Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} with {filterType} = "{filterValue}"
          </div>
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
        {filteredTasks.map((task, index) => (
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
            style={{ animationDelay: `${index * 0.03}s` }}
          />
        ))}
      </div>

      {filteredTasks.length === 0 && !showNewTaskForm && (
        <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <List size={48} className="mx-auto mb-4 opacity-30" />
          <p>No tasks match your filter. Try changing the filter or add a new task!</p>
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
  style 
}) {
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [newSubtask, setNewSubtask] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskText, setEditingSubtaskText] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description || '');

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
    navigator.clipboard.writeText(text);
  };

  const saveDescription = () => {
    updateTask(task.id, { description: editedDescription });
    setIsEditingDescription(false);
  };

  const deleteDescription = () => {
    updateTask(task.id, { description: '' });
    setEditedDescription('');
  };

  return (
    <div 
      id={`item-${task.id}`}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragOver={(e) => onDragOver(e, task)}
      onDrop={(e) => onDrop(e, task)}
      onDragEnd={onDragEnd}
      className={`task-card p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-md border animate-slideUp cursor-move group ${
        isHighlighted ? 'animate-highlight ring-2 ring-teal-500' : ''
      } ${isDragging ? 'opacity-50 scale-95' : ''} ${isDragOver ? 'border-teal-500 border-2' : ''}`} 
      style={style}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'} mb-2`}>{task.title}</h3>
          
          {/* EDITABLE DESCRIPTION - DYNAMIC HEIGHT */}
          {isEditingDescription ? (
            <div className="mb-3">
              <RichTextEditor
                value={editedDescription}
                onChange={setEditedDescription}
                placeholder="Add description..."
                darkMode={darkMode}
                rows={6}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveDescription}
                  className="flex items-center gap-1 px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700"
                >
                  <Save size={14} />
                  Save
                </button>
                <button
                  onClick={() => setIsEditingDescription(false)}
                  className={`px-3 py-1 text-sm rounded ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : task.description ? (
            <div className="relative group/desc mb-3">
              <div 
                className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} text-sm rich-text-editor`}
                dangerouslySetInnerHTML={{ __html: task.description }}
                style={{ 
                  maxHeight: 'none',
                  overflow: 'visible'
                }}
              />
              <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover/desc:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className={`p-1 rounded ${darkMode ? 'bg-slate-700 text-teal-400 hover:bg-slate-600' : 'bg-slate-100 text-teal-600 hover:bg-slate-200'}`}
                  title="Edit description"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={deleteDescription}
                  className={`p-1 rounded ${darkMode ? 'bg-slate-700 text-red-400 hover:bg-slate-600' : 'bg-slate-100 text-red-600 hover:bg-slate-200'}`}
                  title="Delete description"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingDescription(true)}
              className={`text-sm ${darkMode ? 'text-slate-500 hover:text-teal-400' : 'text-slate-400 hover:text-teal-600'} mb-3`}
            >
              + Add description
            </button>
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
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
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


// Calendar View (same as before, works well)
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

      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-lg border p-6 mb-6`}>
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
                    >
                      <div className="font-medium truncate">{event.title}</div>
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
        className={`w-full text-lg font-medium mb-3 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
        autoFocus
      />
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={`block text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-1`}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
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
            className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
        <div>
          <label className={`block text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-1`}>End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none mb-3`}
        rows={3}
      />

      <div className="mb-3">
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
            placeholder="Add tag..."
            list="event-tags"
            className={`flex-1 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
          <datalist id="event-tags">
            {allTags.filter(t => !selectedTags.includes(t)).map(tag => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={() => addTag(tagInput)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          <Save size={16} />
          Save Event
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'} rounded-lg`}
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
          className={`w-full mb-3 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium`}
        />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="date"
            value={editedEvent.date}
            onChange={(e) => setEditedEvent({ ...editedEvent, date: e.target.value })}
            className={`px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
          <input
            type="time"
            value={editedEvent.startTime || ''}
            onChange={(e) => setEditedEvent({ ...editedEvent, startTime: e.target.value })}
            className={`px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
        <textarea
          value={editedEvent.description || ''}
          onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
          placeholder="Description"
          className={`w-full mb-3 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none`}
          rows={3}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className={`px-3 py-1.5 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'} rounded-lg text-sm`}
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
          {event.startTime && (
            <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'} text-sm mb-2`}>
              <Clock size={16} />
              <span>{event.startTime}{event.endTime && ` - ${event.endTime}`}</span>
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

// Links View - WITH LABELS, TAG EDITING, AND FILTERING
function LinksView({ links, addLink, updateLink, deleteLink, reorderLinks, showNewLinkForm, setShowNewLinkForm, highlightedItemId, darkMode, allTags, viewMode, toggleViewMode }) {
  const [filterType, setFilterType] = useState('none');
  const [filterValue, setFilterValue] = useState('all');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  
  const categories = [...new Set(links.map(l => l.category).filter(Boolean))];
  const linkTags = [...new Set(links.flatMap(l => l.tags || []))];

  let filteredLinks = links;
  if (filterType === 'category' && filterValue !== 'all') {
    filteredLinks = links.filter(l => l.category === filterValue);
  } else if (filterType === 'tag' && filterValue !== 'all') {
    filteredLinks = links.filter(l => l.tags && l.tags.includes(filterValue));
  }

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

    reorderLinks(allLinksCopy);

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
            >
              <LayoutList size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
            </button>
            <button
              onClick={() => toggleViewMode('links', 'grid')}
              className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : 'hover:bg-slate-300 dark:hover:bg-slate-600'}`}
            >
              <Grid size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
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
            className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
          >
            <option value="none">No Filter</option>
            <option value="category">Filter by Category</option>
            <option value="tag">Filter by Tag</option>
          </select>

          {filterType === 'category' && categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterValue('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${filterValue === 'all' ? 'bg-teal-600 text-white' : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterValue(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${filterValue === cat ? 'bg-teal-600 text-white' : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filterType === 'tag' && linkTags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterValue('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${filterValue === 'all' ? 'bg-teal-600 text-white' : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                All
              </button>
              {linkTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterValue(tag)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium ${filterValue === tag ? 'bg-teal-600 text-white' : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <Tag size={14} />
                  {tag}
                </button>
              ))}
            </div>
          )}
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
            existingCategories={categories}
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
          <p>No links match your filter!</p>
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
      <div className="mb-3">
        <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>URL *</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com or https://example.com"
          className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
          autoFocus
        />
      </div>

      <div className="mb-3">
        <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Optional title"
          className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
        />
      </div>

      <div className="mb-3">
        <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Category</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Optional category"
          list="categories"
          className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
        />
        <datalist id="categories">
          {existingCategories.map(cat => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
      </div>

      <div className="mb-3">
        <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none`}
          rows={2}
        />
      </div>

      <div className="mb-3">
        <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Tags</label>
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
            placeholder="Add tag..."
            list="link-tags"
            className={`flex-1 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
          <datalist id="link-tags">
            {allTags.filter(t => !selectedTags.includes(t)).map(tag => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={() => addTag(tagInput)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          <Save size={16} />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'} rounded-lg`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function LinkCard({ link, updateLink, deleteLink, isHighlighted, darkMode, allTags, existingCategories, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, isDragOver, style }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLink, setEditedLink] = useState(link);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState(link.tags || []);

  const handleSave = () => {
    let finalUrl = editedLink.url.trim();
    if (!finalUrl.match(/^https?:\/\//i)) {
      finalUrl = 'https://' + finalUrl;
    }
    updateLink(link.id, { ...editedLink, url: finalUrl, tags: selectedTags });
    setIsEditing(false);
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
      <div className={`p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-md border animate-slideUp`} style={style}>
        <div className="mb-3">
          <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>URL</label>
          <input
            type="text"
            value={editedLink.url}
            onChange={(e) => setEditedLink({ ...editedLink, url: e.target.value })}
            className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
        <div className="mb-3">
          <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Title</label>
          <input
            type="text"
            value={editedLink.title || ''}
            onChange={(e) => setEditedLink({ ...editedLink, title: e.target.value })}
            placeholder="Title"
            className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
        <div className="mb-3">
          <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Category</label>
          <input
            type="text"
            value={editedLink.category || ''}
            onChange={(e) => setEditedLink({ ...editedLink, category: e.target.value })}
            placeholder="Category"
            list="edit-categories"
            className={`w-full px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
          <datalist id="edit-categories">
            {existingCategories.map(cat => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
        <div className="mb-3">
          <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
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
              placeholder="Add tag..."
              list="edit-link-tags"
              className={`flex-1 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
            <datalist id="edit-link-tags">
              {allTags.filter(t => !selectedTags.includes(t)).map(tag => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={() => addTag(tagInput)}
              className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className={`px-3 py-1.5 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'} rounded-lg text-sm`}
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

// Notes View - WITH DRAG AND DROP
function NotesView({ notes, addNote, updateNote, deleteNote, reorderNotes, showNewNoteForm, setShowNewNoteForm, highlightedItemId, darkMode, allTags, viewMode, toggleViewMode }) {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

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

    reorderNotes(allNotesCopy);

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
            >
              <LayoutList size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
            </button>
            <button
              onClick={() => toggleViewMode('notes', 'grid')}
              className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : 'hover:bg-slate-300 dark:hover:bg-slate-600'}`}
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

      {showNewNoteForm && (
        <NewNoteForm 
          onSave={addNote} 
          onCancel={() => setShowNewNoteForm(false)}
          darkMode={darkMode}
          existingTags={allTags}
        />
      )}

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {notes.map((note, index) => (
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

      {notes.length === 0 && !showNewNoteForm && (
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
        className={`w-full text-lg font-medium mb-3 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
        autoFocus
      />
      
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Your thoughts..."
        darkMode={darkMode}
        rows={10}
      />

      <div className="flex items-center gap-2 mt-4 mb-4">
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
            placeholder="Add tag..."
            list="note-tags"
            className={`flex-1 px-3 py-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
          <datalist id="note-tags">
            {existingTags.filter(t => !selectedTags.includes(t)).map(tag => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={() => addTag(tagInput)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          <Save size={16} />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'} rounded-lg`}
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
    yellow: 'bg-yellow-100 border-yellow-300',
    blue: 'bg-blue-100 border-blue-300',
    green: 'bg-green-100 border-green-300',
    pink: 'bg-pink-100 border-pink-300',
    purple: 'bg-purple-100 border-purple-300',
  };

  const handleSave = () => {
    updateNote(note.id, { ...editedNote, tags: selectedTags });
    setIsEditing(false);
  };

  const copyToClipboard = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    const text = `${note.title}\n\n${tempDiv.textContent || tempDiv.innerText}`;
    navigator.clipboard.writeText(text);
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
          className="w-full mb-2 px-2 py-1 bg-white/50 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <RichTextEditor
          value={editedNote.content || ''}
          onChange={(content) => setEditedNote({ ...editedNote, content })}
          placeholder="Content"
          darkMode={false}
          rows={10}
        />
        <div className="mt-3 mb-3">
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
              list="edit-note-tags"
              className="flex-1 px-2 py-1 bg-white/50 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <datalist id="edit-note-tags">
              {existingTags.filter(t => !selectedTags.includes(t)).map(tag => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={() => addTag(tagInput)}
              className="px-2 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 bg-white/50 text-slate-600 hover:bg-white rounded text-sm"
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

// Tags View - WITH GRID/LIST TOGGLE AND ALL ITEM TYPES
function TagsView({ tasks, events, links, notes, allTags, navigateToLinkedItem, darkMode, viewMode, toggleViewMode }) {
  const [selectedTag, setSelectedTag] = useState('all');

  const getItemsWithTag = (tag) => {
    const items = [];
    
    tasks.filter(t => t.status !== 'completed').forEach(task => {
      if (tag === 'all' || (task.tags && task.tags.includes(tag))) {
        items.push({ ...task, type: 'task', icon: List });
      }
    });

    events.forEach(event => {
      if (tag === 'all' || (event.tags && event.tags.includes(tag))) {
        items.push({ ...event, type: 'event', icon: Calendar });
      }
    });

    links.forEach(link => {
      if (tag === 'all' || (link.tags && link.tags.includes(tag))) {
        items.push({ ...link, type: 'link', icon: Link2 });
      }
    });

    notes.forEach(note => {
      if (tag === 'all' || (note.tags && note.tags.includes(tag))) {
        items.push({ ...note, type: 'note', icon: StickyNote });
      }
    });

    return items;
  };

  const filteredItems = getItemsWithTag(selectedTag);

  return (
    <div className="max-w-6xl animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} accent-font`}>Tags</h2>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>{allTags.length} unique tags • {filteredItems.length} items</p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
          <button
            onClick={() => toggleViewMode('tags', 'list')}
            className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : 'hover:bg-slate-300 dark:hover:bg-slate-600'}`}
          >
            <LayoutList size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
          </button>
          <button
            onClick={() => toggleViewMode('tags', 'grid')}
            className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : 'hover:bg-slate-300 dark:hover:bg-slate-600'}`}
          >
            <Grid size={18} className={darkMode ? 'text-slate-300' : 'text-slate-700'} />
          </button>
        </div>
      </div>

      {allTags.length === 0 ? (
        <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <Tag size={48} className="mx-auto mb-4 opacity-30" />
          <p>No tags yet. Add tags to your tasks, events, links, or notes!</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTag === 'all' 
                  ? 'bg-teal-600 text-white shadow-lg scale-105' 
                  : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({getItemsWithTag('all').length})
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTag === tag 
                    ? 'bg-teal-600 text-white shadow-lg scale-105' 
                    : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Tag size={14} />
                {tag}
                <span className={`px-2 py-0.5 rounded-full text-xs ${selectedTag === tag ? 'bg-white/20' : darkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
                  {getItemsWithTag(tag).length}
                </span>
              </button>
            ))}
          </div>

          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {filteredItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => navigateToLinkedItem({ id: item.id, type: item.type, title: item.title || item.url })}
                  className={`p-4 ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'} rounded-lg border cursor-pointer transition-all hover:scale-105 hover:shadow-lg animate-slideUp`}
                  style={{ animationDelay: `${index * 0.02}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      item.type === 'task' ? 'bg-blue-100 text-blue-600' :
                      item.type === 'event' ? 'bg-purple-100 text-purple-600' :
                      item.type === 'link' ? 'bg-green-100 text-green-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs uppercase font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {item.type}
                        </span>
                      </div>
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'} mb-1`}>
                        {item.title || item.url || 'Untitled'}
                      </h4>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs">
                              <Tag size={8} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ExternalLink size={16} className={darkMode ? 'text-slate-500' : 'text-slate-400'} />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && selectedTag !== 'all' && (
            <div className={`text-center py-16 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <Tag size={48} className="mx-auto mb-4 opacity-30" />
              <p>No items with tag "{selectedTag}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
