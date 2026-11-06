import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function QuoteSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.45, 0.6, 1], [0.15, 1, 1, 0.15]);

  return (
    <section
      ref={ref}
      className="relative py-28 md:py-40 overflow-hidden border-y border-signal/12"
    >
      {/* parallax dust layer */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(79,156,255,0.15),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(200,114,74,0.15),transparent_55%)]"
      />
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />

      <div className="mx-auto max-w-5xl px-6 text-center">
        <motion.blockquote style={{ opacity }}>
          <p className="font-display text-2xl sm:text-4xl md:text-5xl font-black leading-tight text-white text-glow-signal">
            “No wind will ever erase these tracks.
            <br className="hidden sm:block" /> No rain will ever wash them away.”
          </p>
          <footer className="mt-8 flex items-center justify-center gap-4 text-dust">
            <span className="h-px w-10 bg-signal/60" />
            <span className="font-alt text-sm uppercase tracking-[0.3em]">
              The Moon keeps every footprint
            </span>
            <span className="h-px w-10 bg-signal/60" />
          </footer>
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-10 max-w-2xl text-sm md:text-base leading-relaxed text-dust"
        >
          With no atmosphere and no weather, everything Apollo left behind — hammers, cameras,
          bootprints, two golf balls — will still be there when the last city on Earth is dust.
          Abandoned is not the same as gone.
        </motion.p>
      </div>
    </section>
  );
}
