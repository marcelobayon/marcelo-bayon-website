import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MOUNTAIN_CONFIG } from "../../scene/scene-config";

const TREE_COUNT = 46;
const PLINTH_TOP_Y = -0.76;

type Placement = { x: number; z: number; s: number; r: number };

function usePlacements(): Placement[] {
  return useMemo(() => {
    let seed = 90210;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    const out: Placement[] = [];
    for (let i = 0; i < TREE_COUNT; i += 1) {
      const angle = rand() * Math.PI * 2;
      // Ring of exposed plinth just outside the mountain base.
      const radius =
        MOUNTAIN_CONFIG.baseRadius +
        0.4 +
        rand() * (MOUNTAIN_CONFIG.plinthRadius - MOUNTAIN_CONFIG.baseRadius - 0.6);
      out.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        s: 0.7 + rand() * 0.7,
        r: rand() * Math.PI * 2,
      });
    }
    return out;
  }, []);
}

export default function Environment() {
  const placements = usePlacements();
  const foliageRef = useRef<THREE.InstancedMesh>(null);
  const trunkRef = useRef<THREE.InstancedMesh>(null);

  const foliageGeo = useMemo(() => new THREE.ConeGeometry(0.24, 0.72, 7), []);
  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.05, 0.06, 0.22, 6), []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    placements.forEach((p, i) => {
      q.setFromAxisAngle(up, p.r);

      // Foliage cone
      pos.set(p.x, PLINTH_TOP_Y + 0.46 * p.s, p.z);
      scl.setScalar(p.s);
      m.compose(pos, q, scl);
      foliageRef.current?.setMatrixAt(i, m);

      // Trunk
      pos.set(p.x, PLINTH_TOP_Y + 0.11 * p.s, p.z);
      m.compose(pos, q, scl);
      trunkRef.current?.setMatrixAt(i, m);
    });
    if (foliageRef.current) foliageRef.current.instanceMatrix.needsUpdate = true;
    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
  }, [placements]);

  return (
    <group>
      <instancedMesh ref={foliageRef} args={[foliageGeo, undefined, TREE_COUNT]} castShadow>
        <meshStandardMaterial color={"#30463c"} roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={trunkRef} args={[trunkGeo, undefined, TREE_COUNT]} castShadow>
        <meshStandardMaterial color={"#3a2a1d"} roughness={0.9} />
      </instancedMesh>
    </group>
  );
}
