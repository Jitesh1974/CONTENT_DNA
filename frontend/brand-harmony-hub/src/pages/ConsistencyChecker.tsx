import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Shield, Search, Trash2, Loader2,
  MessageSquare, FileText, KeyRound, SmilePlus,
  Target, CheckCircle2, AlertTriangle, XCircle,
  Crown, BookOpen, Crosshair, LayoutGrid
} from 'lucide-react';
import { FaLinkedin, FaInstagram, FaBlog, FaEnvelope, FaTwitter } from 'react-icons/fa';
import { checkConsistency } from '@/services/api';
import { cleanMarkdown } from '@/lib/cleanMarkdown';
import { normalizeScore } from '@/hooks/useAnimatedCounter';
import ScoreRing from '@/components/ScoreRing';
import ScoreCard from '@/components/ScoreCard';
import FeedbackList from '@/components/FeedbackList';
import AnimatedSection from '@/components/AnimatedSection';

const SAMPLE_CONTENT = `Excited to share our latest innovation! 🚀 We've been working hard on something that will change how you create content.

Our new AI-powered platform analyzes your brand voice and generates perfectly matched content for any platform.

What do you think about AI in content creation? Drop your thoughts below! 👇

#AI #ContentCreation #Innovation`;

const CHECK_STEPS = [
  'Parsing content structure',
  'Comparing tone signature',
  'Scoring keyword alignment',
  'Analyzing formality',
  'Generating recommendations',
];

const SCORE_CARDS = [
  { key: 'tone_match', label: 'Tone Match', icon: MessageSquare, emoji: '🎭' },
  { key: 'keyword_alignment', label: 'Keyword Alignment', icon: KeyRound, emoji: '🔑' },
  { key: 'sentence_style', label: 'Sentence Style', icon: FileText, emoji: '📏' },
  { key: 'emoji_consistency', label: 'Emoji Consistency', icon: SmilePlus, emoji: '😊' },
  { key: 'formality_match', label: 'Formality Match', icon: Crown, emoji: '🎩' },
  { key: 'storytelling_match', label: 'Storytelling Match', icon: BookOpen, emoji: '📖' },
  { key: 'cta_presence', label: 'CTA Presence', icon: Crosshair, emoji: '🎯' },
  { key: 'structure_quality', label: 'Structure Quality', icon: LayoutGrid, emoji: '📐' },
] as const;

const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedin },
  { id: 'instagram', label: 'Instagram', icon: FaInstagram },
  { id: 'blog', label: 'Blog', icon: FaBlog },
  { id: 'email', label: 'Email', icon: FaEnvelope },
  { id: 'twitter', label: 'Twitter', icon: FaTwitter },
];

function getBadge(score: number, isOnBrand?: boolean) {
  if (isOnBrand || score >= 80) return { icon: CheckCircle2, text: 'Excellent Brand Match!', cls: 'bg-success/15 border-success/25 text-success' };
  if (score >= 60) return { icon: AlertTriangle, text: 'Moderate Match — Needs Improvement', cls: 'bg-warning/15 border-warning/25 text-warning' };
  return { icon: XCircle, text: 'Poor Match — Major Improvements Needed', cls: 'bg-destructive/15 border-destructive/25 text-destructive' };
}

interface ConsistencyResult {
  success?: boolean;
  consistency_score: number;
  brand_match_percentage?: number;
  detailed_scores: Record<string, number | undefined>;
  feedback: string[];
  needs_refinement?: boolean;
  is_on_brand?: boolean;
  brand_id?: string;
  platform?: string;
}

