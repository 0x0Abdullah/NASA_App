import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GOLD = "#c99a4b";
const FOIL = "#b8862f";
const METAL = "#aeb4bd";
const DARK = "#2a2f38";
const PANEL = "#16224a";

/* ------------------------------------------------------------------ */
/* Apollo Lunar Module — descent stage left behind + ascent stage       */
/* ------------------------------------------------------------------ */
export function LunarModule({ ...props }) {
  const legAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];

  return (
    <group {...props}>
      {/* --- descent stage (the part that stays) --- */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.95, 0.85, 0.85, 8]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.38} />
      </mesh>

      {/* gold foil wrap bands */}
      {[0.2, 0.45, 0.7].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.97 - i * 0.02, 0.97 - i * 0.02, 0.12, 8, 1, true]} />
          <meshStandardMaterial
            color={i % 2 ? GOLD : FOIL}
            metalness={1}
            roughness={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* engine bell */}
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.32, 0.16, 0.5, 16, 1, true]} />
        <meshStandardMaterial color="#7d6a4a" metalness={1} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* landing legs + footpads */}
      {legAngles.map((a, i) => {
        const hipX = Math.cos(a) * 0.85;
        const hipZ = Math.sin(a) * 0.85;
        const footX = Math.cos(a) * 1.55;
        const footZ = Math.sin(a) * 1.55;
        const midX = (hipX + footX) / 2;
        const midZ = (hipZ + footZ) / 2;
        const dx = footX - hipX;
        const dz = footZ - hipZ;
        const len = Math.sqrt(dx * dx + dz * dz + 0.85 * 0.85);
        return (
          <group key={i}>
            <mesh position={[midX, 0.06, midZ]} rotation={[0, -a, 0]}>
              <boxGeometry args={[len, 0.07, 0.07]} />
              <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.35} />
            </mesh>
            {/* vertical strut */}
            <mesh position={[hipX, 0.4, hipZ]} rotation={[0, -a, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.9, 8]} />
              <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.4} />
            </mesh>
            {/* footpad */}
            <mesh position={[footX, -0.36, footZ]}>
              <cylinderGeometry args={[0.26, 0.26, 0.07, 20]} />
              <meshStandardMaterial color="#cfd4db" metalness={0.7} roughness={0.5} />
            </mesh>
            <mesh position={[(hipX + footX) / 2, 0.34, (hipZ + footZ) / 2]} rotation={[0, -a, 0]}>
              <boxGeometry args={[len * 0.8, 0.035, 0.035]} />
              <meshStandardMaterial color={FOIL} metalness={1} roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* --- ascent stage --- */}
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 0.85, 10]} />
        <meshStandardMaterial color="#d5d9df" metalness={0.75} roughness={0.42} />
      </mesh>
      {/* crew cabin box */}
      <mesh position={[0.18, 1.5, 0.32]}>
        <boxGeometry args={[0.55, 0.5, 0.5]} />
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.5} />
      </mesh>
      {/* triangular windows */}
      <mesh position={[0.36, 1.6, 0.48]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.16, 0.14, 0.02]} />
        <meshStandardMaterial color="#0b1224" metalness={1} roughness={0.1} emissive="#123" />
      </mesh>
      {/* docking hatch */}
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#8f959e" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* ascent engine nozzle */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.16, 0.08, 0.3, 14, 1, true]} />
        <meshStandardMaterial color="#6e6253" metalness={1} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* antenna */}
      <mesh position={[-0.4, 1.95, -0.2]} rotation={[0.3, 0, 0.4]}>
        <cylinderGeometry args={[0.012, 0.012, 0.7, 6]} />
        <meshStandardMaterial color="#e8ecf2" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[-0.52, 2.24, -0.12]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#e8ecf2" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* throttled RCS quads */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 0.62, 1.32, Math.sin((i * Math.PI) / 2) * 0.62]}>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          <meshStandardMaterial color="#42474f" metalness={0.8} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Mars exploration rover (Spirit / Opportunity style)                  */
