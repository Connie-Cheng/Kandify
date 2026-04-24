import { Play, MoreHorizontal, Sparkles } from 'lucide-react';
import { Song } from '../App';
import { CharmBracelet } from './CharmBracelet';
import { GiftDialog } from './GiftDialog';
import { BlendDialog } from './BlendDialog';
import { songBracelets as predefinedBracelets } from '../data/songBracelets';
import { useEffect, useState } from 'react';

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
}

export function MainContent({ onPlaySong, onOpenBracelet }: MainContentProps) {
  const [allBracelets, setAllBracelets] = useState(predefinedBracelets);
  const [giftBracelet, setGiftBracelet] = useState<{ songTitle: string; artist: string } | null>(null);
  const [blendBracelet, setBlendBracelet] = useState<{ songTitle: string; artist: string } | null>(null);

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

      // Generate beads based on song - fewer beads for longer songs like Strobe
      const numBeads = song.id === 2 ? Math.floor(Math.random() * 3) + 5 : Math.floor(Math.random() * 5) + 8;
      const songDuration = song.id === 2 ? 632 : 60; // Strobe is 10:32 = 632 seconds
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
          timestamp: (i / numBeads) * songDuration,
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

    loadBracelets();

    // Listen for storage events to reload when bracelets are saved
    window.addEventListener('storage', loadBracelets);
    return () => window.removeEventListener('storage', loadBracelets);
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

        {/* Charm Bracelets */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Song Charm Bracelets</h2>
            <p className="text-sm text-white/60">Visualize songs as concert charm bracelets</p>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
            {allBracelets.map((bracelet) => (
              <div
                key={bracelet.songId}
                onClick={() => onOpenBracelet(bracelet.songId)}
                className="cursor-pointer transition-transform hover:scale-105 flex-shrink-0"
              >
                <CharmBracelet
                  beads={bracelet.beads}
                  songTitle={bracelet.songTitle}
                  artist={bracelet.artist}
                  onGift={() => setGiftBracelet({ songTitle: bracelet.songTitle, artist: bracelet.artist })}
                  onBlend={() => setBlendBracelet({ songTitle: bracelet.songTitle, artist: bracelet.artist })}
                />
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
                  onClick={(e) => {
                    e.stopPropagation();
                    autoGenerateBracelet(song);
                  }}
                  className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-all flex items-center gap-1.5"
                  style={{
                    background: 'radial-gradient(circle at 30% 50%, #9c27b0, #ff006e)',
                    boxShadow: '0 0 20px rgba(156, 39, 176, 0.4), 0 0 40px rgba(255, 0, 110, 0.2)'
                  }}
                  title="Auto-generate bracelet"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto Bracelet
                </button>

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

      {giftBracelet && (
        <GiftDialog
          songTitle={giftBracelet.songTitle}
          artist={giftBracelet.artist}
          onClose={() => setGiftBracelet(null)}
        />
      )}

      {blendBracelet && (
        <BlendDialog
          songTitle={blendBracelet.songTitle}
          artist={blendBracelet.artist}
          onClose={() => setBlendBracelet(null)}
        />
      )}
    </div>
  );
}