const ConsistencyChecker = () => {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [isChecking, setIsChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState<ConsistencyResult | null>(null);

  const brandId = localStorage.getItem('currentBrandId') || localStorage.getItem('selectedBrand') || '';

  const handleCheck = async () => {
    if (!content.trim()) { toast.error('Please paste some content to check.'); return; }
    if (!brandId) { toast.error('Please analyze your brand DNA first on the Dashboard.'); return; }

    setIsChecking(true);
    setResult(null);
    try {
      for (let i = 0; i < CHECK_STEPS.length; i++) { setCurrentStep(i); await new Promise(r => setTimeout(r, 450)); }
      const res = await checkConsistency({ content, brand_id: brandId, platform });
      setResult(res);
      toast.success(`Brand match: ${Math.round(res.consistency_score || 0)}%`);
    } catch (err: any) {
      toast.error(`Check failed: ${err.message}`);
    } finally { setIsChecking(false); setCurrentStep(-1); }
  };

  const handleClear = () => { setContent(''); setResult(null); toast.success('Cleared'); };
  const handleLoadSample = () => { setContent(SAMPLE_CONTENT); toast.success('Sample loaded!'); };

  const norm = normalizeScore;
  const score = norm(result?.consistency_score);
  const detailed = result?.detailed_scores || {};
  const feedback = result?.feedback || [];
  const badge = getBadge(score, result?.is_on_brand);
  const BadgeIcon = badge.icon;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <AnimatedSection className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                Consistency <span className="gradient-text">Checker</span>
              </h1>
              <p className="text-muted-foreground text-sm">Check how well your content matches your brand DNA</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Input */}
        <AnimatedSection delay={0.1} className="mb-8">
          <div className="glass-card-light p-6">
            <label className="block text-sm font-medium text-foreground mb-2">📝 Content to Check</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your content here..." rows={6}
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none mb-3" />

            {/* Platform Selector */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Platform Context</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <motion.button key={p.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setPlatform(p.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                      platform === p.id ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}>
                    <p.icon className="text-sm" />{p.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-sm text-muted-foreground">{content.length.toLocaleString()} characters</span>
              <div className="flex gap-2 flex-wrap">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleLoadSample}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  📋 Load Sample
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleClear}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Clear
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleCheck} disabled={isChecking || !content.trim()}
                  className="btn-gradient px-6 py-2.5 flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {isChecking ? 'Checking...' : '🔍 Check Brand Fit'}
                </motion.button>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Loading Steps */}
        <AnimatePresence>
          {isChecking && currentStep >= 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8">
              <div className="glass-card-light p-6">
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" /> Analyzing Brand Consistency…
                </h3>
                <div className="space-y-3">
                  {CHECK_STEPS.map((step, i) => (
                    <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: i <= currentStep ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.1 }} className="flex items-center gap-3">
                      {i < currentStep ? <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                        : i === currentStep ? <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                        : <div className="w-5 h-5 rounded-full border border-border flex-shrink-0" />}
                      <span className={`text-sm ${i <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {result ? (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Overall Score */}
            <div className="rounded-3xl p-7 mb-8 border flex flex-col md:flex-row items-center gap-8"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.08))', borderColor: 'hsl(var(--primary) / 0.2)' }}>
              <ScoreRing score={score} size={160} colorByScore />
              <div className="flex-1 space-y-4">
                <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-full border font-semibold ${badge.cls}`}>
                  <BadgeIcon className="w-5 h-5 flex-shrink-0" /><span>{badge.text}</span>
                </div>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div><span className="text-muted-foreground">Brand ID: </span><span className="font-semibold text-primary">{result.brand_id || brandId}</span></div>
                  <div><span className="text-muted-foreground">Platform: </span><span className="font-semibold text-primary capitalize">{result.platform || platform}</span></div>
                  {result.brand_match_percentage != null && (
                    <div><span className="text-muted-foreground">Brand Match: </span><span className="font-semibold text-primary">{norm(result.brand_match_percentage)}%</span></div>
                  )}
                </div>
              </div>
            </div>

            {/* 8 Score Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {SCORE_CARDS.map((card, i) => (
                <ScoreCard key={card.key} label={card.label} emoji={card.emoji} icon={card.icon}
                  score={norm(detailed[card.key])} delay={0.1 + i * 0.06} />
              ))}
            </div>

            {/* Feedback */}
            <AnimatedSection delay={0.6} className="mb-6">
              <div className="glass-card-light p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">💡</span>
                  <h3 className="font-display font-semibold text-foreground text-lg">Improvement Suggestions</h3>
                </div>
                <FeedbackList feedback={feedback} baseDelay={0.7} />
              </div>
            </AnimatedSection>

            {/* Refinement Status */}
            <AnimatedSection delay={0.8}>
              <div className="p-5 rounded-2xl border flex items-center gap-3 font-medium"
                style={result.needs_refinement ? {
                  background: 'hsl(var(--warning) / 0.1)', borderColor: 'hsl(var(--warning) / 0.25)', color: 'hsl(var(--warning))',
                } : {
                  background: 'hsl(var(--success) / 0.1)', borderColor: 'hsl(var(--success) / 0.25)', color: 'hsl(var(--success))',
                }}>
                {result.needs_refinement ? (
                  <><AlertTriangle className="w-5 h-5 flex-shrink-0" /><span>⚠️ This content needs refinement to match your brand DNA.</span></>
                ) : (
                  <><CheckCircle2 className="w-5 h-5 flex-shrink-0" /><span>✅ This content is on-brand!</span></>
                )}
              </div>
            </AnimatedSection>
          </motion.div>
        ) : !isChecking ? (
          <AnimatedSection delay={0.2}>
            <div className="text-center py-20 rounded-3xl border-2 border-dashed border-border bg-card/30">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">No Content Analyzed Yet</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">Paste your content and click "Check Brand Fit"</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLoadSample}
                className="btn-gradient px-6 py-3 inline-flex items-center gap-2">📋 Load Sample Content</motion.button>
            </div>
          </AnimatedSection>
        ) : null}
      </div>
    </div>
  );
};

export default ConsistencyChecker;
