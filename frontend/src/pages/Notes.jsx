import React, { useState, useEffect } from 'react';
import { 
  StickyNote, 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit3, 
  Tag, 
  X, 
  Check, 
  Clock 
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import { NoteAPI } from '../services/api';
import './Notes.css';

export default function Notes({ onToast }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  
  // Note edit/create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: 'default',
    tag: 'General',
    pinned: false,
  });

  const tags = ['All', 'General', 'Ideas', 'Quick Note', 'Study', 'Project', 'Personal'];
  const colorOptions = [
    { id: 'default', label: 'Crisp White', bg: '#FFFFFF' },
    { id: 'sage', label: 'Soft Sage', bg: '#EDF5F0' },
    { id: 'cream', label: 'Warm Cream', bg: '#FFF9E6' },
    { id: 'teal', label: 'Teal Mist', bg: '#E3F5F2' },
    { id: 'blush', label: 'Petal Blush', bg: '#FDEEE9' },
    { id: 'sky', label: 'Morning Sky', bg: '#EAF3FB' },
  ];

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await NoteAPI.getAll({
        search: searchTerm || undefined,
        tag: selectedTag,
      });
      setNotes(data);
    } catch (err) {
      if (onToast) onToast('Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [selectedTag]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadNotes();
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      color: 'default',
      tag: 'General',
      pinned: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content || '',
      color: note.color || 'default',
      tag: note.tag || 'General',
      pinned: note.pinned || false,
    });
    setIsModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      if (onToast) onToast('Please enter a note title', 'error');
      return;
    }

    try {
      if (editingNote) {
        await NoteAPI.update(editingNote.id, formData);
        if (onToast) onToast('Note updated beautifully.');
      } else {
        await NoteAPI.create(formData);
        if (onToast) onToast('Note created.');
      }
      setIsModalOpen(false);
      loadNotes();
    } catch (err) {
      if (onToast) onToast('Failed to save note', 'error');
    }
  };

  const handleTogglePin = async (noteId, e) => {
    e.stopPropagation();
    try {
      const updated = await NoteAPI.togglePin(noteId);
      setNotes(notes.map((n) => (n.id === noteId ? updated : n)));
      if (onToast) onToast(updated.pinned ? 'Note pinned to top.' : 'Note unpinned.');
      loadNotes();
    } catch (err) {
      if (onToast) onToast('Could not toggle pin', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNote) return;
    try {
      await NoteAPI.delete(deletingNote.id);
      if (onToast) onToast('Note removed.');
      setDeletingNote(null);
      loadNotes();
    } catch (err) {
      if (onToast) onToast('Failed to delete note', 'error');
    }
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="notes-page">
      <div className="page-header">
        <div className="page-header-titles">
          <h1 className="page-title">Notes & Thoughts</h1>
          <p className="page-subtitle">A calm, flexible space for your ideas, lists, inspirations, and reminders.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> Add Note
          </button>
        </div>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="notes-toolbar card">
        <form onSubmit={handleSearchSubmit} className="search-form-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search notes by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="btn-outline clear-btn"
              onClick={() => {
                setSearchTerm('');
                setTimeout(loadNotes, 50);
              }}
            >
              Clear
            </button>
          )}
        </form>

        <div className="tags-filter-bar">
          {tags.map((t) => (
            <button
              key={t}
              className={`tag-chip ${selectedTag === t ? 'active' : ''}`}
              onClick={() => setSelectedTag(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner-teal" />
          <p>Gathering your notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="card empty-notes-card">
          <div className="empty-state-art">
            <div className="art-circle">
              <StickyNote size={36} className="art-icon" />
            </div>
          </div>
          <h3 className="empty-state-title">
            {searchTerm || selectedTag !== 'All' ? 'No matching notes found' : 'No notes yet'}
          </h3>
          <p className="empty-state-subtitle">
            {searchTerm || selectedTag !== 'All'
              ? 'Try adjusting your search query or select another tag.'
              : 'Keep meeting notes, reading excerpts, personal reflections, or project brainstorms right here.'}
          </p>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> Write Your First Note
          </button>
        </div>
      ) : (
        <div className="notes-masonry-grid">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`note-card note-color-${note.color} ${note.pinned ? 'is-pinned' : ''}`}
              onClick={() => openEditModal(note)}
            >
              <div className="note-card-header">
                <span className="note-tag-badge">{note.tag}</span>
                <div className="note-card-top-actions">
                  <button
                    className={`btn-icon note-pin-btn ${note.pinned ? 'pinned' : ''}`}
                    onClick={(e) => handleTogglePin(note.id, e)}
                    title={note.pinned ? 'Unpin note' : 'Pin note to top'}
                  >
                    <Pin size={15} />
                  </button>
                  <button
                    className="btn-icon note-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingNote(note);
                    }}
                    title="Delete note"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 className="note-title">{note.title}</h3>

              {note.content && (
                <p className="note-content-preview">{note.content}</p>
              )}

              <div className="note-card-footer">
                <span className="note-date">
                  <Clock size={12} /> {formatDate(note.updated_at || note.created_at)}
                </span>
                <span className="note-edit-hint">Click to edit</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-card note-modal-card"
            style={{
              backgroundColor: colorOptions.find((c) => c.id === formData.color)?.bg || '#FFFFFF',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                {editingNote ? 'Edit Note' : 'Create New Note'}
              </h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="note-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="Note title or main thought..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label>Content / Details</label>
                <textarea
                  rows={6}
                  placeholder="Jot down notes, lists, ideas, links, or instructions..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tag / Category</label>
                  <select
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  >
                    {tags.filter((t) => t !== 'All').map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Color Theme</label>
                  <div className="color-palette-pickers">
                    {colorOptions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`color-bubble ${formData.color === c.id ? 'active' : ''}`}
                        style={{ backgroundColor: c.bg }}
                        onClick={() => setFormData({ ...formData, color: c.id })}
                        title={c.label}
                      >
                        {formData.color === c.id && <Check size={12} color="#0F9D8A" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="note-pin-toggle-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.pinned}
                    onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  />
                  <span>Pin this note to the top</span>
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingNote ? 'Save Changes' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingNote)}
        title="Delete this note?"
        message={`Delete "${deletingNote?.title}" permanently?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingNote(null)}
      />
    </div>
  );
}
