import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { FRIENDS, saveBlendSession, BlendSession } from '../services/social';
import { BlendAnimationScreen } from './BlendAnimationScreen';

interface BlendDialogProps {
  songTitle: string;
  artist: string;
  onClose: () => void;
}

const MY_COLOR = '#ff6b9d';
const MY_BEADS = [MY_COLOR, '#ff1744', '#ffc1e3', '#ff80ab', '#c2185b', '#ff4081', '#ffb3d9', '#f50057'];
const FRIEND_BEAD_SETS: Record<string, string[]> = {
  Jessica: ['#f472b6', '#ec4899', '#fbcfe8', '#db2777', '#fda4af', '#f9a8d4', '#be185d', '#ff80ab'],
  Kida:    ['#60a5fa', '#3b82f6', '#93c5fd', '#1d4ed8', '#bfdbfe', '#2563eb', '#dbeafe', '#60a5fa'],
  Jack:    ['#a78bfa', '#8b5cf6', '#c4b5fd', '#7c3aed', '#ddd6fe', '#6d28d9', '#ede9fe', '#a78bfa'],
  Sean:    ['#fbbf24', '#f59e0b', '#fde68a', '#d97706', '#fef3c7', '#b45309', '#fef9c3', '#fbbf24'],
};

function BeadRing({ beads, color, label, x }: { beads: string[]; color: string; label: string; x: number }) {
  const r = 52;
  return (
    <g>
      <circle cx={x} cy={88} r={r} fill="none" stroke={color} strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }} opacity="0.5" />
      {beads.map((c, i) => {
        const angle = (2 * Math.PI * i) / beads.length - Math.PI / 2;
        const bx = x + Math.cos(angle) * r;
        const by = 88 + Math.sin(angle) * r;
        return (
          <circle key={i} cx={bx} cy={by} r={5} fill={c}
            style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
        );
      })}
      <text x={x} y={88 + r + 16} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">{label}</text>
    </g>
  );
}

export function BlendDialog({ songTitle, artist, onClose }: BlendDialogProps) {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [blendSession, setBlendSession] = useState<BlendSession | null>(null);

  const friend = FRIENDS.find(f => f.name === selectedFriend);
  const friendBeads = selectedFriend ? FRIEND_BEAD_SETS[selectedFriend] : null;

  const [fadeOut, setFadeOut] = useState(false);

  const handleBlend = () => {
    if (!friend) return;
    const session = saveBlendSession(friend);
    setFadeOut(true);
    setTimeout(() => setBlendSession(session), 320);
  };

  if (blendSession) {
    return <BlendAnimationScreen session={blendSession} onClose={onClose} />;
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-8"
      style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.3s ease-out', pointerEvents: fadeOut ? 'none' : 'all' }}
    >
      <div className="glass-card rounded-3xl p-6 w-full max-w-md outer-glow-soft inner-glow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Blend with Friend</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-white/60 mb-1">Song</p>
          <p className="font-semibold">{songTitle}</p>
          <p className="text-sm text-white/60">{artist}</p>
        </div>

        {/* Bead ring preview */}
        <div className="flex justify-center mb-6">
          <svg width="220" height="160" viewBox="0 0 220 160">
            <defs>
              <radialGradient id="blendGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={friend?.color ?? '#ff6b9d'} stopOpacity="0.5" />
                <stop offset="100%" stopColor={friend?.color ?? '#ff6b9d'} stopOpacity="0" />
              </radialGradient>
            </defs>

            {selectedFriend && (
              <ellipse cx="110" cy="88" rx="22" ry="22" fill="url(#blendGlow)" />
            )}

            <BeadRing beads={MY_BEADS} color={MY_COLOR} label="You" x={75} />
            <BeadRing
              beads={friendBeads ?? ['#ffffff18','#ffffff18','#ffffff18','#ffffff18','#ffffff18','#ffffff18','#ffffff18','#ffffff18']}
              color={friend?.color ?? 'rgba(255,255,255,0.12)'}
              label={selectedFriend ?? 'Friend'}
              x={145}
            />
          </svg>
        </div>

        {/* Friend picker */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Pick a Friend</h3>
          <div className="space-y-2">
            {FRIENDS.map((f) => (
              <button
                key={f.name}
                onClick={() => setSelectedFriend(f.name)}
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

        <button
          onClick={handleBlend}
          disabled={!selectedFriend}
          className="w-full py-3 rounded-full font-medium transition-all hover:scale-105 flex items-center justify-center gap-2"
          style={{
            background: selectedFriend
              ? `radial-gradient(circle at 30% 50%, ${friend?.color}cc, #9a58cccc)`
              : 'rgba(255,255,255,0.1)',
            boxShadow: selectedFriend ? `0 0 14px ${friend?.color}44` : 'none',
            opacity: selectedFriend ? 1 : 0.5,
            cursor: selectedFriend ? 'pointer' : 'not-allowed',
          }}
        >
          <Sparkles className="w-4 h-4" />
          Blend Bracelets
        </button>
      </div>
    </div>
  );
}
