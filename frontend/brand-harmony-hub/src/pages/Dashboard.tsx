import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  Cpu, Palette, Building2, Dna, Loader2, CheckCircle2,
  Upload, Sparkles, Copy, FileText, MessageSquare,
  BarChart3, BookOpen, SmilePlus, Target, Layers,
  TrendingUp, Zap, PenTool, ChevronRight, AlertTriangle,
  Activity, Wifi, WifiOff
} from 'lucide-react';
import { getBrands, getBrandDashboard, getBrandDrift, getHealth, analyzeBrand, analyzeBrandFromText } from '@/services/api';
import { useAnimatedCounter, normalizeScore } from '@/hooks/useAnimatedCounter';
import ScoreRing from '@/components/ScoreRing';
import KeywordCloud from '@/components/KeywordCloud';
import AnimatedSection from '@/components/AnimatedSection';
import LoadingSpinner from '@/components/LoadingSpinner';

const ANALYSIS_STEPS = [
  'Tokenizing content samples',
  'Detecting tone signals',
  'Measuring sentence patterns',
  'Extracting brand keywords',
  'Building style fingerprint',
];

const DEMO_CONTENT = `Hey everyone! 🎉 We're SO excited to share something we've been working on for months. Our team genuinely believes this will change how you approach content creation. Seriously, it's a game-changer!

At our company, we're always pushing boundaries and asking ourselves: how can we make this better for our community? That's why we built this — for YOU. Because your growth is our mission. 💪

We are pleased to announce the official launch of our premium analytics suite. This sophisticated platform leverages cutting-edge machine learning to provide actionable insights.

Hey, quick tip for all you creators out there! 🚀 Wanna grow your audience faster? Stop overthinking and start shipping. Seriously — done is better than perfect, every single time.

Excited to share that our platform hit 100,000 users this week! 🎊 Thank you to every single person who believed in us from day one. The journey continues! Let's keep building together. 💙`;

interface BrandDNA {
  tone: string;
  tone_confidence?: number;
  sentence_style?: string;
  avg_sentence_length?: number;
  emoji_usage?: string;
  formality_score?: number;
  storytelling_score?: number;
  sentence_length_avg?: number;
  brand_consistency_score?: number;
  cta_preference?: string;
  primary_keywords?: string[];
  secondary_keywords?: string[];
  keywords?: string[];
  samples_analyzed?: number;
  vocabulary_patterns?: {
    unique_terms?: string[];
  };
}

interface AnalysisResult {
  success?: boolean;
  brand_id: string;
  brand_name?: string;
  brand_dna: BrandDNA;
  consistency_score?: number;
  message?: string;
}

/* ── Tone Meter ────────────────────────────────── */
function ToneMeter({ tone, formality }: { tone: string; formality: number }) {
  const position = tone === 'casual' ? 15 : tone === 'friendly' ? 35 : tone === 'professional' ? 65 : 85;
  return (
    <div className="space-y-3">
      <div className="relative h-2 rounded-full overflow-hidden bg-muted">
        <div className="absolute inset-0 rounded-full"
          style={{ background: 'linear-gradient(90deg, hsl(var(--success)), hsl(var(--primary)), hsl(var(--secondary)))' }} />
        <motion.div
          initial={{ left: '0%' }}
          animate={{ left: `${position}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary-foreground border-2 border-primary shadow-lg"
          style={{ boxShadow: '0 0 12px hsl(var(--primary) / 0.6)' }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Casual</span><span>Professional</span><span>Formal</span>
      </div>
    </div>
  );
}

/* ── Emoji Meter ────────────────────────────────── */
function EmojiMeter({ usage }: { usage: string }) {
  const percent = usage === 'heavy' ? 90 : usage === 'moderate' ? 55 : usage === 'occasional' ? 25 : 5;
  return (
    <div className="space-y-2">
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--warning)), hsl(var(--secondary)))' }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>None</span><span>Occasional</span><span>Heavy</span>
      </div>
    </div>
  );
}

/* ── Metric Card ─────────────────────────────────── */
function MetricCard({ icon: Icon, label, value, bar, note, delay = 0 }: {
  icon: React.ElementType; label: string; value: string; bar?: number; note?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}
      whileHover={{ x: 4, scale: 1.02 }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border transition-colors hover:border-primary/30"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-lg font-display font-bold text-foreground capitalize">{value}</p>
        {bar != null && (
          <div className="h-1 mt-1 rounded-full bg-muted overflow-hidden w-24">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(bar, 100)}%` }}
              transition={{ duration: 1, delay: delay + 0.3 }} className="h-full rounded-full gradient-bg" />
          </div>
        )}
        {note && <p className="text-xs text-muted-foreground mt-0.5">{note}</p>}
      </div>
    </motion.div>
  );
}

