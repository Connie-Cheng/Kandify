import { RegularBead } from './RegularBead';
import { CharmBead } from './CharmBead';

export interface BeadOption {
  id: string;
  type: 'bead' | 'charm';
  color: string;
  material: 'glossy' | 'matte' | 'metallic' | 'iridescent' | 'glitter';
  charmType?: 'heart' | 'star' | 'flower' | 'cloud' | 'sparkle' | 'dog' | 'lightning';
  size?: 'small' | 'medium' | 'large';
}

const BEAD_OPTIONS: BeadOption[] = [
  { id: 'pink-glossy', type: 'bead', color: '#ff6b9d', material: 'glossy', size: 'medium' },
  { id: 'red-glossy', type: 'bead', color: '#ff1744', material: 'glossy', size: 'medium' },
  { id: 'purple-iridescent', type: 'bead', color: '#9c27b0', material: 'iridescent', size: 'medium' },
  { id: 'blue-metallic', type: 'bead', color: '#2196f3', material: 'metallic', size: 'medium' },
  { id: 'orange-metallic', type: 'bead', color: '#ff6f00', material: 'metallic', size: 'medium' },
  { id: 'black-glossy', type: 'bead', color: '#000000', material: 'glossy', size: 'medium' },
  { id: 'gray-matte', type: 'bead', color: '#78909c', material: 'matte', size: 'medium' },
  { id: 'teal-iridescent', type: 'bead', color: '#00bcd4', material: 'iridescent', size: 'medium' },
  { id: 'yellow-glitter', type: 'bead', color: '#ffd600', material: 'glitter', size: 'medium' },
  { id: 'green-glossy', type: 'bead', color: '#4caf50', material: 'glossy', size: 'medium' },

  { id: 'heart-red', type: 'charm', color: '#ff1744', material: 'glossy', charmType: 'heart' },
  { id: 'star-gold', type: 'charm', color: '#ffab00', material: 'metallic', charmType: 'star' },
  { id: 'flower-pink', type: 'charm', color: '#ff6b9d', material: 'glossy', charmType: 'flower' },
  { id: 'cloud-gray', type: 'charm', color: '#90a4ae', material: 'matte', charmType: 'cloud' },
  { id: 'sparkle-purple', type: 'charm', color: '#9c27b0', material: 'glossy', charmType: 'sparkle' },
  { id: 'lightning-orange', type: 'charm', color: '#ff6f00', material: 'metallic', charmType: 'lightning' },
];

interface BeadGalleryProps {
  onSelectBead: (bead: BeadOption) => void;
  selectedBead: BeadOption | null;
}

export function BeadGallery({ onSelectBead, selectedBead }: BeadGalleryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white/80">Choose a Bead</h3>
      <div className="grid grid-cols-5 gap-3 p-4 bg-black rounded-xl border border-zinc-800 max-h-[400px] overflow-y-auto">
        {BEAD_OPTIONS.map((bead) => (
          <button
            key={bead.id}
            onClick={() => onSelectBead(bead)}
            className={`flex items-center justify-center p-2 rounded-lg transition-all ${
              selectedBead?.id === bead.id
                ? 'bg-red-500/20 ring-2 ring-red-500'
                : 'bg-zinc-900 hover:bg-zinc-800'
            }`}
          >
            {bead.type === 'bead' ? (
              <RegularBead
                color={bead.color}
                material={bead.material}
                size={bead.size}
              />
            ) : (
              <CharmBead
                type={bead.charmType!}
                color={bead.color}
                material={bead.material as 'glossy' | 'metallic' | 'matte'}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export { BEAD_OPTIONS };
