import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * One aurora curtain: a tall plane with RGBA vertex colors (bright at the
 * bottom, fading up) and a gentle per-frame wave, drawn additively so the
 * curtains glow against the night sky. Disabled when reduced motion is on.
 */
function Curtain({
  cy,
  cx,
  yaw,
  color,
  phase,
  width,
  height,
  reducedMotion,
}: {
  cy: number;
  cx: number;
  yaw: number;
  color: string;
  phase: number;
  width: number;
  height: number;
  reducedMotion: boolean;
}) {
  const segs = 60;
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, segs, 6);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 4);
    const col = new THREE.Color(color);
    for (let i = 0; i < pos.count; i += 1) {
      const vy = pos.getY(i);
      const up = (vy + height / 2) / height; // 0 bottom → 1 top
      const band = 0.6 + 0.4 * Math.sin(pos.getX(i) * 0.5); // vertical streaks
      const a = Math.pow(1 - up, 1.6) * 0.62 * band;
      colors[i * 4] = col.r;
      colors[i * 4 + 1] = col.g;
      colors[i * 4 + 2] = col.b;
      colors[i * 4 + 3] = a;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 4));
    return g;
  }, [color, width, height]);

  const base = useMemo(
    () => Float32Array.from(geo.attributes.position.array as Float32Array),
    [geo],
  );
  const t = useRef(phase);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    t.current += delta * 0.5;
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const x = base[i * 3];
      const y0 = base[i * 3 + 1];
      const z = Math.sin(x * 0.14 + t.current) * 1.7 + Math.sin(x * 0.06 - t.current * 0.6) * 1.1;
      pos.setXYZ(i, x, y0 + Math.sin(x * 0.18 + t.current * 1.2) * 0.35, z);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh geometry={geo} position={[cx, cy, -24]} rotation={[0, yaw, 0]}>
      <meshBasicMaterial
        vertexColors
        transparent
        fog={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function Aurora({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      <Curtain cy={19} cx={-4} yaw={0.15} color="#3df5a0" phase={0} width={52} height={16} reducedMotion={reducedMotion} />
      <Curtain cy={21.5} cx={3} yaw={-0.22} color="#39c6e8" phase={2.1} width={46} height={13} reducedMotion={reducedMotion} />
      <Curtain cy={17} cx={7} yaw={0.42} color="#9a7cf0" phase={4.2} width={40} height={11} reducedMotion={reducedMotion} />
    </group>
  );
}
