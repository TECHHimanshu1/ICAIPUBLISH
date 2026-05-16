import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, BookOpen, FileText, Layers, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoverThumb, PageShell } from "@/components/site-header";
import { COMMITTEES, PUBLICATIONS, TOPICS } from "@/lib/mock";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [q, setQ] = useState("");
  const latest = [...PUBLICATIONS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const featured = PUBLICATIONS.slice(0, 4);

  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden icai-gradient text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-[color:var(--color-icai-gold-light)]">
            <Sparkles className="h-3 w-3" /> Official Digital Library · ICAI
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            ICAI Publication Portal
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Access authoritative technical guides, standards, handbooks and journals issued by the
            Institute of Chartered Accountants of India.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/search?q=${encodeURIComponent(q)}`;
            }}
            className="mt-8 flex max-w-2xl gap-2 rounded-lg bg-white p-2 shadow-xl"
          >
            <Search className="ml-2 h-5 w-5 self-center text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search publications, standards, guidance notes…"
              className="border-0 text-foreground shadow-none focus-visible:ring-0"
            />
            <Button type="submit" className="bg-[color:var(--color-icai-blue)] hover:bg-[color:var(--color-icai-blue-dark)]">
              Search
            </Button>
          </form>
          <div className="mt-10 grid max-w-3xl grid-cols-3 gap-6">
            {[
              { icon: BookOpen, k: PUBLICATIONS.length, l: "Publications" },
              { icon: Layers, k: COMMITTEES.length, l: "Committees" },
              { icon: Award, k: TOPICS.length, l: "Topics" },
            ].map((s) => (
              <div key={s.l} className="rounded-md border border-white/10 bg-white/5 p-4">
                <s.icon className="h-5 w-5 text-[color:var(--color-icai-gold-light)]" />
                <div className="mt-2 text-2xl font-bold">{s.k}+</div>
                <div className="text-xs text-white/70">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest releases */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHead title="Latest Releases" subtitle="Recently published by ICAI committees" link="/publications" />
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {latest.map((p) => (
            <Link key={p.id} to="/publications/$id" params={{ id: p.id }}>
              <CoverThumb pub={p} />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-secondary/40 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHead title="Featured Publications" subtitle="Curated by the editorial board" link="/publications" />
          <div className="grid gap-6 md:grid-cols-2">
            {featured.map((p) => (
              <article key={p.id} className="flex gap-4 rounded-lg border border-border bg-white p-4 shadow-sm">
                <Link to="/publications/$id" params={{ id: p.id }} className="w-28 shrink-0">
                  <CoverThumb pub={p} />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-icai-blue)]">
                    {p.type} · {p.topic}
                  </div>
                  <Link to="/publications/$id" params={{ id: p.id }} className="mt-1 font-semibold leading-snug hover:underline">
                    {p.title}
                  </Link>
                  <div className="mt-1 text-xs text-muted-foreground">{p.committee}</div>
                  <p className="mt-2 line-clamp-3 text-sm text-foreground/80">{p.synopsis}</p>
                  <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
                    <span>{new Date(p.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    <Link to="/publications/$id" params={{ id: p.id }} className="inline-flex items-center gap-1 font-medium text-[color:var(--color-icai-blue)]">
                      Read Now <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Committees */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHead title="Browse by Committee" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COMMITTEES.map((c) => (
            <Link
              key={c}
              to="/publications"
              search={{ committee: c } as never}
              className="group rounded-md border border-border bg-white p-4 transition hover:border-[color:var(--color-icai-blue)] hover:shadow-sm"
            >
              <FileText className="h-5 w-5 text-[color:var(--color-icai-gold)]" />
              <div className="mt-3 text-sm font-medium leading-snug group-hover:text-[color:var(--color-icai-blue)]">{c}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {PUBLICATIONS.filter((p) => p.committee === c).length} publications
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Topics */}
      <section className="bg-secondary/40 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHead title="Browse by Topic" />
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <Link
                key={t}
                to="/publications"
                search={{ topic: t } as never}
                className="rounded-full border border-border bg-white px-4 py-2 text-sm hover:border-[color:var(--color-icai-blue)] hover:text-[color:var(--color-icai-blue)]"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function SectionHead({ title, subtitle, link }: { title: string; subtitle?: string; link?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h2 className="text-2xl font-bold text-[color:var(--color-icai-blue)]">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {link && (
        <Link to={link} className="text-sm font-medium text-[color:var(--color-icai-blue)] hover:underline">
          View all →
        </Link>
      )}
    </div>
  );
}
