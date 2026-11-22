import { useMemo } from "react";
import * as THREE from "three";
import { STATION_PLACEMENTS, getStationPosition } from "../../scene/scene-config";

/**
 * A frozen alpine tarn on the tabletop near the valley station: an icy ellipse
 * with a cool sheen, a snow rim, and a couple of cracks. Lives in the world
 * group so it rotates with the mountain and stays by the valley.
 */
export default function FrozenLake() {
  const pos = useMemo(() => {
    const v = getStationPosition(STATION_PLACEMENTS[0]);
    const ang = Math.atan2(v.z, v.x) + 0.42; // around the base from the depot
    const r = 10.75;
    return new THREE.Vector3(Math.cos(ang) * r, -0.72, Math.sin(ang) * r);
  }, []);

  const yaw = Math.atan2(pos.x, pos.z);

  return (
    <group position={[pos.x, pos.y, pos.z]} rotation={[0, yaw, 0]}>
      {/* Snow rim slightly below and wider than the ice */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} scale={[1.5, 1, 1]} receiveShadow>
        <circleGeometry args={[1.25, 32]} />
        <meshStandardMaterial color={"#eef3fa"} roughness={0.9} />
      </mesh>
      {/* Ice surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} scale={[1.42, 1, 0.92]} receiveShadow>
        <circleGeometry args={[1.05, 32]} />
        <meshStandardMaterial
          color={"#b7d5e8"}
          roughness={0.12}
          metalness={0.2}
          emissive={new THREE.Color("#24405a")}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Cracks */}
      {[
        [0.1, 0.02, 0.3],
        [-0.3, 0.02, -0.1],
        [0.4, 0.02, -0.25],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, (i / 3) * Math.PI, 0]}>
          <boxGeometry args={[0.9, 0.006, 0.012]} />
          <meshStandardMaterial color={"#dcebf5"} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
