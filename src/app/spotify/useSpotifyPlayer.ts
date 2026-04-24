import { useCallback, useEffect, useRef, useState } from 'react';
import { getAccessToken } from './auth';

// Minimal Spotify Web Playback SDK type declarations
declare global {
  interface Window {
    Spotify: {
      Player: new (opts: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifySDKPlayer;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface SpotifySDKPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: 'ready' | 'not_ready', cb: (data: { device_id: string }) => void): void;
  addListener(event: 'player_state_changed', cb: (state: SpotifySDKState | null) => void): void;
  getCurrentState(): Promise<SpotifySDKState | null>;
  togglePlay(): Promise<void>;
  seek(positionMs: number): Promise<void>;
}

interface SpotifySDKState {
  paused: boolean;
  position: number;
  duration: number;
  track_window: { current_track: { uri: string; name: string } };
}

export interface SpotifyPlayerResult {
  isReady: boolean;
  isPlaying: boolean;
  positionSeconds: number;
  durationSeconds: number;
  deviceId: string | null;
  playTrack: (uri: string) => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
}

export function useSpotifyPlayer(enabled: boolean): SpotifyPlayerResult {
  const playerRef = useRef<SpotifySDKPlayer | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSeconds, setPositionSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);

  const stopPoll = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const startPoll = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      const s = await playerRef.current?.getCurrentState();
      if (s) {
        setPositionSeconds(s.position / 1000);
        setDurationSeconds(s.duration / 1000);
        setIsPlaying(!s.paused);
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const init = () => {
      const player = new window.Spotify.Player({
        name: 'IBI Bracelet Player',
        getOAuthToken: async (cb) => { const t = await getAccessToken(); if (t) cb(t); },
        volume: 0.8,
      });

      player.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id);
        setIsReady(true);
      });

      player.addListener('not_ready', () => setIsReady(false));

      player.addListener('player_state_changed', (s) => {
        if (!s) return;
        setPositionSeconds(s.position / 1000);
        setDurationSeconds(s.duration / 1000);
        setIsPlaying(!s.paused);
        if (!s.paused) startPoll(); else stopPoll();
      });

      player.connect();
      playerRef.current = player;
    };

    if (window.Spotify) {
      init();
    } else {
      window.onSpotifyWebPlaybackSDKReady = init;
      if (!document.querySelector('script[src*="spotify-player"]')) {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.head.appendChild(script);
      }
    }

    return () => { stopPoll(); playerRef.current?.disconnect(); };
  }, [enabled, startPoll, stopPoll]);

  const playTrack = useCallback(async (uri: string) => {
    const token = await getAccessToken();
    console.log('[Spotify] playTrack called', { uri, deviceId, hasToken: !!token });
    if (!token || !deviceId) { console.warn('[Spotify] missing token or deviceId'); return; }
    const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: [uri] }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[Spotify] playTrack error', res.status, text);
    } else {
      console.log('[Spotify] playTrack success');
    }
    startPoll();
  }, [deviceId, startPoll]);

  const togglePlay = useCallback(async () => {
    await playerRef.current?.togglePlay();
  }, []);

  const seek = useCallback(async (seconds: number) => {
    await playerRef.current?.seek(Math.round(seconds * 1000));
  }, []);

  return { isReady, isPlaying, positionSeconds, durationSeconds, deviceId, playTrack, togglePlay, seek };
}
