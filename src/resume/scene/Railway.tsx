import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MOUNTAIN_CONFIG, trackFrames } from "../../scene/scene-config";
import { PALETTE } from "../../lib/theme";

const GAUGE = 0.5;
const RAIL_RADIUS = 0.04;
const SLEEPER_EVERY = 3;

// The frames sit on the spline, which is trackSurfaceOffset proud of the body
// skin. Measure everything from the skin so the track is seated in the slope,
// not floating above it.
const DROP = MOUNTAIN_CONFIG.trackSurfaceOffset;
const RAIL_H = -DROP + 0.1;
const SLEEPER_H = -DROP + 0.03;
const ROADBED_H = -DROP + 0.005;
const ROADBED_HALF = GAUGE / 2 + 0.16;

export default function Railway() {
  const { leftRail, rightRail } = useMemo(() => {
    const left: THREE.Vector3[] = [];
    const right: THREE.Vector3[] = [];
    for (const f of trackFrames) {
      const base = f.position.clone().addScaledVector(f.normal, RAIL_H);
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

  // Ballast roadbed: a flat ribbon swept along the track, flush on the skin.
  const roadbed = useMemo(() => {
    const positions: number[] = [];
    const index: number[] = [];
    for (const f of trackFrames) {
      const base = f.position.clone().addScaledVector(f.normal, ROADBED_H);
      const l = base.clone().addScaledVector(f.binormal, ROADBED_HALF);
      const r = base.clone().addScaledVector(f.binormal, -ROADBED_HALF);
      positions.push(l.x, l.y, l.z, r.x, r.y, r.z);
    }
    for (let i = 0; i < trackFrames.length - 1; i += 1) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = (i + 1) * 2;
      const d = (i + 1) * 2 + 1;
      index.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(index);
    g.computeVertexNormals();
    return g;
  }, []);

  const sleeperGeo = useMemo(() => new THREE.BoxGeometry(GAUGE + 0.28, 0.08, 0.12), []);
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
      basis.makeBasis(f.binormal, f.normal, f.tangent);
      pos.copy(f.position).addScaledVector(f.normal, SLEEPER_H);
      m.copy(basis).setPosition(pos);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [sleeperFrames]);

  return (
    <group>
      <mesh geometry={roadbed} receiveShadow>
        <meshStandardMaterial color={"#2b2a2e"} roughness={1} side={THREE.DoubleSide} />
      </mesh>
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
