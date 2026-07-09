import { useState } from 'react';
import { FileText, Plus, Trash2, BookOpen, StickyNote } from 'lucide-react';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '../features/notes/hooks/useNotes';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { LoadingScreen } from '../components/ui/Spinner';
import { fromNow } from '../lib/dateUtils';
import { PageHeader } from '../components/ui/PageHeader';
import { TabBar } from '../components/ui/TabBar';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';
import type { NoteDTO } from '../types';

function NoteCard({ note, onClick }: { note: NoteDTO; onClick: () => void }) {
  const deleteNote = useDeleteNote();
  return (
    <Card
      variant="default"
      hoverable
      className="p-5 sm:p-6 cursor-pointer relative group flex flex-col justify-between"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2.5">
            {note.isJournal ? (
              <BookOpen size={18} className="text-accent shrink-0" />
            ) : (
              <StickyNote size={18} className="text-info shrink-0" />
            )}
            <p className="text-base sm:text-lg font-bold text-text-primary truncate">
              {note.title || 'Untitled'}
            </p>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary line-clamp-3 leading-relaxed">
            {note.content}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); deleteNote.mutate(note.id); }}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-all shrink-0 tap-target"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <p className="text-[10px] text-text-muted mt-4 font-bold select-none">
        Updated {fromNow(note.updatedAt)}
      </p>
    </Card>
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

  const tabOptions = [
    { id: 'notes', label: '📝 Notes' },
    { id: 'journal', label: '📔 Journal' },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <PageHeader
        icon={<FileText size={24} />}
        title="Notes & Journal"
        subtitle={tab === 'journal' ? `${notes.length} journal entries` : `${notes.length} notes`}
        action={
          <Button onClick={() => { setTitle(''); setContent(''); setShowCreate(true); }} leftIcon={<Plus size={16} />} id="create-note-btn">
            New {tab === 'journal' ? 'Entry' : 'Note'}
          </Button>
        }
      />

      {/* Tabs */}
      <TabBar
        tabs={tabOptions}
        activeTab={tab}
        onTabChange={(id) => setTab(id as 'notes' | 'journal')}
        variant="pill"
      />

      {notes.length === 0 ? (
        <EmptyState
          icon={<FileText size={32} />}
          title={`No ${tab} found`}
          description={`Start writing your first ${tab === 'journal' ? 'journal entry' : 'note'} to organize your thoughts.`}
          action={
            <Button onClick={() => { setTitle(''); setContent(''); setShowCreate(true); }} leftIcon={<Plus size={16} />}>
              Create {tab === 'journal' ? 'Entry' : 'Note'}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 stagger animate-fade-in">
          {notes.map((n) => <NoteCard key={n.id} note={n} onClick={() => openEdit(n)} />)}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={tab === 'journal' ? 'New Journal Entry' : 'New Note'}>
        <form onSubmit={handleCreate} className="flex flex-col gap-5 pt-2">
          <Input id="note-title" label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled" />
          <Textarea id="note-content" label="Content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} required placeholder="Start writing…" />
          <Button type="submit" fullWidth loading={createNote.isPending}>Save</Button>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Note">
        <form onSubmit={handleUpdate} className="flex flex-col gap-5 pt-2">
          <Input id="edit-note-title" label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled" />
          <Textarea id="edit-note-content" label="Content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} required />
          <Button type="submit" fullWidth loading={updateNote.isPending}>Update</Button>
        </form>
      </Modal>
    </div>
  );
}