import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Globe2, MapPin, Mars, Moon, Search, X } from "lucide-react";
import { useFetch } from "../hooks/useApi.js";

const statusMeta = {
  silent: { label: "Signal lost", cls: "bg-dust/15 text-dust border-dust/40" },
  parked: { label: "Parked forever", cls: "bg-ice/10 text-ice border-ice/40" },
  preserved: { label: "Preserved", cls: "bg-marsgold/10 text-marsgold border-marsgold/40" },
  grounded: { label: "Grounded", cls: "bg-signal/15 text-signal border-signal/40" },
  entombed: { label: "Entombed", cls: "bg-ice/10 text-ice border-ice/40" },
  cached: { label: "Cached for pickup", cls: "bg-marsgold/10 text-marsgold border-marsgold/40" },
  lost: { label: "Never found", cls: "bg-rust/15 text-rust-light border-rust/40" },
};

function StoryModal({ story, onClose, onNav }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onNav]);

  const status = statusMeta[story.destination === "mars" ? "silent" : "parked"];
  const sMeta = statusMeta[story.status] ?? status;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-void/85 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.article
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto panel rounded-2xl"
      >
        {/* header image */}
        <div className="relative h-52 sm:h-64 overflow-hidden rounded-t-2xl">
          <img
            src={story.image}
            alt={story.name}
            className="size-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/40 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-signal/20 border border-signal/40 px-3 py-1 text-[10px] font-display uppercase tracking-widest text-ice">
                {story.year}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-display uppercase tracking-widest ${sMeta.cls}`}
              >
                {sMeta.label}
              </span>
            </div>
            <h3 className="mt-2 font-display text-2xl sm:text-3xl font-black text-white">
              {story.name}
            </h3>
            <p className="text-sm text-dust font-alt">{story.aka}</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 grid place-items-center size-9 rounded-full bg-void/70 border border-lunar/30 text-lunar hover:text-white hover:border-signal transition-colors"
            aria-label="Close story"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* body */}
        <div className="p-5 sm:p-8">
          <p className="font-alt text-lg sm:text-xl italic text-ice leading-snug">{story.tagline}</p>

          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-dust">
            {story.story.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* facts */}
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {story.facts.map((f) => (
              <div key={f.k} className="rounded-xl bg-hull/80 border border-signal/15 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-dust font-display">
                  {f.k}
                </p>
                <p className="mt-1.5 font-display text-sm font-bold text-white">{f.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-signal/15">
            <p className="inline-flex items-center gap-2 text-xs text-dust">
              <MapPin className="size-3.5 text-rust" />
              {story.coordinates}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onNav(-1)}
                className="rounded-full border border-lunar/25 px-4 py-2 text-[11px] font-display uppercase tracking-widest text-dust hover:text-white hover:border-signal transition-all"
              >
                ← Prev
              </button>
              <button
                onClick={() => onNav(1)}
                className="rounded-full border border-lunar/25 px-4 py-2 text-[11px] font-display uppercase tracking-widest text-dust hover:text-white hover:border-signal transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

export default function Stories() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const { data, loading, error, refetch } = useFetch("/api/stories");
  const all = data ?? [];

  const q = query.trim().toLowerCase();
  const filtered = all.filter((s) => {
    const byTab = tab === "all" || s.destination === tab;
    const byQuery =
      !q ||
      [s.name, s.aka, s.tagline, s.year, s.coordinates, s.destination]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    return byTab && byQuery;
  });
  const openStory = all.find((s) => s.id === openId) ?? null;

  const navigate = (dir) => {
    if (!openStory) return;
    const pool = filtered.length ? filtered : all;
    const idx = pool.findIndex((s) => s.id === openStory.id);
    const next = pool[(idx + dir + pool.length) % pool.length];
    setOpenId(next.id);
  };

  return (
    <section id="stories" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-2xl">
            <p className="font-display text-xs uppercase tracking-[0.4em] text-rust mb-4">
              Chapter 02 — The artifacts
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-black gradient-title-mars leading-[1.05]">
              EVERY MACHINE
              <br />
              HAS A LAST DAY
            </h2>
            <p className="mt-6 text-dust leading-relaxed">
              {all.length ? `${all.length} stories` : "Stories"} from two worlds. Pick a planet, open
              a card, and read what happened the day each machine went quiet.
            </p>
          </div>

          {/* tabs + search */}
          <div className="flex w-full flex-col items-start gap-3 lg:w-auto lg:items-end">
            <div className="inline-flex rounded-full border border-lunar/20 bg-hull/60 p-1.5 backdrop-blur">
              {[
                { id: "all", label: "All", icon: Globe2 },
                { id: "moon", label: "Moon", icon: Moon },
                { id: "mars", label: "Mars", icon: Mars },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-pressed={tab === t.id}
                  className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-display uppercase tracking-[0.2em] transition-colors ${
                    tab === t.id ? "text-void" : "text-dust hover:text-white"
                  }`}
                >
                  {tab === t.id && (
                    <motion.span
                      layoutId="story-tab"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-signal to-ice"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <t.icon className="relative size-3.5" />
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>

            <label className="relative block w-full lg:w-72">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-dust"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stories…"
                aria-label="Search stories"
                className="w-full rounded-full border border-lunar/20 bg-hull/60 py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-dust/70 outline-none backdrop-blur transition-colors focus:border-signal/60"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dust transition-colors hover:text-white"
                >
                  <X className="size-4" />
                </button>
              )}
            </label>
          </div>
        </div>

        {/* states */}
        {loading && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-hull/70 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-12 panel rounded-xl p-8 text-center">
            <p className="text-rust-light">Stories could not be loaded: {error}</p>
            <button
              onClick={refetch}
              className="mt-4 rounded-full border border-signal/50 px-5 py-2 text-xs uppercase tracking-widest text-signal hover:bg-signal/10"
            >
              Retry
            </button>
          </div>
        )}

        {/* grid */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="mt-10 font-display text-[11px] uppercase tracking-[0.25em] text-dust">
              Showing {filtered.length} of {all.length} stories
              {q ? ` · matching “${query.trim()}”` : ""}
            </p>
          <motion.div
            layout
            className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((s, i) => {
                const st = statusMeta[s.status] ?? statusMeta.silent;
                return (
                  <motion.button
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    onClick={() => setOpenId(s.id)}
                    className="group text-left panel panel-hover hud-corners rounded-2xl overflow-hidden"
                  >
                    {/* image */}
                    <div className="relative h-48 overflow-hidden bg-hull">
                      <img
                        src={s.image}
                        alt={s.name}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.style.opacity = "0";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/25 to-transparent" />
                      <span className="absolute top-3 left-3 rounded-full bg-void/75 border border-signal/40 px-3 py-1 text-[10px] font-display tracking-widest text-ice">
                        {s.year}
                      </span>
                      <span
                        className={`absolute top-3 right-3 rounded-full border px-2.5 py-1 text-[9px] font-display uppercase tracking-widest backdrop-blur ${st.cls}`}
                      >
                        {st.label}
                      </span>
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-lunar/80">
                        {s.destination === "mars" ? (
                          <Mars className="size-3 text-rust" />
                        ) : (
                          <Moon className="size-3 text-ice" />
                        )}
                        {s.destination === "mars" ? "Mars" : "Moon"}
                      </span>
                    </div>

                    {/* body */}
                    <div className="p-5">
                      <p className="font-display text-[10px] uppercase tracking-[0.25em] text-dust">
                        {s.aka}
                      </p>
                      <h3 className="mt-2 font-alt text-xl font-semibold text-white group-hover:text-ice transition-colors">
                        {s.name}
                      </h3>
                      <p className="mt-2 text-sm text-dust leading-relaxed">{s.tagline}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-display uppercase tracking-[0.2em] text-signal">
                        Read the story
                        <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </motion.div>
          </>
        )}

        {/* no results */}
        {!loading && !error && filtered.length === 0 && (
          <div className="mt-12 panel rounded-xl p-10 text-center">
            <p className="font-display text-sm uppercase tracking-[0.25em] text-white">
              No signals match {q ? `“${query.trim()}”` : "this filter"}
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-dust">
              Nothing in the archive answers to that name — try another word, or reset the filters.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setTab("all");
              }}
              className="mt-5 rounded-full border border-signal/50 px-5 py-2 text-xs uppercase tracking-widest text-signal transition-colors hover:bg-signal/10"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* modal */}
      <AnimatePresence>
        {openStory && (
          <StoryModal story={openStory} onClose={() => setOpenId(null)} onNav={navigate} />
        )}
      </AnimatePresence>
    </section>
  );
}
