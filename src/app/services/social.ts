// Social layer — currently backed by localStorage.
// Replace each function body with real API calls when a backend exists.

export interface UserProfile {
  id: string;
  name: string;
  color: string;
  gradient: string;
}

export interface CollabNote {
  contributor: string;
  color: string;
  note: string;
}

export interface GiftedBracelet {
  id: string;
  fromUser: UserProfile;
  toUserId: string;
  songTitle: string;
  artist: string;
  coverUrl: string;
  beads: Array<{ color: string; [key: string]: unknown }>;
  format: 'in-app' | 'text' | 'social';
  note?: string;
  collabNotes?: CollabNote[];
  collaboratorNames?: string[];
  sentAt: number;
  opened: boolean;
}

export interface BlendedTrack {
  title: string;
  artist: string;
  source: 'you' | 'friend' | 'blend';
  reason: string;
}

export interface BlendSession {
  id: string;
  userId1: string;
  userId2: string;
  friendName: string;
  friendColor: string;
  playlist: BlendedTrack[];
  createdAt: number;
}

// Current authenticated user — replace with real auth session
export const CURRENT_USER: UserProfile = {
  id: 'user_main',
  name: 'Connie',
  color: '#ff6b9d',
  gradient: 'from-pink-400 to-red-400',
};

// Friend roster — replace with real contacts/friends API
export const FRIENDS: UserProfile[] = [
  { id: 'user_jessica', name: 'Jessica', color: '#f472b6', gradient: 'from-pink-400 to-pink-600' },
  { id: 'user_kida',    name: 'Kida',    color: '#60a5fa', gradient: 'from-blue-400 to-blue-600' },
  { id: 'user_jack',    name: 'Jack',    color: '#a78bfa', gradient: 'from-violet-400 to-violet-600' },
  { id: 'user_sean',    name: 'Sean',    color: '#fbbf24', gradient: 'from-yellow-400 to-yellow-600' },
];

// Stub music taste per friend — replace with Spotify listening history API per user
const FRIEND_TASTE: Record<string, BlendedTrack[]> = {
  user_jessica: [
    { title: 'As It Was',   artist: 'Harry Styles',  source: 'friend', reason: "Jessica's top play" },
    { title: 'Anti-Hero',   artist: 'Taylor Swift',  source: 'friend', reason: 'Jessica loves this' },
    { title: 'Flowers',     artist: 'Miley Cyrus',   source: 'friend', reason: "Jessica's recent fave" },
  ],
  user_kida: [
    { title: 'Golden Hour', artist: 'JVKE',           source: 'friend', reason: "Kida's top play" },
    { title: 'Levitating',  artist: 'Dua Lipa',       source: 'friend', reason: 'Kida loves this' },
    { title: 'Stay',        artist: 'The Kid LAROI',  source: 'friend', reason: "Kida's recent fave" },
  ],
  user_jack: [
    { title: 'Heat Waves',  artist: 'Glass Animals',  source: 'friend', reason: "Jack's top play" },
    { title: 'Sunflower',   artist: 'Post Malone',    source: 'friend', reason: 'Jack loves this' },
    { title: 'Bad Habits',  artist: 'Ed Sheeran',     source: 'friend', reason: "Jack's recent fave" },
  ],
  user_sean: [
    { title: 'Bad Guy',       artist: 'Billie Eilish', source: 'friend', reason: "Sean's top play" },
    { title: 'Industry Baby', artist: 'Lil Nas X',     source: 'friend', reason: 'Sean loves this' },
    { title: 'Montero',       artist: 'Lil Nas X',     source: 'friend', reason: "Sean's recent fave" },
  ],
};

// Connie's taste stubs — replace with real Spotify listening history for the current user
const MY_TASTE: BlendedTrack[] = [
  { title: 'Rock with You', artist: 'Michael Jackson', source: 'you', reason: "Connie's top play" },
  { title: 'Replay',        artist: 'Iyaz',            source: 'you', reason: 'Connie loves this' },
  { title: 'Down',          artist: 'Jay Sean',        source: 'you', reason: "Connie's recent fave" },
];

