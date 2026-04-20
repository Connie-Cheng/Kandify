import { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
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
}

interface ImprovedSongDetailViewProps {
  song: Song;
  onClose: () => void;
  currentTime: number;
  onAddBead: (bead: CustomBead) => void;
  customBeads: CustomBead[];
  onSeekToTime: (time: number) => void;
}

export function ImprovedSongDetailView({
  song,
  onClose,
  currentTime,
  onAddBead,
  customBeads,
  onSeekToTime,
}: ImprovedSongDetailViewProps) {
  const [selectedBead, setSelectedBead] = useState<EnhancedBeadOption | null>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [cordType, setCordType] = useState<'string' | 'metal' | 'leather'>('string');
  const [cordColor, setCordColor] = useState('#ff6b9d');
  const [lyricBeads, setLyricBeads] = useState<Map<number, EnhancedBeadOption>>(new Map());
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const lyrics = songLyrics[song.id] || [];
  const songDuration = lyrics.length > 0 ? lyrics[lyrics.length - 1].time + 4 : 60;

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

  const handleLyricClick = (index: number) => {
    if (selectedBead) {
      // Add bead to this lyric
      setLyricBeads(new Map(lyricBeads.set(index, selectedBead)));
    } else {
      // Seek to this time
      onSeekToTime(lyrics[index].time);
    }
  };

  const handleFinish = () => {
    // Add all selected beads to the custom beads array
    lyricBeads.forEach((bead, index) => {
      onAddBead({
        ...bead,
        timestamp: lyrics[index].time,
        lyricText: lyrics[index].text,
      });
    });
    onClose();
  };

  const getCordStyle = () => {
    const baseStyle = {
      backgroundColor: cordColor,
    };

    if (cordType === 'string') {
      return {
        ...baseStyle,
        height: '3px',
        backgroundImage: `repeating-linear-gradient(
          90deg,
          ${cordColor},
          ${cordColor} 2px,
          transparent 2px,
          transparent 4px
        )`,
      };
    } else if (cordType === 'metal') {
      return {
        ...baseStyle,
        height: '2px',
        backgroundImage: `linear-gradient(to bottom, ${cordColor}, #000000 50%, ${cordColor})`,
        boxShadow: '0 0 4px rgba(255,255,255,0.5)',
      };
    } else {
      return {
        ...baseStyle,
        height: '4px',
        borderRadius: '2px',
      };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">{song.title}</h1>
              <p className="text-lg text-white/60">{song.artist}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleFinish}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Check className="w-5 h-5" />
                Finish Bracelet
              </button>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Lyrics with Beads */}
          <div className="bg-zinc-900 rounded-2xl p-8 mb-6">
            <div className="mb-4 flex items-center gap-2 text-sm text-white/60">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>START</span>
            </div>

            <div ref={lyricsContainerRef} className="space-y-4 mb-4">
              {lyrics.map((lyric, index) => {
                const beadForLyric = lyricBeads.get(index);
                const isActive = index === currentLyricIndex;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 cursor-pointer transition-all duration-300 ${
                      isActive ? 'scale-105' : ''
                    }`}
                    onClick={() => handleLyricClick(index)}
                  >
                    <div
                      className={`flex-1 text-xl ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      {lyric.text}
                    </div>

                    <div className="w-12 h-12 flex items-center justify-center">
                      {beadForLyric && (
                        <>
                          {beadForLyric.type === 'shaped' && (
                            <ShapedBead
                              shape={beadForLyric.shape!}
                              color={beadForLyric.color}
                              material={beadForLyric.material}
                              size="medium"
                            />
                          )}
                          {beadForLyric.type === 'letter' && (
                            <LetterBead letter={beadForLyric.letter!} color={beadForLyric.color} />
                          )}
                          {beadForLyric.type === 'number' && (
                            <NumberBead number={beadForLyric.number!} color={beadForLyric.color} />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-sm text-white/60">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>END</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-white/80">
              {selectedBead
                ? '✨ Click on a lyric to add the selected bead to that moment'
                : '👆 Select a bead below, then click lyrics to add them'}
            </p>
          </div>

          {/* Bracelet Timeline */}
          <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-white/80 mb-4">
              Your Bracelet Timeline ({lyricBeads.size} beads)
            </h3>
            <div className="relative min-h-[80px] flex items-center">
              {lyricBeads.size > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {Array.from(lyricBeads.entries())
                    .sort((a, b) => lyrics[a[0]].time - lyrics[b[0]].time)
                    .map(([index, bead], i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          {bead.type === 'shaped' && (
                            <ShapedBead
                              shape={bead.shape!}
                              color={bead.color}
                              material={bead.material}
                              size="medium"
                            />
                          )}
                          {bead.type === 'letter' && (
                            <LetterBead letter={bead.letter!} color={bead.color} />
                          )}
                          {bead.type === 'number' && (
                            <NumberBead number={bead.number!} color={bead.color} />
                          )}
                        </div>
                        {i < lyricBeads.size - 1 && (
                          <div style={getCordStyle()} className="w-4" />
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm">No beads added yet...</p>
              )}
            </div>
          </div>

          {/* Cord Customizer */}
          <div className="mb-6">
            <CordCustomizer
              cordType={cordType}
              cordColor={cordColor}
              onChangeCordType={setCordType}
              onChangeCordColor={setCordColor}
            />
          </div>

          {/* Bead Gallery */}
          <div className="bg-zinc-900 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Bead Collection</h3>
            <EnhancedBeadGallery onSelectBead={setSelectedBead} selectedBead={selectedBead} />
          </div>
        </div>
      </div>
    </div>
  );
}
