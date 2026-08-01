import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Target, TerminalSquare, Github, BarChart3, Fingerprint, Sparkles } from "lucide-react";
import { Link } from "wouter";
import heroGlow from '@/assets/hero-burst-glow.png';
import heroAiMentor from '@/assets/hero-ai-mentor.png';
import { TechBrainBg } from "@/components/tech-brain-bg";

const features = [
  {
    icon: <TerminalSquare className="w-6 h-6 text-primary" />,
    title: "Practical Labs",
    description: "Hands-on environments to exploit, defend, and secure real systems."
  },
  {
    icon: <Target className="w-6 h-6 text-secondary" />,
    title: "AI-Powered Guidance",
    description: "Your personalized AI mentor adapting to your learning curve in real-time."
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-primary" />,
    title: "Performance Analytics",
    description: "Track your growth across vulnerability domains and technical proficiencies."
  },
  {
    icon: <Github className="w-6 h-6 text-secondary" />,
    title: "Portfolio Integration",
    description: "Automatically sync your conquered labs and badges to your GitHub profile."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="relative px-6 py-20 md:py-32 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
          {/* Tech Brain animated background */}
          <TechBrainBg />
          {/* Radial glow overlays */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Hero glow graphic */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[800px] h-[800px] md:w-[1000px] md:h-[1000px] opacity-60 pointer-events-none mix-blend-screen flex items-center justify-center">
            <motion.img 
              src={heroGlow} 
              alt="" 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-full h-full object-contain" 
            />
          </div>

          <div className="container mx-auto relative z-10 text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider mb-8 backdrop-blur-sm"
            >
              <Fingerprint size={14} />
              <span>University Cybersecurity Platform</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight drop-shadow-lg"
            >
              Master Cybersecurity with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                AI-Driven Intelligence
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto drop-shadow-md"
            >
              The elite training ground for students and instructors. Engage in practical labs, follow structured learning paths, and build a verifiable portfolio that proves your skills.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto text-base h-14 px-8 glow-primary">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Floating decorative elements */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute hidden md:flex flex-col items-center justify-center top-[15%] left-[5%] xl:left-[10%] w-56 xl:w-72"
          >
            <img src={heroAiMentor} alt="AI Mentor" className="w-full h-auto drop-shadow-2xl opacity-95" />
          </motion.div>

          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
            className="absolute hidden md:flex items-center bottom-[25%] right-[5%] lg:right-[10%] xl:right-[15%]"
          >
            {/* Annotation Leader Line */}
            <div className="flex items-center opacity-80">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_var(--color-secondary)]" />
              <div className="w-12 xl:w-24 h-[1px] bg-secondary/60 shadow-[0_0_5px_var(--color-secondary)]" />
              <div className="w-1 h-1 rounded-full bg-secondary shadow-[0_0_5px_var(--color-secondary)]" />
            </div>
            
            {/* Label */}
            <div className="flex items-center gap-2 ml-3">
              <Sparkles className="text-secondary w-3.5 h-3.5" />
              <span className="font-mono text-[10px] xl:text-xs uppercase tracking-widest text-secondary font-medium drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                AI Hints Active
              </span>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-card/30 border-y border-border/50 relative">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">The Complete Learning Arsenal</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to go from theory to practical mastery, governed by an intelligent system that adapts to you.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="bg-card border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-10 border-t border-border bg-background text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TerminalSquare size={18} className="text-primary" />
            <span className="font-bold text-foreground">CyberPulse</span>
          </div>
          <p>© {new Date().getFullYear()} CyberPulse Education. Academic Platform.</p>
        </div>
      </footer>
    </div>
  );
}
