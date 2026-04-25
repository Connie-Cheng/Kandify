import { Play, MoreHorizontal } from 'lucide-react';
import { Song } from '../App';
import { CharmBracelet } from './CharmBracelet';
import { _archivedSongBracelets as predefinedBracelets } from '../data/songBracelets';
import { playlistBracelets, type PlaylistBracelet } from '../data/playlistBracelets';
import type { BeadItem } from './CharmBracelet';
import { useEffect, useState } from 'react';
import { ShapedBead } from './ShapedBead';
import { LetterBead } from './LetterBead';
import { NumberBead } from './NumberBead';
import { CustomImageBead } from './CustomImageBead';

const FEATURED_ALBUMS = [
  {
    id: 1,
    title: 'Ctrl',
    artist: 'SZA',
    coverUrl: '/covers/CTRL.jpg',
  },
  {
    id: 2,
    title: 'IGOR',
    artist: 'Tyler, The Creator',
    coverUrl: '/covers/igor.jpg',
  },
  {
    id: 3,
    title: 'To Pimp a Butterfly',
    artist: 'Kendrick Lamar',
    coverUrl: '/covers/to-pimp-a-butterfly.jpg',
  },
  {
    id: 4,
    title: 'Lemonade',
    artist: 'Beyonce',
    coverUrl: '/covers/lemonade.png',
  },
  {
    id: 5,
    title: 'Blonde',
    artist: 'Frank Ocean',
    coverUrl: '/covers/blonde.jpg',
  },
  {
    id: 6,
    title: 'Awaken, My Love!',
    artist: 'Childish Gambino',
    coverUrl: '/covers/awaken-my-love.jpg',
  },
];

const RECENT_SONGS: Song[] = [
  {
    id: 100,
    title: 'Rock with You',
    artist: 'Michael Jackson',
    album: 'Off the Wall',
    duration: '3:56',
    coverUrl: '/covers/rock-with-you.jpg', // cover image file: public/covers/rock-with-you.jpg
  },
  {
    id: 101,
    title: 'Work',
    artist: 'Rihanna, Drake',
    album: 'Anti',
    duration: '3:39',
    coverUrl: '/covers/work.png', // cover image file: public/covers/work.png
  },
  {
    id: 102,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:20',
    coverUrl: '/covers/blinding-lights.png', // cover image file: public/covers/blinding-lights.png
  },
  {
    id: 1,
    title: 'Replay',
    artist: 'Iyaz',
    album: 'Replay',
    duration: '3:31',
    coverUrl: '/covers/replay.jpg', // cover image file: public/covers/replay.jpg
  },
  {
    id: 2,
    title: 'Down',
    artist: 'Jay Sean, Lil Wayne',
    album: 'All or Nothing',
    duration: '3:42',
    coverUrl: '/covers/down.jpg', // cover image file: public/covers/down.jpg
    spotifyUri: 'spotify:track:6cmm1LMvZdB5zsCwX5BjqE',
    durationSeconds: 200,
  },
];

interface MainContentProps {
  onPlaySong: (song: Song) => void;
  onOpenBracelet: (songId: number) => void;
  onOpenGift: (songId: number, songTitle: string, artist: string) => void;
  onOpenBlend: (songTitle: string, artist: string) => void;
  onOpenPlaylist: (playlistId: string) => void;
}

// Convert a preset playlist's per-song bead (EnhancedBeadOption) into the
// BeadItem shape that CharmBracelet expects.
function playlistToBeads(p: PlaylistBracelet): BeadItem[] {
  return p.songs.map(s => ({
    type: 'bead',
    charmType: (s.songBead.shape || 'circle') as any,
    color: s.songBead.color,
    material: (s.songBead.material as any) || 'glossy',
    size: (s.songBead.size as any) || 'medium',
  }));
}

const SONG_META: Record<number, { title: string; artist: string; coverUrl: string; album: string; duration: string }> = {
  100: { title: 'Rock with You', artist: 'Michael Jackson', coverUrl: '/covers/rock-with-you.jpg', album: 'Off the Wall', duration: '3:56' },
  101: { title: 'Work', artist: 'Rihanna, Drake', coverUrl: '/covers/work.png', album: 'Anti', duration: '3:39' },
  102: { title: 'Blinding Lights', artist: 'The Weeknd', coverUrl: '/covers/blinding-lights.png', album: 'After Hours', duration: '3:20' },
  1:   { title: 'Replay', artist: 'Iyaz', coverUrl: '/covers/replay.jpg', album: 'Replay', duration: '3:31' },
  2:   { title: 'Down', artist: 'Jay Sean, Lil Wayne', coverUrl: '/covers/down.jpg', album: 'All or Nothing', duration: '3:42' },
};

