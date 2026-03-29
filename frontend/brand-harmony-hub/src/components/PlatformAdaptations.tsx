import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLinkedin, FaInstagram, FaBlog, FaEnvelope, FaTwitter, FaCopy, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { cleanMarkdown } from '@/lib/cleanMarkdown';

const platformIcons: Record<string, React.ElementType> = {
  linkedin: FaLinkedin,
  instagram: FaInstagram,
  blog: FaBlog,
  email: FaEnvelope,
  twitter: FaTwitter,
};

const platformColors: Record<string, string> = {
  linkedin: 'hsl(210, 80%, 50%)',
  instagram: 'hsl(330, 80%, 55%)',
  blog: 'hsl(150, 60%, 45%)',
  email: 'hsl(40, 80%, 50%)',
  twitter: 'hsl(200, 85%, 55%)',
};

interface PlatformAdaptationsProps {
  adaptations: Record<string, string>;
}

export default function PlatformAdaptations({ adaptations }: PlatformAdaptationsProps) {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const handleCopy = (platform: string, content: string) => {
    navigator.clipboard.writeText(cleanMarkdown(content));
    setCopiedPlatform(platform);
    toast.success(`${platform} content copied!`);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const entries = Object.entries(adaptations);
  if (!entries.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {entries.map(([platform, content], i) => {
        const Icon = platformIcons[platform.toLowerCase()] || FaBlog;
        const cleaned = cleanMarkdown(String(content));
        return (
          <motion.div
            key={platform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass-card-light p-5 relative group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className="text-lg" style={{ color: platformColors[platform.toLowerCase()] }} />
                <h4 className="font-display font-semibold text-foreground capitalize">{platform}</h4>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleCopy(platform, String(content))}
                className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedPlatform === platform ? <FaCheck className="text-xs" style={{ color: 'hsl(var(--success))' }} /> : <FaCopy className="text-xs" />}
              </motion.button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">{cleaned}</p>
            <p className="text-xs text-muted-foreground/60 mt-2">{cleaned.length} chars</p>
          </motion.div>
        );
      })}
    </div>
  );
}
