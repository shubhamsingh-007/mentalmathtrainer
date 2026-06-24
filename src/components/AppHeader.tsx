import { Link } from "@tanstack/react-router";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 font-display text-lg tracking-tight select-none">
          <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary via-primary to-sky-400 shadow-lg shadow-primary/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 5H6L11.5 12L6 19H18"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-foreground"
              />
            </svg>
            <span className="pointer-events-none absolute inset-0 rounded-lg border border-white/20" />
            <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-lg bg-white/10" />
          </span>
          <span className="flex items-baseline">
            <span className="font-semibold text-foreground">Mind</span>
            <span className="ml-1 font-extrabold text-primary">Math</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {[
            { to: "/practice", label: "Practice" },
            { to: "/stats", label: "Stats" },
            { to: "/how-it-works", label: "Techniques" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "text-foreground bg-accent" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
