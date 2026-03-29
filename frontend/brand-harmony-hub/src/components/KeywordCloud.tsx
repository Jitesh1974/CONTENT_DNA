import { motion } from 'framer-motion';

interface KeywordCloudProps {
  keywords: string[];
  baseDelay?: number;
  variant?: 'primary' | 'accent';
}

export default function KeywordCloud({ keywords, baseDelay = 0.5, variant = 'primary' }: KeywordCloudProps) {
  if (!keywords.length) return null;

  const colorVar = variant === 'accent' ? '--accent' : '--primary';
  const secondVar = variant === 'accent' ? '--accent' : '--secondary';

  return (
    <div className="flex flex-wrap gap-3 items-center justify-center min-h-[80px] p-4 rounded-2xl bg-muted/30">
      {keywords.map((kw, i) => (
        <motion.span
          key={kw}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: baseDelay + i * 0.05, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.1, y: -2 }}
          className="rounded-full font-medium cursor-default border transition-all text-sm py-2 min-w-[100px] text-center inline-flex items-center justify-center px-4"
          style={{
            background: `linear-gradient(135deg, hsl(var(${colorVar}) / ${0.15 + (1 - i / keywords.length) * 0.15}), hsl(var(${secondVar}) / ${0.1 + (1 - i / keywords.length) * 0.1}))`,
            borderColor: `hsl(var(${colorVar}) / ${0.2 + (1 - i / keywords.length) * 0.2})`,
            color: 'hsl(var(--foreground))',
          }}
        >
          {kw}
        </motion.span>
      ))}
    </div>
  );
}
