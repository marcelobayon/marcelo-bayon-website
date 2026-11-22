import { type MutableRefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { STATION_PLACEMENTS, getStationPosition } from "../../scene/scene-config";
import { PALETTE } from "../../lib/theme";

function useStationMaterials() {
  return useMemo(() => {
    const stone = new THREE.MeshStandardMaterial({ color: "#6b7078", roughness: 0.9 });
    const timber = new THREE.MeshStandardMaterial({
      color: PALETTE.timber,
      roughness: 0.8,
    });
    const roof = new THREE.MeshStandardMaterial({ color: "#2a3340", roughness: 0.7 });
    const warm = new THREE.MeshStandardMaterial({
      color: PALETTE.amber,
      emissive: new THREE.Color(PALETTE.amber),
      emissiveIntensity: 2.1,
      roughness: 0.5,
    });
    const forge = new THREE.MeshStandardMaterial({
      color: "#ff7a3c",
      emissive: new THREE.Color("#ff6a2a"),
      emissiveIntensity: 2,
      roughness: 0.5,
    });
    const glass = new THREE.MeshStandardMaterial({
      color: PALETTE.ice,
      emissive: new THREE.Color("#2b6fa5"),
      emissiveIntensity: 0.5,
      roughness: 0.15,
      metalness: 0.3,
    });
    const brass = new THREE.MeshStandardMaterial({
      color: PALETTE.brass,
      roughness: 0.3,
      metalness: 0.9,
    });
    const dome = new THREE.MeshStandardMaterial({
      color: "#8aa0b8",
      roughness: 0.3,
      metalness: 0.5,
    });
    return { stone, timber, roof, warm, forge, glass, brass, dome };
  }, []);
}

type M = ReturnType<typeof useStationMaterials>;

function ValleyDepot({ m }: { m: M }) {
  return (
    <group>
      <mesh position={[0, 0.3, 0]} material={m.timber} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.6, 0.8]} />
      </mesh>
      <mesh position={[0, 0.68, 0]} rotation={[0, 0, 0]} material={m.roof} castShadow>
        <boxGeometry args={[1.7, 0.12, 1.0]} />
      </mesh>
      {/* Platform canopy */}
      <mesh position={[0, 0.5, 0.6]} material={m.roof} castShadow>
        <boxGeometry args={[1.6, 0.06, 0.5]} />
      </mesh>
      {[-0.5, 0, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.3, 0.41]} material={m.warm}>
          <boxGeometry args={[0.22, 0.26, 0.02]} />
        </mesh>
      ))}
    </group>
  );
}

function AcademyRidge({ m }: { m: M }) {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} material={m.stone} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.7, 0.75]} />
      </mesh>
      <mesh position={[0, 0.72, 0]} material={m.roof} castShadow>
        <boxGeometry args={[1.45, 0.1, 0.9]} />
      </mesh>
      {/* Clock tower */}
      <mesh position={[0.45, 0.9, 0]} material={m.stone} castShadow>
        <boxGeometry args={[0.4, 1.4, 0.4]} />
      </mesh>
      <mesh position={[0.45, 1.65, 0]} material={m.roof} castShadow>
        <coneGeometry args={[0.32, 0.4, 4]} />
      </mesh>
      <mesh position={[0.45, 1.2, 0.205]} material={m.warm}>
        <circleGeometry args={[0.12, 16]} />
      </mesh>
      {[-0.35, 0.05].map((x) => (
        <mesh key={x} position={[x, 0.32, 0.38]} material={m.warm}>
          <boxGeometry args={[0.2, 0.3, 0.02]} />
        </mesh>
      ))}
    </group>
  );
}

function FoundryCrossing({ m }: { m: M }) {
  return (
    <group>
      <mesh position={[0, 0.33, 0]} material={m.stone} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.66, 0.9]} />
      </mesh>
      {/* Sawtooth roof */}
      {[-0.4, 0, 0.4].map((x) => (
        <mesh key={x} position={[x, 0.73, 0]} rotation={[0, 0, 0.5]} material={m.roof}>
          <boxGeometry args={[0.3, 0.16, 0.92]} />
        </mesh>
      ))}
      {/* Chimney with forge glow */}
      <mesh position={[0.5, 0.95, -0.2]} material={m.stone} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 1.3, 12]} />
      </mesh>
      <mesh position={[0.5, 1.62, -0.2]} material={m.forge}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 12]} />
      </mesh>
      {/* Forge doorway glow */}
      <mesh position={[0, 0.26, 0.46]} material={m.forge}>
        <boxGeometry args={[0.4, 0.4, 0.02]} />
      </mesh>
    </group>
  );
}

