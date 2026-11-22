import { useMemo } from "react";
import * as THREE from "three";
import {
  MOUNTAIN_CONFIG,
  mountainRadiusAt,
  canyonDip,
} from "../../scene/scene-config";
import { PALETTE } from "../../lib/theme";

const { height, trackSurfaceOffset } = MOUNTAIN_CONFIG;

/**
 * Parametric snow-capped mountain. Radius varies with BOTH height and angle so
 * the surface can be carved by canyonDip() into gullies the railway bridges.
 * Height-based vertex colors (rock → snow), darkened inside the canyons.
 */
function buildMountainGeometry() {
  const rings = 76; // vertical resolution
  const cols = 168; // angular resolution (wraps)
  const yBottom = -0.8;

  const positions: number[] = [];
  const colors: number[] = [];
  const index: number[] = [];

  const rock = new THREE.Color(PALETTE.slate).multiplyScalar(0.95);
  const rockWarm = new THREE.Color(PALETTE.mountainShadow).multiplyScalar(1.15);
  const snow = new THREE.Color(PALETTE.snow);
  const canyonDark = new THREE.Color("#141d2b");
  const c = new THREE.Color();

  for (let i = 0; i <= rings; i += 1) {
    const ti = i / rings;
    const y = THREE.MathUtils.lerp(yBottom, height, ti);
    const tHeight = THREE.MathUtils.clamp(y / height, 0, 1);
    const baseR = Math.max(mountainRadiusAt(tHeight) - trackSurfaceOffset, 0.06);

    for (let j = 0; j < cols; j += 1) {
      const ang = (j / cols) * Math.PI * 2;
      const dip = y >= 0 ? canyonDip(ang, tHeight) : 0;
      const r = Math.max(baseR - dip, 0.05);
      const x = Math.cos(ang) * r;
      const z = Math.sin(ang) * r;
      positions.push(x, y, z);

      const noise = Math.sin(x * 2.3) * Math.cos(z * 2.1) * 0.08;
      const snowline = 0.42 + noise;
      const snowAmt = THREE.MathUtils.smoothstep(tHeight, snowline, snowline + 0.14);
      c.copy(rock).lerp(rockWarm, 0.3 + noise).lerp(snow, snowAmt);
      c.multiplyScalar(0.92 + tHeight * 0.22);
      const dipAmt = THREE.MathUtils.clamp(dip / 1.0, 0, 1);
      c.lerp(canyonDark, dipAmt * 0.72);
      colors.push(c.r, c.g, c.b);
    }
  }

  // Apex vertex.
  const apex = (rings + 1) * cols;
  positions.push(0, height, 0);
  colors.push(snow.r, snow.g, snow.b);

  // Body faces.
  for (let i = 0; i < rings; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      const a = i * cols + j;
      const b = i * cols + ((j + 1) % cols);
      const cc = (i + 1) * cols + j;
      const d = (i + 1) * cols + ((j + 1) % cols);
      index.push(a, cc, b);
      index.push(b, cc, d);
    }
  }
  // Top ring → apex.
  const topStart = rings * cols;
  for (let j = 0; j < cols; j += 1) {
    index.push(topStart + j, apex, topStart + ((j + 1) % cols));
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

export default function Mountain() {
  const geo = useMemo(buildMountainGeometry, []);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.92} metalness={0.02} />
    </mesh>
  );
}
