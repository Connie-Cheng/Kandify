import { useState, useEffect, useRef } from 'react';
import { X, Check, MessageSquare, Play, Pause, Upload, Wand2 } from 'lucide-react';
import { Song } from '../App';
import { songLyrics } from '../data/lyrics';
import { EnhancedBeadGallery, EnhancedBeadOption } from './EnhancedBeadGallery';
import { CordCustomizer } from './CordCustomizer';
import { ShapedBead } from './ShapedBead';
import { LetterBead } from './LetterBead';
import { NumberBead } from './NumberBead';
import { CustomImageBead } from './CustomImageBead';

export interface CustomBead extends EnhancedBeadOption {
  timestamp: number;
  lyricText: string;
  note?: string;
}

export type { EnhancedBeadOption };

interface ImprovedSongViewProps {
  song: Song;
  onClose: () => void;
  currentTime: number;
  onAddBead: (bead: CustomBead) => void;
  customBeads: CustomBead[];
  onSeekToTime: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

// Generate a bead based on lyric keywords and song context
function generateBeadFromLyric(text: string, songTitle: string, artist: string): EnhancedBeadOption {
  const t = (text + ' ' + songTitle + ' ' + artist).toLowerCase();

  let color = '#ff6b9d';
  let shape: 'circle' | 'heart' | 'star' | 'flower' | 'square' = 'circle';
  let material: 'glossy' | 'metallic' | 'iridescent' = 'glossy';

  if (/love|heart|kiss|hold|close|baby|darling|mine/.test(t)) {
    color = '#ff1744'; shape = 'heart';
  } else if (/star|shine|light|bright|glow|sparkl|heaven|sky|angel/.test(t)) {
    color = '#ffd600'; shape = 'star'; material = 'metallic';
  } else if (/flower|bloom|rose|garden|spring|petal|blossom/.test(t)) {
    color = '#e91e63'; shape = 'flower';
  } else if (/night|dark|moon|dream|sleep|midnight|shadow/.test(t)) {
    color = '#5c6bc0'; shape = 'circle'; material = 'iridescent';
  } else if (/dance|move|beat|rhythm|music|party|energy|jump/.test(t)) {
    color = '#4caf50'; shape = 'square';
  } else if (/cry|tear|pain|hurt|broken|lost|alone|gone/.test(t)) {
    color = '#42a5f5'; shape = 'circle'; material = 'iridescent';
  } else if (/fire|burn|hot|passion|desire|wild|blaze/.test(t)) {
    color = '#ff6f00'; shape = 'star';
  } else if (/gold|sun|golden|warm|forever|shine/.test(t)) {
    color = '#ffc107'; shape = 'star'; material = 'metallic';
  } else if (/purple|violet|magic|electric|neon|power/.test(t)) {
    color = '#9c27b0'; shape = 'flower'; material = 'iridescent';
  } else if (/blue|ocean|rain|wave|water|river|sea/.test(t)) {
    color = '#2196f3'; shape = 'circle';
  } else if (/run|free|fly|wind|breathe|open|wide/.test(t)) {
    color = '#00bcd4'; shape = 'square';
  }

  return {
    id: `gen-${Date.now()}`,
    type: 'shaped',
    shape,
    color,
    material,
    size: 'medium',
  } as EnhancedBeadOption;
}

export function ImprovedSongView({
  song,
  onClose,
  currentTime,
  onAddBead,
  customBeads,
  onSeekToTime,
  isPlaying,
  onTogglePlay,
}: ImprovedSongViewProps) {
  const [selectedBead, setSelectedBead] = useState<EnhancedBeadOption | null>(null);
  const [selectedLyricIndex, setSelectedLyricIndex] = useState<number | null>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [cordType, setCordType] = useState<'string' | 'metal' | 'leather'>('string');
  const [cordColor, setCordColor] = useState('#ff6b9d');
  const [lyricBeads, setLyricBeads] = useState<Map<number, CustomBead>>(new Map());
  const [lyricNotes, setLyricNotes] = useState<Map<number, string>>(new Map());
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [customImages, setCustomImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lyrics = songLyrics[song.id] || [];
  const songDuration = song.id === 2 ? 632 : (lyrics.length > 0 ? lyrics[lyrics.length - 1].time + 5 : 60);

  useEffect(() => {
    const currentIndex = lyrics.findIndex((lyric, i) => {
      const nextLyric = lyrics[i + 1];
      return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
    });
    if (currentIndex !== -1) setCurrentLyricIndex(currentIndex);
  }, [currentTime, lyrics]);

  // Click a lyric: select it for bead/note addition + seek to its time
  const handleLyricClick = (index: number) => {
    onSeekToTime(lyrics[index].time);
    setSelectedLyricIndex(prev => prev === index ? null : index);
  };

  // Double-click an existing bead to remove it
  const handleLyricDoubleClick = (index: number) => {
    const beadAtIndex = lyricBeads.get(index);
    if (beadAtIndex) {
      const newMap = new Map(lyricBeads);
      newMap.delete(index);
      setLyricBeads(newMap);
      if (selectedLyricIndex === index) setSelectedLyricIndex(null);
    }
  };

  // When a bead is selected from the gallery: auto-add to selected lyric if one is active
  const handleBeadSelect = (bead: EnhancedBeadOption) => {
    setSelectedBead(bead);
    if (selectedLyricIndex !== null && !lyricBeads.has(selectedLyricIndex)) {
      const pendingNote = lyricNotes.get(selectedLyricIndex);
      const newBead: CustomBead = {
        ...bead,
        timestamp: lyrics[selectedLyricIndex].time,
        lyricText: lyrics[selectedLyricIndex].text,
        note: pendingNote || undefined,
      };
      setLyricBeads(new Map(lyricBeads.set(selectedLyricIndex, newBead)));
      setSelectedLyricIndex(null);
    }
  };

  // Open the note dialog — works with or without an existing bead
  const handleOpenNote = (index: number) => {
    setEditingNoteIndex(index);
    const bead = lyricBeads.get(index);
    const pendingNote = lyricNotes.get(index);
    setNoteText(bead?.note || pendingNote || '');
  };

  const handleSaveNote = () => {
    if (editingNoteIndex === null) return;
    const bead = lyricBeads.get(editingNoteIndex);
    if (bead) {
      // Attach note to existing bead
      const updatedBead = { ...bead, note: noteText.trim() || undefined };
      setLyricBeads(new Map(lyricBeads.set(editingNoteIndex, updatedBead)));
    } else {
      // Store as pending note — attached when bead is added
      const newNotes = new Map(lyricNotes);
      if (noteText.trim()) {
        newNotes.set(editingNoteIndex, noteText.trim());
      } else {
        newNotes.delete(editingNoteIndex);
      }
      setLyricNotes(newNotes);
    }
    setEditingNoteIndex(null);
    setNoteText('');
  };

  // Generate a bead automatically from the selected lyric's content
  const handleGenerateBead = () => {
    if (selectedLyricIndex === null) return;
    const lyric = lyrics[selectedLyricIndex];
    const generated = generateBeadFromLyric(lyric.text, song.title, song.artist);
    const pendingNote = lyricNotes.get(selectedLyricIndex);
    const newBead: CustomBead = {
      ...generated,
      timestamp: lyric.time,
      lyricText: lyric.text,
      note: pendingNote || undefined,
    };
    setSelectedBead(generated);
    setLyricBeads(new Map(lyricBeads.set(selectedLyricIndex, newBead)));
    setSelectedLyricIndex(null);
  };

  const handleFinish = () => {
    lyricBeads.forEach(bead => onAddBead(bead));
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setCustomImages(prev => [...prev, imageUrl]);
        setSelectedBead({
          id: `custom-image-${Date.now()}`,
          type: 'shaped',
          shape: 'circle',
          color: '#ffffff',
          customImage: imageUrl,
        } as any);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCordStyle = () => {
    if (cordType === 'string') {
      return {
        width: '3px',
        background: `repeating-linear-gradient(0deg, ${cordColor} 0px, ${cordColor} 4px, transparent 4px, transparent 8px)`,
        opacity: 0.5,
      };
    } else if (cordType === 'metal') {
      return {
        width: '2px',
        background: `linear-gradient(90deg, ${cordColor}, #ffffff 50%, ${cordColor})`,
        boxShadow: `0 0 8px ${cordColor}, 0 0 4px rgba(255,255,255,0.8)`,
        opacity: 0.5,
      };
    } else {
      return {
        width: '6px',
        background: cordColor,
        borderRadius: '3px',
        opacity: 0.5,
      };
    }
  };

  const progress = (currentTime / songDuration) * 100;

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
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(14, 14, 17, 0.5)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 glass-morph-header">
        <div>
          <h1 className="text-2xl font-bold">{song.title}</h1>
          <p className="text-white/60">{song.artist}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 glass-button rounded-full flex items-center justify-center transition-all hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white fill-white" />
            ) : (
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            )}
          </button>
          <button
            onClick={handleFinish}
            className="text-white px-6 py-2 rounded-full font-medium transition-all hover:scale-105 flex items-center gap-2 glow-button"
            style={{
              background: `radial-gradient(circle at 30% 50%, ${cordColor}, ${cordColor}dd)`,
              boxShadow: `0 0 20px ${cordColor}40, 0 0 40px ${cordColor}20`
            }}
          >
            <Check className="w-4 h-4" />
            Save
          </button>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden glass-morph">
        {/* Left: Bead Selection */}
        <div className="w-[380px] glass-morph-panel overflow-y-auto p-5 scrollbar-thin">
          <div className="space-y-5">
            <CordCustomizer
              cordType={cordType}
              cordColor={cordColor}
              onChangeCordType={setCordType}
              onChangeCordColor={setCordColor}
            />

            {/* Custom Beads */}
            <div className="space-y-2.5 p-4 glass-card rounded-3xl inner-glow">
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Custom Beads</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 glass-button rounded-xl text-sm font-medium text-white transition-all hover:scale-102 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload PNG Image
              </button>
              <button
                onClick={handleGenerateBead}
                disabled={selectedLyricIndex === null}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
                style={{
                  background: selectedLyricIndex !== null
                    ? `radial-gradient(circle at 30% 50%, ${cordColor}cc, ${cordColor}88)`
                    : 'rgba(255,255,255,0.06)',
                  opacity: selectedLyricIndex !== null ? 1 : 0.45,
                  cursor: selectedLyricIndex !== null ? 'pointer' : 'not-allowed',
                }}
                title={selectedLyricIndex === null ? 'Click a lyric first to generate a bead for it' : 'Generate a bead based on this lyric'}
              >
                <Wand2 className="w-4 h-4" />
                Generate Bead
              </button>
              {customImages.length > 0 && (
                <div className="grid grid-cols-6 gap-1.5 mt-3">
                  {customImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleBeadSelect({
                        id: `custom-image-${idx}`,
                        type: 'shaped',
                        shape: 'circle',
                        color: '#ffffff',
                        customImage: img,
                      } as any)}
                      className="flex items-center justify-center p-1 rounded-xl glass-button transition-all hover:scale-110"
                    >
                      <CustomImageBead imageUrl={img} size="small" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wider">Bead Collection</p>
              <EnhancedBeadGallery onSelectBead={handleBeadSelect} selectedBead={selectedBead} />
            </div>
          </div>
        </div>

        {/* Right: Lyrics */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-3xl p-6 inner-glow vignette relative">
              {/* Persistent Cord Line */}
              <div
                className="absolute left-[3.5rem] top-6 bottom-6 rounded-full"
                style={getCordStyle()}
              />

              <div className="space-y-3 relative z-10">
                {lyrics.map((lyric, index) => {
                  const isActive = index === currentLyricIndex;
                  const isSelected = index === selectedLyricIndex;
                  const distance = Math.abs(index - currentLyricIndex);
                  const bead = lyricBeads.get(index);
                  const hasPendingNote = lyricNotes.has(index);

                  const opacity = distance === 0 ? 1 : distance === 1 ? 0.7 : distance === 2 ? 0.5 : distance === 3 ? 0.35 : 0.2;
                  const blur = distance === 0 ? 0 : distance === 1 ? 0.5 : distance === 2 ? 1 : 1.5;

                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-4 group rounded-xl transition-all duration-200 ${isSelected ? '-mx-2 px-2 py-1' : ''}`}
                      style={isSelected ? {
                        background: `${cordColor}12`,
                        boxShadow: `inset 3px 0 0 ${cordColor}88`,
                      } : {}}
                    >
                      {/* Bead slot */}
                      <div className="w-16 flex flex-col items-center pt-1 flex-shrink-0">
                        {bead ? (
                          <div className="relative">
                            {bead.customImage ? (
                              <CustomImageBead imageUrl={bead.customImage} />
                            ) : bead.type === 'shaped' ? (
                              <ShapedBead shape={bead.shape!} color={bead.color} material={bead.material} />
                            ) : bead.type === 'letter' ? (
                              <LetterBead letter={bead.letter!} color={bead.color} />
                            ) : bead.type === 'number' ? (
                              <NumberBead number={bead.number!} color={bead.color} />
                            ) : null}
                            <button
                              onClick={() => handleOpenNote(index)}
                              className="absolute -right-1 -top-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              style={{ backgroundColor: cordColor }}
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                            {bead.note && (
                              <div className="absolute -right-1 -top-1 w-3 h-3 rounded-full border-2 border-black" style={{ backgroundColor: cordColor }} />
                            )}
                          </div>
                        ) : isSelected ? (
                          // Placeholder circle for selected lyric with no bead
                          <div
                            className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center text-xs"
                            style={{ borderColor: `${cordColor}60`, color: `${cordColor}60` }}
                          >
                            +
                          </div>
                        ) : null}
                      </div>

                      {/* Lyric + actions */}
                      <div className="flex-1 min-w-0">
                        <div
                          onClick={() => handleLyricClick(index)}
                          onDoubleClick={() => handleLyricDoubleClick(index)}
                          className="cursor-pointer transition-all duration-300 py-1"
                          style={{ opacity: isSelected ? 1 : opacity, filter: `blur(${isSelected ? 0 : blur}px)` }}
                        >
                          <p className={`text-2xl leading-relaxed ${isActive || isSelected ? 'font-bold text-white' : 'font-medium text-white/80'}`}>
                            {lyric.text}
                          </p>
                        </div>

                        {/* Inline actions for selected lyric */}
                        {isSelected && !bead && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              onClick={() => handleOpenNote(index)}
                              className="text-xs px-3 py-1 rounded-full transition-all hover:scale-105"
                              style={{
                                background: `${cordColor}22`,
                                color: cordColor,
                                border: `1px solid ${cordColor}44`,
                              }}
                            >
                              {hasPendingNote ? 'Edit Note' : '+ Add Note'}
                            </button>
                            {hasPendingNote && (
                              <span className="text-xs text-white/35 italic truncate max-w-[200px]">
                                "{lyricNotes.get(index)}"
                              </span>
                            )}
                          </div>
                        )}

                        {/* Note display for beads */}
                        {bead?.note && (
                          <div className="mt-2 glass-card rounded-xl p-3 inner-glow">
                            <p className="text-sm text-white/70 italic">{bead.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-xs text-white/35 mt-6">
                {selectedLyricIndex !== null
                  ? 'Select a bead from the panel or click Generate Bead'
                  : 'Click a lyric to select it, then choose a bead • Double-click an existing bead to remove it'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Preview */}
      <div className="px-6 py-3 glass-morph-header">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between text-xs text-white/60 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(songDuration)}</span>
          </div>
          <div className="relative h-1 bg-white/10 rounded-full group cursor-pointer">
            <div
              className="absolute h-full transition-all rounded-full"
              style={{ width: `${progress}%`, backgroundColor: cordColor }}
            />
            <div
              className="absolute w-3 h-3 bg-white rounded-full top-1/2 -translate-y-1/2 shadow-lg"
              style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
            />
            {Array.from(lyricBeads.values()).map((bead, index) => {
              const beadPosition = (bead.timestamp / songDuration) * 100;
              return (
                <div
                  key={index}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                  style={{ left: `${beadPosition}%` }}
                  title={bead.lyricText}
                >
                  <div style={{ transform: 'scale(1.0)' }}>
                    {bead.customImage ? (
                      <CustomImageBead imageUrl={bead.customImage} size="small" />
                    ) : bead.type === 'shaped' ? (
                      <ShapedBead shape={bead.shape!} color={bead.color} material={bead.material} size="small" />
                    ) : bead.type === 'letter' ? (
                      <LetterBead letter={bead.letter!} color={bead.color} size="small" />
                    ) : bead.type === 'number' ? (
                      <NumberBead number={bead.number!} color={bead.color} size="small" />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Note Dialog */}
      {editingNoteIndex !== null && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-10">
          <div className="glass-card rounded-3xl p-8 w-full max-w-lg mx-4 outer-glow-soft">
            <h3 className="text-xl font-bold mb-2">Add Note</h3>
            <p className="text-sm text-white/60 mb-6">"{lyrics[editingNoteIndex]?.text}"</p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="What does this moment mean to you?"
              className="w-full glass-card inner-glow rounded-2xl p-4 text-white placeholder:text-white/40 resize-none focus:outline-none transition-all"
              style={{ border: 'none' }}
              rows={5}
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setEditingNoteIndex(null); setNoteText(''); }}
                className="flex-1 glass-button text-white py-3 rounded-full font-medium transition-all hover:scale-102"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 text-white py-3 rounded-full font-medium transition-all hover:scale-102"
                style={{
                  background: `radial-gradient(circle at 30% 50%, ${cordColor}, ${cordColor}dd)`,
                  boxShadow: `0 0 20px ${cordColor}40, 0 0 40px ${cordColor}20`
                }}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