function DevelopersPass({ m }: { m: M }) {
  return (
    <group>
      {/* Glass research block */}
      <mesh position={[0, 0.4, 0]} material={m.glass} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.8, 0.8]} />
      </mesh>
      <mesh position={[0, 0.82, 0]} material={m.brass} castShadow>
        <boxGeometry args={[1.2, 0.06, 0.9]} />
      </mesh>
      {/* Dish antenna */}
      <mesh position={[0.3, 1.0, 0]} rotation={[0.6, 0.4, 0]} material={m.dome}>
        <sphereGeometry args={[0.22, 16, 8, 0, Math.PI]} />
      </mesh>
      <mesh position={[-0.3, 0.95, 0]} material={m.brass}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
      </mesh>
    </group>
  );
}

function InnovationVillage({ m }: { m: M }) {
  const houses: [number, number, number][] = [
    [-0.5, 0.26, 0.1],
    [0.1, 0.32, -0.1],
    [0.6, 0.22, 0.2],
  ];
  return (
    <group>
      {houses.map(([x, h, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, h, 0]} material={m.timber} castShadow receiveShadow>
            <boxGeometry args={[0.5, h * 2, 0.5]} />
          </mesh>
          <mesh position={[0, h * 2 + 0.08, 0]} rotation={[0, 0.78, 0]} material={m.roof}>
            <coneGeometry args={[0.42, 0.26, 4]} />
          </mesh>
          <mesh position={[0, h, 0.26]} material={m.warm}>
            <boxGeometry args={[0.16, 0.16, 0.02]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SummitObservatory({ m }: { m: M }) {
  return (
    <group>
      <mesh position={[0, 0.3, 0]} material={m.stone} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.62, 0.6, 24]} />
      </mesh>
      <mesh position={[0, 0.68, 0]} material={m.dome} castShadow>
        <sphereGeometry args={[0.55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* Dome slit */}
      <mesh position={[0, 0.85, 0.3]} material={m.glass}>
        <boxGeometry args={[0.12, 0.5, 0.3]} />
      </mesh>
      {/* Telescope hint */}
      <mesh position={[0, 0.9, 0.2]} rotation={[0.7, 0, 0]} material={m.brass}>
        <cylinderGeometry args={[0.05, 0.07, 0.6, 12]} />
      </mesh>
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} position={[x, 0.3, 0.52]} material={m.warm}>
          <boxGeometry args={[0.14, 0.2, 0.02]} />
        </mesh>
      ))}
    </group>
  );
}

const BUILDINGS = [
  ValleyDepot,
  AcademyRidge,
  FoundryCrossing,
  DevelopersPass,
  InnovationVillage,
  SummitObservatory,
];

export default function Stations({
  activeIndexRef,
}: {
  activeIndexRef: MutableRefObject<number>;
}) {
  const m = useStationMaterials();

  const placements = useMemo(
    () =>
      STATION_PLACEMENTS.map((p) => {
        const pos = getStationPosition(p);
        const yaw = Math.atan2(pos.x, pos.z); // face outward from the axis
        return { pos, yaw };
      }),
    [],
  );

  // One shared highlight ring that moves to the active station.
  const ringRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const ringTarget = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    const ring = ringRef.current;
    if (!ring) return;
    t.current += delta;
    const target = placements[activeIndexRef.current]?.pos;
    if (target) {
      ringTarget.set(target.x, target.y + 0.08, target.z);
      ring.position.lerp(ringTarget, 0.12);
    }
    const pulse = 1 + Math.sin(t.current * 2.2) * 0.08;
    ring.scale.setScalar(pulse);
    const mat = ring.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.35 + Math.sin(t.current * 2.2) * 0.12;
  });

  return (
    <>
      {placements.map(({ pos, yaw }, i) => {
        const Building = BUILDINGS[i];
        return (
          <group
            key={STATION_PLACEMENTS[i].id}
            position={[pos.x, pos.y - 0.04, pos.z]}
            rotation={[0, yaw, 0]}
          >
            {/* Carved pad under the building */}
            <mesh position={[0, 0, 0]} receiveShadow>
              <cylinderGeometry args={[1.0, 1.1, 0.12, 20]} />
              <meshStandardMaterial color={"#e9eff6"} roughness={0.9} />
            </mesh>
            <Building m={m} />
          </group>
        );
      })}

      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.32, 36]} />
        <meshBasicMaterial
          color={PALETTE.amber}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
