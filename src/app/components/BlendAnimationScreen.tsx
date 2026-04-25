import { useState, useEffect } from 'react';
import { X, Music } from 'lucide-react';
import { BlendSession } from '../services/social';

interface Props {
  session: BlendSession;
  onClose: () => void;
}

export function BlendAnimationScreen({ session, onClose }: Props) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [screenVisible, setScreenVisible] = useState(false);
  const [fadingToBlack, setFadingToBlack] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [visibleTracks, setVisibleTracks] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setScreenVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Fade to black 3.5s in, then show playlist 1.8s after that
  useEffect(() => {
    const t1 = setTimeout(() => setFadingToBlack(true), 3500);
    const t2 = setTimeout(() => setShowPlaylist(true), 5300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Stagger tracks in once panel is visible
  useEffect(() => {
    if (!showPlaylist) return;
    let count = 0;
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        count++;
        setVisibleTracks(count);
        if (count >= session.playlist.length) {
          clearInterval(interval);
          setTimeout(() => setShowButton(true), 200);
        }
      }, 110);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(start);
  }, [showPlaylist, session.playlist.length]);

  const sourceColor = (src: 'you' | 'friend' | 'blend') => {
    if (src === 'you')   return '#ff6b9d';
    if (src === 'blend') return '#c77dff';
    return session.friendColor;
  };

  const sourceLabel = (src: 'you' | 'friend' | 'blend') => {
    if (src === 'you')   return "Connie's taste";
    if (src === 'blend') return 'You both love this';
    return `${session.friendName}'s taste`;
  };

  return (
    <div
      className="fixed inset-0 z-[60]"
      style={{
        background: '#060810',
        opacity: screenVisible ? 1 : 0,
        transition: 'opacity 0.45s ease-in',
      }}
    >
      {/* Bracelet bloom animation */}
      <iframe
        src="/bracelet.html"
        className="absolute inset-0 w-full h-full border-0"
        title="Blend animation"
        onLoad={() => setIframeLoaded(true)}
        style={{ opacity: iframeLoaded ? 1 : 0, transition: 'opacity 0.5s ease-in' }}
      />

      {/* Fade-to-black overlay — sits above iframe, below UI */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: '#000',
          opacity: fadingToBlack ? 1 : 0,
          transition: 'opacity 1.4s ease-in-out',
        }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-20 bg-black/50 rounded-full p-2 text-white/60 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Blending hint */}
      {!fadingToBlack && (
        <p
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-white/50 text-sm text-center pointer-events-none animate-pulse whitespace-nowrap"
          style={{ textShadow: '0 0 10px rgba(255,255,255,0.4)' }}
        >
          Blending your music with {session.friendName}…
        </p>
      )}

      {/* Playlist panel — slides up from below after fade to black */}
      <div
        className="absolute inset-0 z-30 flex items-center justify-center p-6"
        style={{
          background: showPlaylist ? 'rgba(0,0,0,0.85)' : 'transparent',
          backdropFilter: showPlaylist ? 'blur(14px)' : 'none',
          transition: 'background 0.6s ease-out, backdrop-filter 0.6s ease-out',
          pointerEvents: showPlaylist ? 'all' : 'none',
        }}
      >
        <div
          className="glass-card rounded-3xl p-6 w-full max-w-md flex flex-col"
          style={{
            maxHeight: '80vh',
            opacity: showPlaylist ? 1 : 0,
            transform: showPlaylist ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold">Your Blend</h2>
              <p className="text-sm text-white/50">Connie &amp; {session.friendName}</p>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white mt-0.5">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            {(['you', 'friend', 'blend'] as const).map((src, i) => (
              <div
                key={src}
                className="flex items-center gap-1.5 text-xs text-white/50"
                style={{
                  opacity: showPlaylist ? 1 : 0,
                  transition: `opacity 0.4s ease-out ${i * 120}ms`,
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: sourceColor(src) }} />
                {sourceLabel(src)}
              </div>
            ))}
          </div>

          <div className="overflow-y-auto space-y-2 flex-1 scrollbar-thin pr-1">
            {session.playlist.map((track, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass-button"
                style={{
                  opacity: i < visibleTracks ? 1 : 0,
                  transform: i < visibleTracks ? 'translateX(0)' : 'translateX(-14px)',
                  transition: 'opacity 0.38s ease-out, transform 0.38s ease-out',
                }}
              >
                <div className="w-1.5 h-9 rounded-full flex-shrink-0" style={{ background: sourceColor(track.source) }} />
                <Music className="w-4 h-4 text-white/30 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{track.title}</p>
                  <p className="text-xs text-white/50 truncate">{track.artist}</p>
                </div>
                <p className="text-xs text-white/30 flex-shrink-0 text-right leading-tight" style={{ maxWidth: 90 }}>
                  {track.reason}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full py-3 rounded-full font-medium text-white text-sm transition-all hover:scale-105"
            style={{
              background: `radial-gradient(circle at 30% 50%, ${session.friendColor}cc, #9a58cccc)`,
              boxShadow: `0 0 14px ${session.friendColor}44`,
              opacity: showButton ? 1 : 0,
              transform: showButton ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
              pointerEvents: showButton ? 'all' : 'none',
            }}
          >
            Save This Blend
          </button>
        </div>
      </div>
    </div>
  );
}
