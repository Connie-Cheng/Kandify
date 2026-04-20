import { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { Song } from '../App';
import { songLyrics } from '../data/lyrics';
import { BeadGallery, BeadOption } from './BeadGallery';
import { RegularBead } from './RegularBead';
import { CharmBead } from './CharmBead';

export interface CustomBead extends BeadOption {
  timestamp: number;
  lyricText: string;
}

interface SongDetailViewProps {
  song: Song;
  onClose: () => void;
  currentTime: number;
  onAddBead: (bead: CustomBead) => void;
  customBeads: CustomBead[];
}

export function SongDetailView({ song, onClose, currentTime, onAddBead, customBeads }: SongDetailViewProps) {
  const [selectedBead, setSelectedBead] = useState<BeadOption | null>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const lyrics = songLyrics[song.id] || [];

  useEffect(() => {
    const currentIndex = lyrics.findIndex((lyric, i) => {
      const nextLyric = lyrics[i + 1];
      return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
    });

    if (currentIndex !== -1) {
      setCurrentLyricIndex(currentIndex);

      if (lyricsContainerRef.current) {
        const lyricElement = lyricsContainerRef.current.children[currentIndex] as HTMLElement;
        if (lyricElement) {
          lyricElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTime, lyrics]);

  const handleAddBead = () => {
    if (!selectedBead) return;

    const currentLyric = lyrics[currentLyricIndex];
    if (currentLyric) {
      onAddBead({
        ...selectedBead,
        timestamp: currentLyric.time,
        lyricText: currentLyric.text,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Left: Lyrics */}
      <div className="flex-1 overflow-y-auto p-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
            <p className="text-xl text-white/60">{song.artist}</p>
          </div>

          <div ref={lyricsContainerRef} className="space-y-6">
            {lyrics.map((lyric, index) => (
              <div
                key={index}
                className={`text-2xl transition-all duration-300 ${
                  index === currentLyricIndex
                    ? 'text-white font-semibold scale-105'
                    : 'text-white/40'
                }`}
              >
                {lyric.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Bead Gallery and Controls */}
      <div className="w-[400px] bg-zinc-950 border-l border-zinc-800 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Add Bead to Timeline</h2>
            <p className="text-sm text-white/60 mb-4">
              Select a bead and click "Add" to mark this moment
            </p>

            {lyrics[currentLyricIndex] && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-white/80">Current lyric:</p>
                <p className="text-white font-medium">{lyrics[currentLyricIndex].text}</p>
              </div>
            )}

            <button
              onClick={handleAddBead}
              disabled={!selectedBead}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mb-6"
            >
              <Plus className="w-5 h-5" />
              Add Bead
            </button>
          </div>

          <BeadGallery
            onSelectBead={setSelectedBead}
            selectedBead={selectedBead}
          />

          {/* Current Bracelet */}
          {customBeads.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/80">Your Bracelet ({customBeads.length} beads)</h3>
              <div className="bg-black rounded-xl border border-zinc-800 p-4">
                <div className="flex flex-wrap gap-2">
                  {customBeads.map((bead, index) => (
                    <div key={index} className="flex-shrink-0">
                      {bead.type === 'bead' ? (
                        <RegularBead
                          color={bead.color}
                          material={bead.material}
                          size={bead.size}
                        />
                      ) : (
                        <CharmBead
                          type={bead.charmType!}
                          color={bead.color}
                          material={bead.material as 'glossy' | 'metallic' | 'matte'}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
