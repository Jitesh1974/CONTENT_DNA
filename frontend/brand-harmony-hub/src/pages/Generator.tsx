import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaLinkedin, FaInstagram, FaBlog, FaEnvelope, FaTwitter, FaCopy, FaCheck, FaMagic, FaDownload } from 'react-icons/fa';
import { Cpu, Palette, Building2 } from 'lucide-react';
import { generateContent, multiPlatformAdapt } from '@/services/api';
import { cleanMarkdown } from '@/lib/cleanMarkdown';
import { normalizeScore } from '@/hooks/useAnimatedCounter';
import AnimatedSection from '@/components/AnimatedSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import FeedbackList from '@/components/FeedbackList';
import PlatformAdaptations from '@/components/PlatformAdaptations';
import ScoreRing from '@/components/ScoreRing';

const brandOptions = [
  { id: 'tech_company', label: 'Technical', Icon: Cpu },
  { id: 'creative_agency', label: 'Creative', Icon: Palette },
  { id: 'corporate_firm', label: 'Corporate', Icon: Building2 },
];

const platforms = [
  { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedin },
  { id: 'instagram', label: 'Instagram', icon: FaInstagram },
  { id: 'blog', label: 'Blog', icon: FaBlog },
  { id: 'email', label: 'Email', icon: FaEnvelope },
  { id: 'twitter', label: 'Twitter', icon: FaTwitter },
];

