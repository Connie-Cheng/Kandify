import { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { UserProfile, CollabNote } from '../services/social';

export interface CollabBead {
  color: string;
  contributor: string;
}

interface Props {
  songTitle: string;
  originalBeads: Array<{ color: string }>;
  collaborators: UserProfile[];
  recipientName: string;
  onComplete: (addedBeads: CollabBead[], collabNotes: CollabNote[]) => void;
  onClose: () => void;
}

export function CollabBeadScreen({ songTitle, originalBeads, collaborators, recipientName, onComplete, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [collabBeads, setCollabBeads] = useState<CollabBead[][]>(collaborators.map(() => []));
  const [currentNote, setCurrentNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>(collaborators.map(() => ''));

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const currentCollab = collaborators[currentIndex];
  const isLast = currentIndex === collaborators.length - 1;

  // Ring shows only collab-added beads (starts empty; original gift beads are added on send)
  const prevCollabBeads = collabBeads.slice(0, currentIndex).flat();
  const currentBeads = collabBeads[currentIndex];
  const allDisplayBeads: Array<{ color: string; isNew: boolean }> = [
    ...prevCollabBeads.map(b => ({ color: b.color, isNew: false })),
    ...currentBeads.map(b => ({ color: b.color, isNew: true })),
  ];

  const handleAddBead = () => {
    setCollabBeads(prev => {
      const updated = [...prev];
      updated[currentIndex] = [...updated[currentIndex], { color: currentCollab.color, contributor: currentCollab.name }];
      return updated;
    });
  };

  const handleUndo = () => {
    setCollabBeads(prev => {
      const updated = [...prev];
      if (updated[currentIndex].length > 0) {
        updated[currentIndex] = updated[currentIndex].slice(0, -1);
      }
      return updated;
    });
  };

  const handleConfirm = () => {
    const notes = [...savedNotes];
    notes[currentIndex] = currentNote;
    setSavedNotes(notes);
    setTransitioning(true);

    setTimeout(() => {
      if (isLast) {
        const allBeads = collabBeads.flat();
        const allNotes: CollabNote[] = collaborators
          .map((c, i) => notes[i].trim() ? { contributor: c.name, color: c.color, note: notes[i].trim() } : null)
          .filter((n): n is CollabNote => n !== null);
        onComplete(allBeads, allNotes);
      } else {
        setCurrentIndex(i => i + 1);
        setCurrentNote('');
        setTransitioning(false);
      }
    }, 480);
  };

  const displayed = allDisplayBeads.slice(0, 28);
  const total = displayed.length;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      style={{
        background: '#09090f',
        opacity: visible && !transitioning ? 1 : 0,
        transition: 'opacity 0.42s ease-in-out',
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-20 bg-black/50 rounded-full p-2 text-white/50 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-sm flex flex-col items-center gap-5">

        {/* Step header */}
        <div className="text-center">
          <p className="text-[10px] text-white/35 uppercase tracking-[0.18em] mb-1">
            Step {currentIndex + 1} of {collaborators.length}
          </p>
          <h2 className="text-xl font-bold" style={{ color: currentCollab.color, textShadow: `0 0 20px ${currentCollab.color}66` }}>
            {currentCollab.name}'s turn
          </h2>
          <p className="text-sm text-white/45 mt-0.5">
            Adding to <span className="text-white/75 italic">"{songTitle}"</span> for {recipientName}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2.5">
          {collaborators.map((c, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-400"
              style={{
                width: i === currentIndex ? 20 : 8,
                height: 8,
                background: i < currentIndex ? c.color : i === currentIndex ? currentCollab.color : 'rgba(255,255,255,0.15)',
                boxShadow: i === currentIndex ? `0 0 8px ${currentCollab.color}` : 'none',
              }}
            />
          ))}
        </div>

        {/* Bracelet preview */}
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Cord ring */}
          <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5"
            style={{ filter: `drop-shadow(0 0 6px ${currentCollab.color}30)` }} />
          {/* Beads */}
          {displayed.map((bead, i) => {
            const a = (2 * Math.PI * i / Math.max(total, 8)) - Math.PI / 2;
            return (
              <circle
                key={i}
                cx={100 + Math.cos(a) * 72}
                cy={100 + Math.sin(a) * 72}
                r={bead.isNew ? 7.5 : 6}
                fill={bead.color}
                style={{
                  filter: `drop-shadow(0 0 ${bead.isNew ? 9 : 4}px ${bead.color})`,
                  transition: 'r 0.2s ease-out',
                }}
              />
            );
          })}
          {total === 0 && (
            <text x="100" y="105" textAnchor="middle" fill="rgba(255,255,255,0.18)" fontSize="11" fontStyle="italic">
              Add your beads below
            </text>
          )}
        </svg>

        {/* Add / undo controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddBead}
            className="px-7 py-2.5 rounded-full font-medium text-sm text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: `radial-gradient(circle at 30% 50%, ${currentCollab.color}, ${currentCollab.color}99)`,
              boxShadow: `0 0 18px ${currentCollab.color}44`,
            }}
          >
            + Add Bead
          </button>
          {currentBeads.length > 0 && (
            <>
              <button
                onClick={handleUndo}
                className="p-2.5 rounded-full text-white/40 hover:text-white/80 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-xs text-white/30">{currentBeads.length} added</span>
            </>
          )}
        </div>

        {/* Note textarea */}
        <div className="w-full">
          <p className="text-[10px] text-white/35 uppercase tracking-[0.15em] mb-2">
            Add a note from {currentCollab.name} <span className="normal-case">(optional)</span>
          </p>
          <textarea
            value={currentNote}
            onChange={e => setCurrentNote(e.target.value)}
            placeholder={`Write something from ${currentCollab.name}…`}
            maxLength={160}
            rows={2}
            className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 resize-none outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${currentCollab.color}28`,
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = `${currentCollab.color}70`)}
            onBlur={e => (e.target.style.borderColor = `${currentCollab.color}28`)}
          />
        </div>

        {/* Confirm / pass button */}
        <button
          onClick={handleConfirm}
          className="w-full py-3 rounded-full font-medium text-white text-sm transition-all hover:scale-105 active:scale-95"
          style={{
            background: `radial-gradient(circle at 30% 50%, ${currentCollab.color}ee, ${currentCollab.color}88)`,
            boxShadow: `0 0 18px ${currentCollab.color}44`,
          }}
        >
          {isLast
            ? 'Send the Gift →'
            : `Pass to ${collaborators[currentIndex + 1].name} →`}
        </button>
      </div>
    </div>
  );
}
