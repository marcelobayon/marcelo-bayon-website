import { type MutableRefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import {
  MOUNTAIN_CONFIG,
  STATION_PLACEMENTS,
  getStationPosition,
} from "../../scene/scene-config";
import { PALETTE } from "../../lib/theme";
import Mountain from "./Mountain";
import Railway from "./Railway";
import Train from "./Train";
import Stations from "./Stations";
import Environment from "./Environment";
import Details from "./Details";
import SkyDome from "./SkyDome";
import CameraRig from "./CameraRig";

export type SceneRefs = {
  progressRef: MutableRefObject<number>;
  activeIndexRef: MutableRefObject<number>;
  userInteractingRef: MutableRefObject<boolean>;
  reducedMotion: boolean;
};

const { plinthRadius, plinthHeight } = MOUNTAIN_CONFIG;

export default function MountainScene(refs: SceneRefs) {
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

      <SkyDome />

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
        <Mountain />

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