/* ── Health Status Badge ─────────────────────────── */
function HealthBadge() {
  const { data: health } = useQuery({ queryKey: ['health'], queryFn: getHealth, refetchInterval: 30000 });
  const isOnline = health?.status === 'ok' || health?.status === 'healthy';
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
      isOnline ? 'bg-success/10 border-success/20 text-success' : 'bg-destructive/10 border-destructive/20 text-destructive'
    }`}>
      {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      {isOnline ? 'Backend Online' : 'Backend Offline'}
      {health?.ollama_status && <span className="text-muted-foreground ml-1">• Ollama: {health.ollama_status}</span>}
    </div>
  );
}

/* ── Drift Alert Card ────────────────────────────── */
function DriftAlert({ brandId }: { brandId: string }) {
  const { data: drift } = useQuery({
    queryKey: ['drift', brandId],
    queryFn: () => getBrandDrift(brandId),
    enabled: !!brandId,
  });

  if (!drift || !drift.drift_detected) return null;

  const levelColor = drift.alert_level === 'high' ? 'destructive' : drift.alert_level === 'medium' ? 'warning' : 'primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border mb-8`}
      style={{
        background: `hsl(var(--${levelColor}) / 0.08)`,
        borderColor: `hsl(var(--${levelColor}) / 0.25)`,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <AlertTriangle className="w-5 h-5" style={{ color: `hsl(var(--${levelColor}))` }} />
        <h3 className="font-display font-semibold text-foreground">Brand Drift Detected</h3>
        <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase" style={{
          background: `hsl(var(--${levelColor}) / 0.15)`,
          color: `hsl(var(--${levelColor}))`,
        }}>{drift.alert_level}</span>
        <span className="ml-auto font-display font-bold text-foreground">{Math.round(drift.drift_score)}% drift</span>
      </div>
      {drift.recommendations?.length > 0 && (
        <ul className="space-y-1.5 mt-2">
          {drift.recommendations.map((rec: string, i: number) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span style={{ color: `hsl(var(--${levelColor}))` }}>→</span> {rec}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

/* ── Main Dashboard ──────────────────────────────── */
const Dashboard = () => {
  const [selectedBrand, setSelectedBrand] = useState(() => localStorage.getItem('selectedBrand') || 'tech_company');
  const [contentInput, setContentInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [copiedId, setCopiedId] = useState(false);
  const queryClient = useQueryClient();

  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: getBrands });
  const brandId = analysisResult?.brand_id || selectedBrand || brands[0]?.brand_id || '';

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard', brandId],
    queryFn: () => getBrandDashboard(brandId),
    enabled: !!brandId && !analysisResult,
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => analyzeBrand(files, selectedBrand || undefined),
    onSuccess: (result) => {
      toast.success('Brand analysis complete!');
      setAnalysisResult(result);
      if (result.brand_id) localStorage.setItem('currentBrandId', result.brand_id);
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: () => toast.error('Analysis failed. Check backend connection.'),
  });

  const textAnalysisMutation = useMutation({
    mutationFn: async (content: string) => {
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setCurrentStep(i);
        await new Promise(r => setTimeout(r, 600));
      }
      return analyzeBrandFromText(content);
    },
    onSuccess: (result) => {
      setCurrentStep(-1);
      setAnalysisResult(result);
      if (result.brand_id) localStorage.setItem('currentBrandId', result.brand_id);
      toast.success('Brand DNA profile ready!');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: () => { setCurrentStep(-1); toast.error('Analysis failed. Check backend connection.'); },
  });

  const onDrop = useCallback((files: File[]) => { if (files.length) uploadMutation.mutate(files); }, [uploadMutation]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/*': ['.txt', '.md', '.csv'] } });

  const handleBrandChange = (id: string) => { setSelectedBrand(id); localStorage.setItem('selectedBrand', id); setAnalysisResult(null); };
  const handleAnalyze = () => {
    if (contentInput.trim().length < 50) { toast.error('Please paste at least 3-5 sentences.'); return; }
    textAnalysisMutation.mutate(contentInput);
  };
  const handleLoadDemo = () => { setContentInput(DEMO_CONTENT); toast.success('Demo content loaded!'); };
  const handleCopyId = () => {
    const id = analysisResult?.brand_id;
    if (id) { navigator.clipboard.writeText(id); setCopiedId(true); toast.success('Brand ID copied!'); setTimeout(() => setCopiedId(false), 2000); }
  };

  const dna = analysisResult?.brand_dna || dashboard?.brand_dna;
  const isAnalyzing = textAnalysisMutation.isPending || uploadMutation.isPending;
  const norm = normalizeScore;

  const consistencyScore = norm(analysisResult?.consistency_score ?? analysisResult?.brand_dna?.brand_consistency_score ?? dashboard?.consistency_score);
  const formalityScore = norm(dna?.formality_score);
  const storytellingScore = norm(dna?.storytelling_score);
  const primaryKeywords = dna?.primary_keywords || dna?.keywords || [];
  const secondaryKeywords = dna?.secondary_keywords || [];
  const vocabTerms = dna?.vocabulary_patterns?.unique_terms || [];
  const avgSentLen = dna?.avg_sentence_length ?? dna?.sentence_length_avg ?? 0;

  const toneLabel = (() => {
    const t = dna?.tone?.toLowerCase();
    if (!t) return '___';
    const map: Record<string, string> = { casual: 'Casual', formal: 'Formal', friendly: 'Friendly', professional: 'Professional' };
    return map[t] || t;
  })();

  const sentenceDesc = (() => {
    const s = dna?.sentence_style;
    if (!s) return 'Balanced writing style';
    const map: Record<string, string> = {
      short_punchy: 'Quick, impactful statements', medium_balanced: 'Balanced, conversational flow', long_detailed: 'Detailed, explanatory prose',
    };
    return map[s] || 'Balanced writing style';
  })();

  const hasResults = !!analysisResult || !!dashboard;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <AnimatedSection className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Brand <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1">Analyze and monitor your brand's content DNA</p>
            <div className="mt-2"><HealthBadge /></div>
          </div>
          <Link to="/generator" className="btn-gradient flex items-center gap-2">
            <PenTool className="w-4 h-4" /> Generate Content
          </Link>
        </AnimatedSection>

        {/* Brand Selector */}
        <AnimatedSection delay={0.1} className="mb-8">
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'tech_company', label: 'Technical', Icon: Cpu },
              { id: 'creative_agency', label: 'Creative', Icon: Palette },
              { id: 'corporate_firm', label: 'Corporate', Icon: Building2 },
            ].map((brand, i) => (
              <motion.button key={brand.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                onClick={() => handleBrandChange(brand.id)}
                className={`px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                  brandId === brand.id ? 'gradient-bg text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
                }`}
              >
                <brand.Icon className="w-4 h-4" />{brand.label}
              </motion.button>
            ))}
          </div>
        </AnimatedSection>

        {/* Content Input */}
        <AnimatedSection delay={0.15} className="mb-8">
          <div className="glass-card-light p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <Dna className="w-5 h-5 text-primary" /> Analyze Brand DNA
              </h2>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLoadDemo}
                className="text-sm px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
                Load Demo Content
              </motion.button>
            </div>
            <textarea value={contentInput} onChange={(e) => setContentInput(e.target.value)}
              placeholder="Paste your brand content here (at least 3-5 sentences)..."
              rows={5} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none mb-3" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{contentInput.length} characters</span>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze} disabled={isAnalyzing || contentInput.trim().length < 50}
                className="btn-gradient px-6 py-3 flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dna className="w-4 h-4" />}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Brand DNA'}
              </motion.button>
            </div>
          </div>
        </AnimatedSection>

        {/* Analysis Steps */}
        <AnimatePresence>
          {isAnalyzing && currentStep >= 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8">
              <div className="glass-card-light p-6">
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" /> Sequencing Brand DNA…
                </h3>
                <div className="space-y-3">
                  {ANALYSIS_STEPS.map((step, i) => (
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

        {/* File Upload */}
        <AnimatedSection delay={0.2} className="mb-8">
          <div {...getRootProps()} className={`glass-card-light p-6 text-center cursor-pointer transition-all duration-300 ${
            isDragActive ? 'border-primary border-2 scale-[1.01]' : 'border-dashed border-2 border-border'
          }`}>
            <input {...getInputProps()} />
            {uploadMutation.isPending ? <LoadingSpinner /> : (
              <><Upload className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-foreground font-medium text-sm">{isDragActive ? 'Drop files here...' : 'Or drag & drop brand content files (.txt, .md, .csv)'}</p></>
            )}
          </div>
        </AnimatedSection>

        {/* Drift Alert */}
        {brandId && <DriftAlert brandId={brandId} />}

        {dashLoading && !analysisResult ? (
          <div className="py-20"><LoadingSpinner size={50} /></div>
        ) : hasResults ? (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Brand Header */}
            {analysisResult && (
              <div className="mb-8 p-6 rounded-3xl bg-card border border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="text-4xl">
                      <Dna className="w-10 h-10 text-primary" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-display font-extrabold gradient-text">{analysisResult.brand_name || 'Brand'}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono px-3 py-1 rounded-full bg-muted text-muted-foreground">{analysisResult.brand_id}</span>
                        <button onClick={handleCopyId} className="text-muted-foreground hover:text-foreground transition-colors">
                          {copiedId ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  {analysisResult.message && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success" /><span className="text-foreground">{analysisResult.message}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Score Ring + Primary Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
                className="lg:row-span-2 flex flex-col items-center justify-center p-6 rounded-3xl bg-card border border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
                <ScoreRing score={consistencyScore} size={180} label="Brand Consistency" />
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  {consistencyScore >= 80 ? 'Excellent consistency' : consistencyScore >= 60 ? 'Good consistency' : 'Needs improvement'}
                </p>
              </motion.div>

              {/* Tone Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                whileHover={{ y: -4 }} className="p-5 rounded-2xl bg-card border border-border transition-all hover:border-primary/30" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center gap-2 mb-3"><MessageSquare className="w-5 h-5 text-primary" /><span className="text-xs text-muted-foreground uppercase tracking-wider">Brand Tone</span></div>
                <p className="text-2xl font-display font-bold text-foreground mb-3 capitalize">{toneLabel}</p>
                {dna?.tone_confidence != null && <p className="text-xs text-muted-foreground mb-2">Confidence: {normalizeScore(dna.tone_confidence)}%</p>}
                <ToneMeter tone={dna?.tone || 'professional'} formality={formalityScore} />
              </motion.div>

              {/* Writing Style Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                whileHover={{ y: -4 }} className="p-5 rounded-2xl bg-card border border-border transition-all hover:border-primary/30" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center gap-2 mb-3"><FileText className="w-5 h-5 text-accent" /><span className="text-xs text-muted-foreground uppercase tracking-wider">Writing Style</span></div>
                <p className="text-2xl font-display font-bold text-foreground mb-1 capitalize">{dna?.sentence_style?.replace(/_/g, ' ') || '___'}</p>
                <p className="text-sm text-muted-foreground mb-2">{sentenceDesc}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Avg Length:</span>
                  <span className="font-display font-bold text-foreground">{avgSentLen.toFixed(1)}</span>
                  <span className="text-muted-foreground">words</span>
                </div>
              </motion.div>

              {/* Emoji Style Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                whileHover={{ y: -4 }} className="p-5 rounded-2xl bg-card border border-border transition-all hover:border-primary/30" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center gap-2 mb-3"><SmilePlus className="w-5 h-5 text-warning" /><span className="text-xs text-muted-foreground uppercase tracking-wider">Emoji Style</span></div>
                <p className="text-2xl font-display font-bold text-foreground mb-3 capitalize">{dna?.emoji_usage || '___'}</p>
                <EmojiMeter usage={dna?.emoji_usage || 'none'} />
              </motion.div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard icon={BarChart3} label="Formality Score" value={`${formalityScore}%`} bar={formalityScore} delay={0.5} />
              <MetricCard icon={BookOpen} label="Storytelling" value={`${storytellingScore}%`} bar={storytellingScore} delay={0.55} />
              <MetricCard icon={Target} label="Call to Action" value={dna?.cta_preference || 'none'} note={dna?.cta_preference === 'none' ? 'No CTA detected' : 'Active CTA style'} delay={0.6} />
              <MetricCard icon={Layers} label="Samples Analyzed" value={String(dna?.samples_analyzed ?? 0)} note="content pieces analyzed" delay={0.65} />
            </div>

            {/* Primary Keywords */}
            {primaryKeywords.length > 0 && (
              <AnimatedSection delay={0.7} className="mb-8">
                <div className="p-6 rounded-3xl bg-card border border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2 text-foreground">
                    <Sparkles className="w-5 h-5 text-primary" /> Primary Keywords
                  </h2>
                  <KeywordCloud keywords={primaryKeywords} baseDelay={0.7} variant="primary" />
                </div>
              </AnimatedSection>
            )}

            {/* Secondary Keywords */}
            {secondaryKeywords.length > 0 && (
              <AnimatedSection delay={0.75} className="mb-8">
                <div className="p-6 rounded-3xl bg-card border border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2 text-foreground">
                    <TrendingUp className="w-5 h-5 text-secondary" /> Secondary Keywords
                  </h2>
                  <KeywordCloud keywords={secondaryKeywords} baseDelay={0.75} variant="accent" />
                </div>
              </AnimatedSection>
            )}

            {/* Vocabulary Patterns */}
            {vocabTerms.length > 0 && (
              <AnimatedSection delay={0.8} className="mb-8">
                <div className="p-6 rounded-3xl bg-card border border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2 text-foreground">
                    <Zap className="w-5 h-5 text-accent" /> Unique Vocabulary
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {vocabTerms.map((term: string, i: number) => (
                      <motion.span key={term} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.06 }}
                        whileHover={{ y: -2 }} className="px-3 py-1.5 rounded-full text-xs font-mono border transition-all"
                        style={{ background: 'hsl(var(--accent) / 0.1)', borderColor: 'hsl(var(--accent) / 0.25)', color: 'hsl(var(--foreground))' }}>
                        {term}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* Brand Summary */}
            <AnimatedSection delay={0.9} className="mb-8">
              <div className="p-6 rounded-3xl border flex items-start gap-4"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.08))', borderColor: 'hsl(var(--primary) / 0.2)' }}>
                <Dna className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-display font-bold text-foreground mb-2">Brand Voice Summary</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Your brand communicates with a <span className="font-semibold text-foreground">{toneLabel.toLowerCase()}</span> tone,
                    using <span className="font-semibold text-foreground">{dna?.sentence_style?.replace(/_/g, ' ') || 'balanced'}</span> sentences
                    averaging <span className="font-semibold text-foreground">{avgSentLen.toFixed(1)} words</span>.
                    {primaryKeywords.length > 0 && <> Key themes include <span className="font-semibold text-foreground">{primaryKeywords.slice(0, 5).join(', ')}</span>.</>}
                    {dna?.emoji_usage === 'heavy' && ' Emojis are used heavily to add personality and engagement.'}
                    {' '}{consistencyScore >= 80 ? 'Your brand voice is highly consistent across content.' : 'Continue building consistency across your content.'}
                  </p>
                  <Link to="/generator" className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3 hover:gap-2 transition-all">
                    Generate matching content <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </motion.div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Dna className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No brand data yet</p>
            <p className="text-sm mt-1">Paste your brand content above or upload files to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
