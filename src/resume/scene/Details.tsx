import { type ReactNode, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  sampleFrame,
  getTrackPoint,
  STATION_PLACEMENTS,
  getStationPosition,
} from "../../scene/scene-config";
import { PALETTE } from "../../lib/theme";

/** Orient children to the track's local frame at a given progress. */
function OnTrack({ progress, children }: { progress: number; children: ReactNode }) {
  const { position, quaternion } = useMemo(() => {
    const f = sampleFrame(progress);
    const basis = new THREE.Matrix4().makeBasis(f.binormal, f.normal, f.tangent);
    const q = new THREE.Quaternion().setFromRotationMatrix(basis);
    return {
      position: [f.position.x, f.position.y, f.position.z] as [number, number, number],
      quaternion: [q.x, q.y, q.z, q.w] as [number, number, number, number],
    };
  }, [progress]);
  return (
    <group position={position} quaternion={quaternion}>
      {children}
    </group>
  );
}

function useDetailMaterials() {
  return useMemo(() => {
    const stone = new THREE.MeshStandardMaterial({ color: "#5c626b", roughness: 0.92 });
    const timber = new THREE.MeshStandardMaterial({ color: PALETTE.timber, roughness: 0.85 });
    const dark = new THREE.MeshStandardMaterial({ color: "#0a0f1a", roughness: 1 });
    const glow = new THREE.MeshStandardMaterial({
      color: PALETTE.amber,
      emissive: new THREE.Color(PALETTE.amber),
      emissiveIntensity: 2.2,
      roughness: 0.5,
    });
    return { stone, timber, dark, glow };
  }, []);
}

/** A stone tunnel portal straddling the track, with a warm glow inside. */
function TunnelPortal({
  progress,
  mats,
}: {
  progress: number;
  mats: ReturnType<typeof useDetailMaterials>;
}) {
  return (
    <OnTrack progress={progress}>
      {/* Pillars */}
      <mesh position={[-0.52, 0.5, 0]} material={mats.stone} castShadow>
        <boxGeometry args={[0.2, 1.0, 0.36]} />
      </mesh>
      <mesh position={[0.52, 0.5, 0]} material={mats.stone} castShadow>
        <boxGeometry args={[0.2, 1.0, 0.36]} />
      </mesh>
      {/* Lintel */}
      <mesh position={[0, 1.02, 0]} material={mats.stone} castShadow>
        <boxGeometry args={[1.34, 0.22, 0.4]} />
      </mesh>
      {/* Keystone */}
      <mesh position={[0, 1.16, 0]} material={mats.stone}>
        <boxGeometry args={[0.2, 0.16, 0.42]} />
      </mesh>
      {/* Dark interior depth */}
      <mesh position={[0, 0.5, -0.25]} material={mats.dark}>
        <boxGeometry args={[0.86, 0.96, 0.1]} />
      </mesh>
      {/* Warm glow inside the mouth */}
      <mesh position={[0, 0.42, -0.12]} material={mats.glow}>
        <boxGeometry args={[0.7, 0.7, 0.04]} />
      </mesh>
    </OnTrack>
  );
}

/** A timber trestle: vertical posts from a low track section down to the plinth. */
function Trestle({ mats }: { mats: ReturnType<typeof useDetailMaterials> }) {
  const plinthTopY = -0.76;
  const posts = useMemo(() => {
    const out: { pos: [number, number, number]; h: number }[] = [];
    for (let i = 0; i <= 6; i += 1) {
      const p = 0.085 + (i / 6) * 0.07; // low valley section
      const pt = getTrackPoint(p);
      const h = Math.max(pt.y - plinthTopY, 0.1);
      out.push({ pos: [pt.x, plinthTopY + h / 2, pt.z], h });
    }
    return out;
  }, []);
  return (
    <group>
      {posts.map((post, i) => (
        <mesh key={i} position={post.pos} material={mats.timber} castShadow>
          <boxGeometry args={[0.09, post.h, 0.09]} />
        </mesh>
      ))}
    </group>
  );
}

/** A small campfire near the valley station. */
function Campfire({ mats }: { mats: ReturnType<typeof useDetailMaterials> }) {
  const flameRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const t = useRef(0);

  const base = useMemo(() => {
    const v = getStationPosition(STATION_PLACEMENTS[0]);
    // Offset to the side of the depot, sitting on the surface.
    return new THREE.Vector3(v.x * 0.86, v.y + 0.05, v.z * 0.86);
  }, []);

  useFrame((_, delta) => {
    t.current += delta;
    const flick = 0.75 + Math.sin(t.current * 9) * 0.15 + Math.sin(t.current * 23) * 0.08;
    if (flameRef.current) {
      flameRef.current.scale.y = flick;
      (flameRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        2.2 * flick;
    }
    if (lightRef.current) lightRef.current.intensity = 2.6 * flick;
  });

  return (
    <group position={[base.x, base.y, base.z]}>
      {/* Logs */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[0, 0.04, 0]}
          rotation={[Math.PI / 2, 0, (i / 3) * Math.PI]}
          material={mats.timber}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.34, 6]} />
        </mesh>
      ))}
      {/* Flame */}
      <mesh ref={flameRef} position={[0, 0.16, 0]}>
        <coneGeometry args={[0.1, 0.34, 8]} />
        <meshStandardMaterial
          color={"#ff8a3c"}
          emissive={new THREE.Color("#ff6a1f")}
          emissiveIntensity={2.2}
          roughness={0.4}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.3, 0]} intensity={2.6} distance={4.5} decay={2} color={"#ff8a3c"} />
    </group>
  );
}

export default function Details() {
  const mats = useDetailMaterials();
  return (
    <group>
      <TunnelPortal progress={0.34} mats={mats} />
      <TunnelPortal progress={0.7} mats={mats} />
      <Trestle mats={mats} />
      <Campfire mats={mats} />
    </group>
  );
}
