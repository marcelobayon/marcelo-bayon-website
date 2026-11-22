import { type MutableRefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  trackFrames,
  TRAIN_CONFIG,
  distanceToProgressDelta,
  clampProgress,
} from "../../scene/scene-config";
import { PALETTE } from "../../lib/theme";

const BODY_LIFT = 0.34; // along frame normal, so wheels meet the rails
const N = trackFrames.length;

/** Shared materials (reused across every body) to keep draw state lean. */
function useTrainMaterials() {
  return useMemo(() => {
    const iron = new THREE.MeshStandardMaterial({
      color: "#2d3138",
      roughness: 0.45,
      metalness: 0.75,
    });
    const body = new THREE.MeshStandardMaterial({
      color: "#5b2230",
      roughness: 0.5,
      metalness: 0.2,
    });
    const car = new THREE.MeshStandardMaterial({
      color: PALETTE.timber,
      roughness: 0.7,
      metalness: 0.1,
    });
    const brass = new THREE.MeshStandardMaterial({
      color: PALETTE.brass,
      roughness: 0.3,
      metalness: 0.9,
    });
    const window = new THREE.MeshStandardMaterial({
      color: PALETTE.amber,
      emissive: new THREE.Color(PALETTE.amber),
      emissiveIntensity: 2.1,
      roughness: 0.4,
    });
    return { iron, body, car, brass, window };
  }, []);
}

function Locomotive({
  mats,
}: {
  mats: ReturnType<typeof useTrainMaterials>;
}) {
  return (
    <group>
      {/* Boiler (long axis along Z = travel direction) */}
      <mesh
        position={[0, 0.17, 0.12]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        material={mats.body}
      >
        <cylinderGeometry args={[0.2, 0.2, 0.74, 16]} />
      </mesh>
      {/* Smokebox front */}
      <mesh position={[0, 0.17, 0.5]} material={mats.iron} castShadow>
        <cylinderGeometry args={[0.205, 0.205, 0.08, 16]} />
      </mesh>
      {/* Cab */}
      <mesh position={[0, 0.22, -0.34]} material={mats.body} castShadow>
        <boxGeometry args={[0.44, 0.36, 0.34]} />
      </mesh>
      {/* Cab roof */}
      <mesh position={[0, 0.42, -0.34]} material={mats.iron} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.4]} />
      </mesh>
      {/* Warm cab window */}
      <mesh position={[0.221, 0.24, -0.34]} material={mats.window}>
        <boxGeometry args={[0.02, 0.17, 0.2]} />
      </mesh>
      <mesh position={[-0.221, 0.24, -0.34]} material={mats.window}>
        <boxGeometry args={[0.02, 0.17, 0.2]} />
      </mesh>
      {/* Chimney */}
      <mesh position={[0, 0.42, 0.4]} material={mats.iron} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.22, 12]} />
      </mesh>
      {/* Chimney cap (brass) */}
      <mesh position={[0, 0.54, 0.4]} material={mats.brass}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 12]} />
      </mesh>
      {/* Dome (brass) */}
      <mesh position={[0, 0.39, 0.05]} material={mats.brass} castShadow>
        <sphereGeometry args={[0.08, 12, 8]} />
      </mesh>
      {/* Headlamp */}
      <mesh position={[0, 0.28, 0.55]} material={mats.window}>
        <boxGeometry args={[0.1, 0.1, 0.05]} />
      </mesh>
      {/* Cowcatcher */}
      <mesh position={[0, 0.03, 0.56]} rotation={[0.5, 0, 0]} material={mats.iron}>
        <boxGeometry args={[0.34, 0.16, 0.04]} />
      </mesh>
      {/* Chassis */}
      <mesh position={[0, 0.03, 0.07]} material={mats.iron} castShadow>
        <boxGeometry args={[0.34, 0.09, 1.0]} />
      </mesh>
      <Wheels mats={mats} z={[-0.3, 0.0, 0.32]} radius={0.11} />
    </group>
  );
}

