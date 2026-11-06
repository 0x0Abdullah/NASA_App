import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe2, Mars, Moon, Satellite } from "lucide-react";
import { useFetch } from "../hooks/useApi.js";

const filters = [
  { id: "all", label: "All missions", icon: Satellite },
  { id: "moon", label: "The Moon", icon: Moon },
  { id: "mars", label: "Mars", icon: Mars },
];

const statusMeta = {
  silent: { label: "Signal lost", cls: "text-dust border-dust/40" },
  lost: { label: "Never found", cls: "text-rust-light border-rust/50" },
  parked: { label: "Parked forever", cls: "text-ice border-ice/40" },
  preserved: { label: "Preserved", cls: "text-marsgold border-marsgold/40" },
  grounded: { label: "Grounded", cls: "text-signal border-signal/50" },
  entombed: { label: "Entombed", cls: "text-ice border-ice/40" },
  cached: { label: "Cached for pickup", cls: "text-marsgold border-marsgold/50" },
};

const fallbackTimeline = [];

export default function Timeline() {
  const [filter, setFilter] = useState("all");
  const { data, loading, error, refetch } = useFetch("/api/timeline");
  const items = (data ?? fallbackTimeline).filter(
    (t) => filter === "all" || t.destination === filter
  );

  return (
    <section id="timeline" className="relative py-24 md:py-32 overflow-hidden">
      {/* decorative orbit ring */}
      <div className="pointer-events-none absolute -right-40 top-24 size-[520px] rounded-full border border-signal/10 hidden lg:block" />
      <div className="pointer-events-none absolute -right-24 top-52 size-[360px] rounded-full border border-rust/10 hidden lg:block" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-signal mb-4">
            Chapter 01 — The timeline of things we left behind
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-black gradient-title leading-[1.05]">
            A HISTORY WRITTEN
            <br />
            IN SILENT MACHINES
          </h2>
          <p className="mt-6 text-dust leading-relaxed">
            Every entry marks a moment a machine stopped talking — or was never meant to come home.
            Filter the archive by world.
          </p>
        </div>

        {/* filters */}
        <div className="mt-10 flex flex-wrap gap-3">
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-display uppercase tracking-[0.18em] transition-all duration-300 ${
                  active
                    ? "border-signal bg-signal/15 text-white shadow-[0_0_30px_-8px_rgba(79,156,255,0.9)]"
                    : "border-lunar/20 text-dust hover:border-lunar/50 hover:text-white"
                }`}
              >
                <f.icon className="size-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* state handling */}
        {loading && (
          <div className="mt-14 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-hull/70 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-14 panel rounded-xl p-8 text-center">
            <p className="text-rust-light font-medium">Timeline signal lost: {error}</p>
            <button
              onClick={refetch}
              className="mt-4 rounded-full border border-signal/50 px-5 py-2 text-xs uppercase tracking-widest text-signal hover:bg-signal/10"
            >
              Retry connection
            </button>
          </div>
        )}

        {/* timeline */}
        {!loading && !error && (
          <div className="relative mt-14">
            {/* center rail */}
            <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-signal/60 via-signal/20 to-transparent" />

            <ul className="space-y-6 md:space-y-0">
              <AnimatePresence mode="popLayout">
                {items.map((t, i) => {
                  const left = i % 2 === 0;
                  const isMars = t.destination === "mars";
                  const status = statusMeta[t.status] ?? statusMeta.silent;
                  return (
                    <motion.li
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 40, scale: 0.97 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                      className={`relative md:flex md:gap-10 md:pb-12 ${
                        left ? "md:flex-row" : "md:flex-row-reverse"
                      }`}
                    >
                      {/* node dot */}
                      <span
                        className={`absolute left-4 md:left-1/2 top-6 -translate-x-1/2 size-3.5 rounded-full border-2 ${
                          isMars
                            ? "border-rust bg-rust shadow-[0_0_18px_rgba(200,114,74,0.9)]"
                            : "border-signal bg-signal shadow-[0_0_18px_rgba(79,156,255,0.9)]"
                        }`}
                      />

                      <div
                        className={`pl-12 md:pl-0 md:w-1/2 ${
                          left ? "md:pr-12 md:text-right" : "md:pl-12"
                        }`}
                      >
                        <div className="panel panel-hover hud-corners rounded-xl p-5 md:p-6">
                          <div
                            className={`flex flex-wrap items-center gap-3 mb-3 ${
                              left ? "md:justify-end" : ""
                            }`}
                          >
                            <span className="font-display text-2xl font-black text-white tracking-wider">
                              {t.year}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-display uppercase tracking-widest ${status.cls}`}
                            >
                              {status.label}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-dust">
                              {isMars ? <Mars className="size-3" /> : <Moon className="size-3" />}
                              {isMars ? "Mars" : "Moon"}
                            </span>
                          </div>
                          <h3 className="font-alt text-lg md:text-xl font-semibold text-white">
                            {t.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-dust">{t.summary}</p>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            {items.length === 0 && (
              <p className="pl-12 text-dust">No entries for this world.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
