import { motion } from 'framer-motion';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

interface ScoreCardProps {
  label: string;
  emoji: string;
  icon: React.ElementType;
  score: number;
  delay?: number;
}

export default function ScoreCard({ label, emoji, icon: Icon, score, delay = 0 }: ScoreCardProps) {
  const animatedScore = useAnimatedCounter(score, 1200, true);
  const barColor = score >= 80 ? 'hsl(var(--success))' : score >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -2, borderColor: 'hsl(var(--primary) / 0.3)' }}
      className="p-[18px] rounded-2xl bg-card/50 border border-border/50 transition-all"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{emoji}</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-display font-bold text-foreground mb-2">{animatedScore}%</p>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay: delay + 0.3, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: barColor }}
        />
      </div>
    </motion.div>
  );
}
