// Preset playlist bracelets — each entry is a curated playlist of Black-artist
// songs. Each song carries one "song bead" deterministically picked from the
// EnhancedBeadGallery template pool. No AI; the same hash always picks the
// same bead so reloads stay visually stable.

import type { EnhancedBeadOption } from '../components/EnhancedBeadGallery';

// Local copy of the visual bead pool that the gallery exposes. Kept inline so
// this preset file is self-contained — if the gallery options change, sync
// this list manually.
const BEAD_POOL: EnhancedBeadOption[] = [
  // Circles
  { id: 'p-circle-pink',     type: 'shaped', shape: 'circle', color: '#ff6b9d', material: 'glossy' },
  { id: 'p-circle-red',      type: 'shaped', shape: 'circle', color: '#ff1744', material: 'glossy' },
  { id: 'p-circle-purple',   type: 'shaped', shape: 'circle', color: '#9c27b0', material: 'iridescent' },
  { id: 'p-circle-blue',     type: 'shaped', shape: 'circle', color: '#2196f3', material: 'metallic' },
  { id: 'p-circle-teal',     type: 'shaped', shape: 'circle', color: '#00bcd4', material: 'iridescent' },
  { id: 'p-circle-green',    type: 'shaped', shape: 'circle', color: '#4caf50', material: 'glossy' },
  { id: 'p-circle-yellow',   type: 'shaped', shape: 'circle', color: '#ffd600', material: 'glossy' },
  { id: 'p-circle-orange',   type: 'shaped', shape: 'circle', color: '#ff6f00', material: 'metallic' },
  { id: 'p-circle-gray',     type: 'shaped', shape: 'circle', color: '#78909c', material: 'matte' },
  { id: 'p-circle-black',    type: 'shaped', shape: 'circle', color: '#212121', material: 'glossy' },
  { id: 'p-circle-white',    type: 'shaped', shape: 'circle', color: '#ffffff', material: 'glossy' },
  { id: 'p-circle-lavender', type: 'shaped', shape: 'circle', color: '#b388ff', material: 'iridescent' },
  // Squares
  { id: 'p-square-pink',     type: 'shaped', shape: 'square', color: '#ff6b9d', material: 'glossy' },
  { id: 'p-square-blue',     type: 'shaped', shape: 'square', color: '#2196f3', material: 'metallic' },
  { id: 'p-square-purple',   type: 'shaped', shape: 'square', color: '#9c27b0', material: 'glossy' },
  { id: 'p-square-green',    type: 'shaped', shape: 'square', color: '#4caf50', material: 'matte' },
  { id: 'p-square-orange',   type: 'shaped', shape: 'square', color: '#ff6f00', material: 'metallic' },
  // Hearts
  { id: 'p-heart-red',       type: 'shaped', shape: 'heart',  color: '#ff1744', material: 'glossy' },
  { id: 'p-heart-pink',      type: 'shaped', shape: 'heart',  color: '#ff6b9d', material: 'glossy' },
  { id: 'p-heart-purple',    type: 'shaped', shape: 'heart',  color: '#9c27b0', material: 'metallic' },
  // Stars
  { id: 'p-star-gold',       type: 'shaped', shape: 'star',   color: '#ffd600', material: 'metallic' },
  { id: 'p-star-silver',     type: 'shaped', shape: 'star',   color: '#e0e0e0', material: 'metallic' },
  { id: 'p-star-blue',       type: 'shaped', shape: 'star',   color: '#2196f3', material: 'iridescent' },
  // Flowers
  { id: 'p-flower-pink',     type: 'shaped', shape: 'flower', color: '#ff6b9d', material: 'glossy' },
  { id: 'p-flower-yellow',   type: 'shaped', shape: 'flower', color: '#ffd600', material: 'glossy' },
  { id: 'p-flower-purple',   type: 'shaped', shape: 'flower', color: '#9c27b0', material: 'iridescent' },
  // Clovers
  { id: 'p-clover-emerald',  type: 'shaped', shape: 'clover', color: '#00c853', material: 'metallic' },
];

// Tiny deterministic 32-bit string hash (FNV-1a). Used to pick a bead so the
// same song always lands on the same bead across reloads.
function hashKey(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}
function pickBead(seed: string): EnhancedBeadOption {
  return BEAD_POOL[hashKey(seed) % BEAD_POOL.length];
}

export interface PlaylistSong {
  /** songId matches songLyrics keys for songs that have a Charm built; >= 1000 for dummies */
  songId: number;
  title: string;
  artist: string;
  album?: string;
  /** placeholder cover URL (real cover gets fetched from Spotify on play) */
  coverUrl?: string;
  /** preset song bead, deterministic by (title + artist) */
  songBead: EnhancedBeadOption;
}

export interface PlaylistBracelet {
  id: string;
  name: string;
  description: string;
  cordColor: string;
  songs: PlaylistSong[];
}

// Convenience to build a song with its deterministic bead in one call.
function s(songId: number, title: string, artist: string, album?: string): PlaylistSong {
  return { songId, title, artist, album, songBead: pickBead(`${title}|${artist}`) };
}

export const playlistBracelets: PlaylistBracelet[] = [
  {
    id: 'slow-burn',
    name: 'Slow Burn',
    description: 'Soulful, slower R&B and soul — late nights and quiet rooms.',
    cordColor: '#9c27b0',
    songs: [
      s(100, 'Rock with You',     'Michael Jackson', 'Off the Wall'),         // has charm
      s(1001, 'Cranes in the Sky', 'Solange',         'A Seat at the Table'),
      s(1002, 'Pink + White',      'Frank Ocean',     'Blonde'),
      s(1003, 'Good Days',         'SZA',             'Good Days'),
      s(1004, 'On & On',           'Erykah Badu',     'Baduizm'),
      s(1005, 'Free Mind',         'Tems',            'For Broken Ears'),
      s(1006, 'Hotline Bling',     'Drake',           'Views'),
      s(1, 'Replay',               'Iyaz',            'Replay'),                // has charm
    ],
  },
  {
    id: 'crown-heat',
    name: 'Crown Heat',
    description: 'Hip-hop, rap and dance — the loud half of the closet.',
    cordColor: '#ff1744',
    songs: [
      s(101, 'Work',               'Rihanna',                 'Anti'),         // has charm
      s(1007, 'HUMBLE.',           'Kendrick Lamar',          'DAMN.'),
      s(1008, 'EARFQUAKE',         'Tyler, The Creator',      'IGOR'),
      s(1009, 'Crazy in Love',     'Beyoncé',                 'Dangerously in Love'),
      s(1010, '99 Problems',       'Jay-Z',                   'The Black Album'),
      s(1011, 'Last Last',         'Burna Boy',               'Love, Damini'),
      s(1012, 'Make Me Feel',      'Janelle Monáe',           'Dirty Computer'),
      s(102, 'Blinding Lights',    'The Weeknd',              'After Hours'),  // has charm
    ],
  },
];

export function getPlaylistById(id: string): PlaylistBracelet | undefined {
  return playlistBracelets.find(p => p.id === id);
}
