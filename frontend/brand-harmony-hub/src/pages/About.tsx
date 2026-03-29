import { motion } from 'framer-motion';
import { FaDna } from 'react-icons/fa';
import { Sparkles, Target, Zap, Shield, Users, Globe } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';

const features = [
  { icon: Target, title: 'Brand Analysis', desc: 'AI-powered analysis extracts your unique brand tone, keywords, and writing patterns.' },
  { icon: Zap, title: 'Content Generation', desc: 'Generate on-brand content tailored to any platform with a single click.' },
  { icon: Shield, title: 'Consistency Checker', desc: 'Validate any draft against your brand DNA to ensure voice alignment.' },
  { icon: Users, title: 'Team Alignment', desc: 'Keep every team member writing in a unified brand voice effortlessly.' },
  { icon: Globe, title: 'Multi-Platform', desc: 'Optimised output for LinkedIn, Twitter, blogs, emails, and more.' },
  { icon: Sparkles, title: '100% Private', desc: 'Your content stays yours — no data stored, no third-party sharing.' },
];

const About = () => (
  <div className="min-h-screen pt-24 pb-16 bg-background">
    <div className="container mx-auto px-4 max-w-5xl">
      {/* Hero */}
      <AnimatedSection className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
          <FaDna className="text-xs" /> About Content DNA Engine
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
          Your Brand Voice, <span className="gradient-text">Decoded</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          Content DNA Engine uses AI to analyse your existing content, extract your unique brand fingerprint,
          and help you create perfectly on-brand content every time.
        </p>
      </AnimatedSection>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((f, i) => (
          <AnimatedSection key={f.title} delay={i * 0.1}>
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-card border border-border h-full transition-shadow"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          </AnimatedSection>
        ))}
      </div>

      {/* How It Works */}
      <AnimatedSection delay={0.3} className="mb-16">
        <h2 className="font-display text-2xl font-bold text-foreground text-center mb-10">How It Works</h2>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {[
            { step: '1', title: 'Paste Content', desc: 'Add 3-5 samples of your existing brand content.' },
            { step: '2', title: 'Analyse DNA', desc: 'Our AI extracts tone, keywords, style, and patterns.' },
            { step: '3', title: 'Generate & Check', desc: 'Create new on-brand content or validate existing drafts.' },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="flex-1 text-center p-6 rounded-2xl bg-muted/30 border border-border"
            >
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 font-display font-bold text-primary-foreground">
                {s.step}
              </div>
              <h3 className="font-display font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection delay={0.4} className="text-center">
        <div className="p-8 rounded-3xl border border-primary/20" style={{ background: 'var(--gradient-card)' }}>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Ready to decode your brand?</h2>
          <p className="text-muted-foreground mb-6">Start analysing your content and generate on-brand copy in seconds.</p>
          <a href="/dashboard" className="btn-gradient inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Get Started
          </a>
        </div>
      </AnimatedSection>
    </div>
  </div>
);

export default About;
