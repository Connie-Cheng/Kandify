interface CustomImageBeadProps {
  imageUrl: string;
  size?: 'small' | 'medium' | 'large';
}

export function CustomImageBead({ imageUrl, size = 'medium' }: CustomImageBeadProps) {
  const sizeClasses = {
    small: 'w-7 h-7',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-lg border-2 border-white/20 bg-white flex-shrink-0 aspect-square`}
    >
      <img
        src={imageUrl}
        alt="Custom bead"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