// Shared songs — replace with Spotify intersection computed server-side
const SHARED_SONGS: BlendedTrack[] = [
  { title: 'Blinding Lights', artist: 'The Weeknd', source: 'blend', reason: 'You both love this' },
  { title: 'Work',            artist: 'Rihanna',    source: 'blend', reason: 'A shared favorite' },
];

// Send a gift bracelet to a friend.
// Replace localStorage writes with POST /api/gifts.
export function sendGift(
  toUser: UserProfile,
  songTitle: string,
  artist: string,
  coverUrl: string,
  beads: Array<{ color: string; [key: string]: unknown }>,
  format: GiftedBracelet['format'],
  note?: string,
  collabNotes?: CollabNote[],
  collaboratorNames?: string[],
): GiftedBracelet {
  const gift: GiftedBracelet = {
    id: `gift_${Date.now()}`,
    fromUser: CURRENT_USER,
    toUserId: toUser.id,
    songTitle,
    artist,
    coverUrl,
    beads,
    format,
    note,
    collabNotes,
    collaboratorNames,
    sentAt: Date.now(),
    opened: false,
  };
  const sent: GiftedBracelet[] = JSON.parse(localStorage.getItem('gifts_sent') ?? '[]');
  localStorage.setItem('gifts_sent', JSON.stringify([...sent, gift]));
  const inbox: GiftedBracelet[] = JSON.parse(localStorage.getItem(`inbox_${toUser.id}`) ?? '[]');
  localStorage.setItem(`inbox_${toUser.id}`, JSON.stringify([...inbox, gift]));
  window.dispatchEvent(new Event('storage'));
  return gift;
}

// Fetch received gifts for a user.
// Replace with GET /api/gifts?userId=...
export function getReceivedGifts(userId: string = CURRENT_USER.id): GiftedBracelet[] {
  return JSON.parse(localStorage.getItem(`inbox_${userId}`) ?? '[]');
}

// Mark a gift as opened.
// Replace with PATCH /api/gifts/:id
export function markGiftOpened(giftId: string, userId: string = CURRENT_USER.id): void {
  const inbox = getReceivedGifts(userId);
  const updated = inbox.map(g => g.id === giftId ? { ...g, opened: true } : g);
  localStorage.setItem(`inbox_${userId}`, JSON.stringify(updated));
}

// Build a blended playlist by interleaving shared songs, Connie's taste, and a friend's taste.
// Replace MY_TASTE / FRIEND_TASTE / SHARED_SONGS with real Spotify history API calls.
export function generateBlendPlaylist(friendId: string): BlendedTrack[] {
  const friendTaste = FRIEND_TASTE[friendId] ?? [];
  const result: BlendedTrack[] = [...SHARED_SONGS];
  let mi = 0, fi = 0;
  while (mi < MY_TASTE.length || fi < friendTaste.length) {
    if (mi < MY_TASTE.length) result.push(MY_TASTE[mi++]);
    if (fi < friendTaste.length) result.push(friendTaste[fi++]);
  }
  return result;
}

// Save a blend session.
// Replace with POST /api/blends.
export function saveBlendSession(friend: UserProfile): BlendSession {
  const session: BlendSession = {
    id: `blend_${Date.now()}`,
    userId1: CURRENT_USER.id,
    userId2: friend.id,
    friendName: friend.name,
    friendColor: friend.color,
    playlist: generateBlendPlaylist(friend.id),
    createdAt: Date.now(),
  };
  const existing: BlendSession[] = JSON.parse(localStorage.getItem('blend_sessions') ?? '[]');
  localStorage.setItem('blend_sessions', JSON.stringify([...existing, session]));
  return session;
}
