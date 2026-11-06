import { Suspense, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Float, Grid, OrbitControls } from "@react-three/drei";
import { Mars, Moon, RotateCw } from "lucide-react";
import { Helicopter, LunarModule, MarsRover } from "../three/models.jsx";

const exhibits = [
  {
    id: "lm",
    label: "Lunar Module",
    icon: Moon,
    world: "The Moon",
    accent: "signal",
    blurb:
      "Half a machine: the descent stage is the platform every Apollo crew launched from, and every Apollo crew left behind. The ascent stage rode home — this part did not.",
    specs: [
      { k: "Left behind", v: "6 descent stages" },
      { k: "Material", v: "Gold foil & aluminum" },
      { k: "First one", v: "Eagle, July 1969" },
    ],
  },
  {
    id: "rover",
    label: "Mars Rover",
    icon: Mars,
    world: "Mars",
    accent: "rust",
    blurb:
      "Six aluminum wheels on a rocker-bogie suspension, a camera mast like a raised head, and a solar deck that outlived its warranty by 14 years. Spirit and Opportunity are still parked on Mars.",
    specs: [
      { k: "Mass", v: "174 kg (MER)" },
      { k: "Wheels", v: "6, anodized aluminum" },
      { k: "Longest drive", v: "45.16 km (Oppy)" },
    ],
  },
  {
    id: "heli",
    label: "Mars Helicopter",
    icon: RotateCw,
    world: "Mars",
    accent: "ice",
    blurb:
      "To fly where the air is 1% as thick as Earth's, Ingenuity needed rotors spinning at 2,500 rpm — and a blade that finally broke on flight 72, ending the first aviation program on another planet.",
    specs: [
      { k: "Mass", v: "1.8 kg" },
      { k: "Flights", v: "72 (planned: 5)" },
      { k: "Status", v: "Grounded, still online" },
    ],
  },
];

function Exhibit({ id }) {
  if (id === "lm")
    return (
      <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.7}>
        <LunarModule scale={1.15} />
      </Float>
    );
  if (id === "rover")
    return (
      <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.5}>
        <MarsRover scale={1.2} />
      </Float>
    );
  return (
    <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.9}>
      <Helicopter scale={1.5} />
    </Float>
  );
}

export default function ModelHangar() {
  const [active, setActive] = useState("lm");
  const current = exhibits.find((e) => e.id === active);

  return (
    <section id="hangar" className="relative py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-ice mb-4">
            Chapter 03 — The 3D hangar
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-black gradient-title leading-[1.05]">
            INSPECT THE
            <br />
            MACHINES UP CLOSE
          </h2>
          <p className="mt-6 text-dust leading-relaxed">
            Interactive reconstructions of the hardware we abandoned. Drag to orbit, scroll to zoom —
            these models are built in real time in your browser.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-[340px_1fr] gap-6">
          {/* control panel */}
          <div className="order-2 lg:order-1 panel rounded-2xl p-5 sm:p-6 h-fit">
            <div className="flex flex-col gap-2.5">
              {exhibits.map((e) => {
                const on = e.id === active;
                return (
                  <button
                    key={e.id}
                    onClick={() => setActive(e.id)}
                    className={`group flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-300 ${
                      on
                        ? "border-signal bg-signal/12 shadow-[0_0_30px_-10px_rgba(79,156,255,0.9)]"
                        : "border-lunar/15 hover:border-lunar/40 hover:bg-white/[0.03]"
                    }`}
                  >
                    <span
                      className={`grid place-items-center size-9 rounded-lg ${
                        on ? "bg-signal/20 text-signal" : "bg-white/5 text-dust"
                      }`}
                    >
                      <e.icon className="size-4" />
                    </span>
                    <span className="flex-1">
                      <span
                        className={`block font-display text-[13px] font-bold uppercase tracking-[0.14em] ${
                          on ? "text-white" : "text-lunar"
                        }`}
                      >
                        {e.label}
                      </span>
                      <span className="block text-[11px] text-dust uppercase tracking-widest">
                        {e.world}
                      </span>
                    </span>
                    <span
                      className={`size-2 rounded-full ${on ? "bg-signal pulse-dot" : "bg-lunar/25"}`}
                    />
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="mt-6 border-t border-signal/15 pt-5"
              >
                <p className="text-sm leading-relaxed text-dust">{current.blurb}</p>
                <dl className="mt-4 space-y-2.5">
                  {current.specs.map((s) => (
                    <div key={s.k} className="flex items-center justify-between gap-3">
                      <dt className="text-[11px] uppercase tracking-[0.18em] text-dust font-display">
                        {s.k}
                      </dt>
                      <dd className="text-sm font-semibold text-white text-right">{s.v}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 3D viewport */}
          <div className="order-1 lg:order-2 relative panel rounded-2xl overflow-hidden h-[420px] sm:h-[520px] hud-corners">
            <div className="absolute inset-0 grid-lines opacity-60 pointer-events-none" />

            <Canvas camera={{ position: [3.6, 2.2, 4.6], fov: 42 }} dpr={[1, 2]} shadows={false}>
              <color attach="background" args={["#060a16"]} />
              <fog attach="fog" args={["#060a16", 9, 20]} />

              <ambientLight intensity={0.55} />
              <directionalLight position={[5, 7, 4]} intensity={2.1} />
              <pointLight position={[-6, 2, -4]} intensity={30} color="#4f9cff" distance={22} />
              <pointLight position={[6, -1, 3]} intensity={18} color="#e6966d" distance={18} />

              <Suspense fallback={null}>
                <Exhibit id={active} />
                <ContactShadows position={[0, -1.05, 0]} opacity={0.55} scale={12} blur={2.6} far={3} />
                <Grid
                  position={[0, -1.06, 0]}
                  args={[30, 30]}
                  cellSize={0.6}
                  cellThickness={0.5}
                  cellColor="#12315e"
                  sectionSize={2.4}
                  sectionThickness={1}
                  sectionColor="#1f4f9c"
                  fadeDistance={18}
                  fadeStrength={1.4}
                  infiniteGrid
                />
              </Suspense>

              <OrbitControls
                enablePan={false}
                autoRotate
                autoRotateSpeed={1.4}
                minDistance={3}
                maxDistance={10}
                maxPolarAngle={Math.PI / 1.9}
              />
            </Canvas>

            {/* HUD overlays */}
            <div className="absolute top-4 left-5 flex items-center gap-2 pointer-events-none">
              <span className="size-1.5 rounded-full bg-signal pulse-dot" />
              <span className="font-display text-[10px] uppercase tracking-[0.3em] text-signal">
                Live render · WebGL
              </span>
            </div>
            <div className="absolute bottom-4 left-5 font-display text-[10px] uppercase tracking-[0.25em] text-dust pointer-events-none">
              Drag to orbit — scroll to zoom
            </div>
            <div className="absolute bottom-4 right-5 font-display text-[10px] uppercase tracking-[0.25em] text-dust pointer-events-none">
              {current.label} · {current.world}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
