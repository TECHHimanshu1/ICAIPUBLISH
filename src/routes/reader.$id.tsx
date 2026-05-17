import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Maximize2, Search as SearchIcon,
  Shield, ZoomIn, ZoomOut, AlignJustify, AlignHorizontalSpaceAround,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getPublication } from "@/lib/mock";
import { getSession, trackView } from "@/lib/auth";
import { toast } from "sonner";

type S = { q?: string };
export const Route = createFileRoute("/reader/$id")({
  validateSearch: (s): S => ({ q: s.q as string | undefined }),
  component: Reader,
});

function Reader() {
  const { id } = Route.useParams();
  const { q } = Route.useSearch();
  const nav = useNavigate();
  const pub = getPublication(id);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!getSession()) { nav({ to: "/login", search: { next: `/reader/${id}` } as never }); return; }
    if (pub) trackView(pub.id);
    setReady(true);
  }, [id, pub, nav]);

  // --- Flipbook state -------------------------------------------------------
  // currentPage refers to the LEFT page of the visible spread on desktop, or
  // the visible page on mobile. We animate by toggling .is-flipping on the
  // outgoing page, then advance on transitionend.
  const totalPages = pub?.pages ?? 32;
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipActive, setFlipActive] = useState(false);

  // When a flip starts, the overlay mounts WITHOUT `.is-flipping` so the
  // browser records a starting transform of rotateY(0). On the next frame
  // we add the class, which transitions to rotateY(±180deg) — that's what
  // makes the page actually turn instead of snapping.
  useEffect(() => {
    if (!isFlipping) { setFlipActive(false); return; }
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => setFlipActive(true));
      (window as any).__flipRaf = r2;
    });
    return () => cancelAnimationFrame(r1);
  }, [isFlipping]);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<"fit-page" | "fit-width">("fit-page");
  const [pageInput, setPageInput] = useState("1");
  const [search, setSearch] = useState(q ?? "");
  const [isMobile, setIsMobile] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setPageInput(String(currentPage)); }, [currentPage]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ===== DRM-ish protections (demo only) =====
  useEffect(() => {
    const el = readerRef.current;
    if (!el) return;
    const stopCtx = (e: MouseEvent) => { e.preventDefault(); toast.warning("Right-click is disabled in protected reader mode."); };
    const stopKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["p", "s", "c"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        toast.warning("Printing, saving and copying are disabled in protected reader mode.");
      }
      if (e.key === "PrintScreen") {
        e.preventDefault();
        toast.warning("Screen capture is discouraged in protected reader mode.");
      }
    };
    el.addEventListener("contextmenu", stopCtx);
    window.addEventListener("keydown", stopKey);
    return () => { el.removeEventListener("contextmenu", stopCtx); window.removeEventListener("keydown", stopKey); };
  }, [ready]);

  // ===== Page-turn logic =====
  // Step on Next: 1) lock 2) set direction & flip class 3) wait for transitionend
  // 4) increment currentPage and clear flipping state.
  const stepSize = isMobile ? 1 : 2;
  const targetPage = direction === "next"
    ? Math.min(totalPages, currentPage + stepSize)
    : direction === "prev"
      ? Math.max(1, currentPage - stepSize)
      : currentPage;

  const goNext = useCallback(() => {
    if (isFlipping) return;
    if (currentPage + stepSize > totalPages) return;
    setDirection("next");
    setIsFlipping(true);
    window.setTimeout(() => {
      setCurrentPage((p) => Math.min(totalPages, p + stepSize));
      setIsFlipping(false);
      setDirection(null);
    }, 880);
  }, [currentPage, isFlipping, stepSize, totalPages]);

  const goPrev = useCallback(() => {
    if (isFlipping) return;
    if (currentPage <= 1) return;
    setDirection("prev");
    setIsFlipping(true);
    window.setTimeout(() => {
      setCurrentPage((p) => Math.max(1, p - stepSize));
      setIsFlipping(false);
      setDirection(null);
    }, 880);
  }, [currentPage, isFlipping, stepSize]);

  const jumpTo = (n: number) => {
    const clamped = Math.max(1, Math.min(totalPages, n));
    if (clamped !== currentPage && !isFlipping) setCurrentPage(clamped);
  };

  // Keyboard arrows
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev]);

  // Mock search hits inside this publication
  const hits = useMemo(() => {
    if (!search.trim()) return [];
    const rng = (n: number) => Math.max(1, Math.min(totalPages, n));
    return [rng(3), rng(8), rng(15), rng(22)].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)
      .map((page) => ({ page, snippet: `…relevant excerpt mentioning “${search}” appears on page ${page}…` }));
  }, [search, totalPages]);

  if (!ready || !pub) return null;

  const pageWidth = viewMode === "fit-width" ? 460 : 380;
  const pageHeight = viewMode === "fit-width" ? 600 : 520;

  return (
    <div className="flex min-h-screen flex-col bg-[#0c1730] text-white no-select">
      {/* Header bar */}
      <div className="border-b border-white/10 bg-[#091227]">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link to="/publications/$id" params={{ id: pub.id }} className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white">
            <ArrowLeft className="h-3 w-3" /> Exit reader
          </Link>
          <div className="ml-3 flex-1 truncate">
            <div className="truncate text-sm font-semibold">{pub.title}</div>
            <div className="text-[10px] text-white/50">{pub.committee} · {pub.type}</div>
          </div>
          <Badge className="gap-1 bg-[color:var(--color-icai-gold)] text-[color:var(--color-icai-blue-dark)]">
            <Shield className="h-3 w-3" /> Protected Reader Mode
          </Badge>
        </div>

        {/* Toolbar */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 pb-3">
          <Button size="sm" variant="secondary" onClick={goPrev} disabled={isFlipping || currentPage <= 1}><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="sm" variant="secondary" onClick={goNext} disabled={isFlipping || currentPage + stepSize > totalPages}><ChevronRight className="h-4 w-4" /></Button>
          <div className="flex items-center gap-1 text-xs">
            <Input
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") jumpTo(Number(pageInput) || 1); }}
              className="h-8 w-14 bg-white text-foreground"
            />
            <span className="text-white/60">/ {totalPages}</span>
          </div>
          <div className="mx-2 h-5 w-px bg-white/20" />
          <Button size="sm" variant="secondary" onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
          <span className="w-10 text-center text-xs">{Math.round(zoom * 100)}%</span>
          <Button size="sm" variant="secondary" onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
          <Button size="sm" variant={viewMode === "fit-page" ? "default" : "secondary"} onClick={() => { setViewMode("fit-page"); setZoom(1); }}>
            <Maximize2 className="h-4 w-4" /><span className="ml-1 hidden sm:inline">Fit page</span>
          </Button>
          <Button size="sm" variant={viewMode === "fit-width" ? "default" : "secondary"} onClick={() => { setViewMode("fit-width"); setZoom(1); }}>
            <AlignHorizontalSpaceAround className="h-4 w-4" /><span className="ml-1 hidden sm:inline">Fit width</span>
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inside publication"
                className="h-8 w-48 bg-white pl-7 text-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mock disabled-controls notice */}
      <div className="mx-auto mt-2 max-w-7xl px-4 text-[11px] text-[color:var(--color-icai-gold-light)]/80">
        <AlignJustify className="mr-1 inline h-3 w-3" /> Printing and downloading are disabled in protected reader mode.
      </div>

      {/* Reader stage */}
      <div className="flex flex-1 flex-col items-center gap-4 px-4 py-6">
        <div
          ref={readerRef}
          className="book-scene flex items-center justify-center"
          style={{ transform: `scale(${zoom})`, transition: "transform 200ms" }}
        >
          {isMobile ? (
            <SinglePage pageNum={currentPage} targetPage={targetPage} pub={pub} isFlipping={isFlipping} flipActive={flipActive} direction={direction} w={pageWidth} h={pageHeight} />
          ) : (
            <Spread pageLeft={currentPage} pageRight={Math.min(totalPages, currentPage + 1)} targetPage={targetPage} totalPages={totalPages} pub={pub} isFlipping={isFlipping} flipActive={flipActive} direction={direction} w={pageWidth} h={pageHeight} />
          )}
        </div>

        {/* Search hits */}
        {hits.length > 0 && (
          <div className="w-full max-w-3xl rounded-md border border-white/10 bg-[#091227] p-4 text-sm">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-icai-gold-light)]">In-publication results for "{search}"</div>
            <ul className="divide-y divide-white/10">
              {hits.map((h) => (
                <li key={h.page} className="flex items-center justify-between py-2">
                  <div>
                    <span className="rounded bg-[color:var(--color-icai-gold)]/20 px-2 py-0.5 text-xs font-semibold text-[color:var(--color-icai-gold-light)]">Page {h.page}</span>
                    <span className="ml-3 text-white/80">{h.snippet}</span>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => jumpTo(h.page)}>Jump</Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Page rendering =====
// Each "page" is just a styled card with a fake page layout. The flipping
// page uses .page-flip-right / .page-flip-left with .is-flipping applied
// during the animation. transform-origin sits on the spine edge so it
// rotates like a real book page.

function MockPage({ pageNum, pub, w, h }: { pageNum: number; pub: NonNullable<ReturnType<typeof getPublication>>; w: number; h: number }) {
  return (
    <div className="relative flex flex-col" style={{ width: w, height: h }}>
      <div className="px-8 pt-8 text-[10px] uppercase tracking-widest text-[color:var(--color-icai-blue)]">
        ICAI · {pub.committee}
      </div>
      <div className="px-8 pt-2 text-xs font-semibold text-foreground/60">{pub.title}</div>
      <div className="mx-8 my-3 h-px bg-[color:var(--color-icai-gold)]/40" />
      <div className="flex-1 space-y-2 overflow-hidden px-8 text-[11px] leading-relaxed text-foreground/80">
        <p className="font-semibold text-[color:var(--color-icai-blue)]">Chapter {Math.ceil(pageNum / 4)} — Section {pageNum}</p>
        <p>
          The Institute of Chartered Accountants of India lays down the framework herein for the
          guidance of members in professional practice. The provisions discussed in this section
          should be read in conjunction with the relevant Standards on Auditing and applicable
          regulatory pronouncements.
        </p>
        <p>
          Practitioners are expected to apply professional judgment in evaluating the appropriateness
          of the procedures outlined. Illustrative checklists, sample working papers and reference
          formats are provided for guidance only and may be adapted to the specific circumstances
          of each engagement.
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Risk assessment and materiality considerations</li>
          <li>Evaluation of internal controls</li>
          <li>Documentation and review procedures</li>
          <li>Reporting requirements under applicable standards</li>
        </ul>
        <p>
          Further reading is included in the appendices to this publication. Members are encouraged
          to consult the latest pronouncements available on the official ICAI website.
        </p>
      </div>
      <div className="flex items-center justify-between px-8 pb-6 text-[10px] text-foreground/50">
        <span>© ICAI</span>
        <span>Page {pageNum}</span>
      </div>
    </div>
  );
}

function Spread({
  pageLeft, pageRight, targetPage, totalPages, pub, isFlipping, flipActive, direction, w, h,
}: { pageLeft: number; pageRight: number; targetPage: number; totalPages: number; pub: any; isFlipping: boolean; flipActive: boolean; direction: "next" | "prev" | null; w: number; h: number }) {
  const visibleLeft = isFlipping && direction ? targetPage : pageLeft;
  const visibleRight = Math.min(totalPages, visibleLeft + 1);

  return (
    <div className="book-spread relative flex shadow-2xl" style={{ width: w * 2 + 4 }}>
      <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 bg-gradient-to-r from-black/30 via-black/10 to-black/30" />
      <div className="page page-curl relative" style={{ width: w, height: h }}>
        <MockPage pageNum={visibleLeft} pub={pub} w={w} h={h} />
      </div>
      <div className="page page-curl relative" style={{ width: w, height: h }}>
        <MockPage pageNum={visibleRight} pub={pub} w={w} h={h} />
        {isFlipping && direction === "next" && (
          <div
            className={`flip-sheet page-flip-right absolute inset-0 z-10 ${flipActive ? "is-flipping" : ""}`}
            style={{ transformOrigin: "left center" }}
          >
            <div className="page flip-face flip-face-front"><MockPage pageNum={pageRight} pub={pub} w={w} h={h} /></div>
            <div className="page flip-face flip-face-back"><MockPage pageNum={targetPage} pub={pub} w={w} h={h} /></div>
          </div>
        )}
      </div>
      {isFlipping && direction === "prev" && (
        <div
          className={`flip-sheet page-flip-left absolute inset-y-0 left-0 z-10 ${flipActive ? "is-flipping" : ""}`}
          style={{ width: w, transformOrigin: "right center" }}
        >
          <div className="page flip-face flip-face-front"><MockPage pageNum={pageLeft} pub={pub} w={w} h={h} /></div>
          <div className="page flip-face flip-face-back"><MockPage pageNum={Math.min(totalPages, targetPage + 1)} pub={pub} w={w} h={h} /></div>
        </div>
      )}
    </div>
  );
}

function SinglePage({ pageNum, pub, isFlipping, flipActive, direction, w, h }: { pageNum: number; pub: any; isFlipping: boolean; flipActive: boolean; direction: "next" | "prev" | null; w: number; h: number }) {
  return (
    <div className="relative shadow-2xl" style={{ width: w, height: h }}>
      <div className="page page-curl relative h-full w-full">
        <MockPage pageNum={pageNum} pub={pub} w={w} h={h} />
      </div>
      {isFlipping && (
        <div
          className={`page absolute inset-0 z-10 ${direction === "next" ? "page-flip-right" : "page-flip-left"} ${flipActive ? "is-flipping" : ""}`}
          style={{ transformOrigin: direction === "next" ? "left center" : "right center" }}
        >
          <MockPage pageNum={pageNum} pub={pub} w={w} h={h} />
        </div>
      )}
    </div>
  );
}
