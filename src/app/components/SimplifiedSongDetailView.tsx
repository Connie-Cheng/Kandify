import { useState, useEffect } from 'react';
import { X, Check, MessageSquare } from 'lucide-react';
import { Song } from '../App';
import { songLyrics } from '../data/lyrics';
import { EnhancedBeadGallery, EnhancedBeadOption } from './EnhancedBeadGallery';
import { CordCustomizer } from './CordCustomizer';
import { ShapedBead } from './ShapedBead';
import { LetterBead } from './LetterBead';
import { NumberBead } from './NumberBead';

export interface CustomBead extends EnhancedBeadOption {
  timestamp: number;
  lyricText: string;
  note?: string;
}

export type { EnhancedBeadOption };

interface SimplifiedSongDetailViewProps {
  song: Song;
  onClose: () => void;
  currentTime: number;
  onAddBead: (bead: CustomBead) => void;
  customBeads: CustomBead[];
  onSeekToTime: (time: number) => void;
}

export function SimplifiedSongDetailView({
  song,
  onClose,
  currentTime,
  onAddBead,
  customBeads,
  onSeekToTime,
}: SimplifiedSongDetailViewProps) {
  const [selectedBead, setSelectedBead] = useState<EnhancedBeadOption | null>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [cordType, setCordType] = useState<'string' | 'metal' | 'leather'>('string');
  const [cordColor, setCordColor] = useState('#ff6b9d');
  const [lyricBeads, setLyricBeads] = useState<Map<number, CustomBead>>(new Map());
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const lyrics = songLyrics[song.id] || [];

  useEffect(() => {
    const currentIndex = lyrics.findIndex((lyric, i) => {
      const nextLyric = lyrics[i + 1];
      return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
    });
    if (currentIndex !== -1) setCurrentLyricIndex(currentIndex);
  }, [currentTime, lyrics]);

  const handleLyricDoubleClick = (index: number) => {
    const beadAtIndex = lyricBeads.get(index);

    if (beadAtIndex) {
      // Remove bead
      const newMap = new Map(lyricBeads);
      newMap.delete(index);
      setLyricBeads(newMap);
    } else if (selectedBead) {
      // Add bead
      const newBead: CustomBead = {
        ...selectedBead,
        timestamp: lyrics[index].time,
        lyricText: lyrics[index].text,
      };
      setLyricBeads(new Map(lyricBeads.set(index, newBead)));
    }
  };

  const handleAddNote = (index: number) => {
    const bead = lyricBeads.get(index);
    if (bead) {
      setEditingNoteIndex(index);
      setNoteText(bead.note || '');
    }
  };

  const handleSaveNote = () => {
    if (editingNoteIndex === null) return;
    const bead = lyricBeads.get(editingNoteIndex);
    if (bead) {
      const updatedBead = { ...bead, note: noteText };
      setLyricBeads(new Map(lyricBeads.set(editingNoteIndex, updatedBead)));
    }
    setEditingNoteIndex(null);
    setNoteText('');
  };

  const handleFinish = () => {
    lyricBeads.forEach(bead => onAddBead(bead));
    onClose();
  };

  const getCordStyle = () => {
    if (cordType === 'string') {
      return { height: '3px', background: `repeating-linear-gradient(90deg, ${cordColor} 0px, ${cordColor} 2px, transparent 2px, transparent 4px)` };
    } else if (cordType === 'metal') {
      return { height: '2px', background: `linear-gradient(to bottom, ${cordColor}, #000 50%, ${cordColor})`, boxShadow: '0 0 4px rgba(255,255,255,0.5)' };
    } else {
      return { height: '4px', background: cordColor, borderRadius: '2px' };
    }
  };

  const getVisibleRange = () => {
    if (lyrics.length === 0) return { start: 0, end: 0 };
    const start = Math.max(0, currentLyricIndex - 3);
    const end = Math.min(lyrics.length, currentLyricIndex + 4);
    return { start, end };
  };

  const { start, end } = getVisibleRange();

  if (lyrics.length === 0) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60">No lyrics available for this song</p>
          <button onClick={onClose} className="mt-4 text-red-500">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex">
      {/* Left: Lyrics with Beads and Cord */}
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
            <p className="text-xl text-white/60">{song.artist}</p>
          </div>

          <div className="bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800">
            <div className="space-y-6">
              {lyrics.slice(start, end).map((lyric, relativeIndex) => {
                const index = start + relativeIndex;
                const isActive = index === currentLyricIndex;
                const distance = Math.abs(index - currentLyricIndex);
                const bead = lyricBeads.get(index);

                let opacity = distance === 0 ? 1 : distance === 1 ? 0.6 : distance === 2 ? 0.4 : 0.25;
                let blur = distance === 0 ? 0 : distance === 1 ? 1 : 2;

                return (
                  <div key={index} className="flex items-center gap-4">
                    {/* Cord and Bead */}
                    <div className="w-20 flex flex-col items-center justify-center">
                      {bead && (
                        <>
                          {relativeIndex > 0 && <div style={getCordStyle()} className="w-1 h-8 mb-2" />}
                          <div className="relative group">
                            {bead.type === 'shaped' && (
                              <ShapedBead shape={bead.shape!} color={bead.color} material={bead.material} />
                            )}
                            {bead.type === 'letter' && (
                              <LetterBead letter={bead.letter!} color={bead.color} />
                            )}
                            {bead.type === 'number' && (
                              <NumberBead number={bead.number!} color={bead.color} />
                            )}
                            <button
                              onClick={() => handleAddNote(index)}
                              className="absolute -right-2 -top-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Add note"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                            {bead.note && (
                              <div className="absolute -right-1 -top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-black" />
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Lyric */}
                    <div
                      onDoubleClick={() => handleLyricDoubleClick(index)}
                      className="flex-1 cursor-pointer transition-all duration-300"
                      style={{ opacity, filter: `blur(${blur}px)` }}
                    >
                      <p className={`text-2xl ${isActive ? 'font-bold text-white' : 'font-medium text-white/70'}`}>
                        {lyric.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-sm text-white/40 mt-8">
              {selectedBead ? '✨ Double-click lyric to add bead • Double-click bead to remove' : '👆 Select a bead first'}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="w-[450px] bg-zinc-950 border-l border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold">Create Bracelet</h2>
          <div className="flex gap-2">
            <button
              onClick={handleFinish}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 text-sm"
            >
              <Check className="w-4 h-4" />
              Finish
            </button>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {selectedBead && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-white/60 mb-3">SELECTED BEAD</p>
              <div className="flex items-center justify-center">
                {selectedBead.type === 'shaped' && (
                  <ShapedBead shape={selectedBead.shape!} color={selectedBead.color} material={selectedBead.material} size="large" />
                )}
                {selectedBead.type === 'letter' && (
                  <LetterBead letter={selectedBead.letter!} color={selectedBead.color} size="large" />
                )}
                {selectedBead.type === 'number' && (
                  <NumberBead number={selectedBead.number!} color={selectedBead.color} size="large" />
                )}
              </div>
            </div>
          )}

          <CordCustomizer
            cordType={cordType}
            cordColor={cordColor}
            onChangeCordType={setCordType}
            onChangeCordColor={setCordColor}
          />

          <div>
            <p className="text-xs font-semibold text-white/60 mb-3">BEAD COLLECTION</p>
            <EnhancedBeadGallery onSelectBead={setSelectedBead} selectedBead={selectedBead} />
          </div>
        </div>
      </div>

      {/* Note Dialog */}
      {editingNoteIndex !== null && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md mx-4 border border-zinc-800">
            <h3 className="text-lg font-bold mb-2">Add Note</h3>
            <p className="text-sm text-white/60 mb-4">"{lyrics[editingNoteIndex]?.text}"</p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="What does this moment mean to you?"
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white placeholder:text-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setEditingNoteIndex(null); setNoteText(''); }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
