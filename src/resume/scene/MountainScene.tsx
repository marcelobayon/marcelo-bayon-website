import { type MutableRefObject, useMemo } from "react";
import * as THREE from "three";
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
    const rock = new THREE.Color(PALETTE.slate).multiplyScalar(0.72);
    const rockWarm = new THREE.Color(PALETTE.mountainShadow);
    const snow = new THREE.Color(PALETTE.snow);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const tn = THREE.MathUtils.clamp(y / height, 0, 1);
      const noise = (Math.sin(x * 2.3) * Math.cos(z * 2.1)) * 0.08;
      const snowline = 0.46 + noise;
      const snowAmt = THREE.MathUtils.smoothstep(tn, snowline, snowline + 0.14);
      c.copy(rock).lerp(rockWarm, 0.3 + noise).lerp(snow, snowAmt);
      // Slight darkening in crevices (lower = darker) for strata feel.
      c.multiplyScalar(0.82 + tn * 0.28);
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

  // Warm practical lights near a few stations (points, no shadows for perf).
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
      <fog attach="fog" args={[PALETTE.sky, 34, 78]} />

      {/* Cool ambient + hemisphere fill keeps shadows from going black. */}
      <ambientLight intensity={0.28} color={PALETTE.ice} />
      <hemisphereLight
        intensity={0.5}
        color={PALETTE.ice}
        groundColor={PALETTE.mountainShadow}
      />

      {/* Moonlight key light from above / behind, casting the only real shadows. */}
      <directionalLight
        position={[18, 30, -14]}
        intensity={1.25}
        color={"#cfe0ff"}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={26}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />

      {/* A couple of warm practical fills so station windows read warm. */}
      {warmLights.slice(0, 4).map((pos, i) => (
        <pointLight
          key={i}
          position={pos}
          intensity={3.2}
          distance={6}
          decay={2}
          color={PALETTE.amber}
        />
      ))}

      <Stars
        radius={90}
        depth={40}
        count={1400}
        factor={3.2}
        saturation={0}
        fade
        speed={refs.reducedMotion ? 0 : 0.4}
      />

      {/* The whole world lives in one group; presentation rotation (if any) is
          applied by CameraRig to the camera, never to this group, so the train,
          track, and stations can never desync. */}
      <group>
        {/* Mountain */}
        <mesh geometry={mountainGeo} castShadow receiveShadow>
          <meshStandardMaterial vertexColors roughness={0.95} metalness={0.02} />
        </mesh>

        {/* Tabletop plinth */}
        <mesh position={[0, -0.8 - plinthHeight / 2, 0]} receiveShadow>
          <cylinderGeometry
            args={[plinthRadius, plinthRadius + 0.3, plinthHeight, 64]}
          />
          <meshStandardMaterial color={"#20160f"} roughness={0.7} metalness={0.1} />
        </mesh>
        {/* Plinth top rim */}
        <mesh position={[0, -0.8 + 0.02, 0]} receiveShadow>
          <cylinderGeometry args={[plinthRadius, plinthRadius, 0.08, 64]} />
          <meshStandardMaterial color={"#2b1f16"} roughness={0.6} />
        </mesh>
        {/* Brass title plate on the front rim */}
        <mesh position={[0, -0.8 - plinthHeight / 2, plinthRadius + 0.18]} castShadow>
          <boxGeometry args={[4.2, 0.5, 0.08]} />
          <meshStandardMaterial
            color={PALETTE.brass}
            roughness={0.35}
            metalness={0.85}
          />
        </mesh>

        <Railway />
        <Train
          progressRef={refs.progressRef}
          reducedMotion={refs.reducedMotion}
        />
        <Stations activeIndexRef={refs.activeIndexRef} />
        <Environment />
      </group>

      <CameraRig
        progressRef={refs.progressRef}
        userInteractingRef={refs.userInteractingRef}
        reducedMotion={refs.reducedMotion}
      />
    </>
  );
}
