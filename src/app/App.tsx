import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { NowPlaying } from './components/NowPlaying';
import { ImprovedSongView, CustomBead } from './components/ImprovedSongView';
import { BraceletListeningView } from './components/BraceletListeningView';
import { AssetUploader } from './components/AssetUploader';
import { AnimatedBackground } from './components/AnimatedBackground';

export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
  audioUrl?: string;
}

function App() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSongDetail, setShowSongDetail] = useState(false);
  const [showBraceletView, setShowBraceletView] = useState(false);
  const [showAssetUploader, setShowAssetUploader] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [customBeads, setCustomBeads] = useState<Record<number, CustomBead[]>>({});
  const [cordColors, setCordColors] = useState<Record<number, string>>({
    1: '#2196f3', // Midnight City - blue
    100: '#ff6b9d', // my love my love my love - pink
  });
  const [audioElement] = useState(() => new Audio());

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleAddBead = (bead: CustomBead) => {
    if (!currentSong) return;

    setCustomBeads((prev) => {
      const updated = {
        ...prev,
        [currentSong.id]: [...(prev[currentSong.id] || []), bead],
      };

      // Save to localStorage with the updated state
      localStorage.setItem('customBeads', JSON.stringify(updated));

      // Trigger storage event to update other components
      window.dispatchEvent(new Event('storage'));

      return updated;
    });
  };

  // Load custom beads from localStorage on mount and listen for updates
  useEffect(() => {
    const loadBeads = () => {
      const saved = localStorage.getItem('customBeads');
      if (saved) {
        try {
          setCustomBeads(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load custom beads', e);
        }
      }
    };

    // Load on mount
    loadBeads();

    // Listen for storage events from auto-generate
    window.addEventListener('storage', loadBeads);

    return () => window.removeEventListener('storage', loadBeads);
  }, []);

  const handleSeekToTime = (time: number) => {
    setCurrentTime(time);
    if (currentSong?.audioUrl) {
      audioElement.currentTime = time;
    }
  };

  const handleOpenBracelet = async (songId: number) => {
    // Find the song and open bracelet view
    const songData = {
      100: {
        title: 'my love my love my love',
        artist: 'yung kai',
        coverUrl: 'https://images.unsplash.com/photo-1737914111975-b4d513d783e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxyb21hbnRpYyUyMHBpbmslMjByZWQlMjBoZWFydCUyMGFlc3RoZXRpY3xlbnwxfHx8fDE3NzY2MDM5Njd8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      101: {
        title: 'NOT CUTE ANYMORE',
        artist: 'Illit',
        coverUrl: 'https://images.unsplash.com/photo-1741705424214-2cdce7244c97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwb3JhbmdlJTIwYmxhY2slMjBlZGd5JTIwdXJiYW58ZW58MXx8fHwxNzc2NjAzOTY3fDA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      102: {
        title: 'I bet on losing dogs',
        artist: 'mitski',
        coverUrl: 'https://images.unsplash.com/photo-1699777732590-e2bfe8b73626?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxibHVlJTIwZ3JheSUyMG1lbGFuY2hvbGljJTIwc2FkJTIwbW9vZHxlbnwxfHx8fDE3NzY2MDM5Njh8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      1: {
        title: 'Midnight City',
        artist: 'The Nocturnes',
        coverUrl: 'https://images.unsplash.com/photo-1644855640845-ab57a047320e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'
      },
      2: {
        title: 'Strobe',
        artist: 'deadmau5',
        coverUrl: 'https://images.unsplash.com/photo-1746961135207-faf67473848a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400'
      }
    };

    const data = songData[songId as keyof typeof songData];
    if (!data) {
      console.error('Song not found:', songId);
      return;
    }

    // Check for uploaded audio in localStorage
    const audioUrl = localStorage.getItem(`audio_${songId}`) || undefined;

    const song = {
      id: songId,
      title: data.title,
      artist: data.artist,
      album: 'Single',
      duration: '1:00',
      coverUrl: data.coverUrl,
      audioUrl,
    };

    // Load predefined beads if no custom beads exist yet
    if (!customBeads[songId]) {
      const module = await import('./data/songBracelets');
      const bracelet = module.songBracelets.find(b => b.songId === songId);
      if (bracelet) {
        // Predefined notes for demo songs
        const predefinedNotes: Record<number, Record<number, string>> = {
          1: {
            2: "The stars shine brightest at midnight",
            6: "This moment feels magical",
            9: "Lost in the city lights"
          },
          100: {
            3: "This song always makes me smile",
            7: "Reminds me of summer nights",
            10: "My heart feels full"
          }
        };

        const convertedBeads: CustomBead[] = bracelet.beads.map((bead: any, index: number) => ({
          id: `predefined-${songId}-${index}`,
          type: bead.type === 'charm' ? 'shaped' : bead.type === 'letter' ? 'letter' : bead.type === 'number' ? 'number' : 'shaped',
          shape: bead.charmType ? bead.charmType : 'circle',
          color: bead.color,
          material: bead.material || 'glossy',
          size: bead.size || 'medium',
          letter: bead.content,
          number: bead.content,
          timestamp: index * 3.5,
          lyricText: '',
          note: predefinedNotes[songId]?.[index] || undefined,
        }));
        setCustomBeads(prev => ({ ...prev, [songId]: convertedBeads }));
      }
    }

    setCurrentSong(song);
    setShowBraceletView(true);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  // Handle audio playback
  useEffect(() => {
    if (!currentSong) return;

    // Load audio if available
    if (currentSong.audioUrl) {
      audioElement.src = currentSong.audioUrl;
      audioElement.load();
    }

    // Update currentTime from audio when playing
    const handleTimeUpdate = () => {
      if (currentSong.audioUrl) {
        setCurrentTime(audioElement.currentTime);
      }
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [currentSong, audioElement]);

  // Control audio playback
  useEffect(() => {
    if (!currentSong?.audioUrl) return;

    if (isPlaying) {
      audioElement.play().catch(err => console.error('Audio playback error:', err));
    } else {
      audioElement.pause();
    }
  }, [isPlaying, currentSong, audioElement]);

  // Fallback timer for songs without audio
  useEffect(() => {
    if (!isPlaying || !currentSong || currentSong.audioUrl) return;

    const maxDuration = currentSong.id === 2 ? 632 : 60;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= maxDuration) return 0;
        return prev + 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentSong]);

  const currentSongBeads = currentSong ? customBeads[currentSong.id] || [] : [];
  const currentCordColor = currentSong ? cordColors[currentSong.id] || '#ff6b9d' : '#ff6b9d';

  return (
    <div className="h-screen flex flex-col text-white overflow-hidden relative" style={{ background: '#0E0E11' }}>
      <AnimatedBackground />
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar onOpenAssetUploader={() => setShowAssetUploader(true)} />
        <MainContent onPlaySong={handlePlaySong} onOpenBracelet={handleOpenBracelet} />
      </div>
      <div className="relative z-10">
        <NowPlaying
          currentSong={currentSong}
          isPlaying={isPlaying}
          onTogglePlayPause={togglePlayPause}
          customBeads={currentSongBeads}
          onOpenSongDetail={() => setShowSongDetail(true)}
          cordColor={currentCordColor}
        />
      </div>

      {showSongDetail && currentSong && (
        <ImprovedSongView
          song={currentSong}
          onClose={() => setShowSongDetail(false)}
          currentTime={currentTime}
          onAddBead={handleAddBead}
          customBeads={currentSongBeads}
          onSeekToTime={handleSeekToTime}
          isPlaying={isPlaying}
          onTogglePlay={togglePlayPause}
        />
      )}

      {showBraceletView && currentSong && (
        <BraceletListeningView
          songTitle={currentSong.title}
          artist={currentSong.artist}
          coverUrl={currentSong.coverUrl}
          beads={currentSongBeads}
          isPlaying={isPlaying}
          onTogglePlay={togglePlayPause}
          onClose={() => setShowBraceletView(false)}
          currentTime={currentTime}
          duration={currentSong.id === 2 ? 632 : 60}
          onSeekToTime={handleSeekToTime}
          cordColor={currentCordColor}
        />
      )}

      {showAssetUploader && (
        <AssetUploader onClose={() => setShowAssetUploader(false)} />
      )}
    </div>
  );
}

export default App;
