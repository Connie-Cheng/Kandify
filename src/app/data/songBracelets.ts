import { BeadItem } from '../components/CharmBracelet';

export interface SongBracelet {
  songId: number;
  songTitle: string;
  artist: string;
  beads: BeadItem[];
}

export const songBracelets: SongBracelet[] = [
  {
    songId: 1,
    songTitle: 'Replay',
    artist: 'Iyaz',
    beads: [
      { type: 'bead', color: '#1e3a8a', material: 'glossy', size: 'medium' },
      { type: 'bead', color: '#3b82f6', material: 'iridescent', size: 'small' },
      { type: 'charm', charmType: 'star', color: '#fbbf24', material: 'metallic' },
      { type: 'letter', content: 'N', color: '#3b82f6' },
      { type: 'letter', content: 'I', color: '#3b82f6' },
      { type: 'letter', content: 'G', color: '#3b82f6' },
      { type: 'letter', content: 'H', color: '#3b82f6' },
      { type: 'letter', content: 'T', color: '#3b82f6' },
      { type: 'bead', color: '#60a5fa', material: 'glossy', size: 'large' },
      { type: 'charm', charmType: 'cloud', color: '#1e3a8a', material: 'matte' },
      { type: 'bead', color: '#2563eb', material: 'metallic', size: 'medium' },
    ]
  },
  {
    songId: 100,
    songTitle: 'Rock with You',
    artist: 'Michael Jackson',
    beads: [
      // Romantic pink/red theme - emotional, tender
      { type: 'bead', color: '#ff6b9d', material: 'glossy', size: 'medium' },
      { type: 'bead', color: '#ffc1e3', material: 'iridescent', size: 'small' },
      { type: 'charm', charmType: 'heart', color: '#ff1744', material: 'glossy' },
      { type: 'letter', content: 'M', color: '#ff1744' },
      { type: 'letter', content: 'Y', color: '#ff1744' },
      { type: 'bead', color: '#ffb3d9', material: 'glossy', size: 'medium' },
      { type: 'letter', content: 'L', color: '#c2185b' },
      { type: 'letter', content: 'O', color: '#c2185b' },
      { type: 'letter', content: 'V', color: '#c2185b' },
      { type: 'letter', content: 'E', color: '#c2185b' },
      { type: 'bead', color: '#ff80ab', material: 'glossy', size: 'large' },
      { type: 'charm', charmType: 'sparkle', color: '#f50057', material: 'glossy' },
      { type: 'bead', color: '#ff6b9d', material: 'iridescent', size: 'medium' },
      { type: 'bead', color: '#ffc1e3', material: 'glossy', size: 'small' },
      { type: 'charm', charmType: 'heart', color: '#ff4081', material: 'metallic' },
      { type: 'bead', color: '#ff80ab', material: 'glossy', size: 'medium' },
      { type: 'bead', color: '#ff6b9d', material: 'glossy', size: 'small' },
    ]
  },
];
