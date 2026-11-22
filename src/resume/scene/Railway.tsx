import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { trackFrames } from "../../scene/scene-config";
import { PALETTE } from "../../lib/theme";

const GAUGE = 0.5;
const RAIL_RADIUS = 0.045;
const RAIL_LIFT = 0.13; // along frame normal, above the mountain surface
const SLEEPER_LIFT = 0.05;
const SLEEPER_EVERY = 3; // place a sleeper every Nth frame

export default function Railway() {
  // Two rails: offset the frame positions left/right along the binormal and
  // lift them along the normal, then loft a tube through each set of points.
  const { leftRail, rightRail } = useMemo(() => {
    const left: THREE.Vector3[] = [];
    const right: THREE.Vector3[] = [];
    for (const f of trackFrames) {
      const base = f.position.clone().addScaledVector(f.normal, RAIL_LIFT);
      left.push(base.clone().addScaledVector(f.binormal, GAUGE / 2));
      right.push(base.clone().addScaledVector(f.binormal, -GAUGE / 2));
    }
    const mk = (pts: THREE.Vector3[]) =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts, false, "centripetal"),
        trackFrames.length,
        RAIL_RADIUS,
        6,
        false,
      );
    return { leftRail: mk(left), rightRail: mk(right) };
  }, []);

  // Sleepers: instanced boxes oriented to the local frame.
  const sleeperGeo = useMemo(() => new THREE.BoxGeometry(GAUGE + 0.26, 0.07, 0.12), []);
  const sleeperFrames = useMemo(
    () => trackFrames.filter((_, i) => i % SLEEPER_EVERY === 0),
    [],
  );
  const sleepersRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = sleepersRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const basis = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    sleeperFrames.forEach((f, i) => {
      // Local axes: X = binormal (across track), Y = normal (up), Z = tangent.
      basis.makeBasis(f.binormal, f.normal, f.tangent);
      pos.copy(f.position).addScaledVector(f.normal, SLEEPER_LIFT);
      m.copy(basis).setPosition(pos);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [sleeperFrames]);

  return (
    <group>
      <mesh geometry={leftRail} castShadow>
        <meshStandardMaterial color={PALETTE.rail} roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh geometry={rightRail} castShadow>
        <meshStandardMaterial color={PALETTE.rail} roughness={0.5} metalness={0.7} />
      </mesh>
      <instancedMesh
        ref={sleepersRef}
        args={[sleeperGeo, undefined, sleeperFrames.length]}
        castShadow
      >
        <meshStandardMaterial color={PALETTE.timber} roughness={0.85} />
      </instancedMesh>
    </group>
  );
}
