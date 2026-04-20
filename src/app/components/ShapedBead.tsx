import { Star, Heart, Flower2, Sparkles } from 'lucide-react';

interface ShapedBeadProps {
  shape: 'star' | 'heart' | 'flower' | 'clover' | 'circle' | 'square';
  color: string;
  material?: 'glossy' | 'matte' | 'metallic' | 'iridescent';
  size?: 'small' | 'medium' | 'large';
}

export function ShapedBead({ shape, color, material = 'glossy', size = 'medium' }: ShapedBeadProps) {
  const sizeClasses = {
    small: 'w-7 h-7',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const materialClasses = {
    glossy: 'shadow-lg',
    matte: 'shadow-md',
    metallic: 'shadow-xl border-2 border-white border-opacity-20',
    iridescent: 'shadow-xl'
  };

  const getBackground = () => {
    if (material === 'iridescent') {
      return `linear-gradient(135deg, ${color}, #ffffff 50%, ${color})`;
    }
    if (material === 'glossy' || material === 'metallic') {
      const brightColor = adjustBrightness(color, 30);
      return `linear-gradient(135deg, ${color}, ${brightColor})`;
    }
    return color;
  };

  const shapeStyles = {
    circle: 'rounded-full',
    square: 'rounded-md',
    star: 'clip-star',
    heart: 'clip-heart',
    flower: 'clip-flower',
    clover: 'clip-clover'
  };

  const icons = {
    star: Star,
    heart: Heart,
    flower: Flower2,
    clover: Sparkles
  };

  const useIcon = shape !== 'circle' && shape !== 'square';
  const Icon = useIcon ? icons[shape as keyof typeof icons] : null;

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center ${
        useIcon ? 'rounded-lg' : shapeStyles[shape]
      } ${materialClasses[material]}`}
      style={{
        background: getBackground(),
        filter: `drop-shadow(0 0 8px ${color}40) drop-shadow(0 0 4px ${color}20)`
      }}
    >
      {Icon && <Icon className="w-[60%] h-[60%] text-white drop-shadow-md" fill="currentColor" />}
    </div>
  );
}

function adjustBrightness(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}
