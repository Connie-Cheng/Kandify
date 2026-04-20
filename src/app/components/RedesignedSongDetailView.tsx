import { useState, useEffect } from 'react';
import { X, Check, Plus, Edit3 } from 'lucide-react';
import { Song } from '../App';
import { songLyrics } from '../data/lyrics';
import { EnhancedBeadGallery, EnhancedBeadOption } from './EnhancedBeadGallery';
import { CordCustomizer } from './CordCustomizer';
import { ShapedBead } from './ShapedBead';
import { LetterBead } from './LetterBead';
import { NumberBead } from './NumberBead';
import { AppleMusicLyrics } from './AppleMusicLyrics';

export interface CustomBead extends EnhancedBeadOption {
  timestamp: number;
  lyricText: string;
  note?: string;
}

export type { EnhancedBeadOption };

interface BeadWithNote {
  bead: EnhancedBeadOption;
  note: string;
}

interface RedesignedSongDetailViewProps {
  song: Song;
  onClose: () => void;
  currentTime: number;
  onAddBead: (bead: CustomBead) => void;
  customBeads: CustomBead[];
  onSeekToTime: (time: number) => void;
}

export function RedesignedSongDetailView({
  song,
  onClose,
  currentTime,
  onAddBead,
  customBeads,
  onSeekToTime,
}: RedesignedSongDetailViewProps) {
  const [selectedBead, setSelectedBead] = useState<EnhancedBeadOption | null>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [cordType, setCordType] = useState<'string' | 'metal' | 'leather'>('string');
  const [cordColor, setCordColor] = useState('#ff6b9d');
  const [lyricBeads, setLyricBeads] = useState<Map<number, BeadWithNote>>(new Map());
  const [editingNoteForIndex, setEditingNoteForIndex] = useState<number | null>(null);
  const [currentNote, setCurrentNote] = useState('');

  const lyrics = songLyrics[song.id] || [];
  const songDuration = lyrics.length > 0 ? lyrics[lyrics.length - 1].time + 4 : 60;

  useEffect(() => {
    const currentIndex = lyrics.findIndex((lyric, i) => {
      const nextLyric = lyrics[i + 1];
      return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
    });

    if (currentIndex !== -1) {
      setCurrentLyricIndex(currentIndex);
    }
  }, [currentTime, lyrics]);

  const handleLyricClick = (index: number) => {
    if (selectedBead) {
      // Open note dialog for this bead
      setEditingNoteForIndex(index);
      setCurrentNote('');
    } else {
      // Seek to this time
      onSeekToTime(lyrics[index].time);
    }
  };

  const handleAddBeadWithNote = () => {
    if (editingNoteForIndex === null || !selectedBead) return;

    setLyricBeads(new Map(lyricBeads.set(editingNoteForIndex, {
      bead: selectedBead,
      note: currentNote.trim()
    })));

    setEditingNoteForIndex(null);
    setCurrentNote('');
  };

  const handleSkipNote = () => {
    if (editingNoteForIndex === null || !selectedBead) return;

    setLyricBeads(new Map(lyricBeads.set(editingNoteForIndex, {
      bead: selectedBead,
      note: ''
    })));

    setEditingNoteForIndex(null);
    setCurrentNote('');
  };

  const handleFinish = () => {
    lyricBeads.forEach((beadWithNote, index) => {
      onAddBead({
        ...beadWithNote.bead,
        timestamp: lyrics[index].time,
        lyricText: lyrics[index].text,
        note: beadWithNote.note,
      });
    });
    onClose();
  };

  const getCordStyle = () => {
    const baseStyle = { backgroundColor: cordColor };

    if (cordType === 'string') {
      return {
        ...baseStyle,
        height: '3px',
        backgroundImage: `repeating-linear-gradient(90deg, ${cordColor}, ${cordColor} 2px, transparent 2px, transparent 4px)`,
      };
    } else if (cordType === 'metal') {
      return {
        ...baseStyle,
        height: '2px',
        backgroundImage: `linear-gradient(to bottom, ${cordColor}, #000000 50%, ${cordColor})`,
        boxShadow: '0 0 4px rgba(255,255,255,0.5)',
      };
    } else {
      return { ...baseStyle, height: '4px', borderRadius: '2px' };
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex">
      {/* Left: Lyrics */}
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
            <p className="text-xl text-white/60">{song.artist}</p>
          </div>

          <AppleMusicLyrics
            lyrics={lyrics}
            currentTime={currentTime}
            onLyricClick={handleLyricClick}
            currentLyricIndex={currentLyricIndex}
          />

          <div className="mt-8 text-center">
            <p className="text-sm text-white/40">
              {selectedBead
                ? '✨ Click a lyric to add your selected bead'
                : '👆 Select a bead from the right, then click a lyric'}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="w-[450px] bg-zinc-950 border-l border-zinc-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold">Create Bracelet</h2>
          <div className="flex gap-2">
            <button
              onClick={handleFinish}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Check className="w-4 h-4" />
              Finish
            </button>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Selected Bead Preview */}
          {selectedBead && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-white/60 mb-3">SELECTED BEAD</p>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {selectedBead.type === 'shaped' && (
                    <ShapedBead
                      shape={selectedBead.shape!}
                      color={selectedBead.color}
                      material={selectedBead.material}
                      size="large"
                    />
                  )}
                  {selectedBead.type === 'letter' && (
                    <LetterBead letter={selectedBead.letter!} color={selectedBead.color} size="large" />
                  )}
                  {selectedBead.type === 'number' && (
                    <NumberBead number={selectedBead.number!} color={selectedBead.color} size="large" />
                  )}
                </div>
                <button
                  onClick={() => setSelectedBead(null)}
                  className="text-xs text-white/60 hover:text-white transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Bracelet Preview */}
          {lyricBeads.size > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-white/60">
                YOUR BRACELET ({lyricBeads.size} beads)
              </p>
              <div className="bg-black rounded-xl border border-zinc-800 p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {Array.from(lyricBeads.entries())
                    .sort((a, b) => lyrics[a[0]].time - lyrics[b[0]].time)
                    .map(([index, beadWithNote], i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="relative group">
                          <div className="flex-shrink-0">
                            {beadWithNote.bead.type === 'shaped' && (
                              <ShapedBead
                                shape={beadWithNote.bead.shape!}
                                color={beadWithNote.bead.color}
                                material={beadWithNote.bead.material}
                                size="medium"
                              />
                            )}
                            {beadWithNote.bead.type === 'letter' && (
                              <LetterBead letter={beadWithNote.bead.letter!} color={beadWithNote.bead.color} />
                            )}
                            {beadWithNote.bead.type === 'number' && (
                              <NumberBead number={beadWithNote.bead.number!} color={beadWithNote.bead.color} />
                            )}
                          </div>
                          {beadWithNote.note && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-black" />
                          )}
                        </div>
                        {i < lyricBeads.size - 1 && <div style={getCordStyle()} className="w-4" />}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Cord Customizer */}
          <CordCustomizer
            cordType={cordType}
            cordColor={cordColor}
            onChangeCordType={setCordType}
            onChangeCordColor={setCordColor}
          />

          {/* Bead Gallery */}
          <div>
            <p className="text-xs font-semibold text-white/60 mb-3">BEAD COLLECTION</p>
            <EnhancedBeadGallery onSelectBead={setSelectedBead} selectedBead={selectedBead} />
          </div>
        </div>
      </div>

      {/* Note Dialog */}
      {editingNoteForIndex !== null && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md mx-4 border border-zinc-800">
            <h3 className="text-lg font-bold mb-2">Add a Note</h3>
            <p className="text-sm text-white/60 mb-4">
              "{lyrics[editingNoteForIndex]?.text}"
            </p>
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="What does this moment mean to you?"
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white placeholder:text-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSkipNote}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Skip Note
              </button>
              <button
                onClick={handleAddBeadWithNote}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Bead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
