import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const SPREAD = 28;
const TOP = 22;

/** Gentle falling snow in world space (does not rotate with the mountain). */
export default function Snow({
  count = 700,
  reducedMotion,
}: {
  count?: number;
  reducedMotion: boolean;
}) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      pos[i * 3] = (Math.random() - 0.5) * SPREAD;
      pos[i * 3 + 1] = Math.random() * TOP;
      pos[i * 3 + 2] = (Math.random() - 0.5) * SPREAD;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);

  const vel = useMemo(() => {
    const v = new Float32Array(count);
    for (let i = 0; i < count; i += 1) v[i] = 0.8 + Math.random() * 1.5;
    return v;
  }, [count]);

  const t = useRef(0);
  useFrame((_, delta) => {
    if (reducedMotion) return;
    const dt = Math.min(delta, 0.05);
    t.current += dt;
    const pos = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i += 1) {
      pos[i * 3 + 1] -= vel[i] * dt;
      pos[i * 3] += Math.sin(t.current * 0.8 + i) * 0.003;
      if (pos[i * 3 + 1] < -1) {
        pos[i * 3 + 1] = TOP;
        pos[i * 3] = (Math.random() - 0.5) * SPREAD;
        pos[i * 3 + 2] = (Math.random() - 0.5) * SPREAD;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points geometry={geo}>
      <pointsMaterial
        color={"#eef4ff"}
        size={0.09}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        fog={false}
      />
    </points>
  );
}
