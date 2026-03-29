import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const floatingCards = [
  {
    emoji: '🎯',
    title: 'Tone Profile',
    value: 'Semi-Casual',
    bar: 42,
    pos: 'top-[12%] left-[2%]',
    anim: 'anim-float-1',
  },
  {
    emoji: '🔑',
    title: 'Top Keywords',
    tags: ['growth', 'community', 'brand'],
    pos: 'bottom-[15%] left-[0%]',
    anim: 'anim-float-2',
  },
  {
    emoji: '😊',
    title: 'Emoji Usage',
    bigEmoji: '😊',
    value: '3.2',
    unit: '/100w',
    pos: 'top-[10%] right-[2%]',
    anim: 'anim-float-3',
  },
  {
    emoji: '🧬',
    title: 'Brand Match',
    score: '87',
    scoreUnit: '%',
    badge: 'Strong',
    pos: 'bottom-[12%] right-[3%]',
    anim: 'anim-float-2',
  },
];

const floatingTags = [
  { label: 'Tone', pos: 'top-[35%] left-[6%]', color: 'bg-[rgba(99,130,255,0.2)] text-[#a5b4fc] border-[rgba(99,130,255,0.35)]' },
  { label: 'Style', pos: 'top-[28%] right-[8%]', color: 'bg-[rgba(168,85,247,0.2)] text-[#c084fc] border-[rgba(168,85,247,0.35)]' },
  { label: 'Keywords', pos: 'bottom-[40%] left-[8%]', color: 'bg-[rgba(34,211,238,0.15)] text-[#67e8f9] border-[rgba(34,211,238,0.3)]' },
  { label: 'Consistency', pos: 'bottom-[32%] right-[6%]', color: 'bg-[rgba(245,158,11,0.15)] text-[#fbbf24] border-[rgba(245,158,11,0.3)]' },
  { label: 'Voice', pos: 'top-[52%] left-1/2 -translate-x-1/2', color: 'bg-[rgba(34,197,94,0.15)] text-[#4ade80] border-[rgba(34,197,94,0.3)]' },
];

const DNAAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let W: number;
    let H: number;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      W = canvas.width = rect.width || 480;
      H = canvas.height = rect.height || 480;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const nodes = 18;
      const spacing = H / (nodes + 1);
      const amp = Math.min(W * 0.22, 80);
      const speed = t * 0.00045;

      for (let i = 0; i <= nodes; i++) {
        const y = spacing * (i + 0.5);
        const phase = (i / nodes) * Math.PI * 2.5 + speed * 3;
        const x1 = cx + Math.sin(phase) * amp;
        const x2 = cx - Math.sin(phase) * amp;
        const alpha = 0.5 + 0.5 * Math.sin(phase + t * 0.001);

        const g1 = ctx.createRadialGradient(x1, y, 1, x1, y, 8);
        g1.addColorStop(0, `rgba(99,130,255,${alpha})`);
        g1.addColorStop(1, 'rgba(99,130,255,0)');
        ctx.beginPath();
        ctx.arc(x1, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = g1;
        ctx.fill();

        const g2 = ctx.createRadialGradient(x2, y, 1, x2, y, 8);
        g2.addColorStop(0, `rgba(168,85,247,${alpha})`);
        g2.addColorStop(1, 'rgba(168,85,247,0)');
        ctx.beginPath();
        ctx.arc(x2, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = g2;
        ctx.fill();

        if (i < nodes) {
          const nextY = spacing * (i + 1.5);
          const nextPhase = ((i + 1) / nodes) * Math.PI * 2.5 + speed * 3;
          const nx1 = cx + Math.sin(nextPhase) * amp;
          const nx2 = cx - Math.sin(nextPhase) * amp;

          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(nx1, nextY);
          ctx.strokeStyle = 'rgba(99,130,255,0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(x2, y);
          ctx.lineTo(nx2, nextY);
          ctx.strokeStyle = 'rgba(168,85,247,0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          const rungAlpha = 0.15 + 0.15 * Math.sin(phase * 2);
          ctx.strokeStyle = `rgba(200,180,255,${rungAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    raf = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.7 }}
      />

      {/* Floating Cards — matching uploaded design */}
      {floatingCards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.15, duration: 0.6, type: 'spring' }}
          className={`absolute ${card.pos} hidden md:block`}
          style={{ animation: card.anim === 'anim-float-1' ? 'floatA 6s ease-in-out infinite' : card.anim === 'anim-float-2' ? 'floatB 7s ease-in-out infinite 1s' : 'floatC 5s ease-in-out infinite 0.5s' }}
        >
          <div
            className="min-w-[150px] rounded-2xl backdrop-blur-[20px]"
            style={{
              background: 'rgba(17, 23, 38, 0.7)',
              border: '1px solid rgba(99,130,255,0.25)',
              padding: '14px 18px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Label */}
            <div className="text-[0.7rem] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              {card.emoji} {card.title}
            </div>

            {/* Tags variant */}
            {'tags' in card && card.tags ? (
              <div className="flex gap-1.5 flex-wrap mt-1">
                {card.tags.map(t => (
                  <span key={t} className="text-[0.68rem] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(99,130,255,0.18)',
                      border: '1px solid rgba(99,130,255,0.3)',
                      color: '#a5b4fc',
                    }}>
                    {t}
                  </span>
                ))}
              </div>
            ) : 'bigEmoji' in card ? (
              /* Emoji usage variant */
              <div className="flex items-center gap-3">
                <span className="text-3xl">{card.bigEmoji}</span>
                <div>
                  <div className="font-display text-lg font-bold" style={{ color: '#e2e8f0' }}>
                    {card.value}<span className="text-[0.7rem] ml-0.5 font-normal" style={{ color: '#64748b' }}>{card.unit}</span>
                  </div>
                </div>
              </div>
            ) : 'score' in card ? (
              /* Score variant */
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="font-display text-3xl font-extrabold leading-none" style={{ color: '#f1f5ff' }}>
                  {card.score}<span className="text-[0.7rem] font-normal" style={{ color: '#64748b' }}>{card.scoreUnit}</span>
                </span>
                <span className="text-[0.72rem] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
                  {card.badge}
                </span>
              </div>
            ) : (
              /* Default value + bar */
              <>
                <div className="font-display text-base font-bold" style={{ color: '#e2e8f0' }}>
                  {card.value}
                </div>
                {'bar' in card && (
                  <div className="h-[5px] rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #6382ff, #a855f7)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${card.bar}%` }}
                      transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      ))}

      {/* Floating Tag Pills */}
      {floatingTags.map((tag, i) => (
        <motion.span
          key={tag.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 + i * 0.15, duration: 0.4 }}
          className={`absolute ${tag.pos} ${tag.color} hidden lg:block text-[0.72rem] font-bold px-3.5 py-1.5 rounded-full backdrop-blur-xl border whitespace-nowrap tracking-wide`}
          style={{
            animation: i % 3 === 0 ? 'floatA 6s ease-in-out infinite' : i % 3 === 1 ? 'floatB 7s ease-in-out infinite 1s' : 'floatC 5s ease-in-out infinite 0.5s',
          }}
        >
          {tag.label}
        </motion.span>
      ))}
    </div>
  );
};

export default DNAAnimation;
