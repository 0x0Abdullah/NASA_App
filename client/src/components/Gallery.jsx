import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Mars, Moon, X, ZoomIn } from "lucide-react";
import { useFetch } from "../hooks/useApi.js";
import useFocusTrap from "../hooks/useFocusTrap.js";

const filters = [
  { id: "all", label: "All frames" },
  { id: "moon", label: "Moon" },
  { id: "mars", label: "Mars" },
];

const spans = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
];

export default function Gallery() {
  const [filter, setFilter] = useState("all");
  const [index, setIndex] = useState(null);
  const lightboxRef = useRef(null);
  const { data, loading, error, refetch } = useFetch("/api/gallery");
  const all = data ?? [];
  const items = all.filter((g) => filter === "all" || g.destination === filter);
  const lightboxItem = index !== null ? items[index] : null;
  useFocusTrap(lightboxRef, lightboxItem !== null);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % items.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + items.length) % items.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, items.length]);

  return (
    <section id="gallery" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.4em] text-signal mb-4">
              Chapter 04 — The gallery
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-black gradient-title">
              FRAMES FROM
              <br />
              THE ABANDONMENT
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`rounded-full border px-5 py-2 text-[11px] font-display uppercase tracking-[0.18em] transition-all ${
                  filter === f.id
                    ? "border-signal bg-signal/15 text-lunar"
                    : "border-lunar/20 text-dust hover:text-lunar hover:border-lunar/45"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[180px] gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl bg-hull/70 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-10 panel rounded-xl p-8 text-center">
            <p className="text-rust-light">Gallery offline: {error}</p>
            <button
              onClick={refetch}
              className="mt-4 rounded-full border border-signal/50 px-5 py-2 text-xs uppercase tracking-widest text-signal hover:bg-signal/10"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <motion.div
            layout
            className="mt-10 grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] sm:auto-rows-[170px] md:auto-rows-[185px] gap-3 md:gap-4"
          >
            <AnimatePresence mode="popLayout">
              {items.map((g, i) => (
                <motion.button
                  key={g.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.45, delay: i * 0.04 }}
                  onClick={() => setIndex(i)}
                  className={`group relative overflow-hidden rounded-xl border border-signal/15 hover:border-signal/50 transition-colors ${spans[i % spans.length]}`}
                >
                  <img
                    src={g.image}
                    alt={g.caption}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.style.opacity = "0.15";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-shade/95 via-shade/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                  {/* zoom badge */}
                  <span className="absolute top-3 right-3 grid place-items-center size-8 rounded-full bg-void/70 border border-signal/40 text-signal opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="size-3.5" />
                  </span>

                  <div className="absolute inset-x-3 bottom-3 text-left">
                    <div className="flex items-center gap-1.5 mb-1">
                      {g.destination === "mars" ? (
                        <Mars className="size-3 text-rust" />
                      ) : (
                        <Moon className="size-3 text-ice" />
                      )}
                      <span className="font-display text-[9px] uppercase tracking-[0.25em] text-lunar/70">
                        {g.credit}
                      </span>
                    </div>
                    <p className="text-[12px] sm:text-[13px] font-medium text-white leading-snug translate-y-1 group-hover:translate-y-0 transition-transform">
                      {g.caption}
                    </p>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-void/92 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIndex(null)}
          >
            <motion.figure
              ref={lightboxRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Image viewer: ${lightboxItem.caption}`}
              tabIndex={-1}
              initial={{ scale: 0.94, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full"
            >
              <img
                src={lightboxItem.image}
                alt={lightboxItem.caption}
                className="w-full max-h-[74vh] object-contain rounded-xl border border-signal/25"
              />
              <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-alt text-base text-lunar">{lightboxItem.caption}</p>
                  <p className="text-xs uppercase tracking-widest text-dust mt-1">
                    Credit: {lightboxItem.credit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
                    className="grid place-items-center size-10 rounded-full border border-lunar/30 text-lunar hover:border-signal hover:text-signal transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <span className="font-display text-xs text-dust tabular-nums">
                    {index + 1} / {items.length}
                  </span>
                  <button
                    onClick={() => setIndex((i) => (i + 1) % items.length)}
                    className="grid place-items-center size-10 rounded-full border border-lunar/30 text-lunar hover:border-signal hover:text-signal transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </figcaption>

              <button
                onClick={() => setIndex(null)}
                className="absolute -top-12 right-0 grid place-items-center size-10 rounded-full border border-lunar/30 text-lunar hover:text-signal hover:border-signal transition-colors"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
