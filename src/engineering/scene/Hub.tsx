import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CORE_CONFIG, CORE_PALETTE, getHubTransform } from "../scene-config";

type Props = {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
};

/**
 * The central geometric hub: a faceted core with a glowing wireframe seam.
 * Rotates and scales smoothly as the visitor scrolls between formations.
 */
export default function Hub({ progressRef, reducedMotion }: Props) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const { rotation, scale } = getHubTransform(
      progressRef.current,
      clock.getElapsedTime(),
      reducedMotion,
    );
    group.current.rotation.copy(rotation);
    group.current.scale.setScalar(scale);
  });

  return (
    <group ref={group}>
      {/* Solid core */}
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[CORE_CONFIG.hubRadius, 1]} />
        <meshStandardMaterial
          color={CORE_PALETTE.hubBase}
          roughness={0.45}
          metalness={0.5}
          flatShading
        />
      </mesh>
      {/* Energy seam */}
      <mesh scale={1.015}>
        <icosahedronGeometry args={[CORE_CONFIG.hubRadius, 1]} />
        <meshBasicMaterial color={CORE_PALETTE.hubSeam} wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
