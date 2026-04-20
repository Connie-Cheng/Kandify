import { useMemo } from 'react';

export function AnimatedBackground() {
  // Define festival light colors - semi-saturated, with multicolor blobs
  const lightConfigs = [
    { colors: ['#c77dff', '#7209b7'], isYellow: false }, // purple
    { colors: ['#ff006e', '#ff4d8f', '#ffba08'], isYellow: false }, // pink+orange multicolor
    { colors: ['#00f5ff', '#0096c7'], isYellow: false }, // cyan
    { colors: ['#ffba08', '#faa307'], isYellow: true }, // orange/yellow (smaller)
    { colors: ['#00ff88', '#06ffa5'], isYellow: false }, // green/cyan
    { colors: ['#ff6b9d', '#c9184a'], isYellow: false }, // pink/red
    { colors: ['#4361ee', '#3a0ca3', '#c77dff'], isYellow: false }, // blue+purple multicolor
    { colors: ['#90e0ef', '#00b4d8'], isYellow: false }, // light cyan
    { colors: ['#b5179e', '#7209b7'], isYellow: false }, // magenta/purple
  ];

  // Define X positions to distribute evenly: left, middle, right
  const xPositions = [10, 25, 40, 50, 60, 75, 85, 20, 65];

  // Create 9 lights with staggered timing to ensure no darkness gaps
  // useMemo ensures random values stay consistent across re-renders
  const lights = useMemo(() => Array.from({ length: 9 }, (_, i) => {
    const config = lightConfigs[i % lightConfigs.length];
    const isYellow = config.isYellow;
    const size = isYellow ? (100 + Math.random() * 80) : (150 + Math.random() * 150); // Yellow smaller: 100-180px, others: 150-300px
    const startX = xPositions[i % xPositions.length] + (Math.random() * 10 - 5); // Distribute across screen
    const startY = Math.random() * 100;
    const duration = 80 + Math.random() * 40; // 80-120s
    // Tighter stagger to eliminate darkness gaps
    const delay = i * 12; // Each light starts 12s after previous

    return {
      id: i,
      colors: config.colors,
      size,
      startX,
      startY,
      duration,
      delay,
      isYellow,
    };
  }), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {lights.map((light) => {
        const gradientStops = light.colors.length === 2
          ? `${light.colors[0]}, ${light.colors[1]}`
          : `${light.colors[0]}, ${light.colors[1]} 50%, ${light.colors[2]}`;

        return (
          <div
            key={light.id}
            className="absolute rounded-full festival-light"
            style={{
              width: `${light.size}px`,
              height: `${light.size}px`,
              background: `radial-gradient(circle, ${gradientStops})`,
              filter: light.isYellow ? 'blur(100px) brightness(0.7)' : 'blur(100px)',
              opacity: 0,
              left: `${light.startX}%`,
              top: `${light.startY}%`,
              animation: `festivalFloat ${light.duration}s ease-in-out ${light.delay}s infinite, festivalPulse ${light.duration}s ease-in-out ${light.delay}s infinite`,
              mixBlendMode: 'screen',
            }}
          />
        );
      })}
    </div>
  );
}
