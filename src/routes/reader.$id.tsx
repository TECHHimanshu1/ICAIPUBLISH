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

const loadScript = (src: string) => {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
};

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

  // --- Reader state -------------------------------------------------------
  // currentPage refers to the LEFT page of the visible spread on desktop, or
  // the visible page on mobile.
  const totalPages = pub?.pages ?? 32;
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<"fit-page" | "fit-width">("fit-page");
  const [pageInput, setPageInput] = useState("1");
  const [search, setSearch] = useState(q ?? "");
  const [isMobile, setIsMobile] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setPageInput(String(currentPage)); }, [currentPage]);

  // Prevent browser window scrollbar from causing layout reflow / shaking loops
  useEffect(() => {
    if (typeof window === "undefined") return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Stable media query to avoid window resize/scrollbar toggling feedback loop
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 767px)");
    const check = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    check(media);
    
    media.addEventListener("change", check);
    return () => media.removeEventListener("change", check);
  }, []);

  // Dynamically load jQuery and turn.js on mount
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        if (!(window as any).$) {
          await loadScript("/flipbook/jquery.js");
        }
        await loadScript("/flipbook/turn.js");
        if (active) {
          setScriptsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load flipbook scripts", err);
      }
    };
    init();
    return () => {
      active = false;
    };
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
  const stepSize = isMobile ? 1 : 2;

  const goNext = useCallback(() => {
    if (currentPage + stepSize > totalPages) return;
    setCurrentPage((p) => Math.min(totalPages, p + stepSize));
  }, [currentPage, stepSize, totalPages]);

  const goPrev = useCallback(() => {
    if (currentPage <= 1) return;
    setCurrentPage((p) => Math.max(1, p - stepSize));
  }, [currentPage, stepSize]);

  const jumpTo = (n: number) => {
    const clamped = Math.max(1, Math.min(totalPages, n));
    if (clamped !== currentPage) setCurrentPage(clamped);
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

  const pageWidth = viewMode === "fit-width" ? 460 : 380;
  const pageHeight = viewMode === "fit-width" ? 600 : 520;

  // Initialize and re-initialize turn.js when properties change
  useEffect(() => {
    if (!scriptsLoaded || !pub || !readerRef.current) return;

    const $ = (window as any).$;
    const $el = $(readerRef.current);

    if ($el.data() && $el.data().turn) {
      try {
        $el.turn("destroy");
      } catch (e) {
        console.warn("Error destroying turn.js before re-init", e);
      }
    }

    $el.turn({
      width: isMobile ? pageWidth : pageWidth * 2,
      height: pageHeight,
      display: isMobile ? "single" : "double",
      autoCenter: true,
      pages: totalPages,
      elevation: 50,
      gradients: true,
      acceleration: true,
      when: {
        turned: function (event: any, page: number, view: number[]) {
          setCurrentPage(page);
        }
      }
    });

    $el.turn("page", currentPage);

    return () => {
      if ($el.data() && $el.data().turn) {
        try {
          $el.turn("destroy");
        } catch (e) {
          console.warn("Error destroying turn.js on unmount", e);
        }
      }
    };
  }, [scriptsLoaded, isMobile, pageWidth, pageHeight, totalPages]);

  // Synchronize React state change to Turn.js page navigation
  useEffect(() => {
    if (!scriptsLoaded || !readerRef.current) return;
    const $ = (window as any).$;
    const $el = $(readerRef.current);
    if ($el.data() && $el.data().turn) {
      if ($el.turn("page") !== currentPage) {
        $el.turn("page", currentPage);
      }
    }
  }, [currentPage, scriptsLoaded]);

  // Mock search hits inside this publication
  const hits = useMemo(() => {
    if (!search.trim()) return [];
    const rng = (n: number) => Math.max(1, Math.min(totalPages, n));
    return [rng(3), rng(8), rng(15), rng(22)].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)
      .map((page) => ({ page, snippet: `…relevant excerpt mentioning “${search}” appears on page ${page}…` }));
  }, [search, totalPages]);

  if (!ready || !pub) return null;

  return (
    <div className="flex h-screen flex-col bg-[#0c1730] text-white no-select overflow-hidden">
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
          <Button size="sm" variant="secondary" onClick={goPrev} disabled={currentPage <= 1}><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="sm" variant="secondary" onClick={goNext} disabled={currentPage + stepSize > totalPages}><ChevronRight className="h-4 w-4" /></Button>
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start gap-4 px-4 py-6">
        {!scriptsLoaded ? (
          <div className="text-sm text-white/50 animate-pulse">Loading flipbook engine...</div>
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ transform: `scale(${zoom})`, transition: "transform 200ms" }}
          >
            <div ref={readerRef} className="flipbook shadow-2xl">
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <div
                    key={pageNum}
                    className="page relative select-none"
                    style={{
                      background: "linear-gradient(180deg, #fdfcf7, #f6f1e3)",
                      border: "1px solid #e6dcc2",
                      boxShadow: "inset 0 0 60px rgba(120, 90, 30, 0.05)",
                      width: pageWidth,
                      height: pageHeight
                    }}
                  >
                    <MockPage pageNum={pageNum} pub={pub} w={pageWidth} h={pageHeight} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Search hits */}
      {hits.length > 0 && (
        <div className="w-full max-w-3xl rounded-md border border-white/10 bg-[#091227] p-4 text-sm mx-auto mb-6">
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
  );
}

