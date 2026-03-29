import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import { cleanMarkdown } from '@/lib/cleanMarkdown';

interface FeedbackListProps {
  feedback: string[];
  baseDelay?: number;
}

export default function FeedbackList({ feedback, baseDelay = 0.5 }: FeedbackListProps) {
  return (
    <div className="space-y-3">
      {feedback.length > 0 ? feedback.map((fb, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: baseDelay + i * 0.08 }}
          className="flex items-start gap-3 p-4 rounded-xl border-l-4"
          style={{
            background: 'hsl(var(--warning) / 0.08)',
            borderLeftColor: 'hsl(var(--warning))',
          }}
        >
          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--warning))' }} />
          <span className="text-sm text-foreground leading-relaxed">{cleanMarkdown(fb)}</span>
        </motion.div>
      )) : (
        <div
          className="flex items-start gap-3 p-4 rounded-xl border-l-4"
          style={{
            background: 'hsl(var(--success) / 0.08)',
            borderLeftColor: 'hsl(var(--success))',
          }}
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--success))' }} />
          <span className="text-sm text-foreground">Great job! Your content aligns perfectly with your brand DNA.</span>
        </div>
      )}
    </div>
  );
}
