import { Heart, Star, Flower2, Cloud, Sparkles, Dog, Zap } from 'lucide-react';

interface CharmBeadProps {
  type: 'heart' | 'star' | 'flower' | 'cloud' | 'sparkle' | 'dog' | 'lightning';
  color: string;
  material?: 'glossy' | 'metallic' | 'matte';
  size?: 'small' | 'medium' | 'large';
}

export function CharmBead({ type, color, material = 'glossy', size = 'medium' }: CharmBeadProps) {
  const icons = {
    heart: Heart,
    star: Star,
    flower: Flower2,
    cloud: Cloud,
    sparkle: Sparkles,
    dog: Dog,
    lightning: Zap
  };

  const Icon = icons[type];

  const sizeClasses = {
    small: { container: 'w-8 h-8', icon: 'w-5 h-5' },
    medium: { container: 'w-12 h-12', icon: 'w-7 h-7' },
    large: { container: 'w-14 h-14', icon: 'w-9 h-9' }
  };

  const materialClasses = {
    glossy: 'bg-gradient-to-br shadow-xl',
    metallic: 'bg-gradient-to-br shadow-2xl border-2 border-white border-opacity-20',
    matte: 'shadow-lg'
  };

  return (
    <div
      className={`${sizeClasses[size].container} rounded-lg flex items-center justify-center ${materialClasses[material]}`}
      style={{
        background: material === 'matte' ? color : `linear-gradient(135deg, ${color}, ${adjustBrightness(color, 30)})`
      }}
    >
      <Icon className={`${sizeClasses[size].icon} text-white drop-shadow-md`} fill="currentColor" />
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
