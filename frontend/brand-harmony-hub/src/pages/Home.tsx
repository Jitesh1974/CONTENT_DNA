import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDna, FaBrain, FaRocket, FaChartLine, FaLayerGroup, FaChevronDown } from 'react-icons/fa';
import { CheckCircle, Zap, Rocket, ShieldCheck, Lock } from 'lucide-react';
import FloatingParticles from '@/components/FloatingParticles';
import AnimatedSection from '@/components/AnimatedSection';
import DNAAnimation from '@/components/DNAAnimation';

const phrases = [
  'Extract your brand voice',
  'Generate consistent content',
  'Maintain brand identity',
  'Scale your content strategy',
];

const features = [
  { icon: FaDna, title: 'Content DNA Extraction', desc: 'Analyze your existing content to extract unique brand voice patterns and linguistic fingerprints.' },
  { icon: FaBrain, title: 'AI-Powered Generation', desc: 'Generate new content that perfectly matches your established brand voice and tone.' },
  { icon: FaChartLine, title: 'Brand Consistency Score', desc: 'Real-time scoring ensures every piece of content stays true to your brand identity.' },
  { icon: FaLayerGroup, title: 'Multi-Platform Optimization', desc: 'Adapt content for LinkedIn, Instagram, Blog, and Email while maintaining brand coherence.' },
];

const Home = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        if (displayText.length === currentPhrase.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayText(currentPhrase.slice(0, displayText.length - 1));
        if (displayText.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? 40 : 80);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIndex]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #060b18 50%, #0a0d1f 100%)' }}>
        <FloatingParticles />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold"
              style={{ background: 'hsl(263 70% 50% / 0.15)', border: '1px solid hsl(263 70% 50% / 0.3)', color: 'hsl(263 70% 75%)' }}
            >
              <Zap className="w-4 h-4" /> POWERED BY BRAND INTELLIGENCE AI
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-body font-extrabold mb-6 leading-[1.1] tracking-tight"
              style={{ color: 'white' }}
            >
              Decode Your{' '}
              <br />
              Brand's{' '}
              <br />
              <span className="gradient-text">Content DNA</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-base md:text-lg mb-8 max-w-md"
              style={{ color: 'hsl(230 20% 60%)' }}
            >
              Train AI on your writing style and generate perfectly consistent content across every platform. Never sound off-brand again.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4 justify-center lg:justify-start flex-wrap"
            >
              <Link to="/dashboard" className="btn-hero-primary text-base px-7 py-3.5 flex items-center gap-2 font-semibold rounded-xl">
                <Rocket className="w-5 h-5" /> Analyze Brand DNA
              </Link>
              <Link to="/generator" className="btn-hero-secondary text-base px-7 py-3.5 flex items-center gap-2 font-semibold rounded-xl">
                <Zap className="w-5 h-5" /> Try Demo
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex gap-5 mt-8 justify-center lg:justify-start flex-wrap"
            >
              {[
                { icon: ShieldCheck, label: 'No signup needed' },
                { icon: Zap, label: 'Instant results' },
                { icon: Lock, label: '100% Private' },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + idx * 0.15 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{
                    background: 'hsl(230 30% 15% / 0.6)',
                    border: '1px solid hsl(230 30% 25%)',
                    color: 'hsl(230 60% 85%)',
                  }}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(145 70% 55%)' }} />
                  {item.label}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: DNA Animation */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-[350px] sm:h-[450px] lg:h-[650px]"
          >
            <DNAAnimation />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-scroll-indicator"
        >
          <FaChevronDown style={{ color: 'hsl(260, 30%, 60%)' }} className="text-xl" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to maintain a consistent, powerful brand voice across all your content.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="glass-card-light p-6 h-full cursor-pointer transition-shadow duration-300"
                >
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                    <f.icon className="text-primary-foreground text-lg" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2 text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 gradient-hero-bg relative overflow-hidden">
        <FloatingParticles />
        <AnimatedSection className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6" style={{ color: 'white' }}>
            Ready to unlock your <span className="gradient-text">Content DNA</span>?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'hsl(260, 30%, 75%)' }}>
            Start analyzing your brand voice and generating consistent, high-quality content today.
          </p>
          <Link to="/dashboard" className="btn-gradient text-lg px-10 py-4 inline-flex items-center gap-2">
            <FaRocket /> Launch Dashboard
          </Link>
        </AnimatedSection>
      </section>
    </div>
  );
};

export default Home;
