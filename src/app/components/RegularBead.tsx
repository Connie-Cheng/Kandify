interface RegularBeadProps {
  color: string;
  material: 'glossy' | 'matte' | 'metallic' | 'iridescent' | 'glitter';
  size?: 'small' | 'medium' | 'large';
}

export function RegularBead({ color, material, size = 'medium' }: RegularBeadProps) {
  const sizeClasses = {
    small: 'w-7 h-7',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const materialStyles = {
    glossy: 'bg-gradient-to-br shadow-lg',
    matte: 'shadow-md',
    metallic: 'bg-gradient-to-br shadow-xl border-2 border-opacity-30',
    iridescent: 'bg-gradient-to-br shadow-xl animate-pulse',
    glitter: 'bg-gradient-to-br shadow-lg'
  };

  const getGradient = () => {
    if (material === 'iridescent') {
      return `linear-gradient(135deg, ${color}, #ffffff 50%, ${color})`;
    }
    if (material === 'glossy' || material === 'metallic') {
      return `linear-gradient(135deg, ${color}, ${adjustBrightness(color, 40)})`;
    }
    return color;
  };

  const adjustBrightness = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full ${materialStyles[material]}`}
      style={{
        background: getGradient(),
        ...(material === 'glitter' && {
          backgroundImage: `${getGradient()}, repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)`
        })
      }}
    />
  );
}
