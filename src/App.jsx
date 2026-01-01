import React, { useState, useEffect } from 'react';
import { Plus, Check, Circle, Pause, AlertCircle, Trash2, Link2, StickyNote, List, ExternalLink, X, Edit2, Save, Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function LifeDashboard() {
  const [activeView, setActiveView] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [events, setEvents] = useState([]);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showNewLinkForm, setShowNewLinkForm] = useState(false);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('lifeDashboard_tasks');
      const savedLinks = localStorage.getItem('lifeDashboard_links');
      const savedNotes = localStorage.getItem('lifeDashboard_notes');
      const savedEvents = localStorage.getItem('lifeDashboard_events');
      
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedLinks) setLinks(JSON.parse(savedLinks));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedEvents) setEvents(JSON.parse(savedEvents));
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

  const addTask = (taskData) => {
    const newTask = {
      id: generateId(),
      ...taskData,
      status: 'new',
      priority: 'medium',
      linkedItems: [],
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-neutral-100">
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
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        .task-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        
        .status-badge {
          transition: all 0.15s ease;
        }
        
        .status-badge:hover {
          transform: scale(1.05);
        }
      `}</style>

      <div className="flex min-h-screen">
        <aside className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-8 flex flex-col shadow-2xl">
          <div className="mb-12">
            <h1 className="text-3xl font-bold accent-font mb-2 bg-gradient-to-r from-teal-300 to-cyan-200 bg-clip-text text-transparent">
              Life Command
            </h1>
            <p className="text-slate-400 text-sm">Your personal dashboard</p>
          </div>
          
          <nav className="space-y-2 flex-1">
            <NavButton 
              active={activeView === 'tasks'} 
              onClick={() => setActiveView('tasks')}
              icon={<List size={20} />}
              label="Tasks"
              count={tasks.filter(t => t.status !== 'completed').length}
            />
            <NavButton 
              active={activeView === 'calendar'} 
              onClick={() => setActiveView('calendar')}
              icon={<Calendar size={20} />}
              label="Calendar"
              count={events.length}
            />
            <NavButton 
              active={activeView === 'links'} 
              onClick={() => setActiveView('links')}
              icon={<Link2 size={20} />}
              label="Links"
              count={links.length}
            />
            <NavButton 
              active={activeView === 'notes'} 
              onClick={() => setActiveView('notes')}
              icon={<StickyNote size={20} />}
              label="Notes"
              count={notes.length}
            />
          </nav>
          
          <div className="mt-auto pt-8 border-t border-slate-700">
            <p className="text-xs text-slate-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </aside>

        <main className="flex-1 p-12 overflow-y-auto">
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
            />
          )}
        </main>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
        active 
          ? 'bg-teal-600 text-white shadow-lg' 
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {count > 0 && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          active ? 'bg-teal-700' : 'bg-slate-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

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
  getLinkedItem
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
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
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowNewEventForm(true);
  };

  return (
    <div className="max-w-7xl animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-slate-800 accent-font">Calendar</h2>
          <p className="text-slate-500 mt-1">{events.length} events scheduled</p>
        </div>
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setShowNewEventForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl"
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
        />
      )}

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h3 className="text-2xl font-bold text-slate-800">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-slate-600 text-sm py-2">
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
                className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all ${
                  isCurrentMonth ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'
                } ${isToday ? 'ring-2 ring-teal-500' : ''} hover:border-teal-300 hover:shadow-md`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-teal-600 font-bold' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded ${
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
                    <div className="text-xs text-slate-500 px-2">
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
        <h3 className="text-xl font-semibold text-slate-700">Upcoming Events</h3>
        {events
          .filter(e => new Date(e.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5)
          .map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              updateEvent={updateEvent}
              deleteEvent={deleteEvent}
              tasks={tasks}
              links={links}
              notes={notes}
              toggleLinkToEvent={toggleLinkToEvent}
              getLinkedItem={getLinkedItem}
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}
      </div>
    </div>
  );
}

function NewEventForm({ onSave, onCancel, initialDate }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(
    initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('teal');

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
      onSave({ title, date, startTime, endTime, description, color });
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('10:00');
      setDescription('');
      setColor('teal');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-6 bg-white rounded-xl shadow-lg border border-slate-200 animate-slideUp">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event title..."
        className="w-full text-lg font-medium mb-3 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        autoFocus
      />
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Color</label>
          <div className="flex gap-2 pt-2">
            {Object.entries(colors).map(([colorName, colorClass]) => (
              <button
                key={colorName}
                type="button"
                onClick={() => setColor(colorName)}
                className={`w-8 h-8 rounded-full border-2 ${colorClass} ${
                  color === colorName ? 'ring-2 ring-teal-500 ring-offset-2' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        rows={3}
      />
      
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Save size={16} />
          Save Event
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function EventCard({ event, updateEvent, deleteEvent, tasks, links, notes, toggleLinkToEvent, getLinkedItem, style }) {
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleSave = () => {
    updateEvent(event.id, editedEvent);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200 animate-slideUp" style={style}>
        <input
          type="text"
          value={editedEvent.title}
          onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
          className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="date"
          value={editedEvent.date}
          onChange={(e) => setEditedEvent({ ...editedEvent, date: e.target.value })}
          className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
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
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-card p-6 bg-white rounded-xl shadow-md border border-slate-200 animate-slideUp" style={style}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
            event.color === 'blue' ? 'bg-blue-100 text-blue-700' :
            event.color === 'green' ? 'bg-green-100 text-green-700' :
            event.color === 'purple' ? 'bg-purple-100 text-purple-700' :
            event.color === 'red' ? 'bg-red-100 text-red-700' :
            'bg-teal-100 text-teal-700'
          }`}>
            {formattedDate}
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">{event.title}</h3>
          {(event.startTime || event.endTime) && (
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <Clock size={16} />
              <span>{event.startTime} - {event.endTime}</span>
            </div>
          )}
          {event.description && (
            <p className="text-slate-600 text-sm mb-3">{event.description}</p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setIsEditing(true)}
            className="text-slate-400 hover:text-teal-600 transition-colors"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => deleteEvent(event.id)}
            className="text-slate-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {event.linkedItems && event.linkedItems.length > 0 && (
        <div className="mb-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap gap-2">
            {event.linkedItems.map(linkedItem => {
              const item = getLinkedItem(linkedItem);
              if (!item) return null;
              
              return (
                <div 
                  key={linkedItem.id}
                  className="flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs border border-teal-200"
                >
                  {linkedItem.type === 'link' ? <Link2 size={12} /> : 
                   linkedItem.type === 'note' ? <StickyNote size={12} /> : 
                   <List size={12} />}
                  <span className="truncate max-w-[150px]">{linkedItem.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setShowLinkMenu(!showLinkMenu)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
        >
          <Link2 size={16} />
          Link Items
        </button>

        {showLinkMenu && (
          <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-10 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-medium text-sm text-slate-700">Link to this event</h4>
              <button 
                onClick={() => setShowLinkMenu(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
            
            {tasks.length > 0 && (
              <div className="p-3 border-b border-slate-200">
                <p className="text-xs text-slate-500 mb-2">Tasks</p>
                {tasks.map(task => {
                  const isLinked = event.linkedItems?.some(i => i.id === task.id);
                  return (
                    <button
                      key={task.id}
                      onClick={() => toggleLinkToEvent(event.id, task, 'task')}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-slate-50 mb-1 text-sm ${
                        isLinked ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isLinked && <Check size={14} />}
                        <span className="truncate">{task.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {links.length > 0 && (
              <div className="p-3 border-b border-slate-200">
                <p className="text-xs text-slate-500 mb-2">Links</p>
                {links.map(link => {
                  const isLinked = event.linkedItems?.some(i => i.id === link.id);
                  return (
                    <button
                      key={link.id}
                      onClick={() => toggleLinkToEvent(event.id, link, 'link')}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-slate-50 mb-1 text-sm ${
                        isLinked ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isLinked && <Check size={14} />}
                        <span className="truncate">{link.title || link.url}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
            {notes.length > 0 && (
              <div className="p-3">
                <p className="text-xs text-slate-500 mb-2">Notes</p>
                {notes.map(note => {
                  const isLinked = event.linkedItems?.some(i => i.id === note.id);
                  return (
                    <button
                      key={note.id}
                      onClick={() => toggleLinkToEvent(event.id, note, 'note')}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-slate-50 mb-1 text-sm ${
                        isLinked ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isLinked && <Check size={14} />}
                        <span className="truncate">{note.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
            {tasks.length === 0 && links.length === 0 && notes.length === 0 && (
              <div className="p-4 text-center text-sm text-slate-500">
                No items to connect yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
  getLinkedItem
}) {
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="max-w-6xl animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-slate-800 accent-font">Tasks</h2>
          <p className="text-slate-500 mt-1">{activeTasks.length} active • {completedTasks.length} completed</p>
        </div>
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      {showNewTaskForm && (
        <NewTaskForm 
          onSave={addTask} 
          onCancel={() => setShowNewTaskForm(false)} 
        />
      )}

      <div className="space-y-4 mb-8">
        {activeTasks.map((task, index) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            updateTask={updateTask}
            deleteTask={deleteTask}
            links={links}
            notes={notes}
            toggleLinkToTask={toggleLinkToTask}
            getLinkedItem={getLinkedItem}
            style={{ animationDelay: `${index * 0.05}s` }}
          />
        ))}
      </div>

      {activeTasks.length === 0 && !showNewTaskForm && (
        <div className="text-center py-16 text-slate-500">
          <List size={48} className="mx-auto mb-4 opacity-30" />
          <p>No active tasks. Click "New Task" to get started!</p>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-700">Completed</h3>
            <button
              onClick={clearCompletedTasks}
              className="text-sm text-slate-500 hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2 opacity-60">
            {completedTasks.map(task => (
              <div key={task.id} className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <Check className="text-green-600" size={20} />
                  <span className="line-through text-slate-600">{task.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NewTaskForm({ onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({ title, description });
      setTitle('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-6 bg-white rounded-xl shadow-lg border border-slate-200 animate-slideUp">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title..."
        className="w-full text-lg font-medium mb-3 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        autoFocus
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        rows={3}
      />
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Save size={16} />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function TaskCard({ task, updateTask, deleteTask, links, notes, toggleLinkToTask, getLinkedItem, style }) {
  const [showLinkMenu, setShowLinkMenu] = useState(false);

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

  const currentStatus = statusConfig[task.status];
  const currentPriority = priorityConfig[task.priority];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="task-card p-6 bg-white rounded-xl shadow-md border border-slate-200 animate-slideUp" style={style}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-800 mb-2">{task.title}</h3>
          {task.description && (
            <p className="text-slate-600 text-sm mb-3">{task.description}</p>
          )}
        </div>
        <button
          onClick={() => deleteTask(task.id)}
          className="text-slate-400 hover:text-red-600 transition-colors ml-4"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex gap-1">
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => updateTask(task.id, { status: key })}
              className={`status-badge px-3 py-1 rounded-full text-xs font-medium border ${
                task.status === key ? config.color : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-500">Priority:</span>
        <div className="flex gap-1">
          {Object.entries(priorityConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => updateTask(task.id, { priority: key })}
              className={`px-2 py-1 rounded text-xs font-medium ${
                task.priority === key ? config.color : 'bg-slate-100 text-slate-500'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {task.linkedItems && task.linkedItems.length > 0 && (
        <div className="mb-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap gap-2">
            {task.linkedItems.map(linkedItem => {
              const item = getLinkedItem(linkedItem);
              if (!item) return null;
              
              return (
                <div 
                  key={linkedItem.id}
                  className="flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs border border-teal-200"
                >
                  {linkedItem.type === 'link' ? <Link2 size={12} /> : <StickyNote size={12} />}
                  <span className="truncate max-w-[150px]">{linkedItem.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setShowLinkMenu(!showLinkMenu)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
        >
          <Link2 size={16} />
          Link Items
        </button>

        {showLinkMenu && (
          <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-10 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-medium text-sm text-slate-700">Link to this task</h4>
              <button 
                onClick={() => setShowLinkMenu(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
            
            {links.length > 0 && (
              <div className="p-3 border-b border-slate-200">
                <p className="text-xs text-slate-500 mb-2">Links</p>
                {links.map(link => {
                  const isLinked = task.linkedItems?.some(i => i.id === link.id);
                  return (
                    <button
                      key={link.id}
                      onClick={() => toggleLinkToTask(task.id, link, 'link')}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-slate-50 mb-1 text-sm ${
                        isLinked ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isLinked && <Check size={14} />}
                        <span className="truncate">{link.title || link.url}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
            {notes.length > 0 && (
              <div className="p-3">
                <p className="text-xs text-slate-500 mb-2">Notes</p>
                {notes.map(note => {
                  const isLinked = task.linkedItems?.some(i => i.id === note.id);
                  return (
                    <button
                      key={note.id}
                      onClick={() => toggleLinkToTask(task.id, note, 'note')}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-slate-50 mb-1 text-sm ${
                        isLinked ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isLinked && <Check size={14} />}
                        <span className="truncate">{note.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
            {links.length === 0 && notes.length === 0 && (
              <div className="p-4 text-center text-sm text-slate-500">
                No links or notes to connect yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LinksView({ links, addLink, updateLink, deleteLink, showNewLinkForm, setShowNewLinkForm }) {
  const categories = [...new Set(links.map(l => l.category).filter(Boolean))];
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredLinks = filterCategory === 'all' 
    ? links 
    : links.filter(l => l.category === filterCategory);

  return (
    <div className="max-w-6xl animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-slate-800 accent-font">Links</h2>
          <p className="text-slate-500 mt-1">{links.length} saved</p>
        </div>
        <button
          onClick={() => setShowNewLinkForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          New Link
        </button>
      </div>

      {showNewLinkForm && (
        <NewLinkForm 
          onSave={addLink} 
          onCancel={() => setShowNewLinkForm(false)}
          existingCategories={categories}
        />
      )}

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterCategory === 'all' 
                ? 'bg-teal-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterCategory === cat 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLinks.map((link, index) => (
          <LinkCard 
            key={link.id} 
            link={link} 
            updateLink={updateLink}
            deleteLink={deleteLink}
            style={{ animationDelay: `${index * 0.05}s` }}
          />
        ))}
      </div>

      {filteredLinks.length === 0 && !showNewLinkForm && (
        <div className="text-center py-16 text-slate-500">
          <Link2 size={48} className="mx-auto mb-4 opacity-30" />
          <p>No links yet. Start adding your inspirations!</p>
        </div>
      )}
    </div>
  );
}

function NewLinkForm({ onSave, onCancel, existingCategories }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSave({ url, title, category, description });
      setUrl('');
      setTitle('');
      setCategory('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-6 bg-white rounded-xl shadow-lg border border-slate-200 animate-slideUp">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="w-full text-lg font-medium mb-3 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        autoFocus
      />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="w-full mb-3 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category (optional)"
        list="categories"
        className="w-full mb-3 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        rows={2}
      />
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Save size={16} />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function LinkCard({ link, updateLink, deleteLink, style }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLink, setEditedLink] = useState(link);

  const handleSave = () => {
    updateLink(link.id, editedLink);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200 animate-slideUp" style={style}>
        <input
          type="url"
          value={editedLink.url}
          onChange={(e) => setEditedLink({ ...editedLink, url: e.target.value })}
          className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="text"
          value={editedLink.title || ''}
          onChange={(e) => setEditedLink({ ...editedLink, title: e.target.value })}
          placeholder="Title"
          className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="text"
          value={editedLink.category || ''}
          onChange={(e) => setEditedLink({ ...editedLink, category: e.target.value })}
          placeholder="Category"
          className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
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
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-card p-6 bg-white rounded-xl shadow-md border border-slate-200 animate-slideUp" style={style}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {link.title && (
            <h3 className="font-semibold text-slate-800 mb-1">{link.title}</h3>
          )}
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-700 text-sm flex items-center gap-1 break-all"
          >
            {link.url}
            <ExternalLink size={14} />
          </a>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setIsEditing(true)}
            className="text-slate-400 hover:text-teal-600 transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => deleteLink(link.id)}
            className="text-slate-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {link.description && (
        <p className="text-sm text-slate-600 mb-3">{link.description}</p>
      )}
      
      {link.category && (
        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
          {link.category}
        </span>
      )}
    </div>
  );
}

function NotesView({ notes, addNote, updateNote, deleteNote, showNewNoteForm, setShowNewNoteForm }) {
  return (
    <div className="max-w-6xl animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-slate-800 accent-font">Notes</h2>
          <p className="text-slate-500 mt-1">{notes.length} notes</p>
        </div>
        <button
          onClick={() => setShowNewNoteForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          New Note
        </button>
      </div>

      {showNewNoteForm && (
        <NewNoteForm 
          onSave={addNote} 
          onCancel={() => setShowNewNoteForm(false)} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note, index) => (
          <NoteCard 
            key={note.id} 
            note={note} 
            updateNote={updateNote}
            deleteNote={deleteNote}
            style={{ animationDelay: `${index * 0.05}s` }}
          />
        ))}
      </div>

      {notes.length === 0 && !showNewNoteForm && (
        <div className="text-center py-16 text-slate-500">
          <StickyNote size={48} className="mx-auto mb-4 opacity-30" />
          <p>No notes yet. Capture your thoughts!</p>
        </div>
      )}
    </div>
  );
}

function NewNoteForm({ onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('yellow');

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
      onSave({ title, content, color });
      setTitle('');
      setContent('');
      setColor('yellow');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-6 bg-white rounded-xl shadow-lg border border-slate-200 animate-slideUp">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title..."
        className="w-full text-lg font-medium mb-3 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        autoFocus
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Your thoughts..."
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        rows={4}
      />
      
      <div className="flex items-center gap-2 mt-4 mb-4">
        <span className="text-sm text-slate-600">Color:</span>
        {Object.entries(colors).map(([colorName, colorClass]) => (
          <button
            key={colorName}
            type="button"
            onClick={() => setColor(colorName)}
            className={`w-8 h-8 rounded-full border-2 ${colorClass} ${
              color === colorName ? 'ring-2 ring-teal-500 ring-offset-2' : ''
            }`}
          />
        ))}
      </div>
      
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Save size={16} />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function NoteCard({ note, updateNote, deleteNote, style }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(note);

  const colors = {
    yellow: 'bg-yellow-100 border-yellow-300 hover:shadow-yellow-200',
    blue: 'bg-blue-100 border-blue-300 hover:shadow-blue-200',
    green: 'bg-green-100 border-green-300 hover:shadow-green-200',
    pink: 'bg-pink-100 border-pink-300 hover:shadow-pink-200',
    purple: 'bg-purple-100 border-purple-300 hover:shadow-purple-200',
  };

  const handleSave = () => {
    updateNote(note.id, editedNote);
    setIsEditing(false);
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
        <textarea
          value={editedNote.content || ''}
          onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
          placeholder="Content"
          className="w-full mb-2 px-2 py-1 bg-white/50 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          rows={5}
        />
        <div className="flex gap-2 mt-4">
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
      className={`task-card p-6 rounded-xl shadow-md border-2 ${colors[note.color || 'yellow']} animate-slideUp cursor-pointer`}
      style={style}
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-slate-800 flex-1">{note.title || 'Untitled Note'}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNote(note.id);
          }}
          className="text-slate-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <p className="text-slate-700 text-sm whitespace-pre-wrap">{note.content}</p>
    </div>
  );
}
