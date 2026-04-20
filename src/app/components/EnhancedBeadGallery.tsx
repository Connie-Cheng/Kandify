import { ShapedBead } from './ShapedBead';
import { LetterBead } from './LetterBead';
import { NumberBead } from './NumberBead';

export interface EnhancedBeadOption {
  id: string;
  type: 'shaped' | 'letter' | 'number';
  shape?: 'star' | 'heart' | 'flower' | 'clover' | 'circle' | 'square';
  color: string;
  material?: 'glossy' | 'matte' | 'metallic' | 'iridescent';
  size?: 'small' | 'medium' | 'large';
  letter?: string;
  number?: string;
  customImage?: string;
}

const ENHANCED_BEAD_OPTIONS: EnhancedBeadOption[] = [
  // Circles
  { id: 'circle-pink', type: 'shaped', shape: 'circle', color: '#ff6b9d', material: 'glossy' },
  { id: 'circle-red', type: 'shaped', shape: 'circle', color: '#ff1744', material: 'glossy' },
  { id: 'circle-purple', type: 'shaped', shape: 'circle', color: '#9c27b0', material: 'iridescent' },
  { id: 'circle-blue', type: 'shaped', shape: 'circle', color: '#2196f3', material: 'metallic' },
  { id: 'circle-teal', type: 'shaped', shape: 'circle', color: '#00bcd4', material: 'iridescent' },
  { id: 'circle-green', type: 'shaped', shape: 'circle', color: '#4caf50', material: 'glossy' },
  { id: 'circle-yellow', type: 'shaped', shape: 'circle', color: '#ffd600', material: 'glossy' },
  { id: 'circle-orange', type: 'shaped', shape: 'circle', color: '#ff6f00', material: 'metallic' },
  { id: 'circle-gray', type: 'shaped', shape: 'circle', color: '#78909c', material: 'matte' },
  { id: 'circle-black', type: 'shaped', shape: 'circle', color: '#212121', material: 'glossy' },
  { id: 'circle-white', type: 'shaped', shape: 'circle', color: '#ffffff', material: 'glossy' },
  { id: 'circle-lavender', type: 'shaped', shape: 'circle', color: '#b388ff', material: 'iridescent' },

  // Squares
  { id: 'square-pink', type: 'shaped', shape: 'square', color: '#ff6b9d', material: 'glossy' },
  { id: 'square-blue', type: 'shaped', shape: 'square', color: '#2196f3', material: 'metallic' },
  { id: 'square-purple', type: 'shaped', shape: 'square', color: '#9c27b0', material: 'glossy' },
  { id: 'square-green', type: 'shaped', shape: 'square', color: '#4caf50', material: 'matte' },
  { id: 'square-orange', type: 'shaped', shape: 'square', color: '#ff6f00', material: 'metallic' },
  { id: 'square-teal', type: 'shaped', shape: 'square', color: '#00bcd4', material: 'iridescent' },

  // Hearts
  { id: 'heart-red', type: 'shaped', shape: 'heart', color: '#ff1744', material: 'glossy' },
  { id: 'heart-pink', type: 'shaped', shape: 'heart', color: '#ff6b9d', material: 'glossy' },
  { id: 'heart-purple', type: 'shaped', shape: 'heart', color: '#9c27b0', material: 'metallic' },
  { id: 'heart-white', type: 'shaped', shape: 'heart', color: '#ffffff', material: 'glossy' },

  // Stars
  { id: 'star-gold', type: 'shaped', shape: 'star', color: '#ffd600', material: 'metallic' },
  { id: 'star-silver', type: 'shaped', shape: 'star', color: '#e0e0e0', material: 'metallic' },
  { id: 'star-blue', type: 'shaped', shape: 'star', color: '#2196f3', material: 'iridescent' },
  { id: 'star-pink', type: 'shaped', shape: 'star', color: '#ff6b9d', material: 'glossy' },

  // Flowers
  { id: 'flower-pink', type: 'shaped', shape: 'flower', color: '#ff6b9d', material: 'glossy' },
  { id: 'flower-yellow', type: 'shaped', shape: 'flower', color: '#ffd600', material: 'glossy' },
  { id: 'flower-purple', type: 'shaped', shape: 'flower', color: '#9c27b0', material: 'iridescent' },
  { id: 'flower-white', type: 'shaped', shape: 'flower', color: '#ffffff', material: 'glossy' },

  // Clovers
  { id: 'clover-green', type: 'shaped', shape: 'clover', color: '#4caf50', material: 'glossy' },
  { id: 'clover-emerald', type: 'shaped', shape: 'clover', color: '#00c853', material: 'metallic' },
  { id: 'clover-white', type: 'shaped', shape: 'clover', color: '#ffffff', material: 'glossy' },
];

