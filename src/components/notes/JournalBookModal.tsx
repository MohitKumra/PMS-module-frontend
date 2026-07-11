import React, { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Edit3, Trash2, X, Calendar } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { NoteDTO } from '../../types';

interface JournalBookModalProps {
  note: NoteDTO;
  originRect?: DOMRect | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const Page = forwardRef<HTMLDivElement, { className?: string; children: React.ReactNode }>(
  ({ className, children }, ref) => (
    <div className={className} ref={ref}>
      {children}
    </div>
  )
);
Page.displayName = 'Page';

// Splits content into page-sized chunks, breaking on paragraph/word boundaries
// rather than mid-word, so each page reads naturally without needing to scroll.
function paginateContent(content: string, maxCharsPerPage = 420): string[] {
  if (!content) return [''];

  const paragraphs = content.split(/\n{2,}/).filter(Boolean);
  const pages: string[] = [];
  let current = '';

  const pushCurrent = () => {
    if (current.trim()) pages.push(current.trim());
    current = '';
  };

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length <= maxCharsPerPage) {
      current = current ? `${current}\n\n${para}` : para;
      continue;
    }

    // paragraph itself may be longer than a page — split it on words
    const words = para.split(/\s+/);
    let chunk = current;
    for (const word of words) {
      if ((chunk + ' ' + word).length > maxCharsPerPage) {
        pushCurrent();
        current = chunk.trim();
        pushCurrent();
        chunk = word;
      } else {
        chunk = chunk ? `${chunk} ${word}` : word;
      }
    }
    current = chunk;
  }
  pushCurrent();

  return pages.length ? pages : [''];
}

export function JournalBookModal({ note, originRect, onClose, onEdit, onDelete }: JournalBookModalProps) {
  const bookRef = useRef<any>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const FlipBook = HTMLFlipBook as any;

  const journalDate = new Date(note.updatedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const lastUpdated = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const contentPages = useMemo(() => paginateContent(note.content), [note.content]);
  // Total leaves: front cover + content pages + back cover
  const totalPages = contentPages.length + 2;

  // --- FLIP animation: grow the stage from the clicked card's rect to fullscreen ---
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || !originRect) return;

    const finalRect = stage.getBoundingClientRect();
    if (finalRect.width === 0 || finalRect.height === 0) return;

    const dx =
      originRect.left + originRect.width / 2 - (finalRect.left + finalRect.width / 2);
    const dy =
      originRect.top + originRect.height / 2 - (finalRect.top + finalRect.height / 2);
    const sx = originRect.width / finalRect.width;
    const sy = originRect.height / finalRect.height;

    stage.style.transition = 'none';
    stage.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    stage.style.opacity = '0.4';

    // force reflow so the browser registers the starting transform
    void stage.offsetWidth;

    requestAnimationFrame(() => {
      stage.style.transition = 'transform 0.55s var(--ease-book), opacity 0.4s ease';
      stage.style.transform = 'translate(0, 0) scale(1, 1)';
      stage.style.opacity = '1';
    });
    // only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const growTimer = requestAnimationFrame(() => setMounted(true));
    const flipTimer = setTimeout(() => {
      try {
        bookRef.current?.pageFlip()?.flipNext();
      } catch {
        /* library not ready yet */
      }
    }, 650);

    return () => {
      cancelAnimationFrame(growTimer);
      clearTimeout(flipTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleClose = () => {
    setClosing(true);

    const stage = stageRef.current;
    if (stage && originRect) {
      const finalRect = stage.getBoundingClientRect();
      const dx =
        originRect.left + originRect.width / 2 - (finalRect.left + finalRect.width / 2);
      const dy =
        originRect.top + originRect.height / 2 - (finalRect.top + finalRect.height / 2);
      const sx = originRect.width / finalRect.width;
      const sy = originRect.height / finalRect.height;

      stage.style.transition = 'transform 0.32s ease-in, opacity 0.28s ease-in';
      stage.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
      stage.style.opacity = '0.3';
    }

    setTimeout(onClose, 320);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  };

  return (
    <div
      className={`journal-overlay ${mounted ? 'is-mounted' : ''} ${closing ? 'is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={note.title || 'Journal entry'}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Desktop close button - hidden on mobile, mobile uses the Close button in the action bar */}
      <button className="entry-close-btn entry-close-btn--desktop" onClick={handleClose} aria-label="Close journal">
        <X size={22} />
      </button>

      <div
        className={`journal-book-stage ${originRect ? 'journal-book-stage--flip' : ''}`}
        ref={stageRef}
      >
        <FlipBook
            width={420}
            height={580}
            size="stretch"
            minWidth={260}
            maxWidth={560}
            minHeight={360}
            maxHeight={720}
            showCover
            usePortrait
            mobileScrollSupport
            drawShadow
            maxShadowOpacity={0.6}
            flippingTime={650}
            startPage={0}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            className="journal-flipbook"
            ref={bookRef}
            style={{}}
>
          {/* Front cover */}
          <Page className="rpf-page rpf-cover rpf-cover-front">
            <div className="journal-cover-face">
              <span className="journal-cover-kicker">Journal</span>
              <div className="journal-cover-rule" />
              <h2 className="journal-cover-title">{note.title || 'Untitled Entry'}</h2>
              <span className="journal-cover-date">{journalDate}</span>
              <div className="journal-cover-corner journal-cover-corner-tl" />
              <div className="journal-cover-corner journal-cover-corner-tr" />
              <div className="journal-cover-corner journal-cover-corner-bl" />
              <div className="journal-cover-corner journal-cover-corner-br" />
            </div>
          </Page>

          {/* Content pages — one per chunk */}
          {contentPages.map((chunk, i) => (
            <Page className="rpf-page rpf-content" key={`content-${i}`}>
              <div className="journal-paper-face">
                {i === 0 && (
                  <>
                    <span className="journal-header-date">{journalDate}</span>
                    {note.title && <h2 className="journal-header-title">{note.title}</h2>}
                  </>
                )}
                <div className="journal-paper-scroll">
                  <p className="journal-text">{chunk}</p>
                </div>
                <div className="journal-paper-footer">
                  {i === 0 ? (
                    <Badge variant="accent" size="sm">
                      Journal Entry
                    </Badge>
                  ) : (
                    <span className="journal-footer-date">
                      <Calendar size={11} />
                      Updated {lastUpdated}
                    </span>
                  )}
                  <span className="journal-page-number">
                    Page {i + 1} of {totalPages - 2}
                  </span>
                </div>
              </div>
            </Page>
          ))}

          {/* Back cover */}
          <Page className="rpf-page rpf-cover rpf-cover-back">
            <div className="journal-cover-face journal-cover-face-back">
              <div className="journal-cover-rule" />
              <span className="journal-cover-endnote">— end of entry —</span>
            </div>
          </Page>
        </FlipBook>
      </div>

      <div className="entry-action-bar">
        <button type="button" className="entry-btn entry-btn-danger" onClick={onDelete}>
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
        <button type="button" className="entry-btn entry-btn-primary" onClick={onEdit}>
          <Edit3 size={16} />
          <span>Edit Entry</span>
        </button>
        <button type="button" className="entry-btn entry-btn-ghost entry-btn-close" onClick={handleClose}>
          <X size={16} />
          <span>Close</span>
        </button>
      </div>
    </div>
  );
}