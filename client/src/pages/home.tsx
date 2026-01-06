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
            <ShieldCheck className="w-6 h-6 text-blue-400 fill-blue-400/20" style={{ transform: 'scaleY(0.95)' }} />
            <span className="font-display font-bold text-xl tracking-normal" style={{ transform: 'scaleY(0.97)' }}>RatedIRL</span>
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
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary animate-pulse"></span>
              </span>
              Beta Version
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[550px] bg-primary/30 rounded-full blur-[120px]"></div>
            <div className="absolute top-1/3 left-1/3 w-[200px] h-[300px] bg-accent/20 rounded-full blur-[80px]"></div>

            {/* Phone Frame */}
            <div className="relative mx-auto w-[300px]">
              {/* Outer frame with titanium-like finish */}
              <div className="relative bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 rounded-[50px] p-[3px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8),0_30px_60px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                {/* Side button highlights */}
                <div className="absolute -right-[2px] top-28 w-[3px] h-12 bg-gradient-to-b from-zinc-600 via-zinc-700 to-zinc-600 rounded-r-sm"></div>
                <div className="absolute -right-[2px] top-44 w-[3px] h-8 bg-gradient-to-b from-zinc-600 via-zinc-700 to-zinc-600 rounded-r-sm"></div>
                <div className="absolute -left-[2px] top-32 w-[3px] h-16 bg-gradient-to-b from-zinc-600 via-zinc-700 to-zinc-600 rounded-l-sm"></div>
                
                {/* Inner bezel */}
                <div className="bg-black rounded-[47px] overflow-hidden">
                  {/* Screen area */}
                  <div className="relative h-[620px] bg-zinc-950 overflow-hidden">
                    
                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
                      <div className="w-[100px] h-[32px] bg-black rounded-full flex items-center justify-center gap-3 shadow-inner">
                        <div className="w-3 h-3 rounded-full bg-zinc-900 ring-1 ring-zinc-800"></div>
                        <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                      </div>
                    </div>

                    {/* Status Bar */}
                    <div className="relative z-20 px-8 pt-4 flex justify-between text-[11px] font-semibold text-white">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-3" viewBox="0 0 18 12" fill="currentColor">
                          <path d="M1 4h2v4H1V4zm3-2h2v8H4V2zm3-2h2v12H7V0zm3 3h2v6h-2V3zm3 1h2v4h-2V4z" fillOpacity="0.9"/>
                        </svg>
                        <span className="text-[10px]">5G</span>
                        <svg className="w-6 h-3" viewBox="0 0 25 12" fill="currentColor">
                          <rect x="0" y="1" width="21" height="10" rx="2.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
                          <rect x="22" y="4" width="1.5" height="4" rx="0.5" opacity="0.4"/>
                          <rect x="1.5" y="2.5" width="17" height="7" rx="1.5"/>
                        </svg>
                      </div>
                    </div>

                    {/* App Content */}
                    <div className="h-full overflow-y-auto pt-10 pb-24 px-4 text-white">
                      
                      {/* Profile Header */}
                      <div className="flex flex-col items-center mb-5">
                        <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border-[3px] border-zinc-800 mb-3 overflow-hidden shadow-lg">
                          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <h2 className="font-bold text-base">Alex M.</h2>
                          <ShieldCheck className="w-4 h-4 text-blue-400 fill-blue-400/20" />
                        </div>
                        <p className="text-[11px] text-white/50 mb-2">San Francisco, CA</p>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                          <span className="flex text-yellow-500">
                            {[1,2,3,4].map((s) => (
                              <Star key={s} className="w-3 h-3 fill-current" />
                            ))}
                            <Star className="w-3 h-3 text-yellow-500/30" />
                          </span>
                          <span className="text-[11px] font-medium">4.3 (27)</span>
                        </div>
                      </div>

                      {/* Reviews */}
                      <div className="space-y-2.5">
                        <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Recent Reviews</h3>
                        
                        {[
                          { stars: 5, text: "Always delivers on time, super reliable friend.", author: "Sarah J.", role: "Verified Friend", time: "2d" },
                          { stars: 4, text: "Great detailed feedback on my project.", author: "Mike T.", role: "Coworker", time: "5d" },
                          { stars: 5, text: "Helped me move apartments without complaining!", author: "Davide", role: "Neighbor", time: "1w" }
                        ].map((review, i) => (
                          <div key={i} className="bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06]">
                            <div className="flex justify-between items-start mb-1.5">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, si) => (
                                  <Star key={si} className={`w-2.5 h-2.5 ${si < review.stars ? "fill-yellow-500 text-yellow-500" : "text-white/20"}`} />
                                ))}
                              </div>
                              <span className="text-[9px] text-white/30">{review.time}</span>
                            </div>
                            <p className="text-[12px] text-white/80 mb-2 leading-relaxed">"{review.text}"</p>
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700"></div>
                              <span className="text-[10px] text-white/40">{review.author} • <span className="text-blue-400/80">{review.role}</span></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Nav */}
                    <div className="absolute bottom-0 left-0 w-full bg-zinc-950/95 backdrop-blur-xl border-t border-white/[0.05]">
                      <div className="flex justify-around items-center px-4 py-3">
                        <div className="p-2 text-white/40"><Search className="w-5 h-5" /></div>
                        <div className="p-2 text-white bg-white/10 rounded-xl"><UserCheck className="w-5 h-5" /></div>
                        <div className="p-2 text-white/40"><MessageSquare className="w-5 h-5" /></div>
                      </div>
                      {/* Home Indicator */}
                      <div className="flex justify-center pb-2">
                        <div className="w-32 h-1 bg-white/20 rounded-full"></div>
                      </div>
                    </div>

                    {/* Screen reflection overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>
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
