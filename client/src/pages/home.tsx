import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  UserCheck, 
  Search, 
  ThumbsUp, 
  Scale, 
  ArrowRight, 
  Menu, 
  X 
} from "lucide-react";
import heroBg from "@assets/generated_images/abstract_dark_gradient_background_with_subtle_neon_glows.png";
import phoneMockup from "@assets/generated_images/realistic_smartphone_3d_render.png";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/30">
      {/* Background Asset */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <img 
          src={heroBg} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/50 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-400 fill-blue-400/20" />
            <span className="font-display font-bold text-xl tracking-tight">RatedIRL</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors" data-testid="link-login">
              Sign In
            </Link>
            <Link href="/signup" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 active:scale-95" data-testid="link-signup">
              Get Started
            </Link>
          </div>

          <button 
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-white/10 p-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
            <Link href="/login" className="w-full text-left py-2 text-white/70" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
            <Link href="/signup" className="w-full bg-white text-black py-3 rounded-xl font-semibold text-center" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
          </div>
        )}
      </nav>

      <main className="relative z-10 pt-32 pb-20">
        
        {/* Hero Section */}
        <section className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Coming Soon
            </div>
            
            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              Ratings <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">
                irl.
              </span>
            </h1>
            
            <p className="text-lg text-white/60 mb-8 max-w-lg leading-relaxed">
              The social reputation platform for the modern world. Verified feedback for the people you trust (and the ones you don't).
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/signup" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 text-center" data-testid="button-signup-hero">
                Get started free
              </Link>
              <Link href="/login" className="glass hover:bg-white/10 px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2" data-testid="button-login-hero">
                Sign in
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Verified reviewers</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent" />
                <span>15-word feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-accent" />
                <span>Moderated</span>
              </div>
            </div>
          </motion.div>

          {/* App Preview - Phone Mockup */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Glow behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[600px] bg-primary/30 rounded-full blur-[120px]"></div>
            
            <img 
              src={phoneMockup} 
              alt="RatedIRL App Preview" 
              className="relative mx-auto w-[380px] h-auto drop-shadow-2xl"
            />
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 mb-32">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                icon: UserCheck, 
                title: "Verified Reviewers", 
                desc: "No bots. No fake accounts. Every reviewer is identity-verified to ensure real human feedback." 
              },
              { 
                icon: MessageSquare, 
                title: "Short & Sweet", 
                desc: "Reviews are capped at 15 words. Get to the point without the fluff. Efficiency is key." 
              },
              { 
                icon: ShieldCheck, 
                title: "Human Moderation", 
                desc: "Our community guidelines are strictly enforced. Hate speech and bullying are blocked instantly." 
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="glass p-8 rounded-3xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <feature.icon className="w-24 h-24" />
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 text-primary">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">How it works</h2>
            <p className="text-white/60">Three simple steps to build your reputation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent border-t border-dashed border-white/20"></div>

            {[
              { icon: Search, title: "Find Profile", desc: "Search for friends, colleagues, or anyone with a RatedIRL profile." },
              { icon: ThumbsUp, title: "Rate Honestly", desc: "Leave a rating and a short 15-word review based on your experience." },
              { icon: Scale, title: "Keep it Fair", desc: "Help the community by upvoting helpful reviews and reporting abuse." }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-full glass flex items-center justify-center mb-6 border-4 border-background shadow-xl">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold font-display mb-2">{step.title}</h3>
                <p className="text-white/60 max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-6 mb-20">
          <div className="glass-card rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Ready to get rated?</h2>
              <p className="text-xl text-white/60 mb-10">Join thousands of others on the waitlist for the most honest social platform ever built.</p>
              
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg shadow-white/10">
                  Join waitlist
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/20 backdrop-blur-sm py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-400 fill-blue-400/20" />
            <span className="font-display font-bold text-lg">RatedIRL</span>
          </div>
          <div className="text-sm text-white/40">
            © 2024 RatedIRL Inc. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-white/60">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
