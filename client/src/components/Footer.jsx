import { motion } from "framer-motion";
import { ArrowUp, Github, ImageOff, Mail, MapPin, Phone, Send } from "lucide-react";
import { contact, creators, creatorsIntro } from "../data/creators.js";

const socialIcons = { github: Github, email: Mail, phone: Phone, web: Send, x: Send, instagram: Send };

function Avatar({ src, name }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="size-20 rounded-full object-cover border-2 border-signal/50"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }
  // empty placeholder — ready for a photo later
  return (
    <div
      className="grid size-20 place-items-center rounded-full border-2 border-dashed border-lunar/30 bg-hull/60 text-dust"
      title="Avatar placeholder — add your photo later"
    >
      <ImageOff className="size-6 opacity-60" />
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative border-t border-signal/15 bg-void/80">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        {/* ---------- creators intro + cards ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <p className="font-display text-xs uppercase tracking-[0.4em] text-signal">
            {creatorsIntro.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-black gradient-title">
            {creatorsIntro.title}
          </h2>
          <p className="mt-5 max-w-3xl text-sm md:text-base leading-relaxed text-dust">
            {creatorsIntro.body}
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {creators.map((c, i) => (
              <motion.article
                key={c.id}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="panel panel-hover hud-corners rounded-2xl p-6"
              >
                <div className="flex items-center gap-4">
                  <Avatar src={c.avatar} name={c.name} />
                  <div>
                    <h3 className="font-alt text-lg font-semibold text-white">{c.name}</h3>
                    <p className="mt-0.5 font-display text-[10px] uppercase tracking-[0.22em] text-ice">
                      {c.role}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-dust">{c.bio}</p>
                <div className="mt-5 flex items-center gap-2 pt-4 border-t border-signal/12">
                  {Object.entries(c.links).map(([key, href]) => {
                    const Icon = socialIcons[key] ?? Send;
                    return (
                      <a
                        key={key}
                        href={href}
                        aria-label={key}
                        title={c.raw?.[key] ?? key}
                        className="grid size-9 place-items-center rounded-lg border border-lunar/20 text-dust hover:text-white hover:border-signal transition-colors"
                      >
                        <Icon className="size-4" />
                      </a>
                    );
                  })}
                  <span className="ml-auto text-[11px] text-dust font-alt tracking-wide">
                    {c.raw?.email}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>

        {/* ---------- contact us ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-14 panel hud-corners rounded-2xl p-6 sm:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.4em] text-rust">
                <span className="size-1.5 rounded-full bg-rust pulse-dot" />
                {contact.title}
              </p>
              <p className="mt-4 max-w-xl text-sm md:text-base leading-relaxed text-dust">
                {contact.blurb}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {creators.map((c) => (
                  <a
                    key={c.id}
                    href={c.links.email}
                    className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-signal to-[#7fc0ff] px-5 py-3 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-void hover:shadow-[0_0_40px_-8px_rgba(79,156,255,0.9)] transition-all"
                  >
                    <Mail className="size-4" />
                    {c.raw.email}
                  </a>
                ))}
                {creators.map((c) => (
                  <a
                    key={c.id + "-phone"}
                    href={c.links.phone}
                    className="group inline-flex items-center gap-2.5 rounded-full border border-lunar/25 px-5 py-3 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-lunar hover:text-white hover:border-signal transition-all"
                  >
                    <Phone className="size-4 text-ice" />
                    {c.raw.phone}
                  </a>
                ))}
                <span className="inline-flex items-center gap-2 text-xs text-dust">
                  <MapPin className="size-3.5 text-rust" />
                  {contact.location}
                </span>
              </div>
            </div>

            {/* social channels */}
            <div className="flex flex-wrap gap-2.5">
              {contact.socials.map((s) => {
                const Icon = socialIcons[s.id] ?? Send;
                return (
                  <a
                    key={s.id}
                    href={s.href}
                    className="group inline-flex items-center gap-2 rounded-xl border border-lunar/20 bg-hull/60 px-4 py-3 text-xs font-display uppercase tracking-[0.16em] text-dust hover:text-white hover:border-signal transition-all"
                  >
                    <Icon className="size-4 text-signal" />
                    {s.label}
                  </a>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ---------- bottom bar ---------- */}
        <div className="mt-12 pt-6 border-t border-signal/12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-dust">
            © {new Date().getFullYear()} Abandoned · Not Forgotten — a tribute to NASA's
            far-flung hardware.
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1.5 text-[10px] font-display uppercase tracking-[0.2em] text-ice">
              <span className="size-1.5 rounded-full bg-ice pulse-dot" />
              End of transmission
            </span>
            <a
              href="#top"
              className="group inline-flex items-center gap-2 rounded-full border border-lunar/25 px-4 py-2 text-[11px] font-display uppercase tracking-[0.2em] text-dust hover:text-white hover:border-signal transition-all"
            >
              Back to top
              <ArrowUp className="size-3.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
