import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Clock, Sparkles, TrendingUp } from "lucide-react";
import { PageShell, CoverThumb } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRecent, getSaved, getSession, type Session } from "@/lib/auth";
import { PUBLICATIONS } from "@/lib/mock";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const nav = useNavigate();
  const [session, setSessionState] = useState<Session | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s) { nav({ to: "/login" }); return; }
    setSessionState(s);
    setRecent(getRecent());
    setSaved(getSaved());
  }, [nav]);

  if (!session) return null;
  const recentPubs = recent.map((id) => PUBLICATIONS.find((p) => p.id === id)).filter(Boolean) as typeof PUBLICATIONS;
  const savedPubs = saved.map((id) => PUBLICATIONS.find((p) => p.id === id)).filter(Boolean) as typeof PUBLICATIONS;
  const recommended = PUBLICATIONS.slice(8, 14);
  const continueReading = recentPubs[0];

  return (
    <PageShell>
      <div className="border-b icai-gradient text-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-xs uppercase tracking-wider text-[color:var(--color-icai-gold-light)]">{session.type === "member" ? "ICAI Member" : "Non-member"} · Welcome back</div>
          <h1 className="mt-1 text-3xl font-bold">{session.name}</h1>
          <p className="mt-1 text-sm text-white/80">Logged in {new Date(session.loginAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10">
        {continueReading && (
          <section className="rounded-lg border bg-secondary/40 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-icai-blue)]">Continue Reading</div>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="w-20"><CoverThumb pub={continueReading} /></div>
              <div className="flex-1">
                <div className="font-semibold">{continueReading.title}</div>
                <div className="text-xs text-muted-foreground">{continueReading.committee}</div>
              </div>
              <Link to="/reader/$id" params={{ id: continueReading.id }}>
                <Button className="gap-2 bg-[color:var(--color-icai-blue)] hover:bg-[color:var(--color-icai-blue-dark)]"><BookOpen className="h-4 w-4" /> Resume</Button>
              </Link>
            </div>
          </section>
        )}

        <Block icon={Clock} title="Recently Viewed" pubs={recentPubs.length ? recentPubs : PUBLICATIONS.slice(0, 4)} />
        <Block icon={BookOpen} title="Saved Publications" pubs={savedPubs.length ? savedPubs : []} empty="No saved publications yet." />
        <Block icon={Sparkles} title="Recommended for You" pubs={recommended} />

        <section>
          <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-bold text-[color:var(--color-icai-blue)]"><TrendingUp className="h-4 w-4" /> Activity History</h2>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Publication</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {(recentPubs.length ? recentPubs : PUBLICATIONS.slice(0, 5)).map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs text-muted-foreground">{new Date(Date.now() - i * 86400000).toLocaleString()}</TableCell>
                    <TableCell>{p.title}</TableCell>
                    <TableCell><span className="rounded bg-secondary px-2 py-0.5 text-xs">Viewed</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function Block({ icon: Icon, title, pubs, empty }: { icon: typeof Clock; title: string; pubs: typeof PUBLICATIONS; empty?: string }) {
  return (
    <section>
      <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-bold text-[color:var(--color-icai-blue)]"><Icon className="h-4 w-4" /> {title}</h2>
      {pubs.length === 0 ? (
        <div className="rounded-md border bg-white p-6 text-center text-sm text-muted-foreground">{empty}</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {pubs.slice(0, 6).map((p) => (
            <Link key={p.id} to="/publications/$id" params={{ id: p.id }}>
              <CoverThumb pub={p} />
              <div className="mt-1 line-clamp-2 text-xs font-medium">{p.title}</div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
