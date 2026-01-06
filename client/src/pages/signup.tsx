import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { ShieldCheck, Eye, EyeOff, ArrowLeft, CheckSquare, Square } from "lucide-react";
import { TOS_VERSION } from "./terms";

export default function Signup() {
  const [, navigate] = useLocation();
  const { signup, user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate("/app");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!tosAccepted) {
      setError("You must accept the Terms of Service to create an account.");
      return;
    }
    
    setLoading(true);
    try {
      await signup({ ...formData, tosVersion: TOS_VERSION });
      navigate("/app");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          data-testid="link-back"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <ShieldCheck className="w-8 h-8 text-blue-400 fill-blue-400/20" style={{ transform: 'scaleY(0.95)' }} />
            <span className="font-display font-bold text-2xl" style={{ transform: 'scaleY(0.97)' }}>RatedIRL</span>
          </Link>
          <h1 className="text-3xl font-bold font-display mb-2">Create account</h1>
          <p className="text-white/60">Join the reputation revolution</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">First name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Alex"
                required
                data-testid="input-firstname"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Last name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Miller"
                required
                data-testid="input-lastname"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="alexm"
              required
              data-testid="input-username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="you@example.com"
              required
              data-testid="input-email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="••••••••"
                required
                minLength={6}
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setTosAccepted(!tosAccepted)}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all text-left ${
                tosAccepted 
                  ? "bg-primary/10 border-primary/30" 
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
              data-testid="button-tos-accept"
            >
              {tosAccepted ? (
                <CheckSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              ) : (
                <Square className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
              )}
              <span className="text-sm text-white/80">
                I confirm that I am at least 18 years old and I agree to the{" "}
                <Link 
                  href="/terms" 
                  className="text-primary hover:underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                  target="_blank"
                >
                  Terms of Service
                </Link>
                , including the limitation of liability, indemnification, and arbitration clauses.
              </span>
            </button>
            <p className="text-xs text-white/40 text-center">
              By creating an account, you acknowledge that you have read and understood our Terms of Service (Version {TOS_VERSION}).
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !tosAccepted}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-signup"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-white/60 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
