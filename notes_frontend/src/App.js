import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Modern minimalist Notes App (Frontend only)
 * Features:
 *  - List/grid of notes
 *  - Create, view, edit, delete
 *  - Modal dialog for create/edit
 *  - Header, floating action button
 *  - Light & dark theme, custom colors, theme toggle
 */

// Theme color variables (core palette)
const COLORS = {
  primary: '#1976d2',
  accent: '#fbc02d',
  secondary: '#424242',
};

// Helpers for theme persistence
function getSavedTheme() {
  const val = localStorage.getItem('theme');
  return (val === 'dark' || val === 'light') ? val : 'light';
}
function saveTheme(val) {
  try { localStorage.setItem('theme', val); } catch { }
}

function uuid() {
  // Simple unique id generator for demo/local state use
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Styles applied inline for quick accent/primary customization
const themeCSSVars = {
  '--primary': COLORS.primary,
  '--accent': COLORS.accent,
  '--secondary': COLORS.secondary,
};

/**
 * NotesHeader - header bar with app title, theme toggle, and optional children (e.g. search bar)
 */
function NotesHeader({ theme, toggleTheme, children }) {
  return (
    <header className="notes-header" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexDirection: 'column', gap: 12}}>
      <div style={{display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center', position: 'relative'}}>
        <h1 className="app-title" style={{marginRight: 16}}>Notes</h1>
        <button
          className="theme-toggle"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
          onClick={toggleTheme}
          type="button"
        >
          <span className="theme-emoji" role="img" aria-label={theme === 'dark' ? 'moon' : 'sun'}>
            {theme === 'dark' ? '🌙' : '☀️'}
          </span>
          {theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>
      {children}
    </header>
  );
}

/**
 * PUBLIC_INTERFACE
 * SearchBar - minimal search component for filtering notes
 */
function SearchBar({ value, onChange, placeholder = "Search notes..." }) {
  return (
    <div style={{ width: '100%', maxWidth: 440, display: 'flex', justifyContent: 'center', marginTop: 10 }}>
      <input
        type="text"
        className="searchbar-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search notes"
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
}

function NotesList({ notes, onEdit, onDelete }) {
  if (!notes.length) {
    return (
      <div className="notes-empty">
        <p>No notes yet. Click the <span style={{ color: COLORS.accent }}>+</span> to add one!</p>
      </div>
    );
  }
  return (
    <div className="notes-grid">
      {notes.map(note => (
        <NoteCard key={note.id} note={note} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div className="note-card" style={{ borderColor: COLORS.primary }}>
      <div className="note-content">
        <div className="note-title">{note.title}</div>
        <div className="note-body">{note.body}</div>
      </div>
      <div className="note-actions">
        <button
          className="icon-button"
          aria-label="Edit note"
          title="Edit"
          onClick={() => onEdit(note)}
        >
          <svg width="20" height="20" fill={COLORS.primary} viewBox="0 0 24 24"><path d="M3 17.25V21h3.75l11.035-11.034-3.75-3.75L3 17.25zm14.965-9.036c.292-.292.292-.767 0-1.06l-2.12-2.12a.75.75 0 00-1.06 0l-1.83 1.83 3.18 3.18 1.83-1.83z"/></svg>
        </button>
        <button
          className="icon-button"
          aria-label="Delete note"
          title="Delete"
          onClick={() => onDelete(note.id)}
        >
          <svg width="20" height="20" fill="#e53935" viewBox="0 0 24 24"><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1zm3.5 3v12c0 1.1-.9 2-2 2H8a2 2 0 01-2-2V6h12z"/></svg>
        </button>
      </div>
    </div>
  );
}

// Modal dialog component for create/edit
function NoteModal({ open, onClose, onSave, note }) {
  const isEdit = Boolean(note && note.id);
  const [title, setTitle] = useState(note ? note.title : '');
  const [body, setBody] = useState(note ? note.body : '');

  useEffect(() => {
    // Reset when note changes or modal reopens
    setTitle(note ? note.title : '');
    setBody(note ? note.body : '');
  }, [note, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: note && note.id ? note.id : uuid(),
      title,
      body,
    });
    setTitle('');
    setBody('');
  };

  return (
    <div className="modal-overlay" tabIndex={-1}>
      <div className="modal-dialog" role="dialog" aria-modal="true">
        <form onSubmit={handleSubmit}>
          <h2>{isEdit ? 'Edit Note' : 'New Note'}</h2>
          <label>
            Title
            <input
              className="input"
              type="text"
              maxLength={60}
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              required
              placeholder="Enter title"
            />
          </label>
          <label>
            Body
            <textarea
              className="input input-body"
              rows={4}
              maxLength={500}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Enter note text"
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
              {isEdit ? 'Save' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Floating action button
function Fab({ onClick }) {
  return (
    <button className="fab" title="Add note" onClick={onClick} aria-label="Add note">
      <svg width="28" height="28" fill={COLORS.accent} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill={COLORS.primary}/>
        <path d="M12 7v10M7 12h10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  );
}

// --- LOCAL STORAGE in browser for persistence ---
function usePersistedNotes() {
  const key = "notes-app-data";
  const [notes, setNotes] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(notes));
    } catch {} // Ignore for demo
  }, [notes]);

  // PUBLIC_INTERFACE
  function createNote(note) {
    setNotes(prev => [...prev, note]);
  }
  // PUBLIC_INTERFACE
  function updateNote(edited) {
    setNotes(prev =>
      prev.map(n => (n.id === edited.id ? { ...n, ...edited } : n))
    );
  }
  // PUBLIC_INTERFACE
  function deleteNote(id) {
    setNotes(prev => prev.filter(n => n.id !== id));
  }
  // PUBLIC_INTERFACE
  function getNote(id) {
    return notes.find(n => n.id === id) || null;
  }

  return { notes, createNote, updateNote, deleteNote, getNote };
}

/**
 * PUBLIC_INTERFACE
 * Main application root for Notes app. Handles theming, note CRUD, and rendering UI.
 */
function App() {
  // Note data and CRUD functions
  const {
    notes,
    createNote,
    updateNote,
    deleteNote,
  } = usePersistedNotes();

  // Modal state
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);

  // Theme state
  const [theme, setTheme] = useState(getSavedTheme());

  // Search/filter state
  const [search, setSearch] = useState("");

  // Apply/remove .dark-theme class to root node
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
    saveTheme(theme);
  }, [theme]);

  // Toggle theme
  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme(current => (current === 'dark' ? 'light' : 'dark'));
  }

  // Filter notes (case-insensitive on title and body)
  const filteredNotes = search.trim()
    ? notes.filter(
        n =>
          n.title.toLowerCase().includes(search.trim().toLowerCase()) ||
          n.body.toLowerCase().includes(search.trim().toLowerCase())
      )
    : notes;

  // Open modal for new note
  function openNewNote() {
    setCurrentNote(null);
    setModalOpen(true);
  }
  // Open modal for editing
  function openEditNote(note) {
    setCurrentNote(note);
    setModalOpen(true);
  }
  // Close the modal
  function closeModal() {
    setModalOpen(false);
    setCurrentNote(null);
  }
  // Save (create/edit) a note
  function handleSave(note) {
    if (note.id && notes.some(n => n.id === note.id)) {
      updateNote(note);
    } else {
      createNote(note);
    }
    closeModal();
  }
  // Handle delete
  function handleDelete(id) {
    if (window.confirm("Delete this note?")) {
      deleteNote(id);
    }
  }

  return (
    <div className="app-root" style={themeCSSVars}>
      <NotesHeader theme={theme} toggleTheme={toggleTheme}>
        <SearchBar value={search} onChange={setSearch} />
      </NotesHeader>
      <main className="notes-main">
        <NotesList notes={filteredNotes} onEdit={openEditNote} onDelete={handleDelete} />
        <Fab onClick={openNewNote} />
      </main>
      <NoteModal
        open={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        note={currentNote}
      />
    </div>
  );
}

export default App;
