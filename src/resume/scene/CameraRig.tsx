import { type MutableRefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CAMERA_CONFIG, getTrackPoint } from "../../scene/scene-config";

export default function CameraRig({
  progressRef,
  userInteractingRef,
  reducedMotion,
}: {
  progressRef: MutableRefObject<number>;
  userInteractingRef: MutableRefObject<boolean>;
  reducedMotion: boolean;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const hasInteracted = useRef(false);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(0, CAMERA_CONFIG.initialTarget[1], 0), []);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Keep the camera looking at the climbing train: follow its height, stay
    // on the mountain axis. Damped so it never snaps or fights the user.
    getTrackPoint(progressRef.current, tmp);
    desired.set(0, tmp.y * 0.82 + 2.2, 0);
    controls.target.lerp(desired, 0.05);
    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      // Wheel/pinch are reserved for page scroll, which drives the journey.
      enableZoom={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={CAMERA_CONFIG.minDistance}
      maxDistance={CAMERA_CONFIG.maxDistance}
      // Keep the camera above the tabletop and out of the mountain.
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2 - 0.04}
      autoRotate={!reducedMotion && !hasInteracted.current}
      autoRotateSpeed={0.35}
      target={[...CAMERA_CONFIG.initialTarget]}
      onStart={() => {
        hasInteracted.current = true;
        userInteractingRef.current = true;
        if (controlsRef.current) controlsRef.current.autoRotate = false;
      }}
      onEnd={() => {
        userInteractingRef.current = false;
      }}
    />
  );
}
