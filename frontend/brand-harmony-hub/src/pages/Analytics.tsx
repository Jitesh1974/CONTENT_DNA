import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { FaExclamationTriangle, FaChartLine, FaMicrophone, FaTags, FaFlask } from 'react-icons/fa';
import { getBrands, getBrandDashboard, getBrandDrift } from '@/services/api';
import AnimatedSection from '@/components/AnimatedSection';
import LoadingSpinner from '@/components/LoadingSpinner';

ChartJS.register(ArcElement, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Analytics = () => {
  const [brandId, setBrandId] = useState(() => localStorage.getItem('selectedBrand') || '');

  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: getBrands });
  const activeBrand = brandId || brands[0]?.brand_id || '';

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard', activeBrand],
    queryFn: () => getBrandDashboard(activeBrand),
    enabled: !!activeBrand,
  });

  const { data: drift } = useQuery({
    queryKey: ['drift', activeBrand],
    queryFn: () => getBrandDrift(activeBrand),
    enabled: !!activeBrand,
  });

  const vis = dashboard?.visualizations;
  const brand = brands.find(b => b.brand_id === activeBrand);

  const doughnutData = {
    labels: ['Formal', 'Professional', 'Casual'],
    datasets: [{
      data: vis ? [vis.formality * 100, (1 - vis.formality) * 60, (1 - vis.formality) * 40] : [33, 33, 34],
      backgroundColor: [
        'hsl(263, 70%, 50%)',
        'hsl(300, 60%, 55%)',
        'hsl(330, 81%, 60%)',
      ],
      borderWidth: 0,
    }],
  };

  const barData = {
    labels: ['Consistency', 'Formality', 'Storytelling'],
    datasets: [{
      label: 'Score',
      data: vis ? [vis.consistency * 100, vis.formality * 100, vis.storytelling * 100] : [0, 0, 0],
      backgroundColor: [
        'hsl(263, 70%, 50%)',
        'hsl(300, 60%, 55%)',
        'hsl(330, 81%, 60%)',
      ],
      borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: 'hsl(260, 10%, 45%)' } } },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { color: 'hsl(260, 10%, 45%)' }, grid: { color: 'hsl(260, 15%, 90%)' } },
      x: { ticks: { color: 'hsl(260, 10%, 45%)' }, grid: { display: false } },
    },
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <AnimatedSection className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            Brand <span className="gradient-text">Analytics</span>
          </h1>
          <p className="text-muted-foreground mt-1">Deep insights into your brand's content performance</p>
        </AnimatedSection>

        {/* Brand Selector */}
        <AnimatedSection delay={0.1} className="mb-6">
          <select
            value={activeBrand}
            onChange={(e) => { setBrandId(e.target.value); localStorage.setItem('selectedBrand', e.target.value); }}
            className="w-full sm:w-72 px-4 py-3 rounded-xl bg-card border border-border text-foreground font-medium focus:ring-2 focus:ring-primary/50 outline-none"
          >
            {brands.map((b) => (
              <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>
            ))}
          </select>
        </AnimatedSection>

        {/* Drift Alert */}
        {drift?.drift_detected && drift.drift_score > 0.15 && (
          <AnimatedSection delay={0.15} className="mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card-light p-5 border-l-4 border-destructive"
            >
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-destructive text-xl mt-0.5" />
                <div>
                  <h3 className="font-display font-bold text-foreground">Brand Drift Detected</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drift score: {Math.round(drift.drift_score * 100)}% — Your recent content is deviating from your established brand voice.
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatedSection>
        )}

        {isLoading ? (
          <div className="py-20"><LoadingSpinner size={50} /></div>
        ) : dashboard ? (
          <>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <AnimatedSection delay={0.2}>
                <div className="glass-card-light p-6">
                  <h2 className="font-display font-bold text-lg mb-4 text-foreground">Tone Distribution</h2>
                  <div className="h-64">
                    <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'hsl(260, 10%, 45%)' } } } }} />
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.25}>
                <div className="glass-card-light p-6">
                  <h2 className="font-display font-bold text-lg mb-4 text-foreground">Brand Metrics</h2>
                  <div className="h-64">
                    <Bar data={barData} options={chartOptions} />
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Keywords */}
            <AnimatedSection delay={0.3} className="mb-8">
              <div className="glass-card-light p-6">
                <h2 className="font-display font-bold text-lg mb-4 text-foreground">🏷️ Top Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {dashboard.top_keywords?.map((kw: string, i: number) => (
                    <motion.span
                      key={kw}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      className="px-4 py-2 rounded-full text-sm font-medium gradient-bg text-primary-foreground"
                    >
                      {kw}
                    </motion.span>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Recommendations */}
            <AnimatedSection delay={0.4} className="mb-8">
              <div className="glass-card-light p-6">
                <h2 className="font-display font-bold text-lg mb-4 text-foreground">📋 Strategic Recommendations</h2>
                <div className="space-y-3">
                  {dashboard.recommendations?.map((r: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
                    >
                      <span className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center flex-shrink-0 text-xs text-primary-foreground font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm text-foreground">{r}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Stats Footer */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: FaChartLine, label: 'Consistency Score', value: `${Math.round((vis?.consistency || 0) * 100)}%` },
                { icon: FaMicrophone, label: 'Dominant Tone', value: brand?.tone || 'N/A' },
                { icon: FaTags, label: 'Key Keywords', value: dashboard.top_keywords?.length || 0 },
                { icon: FaFlask, label: 'Samples Analyzed', value: dashboard.samples_analyzed || 0 },
              ].map((s, i) => (
                <AnimatedSection key={s.label} delay={0.5 + i * 0.05}>
                  <motion.div whileHover={{ y: -4 }} className="glass-card-light p-5 text-center">
                    <s.icon className="text-2xl text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">Select a brand to view analytics</div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