/* ------------------------------------------------------------------ */
export function MarsRover({ ...props }) {
  const wheelRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const panelRef = useRef();

  useFrame((_, delta) => {
    wheelRefs.forEach((r) => r.current && (r.current.rotation.z += delta * 1.4));
    if (panelRef.current) panelRef.current.rotation.y = Math.sin(Date.now() * 0.0002) * 0.15;
  });

  const wheelX = [-0.78, 0, 0.78];
  const wheelZ = 0.62;

  return (
    <group {...props} scale={1.05}>
      {/* body / warm electronics box */}
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[1.5, 0.42, 1.05]} />
        <meshStandardMaterial color="#cfd4db" metalness={0.7} roughness={0.45} />
      </mesh>

      {/* solar panel array */}
      <group ref={panelRef} position={[0, 0.86, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.95, 0.95, 0.05, 6]} />
          <meshStandardMaterial color={PANEL} metalness={0.95} roughness={0.2} />
        </mesh>
        {/* cell grid lines */}
        {[-0.5, 0, 0.5].map((o) => (
          <mesh key={o} position={[o, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.02, 1.5]} />
            <meshStandardMaterial color="#5b7fe0" emissive="#1a2c66" emissiveIntensity={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, 0.02]} />
          <meshStandardMaterial color="#5b7fe0" emissive="#1a2c66" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* camera mast */}
      <mesh position={[0.55, 1.15, 0.25]}>
        <cylinderGeometry args={[0.05, 0.05, 0.75, 10]} />
        <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.4} />
      </mesh>
      <mesh position={[0.55, 1.55, 0.25]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.22, 0.2, 0.42]} />
        <meshStandardMaterial color="#3c424c" metalness={0.7} roughness={0.5} />
      </mesh>
      {/* "eyes" — navcams */}
      {[-0.12, 0.12].map((z) => (
        <mesh key={z} position={[0.67, 1.56, 0.25 + z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06, 14]} />
          <meshStandardMaterial color="#05070d" metalness={1} roughness={0.1} emissive="#0a1830" />
        </mesh>
      ))}

      {/* instrument arm */}
      <group position={[-0.8, 0.55, 0]} rotation={[0, 0, 0.5]}>
        <mesh position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.62, 0.07, 0.07]} />
          <meshStandardMaterial color="#8f959e" metalness={0.85} roughness={0.4} />
        </mesh>
        <mesh position={[-0.62, -0.1, 0]} rotation={[0, 0, -0.7]}>
          <boxGeometry args={[0.3, 0.06, 0.06]} />
          <meshStandardMaterial color="#8f959e" metalness={0.85} roughness={0.4} />
        </mesh>
        <mesh position={[-0.7, -0.22, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.14, 12]} />
          <meshStandardMaterial color="#3c424c" metalness={0.8} roughness={0.45} />
        </mesh>
      </group>

      {/* rocker-bogie suspension + 6 wheels */}
      {wheelX.map((x, i) => (
        <group key={i}>
            {[wheelZ, -wheelZ].map((z) => (
              <group key={z}>
                {/* suspension arm */}
                <mesh position={[x / 2, 0.42, z * 0.86]} rotation={[0, 0, x > 0 ? -0.35 : 0.35]}>
                  <boxGeometry args={[0.9, 0.06, 0.06]} />
                  <meshStandardMaterial color="#767c86" metalness={0.85} roughness={0.45} />
                </mesh>
                {/* wheel */}
                <mesh
                  ref={wheelRefs[i * 2 + (z > 0 ? 0 : 1)]}
                  position={[x, 0.24, z]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.24, 0.24, 0.16, 20]} />
                  <meshStandardMaterial color="#20242b" metalness={0.4} roughness={0.85} />
                </mesh>
                {/* wheel ribs */}
                <mesh position={[x, 0.24, z]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.24, 0.02, 8, 24]} />
                  <meshStandardMaterial color="#4a5059" metalness={0.6} roughness={0.6} />
                </mesh>
              </group>
            ))}
          </group>
      ))}

      {/* RTG-ish detail box */}
      <mesh position={[-0.6, 0.9, -0.3]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.3, 0.22, 0.3]} />
        <meshStandardMaterial color="#5a6069" metalness={0.8} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Mars Helicopter Ingenuity                                            */
/* ------------------------------------------------------------------ */
export function Helicopter({ ...props }) {
  const rotorA = useRef();
  const rotorB = useRef();

  useFrame((_, delta) => {
    if (rotorA.current) rotorA.current.rotation.y += delta * 9;
    if (rotorB.current) rotorB.current.rotation.y -= delta * 7;
  });

  const legs = [
    [0.28, 0.3, 0.2],
    [-0.28, 0.3, 0.2],
    [0.28, 0.3, -0.2],
    [-0.28, 0.3, -0.2],
  ];

  return (
    <group {...props}>
      {/* fuselage */}
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.42, 0.34, 0.3]} />
        <meshStandardMaterial color="#e8ecf2" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* gold insulation */}
      <mesh position={[0, 0.62, 0.16]}>
        <boxGeometry args={[0.38, 0.3, 0.02]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
      </mesh>
      {/* downward camera */}
      <mesh position={[0, 0.4, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 14]} />
        <meshStandardMaterial color="#05070d" metalness={1} roughness={0.15} />
      </mesh>
      {/* solar panel on top */}
      <mesh position={[0, 0.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.03]} />
        <meshStandardMaterial color={PANEL} metalness={0.95} roughness={0.2} />
      </mesh>
      {/* mast */}
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 10]} />
        <meshStandardMaterial color="#9aa1ab" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* counter-rotating rotors */}
      <group ref={rotorA} position={[0, 1.1, 0]}>
        {[0, Math.PI / 2].map((r) => (
          <mesh key={r} rotation={[0, r, 0]}>
            <boxGeometry args={[1.5, 0.012, 0.1]} />
            <meshStandardMaterial color="#d5d9df" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.07, 12]} />
          <meshStandardMaterial color="#42474f" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>
      <group ref={rotorB} position={[0, 1.02, 0]}>
        {[Math.PI / 4, (3 * Math.PI) / 4].map((r) => (
          <mesh key={r} rotation={[0, r, 0]}>
            <boxGeometry args={[1.5, 0.012, 0.1]} />
            <meshStandardMaterial color="#c3c8d0" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* landing legs */}
      {legs.map(([x, y, z], i) => (
        <group key={i}>
          <mesh position={[x * 0.75, y * 0.6, z * 0.75]} rotation={[z > 0 ? -0.5 : 0.5, 0, x > 0 ? -0.5 : 0.5]}>
            <cylinderGeometry args={[0.018, 0.018, 0.55, 6]} />
            <meshStandardMaterial color="#9aa1ab" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[x * 1.05, 0.08, z * 1.05]}>
            <cylinderGeometry args={[0.05, 0.05, 0.03, 12]} />
            <meshStandardMaterial color="#d5d9df" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
