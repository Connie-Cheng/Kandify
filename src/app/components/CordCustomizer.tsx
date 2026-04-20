interface CordCustomizerProps {
  cordType: 'string' | 'metal' | 'leather';
  cordColor: string;
  onChangeCordType: (type: 'string' | 'metal' | 'leather') => void;
  onChangeCordColor: (color: string) => void;
}

const CORD_COLORS = [
  { name: 'Pink', value: '#ff6b9d' },
  { name: 'Blue', value: '#2196f3' },
  { name: 'Purple', value: '#9c27b0' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
  { name: 'Gold', value: '#ffd600' },
  { name: 'Silver', value: '#e0e0e0' },
  { name: 'Brown', value: '#795548' },
  { name: 'Red', value: '#ff1744' },
  { name: 'Green', value: '#4caf50' },
];

export function CordCustomizer({ cordType, cordColor, onChangeCordType, onChangeCordColor }: CordCustomizerProps) {
  return (
    <div className="space-y-3.5 p-4 glass-card rounded-3xl inner-glow">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Cord Style</h3>

      <div className="flex gap-1.5">
        <button
          onClick={() => onChangeCordType('string')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all ${
            cordType === 'string'
              ? 'text-white'
              : 'glass-button text-white/60'
          }`}
          style={cordType === 'string' ? {
            background: `radial-gradient(circle at 30% 50%, ${cordColor}, ${cordColor}dd)`,
            boxShadow: `0 0 15px ${cordColor}40`
          } : {}}
        >
          String
        </button>
        <button
          onClick={() => onChangeCordType('metal')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all ${
            cordType === 'metal'
              ? 'text-white'
              : 'glass-button text-white/60'
          }`}
          style={cordType === 'metal' ? {
            background: `radial-gradient(circle at 30% 50%, ${cordColor}, ${cordColor}dd)`,
            boxShadow: `0 0 15px ${cordColor}40`
          } : {}}
        >
          Metal
        </button>
        <button
          onClick={() => onChangeCordType('leather')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all ${
            cordType === 'leather'
              ? 'text-white'
              : 'glass-button text-white/60'
          }`}
          style={cordType === 'leather' ? {
            background: `radial-gradient(circle at 30% 50%, ${cordColor}, ${cordColor}dd)`,
            boxShadow: `0 0 15px ${cordColor}40`
          } : {}}
        >
          Leather
        </button>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-white/60 mb-2.5 uppercase tracking-wider">Color</h4>
        <div className="flex flex-wrap gap-2">
          {CORD_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => onChangeCordColor(color.value)}
              className={`w-9 h-9 rounded-full transition-all ${
                cordColor === color.value
                  ? 'scale-110'
                  : 'hover:scale-110'
              }`}
              style={{
                backgroundColor: color.value,
                boxShadow: cordColor === color.value
                  ? `0 0 0 3px ${color.value}40, 0 0 20px ${color.value}60`
                  : `0 0 10px ${color.value}30`
              }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
