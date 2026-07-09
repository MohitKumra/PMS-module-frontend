import { useState } from 'react';
import { FileText, Plus, Trash2, BookOpen, StickyNote } from 'lucide-react';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '../features/notes/hooks/useNotes';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { LoadingScreen } from '../components/ui/Spinner';
import { fromNow } from '../lib/dateUtils';
import type { NoteDTO } from '../types';

function NoteCard({ note, onClick }: { note: NoteDTO; onClick: () => void }) {
  const deleteNote = useDeleteNote();
  return (
    <div
      className="glass rounded-xl p-4 cursor-pointer hover:border-accent/40 transition-all animate-fade-in group relative"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {note.isJournal
              ? <BookOpen size={14} className="text-accent shrink-0" />
              : <StickyNote size={14} className="text-info shrink-0" />
            }
            <p className="text-sm font-medium text-text-primary truncate">
              {note.title || 'Untitled'}
            </p>
          </div>
          <p className="text-xs text-text-muted line-clamp-3">{note.content}</p>
          <p className="text-xs text-text-muted mt-2 opacity-60">{fromNow(note.updatedAt)}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); deleteNote.mutate(note.id); }}
          className="tap-target opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-all shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export function NotesPage() {
  const [tab, setTab] = useState<'notes' | 'journal'>('notes');
  const { data, isLoading } = useNotes(tab === 'journal' ? true : false);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<NoteDTO | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const notes = data?.data ?? [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createNote.mutate(
      { title: title || undefined, content, isJournal: tab === 'journal' },
      { onSuccess: () => { setShowCreate(false); setTitle(''); setContent(''); } }
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    updateNote.mutate(
      { id: editing.id, data: { title: title || undefined, content } },
      { onSuccess: () => setEditing(null) }
    );
  };

  const openEdit = (note: NoteDTO) => {
    setEditing(note);
    setTitle(note.title ?? '');
    setContent(note.content);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <FileText className="text-accent" size={24} /> Notes
        </h1>
        <Button onClick={() => { setTitle(''); setContent(''); setShowCreate(true); }} leftIcon={<Plus size={16} />} id="create-note-btn">
          New {tab === 'journal' ? 'Entry' : 'Note'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['notes', 'journal'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-accent text-text-onaccent' : 'bg-surface text-text-muted'
            }`}
          >{t === 'journal' ? '📔 Journal' : '📝 Notes'}</button>
        ))}
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No {tab} yet</p>
          <p className="text-sm mt-1">Write your first {tab === 'journal' ? 'journal entry' : 'note'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 stagger">
          {notes.map((n) => <NoteCard key={n.id} note={n} onClick={() => openEdit(n)} />)}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={tab === 'journal' ? 'New Journal Entry' : 'New Note'}>
        <form onSubmit={handleCreate} className="flex flex-col gap-4 pt-2">
          <Input id="note-title" label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled" />
          <Textarea id="note-content" label="Content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} required placeholder="Start writing…" />
          <Button type="submit" fullWidth loading={createNote.isPending}>Save</Button>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Note">
        <form onSubmit={handleUpdate} className="flex flex-col gap-4 pt-2">
          <Input id="edit-note-title" label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled" />
          <Textarea id="edit-note-content" label="Content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} required />
          <Button type="submit" fullWidth loading={updateNote.isPending}>Update</Button>
        </form>
      </Modal>
    </div>
  );
}