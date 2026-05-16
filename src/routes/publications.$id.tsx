import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Bookmark, Calendar, FileText, Tag, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoverThumb, PageShell } from "@/components/site-header";
import { getPublication, PUBLICATIONS } from "@/lib/mock";
import { getSaved, getSession, toggleSaved } from "@/lib/auth";

export const Route = createFileRoute("/publications/$id")({ component: Detail });

function Detail() {
  const { id } = Route.useParams();
  const pub = getPublication(id);
  const nav = useNavigate();
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => setSaved(getSaved()), []);

  if (!pub) {
    return <PageShell><div className="mx-auto max-w-3xl p-10 text-center">Publication not found. <Link to="/publications" className="text-[color:var(--color-icai-blue)] underline">Back</Link></div></PageShell>;
  }

  const handleRead = () => {
    if (!getSession()) {
      nav({ to: "/login", search: { next: `/reader/${pub.id}` } as never });
    } else {
      nav({ to: "/reader/$id", params: { id: pub.id } });
    }
  };

  const related = PUBLICATIONS.filter((p) => p.committee === pub.committee && p.id !== pub.id).slice(0, 4);

  return (
    <PageShell>
      <div className="border-b bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link to="/publications" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Back to publications
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-[320px_1fr]">
        <div>
          <CoverThumb pub={pub} />
          <Button onClick={handleRead} className="mt-4 w-full gap-2 bg-[color:var(--color-icai-blue)] hover:bg-[color:var(--color-icai-blue-dark)]">
            <BookOpen className="h-4 w-4" /> Read Now
          </Button>
          <Button
            variant="outline"
            onClick={() => setSaved(toggleSaved(pub.id))}
            className="mt-2 w-full gap-2"
          >
            <Bookmark className={`h-4 w-4 ${saved.includes(pub.id) ? "fill-[color:var(--color-icai-gold)] text-[color:var(--color-icai-gold)]" : ""}`} />
            {saved.includes(pub.id) ? "Saved" : "Save"}
          </Button>
        </div>

        <div>
          <Badge variant="outline" className="border-[color:var(--color-icai-gold)] text-[color:var(--color-icai-blue)]">{pub.type}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-[color:var(--color-icai-blue)]">{pub.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> {pub.committee}</span>
            <span className="inline-flex items-center gap-1"><Tag className="h-4 w-4" /> {pub.topic}</span>
            <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(pub.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
            <span className="inline-flex items-center gap-1"><FileText className="h-4 w-4" /> {pub.pages} pages</span>
          </div>

          <h2 className="mt-8 text-lg font-semibold">Synopsis</h2>
          <p className="mt-2 leading-relaxed text-foreground/80">
            {pub.synopsis} This publication covers practical scenarios, illustrative checklists, and
            references to applicable standards and regulatory pronouncements. It is intended for
            members in practice and industry.
          </p>

          <h2 className="mt-8 text-lg font-semibold">Keywords</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {pub.keywords.map((k) => <Badge key={k} variant="secondary">{k}</Badge>)}
          </div>

          {related.length > 0 && (
            <>
              <h2 className="mt-10 text-lg font-semibold">From the same committee</h2>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {related.map((p) => (
                  <Link key={p.id} to="/publications/$id" params={{ id: p.id }}>
                    <CoverThumb pub={p} />
                    <div className="mt-1 line-clamp-2 text-xs font-medium">{p.title}</div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
