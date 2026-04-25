import { X, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { ShapedBead } from './ShapedBead';
import { LetterBead } from './LetterBead';
import { NumberBead } from './NumberBead';
import { CustomImageBead } from './CustomImageBead';
import { CustomBead } from './ImprovedSongView';

interface BraceletListeningViewProps {
  songTitle: string;
  artist: string;
  coverUrl: string;
  beads: CustomBead[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
  currentTime: number;
  duration: number;
  onSeekToTime?: (time: number) => void;
  cordColor?: string;
  // Playlist context (only present when opened via a playlist bracelet).
  // When set, prev/next buttons appear flanking the play button.
  onPrev?: () => void;
  onNext?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  playlistName?: string;
  playlistPosition?: string;  // e.g. "3 / 8"
}

export function BraceletListeningView({
  songTitle,
  artist,
  coverUrl,
  beads,
  isPlaying,
  onTogglePlay,
  onClose,
  currentTime,
  duration,
  onSeekToTime,
  cordColor = '#ff6b9d',
  onPrev,
  onNext,
  canPrev = false,
  canNext = false,
  playlistName,
  playlistPosition,
}: BraceletListeningViewProps) {
  const progress = (currentTime / duration) * 100;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeekToTime) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onSeekToTime(newTime);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8" style={{ background: 'rgba(14, 14, 17, 0.98)' }}>
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="max-w-xl w-full space-y-8">
        {/* Playlist header (only when opened via a playlist bracelet) */}
        {playlistName && (
          <div className="text-center -mb-4">
            <p className="text-xs uppercase tracking-widest text-white/40">{playlistName}</p>
            {playlistPosition && <p className="text-xs text-white/30 mt-1">{playlistPosition}</p>}
          </div>
        )}

        {/* Album Art */}
        <div className="aspect-square w-full rounded-3xl overflow-hidden outer-glow-subtle">
          <img src={coverUrl} alt={songTitle} className="w-full h-full object-cover" />
        </div>

        {/* Song Info */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">{songTitle}</h1>
          <p className="text-xl text-white/60">{artist}</p>
        </div>

        {/* Bracelet Timeline */}
        <div className="space-y-3">
          {/* Time */}
          <div className="flex justify-between text-xs text-white/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Thin Progress Bar with Beads */}
          <div className="relative h-1 bg-white/10 rounded-full group cursor-pointer" onClick={handleTimelineClick}>
            <div
              className="absolute h-full transition-all rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: beads.length > 0 ? cordColor : '#ef4444'
              }}
            />
            <div
              className="absolute w-3 h-3 bg-white rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
            />

            {/* Custom Beads on Timeline */}
            {beads.map((bead, index) => {
              const beadPosition = (bead.timestamp / duration) * 100;
              const timeDifference = currentTime - bead.timestamp;
              const isActive = Math.abs(timeDifference) < 2;
              const hasNote = bead.note && bead.note.length > 0;
              const beadScale = hasNote ? 1.3 : 1.0;

              // Calculate fade based on time distance
              let noteOpacity = 1;
              if (timeDifference > 0) {
                // After the moment passes, fade out gradually
                noteOpacity = Math.max(0, 1 - (timeDifference / 3));
              } else if (timeDifference < -2) {
                // Before the moment, don't show
                noteOpacity = 0;
              }

              return (
                <div
                  key={index}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer hover:scale-125 transition-all z-10"
                  style={{ left: `${beadPosition}%` }}
                  title={`${bead.lyricText}${bead.note ? `\n\n${bead.note}` : ''}`}
                >
                  {isActive && hasNote && noteOpacity > 0 && (
                    <div className="absolute -top-36 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-1000" style={{ opacity: noteOpacity }}>
                      {/* Connector line */}
                      <svg className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-8" viewBox="0 0 2 32" preserveAspectRatio="none">
                        <path d="M 1 0 Q 1 16, 1 32" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.8" fill="none" />
                      </svg>

                      {/* Note bubble */}
                      <div className="rounded-2xl p-4 min-w-[200px] max-w-[260px]" style={{
                        background: 'rgba(14, 14, 17, 0.25)',
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: 'inset 0 0 40px rgba(255, 255, 255, 0.04), 0 0 40px rgba(0, 0, 0, 0.3)'
                      }}>
                        <p className="text-base text-white leading-relaxed" style={{
                          fontFamily: 'Georgia, "Times New Roman", serif',
                          fontStyle: 'italic',
                          fontWeight: 400,
                          letterSpacing: '0.02em',
                          lineHeight: 1.6
                        }}>{bead.note}</p>
                      </div>
                    </div>
                  )}
                  <div style={{ transform: `scale(${beadScale})` }} className={`${isActive && hasNote ? 'drop-shadow-[0_0_12px_rgba(255,255,255,1)] animate-pulse' : ''}`}>
                    {bead.customImage ? (
                      <CustomImageBead imageUrl={bead.customImage} size="small" />
                    ) : bead.type === 'shaped' ? (
                      <ShapedBead
                        shape={bead.shape!}
                        color={bead.color}
                        material={bead.material}
                        size="small"
                        imageUrl={bead.imageUrl}
                        processedUrl={bead.processedUrl}
                        loading={bead.loading}
                        error={!!bead.error}
                      />
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

        {/* Transport: prev / play / next. Prev/next only render when playlist context is set. */}
        <div className="flex justify-center items-center gap-6">
          {onPrev && (
            <button
              onClick={onPrev}
              disabled={!canPrev}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Previous song"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}
          <button
            onClick={onTogglePlay}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-all outer-glow-subtle"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-black fill-black" />
            ) : (
              <Play className="w-8 h-8 text-black fill-black ml-1" />
            )}
          </button>
          {onNext && (
            <button
              onClick={onNext}
              disabled={!canNext}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Next song"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