function PassengerCar({ mats }: { mats: ReturnType<typeof useTrainMaterials> }) {
  return (
    <group>
      <mesh position={[0, 0.24, 0]} material={mats.car} castShadow>
        <boxGeometry args={[0.38, 0.34, 0.78]} />
      </mesh>
      <mesh position={[0, 0.44, 0]} material={mats.iron} castShadow>
        <boxGeometry args={[0.42, 0.05, 0.82]} />
      </mesh>
      {/* Warm window strips both sides */}
      <mesh position={[0.191, 0.27, 0]} material={mats.window}>
        <boxGeometry args={[0.015, 0.14, 0.62]} />
      </mesh>
      <mesh position={[-0.191, 0.27, 0]} material={mats.window}>
        <boxGeometry args={[0.015, 0.14, 0.62]} />
      </mesh>
      <mesh position={[0, 0.04, 0]} material={mats.iron}>
        <boxGeometry args={[0.3, 0.08, 0.84]} />
      </mesh>
      <Wheels mats={mats} z={[-0.26, 0.26]} radius={0.1} />
    </group>
  );
}

function Wheels({
  mats,
  z,
  radius,
}: {
  mats: ReturnType<typeof useTrainMaterials>;
  z: number[];
  radius: number;
}) {
  return (
    <>
      {z.map((zz, i) =>
        [-0.19, 0.19].map((xx, j) => (
          <mesh
            key={`${i}-${j}`}
            position={[xx, radius - 0.02, zz]}
            rotation={[0, 0, Math.PI / 2]}
            material={mats.iron}
          >
            <cylinderGeometry args={[radius, radius, 0.04, 14]} />
          </mesh>
        )),
      )}
    </>
  );
}

export default function Train({
  progressRef,
  reducedMotion,
}: {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const mats = useTrainMaterials();
  const total = TRAIN_CONFIG.carCount + 1; // locomotive + cars
  const spacingDelta = distanceToProgressDelta(TRAIN_CONFIG.carSpacing);

  const bodyRefs = useRef<(THREE.Group | null)[]>([]);

  // Preallocated temporaries — nothing is allocated per frame.
  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      tan: new THREE.Vector3(),
      nor: new THREE.Vector3(),
      bin: new THREE.Vector3(),
      basis: new THREE.Matrix4(),
      quat: new THREE.Quaternion(),
    }),
    [],
  );

  useFrame(() => {
    const p = progressRef.current;
    for (let i = 0; i < total; i += 1) {
      const g = bodyRefs.current[i];
      if (!g) continue;
      const prog = clampProgress(p - i * spacingDelta);

      // Non-allocating sample of the parallel-transport frame field.
      const scaled = prog * (N - 1);
      const a = trackFrames[Math.floor(scaled)];
      const b = trackFrames[Math.min(Math.floor(scaled) + 1, N - 1)];
      const f = scaled - Math.floor(scaled);
      tmp.pos.lerpVectors(a.position, b.position, f);
      tmp.tan.lerpVectors(a.tangent, b.tangent, f).normalize();
      tmp.nor.lerpVectors(a.normal, b.normal, f).normalize();
      tmp.bin.lerpVectors(a.binormal, b.binormal, f).normalize();

      tmp.basis.makeBasis(tmp.bin, tmp.nor, tmp.tan);
      tmp.quat.setFromRotationMatrix(tmp.basis);
      g.quaternion.copy(tmp.quat);
      g.position.copy(tmp.pos).addScaledVector(tmp.nor, BODY_LIFT);
    }
  });

  void reducedMotion; // train position tracks scroll; no idle animation to gate

  return (
    <>
      {Array.from({ length: total }, (_, i) => (
        <group key={i} ref={(el) => (bodyRefs.current[i] = el)}>
          {i === 0 ? <Locomotive mats={mats} /> : <PassengerCar mats={mats} />}
        </group>
      ))}
    </>
  );
}
