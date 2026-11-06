import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useFetch, useInViewOnce } from "../hooks/useApi.js";

function Counter({ value, suffix, duration = 1800 }) {
  const [n, setN] = useState(0);
  const [ref, inView] = useInViewOnce();
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

const fallbackStats = [
  { value: 6, suffix: "", label: "Lunar Modules left on the Moon", sub: "1969 – 1972" },
  { value: 3, suffix: "", label: "Lunar rovers parked forever", sub: "Apollo 15, 16, 17" },
  { value: 9, suffix: "+", label: "Silent machines on Mars", sub: "still resting there today" },
  { value: 5352, suffix: "", label: "Sols Opportunity drove", sub: "far beyond her 90-sol plan" },
  { value: 45, suffix: " km", label: "Distance Oppy travelled", sub: "across Meridiani Planum" },
  { value: 72, suffix: "", label: "Flights of helicopter Ingenuity", sub: "first aircraft on another world" },
];

export default function Stats() {
  const { data, loading } = useFetch("/api/stats");
  const stats = data ?? fallbackStats;

  return (
    <section className="relative py-16 md:py-20 border-y border-signal/12 bg-abyss/50 backdrop-blur-sm grid-lines">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-baseline justify-between gap-6 mb-10">
          <h2 className="font-display text-xs md:text-sm uppercase tracking-[0.35em] text-signal">
            // Cold numbers, warm stories
          </h2>
          <span className="hidden md:block h-px flex-1 bg-gradient-to-r from-signal/40 to-transparent" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="panel panel-hover hud-corners rounded-xl p-4 md:p-5"
            >
              <p className="font-display text-3xl md:text-[2.4rem] font-black gradient-title leading-none">
                {loading ? "—" : <Counter value={s.value} suffix={s.suffix} />}
              </p>
              <p className="mt-3 text-[13px] font-medium text-white/90 leading-snug">{s.label}</p>
              <p className="mt-1 text-[11px] text-dust font-alt uppercase tracking-wider">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
