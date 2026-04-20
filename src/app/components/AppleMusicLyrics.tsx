import { useEffect, useRef } from 'react';

export interface LyricLine {
  time: number;
  text: string;
}

interface AppleMusicLyricsProps {
  lyrics: LyricLine[];
  currentTime: number;
  onLyricClick: (index: number) => void;
  currentLyricIndex: number;
}

export function AppleMusicLyrics({ lyrics, currentTime, onLyricClick, currentLyricIndex }: AppleMusicLyricsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const activeLyric = containerRef.current.querySelector(`[data-index="${currentLyricIndex}"]`);
      if (activeLyric) {
        activeLyric.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLyricIndex]);

  return (
    <div
      ref={containerRef}
      className="relative h-[500px] overflow-y-auto scrollbar-hide"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
      }}
    >
      <div className="py-[200px] space-y-8">
        {lyrics.map((lyric, index) => {
          const distance = Math.abs(index - currentLyricIndex);
          const isActive = index === currentLyricIndex;
          const isPast = index < currentLyricIndex;

          let opacity = 0.2;
          let scale = 0.85;
          let blur = 'blur(2px)';

          if (isActive) {
            opacity = 1;
            scale = 1;
            blur = 'blur(0)';
          } else if (distance === 1) {
            opacity = 0.5;
            scale = 0.92;
            blur = 'blur(1px)';
          } else if (distance === 2) {
            opacity = 0.35;
            scale = 0.88;
            blur = 'blur(1.5px)';
          }

          return (
            <div
              key={index}
              data-index={index}
              onClick={() => onLyricClick(index)}
              className="cursor-pointer transition-all duration-500 ease-out px-8"
              style={{
                opacity,
                transform: `scale(${scale})`,
                filter: blur,
              }}
            >
              <p
                className={`text-3xl leading-relaxed ${
                  isActive ? 'font-bold text-white' : 'font-semibold text-white/60'
                }`}
              >
                {lyric.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
