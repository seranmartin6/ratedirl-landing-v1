import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { 
  Home, 
  Search, 
  User, 
  PlusCircle, 
  Settings, 
  BarChart3, 
  Shield, 
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Rss
} from "lucide-react";
import { useState } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/app", icon: Home, label: "Dashboard" },
    { href: "/feed", icon: Rss, label: "Feed" },
    { href: "/people", icon: Search, label: "Search" },
    { href: "/nominate", icon: PlusCircle, label: "Nominate" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  if (user?.role === "admin") {
    navItems.push({ href: "/admin/moderation", icon: Shield, label: "Admin" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/app" className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-400 fill-blue-400/20" style={{ transform: 'scaleY(0.95)' }} />
            <span className="font-display font-bold text-xl hidden sm:block" style={{ transform: 'scaleY(0.97)' }}>RatedIRL</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  location === item.href
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span className="text-white/80">{user?.firstName}</span>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 text-white/60 hover:text-white transition-colors"
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/60 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-white/5 bg-background p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  location === item.href
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
