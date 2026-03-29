import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
  colorByScore?: boolean;
}

export default function ScoreRing({ score, size = 160, label, colorByScore = false }: ScoreRingProps) {
  const animatedScore = useAnimatedCounter(score, 1500, true);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const gradientId = `scoreGradient-${size}-${label?.replace(/\s/g, '')}`;

  const strokeColor = colorByScore
    ? score >= 80 ? 'hsl(var(--success))' : score >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'
    : undefined;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth="8" className="stroke-muted" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth="8" strokeLinecap="round"
          stroke={strokeColor || `url(#${gradientId})`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        {!strokeColor && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" />
            </linearGradient>
          </defs>
        )}
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-display font-extrabold gradient-text">{animatedScore}</span>
        <span className="text-xl font-bold gradient-text">%</span>
        {label && <span className="block text-xs text-muted-foreground mt-1">{label}</span>}
      </div>
    </div>
  );
}
