import { Gift, Blend } from 'lucide-react';
import { LetterBead } from './LetterBead';
import { NumberBead } from './NumberBead';
import { RegularBead } from './RegularBead';
import { CharmBead } from './CharmBead';
import { CustomImageBead } from './CustomImageBead';
import { ShapedBead } from './ShapedBead';

export interface BeadItem {
  type: 'letter' | 'number' | 'bead' | 'charm';
  content?: string;
  color: string;
  material?: 'glossy' | 'matte' | 'metallic' | 'iridescent' | 'glitter';
  charmType?: 'heart' | 'star' | 'flower' | 'cloud' | 'sparkle' | 'dog' | 'lightning' | 'circle' | 'square' | 'clover';
  size?: 'small' | 'medium' | 'large';
  customImage?: string;
  imageUrl?: string;
  processedUrl?: string;
  loading?: boolean;
  error?: boolean;
}

interface CharmBraceletProps {
  beads: BeadItem[];
  songTitle: string;
  artist: string;
  onGift?: () => void;
  onBlend?: () => void;
}

export function CharmBracelet({ beads, songTitle, artist, onGift, onBlend }: CharmBraceletProps) {
  const totalBeads = beads.length;

  // Calculate position for each bead on circle
  const getBeadPosition = (index: number) => {
    // SVG viewBox is 200x200 with circle at center (100,100) and radius 80
    // Convert to percentage for responsive positioning
    const radiusPercent = 40; // 80/200 = 40% of container
    const anglePerBead = (2 * Math.PI) / totalBeads;
    const angle = anglePerBead * index - Math.PI / 2; // Start from top

    const x = Math.cos(angle) * radiusPercent;
    const y = Math.sin(angle) * radiusPercent;

    return {
      left: `calc(50% + ${x}%)`,
      top: `calc(50% + ${y}%)`,
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <div className="glow-card rounded-3xl p-5 w-[280px] outer-glow-subtle glow-hover">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-white truncate">{songTitle}</h3>
        <p className="text-xs text-white/50 truncate">{artist}</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onBlend?.(); }}
            className="flex-1 glass-button rounded-full py-1.5 px-3 text-xs font-medium transition-all hover:scale-105 flex items-center justify-center gap-1.5"
          >
            <Blend className="w-3.5 h-3.5" />
            Blend
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGift?.();
            }}
            className="flex-1 glass-button rounded-full py-1.5 px-3 text-xs font-medium transition-all hover:scale-105 flex items-center justify-center gap-1.5"
          >
            <Gift className="w-3.5 h-3.5" />
            Gift
          </button>
        </div>
      </div>

      <div className="relative rounded-3xl aspect-square inner-glow vignette" style={{ background: 'rgba(14, 14, 17, 0.6)' }}>
        {/* Circular cord background with glow */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
          <circle
            cx="100"
            cy="100"
            r="80"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.5"
            fill="none"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))' }}
          />
        </svg>

        {/* Beads positioned on circle */}
        <div className="absolute inset-0">
          {beads.map((bead, index) => (
            <div
              key={index}
              className="absolute flex-shrink-0 transition-transform hover:scale-110 z-10"
              style={getBeadPosition(index)}
            >
              {bead.customImage ? (
                <CustomImageBead imageUrl={bead.customImage} size="small" />
              ) : bead.type === 'letter' ? (
                <LetterBead letter={bead.content || ''} color={bead.color} size="small" />
              ) : bead.type === 'number' ? (
                <NumberBead number={bead.content || ''} color={bead.color} size="small" />
              ) : bead.type === 'bead' && bead.charmType && ['circle', 'square', 'heart', 'star', 'flower', 'clover'].includes(bead.charmType) ? (
                <ShapedBead
                  shape={bead.charmType as 'circle' | 'square' | 'heart' | 'star' | 'flower' | 'clover'}
                  color={bead.color}
                  material={bead.material as 'glossy' | 'matte' | 'metallic' | 'iridescent'}
                  size="small"
                  imageUrl={bead.imageUrl}
                  processedUrl={bead.processedUrl}
                  loading={bead.loading}
                  error={!!bead.error}
                />
              ) : bead.type === 'bead' ? (
                <RegularBead
                  color={bead.color}
                  material={bead.material || 'glossy'}
                  size="small"
                />
              ) : bead.type === 'charm' && bead.charmType ? (
                <CharmBead
                  type={bead.charmType as 'heart' | 'star' | 'flower' | 'cloud' | 'sparkle' | 'dog' | 'lightning'}
                  color={bead.color}
                  material={bead.material as 'glossy' | 'metallic' | 'matte'}
                  size="small"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
