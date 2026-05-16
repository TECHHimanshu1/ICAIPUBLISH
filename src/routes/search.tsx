import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, Search as SearchIcon } from "lucide-react";
import { PageShell } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { COMMITTEES, PUBLICATIONS, TOPICS } from "@/lib/mock";

type S = { q?: string };
export const Route = createFileRoute("/search")({
  validateSearch: (s): S => ({ q: s.q as string | undefined }),
  component: SearchPage,
});

function highlight(text: string, q: string) {
  if (!q) return text;
  const parts = text.split(new RegExp(`(${q})`, "ig"));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase() ? <mark key={i} className="bg-[color:var(--color-icai-gold)]/40 text-foreground">{p}</mark> : <span key={i}>{p}</span>,
  );
}

function SearchPage() {
  const initial = Route.useSearch();
  const [q, setQ] = useState(initial.q ?? "");
  const [committee, setCommittee] = useState<string | undefined>();
  const [topic, setTopic] = useState<string | undefined>();
  const [type, setType] = useState<string | undefined>();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const suggestions = useMemo(
    () => (q.length > 1 ? PUBLICATIONS.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())).slice(0, 5) : []),
    [q],
  );

  const results = useMemo(() => {
    let r = [...PUBLICATIONS];
    if (q) r = r.filter((p) => (p.title + " " + p.synopsis + " " + p.keywords.join(" ")).toLowerCase().includes(q.toLowerCase()));
    if (committee) r = r.filter((p) => p.committee === committee);
    if (topic) r = r.filter((p) => p.topic === topic);
    if (type) r = r.filter((p) => p.type === type);
    if (from) r = r.filter((p) => p.date >= from);
    if (to) r = r.filter((p) => p.date <= to);
    return r;
  }, [q, committee, topic, type, from, to]);

  return (
    <PageShell>
      <div className="border-b bg-secondary/40">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-2xl font-bold text-[color:var(--color-icai-blue)]">Advanced Search</h1>
          <div className="relative mt-4">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q} onChange={(e) => setQ(e.target.value)} autoFocus
              placeholder="Search publications, keywords, synopses…"
              className="h-12 pl-9 text-base"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
                {suggestions.map((s) => (
                  <button key={s.id} onClick={() => setQ(s.title)} className="block w-full px-3 py-2 text-left text-sm hover:bg-secondary">
                    <SearchIcon className="mr-2 inline h-3 w-3 text-muted-foreground" />
                    {highlight(s.title, q)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[260px_1fr]">
        <aside className="space-y-3 rounded-md border bg-white p-4 md:sticky md:top-24 md:self-start">
          <div className="text-sm font-semibold">Filters</div>
          <Sel label="Committee" v={committee} set={setCommittee} opts={COMMITTEES} />
          <Sel label="Topic" v={topic} set={setTopic} opts={TOPICS} />
          <Sel label="Type" v={type} set={setType} opts={["Guide", "Standard", "Handbook", "Bulletin", "Journal"]} />
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs text-muted-foreground">From</label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground">To</label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          </div>
          <Button variant="ghost" size="sm" className="w-full" onClick={() => { setCommittee(undefined); setTopic(undefined); setType(undefined); setFrom(""); setTo(""); }}>Reset filters</Button>
        </aside>

        <div>
          <div className="mb-3 text-sm text-muted-foreground">{results.length} results {q && <>for <b className="text-foreground">"{q}"</b></>}</div>
          <div className="space-y-3">
            {results.map((p) => (
              <article key={p.id} className="rounded-md border bg-white p-4">
                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Badge variant="outline" className="border-[color:var(--color-icai-gold)] text-[color:var(--color-icai-blue)]">{p.type}</Badge>
                  <span>{p.committee}</span>·<span>{p.topic}</span>·<span>{new Date(p.date).toLocaleDateString()}</span>
                </div>
                <Link to="/publications/$id" params={{ id: p.id }} className="mt-1 block text-lg font-semibold text-[color:var(--color-icai-blue)] hover:underline">
                  {highlight(p.title, q)}
                </Link>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">{highlight(p.synopsis, q)}</p>
                <div className="mt-3 flex gap-2">
                  <Link to="/reader/$id" params={{ id: p.id }} search={{ q } as never}>
                    <Button size="sm" className="gap-1 bg-[color:var(--color-icai-blue)] hover:bg-[color:var(--color-icai-blue-dark)]"><ExternalLink className="h-3 w-3" /> Open in reader</Button>
                  </Link>
                  <Link to="/publications/$id" params={{ id: p.id }}><Button size="sm" variant="outline">Details</Button></Link>
                </div>
              </article>
            ))}
            {results.length === 0 && <div className="rounded-md border bg-white p-8 text-center text-sm text-muted-foreground">No results.</div>}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Sel({ label, v, set, opts }: { label: string; v?: string; set: (v?: string) => void; opts: string[] }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <Select value={v ?? ""} onValueChange={(x) => set(x === "__all" ? undefined : x)}>
        <SelectTrigger className="mt-1"><SelectValue placeholder="All" /></SelectTrigger>
        <SelectContent><SelectItem value="__all">All</SelectItem>{opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