// Letter options
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LETTER_COLORS = ['#ff1744', '#2196f3', '#9c27b0', '#ff6f00', '#4caf50', '#00bcd4'];

LETTERS.forEach((letter, index) => {
  ENHANCED_BEAD_OPTIONS.push({
    id: `letter-${letter}`,
    type: 'letter',
    letter: letter,
    color: LETTER_COLORS[index % LETTER_COLORS.length],
  });
});

// Number options
for (let i = 0; i <= 9; i++) {
  ENHANCED_BEAD_OPTIONS.push({
    id: `number-${i}`,
    type: 'number',
    number: i.toString(),
    color: LETTER_COLORS[i % LETTER_COLORS.length],
  });
}

interface EnhancedBeadGalleryProps {
  onSelectBead: (bead: EnhancedBeadOption) => void;
  selectedBead: EnhancedBeadOption | null;
}

export function EnhancedBeadGallery({ onSelectBead, selectedBead }: EnhancedBeadGalleryProps) {
  const shapedBeads = ENHANCED_BEAD_OPTIONS.filter(b => b.type === 'shaped');
  const letterBeads = ENHANCED_BEAD_OPTIONS.filter(b => b.type === 'letter');
  const numberBeads = ENHANCED_BEAD_OPTIONS.filter(b => b.type === 'number');

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xs font-semibold text-white/60 mb-2.5 uppercase tracking-wider">Shaped Beads</h4>
        <div className="grid grid-cols-6 gap-1.5">
          {shapedBeads.map((bead) => (
            <button
              key={bead.id}
              onClick={() => onSelectBead(bead)}
              className={`flex items-center justify-center p-2 rounded-xl transition-all ${
                selectedBead?.id === bead.id
                  ? 'scale-105'
                  : 'glass-button'
              }`}
              style={selectedBead?.id === bead.id ? {
                background: `radial-gradient(circle at 30% 50%, ${bead.color}40, ${bead.color}20)`,
                boxShadow: `0 0 0 2px ${bead.color}60, 0 0 20px ${bead.color}40`
              } : {}}
            >
              <ShapedBead
                shape={bead.shape!}
                color={bead.color}
                material={bead.material}
                size="small"
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-white/60 mb-2.5 uppercase tracking-wider">Letters</h4>
        <div className="grid grid-cols-9 gap-1.5 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
          {letterBeads.map((bead) => (
            <button
              key={bead.id}
              onClick={() => onSelectBead(bead)}
              className={`flex items-center justify-center p-1 rounded-xl transition-all ${
                selectedBead?.id === bead.id
                  ? 'bg-red-500/20 ring-2 ring-red-500 scale-105'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <LetterBead letter={bead.letter!} color={bead.color} size="small" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-white/60 mb-2.5 uppercase tracking-wider">Numbers</h4>
        <div className="grid grid-cols-10 gap-1.5">
          {numberBeads.map((bead) => (
            <button
              key={bead.id}
              onClick={() => onSelectBead(bead)}
              className={`flex items-center justify-center p-1 rounded-xl transition-all ${
                selectedBead?.id === bead.id
                  ? 'bg-red-500/20 ring-2 ring-red-500 scale-105'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <NumberBead number={bead.number!} color={bead.color} size="small" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { ENHANCED_BEAD_OPTIONS };
