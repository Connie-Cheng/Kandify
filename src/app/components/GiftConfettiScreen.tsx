import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { GiftedBracelet } from '../services/social';

interface Props {
  gift: GiftedBracelet;
  onClose: () => void;
}

export function GiftConfettiScreen({ gift, onClose }: Props) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [screenVisible, setScreenVisible] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setScreenVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const hasNotes = gift.note || (gift.collabNotes && gift.collabNotes.length > 0);

  const fromLine = (() => {
    const names = [gift.fromUser.name, ...(gift.collaboratorNames ?? [])];
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
  })();

  return (
    <div
      className="fixed inset-0 z-[60]"
      style={{
        background: '#0a0a0c',
        opacity: screenVisible ? 1 : 0,
        transition: 'opacity 0.45s ease-in',
      }}
    >
      <iframe
        src="/confetti-3.html"
        className="absolute inset-0 w-full h-full border-0"
        title="Gift confetti"
        onLoad={() => setIframeLoaded(true)}
        style={{ opacity: iframeLoaded ? 1 : 0, transition: 'opacity 0.5s ease-in' }}
      />

      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-20 bg-black/50 rounded-full p-2 text-white/60 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {!revealed && (
        <>
          <p
            className="absolute left-1/2 -translate-x-1/2 z-20 text-white text-sm font-medium animate-pulse pointer-events-none text-center whitespace-nowrap"
            style={{ top: 'calc(50% - 90px)', textShadow: '0 0 16px rgba(255,255,255,0.9)' }}
          >
            Click the cassette to reveal your gift
          </p>
          <button
            onClick={() => setRevealed(true)}
            aria-label="Reveal gift"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ width: 160, height: 100, background: 'transparent', cursor: 'pointer' }}
          />
        </>
      )}

      {revealed && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center p-5"
          style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)' }}
        >
          {/* Scrollable reveal card */}
          <div
            className="glass-card rounded-3xl w-full max-w-sm outer-glow-soft flex flex-col items-center overflow-y-auto"
            style={{ maxHeight: '88vh' }}
          >
            <div className="flex flex-col items-center gap-4 p-7 w-full">

              <p className="text-white/35 text-[10px] uppercase tracking-[0.2em]">
                A gift from {fromLine}
              </p>

              <div className="text-center">
                <h2 className="text-2xl font-bold mb-0.5">{gift.songTitle}</h2>
                <p className="text-white/50 text-sm">{gift.artist}</p>
              </div>

              {/* Bead ring */}
              <svg width="150" height="150" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                {gift.beads.length === 0
                  ? [0,1,2,3,4,5,6,7].map((i) => {
                      const a = (2 * Math.PI * i / 8) - Math.PI / 2;
                      return (
                        <circle key={i}
                          cx={75 + Math.cos(a) * 54} cy={75 + Math.sin(a) * 54} r={6.5}
                          fill={gift.fromUser.color}
                          style={{ filter: `drop-shadow(0 0 5px ${gift.fromUser.color})` }}
                        />
                      );
                    })
                  : gift.beads.slice(0, 16).map((bead, i) => {
                      const count = Math.min(gift.beads.length, 16);
                      const a = (2 * Math.PI * i / count) - Math.PI / 2;
                      return (
                        <circle key={i}
                          cx={75 + Math.cos(a) * 54} cy={75 + Math.sin(a) * 54} r={6.5}
                          fill={String(bead.color)}
                          style={{ filter: `drop-shadow(0 0 5px ${bead.color})` }}
                        />
                      );
                    })
                }
              </svg>

              <p className="text-white/20 text-xs">
                {gift.beads.length > 0 ? `${gift.beads.length} beads` : 'Special bracelet'} &middot; {new Date(gift.sentAt).toLocaleDateString()}
              </p>

              {/* Notes section */}
              {hasNotes && (
                <div className="w-full flex flex-col gap-2.5">

                  {/* Sender's note */}
                  {gift.note && (
                    <NoteCard
                      label="✦ note"
                      labelColor="rgba(255,210,110,0.55)"
                      accentStart="rgba(255,195,80,0.7)"
                      accentEnd="rgba(255,120,160,0.5)"
                      border="rgba(255,215,130,0.22)"
                      bg="linear-gradient(135deg, rgba(255,245,220,0.07), rgba(255,230,180,0.04))"
                      text={gift.note}
                      from={gift.fromUser.name}
                      fromColor="rgba(255,210,110,0.38)"
                    />
                  )}

                  {/* Collab notes */}
                  {gift.collabNotes?.map((cn, i) => (
                    <NoteCard
                      key={i}
                      label={`✦ from ${cn.contributor}`}
                      labelColor={`${cn.color}99`}
                      accentStart={`${cn.color}bb`}
                      accentEnd={`${cn.color}66`}
                      border={`${cn.color}30`}
                      bg={`linear-gradient(135deg, ${cn.color}0c, ${cn.color}06)`}
                      text={cn.note}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3 rounded-full font-medium text-white transition-all hover:scale-105 mt-1"
                style={{
                  background: 'radial-gradient(circle at 30% 50%, #c4005e, #9a58cc)',
                  boxShadow: '0 0 18px rgba(180,0,90,0.28)',
                }}
              >
                Add to My Bracelets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable note card with left accent stripe
function NoteCard({
  label, labelColor, accentStart, accentEnd, border, bg, text, from, fromColor,
}: {
  label: string; labelColor: string;
  accentStart: string; accentEnd: string;
  border: string; bg: string;
  text: string; from?: string; fromColor?: string;
}) {
  return (
    <div
      className="w-full rounded-xl overflow-hidden relative"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: `linear-gradient(to bottom, ${accentStart}, ${accentEnd})` }}
      />
      <div className="pl-5 pr-4 pt-3 pb-3.5 text-left">
        <p className="text-[9px] uppercase tracking-[0.18em] mb-2" style={{ color: labelColor }}>
          {label}
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{
            color: 'rgba(255,245,225,0.86)',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
            letterSpacing: '0.01em',
          }}
        >
          {text}
        </p>
        {from && (
          <p
            className="text-right text-xs mt-2"
            style={{
              color: fromColor ?? 'rgba(255,255,255,0.25)',
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
            }}
          >
            — {from}
          </p>
        )}
      </div>
    </div>
  );
}
