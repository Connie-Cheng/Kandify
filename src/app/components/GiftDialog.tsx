import { X, Send, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';

interface GiftDialogProps {
  songTitle: string;
  artist: string;
  onClose: () => void;
}

const FRIENDS = ['Jessica', 'Connie', 'Maya', 'Alex'];

export function GiftDialog({ songTitle, artist, onClose }: GiftDialogProps) {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const handleSend = () => {
    if (selectedFriend) {
      alert(`Sent "${songTitle}" by ${artist} to ${selectedFriend}!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-8">
      <div className="glass-card rounded-3xl p-6 w-full max-w-md outer-glow-soft inner-glow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Gift Bracelet</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-white/60 mb-1">Song</p>
          <p className="font-semibold">{songTitle}</p>
          <p className="text-sm text-white/60">{artist}</p>
        </div>

        {/* Select Friend */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Select Friend</h3>
          <div className="space-y-2">
            {FRIENDS.map((friend) => (
              <button
                key={friend}
                onClick={() => setSelectedFriend(friend)}
                className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${
                  selectedFriend === friend
                    ? 'glass-button'
                    : 'glass-card hover:glass-button'
                }`}
                style={selectedFriend === friend ? {
                  background: 'radial-gradient(circle at 30% 50%, rgba(255, 0, 110, 0.3), rgba(199, 125, 255, 0.2))',
                  boxShadow: '0 0 0 2px rgba(255, 0, 110, 0.4)'
                } : {}}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center font-bold">
                    {friend[0]}
                  </div>
                  <span className="font-medium">{friend}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Send Options */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Or Share Via</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="glass-button rounded-2xl py-3 px-4 text-sm font-medium transition-all hover:scale-105 flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Text Message
            </button>
            <button className="glass-button rounded-2xl py-3 px-4 text-sm font-medium transition-all hover:scale-105 flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              Social Media
            </button>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!selectedFriend}
          className="w-full py-3 rounded-full font-medium transition-all hover:scale-105 flex items-center justify-center gap-2"
          style={{
            background: selectedFriend
              ? 'radial-gradient(circle at 30% 50%, #ff006e, #c77dff)'
              : 'rgba(255, 255, 255, 0.1)',
            boxShadow: selectedFriend
              ? '0 0 20px rgba(255, 0, 110, 0.4)'
              : 'none',
            opacity: selectedFriend ? 1 : 0.5,
            cursor: selectedFriend ? 'pointer' : 'not-allowed',
          }}
        >
          <Send className="w-4 h-4" />
          Send Gift
        </button>
      </div>
    </div>
  );
}