interface CharmBeadPreview {
  type: 'shaped' | 'letter' | 'number';
  color: string;
  shape?: string;
  material?: 'glossy' | 'matte' | 'metallic' | 'iridescent';
  letter?: string;
  number?: string;
  customImage?: string;
  imageUrl?: string;
  processedUrl?: string;
  loading?: boolean;
  error?: boolean;
}

interface SongCharm {
  songId: number;
  title: string; artist: string; coverUrl: string; album: string; duration: string;
  beadCount: number;
  beads: CharmBeadPreview[];
}

// Phone-charm visual: beads strung on a straight vertical cord with a gold ring at top.
// Uses SVG for the ring/cord/knot and foreignObject slots so each bead reuses the
// same renderers (ShapedBead/CustomImageBead/...) as the rest of the app — that way
// AI-generated bead artwork shows up identically here and inside the lyrics view.
function PhoneCharm({ beads }: { beads: CharmBeadPreview[] }) {
  const cx = 50, svgW = 100;
  // Visual: bead intrinsic size = 28px (ShapedBead size="small"), scaled down to
  // ~22px so each charm reads compact. The foreignObject is intentionally larger
  // than the bead so the AI bead's drop-shadow glow has room to render — without
  // this, foreignObject clips the aura into a hard square.
  const ringY = 14, cordStart = 30, slot = 30;
  const beadBox = 42;        // foreignObject canvas (gives the aura ~7px breathing room)
  const beadScale = 0.78;    // visually shrink bead to ~22px
  const N = Math.max(beads.length, 1);
  const cordEnd = cordStart + N * slot;
  const svgH = cordEnd + 18;

  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
      {/* Gold attachment ring */}
      <circle cx={cx} cy={ringY} r={9} fill="none"
        stroke="rgba(215,180,75,0.95)" strokeWidth="2.5"
        style={{ filter: 'drop-shadow(0 0 5px rgba(215,180,75,0.6))' }} />
      <circle cx={cx} cy={ringY} r={5.5} fill="none"
        stroke="rgba(215,180,75,0.40)" strokeWidth="1" />

      {/* Straight cord */}
      <line x1={cx} y1={cordStart} x2={cx} y2={cordEnd}
        stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

      {/* Beads along the cord — render via foreignObject so we reuse ShapedBead etc. */}
      {Array.from({ length: N }, (_, i) => {
        const y = cordStart + slot / 2 + i * slot;
        const bead = beads[i];
        if (!bead) {
          return (
            <circle key={i} cx={cx} cy={y} r={7}
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 2" />
          );
        }
        return (
          <foreignObject
            key={i}
            x={cx - beadBox / 2}
            y={y - beadBox / 2}
            width={beadBox}
            height={beadBox}
            style={{ overflow: 'visible' }}
          >
            <div style={{
              width: beadBox, height: beadBox,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'visible',
            }}>
              <div style={{ transform: `scale(${beadScale})`, transformOrigin: 'center', lineHeight: 0 }}>
                {bead.customImage ? (
                  <CustomImageBead imageUrl={bead.customImage} size="small" />
                ) : bead.type === 'shaped' ? (
                  <ShapedBead
                    shape={(bead.shape as any) || 'circle'}
                    color={bead.color}
                    material={bead.material}
                    size="small"
                    imageUrl={bead.imageUrl}
                    processedUrl={bead.processedUrl}
                    loading={bead.loading}
                    error={!!bead.error}
                  />
                ) : bead.type === 'letter' ? (
                  <LetterBead letter={bead.letter || ''} color={bead.color} size="small" />
                ) : bead.type === 'number' ? (
                  <NumberBead number={bead.number || ''} color={bead.color} size="small" />
                ) : null}
              </div>
            </div>
          </foreignObject>
        );
      })}

      {/* Knot at bottom */}
      <circle cx={cx} cy={cordEnd + 6} r={4}
        fill="rgba(255,255,255,0.20)" />
    </svg>
  );
}
interface GiftedCard {
  id: string; songTitle: string; artist: string; toName: string;
  beads: Array<{ color: string }>;
}

