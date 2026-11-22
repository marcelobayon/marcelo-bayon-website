import { useMemo } from "react";
import * as THREE from "three";

/**
 * Static gradient sky dome: a large inverted sphere with vertex colors from a
 * deep zenith to a lighter, slightly warm horizon, plus a soft horizon band.
 * Sits behind the stars and the world; it does not rotate with the mountain.
 */
export default function SkyDome() {
  const geo = useMemo(() => {
    const radius = 150;
    const g = new THREE.SphereGeometry(radius, 32, 24);
    const zenith = new THREE.Color("#05070f");
    const horizon = new THREE.Color("#152743");
    const glow = new THREE.Color("#2a4a74");

    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i += 1) {
      const y = pos.getY(i) / radius; // -1 (down) .. 1 (up)
      const up = THREE.MathUtils.clamp((y + 0.15) / 1.15, 0, 1);
      // Soft, bright-ish band near the horizon (y ≈ 0).
      const band = Math.exp(-(((y - 0.015) * 7) ** 2));
      c.copy(horizon).lerp(zenith, THREE.MathUtils.smoothstep(up, 0.22, 0.92));
      c.lerp(glow, band * 0.45);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  return (
    <mesh geometry={geo} renderOrder={-1}>
      <meshBasicMaterial
        vertexColors
        side={THREE.BackSide}
        fog={false}
        depthWrite={false}
      />
    </mesh>
  );
}
