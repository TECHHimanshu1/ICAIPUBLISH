import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Grid3x3, List, X } from "lucide-react";
import { CoverThumb, PageShell } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMMITTEES, PUBLICATIONS, TOPICS } from "@/lib/mock";

type Search = { committee?: string; topic?: string; type?: string; sort?: string };

export const Route = createFileRoute("/publications/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    committee: s.committee as string | undefined,
    topic: s.topic as string | undefined,
    type: s.type as string | undefined,
    sort: s.sort as string | undefined,
  }),
  component: List_,
});

function List_() {
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let r = [...PUBLICATIONS];
    if (search.committee) r = r.filter((p) => p.committee === search.committee);
    if (search.topic) r = r.filter((p) => p.topic === search.topic);
    if (search.type) r = r.filter((p) => p.type === search.type);
    if (q) r = r.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
    const sort = search.sort ?? "latest";
    if (sort === "title") r.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "committee") r.sort((a, b) => a.committee.localeCompare(b.committee));
    else r.sort((a, b) => b.date.localeCompare(a.date));
    return r;
  }, [search, q]);

  const setSearch = (patch: Partial<Search>) =>
    nav({ search: (prev) => ({ ...prev, ...patch }) });

  const clear = () => nav({ search: {} });

  return (
    <PageShell>
      <div className="border-b bg-secondary/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-6">
          <h1 className="text-2xl font-bold text-[color:var(--color-icai-blue)]">All Publications</h1>
          <span className="text-sm text-muted-foreground">{filtered.length} results</span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant={view === "grid" ? "default" : "outline"} size="icon" onClick={() => setView("grid")}><Grid3x3 className="h-4 w-4" /></Button>
            <Button variant={view === "list" ? "default" : "outline"} size="icon" onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside className="space-y-4 rounded-lg border bg-white p-4 md:sticky md:top-24 md:self-start">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold"><Filter className="h-4 w-4" />Filters</div>
            <Button variant="ghost" size="sm" onClick={clear}><X className="h-3 w-3" /></Button>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Search title</label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type…" className="mt-1" />
          </div>
          <FilterSelect label="Committee" value={search.committee} options={COMMITTEES} onChange={(v) => setSearch({ committee: v })} />
          <FilterSelect label="Topic" value={search.topic} options={TOPICS} onChange={(v) => setSearch({ topic: v })} />
          <FilterSelect label="Type" value={search.type} options={["Guide", "Standard", "Handbook", "Bulletin", "Journal"]} onChange={(v) => setSearch({ type: v })} />
          <FilterSelect label="Sort by" value={search.sort ?? "latest"} options={["latest", "title", "committee"]} onChange={(v) => setSearch({ sort: v })} clearable={false} />
        </aside>

        {/* Results */}
        {view === "grid" ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <Link key={p.id} to="/publications/$id" params={{ id: p.id }} className="group">
                <CoverThumb pub={p} />
                <div className="mt-2 line-clamp-2 text-sm font-medium group-hover:text-[color:var(--color-icai-blue)]">{p.title}</div>
                <div className="text-[11px] text-muted-foreground">{p.committee}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <Link key={p.id} to="/publications/$id" params={{ id: p.id }} className="flex gap-4 rounded-md border bg-white p-3 hover:border-[color:var(--color-icai-blue)]">
                <div className="w-16 shrink-0"><CoverThumb pub={p} /></div>
                <div className="flex-1">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.committee} · {p.topic} · {p.type}</div>
                  <p className="mt-1 line-clamp-2 text-sm">{p.synopsis}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function FilterSelect({
  label, value, options, onChange, clearable = true,
}: { label: string; value?: string; options: string[]; onChange: (v: string | undefined) => void; clearable?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value ?? ""} onValueChange={(v) => onChange(v === "__all" ? undefined : v)}>
        <SelectTrigger className="mt-1"><SelectValue placeholder="All" /></SelectTrigger>
        <SelectContent>
          {clearable && <SelectItem value="__all">All</SelectItem>}
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
