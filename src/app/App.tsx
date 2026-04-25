import { useState, useEffect, useMemo } from 'react';
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
import { getPlaylistById } from './data/playlistBracelets';

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

// Stable empty array — used as the no-beads fallback so consumers don't see a
// fresh `[]` reference every render (which would otherwise spuriously retrigger
// effects that depend on the customBeads prop).
const EMPTY_BEADS: CustomBead[] = [];

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
  // Tracks which playlist (and index within it) the user is currently
  // playing through, so BraceletListeningView can show prev/next buttons.
  const [playlistContext, setPlaylistContext] = useState<{ playlistId: string; index: number } | null>(null);

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
          if (track) {
            resolvedSong = {
              ...song,
              spotifyUri: track.uri,
              audioUrl: track.preview_url ?? undefined,
              durationSeconds: Math.round(track.duration_ms / 1000),
            };
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
    // If Spotify is connected + ready + we have a URI:
    //  - if we're already playing → just toggle (pauses)
    //  - if not playing yet → kick off playTrack so the first click actually starts.
    //    This matters when the user opens BraceletListeningView before the
    //    SDK becomes ready, so the auto-play fired into a no-op.
    if (spotifyAuth && spotify.isReady && currentSong?.spotifyUri) {
      if (isPlaying) {
        spotify.togglePlay();
      } else {
        spotify.playTrack(currentSong.spotifyUri);
      }
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  const handleAddBead = (bead: CustomBead) => {
    if (!currentSong) return;
    setCustomBeads((prev) => {
      const existing = prev[currentSong.id] || [];
      // Replace any prior bead bound to the same lyric (same lyricText + timestamp);
      // otherwise append. Without this, regenerating a bead for a lyric leaves the
      // old one behind and inflates the "X moments" counter on the homepage.
      const lyricKey = bead.lyricText && bead.timestamp != null
        ? `${bead.timestamp}|${bead.lyricText}`
        : null;
      let next: CustomBead[];
      if (lyricKey) {
        const replaceIdx = existing.findIndex(b =>
          b.lyricText && b.timestamp != null && `${b.timestamp}|${b.lyricText}` === lyricKey
        );
        if (replaceIdx >= 0) {
          next = existing.slice();
          next[replaceIdx] = bead;
        } else {
          next = [...existing, bead];
        }
      } else {
        next = [...existing, bead];
      }
      const updated = { ...prev, [currentSong.id]: next };
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
      if (!saved) return;
      try {
        const parsed: Record<number, CustomBead[]> = JSON.parse(saved);
        // One-time dedup: collapse duplicate beads bound to the same lyric
        // (same lyricText + timestamp). Last-write-wins so the most recent
        // regeneration sticks. Fixes stale counts from before the dedup fix.
        let dirty = false;
        const cleaned: Record<number, CustomBead[]> = {};
        for (const [id, beads] of Object.entries(parsed) as [string, CustomBead[]][]) {
          const seen = new Map<string, number>();
          const out: CustomBead[] = [];
          for (const b of beads) {
            const key = b.lyricText && b.timestamp != null ? `${b.timestamp}|${b.lyricText}` : null;
            if (key && seen.has(key)) {
              out[seen.get(key)!] = b; // overwrite previous occurrence
              dirty = true;
            } else {
              if (key) seen.set(key, out.length);
              out.push(b);
            }
          }
          cleaned[Number(id)] = out;
        }
        setCustomBeads(cleaned);
        if (dirty) {
          localStorage.setItem('customBeads', JSON.stringify(cleaned));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (e) { console.error('Failed to load custom beads', e); }
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

    // Resolve Spotify URI + preview URL (fetch from API if not hardcoded)
    let resolvedUri = data.spotifyUri || '';
    let resolvedAudio = localStorage.getItem(`audio_${songId}`) || '';
    let resolvedDuration = data.durationSeconds;

    if (!resolvedUri) {
      const token = await getAccessToken();
      if (token) {
        try {
          const artist = data.artist.split(',')[0].trim();
          const q = encodeURIComponent(`track:${data.title} artist:${artist}`);
          const res = await fetch(`https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          const track = json.tracks?.items?.[0];
          if (track) {
            resolvedUri = track.uri;
            if (!resolvedAudio) resolvedAudio = track.preview_url ?? '';
            resolvedDuration = Math.round(track.duration_ms / 1000);
          }
        } catch (e) {
          console.error('Failed to fetch Spotify track for bracelet:', e);
        }
      }
    }

    const audioUrl = resolvedAudio || data.audioUrl || undefined;

    const song: Song = {
      id: songId,
      title: data.title,
      artist: data.artist,
      album: 'Single',
      duration: `${Math.floor(resolvedDuration / 60)}:${String(resolvedDuration % 60).padStart(2, '0')}`,
      coverUrl: data.coverUrl,
      audioUrl,
      spotifyUri: resolvedUri || undefined,
      durationSeconds: resolvedDuration,
    };

    // Load predefined beads unless the user has manually added their own beads
    // (auto-generated beads with id "auto-*" are ignored so they don't block predefined spacing)
    const hasUserBeads = customBeads[songId]?.some(
      (b: CustomBead) => !b.id.startsWith('predefined-') && !b.id.startsWith('auto-')
    );
    if (!hasUserBeads) {
      const module = await import('./data/songBracelets');
      const bracelet = module._archivedSongBracelets.find(b => b.songId === songId);
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

  // Plays a song from a playlist into the existing BraceletListeningView. Used
  // for playlist songs that aren't in the hardcoded songData map (the dummies
  // 1001+) — resolves cover + Spotify URI from /search at runtime.
  const playPlaylistSong = async (playlistId: string, index: number) => {
    const pl = getPlaylistById(playlistId);
    if (!pl) return;
    const ps = pl.songs[index];
    if (!ps) return;

    // If this song has a hardcoded entry (the 5 with local audio), prefer it.
    const hardcoded: Record<number, true> = { 1: true, 2: true, 100: true, 101: true, 102: true };
    if (hardcoded[ps.songId]) {
      setPlaylistContext({ playlistId, index });
      await handleOpenBracelet(ps.songId);
      return;
    }

    // Otherwise resolve via Spotify search (cover + uri) and build a Song.
    let coverUrl = ps.coverUrl || '';
    let spotifyUri: string | undefined;
    let durationSeconds = 200;
    let audioUrl: string | undefined;
    const token = await getAccessToken();
    if (token) {
      try {
        const artist = ps.artist.split(',')[0].trim();
        const q = encodeURIComponent(`track:${ps.title} artist:${artist}`);
        const res = await fetch(`https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const track = json.tracks?.items?.[0];
        if (track) {
          spotifyUri = track.uri;
          coverUrl = track.album?.images?.[0]?.url || coverUrl;
          durationSeconds = Math.round(track.duration_ms / 1000);
          audioUrl = track.preview_url ?? undefined;
        }
      } catch (e) { console.error('Failed to resolve playlist song via Spotify:', e); }
    }

    const song: Song = {
      id: ps.songId,
      title: ps.title,
      artist: ps.artist,
      album: ps.album || 'Single',
      duration: `${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, '0')}`,
      coverUrl,
      audioUrl,
      spotifyUri,
      durationSeconds,
    };

    setCurrentSong(song);
    setPlaylistContext({ playlistId, index });
    setShowBraceletView(true);
    setCurrentTime(0);
    if (spotifyAuth && spotify.isReady && spotifyUri) {
      spotify.playTrack(spotifyUri);
    } else {
      setIsPlaying(true);
    }
  };

  const handleOpenPlaylist = (playlistId: string) => {
    void playPlaylistSong(playlistId, 0);
  };

  const handlePlaylistPrev = () => {
    if (!playlistContext) return;
    const next = Math.max(0, playlistContext.index - 1);
    if (next === playlistContext.index) return;
    void playPlaylistSong(playlistContext.playlistId, next);
  };

  const handlePlaylistNext = () => {
    if (!playlistContext) return;
    const pl = getPlaylistById(playlistContext.playlistId);
    if (!pl) return;
    const next = Math.min(pl.songs.length - 1, playlistContext.index + 1);
    if (next === playlistContext.index) return;
    void playPlaylistSong(playlistContext.playlistId, next);
  };

  // Load HTML audio source when song changes (only when Spotify is not active)
  useEffect(() => {
    if (!currentSong?.audioUrl || spotifyActive) return;
    setAudioLoadFailed(false);
    audioElement.src = currentSong.audioUrl;
    audioElement.load();
    const handleError = () => setAudioLoadFailed(true);
    audioElement.addEventListener('error', handleError);
    return () => audioElement.removeEventListener('error', handleError);
  }, [currentSong, audioElement, spotifyAuth, spotify.isReady]);

  // Sync currentTime from HTML audio element
  useEffect(() => {
    if (!currentSong?.audioUrl || spotifyActive) return;
    const handleTimeUpdate = () => setCurrentTime(audioElement.currentTime);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    return () => audioElement.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentSong, audioElement, spotifyAuth, spotify.isReady]);

  // Control HTML audio play/pause (only when Spotify is not the active source)
  useEffect(() => {
    if (!currentSong?.audioUrl || spotifyActive) return;
    if (isPlaying) {
      audioElement.play().catch(err => console.error('Audio playback error:', err));
    } else {
      audioElement.pause();
    }
  }, [isPlaying, currentSong, audioElement, spotifyAuth, spotify.isReady]);

  // Fallback timer when no audio (or audio failed) and Spotify is not active
  useEffect(() => {
    if (!isPlaying || !currentSong || spotifyActive) return;
    if (currentSong.audioUrl && !audioLoadFailed) return;
    const maxDuration = currentSong.durationSeconds ?? 60;
    const interval = setInterval(() => {
      setCurrentTime(prev => prev >= maxDuration ? 0 : prev + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, currentSong, audioLoadFailed, spotifyAuth, spotify.isReady]);

  const currentSongBeads = useMemo(
    () => (currentSong && customBeads[currentSong.id]) || EMPTY_BEADS,
    [currentSong, customBeads]
  );
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
          onOpenPlaylist={handleOpenPlaylist}
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
          currentTime={currentTime}
          duration={songDuration}
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
          onClose={() => { setShowBraceletView(false); setPlaylistContext(null); }}
          currentTime={currentTime}
          duration={songDuration}
          onSeekToTime={handleSeekToTime}
          cordColor={currentCordColor}
          onPrev={playlistContext ? handlePlaylistPrev : undefined}
          onNext={playlistContext ? handlePlaylistNext : undefined}
          canPrev={playlistContext ? playlistContext.index > 0 : false}
          canNext={!!(playlistContext && (() => {
            const pl = getPlaylistById(playlistContext.playlistId);
            return pl && playlistContext.index < pl.songs.length - 1;
          })())}
          playlistName={playlistContext ? getPlaylistById(playlistContext.playlistId)?.name : undefined}
          playlistPosition={playlistContext ? `${playlistContext.index + 1} / ${getPlaylistById(playlistContext.playlistId)?.songs.length ?? 0}` : undefined}
          songBead={playlistContext ? getPlaylistById(playlistContext.playlistId)?.songs[playlistContext.index]?.songBead : undefined}
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