const Generator = () => {
  const [brandId, setBrandId] = useState(() => localStorage.getItem('currentBrandId') || localStorage.getItem('selectedBrand') || 'tech_company');
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [tone, setTone] = useState(0.5);
  const [copied, setCopied] = useState(false);

  const handleBrandChange = (id: string) => { setBrandId(id); localStorage.setItem('selectedBrand', id); };

  const mutation = useMutation({
    mutationFn: () => generateContent({ brand_id: brandId, topic, platform, tone_slider: tone }),
    onError: () => toast.error('Generation failed. Please try again.'),
    onSuccess: () => toast.success('Content generated!'),
  });

  const adaptMutation = useMutation({
    mutationFn: (content: string) => multiPlatformAdapt({ content, brand_id: brandId }),
    onError: () => toast.error('Platform adaptation failed.'),
    onSuccess: () => toast.success('Platform adaptations ready!'),
  });

  const result = mutation.data;
  const norm = normalizeScore;
  const toneLabel = tone > 0.7 ? 'Formal' : tone > 0.3 ? 'Professional' : 'Casual';

  const handleCopy = () => {
    if (result?.content) {
      navigator.clipboard.writeText(cleanMarkdown(result.content));
      setCopied(true); toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (result?.content) {
      const blob = new Blob([cleanMarkdown(result.content)], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `content-${platform}-${Date.now()}.txt`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('Content downloaded!');
    }
  };

  const handleAdaptAll = () => {
    if (result?.content) adaptMutation.mutate(cleanMarkdown(result.content));
  };

  // Merge platform_adaptations from generate response and adapt response
  const allAdaptations = { ...(result?.platform_adaptations || {}), ...(adaptMutation.data?.adaptations || {}) };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <AnimatedSection className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            Content <span className="gradient-text">Generator</span>
          </h1>
          <p className="text-muted-foreground mt-1">Create brand-consistent content powered by AI</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Inputs */}
          <AnimatedSection delay={0.1}>
            <div className="glass-card-light p-6 space-y-6">
              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Brand</label>
                <div className="flex flex-wrap gap-3">
                  {brandOptions.map((brand, i) => (
                    <motion.button key={brand.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleBrandChange(brand.id)}
                      className={`px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                        brandId === brand.id ? 'gradient-bg text-primary-foreground shadow-lg shadow-primary/25'
                          : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
                      }`}>
                      <brand.Icon className="w-4 h-4" />{brand.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Topic</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="What should the content be about?"
                  rows={4} className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Platform</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {platforms.map((p) => (
                    <motion.button key={p.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setPlatform(p.id)}
                      className={`p-3 rounded-xl flex flex-col items-center gap-1.5 text-sm font-medium transition-all ${
                        platform === p.id ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}>
                      <p.icon className="text-lg" />{p.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tone: <span className="gradient-text font-bold">{toneLabel}</span>
                </label>
                <input type="range" min="0" max="1" step="0.05" value={tone}
                  onChange={(e) => setTone(parseFloat(e.target.value))} className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Casual</span><span>Professional</span><span>Formal</span>
                </div>
              </div>

              {/* Generate */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => mutation.mutate()} disabled={mutation.isPending || !topic.trim()}
                className="w-full btn-gradient py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {mutation.isPending ? <LoadingSpinner size={24} /> : <><FaMagic /> Generate Content</>}
              </motion.button>
            </div>
          </AnimatedSection>

          {/* Right: Output */}
          <AnimatedSection delay={0.2}>
            <div className="glass-card-light p-6 space-y-6">
              {!result && !mutation.isPending ? (
                <div className="text-center py-16 text-muted-foreground">
                  <FaMagic className="text-4xl mx-auto mb-4 text-primary/30" />
                  <p className="text-lg">Configure your inputs and generate content</p>
                </div>
              ) : mutation.isPending ? (
                <div className="text-center py-16">
                  <LoadingSpinner size={50} />
                  <p className="text-muted-foreground mt-4">Generating brand-aligned content...</p>
                </div>
              ) : result ? (
                <>
                  {/* Score Ring + Scores */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <ScoreRing score={norm(result.quality_score)} size={120} label="Quality" />
                    <div className="flex-1 space-y-3 w-full">
                      {[
                        { label: 'Quality Score', value: result.quality_score },
                        { label: 'Consistency Score', value: result.consistency_score },
                        { label: 'Brand Match', value: result.brand_match ?? result.brand_match_percentage },
                      ].filter(s => s.value != null).map((s) => (
                        <div key={s.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{s.label}</span>
                            <span className="font-bold text-foreground">{norm(Number(s.value))}%</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${norm(Number(s.value))}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }} className="h-full rounded-full gradient-bg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <div className="bg-muted/50 rounded-xl p-4 text-foreground whitespace-pre-wrap leading-relaxed text-sm">
                      {cleanMarkdown(result.content)}
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleCopy}
                        className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
                        {copied ? <FaCheck className="text-success" /> : <FaCopy />}
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleDownload}
                        className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <FaDownload />
                      </motion.button>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>📝 {result.word_count} words</span>
                    <span>🎯 {result.tone_used}</span>
                    {result.needs_refinement != null && (
                      <span className={result.needs_refinement ? 'text-warning' : 'text-success'}>
                        {result.needs_refinement ? '⚠️ Needs refinement' : '✅ On brand'}
                      </span>
                    )}
                  </div>

                  {/* Feedback */}
                  {result.feedback?.length > 0 && (
                    <div>
                      <h3 className="font-display font-semibold text-foreground mb-2">💡 Suggestions</h3>
                      <FeedbackList feedback={result.feedback} baseDelay={0.3} />
                    </div>
                  )}

                  {/* Adapt to all platforms button */}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleAdaptAll} disabled={adaptMutation.isPending}
                    className="w-full py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    {adaptMutation.isPending ? <LoadingSpinner size={20} /> : '📱 Adapt to All Platforms'}
                  </motion.button>
                </>
              ) : null}
            </div>
          </AnimatedSection>
        </div>

        {/* Platform Adaptations */}
        {Object.keys(allAdaptations).length > 0 && (
          <AnimatedSection delay={0.3} className="mt-8">
            <h2 className="font-display font-bold text-xl mb-4 text-foreground">📱 Platform Adaptations</h2>
            <PlatformAdaptations adaptations={allAdaptations} />
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};

export default Generator;
