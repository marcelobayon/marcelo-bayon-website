import { type ReactNode, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  sampleFrame,
  canyonCenters,
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
    const timberDark = new THREE.MeshStandardMaterial({ color: "#4a3422", roughness: 0.9 });
    const dark = new THREE.MeshStandardMaterial({ color: "#0a0f1a", roughness: 1 });
    const glow = new THREE.MeshStandardMaterial({
      color: PALETTE.amber,
      emissive: new THREE.Color(PALETTE.amber),
      emissiveIntensity: 2.2,
      roughness: 0.5,
    });
    const rock = new THREE.MeshStandardMaterial({
      color: "#4e545d",
      roughness: 0.96,
      flatShading: true,
    });
    return { stone, timber, timberDark, dark, glow, rock };
  }, []);
}
type Mats = ReturnType<typeof useDetailMaterials>;

/** A stone portal frame at a tunnel mouth (X across, Y up, Z along track). */
function PortalFrame({ z, mats }: { z: number; mats: Mats }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-0.5, 0.42, 0]} material={mats.stone} castShadow>
        <boxGeometry args={[0.16, 0.84, 0.16]} />
      </mesh>
      <mesh position={[0.5, 0.42, 0]} material={mats.stone} castShadow>
        <boxGeometry args={[0.16, 0.84, 0.16]} />
      </mesh>
      <mesh position={[0, 0.84, 0]} material={mats.stone} castShadow>
        <boxGeometry args={[1.18, 0.2, 0.18]} />
      </mesh>
      <mesh position={[0, 0.96, 0]} material={mats.stone}>
        <boxGeometry args={[0.2, 0.16, 0.2]} />
      </mesh>
    </group>
  );
}

/**
 * A real rock tunnel the track passes THROUGH: a faceted rock mound over the
 * track with a dark bore and a framed portal at each mouth, so the rails
 * visibly enter one side and emerge from the other.
 */
function Tunnel({ progress, mats }: { progress: number; mats: Mats }) {
  return (
    <OnTrack progress={progress}>
      {/* Rock mound the bore passes through */}
      <mesh position={[0, 0.34, 0]} scale={[1.05, 0.82, 1.2]} material={mats.rock} castShadow receiveShadow>
        <icosahedronGeometry args={[0.72, 1]} />
      </mesh>
      <mesh position={[0.25, 0.5, 0.2]} scale={[0.7, 0.6, 0.7]} material={mats.rock} castShadow>
        <icosahedronGeometry args={[0.5, 1]} />
      </mesh>
      {/* Dark bore (axis along the track) */}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.dark}>
        <cylinderGeometry args={[0.4, 0.4, 1.8, 16, 1, true]} />
      </mesh>
      {/* Portal mouths */}
      <PortalFrame z={0.86} mats={mats} />
      <PortalFrame z={-0.86} mats={mats} />
    </OnTrack>
  );
}

/**
 * A timber trestle bridge spanning a canyon. Built in the track's local frame
 * (X across, Y up/normal, Z along): deck planks + stringers, side guard rails,
 * and bents of legs with X cross-bracing descending into the gully.
 */
function Bridge({
  progress,
  depth,
  mats,
}: {
  progress: number;
  depth: number;
  mats: Mats;
}) {
  const half = 1.25; // half span in world units along the track
  const legLen = Math.max(depth, 0.7);
  const planks = useMemo(() => {
    const out: number[] = [];
    for (let z = -half; z <= half; z += 0.16) out.push(z);
    return out;
  }, []);
  const railPosts = useMemo(() => {
    const out: number[] = [];
    for (let z = -half; z <= half; z += 0.42) out.push(z);
    return out;
  }, []);
  const bents = [-1.05, -0.35, 0.35, 1.05];
  const braceLen = Math.hypot(0.66, legLen);
  const braceAng = Math.atan2(0.66, legLen);

  return (
    <OnTrack progress={progress}>
      {/* Stringers (main beams under the deck) */}
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} position={[x, 0.03, 0]} material={mats.timber} castShadow>
          <boxGeometry args={[0.08, 0.08, half * 2 + 0.1]} />
        </mesh>
      ))}
      {/* Deck planks */}
      {planks.map((z, i) => (
        <mesh key={`pl${i}`} position={[0, 0.08, z]} material={mats.timberDark}>
          <boxGeometry args={[0.82, 0.05, 0.1]} />
        </mesh>
      ))}
      {/* Side guard rails */}
      {[-0.44, 0.44].map((x) => (
        <group key={`rl${x}`}>
          <mesh position={[x, 0.32, 0]} material={mats.timber}>
            <boxGeometry args={[0.05, 0.05, half * 2]} />
          </mesh>
          {railPosts.map((z, i) => (
            <mesh key={i} position={[x, 0.2, z]} material={mats.timber}>
              <boxGeometry args={[0.05, 0.3, 0.05]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Bents: legs + cross-bracing descending into the canyon */}
      {bents.map((z, i) => (
        <group key={`bt${i}`} position={[0, 0, z]}>
          {[-0.33, 0.33].map((x) => (
            <mesh key={x} position={[x, 0.03 - legLen / 2, 0]} material={mats.timber} castShadow>
              <boxGeometry args={[0.07, legLen, 0.07]} />
            </mesh>
          ))}
          {/* horizontal tie near the bottom */}
          <mesh position={[0, 0.03 - legLen * 0.8, 0]} material={mats.timber}>
            <boxGeometry args={[0.72, 0.05, 0.05]} />
          </mesh>
          {/* X cross-braces */}
          <mesh position={[0, 0.03 - legLen / 2, 0]} rotation={[0, 0, braceAng]} material={mats.timberDark}>
            <boxGeometry args={[0.04, braceLen, 0.04]} />
          </mesh>
          <mesh position={[0, 0.03 - legLen / 2, 0]} rotation={[0, 0, -braceAng]} material={mats.timberDark}>
            <boxGeometry args={[0.04, braceLen, 0.04]} />
          </mesh>
        </group>
      ))}
    </OnTrack>
  );
}

/** A small flickering campfire near the valley station. */
function Campfire({ mats }: { mats: Mats }) {
  const flameRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const t = useRef(0);

  const base = useMemo(() => {
    const v = getStationPosition(STATION_PLACEMENTS[0]);
    return new THREE.Vector3(v.x * 0.86, v.y + 0.05, v.z * 0.86);
  }, []);

  useFrame((_, delta) => {
    t.current += delta;
    const flick = 0.75 + Math.sin(t.current * 9) * 0.15 + Math.sin(t.current * 23) * 0.08;
    if (flameRef.current) {
      flameRef.current.scale.y = flick;
      (flameRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.2 * flick;
    }
    if (lightRef.current) lightRef.current.intensity = 2.6 * flick;
  });

  return (
    <group position={[base.x, base.y, base.z]}>
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
      {canyonCenters.map((c, i) => (
        <Bridge key={`bridge${i}`} progress={c.progress} depth={c.depth} mats={mats} />
      ))}
      <Tunnel progress={0.34} mats={mats} />
      <Tunnel progress={0.72} mats={mats} />
      <Campfire mats={mats} />
    </group>
  );
}