// ===== Page rendering =====
// Each "page" is just a styled card with a fake page layout.

function MockPage({ pageNum, pub, w, h }: { pageNum: number; pub: NonNullable<ReturnType<typeof getPublication>>; w: number; h: number }) {
  const totalPages = pub.pages ?? 24;

  if (pageNum === 1) {
    return (
      <div
        className="relative flex flex-col items-center justify-between p-12 text-white overflow-hidden shadow-inner h-full w-full select-none"
        style={{
          background: pub.cover,
        }}
      >
        {/* Premium Gold Accent Bars & Ribbon */}
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#c9a24b] via-[#e8c97a] to-[#c9a24b]" />
        
        {/* Subtle background crest / texture watermark */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

        {/* Header Section */}
        <div className="w-full text-center space-y-2 z-10 mt-4">
          <div className="rounded border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest inline-block backdrop-blur-md">
            The Institute of Chartered Accountants of India
          </div>
          <p className="text-[10px] text-white/70 uppercase tracking-widest font-medium">
            {pub.committee}
          </p>
        </div>

        {/* Title Section with decorative frame */}
        <div className="w-full text-center space-y-4 my-auto px-4 z-10">
          <div className="mx-auto w-12 h-1 bg-[#e8c97a] rounded-full" />
          <h1 className="text-xl sm:text-2xl font-bold leading-snug tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/80 drop-shadow-md">
            {pub.title}
          </h1>
          <div className="mx-auto w-12 h-1 bg-[#e8c97a] rounded-full" />
          <p className="text-xs text-[#e8c97a] font-medium tracking-wider uppercase">
            {pub.type} Edition
          </p>
        </div>

        {/* Footer Section with Seal and copyright */}
        <div className="w-full text-center space-y-3 z-10 mb-2">
          <div className="text-[9px] uppercase tracking-widest text-white/60">
            Set up by an Act of Parliament
          </div>
          <div className="text-[10px] font-semibold tracking-wider text-[#e8c97a]">
            © ICAI
          </div>
        </div>
      </div>
    );
  }

  if (pageNum === totalPages) {
    return (
      <div
        className="relative flex flex-col items-center justify-between p-12 text-white overflow-hidden shadow-inner h-full w-full select-none"
        style={{
          background: pub.cover,
          filter: "brightness(0.85)"
        }}
      >
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#c9a24b] via-[#e8c97a] to-[#c9a24b]" />
        
        {/* Back Cover Emblem / Crest */}
        <div className="my-auto text-center space-y-4 z-10 px-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-[#e8c97a] font-bold text-lg shadow-inner">
            ICAI
          </div>
          <div className="text-xs font-semibold tracking-widest text-[#e8c97a] uppercase">
            Official Publication
          </div>
          <p className="text-[10px] text-white/60 max-w-xs leading-relaxed mx-auto">
            This digital edition is protected by the Institute of Chartered Accountants of India under secure DRM.
          </p>
        </div>

        {/* Footer info */}
        <div className="w-full text-center space-y-2 z-10 mb-2">
          <div className="text-[9px] uppercase tracking-widest text-white/50">
            Institute of Chartered Accountants of India
          </div>
          <div className="text-[8px] text-white/40">
            For member use only. All rights reserved.
          </div>
        </div>
      </div>
    );
  }

  // Normal pages
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
