import { X, Send, MessageCircle, Share2, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { FRIENDS, sendGift, GiftedBracelet, CollabNote } from '../services/social';
import { GiftConfettiScreen } from './GiftConfettiScreen';
import { CollabBeadScreen, CollabBead } from './CollabBeadScreen';

interface GiftDialogProps {
  songTitle: string;
  artist: string;
  songId?: number;
  onClose: () => void;
}

const SONG_COVERS: Record<number, string> = {
  100: '/covers/rock-with-you.jpg',
  101: '/covers/work.png',
  102: '/covers/blinding-lights.png',
  1:   '/covers/replay.jpg',
  2:   '/covers/down.jpg',
};

type Format = 'in-app' | 'text' | 'social';

const FORMAT_OPTIONS: { value: Format; icon: React.ReactNode; label: string }[] = [
  { value: 'in-app', icon: <Smartphone className="w-4 h-4" />, label: 'In-App' },
  { value: 'text',   icon: <MessageCircle className="w-4 h-4" />, label: 'Text' },
  { value: 'social', icon: <Share2 className="w-4 h-4" />, label: 'Social' },
];

type Phase = 'form' | 'collab' | 'done';

export function GiftDialog({ songTitle, artist, songId, onClose }: GiftDialogProps) {
  const [phase, setPhase] = useState<Phase>('form');
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
  const [selectedCollabs, setSelectedCollabs] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const [finalGift, setFinalGift] = useState<GiftedBracelet | null>(null);
  const [pendingBeads, setPendingBeads] = useState<Array<{ color: string }>>([]);
  const [pendingCoverUrl, setPendingCoverUrl] = useState('');

  const friend = FRIENDS.find(f => f.name === selectedFriend);
  const collaborators = FRIENDS.filter(f => selectedCollabs.includes(f.name));
  const canSend = !!selectedFriend && !!selectedFormat;

  const toggleCollab = (name: string) => {
    setSelectedCollabs(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : prev.length < 3 ? [...prev, name] : prev
    );
  };

  const handleSend = () => {
    if (!friend || !selectedFormat) return;
    const coverUrl = songId ? (SONG_COVERS[songId] ?? '') : '';
    const saved = localStorage.getItem('customBeads');
    const allBeads = saved ? JSON.parse(saved) : {};
    const originalBeads: Array<{ color: string }> = songId ? (allBeads[songId] ?? []) : [];

    setFadeOut(true);

    if (collaborators.length > 0) {
      // Store pending data for after collab flow
      setPendingBeads(originalBeads);
      setPendingCoverUrl(coverUrl);
      setTimeout(() => setPhase('collab'), 320);
    } else {
      const gift = sendGift(friend, songTitle, artist, coverUrl, originalBeads, selectedFormat, note.trim() || undefined);
      setTimeout(() => {
        setFinalGift(gift);
        setPhase('done');
      }, 320);
    }
  };

  const handleCollabComplete = (addedBeads: CollabBead[], collabNotes: CollabNote[]) => {
    if (!friend || !selectedFormat) return;
    const allBeads = [
      ...pendingBeads,
      ...addedBeads.map(b => ({ color: b.color })),
    ];
    const gift = sendGift(
      friend, songTitle, artist, pendingCoverUrl, allBeads, selectedFormat,
      note.trim() || undefined,
      collabNotes.length > 0 ? collabNotes : undefined,
      collaborators.map(c => c.name),
    );
    setFinalGift(gift);
    setPhase('done');
  };

  if (phase === 'done' && finalGift) {
    return <GiftConfettiScreen gift={finalGift} onClose={onClose} />;
  }

  if (phase === 'collab' && friend) {
    return (
      <CollabBeadScreen
        songTitle={songTitle}
        originalBeads={pendingBeads}
        collaborators={collaborators}
        recipientName={friend.name}
        onComplete={handleCollabComplete}
        onClose={onClose}
      />
    );
  }

  // Phase === 'form'
  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
      style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.3s ease-out', pointerEvents: fadeOut ? 'none' : 'all' }}
    >
      <div className="glass-card rounded-3xl p-6 w-full max-w-md outer-glow-soft inner-glow overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Gift Bracelet</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Song info */}
        <div className="mb-6">
          <p className="text-sm text-white/60 mb-1">Song</p>
          <p className="font-semibold">{songTitle}</p>
          <p className="text-sm text-white/60">{artist}</p>
        </div>

        {/* Select recipient */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Send To</h3>
          <div className="space-y-2">
            {FRIENDS.map((f) => (
              <button
                key={f.name}
                onClick={() => {
                  setSelectedFriend(f.name);
                  setSelectedCollabs(prev => prev.filter(n => n !== f.name));
                }}
                className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${
                  selectedFriend === f.name ? 'glass-button' : 'glass-card hover:glass-button'
                }`}
                style={selectedFriend === f.name ? {
                  background: `radial-gradient(circle at 30% 50%, ${f.color}40, ${f.color}20)`,
                  boxShadow: `0 0 0 2px ${f.color}66`,
                } : {}}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${f.gradient} flex items-center justify-center font-bold`}>
                    {f.name[0]}
                  </div>
                  <span className="font-medium">{f.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Collaborators */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/60 mb-1 uppercase tracking-wider">Add Collaborators</h3>
          <p className="text-xs text-white/30 mb-3">Up to 3 friends can add beads before it's sent</p>
          <div className="flex gap-3 flex-wrap">
            {FRIENDS.filter(f => f.name !== selectedFriend).map(f => {
              const isSelected = selectedCollabs.includes(f.name);
              const isDisabled = !isSelected && selectedCollabs.length >= 3;
              return (
                <button
                  key={f.name}
                  onClick={() => toggleCollab(f.name)}
                  disabled={isDisabled}
                  className="flex flex-col items-center gap-1 transition-all"
                  style={{ opacity: isDisabled ? 0.3 : 1 }}
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${f.gradient} flex items-center justify-center font-bold text-sm relative transition-all duration-200`}
                    style={isSelected ? {
                      boxShadow: `0 0 0 2.5px ${f.color}, 0 0 10px ${f.color}55`,
                      transform: 'scale(1.08)',
                    } : {}}
                  >
                    {f.name[0]}
                    {isSelected && (
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: f.color }}
                      >
                        <span className="text-[9px] font-bold text-white">✓</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-white/45">{f.name}</span>
                </button>
              );
            })}
          </div>
          {selectedCollabs.length > 0 && (
            <p className="text-xs text-white/30 mt-3">
              {selectedCollabs.length}/3 collaborator{selectedCollabs.length > 1 ? 's' : ''} —{' '}
              {selectedCollabs.join(', ')} will add beads before sending
            </p>
          )}
        </div>

        {/* Send As */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Send As</h3>
          <div className="grid grid-cols-3 gap-2">
            {FORMAT_OPTIONS.map(({ value, icon, label }) => (
              <button
                key={value}
                onClick={() => setSelectedFormat(value)}
                className={`rounded-2xl py-3 px-2 text-sm font-medium transition-all hover:scale-105 flex flex-col items-center justify-center gap-1.5 ${
                  selectedFormat === value ? 'glass-button' : 'glass-card hover:glass-button'
                }`}
                style={selectedFormat === value ? {
                  background: 'radial-gradient(circle at 30% 50%, rgba(180,30,90,0.3), rgba(140,80,200,0.2))',
                  boxShadow: '0 0 0 2px rgba(180,30,90,0.35)',
                } : {}}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Add a Note</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write something for them…"
            maxLength={200}
            rows={3}
            className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
            onFocus={e => (e.target.style.border = '1px solid rgba(255,255,255,0.25)')}
            onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.10)')}
          />
          {note.length > 0 && (
            <p className="text-xs text-white/30 text-right mt-1">{note.length}/200</p>
          )}
        </div>

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-full py-3 rounded-full font-medium transition-all hover:scale-105 flex items-center justify-center gap-2"
          style={{
            background: canSend ? 'radial-gradient(circle at 30% 50%, #c4005e, #9a58cc)' : 'rgba(255,255,255,0.1)',
            boxShadow: canSend ? '0 0 16px rgba(180,0,90,0.35)' : 'none',
            opacity: canSend ? 1 : 0.5,
            cursor: canSend ? 'pointer' : 'not-allowed',
          }}
        >
          <Send className="w-4 h-4" />
          {collaborators.length > 0 ? `Start Collab with ${collaborators.length} friend${collaborators.length > 1 ? 's' : ''}` : 'Send Gift'}
        </button>
      </div>
    </div>
  );
}
