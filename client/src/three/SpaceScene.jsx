import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { createMoonTexture, createMarsTexture } from "./textures.js";

function Planet({ position, radius, texture, speed = 0.05, bumpColor }) {
  const ref = useRef();
  const map = useMemo(() => texture, [texture]);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial map={map} roughness={0.95} metalness={0.02} />
      {/* soft rim glow */}
      <mesh scale={1.06}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color={bumpColor} transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </mesh>
  );
}

/** Drifting bits of discarded hardware — brackets, panels, plates. */
function Debris({ count = 16 }) {
  const group = useRef();
  const geometries = useMemo(
    () => [
      new THREE.BoxGeometry(0.16, 0.1, 0.12),
      new THREE.CylinderGeometry(0.07, 0.09, 0.2, 8),
      new THREE.BoxGeometry(0.3, 0.02, 0.2),
      new THREE.TetrahedronGeometry(0.11),
      new THREE.TorusGeometry(0.09, 0.025, 8, 20),
    ],
    []
  );
  const items = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      geo: geometries[i % geometries.length],
      pos: [
        (Math.random() - 0.5) * 11,
        (Math.random() - 0.5) * 6,
        -2 - Math.random() * 7,
      ],
      rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      floatPhase: Math.random() * Math.PI * 2,
      isGold: Math.random() > 0.6,
    }));
  }, [count, geometries]);

  useEffect(() => {
    return () => geometries.forEach((g) => g.dispose());
  }, [geometries]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      child.rotation.x += 0.002;
      child.rotation.y += 0.003;
      child.position.y += Math.sin(t * 0.5 + i) * 0.0012;
    });
  });

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <mesh key={i} geometry={it.geo} position={it.pos} rotation={it.rot}>
          {it.isGold ? (
            <meshStandardMaterial color="#c99a4b" metalness={0.9} roughness={0.35} />
          ) : (
            <meshStandardMaterial color="#9aa1ab" metalness={0.85} roughness={0.4} />
          )}
        </mesh>
      ))}
    </group>
  );
}

function Rig({ children }) {
  const ref = useRef();
  useFrame(({ pointer }) => {
    if (!ref.current) return;
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, pointer.x * 0.12, 0.05);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -pointer.y * 0.08, 0.05);
  });
  return <group ref={ref}>{children}</group>;
}

/** Full-screen animated hero scene: Moon, Mars, stars and drifting debris. */
export default function SpaceScene() {
  const moonTex = useMemo(() => createMoonTexture(1024), []);
  const marsTex = useMemo(() => createMarsTexture(1024), []);

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 55 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 4, 6]} intensity={1.6} color="#ffffff" />
      <pointLight position={[-5, 2, 2]} intensity={18} color="#4f9cff" distance={20} />
      <pointLight position={[5, -2, 1]} intensity={14} color="#e6966d" distance={20} />

      <Stars radius={90} depth={45} count={4200} factor={3.4} saturation={0} fade speed={0.6} />
      <Sparkles count={90} scale={[14, 8, 8]} size={1.6} speed={0.25} opacity={0.35} color="#9fd4ff" />

      <Rig>
        <Planet position={[-4.2, 1.15, -5]} radius={2.1} texture={moonTex} speed={0.045} bumpColor="#8fb8ff" />
        <Planet position={[4.6, -1.4, -7]} radius={1.75} texture={marsTex} speed={0.06} bumpColor="#ff9a6a" />
        <Debris />
      </Rig>
    </Canvas>
  );
}
