import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, LayoutDashboard, LogIn, LogOut, Search, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { clearSession, getSession, type Session } from "@/lib/auth";

export function SiteHeader() {
  const [session, setSessionState] = useState<Session | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    const sync = () => setSessionState(getSession());
    sync();
    window.addEventListener("icai-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("icai-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur">
      <div className="h-1 icai-gold-bar" />
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md icai-gradient text-[color:var(--color-icai-gold)] font-bold">
            ICAI
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-[color:var(--color-icai-blue)]">
              Publication Portal
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Institute of Chartered Accountants of India
            </div>
          </div>
        </Link>

        <nav className="ml-6 hidden gap-1 md:flex">
          <Link to="/publications" className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-[color:var(--color-icai-blue)]">
            Publications
          </Link>
          <Link to="/search" className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-[color:var(--color-icai-blue)]">
            Search
          </Link>
          <Link to="/admin" className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-[color:var(--color-icai-blue)]">
            Admin
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-full border border-[color:var(--color-icai-gold)]/40 bg-[color:var(--color-icai-gold)]/10 px-2 py-0.5 text-[10px] font-medium text-[color:var(--color-icai-blue)] sm:inline">
            Prototype Mode
          </span>
          <Link to="/search">
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          {session ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">{session.name.split(" ")[0]}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearSession();
                  nav({ to: "/" });
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm" className="gap-2 bg-[color:var(--color-icai-blue)] hover:bg-[color:var(--color-icai-blue-dark)]">
                <LogIn className="h-4 w-4" /> Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-[color:var(--color-icai-blue-dark)] text-white/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="mb-2 flex items-center gap-2 font-semibold text-white">
            <Shield className="h-4 w-4 text-[color:var(--color-icai-gold)]" />
            ICAI Publication Portal
          </div>
          <p className="text-xs leading-relaxed">
            Official digital library of publications, technical guides and standards from the
            Institute of Chartered Accountants of India.
          </p>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-white">Explore</div>
          <ul className="space-y-1 text-xs">
            <li><Link to="/publications">All Publications</Link></li>
            <li><Link to="/search">Advanced Search</Link></li>
            <li><Link to="/login">Member Login</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-white">Committees</div>
          <ul className="space-y-1 text-xs">
            <li>Auditing &amp; Assurance</li>
            <li>Direct Taxes</li>
            <li>GST &amp; Indirect Taxes</li>
            <li>Sustainability Reporting</li>
          </ul>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-white">About</div>
          <p className="text-xs">
            ICAI · Set up by an Act of Parliament. This is a prototype demo with simulated data.
          </p>
        </div>
      </div>
      <div className="h-1 icai-gold-bar" />
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function CoverThumb({ pub }: { pub: { title: string; committee: string; cover: string } }) {
  return (
    <div
      className="relative flex aspect-[3/4] w-full items-end overflow-hidden rounded-md text-white shadow-md"
      style={{ background: pub.cover }}
    >
      <div className="absolute inset-x-0 top-0 h-1 icai-gold-bar" />
      <div className="absolute right-2 top-2 rounded bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider backdrop-blur">
        ICAI
      </div>
      <div className="p-3">
        <div className="line-clamp-3 text-sm font-semibold leading-snug">{pub.title}</div>
        <div className="mt-1 text-[10px] opacity-80">{pub.committee}</div>
      </div>
      <BookOpen className="absolute right-3 bottom-3 h-4 w-4 opacity-50" />
      <User className="hidden" />
    </div>
  );
}
