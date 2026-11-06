import { motion } from "framer-motion";
import { ArrowDown, Moon, Rocket } from "lucide-react";
import SpaceScene from "../three/SpaceScene.jsx";

const letterContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.35 } },
};
const letter = {
  hidden: { opacity: 0, y: 44, rotateX: -70 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: "spring", stiffness: 90, damping: 14 },
  },
};

function AnimatedWord({ text, className }) {
  const words = text.split(" ");
  return (
    <motion.span variants={letterContainer} initial="hidden" animate="show" className="inline-block">
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split("").map((ch, i) => (
            <motion.span key={i} variants={letter} className="inline-block">
              {ch}
            </motion.span>
          ))}
          {wi < words.length - 1 && (
            <motion.span variants={letter} className="inline-block">
              &nbsp;
            </motion.span>
          )}
        </span>
      ))}
    </motion.span>
  );
}

const chips = [
  { icon: Moon, label: "6 lunar modules", sub: "left on the Moon" },
  { icon: Rocket, label: "9+ silent machines", sub: "resting on Mars" },
];

export default function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* 3D background */}
      <div className="absolute inset-0 z-0">
        <SpaceScene />
      </div>

      {/* cinematic vignette */}
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(3,4,10,0.85)_100%)]" />

      {/* content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="flex items-center gap-3 mb-7"
        >
          <span className="h-px w-10 bg-signal/70" />
          <span className="font-display text-[11px] md:text-xs uppercase tracking-[0.4em] text-signal">
            Deep Space Archive — Transmission 001
          </span>
        </motion.div>

        <h1 className="font-display font-black leading-[0.95] tracking-tight text-[10.5vw] sm:text-[9.5vw] md:text-[8.5vw] lg:text-[7rem] xl:text-[7.4rem]">
          <span className="block gradient-title text-glow-signal">
            <AnimatedWord text="ABANDONED" />
          </span>
          <span className="block gradient-title-mars text-glow-rust mt-1 md:mt-3">
            <AnimatedWord text="BUT NOT FORGOTTEN" />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.15 }}
          className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-dust"
        >
          Across two worlds, machines stand exactly where they stopped working — landers covered in
          dust, rovers frozen mid-trail, a helicopter with a broken wing. This is the storytelling
          archive of{" "}
          <span className="text-white font-medium">NASA's discarded hardware on the Moon and Mars</span>{" "}
          and the missions that never came to pick them up.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.35 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#timeline"
            className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-signal to-[#7fc0ff] px-7 py-3.5 font-display text-sm font-bold uppercase tracking-[0.16em] text-void hover:shadow-[0_0_45px_-6px_rgba(79,156,255,0.8)] transition-all duration-300"
          >
            Begin the story
            <ArrowDown className="size-4 group-hover:translate-y-1 transition-transform" />
          </a>
          <a
            href="#hangar"
            className="inline-flex items-center gap-3 rounded-full border border-lunar/25 px-7 py-3.5 font-display text-sm font-bold uppercase tracking-[0.16em] text-lunar hover:border-lunar/60 hover:bg-white/5 transition-all"
          >
            Enter the 3D hangar
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="mt-12 flex flex-wrap gap-4"
        >
          {chips.map((c) => (
            <div
              key={c.label}
              className="panel hud-corners flex items-center gap-3 rounded-xl px-4 py-3"
            >
              <c.icon className="size-5 text-ice" />
              <div className="leading-tight">
                <p className="font-display text-sm font-semibold text-white">{c.label}</p>
                <p className="text-xs text-dust">{c.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* scroll indicator */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        <span className="font-display text-[10px] uppercase tracking-[0.35em] text-dust">Scroll</span>
        <span className="scroll-line h-12 w-px bg-gradient-to-b from-signal to-transparent" />
      </div>
    </section>
  );
}
