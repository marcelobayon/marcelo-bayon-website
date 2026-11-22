import { type MutableRefObject } from "react";
import * as THREE from "three";
import Hub from "./Hub";
import ModuleBlocks from "./ModuleBlocks";
import type { KitModuleId } from "../scene-config";

type Props = {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
  activeModule: KitModuleId | null;
  onSelect: (id: KitModuleId) => void;
};

/** Composes the lights, the central hub, and the orbiting modular blocks. */
export default function ModularCoreScene({
  progressRef,
  reducedMotion,
  activeModule,
  onSelect,
}: Props) {
  return (
    <>
      <color attach="background" args={["#080f1d"]} />
      <fog attach="fog" args={["#080f1d", 9, 20]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Warm amber rim light for depth */}
      <pointLight position={[-4, -2, 3]} intensity={0.6} color={new THREE.Color("#fbbf24")} />
      <pointLight position={[0, 3, -4]} intensity={0.4} color={new THREE.Color("#a9c7d8")} />

      <Hub progressRef={progressRef} reducedMotion={reducedMotion} />
      <ModuleBlocks
        progressRef={progressRef}
        reducedMotion={reducedMotion}
        activeModule={activeModule}
        onSelect={onSelect}
      />
    </>
  );
}