export function MainContent({ onPlaySong, onOpenBracelet, onOpenGift, onOpenBlend, onOpenPlaylist }: MainContentProps) {
  const [allBracelets, setAllBracelets] = useState(predefinedBracelets);
  const [songCharms, setSongCharms] = useState<SongCharm[]>([]);
  const [giftedCards, setGiftedCards] = useState<GiftedCard[]>([]);

  const autoGenerateBracelet = (song: Song) => {
    // Defer to avoid setState during render
    setTimeout(async () => {
      // Auto-generate beads based on song characteristics
      const songColorMap: Record<number, { colors: string[], material: 'glossy' | 'metallic' | 'iridescent', cordColor: string }> = {
        100: { colors: ['#ff6b9d', '#ff1744', '#ff4081'], material: 'glossy', cordColor: '#ff6b9d' },
        101: { colors: ['#ff6f00', '#000000', '#ff4081'], material: 'metallic', cordColor: '#ff6f00' },
        102: { colors: ['#78909c', '#2196f3', '#b0bec5'], material: 'iridescent', cordColor: '#78909c' },
        1: { colors: ['#2196f3', '#1976d2', '#00bcd4'], material: 'metallic', cordColor: '#2196f3' },
        2: { colors: ['#9c27b0', '#e91e63', '#ff4081'], material: 'glossy', cordColor: '#9c27b0' },
      };

      // Generate colors based on song title/artist if not predefined
      const generateColorFromText = (text: string) => {
        const lowerText = text.toLowerCase();

        // Electronic/instrumental keywords
        if (lowerText.includes('strobe') || lowerText.includes('electronic') || lowerText.includes('synth')) {
          return { colors: ['#9c27b0', '#00bcd4', '#ff4081'], material: 'iridescent' as const, cordColor: '#9c27b0' };
        }

        // Color keywords
        if (lowerText.includes('blue') || lowerText.includes('ocean') || lowerText.includes('sky')) {
          return { colors: ['#2196f3', '#00bcd4', '#1976d2'], material: 'metallic' as const, cordColor: '#2196f3' };
        }
        if (lowerText.includes('red') || lowerText.includes('fire') || lowerText.includes('blood')) {
          return { colors: ['#ff1744', '#f44336', '#d32f2f'], material: 'glossy' as const, cordColor: '#ff1744' };
        }
        if (lowerText.includes('pink') || lowerText.includes('rose') || lowerText.includes('love')) {
          return { colors: ['#ff6b9d', '#ff4081', '#e91e63'], material: 'glossy' as const, cordColor: '#ff6b9d' };
        }
        if (lowerText.includes('purple') || lowerText.includes('violet')) {
          return { colors: ['#9c27b0', '#7b1fa2', '#ba68c8'], material: 'iridescent' as const, cordColor: '#9c27b0' };
        }
        if (lowerText.includes('green') || lowerText.includes('nature')) {
          return { colors: ['#4caf50', '#66bb6a', '#2e7d32'], material: 'glossy' as const, cordColor: '#4caf50' };
        }
        if (lowerText.includes('gold') || lowerText.includes('sun') || lowerText.includes('yellow')) {
          return { colors: ['#ffd600', '#ffeb3b', '#fbc02d'], material: 'metallic' as const, cordColor: '#ffd600' };
        }
        if (lowerText.includes('black') || lowerText.includes('dark') || lowerText.includes('night')) {
          return { colors: ['#212121', '#424242', '#616161'], material: 'metallic' as const, cordColor: '#424242' };
        }
        if (lowerText.includes('white') || lowerText.includes('light') || lowerText.includes('snow')) {
          return { colors: ['#ffffff', '#f5f5f5', '#e0e0e0'], material: 'iridescent' as const, cordColor: '#ffffff' };
        }

        // Mood/tone keywords
        if (lowerText.includes('sad') || lowerText.includes('melancholy') || lowerText.includes('blue')) {
          return { colors: ['#78909c', '#90a4ae', '#607d8b'], material: 'iridescent' as const, cordColor: '#78909c' };
        }
        if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('bright')) {
          return { colors: ['#ffd600', '#ff6f00', '#ff4081'], material: 'glossy' as const, cordColor: '#ffd600' };
        }

        return null;
      };

      const textBasedConfig = generateColorFromText(song.title + ' ' + song.artist);
      const config = songColorMap[song.id] || textBasedConfig || { colors: ['#ff6b9d', '#2196f3', '#ffd600'], material: 'glossy', cordColor: '#ff6b9d' };
      const shapes: ('circle' | 'heart' | 'star' | 'flower' | 'square')[] = ['circle', 'heart', 'star', 'flower', 'square'];

      // Open bracelet view first
      onOpenBracelet(song.id);

      const numBeads = Math.floor(Math.random() * 5) + 8;
      // Parse duration from "m:ss" string if durationSeconds not set
      const parseDuration = (dur: string) => {
        const [m, s] = dur.split(':').map(Number);
        return (m || 0) * 60 + (s || 0);
      };
      const songDuration = song.durationSeconds ?? parseDuration(song.duration);
      const beads = [];

      for (let i = 0; i < numBeads; i++) {
        const randomColor = config.colors[Math.floor(Math.random() * config.colors.length)];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

        const newBead = {
          id: `auto-${song.id}-${i}`,
          type: 'shaped',
          shape: randomShape,
          color: randomColor,
          material: config.material,
          timestamp: (i / Math.max(numBeads - 1, 1)) * songDuration,
          lyricText: '',
        };

        beads.push(newBead);

        // Save incrementally to show sequential loading
        const saved = localStorage.getItem('customBeads');
        const allBeads = saved ? JSON.parse(saved) : {};
        allBeads[song.id] = [...beads];
        localStorage.setItem('customBeads', JSON.stringify(allBeads));
        window.dispatchEvent(new Event('storage'));

        // Wait before adding next bead
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }, 0);
  };

  // Load custom bracelets from localStorage
  useEffect(() => {
    const loadBracelets = () => {
      const saved = localStorage.getItem('customBeads');
      if (saved) {
        try {
          const customBeads = JSON.parse(saved);
          const customBraceletsList = Object.entries(customBeads).map(([songId, beads]: [string, any]) => {
            const id = parseInt(songId);
            const songData = {
              100: { title: 'Rock with You', artist: 'Michael Jackson' },
              101: { title: 'Work', artist: 'Rihanna, Drake' },
              102: { title: 'Blinding Lights', artist: 'The Weeknd' },
              1: { title: 'Replay', artist: 'Iyaz' },
              2: { title: 'Down', artist: 'Jay Sean, Lil Wayne' },
            }[id as 100 | 101 | 102 | 1 | 2];

            if (!songData) return null;

            return {
              songId: id,
              songTitle: songData.title,
              artist: songData.artist,
              beads: beads.map((b: any) => ({
                type: b.type === 'shaped' ? 'bead' : b.type,
                color: b.color,
                material: b.material,
                size: b.size,
                content: b.letter || b.number,
                charmType: b.shape,
                customImage: b.customImage,
                imageUrl: b.imageUrl,
                processedUrl: b.processedUrl,
                loading: b.loading,
                error: b.error,
              })),
            };
          }).filter(Boolean);

          // Start with only the predefined bracelets for songs 1 and 100
          const merged = predefinedBracelets.filter(b => b.songId === 1 || b.songId === 100);

          // Add or update with custom bracelets
          customBraceletsList.forEach((custom: any) => {
            const existingIndex = merged.findIndex(b => b.songId === custom.songId);
            if (existingIndex >= 0) {
              // Update existing
              merged[existingIndex] = custom;
            } else {
              // Add new custom bracelet
              merged.push(custom);
            }
          });

          setAllBracelets(merged);
        } catch (e) {
          console.error('Failed to load custom bracelets', e);
        }
      } else {
        // Only show Midnight City and my love my love my love
        setAllBracelets(predefinedBracelets.filter(b => b.songId === 1 || b.songId === 100));
      }
    };

    // Load song charms: songs where the user has added lyric-annotated beads
    const loadSongCharms = () => {
      try {
        const raw = localStorage.getItem('customBeads');
        if (!raw) { setSongCharms([]); return; }
        const allBeads: Record<string, any[]> = JSON.parse(raw);
        const charms: SongCharm[] = Object.entries(allBeads)
          .filter(([, beads]) => beads.some(b => b.lyricText && b.lyricText.length > 0))
          .map(([songId, beads]) => {
            const id = parseInt(songId);
            const meta = SONG_META[id as keyof typeof SONG_META];
            if (!meta) return null;
            const lyricBeads = beads.filter(b => b.lyricText && b.lyricText.length > 0);
            return {
              songId: id, ...meta,
              beadCount: lyricBeads.length,
              beads: lyricBeads.slice(0, 12).map(b => ({
                type: b.type,
                color: b.color,
                shape: b.shape,
                material: b.material,
                letter: b.letter,
                number: b.number,
                customImage: b.customImage,
                imageUrl: b.imageUrl,
                processedUrl: b.processedUrl,
                loading: b.loading,
                error: b.error,
              })),
            };
          })
          .filter((c): c is SongCharm => c !== null);
        setSongCharms(charms);
      } catch { setSongCharms([]); }
    };

    // Load gifted bracelets from sent gifts
    const loadGiftedCards = () => {
      try {
        const sent: any[] = JSON.parse(localStorage.getItem('gifts_sent') ?? '[]');
        const FRIEND_NAMES: Record<string, string> = {
          user_jessica: 'Jessica', user_kida: 'Kida',
          user_jack: 'Jack', user_sean: 'Sean',
        };
        setGiftedCards(sent.map(g => ({
          id: g.id,
          songTitle: g.songTitle,
          artist: g.artist,
          toName: FRIEND_NAMES[g.toUserId] ?? g.toUserId,
          beads: g.beads ?? [],
        })));
      } catch { setGiftedCards([]); }
    };

    loadBracelets();
    loadSongCharms();
    loadGiftedCards();

    const handleStorage = () => {
      loadBracelets();
      loadSongCharms();
      loadGiftedCards();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin" style={{ background: 'rgba(14, 14, 17, 0.5)' }}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Listen Now</h1>
          <p className="text-white/60">Your personalized music experience</p>
        </div>

        {/* Featured Albums */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Albums</h2>
            <button className="text-sm text-red-500 hover:text-red-400 font-medium">
              See All
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURED_ALBUMS.map((album) => (
              <div
                key={album.id}
                className="group cursor-pointer transition-glow"
              >
                <div className="relative mb-3 aspect-square rounded-3xl overflow-hidden glass-morph outer-glow-subtle glow-hover">
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center" style={{ background: 'rgba(14, 14, 17, 0.6)' }}>
                    <button className="w-12 h-12 rounded-full flex items-center justify-center glow-blob-pink-purple inner-glow transition-glow hover:scale-110">
                      <Play className="w-5 h-5 ml-0.5 fill-white" />
                    </button>
                  </div>
                </div>
                <h3 className="font-medium text-sm mb-1 truncate">{album.title}</h3>
                <p className="text-sm text-white/50 truncate">{album.artist}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Song Charms — annotated songs */}
        {songCharms.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Song Charms</h2>
                <p className="text-sm text-white/40 mt-0.5">Your annotated moments</p>
              </div>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin">
              {songCharms.map(charm => (
                <div
                  key={charm.songId}
                  onClick={() => onPlaySong({ id: charm.songId, title: charm.title, artist: charm.artist, album: charm.album, duration: charm.duration, coverUrl: charm.coverUrl })}
                  className="flex-shrink-0 glass-card rounded-3xl cursor-pointer transition-all hover:scale-105 outer-glow-subtle flex flex-col items-center pt-5 pb-4 px-4"
                  style={{ width: 130 }}
                >
                  {/* Phone charm visual */}
                  <PhoneCharm beads={charm.beads} />
                  {/* Labels */}
                  <h3 className="font-semibold text-sm truncate w-full text-center mt-3">{charm.title}</h3>
                  <p className="text-xs text-white/45 truncate w-full text-center">{charm.artist}</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,107,157,0.65)' }}>
                    {charm.beadCount} moment{charm.beadCount !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Playlist Bracelets — one bracelet per preset playlist, one bead per song */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Playlist Bracelets</h2>
            <p className="text-sm text-white/60">Each bead is a song. Tap to play through the playlist.</p>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
            {playlistBracelets.map((p) => (
              <div
                key={p.id}
                onClick={() => onOpenPlaylist(p.id)}
                className="cursor-pointer transition-transform hover:scale-105 flex-shrink-0"
              >
                <CharmBracelet
                  beads={playlistToBeads(p)}
                  songTitle={p.name}
                  artist={`${p.songs.length} songs`}
                  onGift={() => onOpenGift(p.songs[0]?.songId ?? 0, p.name, `${p.songs.length} songs`)}
                  onBlend={() => onOpenBlend(p.name, `${p.songs.length} songs`)}
                />
              </div>
            ))}
            {/* Gifted bracelets — kept for the gifting flow */}
            {giftedCards.map((gift) => (
              <div key={gift.id} className="flex-shrink-0 relative">
                <CharmBracelet
                  beads={gift.beads.map(b => ({ type: 'bead' as const, color: b.color, material: 'glossy' as const }))}
                  songTitle={gift.songTitle}
                  artist={gift.artist}
                />
                <div
                  className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium pointer-events-none"
                  style={{ background: 'rgba(196,0,94,0.85)', color: 'white' }}
                >
                  Gifted to {gift.toName}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Played */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recently Played</h2>
            <button className="text-sm text-red-500 hover:text-red-400 font-medium">
              See All
            </button>
          </div>

          <div className="space-y-2">
            {RECENT_SONGS.map((song, index) => (
              <div
                key={song.id}
                className="group flex items-center gap-4 p-3 rounded-2xl glass-button transition-all"
              >
                <div className="text-white/40 w-6 text-sm font-medium group-hover:hidden">
                  {index + 1}
                </div>
                <button
                  className="hidden group-hover:block text-white"
                  onClick={() => onPlaySong(song)}
                >
                  <Play className="w-5 h-5 fill-white" />
                </button>

                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-12 h-12 rounded object-cover cursor-pointer"
                  onClick={() => onPlaySong(song)}
                />

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onPlaySong(song)}>
                  <div className="font-medium truncate">{song.title}</div>
                  <div className="text-sm text-white/60 truncate">{song.artist}</div>
                </div>

                <div className="hidden md:block text-sm text-white/60 truncate max-w-[200px]">
                  {song.album}
                </div>

                <div className="text-sm text-white/60 w-12 text-right">
                  {song.duration}
                </div>

                <button
                  className="opacity-0 group-hover:opacity-100 text-white/60 hover:text-white transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Made For You */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Made For You</h2>
            <button className="text-sm text-red-500 hover:text-red-400 font-medium">
              See All
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { title: 'Discover Weekly', desc: 'Your weekly mixtape of fresh music', gradient: 'glow-blob-pink-purple', buttonGradient: 'radial-gradient(circle at 30% 50%, #ff006e, #c77dff)', buttonShadow: '0 0 20px rgba(255, 0, 110, 0.5)' },
              { title: 'Daily Mix 1', desc: 'The Nocturnes, deadmau5 and more', gradient: 'glow-blob-cyan-magenta', buttonGradient: 'radial-gradient(circle at 30% 50%, #00f5ff, #ff006e)', buttonShadow: '0 0 20px rgba(0, 245, 255, 0.5)' },
              { title: 'Release Radar', desc: 'Catch all the latest music', gradient: 'glow-blob-lime-purple', buttonGradient: 'radial-gradient(circle at 30% 50%, #ccff00, #7209b7)', buttonShadow: '0 0 20px rgba(204, 255, 0, 0.5)' },
              { title: 'Liked Songs', desc: 'Your favorite tracks in one place', gradient: 'glow-blob-red-orange', buttonGradient: 'radial-gradient(circle at 30% 50%, #ff006e, #ff5400)', buttonShadow: '0 0 20px rgba(255, 84, 0, 0.5)' },
            ].map((playlist, i) => (
              <div key={i} className="group cursor-pointer transition-glow">
                <div className={`relative mb-3 aspect-square rounded-3xl overflow-hidden ${playlist.gradient} inner-glow vignette flex items-center justify-center outer-glow-subtle glow-hover`}>
                  <div className="text-6xl opacity-30">♫</div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center" style={{ background: 'rgba(14, 14, 17, 0.6)' }}>
                    <button className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{
                      background: playlist.buttonGradient,
                      boxShadow: playlist.buttonShadow
                    }}>
                      <Play className="w-5 h-5 ml-0.5 fill-white" />
                    </button>
                  </div>
                </div>
                <h3 className="font-medium text-sm mb-1 truncate">{playlist.title}</h3>
                <p className="text-sm text-white/60 line-clamp-2">{playlist.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  );
}
