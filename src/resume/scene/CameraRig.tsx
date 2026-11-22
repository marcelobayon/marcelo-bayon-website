import { type MutableRefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  CAMERA_CONFIG,
  PRESENTATION_SPIN,
  getTrackPoint,
} from "../../scene/scene-config";

// Offset of the camera's orbit angle from the train's, so we view it from a
// three-quarter angle rather than dead-on.
const AZIMUTH_OFFSET = -0.6;

export default function CameraRig({
  progressRef,
  userInteractingRef,
}: {
  progressRef: MutableRefObject<number>;
  userInteractingRef: MutableRefObject<boolean>;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(0, CAMERA_CONFIG.initialTarget[1], 0), []);
  const introRef = useRef(0);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const progress = progressRef.current;

    // Target: the mountain axis at roughly the train's height.
    getTrackPoint(progress, tmp);
    desired.set(0, tmp.y * 0.82 + 2.2, 0);
    controls.target.lerp(desired, 0.06);

    // The train's world azimuth = its local spline angle plus the world's
    // presentation spin. We orbit to keep it framed (never the opposite way).
    const localAngle = Math.atan2(tmp.z, tmp.x);
    const worldAngle = localAngle + progress * PRESENTATION_SPIN;
    const desiredAz = Math.PI / 2 - worldAngle + AZIMUTH_OFFSET;

    // Intro: start the orbit swung out, then ease into the follow angle on load.
    if (introRef.current === 0) {
      controls.setAzimuthalAngle(desiredAz + 1.2);
    }
    introRef.current = Math.min(introRef.current + delta, 3);

    // Follow the train's azimuth unless the visitor is dragging the scene.
    if (!userInteractingRef.current) {
      const cur = controls.getAzimuthalAngle();
      let d = desiredAz - cur;
      d = Math.atan2(Math.sin(d), Math.cos(d)); // shortest path, no spin-around
      // Ease in a touch faster during the intro, then settle to a gentle follow.
      const k = introRef.current < 2.5 ? 0.05 : 0.08;
      controls.setAzimuthalAngle(cur + d * k);
    }

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
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI / 2 - 0.05}
      target={[...CAMERA_CONFIG.initialTarget]}
      onStart={() => {
        userInteractingRef.current = true;
      }}
      onEnd={() => {
        userInteractingRef.current = false;
      }}
    />
  );
}
