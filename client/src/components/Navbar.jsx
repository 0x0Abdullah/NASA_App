import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Radio } from "lucide-react";

const links = [
  { href: "#timeline", label: "Timeline" },
  { href: "#stories", label: "Stories" },
  { href: "#hangar", label: "3D Hangar" },
  { href: "#gallery", label: "Gallery" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-void/80 backdrop-blur-xl border-b border-signal/20 shadow-[0_10px_40px_-20px_rgba(79,156,255,0.5)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-5 sm:px-8 h-16 md:h-18 flex items-center justify-between">
        {/* logo */}
        <a href="#top" className="group flex items-center gap-3">
          <span className="relative grid place-items-center size-9 rounded-full border border-signal/50 bg-signal/10">
            <Radio className="size-4 text-signal group-hover:rotate-12 transition-transform" />
            <span className="absolute inset-0 rounded-full border border-signal/30 animate-ping opacity-40" />
          </span>
          <span className="font-display text-[13px] md:text-sm font-bold tracking-[0.22em] uppercase">
            Abandoned<span className="text-signal">·</span>Not Forgotten
          </span>
        </a>

        {/* desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="relative text-sm font-alt uppercase tracking-[0.18em] text-dust hover:text-lunar transition-colors group"
              >
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-signal transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#stories"
          className="hidden md:inline-flex items-center gap-2 rounded-full border border-rust/50 bg-rust/10 px-4 py-2 text-xs font-display font-semibold uppercase tracking-[0.18em] text-rust-light hover:bg-rust/20 hover:border-rust transition-all"
        >
          <span className="size-1.5 rounded-full bg-rust pulse-dot" />
          Read the stories
        </a>

        {/* mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden grid place-items-center size-10 rounded-lg border border-signal/30 text-lunar"
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="md:hidden overflow-hidden bg-void/95 backdrop-blur-xl border-t border-signal/15"
          >
            <ul className="px-6 py-5 space-y-4">
              {[...links, { href: "#stories", label: "Stories" }].map((l, i) => (
                <li key={i}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block font-alt uppercase tracking-[0.2em] text-sm text-dust hover:text-signal"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
