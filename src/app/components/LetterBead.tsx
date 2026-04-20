interface LetterBeadProps {
  letter: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

export function LetterBead({ letter, color = '#3b82f6', size = 'medium' }: LetterBeadProps) {
  const sizeClasses = {
    small: 'w-7 h-7 text-sm',
    medium: 'w-10 h-10 text-lg',
    large: 'w-12 h-12 text-xl'
  };

  return (
    <div className={`flex items-center justify-center flex-shrink-0 ${sizeClasses[size]} rounded-full bg-gradient-to-br from-gray-100 to-white shadow-lg border-2 border-gray-200 aspect-square`}>
      <span
        className="font-bold leading-none"
        style={{ color }}
      >
        {letter.toUpperCase()}
      </span>
    </div>
  );
}
