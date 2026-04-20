import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, ListMusic, Airplay, Shuffle, Repeat } from 'lucide-react';
import { Song } from '../App';
import { CustomBead } from './ImprovedSongView';
import { ShapedBead } from './ShapedBead';
import { LetterBead } from './LetterBead';
import { NumberBead } from './NumberBead';
import { CustomImageBead } from './CustomImageBead';

interface NowPlayingProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  customBeads?: CustomBead[];
  onOpenSongDetail?: () => void;
  cordColor?: string;
}

export function NowPlaying({ currentSong, isPlaying, onTogglePlayPause, customBeads = [], onOpenSongDetail, cordColor }: NowPlayingProps) {
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!isPlaying || !currentSong) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 0.5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (currentSong) {
      setProgress(0);
    }
  }, [currentSong]);

  if (!currentSong) {
    return (
      <div className="h-20 bg-black/60 backdrop-blur-2xl border-t border-white/10 flex items-center justify-center">
        <p className="text-white/40 text-sm">Select a song to start playing</p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = (progress / 100) * 180; // Assuming 3 minutes
  const totalTime = 180;

  return (
    <div className="h-24 glass-morph outer-glow-soft">
      {/* Progress Bar with Beads */}
      <div className="relative h-1 cursor-pointer group" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div
          className="absolute h-full transition-all rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: customBeads.length > 0 && cordColor ? cordColor : '#ef4444'
          }}
        />
        <div
          className="absolute w-3 h-3 bg-white rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
        />

        {/* Custom Beads on Timeline */}
        {customBeads.map((bead, index) => {
          const beadPosition = (bead.timestamp / totalTime) * 100;
          const hasNote = bead.note && bead.note.length > 0;
          const beadScale = hasNote ? 1.3 : 1.0;

          return (
            <div
              key={index}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer hover:scale-125 transition-transform z-10"
              style={{ left: `${beadPosition}%` }}
              title={bead.lyricText}
            >
              <div style={{ transform: `scale(${beadScale})` }}>
                {bead.customImage ? (
                  <CustomImageBead imageUrl={bead.customImage} size="small" />
                ) : bead.type === 'shaped' ? (
                  <ShapedBead
                    shape={bead.shape!}
                    color={bead.color}
                    material={bead.material}
                    size="small"
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

      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Left: Current Song Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="w-14 h-14 rounded object-cover shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onOpenSongDetail}
          />
          <div className="min-w-0 flex-1 cursor-pointer" onClick={onOpenSongDetail}>
            <div className="font-medium truncate hover:text-red-400 transition-colors">{currentSong.title}</div>
            <div className="text-sm text-white/60 truncate">{currentSong.artist}</div>
          </div>
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`transition-colors ${isLiked ? 'text-red-500' : 'text-white/40 hover:text-white'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
          </button>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-4">
            <button className="text-white/60 hover:text-white transition-colors">
              <Shuffle className="w-4 h-4" />
            </button>
            
            <button className="text-white/60 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5 fill-white/60" />
            </button>
            
            <button
              onClick={onTogglePlayPause}
              className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black fill-black" />
              ) : (
                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
              )}
            </button>
            
            <button className="text-white/60 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5 fill-white/60" />
            </button>
            
            <button className="text-white/60 hover:text-white transition-colors">
              <Repeat className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-white/60 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 h-1 bg-transparent" />
            <span className="text-xs text-white/60 w-10">
              {formatTime(totalTime)}
            </span>
          </div>
        </div>

        {/* Right: Volume & Other Controls */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <button className="text-white/60 hover:text-white transition-colors">
            <ListMusic className="w-5 h-5" />
          </button>
          
          <button className="text-white/60 hover:text-white transition-colors">
            <Airplay className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-white/60" />
            <div className="w-24 h-1 bg-white/20 rounded-full relative group cursor-pointer">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${volume}%` }}
              />
              <div
                className="absolute w-2.5 h-2.5 bg-white rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                style={{ left: `${volume}%`, transform: 'translate(-50%, -50%)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
