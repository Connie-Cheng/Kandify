import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { NowPlaying } from './components/NowPlaying';
import { ImprovedSongView, CustomBead } from './components/ImprovedSongView';
import { BraceletListeningView } from './components/BraceletListeningView';
import { AssetUploader } from './components/AssetUploader';
import { AnimatedBackground } from './components/AnimatedBackground';
import { isSpotifyAuthenticated, handleAuthCallback, spotifyLogout, getAccessToken } from './spotify/auth';
import { GiftDialog } from './components/GiftDialog';
import { BlendDialog } from './components/BlendDialog';
import { useSpotifyPlayer } from './spotify/useSpotifyPlayer';

export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
  audioUrl?: string;
  spotifyUri?: string;
  durationSeconds?: number;
}

function App() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSongDetail, setShowSongDetail] = useState(false);
  const [showBraceletView, setShowBraceletView] = useState(false);
  const [showAssetUploader, setShowAssetUploader] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [customBeads, setCustomBeads] = useState<Record<number, CustomBead[]>>({});
  const [cordColors] = useState<Record<number, string>>({
    1: '#9370db',   // Replay - purple
    100: '#ff6b9d', // Rock with You - pink
  });
  const [audioElement] = useState(() => new Audio());
  const [audioLoadFailed, setAudioLoadFailed] = useState(false);
  const [spotifyAuth, setSpotifyAuth] = useState(isSpotifyAuthenticated);
  const [giftDialog, setGiftDialog] = useState<{ songId: number; songTitle: string; artist: string } | null>(null);
  const [blendDialog, setBlendDialog] = useState<{ songTitle: string; artist: string } | null>(null);

  const spotify = useSpotifyPlayer(spotifyAuth);
  // Spotify is active when authenticated, player ready, and current song has a URI
  const spotifyActive = spotifyAuth && spotify.isReady && !!currentSong?.spotifyUri;

  // Handle Spotify OAuth callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      // Clear the code from the URL immediately regardless of outcome
      window.history.replaceState({}, '', window.location.pathname);
      handleAuthCallback(code)
        .then(() => setSpotifyAuth(true))
        .catch((err) => {
          console.error('[Spotify] Auth callback failed:', err);
          spotifyLogout();
          setSpotifyAuth(false);
        });
    }
  }, []);

  // Sync currentTime and isPlaying from Spotify when it's the active source
  useEffect(() => {
    if (!spotifyActive) return;
    setCurrentTime(spotify.positionSeconds);
    setIsPlaying(spotify.isPlaying);
  }, [spotify.positionSeconds, spotify.isPlaying, spotifyActive]);

  const handlePlaySong = async (song: Song) => {
    let resolvedSong = song;
    if (!song.audioUrl && !song.spotifyUri) {
      const token = await getAccessToken();
      if (token) {
        try {
          const artist = song.artist.split(',')[0].trim();
          const q = encodeURIComponent(`track:${song.title} artist:${artist}`);
          const res = await fetch(`https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          const track = json.tracks?.items?.[0];
          if (track?.preview_url) {
            resolvedSong = { ...song, audioUrl: track.preview_url };
          }
        } catch (e) {
          console.error('Failed to fetch Spotify preview:', e);
        }
      }
    }
    setCurrentSong(resolvedSong);
    setCurrentTime(0);
    if (spotifyAuth && spotify.isReady && resolvedSong.spotifyUri) {
      spotify.playTrack(resolvedSong.spotifyUri);
    } else {
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (spotifyActive) {
      spotify.togglePlay();
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  const handleAddBead = (bead: CustomBead) => {
    if (!currentSong) return;
    setCustomBeads((prev) => {
      const updated = { ...prev, [currentSong.id]: [...(prev[currentSong.id] || []), bead] };
      // Only persist user-added beads, not predefined ones
      const toSave: Record<number, CustomBead[]> = {};
      for (const [id, beads] of Object.entries(updated) as [string, CustomBead[]][]) {
        const userBeads = beads.filter((b: CustomBead) => !b.id.startsWith('predefined-'));
        if (userBeads.length > 0) toSave[Number(id)] = userBeads;
      }
      localStorage.setItem('customBeads', JSON.stringify(toSave));
      window.dispatchEvent(new Event('storage'));
      return updated;
    });
  };

  useEffect(() => {
    const loadBeads = () => {
      const saved = localStorage.getItem('customBeads');
      if (saved) {
        try { setCustomBeads(JSON.parse(saved)); }
        catch (e) { console.error('Failed to load custom beads', e); }
      }
    };
    loadBeads();
    window.addEventListener('storage', loadBeads);
    return () => window.removeEventListener('storage', loadBeads);
  }, []);

  const handleSeekToTime = (time: number) => {
    setCurrentTime(time);
    if (spotifyActive) {
      spotify.seek(time);
    } else if (currentSong?.audioUrl) {
      audioElement.currentTime = time;
    }
  };

  const handleOpenBracelet = async (songId: number) => {
    const songData = {
      100: {
        title: 'Rock with You',
        artist: 'Michael Jackson',
        coverUrl: '/covers/rock-with-you.jpg',   // cover image file: public/covers/rock-with-you.jpg
        audioUrl: '/audio/rock-with-you.mp3',    // audio file:       public/audio/rock-with-you.mp3
        spotifyUri: '',                           // Spotify URI: right-click song in Spotify → Share → Copy Song Link → extract spotify:track:XXXX
        durationSeconds: 236,
      },
      101: {
        title: 'Work',
        artist: 'Rihanna, Drake',
        coverUrl: '/covers/work.png',            // cover image file: public/covers/work.png
        audioUrl: '/audio/work.mp3',             // audio file:       public/audio/work.mp3
        spotifyUri: '',                           // Spotify URI: right-click song in Spotify → Share → Copy Song Link → extract spotify:track:XXXX
        durationSeconds: 237,
      },
      102: {
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        coverUrl: '/covers/blinding-lights.png', // cover image file: public/covers/blinding-lights.png
        audioUrl: '/audio/blinding-lights.mp3',  // audio file:       public/audio/blinding-lights.mp3
        spotifyUri: '',                           // Spotify URI: right-click song in Spotify → Share → Copy Song Link → extract spotify:track:XXXX
        durationSeconds: 200,
      },
      1: {
        title: 'Replay',
        artist: 'Iyaz',
        coverUrl: '/covers/replay.jpg',          // cover image file: public/covers/replay.jpg
        audioUrl: '/audio/replay.mp3',           // audio file:       public/audio/replay.mp3
        spotifyUri: '',                           // Spotify URI: right-click song in Spotify → Share → Copy Song Link → extract spotify:track:XXXX
        durationSeconds: 211,
      },
      2: {
        title: 'Down',
        artist: 'Jay Sean, Lil Wayne',
        coverUrl: '/covers/down.jpg',            // cover image file: public/covers/down.jpg
        audioUrl: '/audio/down.mp3',             // audio file:       public/audio/down.mp3
        spotifyUri: 'spotify:track:6cmm1LMvZdB5zsCwX5BjqE',
        durationSeconds: 200,
      },
    };

    const data = songData[songId as keyof typeof songData];
    if (!data) { console.error('Song not found:', songId); return; }

    // localStorage upload takes priority over static file
    const audioUrl = localStorage.getItem(`audio_${songId}`) || data.audioUrl || undefined;

    const song: Song = {
      id: songId,
      title: data.title,
      artist: data.artist,
      album: 'Single',
      duration: `${Math.floor(data.durationSeconds / 60)}:${String(data.durationSeconds % 60).padStart(2, '0')}`,
      coverUrl: data.coverUrl,
      audioUrl,
      spotifyUri: data.spotifyUri || undefined,
      durationSeconds: data.durationSeconds,
    };

    // Load predefined beads if no custom beads exist yet
    if (!customBeads[songId]) {
      const module = await import('./data/songBracelets');
      const bracelet = module.songBracelets.find(b => b.songId === songId);
      if (bracelet) {
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
        const beadCount = bracelet.beads.length;
        const spacing = data.durationSeconds / (beadCount > 1 ? beadCount - 1 : 1);
        const convertedBeads: CustomBead[] = bracelet.beads.map((bead: any, index: number) => ({
          id: `predefined-${songId}-${index}`,
          type: bead.type === 'charm' ? 'shaped' : bead.type === 'letter' ? 'letter' : bead.type === 'number' ? 'number' : 'shaped',
          shape: bead.charmType ? bead.charmType : 'circle',
          color: bead.color,
          material: bead.material || 'glossy',
          size: bead.size || 'medium',
          letter: bead.content,
          number: bead.content,
          timestamp: index * spacing,
          lyricText: '',
          note: predefinedNotes[songId]?.[index] || undefined,
        }));
        setCustomBeads(prev => ({ ...prev, [songId]: convertedBeads }));
      }
    }

    setCurrentSong(song);
    setShowBraceletView(true);
    setCurrentTime(0);

    if (spotifyAuth && spotify.isReady && song.spotifyUri) {
      spotify.playTrack(song.spotifyUri);
    } else {
      setIsPlaying(true);
    }
  };

  // Load HTML audio source when song changes (only when Spotify is not active)
  useEffect(() => {
    if (!currentSong?.audioUrl || (spotifyAuth && spotify.isReady)) return;
    setAudioLoadFailed(false);
    audioElement.src = currentSong.audioUrl;
    audioElement.load();
    const handleError = () => setAudioLoadFailed(true);
    audioElement.addEventListener('error', handleError);
    return () => audioElement.removeEventListener('error', handleError);
  }, [currentSong, audioElement, spotifyAuth, spotify.isReady]);

  // Sync currentTime from HTML audio element
  useEffect(() => {
    if (!currentSong?.audioUrl || (spotifyAuth && spotify.isReady)) return;
    const handleTimeUpdate = () => setCurrentTime(audioElement.currentTime);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    return () => audioElement.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentSong, audioElement, spotifyAuth, spotify.isReady]);

  // Control HTML audio play/pause (only when Spotify is not the active source)
  useEffect(() => {
    if (!currentSong?.audioUrl || (spotifyAuth && spotify.isReady)) return;
    if (isPlaying) {
      audioElement.play().catch(err => console.error('Audio playback error:', err));
    } else {
      audioElement.pause();
    }
  }, [isPlaying, currentSong, audioElement, spotifyAuth, spotify.isReady]);

  // Fallback timer when no audio (or audio failed) and Spotify is not active
  useEffect(() => {
    if (!isPlaying || !currentSong || (spotifyAuth && spotify.isReady)) return;
    if (currentSong.audioUrl && !audioLoadFailed) return;
    const maxDuration = currentSong.durationSeconds ?? 60;
    const interval = setInterval(() => {
      setCurrentTime(prev => prev >= maxDuration ? 0 : prev + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, currentSong, audioLoadFailed, spotifyAuth, spotify.isReady]);

  const currentSongBeads = currentSong ? customBeads[currentSong.id] || [] : [];
  const currentCordColor = currentSong ? cordColors[currentSong.id] || '#ff6b9d' : '#ff6b9d';
  const songDuration = (spotifyActive && spotify.durationSeconds > 0)
    ? spotify.durationSeconds
    : currentSong?.durationSeconds ?? 60;

  return (
    <div className="h-screen flex flex-col text-white overflow-hidden relative" style={{ background: '#0E0E11' }}>
      <AnimatedBackground />
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar
          onOpenAssetUploader={() => setShowAssetUploader(true)}
          spotifyAuthenticated={spotifyAuth}
          spotifyReady={spotify.isReady}
          onSpotifyLogout={() => { spotifyLogout(); setSpotifyAuth(false); }}
        />
        <MainContent
          onPlaySong={handlePlaySong}
          onOpenBracelet={handleOpenBracelet}
          onOpenGift={(songId, songTitle, artist) => setGiftDialog({ songId, songTitle, artist })}
          onOpenBlend={(songTitle, artist) => setBlendDialog({ songTitle, artist })}
        />
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
          duration={songDuration}
          onSeekToTime={handleSeekToTime}
          cordColor={currentCordColor}
        />
      )}

      {showAssetUploader && (
        <AssetUploader onClose={() => setShowAssetUploader(false)} />
      )}

      {giftDialog && (
        <GiftDialog
          songTitle={giftDialog.songTitle}
          artist={giftDialog.artist}
          songId={giftDialog.songId}
          onClose={() => setGiftDialog(null)}
        />
      )}

      {blendDialog && (
        <BlendDialog
          songTitle={blendDialog.songTitle}
          artist={blendDialog.artist}
          onClose={() => setBlendDialog(null)}
        />
      )}
    </div>
  );
}

export default App;
