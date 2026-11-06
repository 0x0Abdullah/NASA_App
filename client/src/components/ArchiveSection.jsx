import { motion } from "framer-motion";
import { Globe2, Radio } from "lucide-react";

const marqueeItems = [
  "Tranquility Base",
  "Hadley Rille",
  "Meridiani Planum",
  "Gusev Crater",
  "Ares Vallis",
  "Utopia Planitia",
  "Jezero Crater",
  "Taurus–Littrow",
  "Elysium Planitia",
  "Columbia Hills",
];

const columns = [
  {
    title: "Explore",
    links: [
      { label: "The timeline", href: "#timeline" },
      { label: "Artifact stories", href: "#stories" },
      { label: "3D hangar", href: "#hangar" },
      { label: "Gallery", href: "#gallery" },
    ],
  },
  {
    title: "Missions mentioned",
    links: [
      { label: "Apollo 11 – 17", href: "#stories" },
      { label: "Spirit & Opportunity", href: "#stories" },
      { label: "Viking 1 & 2", href: "#stories" },
      { label: "Ingenuity helicopter", href: "#stories" },
    ],
  },
];

/** Former footer content — now a standalone "archive directory" band above the footer. */
export default function ArchiveSection() {
  return (
    <section className="relative border-t border-signal/15 bg-abyss/60 backdrop-blur-sm">
      {/* marquee strip */}
      <div className="overflow-hidden border-b border-signal/15 py-3.5">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center">
              {marqueeItems.map((m) => (
                <span key={dup + m} className="flex items-center gap-6 px-6">
                  <span className="font-display text-[11px] uppercase tracking-[0.3em] text-dust whitespace-nowrap">
                    {m}
                  </span>
                  <span className="size-1 rounded-full bg-rust" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* brand */}
          <div>
            <a href="#top" className="flex items-center gap-3">
              <span className="grid place-items-center size-10 rounded-full border border-signal/50 bg-signal/10">
                <Radio className="size-4 text-signal" />
              </span>
              <span className="font-display text-sm font-bold tracking-[0.2em] uppercase">
                Abandoned<span className="text-signal">·</span>Not Forgotten
              </span>
            </a>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-dust">
              A storytelling archive of NASA's discarded equipment on the Moon and Mars — landers
              covered in red dust, rovers frozen mid-trail, footprints with no expiration date.
              Silent machines still doing their job: remembering us.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-signal/35 bg-signal/10 px-3.5 py-1.5 text-[10px] font-display uppercase tracking-[0.2em] text-ice">
                <span className="size-1.5 rounded-full bg-ice pulse-dot" />
                9+ signals still silent
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-rust/35 bg-rust/10 px-3.5 py-1.5 text-[10px] font-display uppercase tracking-[0.2em] text-rust-light">
                <Globe2 className="size-3" />
                2 worlds
              </span>
            </div>
          </div>

          {/* link columns */}
          {columns.map((c) => (
            <div key={c.title}>
              <h4 className="font-display text-[11px] uppercase tracking-[0.3em] text-signal">
                {c.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="group inline-flex items-center gap-2 text-sm text-dust hover:text-white transition-colors"
                    >
                      <span className="h-px w-3 bg-lunar/30 group-hover:w-5 group-hover:bg-signal transition-all" />
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* credits */}
        <div className="mt-12 pt-6 border-t border-signal/12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-dust leading-relaxed">
            Imagery courtesy of NASA — public domain. Facts drawn from official mission archives.
            Built with React + Vite + Three.js, powered by a Node.js API.
          </p>
          <a
            href="https://www.nasa.gov"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs text-dust hover:text-signal transition-colors"
          >
            <Globe2 className="size-3.5" />
            nasa.gov
          </a>
        </div>
      </div>
    </section>
  );
}
