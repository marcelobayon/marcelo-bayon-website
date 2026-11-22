import { type MutableRefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import {
  MOUNTAIN_CONFIG,
  mountainRadiusAt,
  STATION_PLACEMENTS,
  getStationPosition,
} from "../../scene/scene-config";
import { PALETTE } from "../../lib/theme";
import Railway from "./Railway";
import Train from "./Train";
import Stations from "./Stations";
import Environment from "./Environment";
import Details from "./Details";
import CameraRig from "./CameraRig";

export type SceneRefs = {
  progressRef: MutableRefObject<number>;
  activeIndexRef: MutableRefObject<number>;
  userInteractingRef: MutableRefObject<boolean>;
  reducedMotion: boolean;
};

const { height, trackSurfaceOffset, plinthRadius, plinthHeight } = MOUNTAIN_CONFIG;

/** Snow-capped mountain body as a lathe revolve, with height-based vertex colors. */
function useMountainGeometry() {
  return useMemo(() => {
    const profile: THREE.Vector2[] = [];
    const segments = 52;
    profile.push(new THREE.Vector2(0.001, -0.8));
    profile.push(new THREE.Vector2(mountainRadiusAt(0), -0.8));
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const r = Math.max(mountainRadiusAt(t) - trackSurfaceOffset, 0.06);
      profile.push(new THREE.Vector2(r, t * height));
    }
    profile.push(new THREE.Vector2(0.001, height));

    const geo = new THREE.LatheGeometry(profile, 120);
    geo.computeVertexNormals();

    // Vertex colors: slate rock low, snow high, with a soft snowline and noise.
    const rock = new THREE.Color(PALETTE.slate).multiplyScalar(0.95);
    const rockWarm = new THREE.Color(PALETTE.mountainShadow).multiplyScalar(1.15);
    const snow = new THREE.Color(PALETTE.snow);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const tn = THREE.MathUtils.clamp(y / height, 0, 1);
      const noise = Math.sin(x * 2.3) * Math.cos(z * 2.1) * 0.08;
      const snowline = 0.42 + noise;
      const snowAmt = THREE.MathUtils.smoothstep(tn, snowline, snowline + 0.14);
      c.copy(rock).lerp(rockWarm, 0.3 + noise).lerp(snow, snowAmt);
      // Gentle strata: slightly darker in the low rock, bright on the caps.
      c.multiplyScalar(0.92 + tn * 0.22);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);
}

export default function MountainScene(refs: SceneRefs) {
  const mountainGeo = useMountainGeometry();
  const worldRef = useRef<THREE.Group>(null);

  // Scroll-driven presentation rotation of the WHOLE world (mountain, track,
  // train, stations, props) — they rotate together, so nothing desyncs. Damped.
  useFrame(() => {
    const g = worldRef.current;
    if (!g) return;
    const target = -refs.progressRef.current * Math.PI * 1.15;
    g.rotation.y += (target - g.rotation.y) * 0.08;
  });

  const warmLights = useMemo(
    () =>
      STATION_PLACEMENTS.map((p) => {
        const v = getStationPosition(p);
        return [v.x, v.y + 0.5, v.z] as [number, number, number];
      }),
    [],
  );

  return (
    <>
      <color attach="background" args={[PALETTE.sky]} />
      <fogExp2 attach="fog" args={[PALETTE.sky, 0.011]} />

      {/* Brighter cool ambient + hemisphere so the midnight scene still reads. */}
      <ambientLight intensity={0.55} color={PALETTE.ice} />
      <hemisphereLight intensity={0.85} color={"#cfe0ff"} groundColor={"#223047"} />

      {/* Moonlight key light (the only shadow caster). */}
      <directionalLight
        position={[18, 32, -14]}
        intensity={1.9}
        color={"#dbe7ff"}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={28}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
      />
      {/* Cool fill from the front to lift the shadow side. */}
      <directionalLight position={[-14, 10, 18]} intensity={0.55} color={"#9fc0e8"} />

      {/* Decorative moon. */}
      <mesh position={[26, 30, -20]}>
        <sphereGeometry args={[2.4, 24, 24]} />
        <meshBasicMaterial color={"#eef4ff"} />
      </mesh>

      {warmLights.slice(0, 4).map((pos, i) => (
        <pointLight
          key={i}
          position={pos}
          intensity={3.6}
          distance={6}
          decay={2}
          color={PALETTE.amber}
        />
      ))}

      <Stars
        radius={110}
        depth={48}
        count={1800}
        factor={3.6}
        saturation={0}
        fade
        speed={refs.reducedMotion ? 0 : 0.45}
      />

      <group ref={worldRef}>
        {/* Mountain */}
        <mesh geometry={mountainGeo} castShadow receiveShadow>
          <meshStandardMaterial vertexColors roughness={0.92} metalness={0.02} />
        </mesh>

        {/* Tabletop plinth */}
        <mesh position={[0, -0.8 - plinthHeight / 2, 0]} receiveShadow>
          <cylinderGeometry args={[plinthRadius, plinthRadius + 0.3, plinthHeight, 64]} />
          <meshStandardMaterial color={"#241a12"} roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[0, -0.8 + 0.02, 0]} receiveShadow>
          <cylinderGeometry args={[plinthRadius, plinthRadius, 0.08, 64]} />
          <meshStandardMaterial color={"#302218"} roughness={0.6} />
        </mesh>
        {/* Brass title plate */}
        <mesh position={[0, -0.8 - plinthHeight / 2, plinthRadius + 0.18]} castShadow>
          <boxGeometry args={[4.2, 0.5, 0.08]} />
          <meshStandardMaterial color={PALETTE.brass} roughness={0.35} metalness={0.85} />
        </mesh>

        <Railway />
        <Train progressRef={refs.progressRef} reducedMotion={refs.reducedMotion} />
        <Stations activeIndexRef={refs.activeIndexRef} />
        <Environment />
        <Details />
      </group>

      <CameraRig
        progressRef={refs.progressRef}
        userInteractingRef={refs.userInteractingRef}
      />
    </>
  );
}
