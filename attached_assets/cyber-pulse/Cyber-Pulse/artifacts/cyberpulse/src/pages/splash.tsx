import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, Terminal } from 'lucide-react';
import heroGlow from '@/assets/hero-pulse-glow.png';
import { TechBrainBg } from '@/components/tech-brain-bg';

export default function Splash() {
  const [, setLocation] = useLocation();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 800);
    const t2 = setTimeout(() => setStage(2), 2400);
    const t3 = setTimeout(() => setStage(3), 4000);
    const t4 = setTimeout(() => setLocation('/home'), 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [setLocation]);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center overflow-hidden relative">
      {/* Tech Brain animated background */}
      <TechBrainBg />
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Hero glow graphic */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-40 pointer-events-none mix-blend-screen flex items-center justify-center">
        <motion.img 
          src={heroGlow} 
          alt="" 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: stage >= 2 ? 1 : 0, scale: stage >= 2 ? 1 : 0.8 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="w-full h-full object-contain animate-pulse-slow" 
        />
      </div>

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setLocation('/home')}
        className="absolute bottom-8 right-8 text-muted-foreground hover:text-primary transition-colors text-sm font-mono tracking-widest uppercase z-10"
      >
        Skip sequence [ESC]
      </motion.button>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            {stage === 0 && (
              <motion.div
                key="terminal"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                className="text-primary"
              >
                <Terminal size={64} strokeWidth={1} />
              </motion.div>
            )}
            {stage === 1 && (
              <motion.div
                key="shield"
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                className="text-secondary"
              >
                <Shield size={64} strokeWidth={1} />
              </motion.div>
            )}
            {stage >= 2 && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                className="text-primary relative"
              >
                <Activity size={80} strokeWidth={1.5} className="glow-primary rounded-full drop-shadow-xl" />
                <motion.div 
                  className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: stage >= 2 ? 1 : 0, y: stage >= 2 ? 0 : 20 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground mb-4 drop-shadow-2xl">
            Cyber<span className="text-primary">Pulse</span>
          </h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 3 ? 1 : 0 }}
            className="flex items-center justify-center gap-3 text-secondary font-mono text-sm tracking-widest uppercase"
          >
            <span className="w-8 h-px bg-secondary/50"></span>
            System Initializing
            <span className="w-8 h-px bg-secondary/50"></span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
