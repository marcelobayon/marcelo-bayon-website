/**
 * Scene geometry + motion source of truth for the "Floating Modular Core" at
 * /engineering/interactive.
 *
 * Mirrors the conventions of src/scene/scene-config.ts (the railway): every
 * target position is PROCEDURALLY computed from index math — no hardcoded
 * coordinates — and the per-frame helpers reuse module-level scratch objects so
 * animating all the blocks allocates zero heap per frame.
 *
 * The narrative: the same base parts (blocks) re-assemble into a new formation
 * for each scroll section, so a non-technical visitor literally sees
 * "plug-and-play reusability." Each block is also bound to a real kit module
 * (log / config / resilience / result / timing) so clicking it opens that area.
 */

import * as THREE from "three";

// ============================================================================
// 1. TYPES
// ============================================================================

export type ModuleShape = "cube" | "prism" | "ring";
export type ModuleFinish = "matte" | "frosted" | "accent";

/** A real area of the Personal Engineering Kit. Matches kit-content.ts. */
export type KitModuleId = "log" | "config" | "resilience" | "result" | "timing";

export type FormationId =
  | "orbit-scatter" // Hero: parts orbiting freely around the core
  | "stacked-pillar" // Section 1: set your standards once (log + config)
  | "radial-matrix" // Section 2: survive failure (resilience + result)
  | "unified-core"; // Section 3: one kit, reused everywhere

export interface SectionFormation {
  id: FormationId;
  /** Normalized scroll range [start, end] from 0 to 1 */
  scrollRange: [number, number];
  /** Target rotation of the central hub [x, y, z] in radians */
  hubRotation: [number, number, number];
  /** Scale multiplier for the central hub */
  hubScale: number;
}

export interface ModuleTarget {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
}

export interface ModuleNode {
  index: number;
  shape: ModuleShape;
  finish: ModuleFinish;
  /** Which kit area this block represents (drives color + click target). */
  moduleId: KitModuleId;
  baseScale: number;
  /** Deterministic phase offset for idle floating & orbit speed */
  phase: number;
  orbitRadius: number;
  orbitSpeed: number;
  /** Precomputed target transform per formation */
  targets: Record<FormationId, ModuleTarget>;
}

export const CORE_CONFIG = {
  moduleCount: 24,
  hubRadius: 1.15,
  idleFloatAmplitude: 0.08,
  idleFloatFrequency: 1.4,
  /** How aggressively blocks "snap" into place near scroll stops */
  magneticSnapSharpness: 3.2,
} as const;

/**
 * The five kit modules, in a fixed order. Block N represents
 * KIT_MODULE_ORDER[N % 5], so each area gets ~5 blocks across the swarm.
 */
export const KIT_MODULE_ORDER: readonly KitModuleId[] = [
  "log",
  "config",
  "resilience",
  "result",
  "timing",
] as const;

export const SECTION_FORMATIONS: readonly SectionFormation[] = [
  {
    id: "orbit-scatter",
    scrollRange: [0.0, 0.25],
    hubRotation: [0.2, 0.0, 0.1],
    hubScale: 1.0,
  },
  {
    id: "stacked-pillar",
    scrollRange: [0.25, 0.55],
    hubRotation: [0.0, Math.PI * 0.5, 0.0],
    hubScale: 0.85,
  },
  {
    id: "radial-matrix",
    scrollRange: [0.55, 0.82],
    hubRotation: [Math.PI * 0.25, Math.PI, 0.0],
    hubScale: 0.9,
  },
  {
    id: "unified-core",
    scrollRange: [0.82, 1.0],
    hubRotation: [0.0, Math.PI * 2, 0.0],
    hubScale: 1.1,
  },
] as const;

// ============================================================================
// 2. PROCEDURAL FORMATION GENERATORS (zero hardcoded coordinates)
// ============================================================================

/** Deterministic pseudo-random helper so first render is always identical. */
function seededUnit(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function computeTargetForFormation(
  formationId: FormationId,
  index: number,
  total: number,
): ModuleTarget {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Fibonacci sphere distribution

  switch (formationId) {
    case "orbit-scatter": {
      // Fibonacci spherical shell around the central hub
      const y = 1 - (index / (total - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * index;
      const orbitR = CORE_CONFIG.hubRadius + 1.4 + seededUnit(index) * 1.1;

      return {
        position: new THREE.Vector3(
          Math.cos(theta) * radiusAtY * orbitR,
          y * orbitR * 0.85,
          Math.sin(theta) * radiusAtY * orbitR,
        ),
        rotation: new THREE.Euler(
          seededUnit(index + 1) * Math.PI,
          seededUnit(index + 2) * Math.PI,
          0,
        ),
        scale: 1.0,
      };
    }

    case "stacked-pillar": {
      // Clean 3-column architectural tower flanking the central hub
      const cols = 3;
      const col = index % cols;
      const row = Math.floor(index / cols);
      const totalRows = Math.ceil(total / cols);

      const xOffset = (col - 1) * 1.45;
      const yOffset = (row - (totalRows - 1) / 2) * 0.58;
      const zOffset = col === 1 ? 1.55 : 0.65; // center column steps forward

      return {
        position: new THREE.Vector3(xOffset, yOffset, zOffset),
        rotation: new THREE.Euler(0, col === 1 ? 0 : (col - 1) * 0.25, 0),
        scale: 0.92,
      };
    }

    case "radial-matrix": {
      // Concentric planar rings (a precision circuit/gear grid facing camera)
      const innerCount = Math.floor(total * 0.35);
      const isInner = index < innerCount;
      const ringIndex = isInner ? index : index - innerCount;
      const ringTotal = isInner ? innerCount : total - innerCount;

      const angle = (ringIndex / ringTotal) * Math.PI * 2;
      const radius = isInner ? 2.05 : 3.15;

      return {
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          isInner ? 0.35 : -0.25,
        ),
        rotation: new THREE.Euler(0, 0, angle + Math.PI / 2),
        scale: isInner ? 1.05 : 0.85,
      };
    }

    case "unified-core": {
      // Tightly docked shell hugging the central hub
      const y = 1 - (index / (total - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * index;
      const dockRadius = CORE_CONFIG.hubRadius + 0.38;

      const pos = new THREE.Vector3(
        Math.cos(theta) * radiusAtY * dockRadius,
        y * dockRadius,
        Math.sin(theta) * radiusAtY * dockRadius,
      );

      // Orient each piece with its outward normal to the core.
      const dummyLook = new THREE.Object3D();
      dummyLook.position.copy(pos);
      dummyLook.lookAt(0, 0, 0);

      return {
        position: pos,
        rotation: dummyLook.rotation.clone(),
        scale: 0.88,
      };
    }

    default: {
      // Exhaustiveness guard: adding a FormationId without a case is a compile error.
      const _never: never = formationId;
      throw new Error(`Unhandled formation: ${String(_never)}`);
    }
  }
}

/** The immutable list of modular blocks, generated once at module load. */
export const MODULAR_NODES: readonly ModuleNode[] = Array.from(
  { length: CORE_CONFIG.moduleCount },
  (_unused, index): ModuleNode => {
    const shapes: ModuleShape[] = ["cube", "prism", "ring"];
    const shape = shapes[index % shapes.length];

    // ~15% accent, ~35% frosted glass, ~50% matte ceramic
    const finish: ModuleFinish =
      index % 7 === 0 ? "accent" : index % 3 === 0 ? "frosted" : "matte";

    const moduleId = KIT_MODULE_ORDER[index % KIT_MODULE_ORDER.length];

    const targets = {} as Record<FormationId, ModuleTarget>;
    for (const formation of SECTION_FORMATIONS) {
      targets[formation.id] = computeTargetForFormation(
        formation.id,
        index,
        CORE_CONFIG.moduleCount,
      );
    }

    return {
      index,
      shape,
      finish,
      moduleId,
      baseScale: 0.28 + seededUnit(index + 10) * 0.14,
      phase: seededUnit(index + 20) * Math.PI * 2,
      orbitRadius: 0.12 + seededUnit(index + 30) * 0.15,
      orbitSpeed: 0.4 + seededUnit(index + 40) * 0.5,
      targets,
    };
  },
);

// ============================================================================
// 3. GC-FRIENDLY PER-FRAME HELPERS (zero per-frame heap allocations)
// ============================================================================

const _posA = new THREE.Vector3();
const _posB = new THREE.Vector3();
const _quatA = new THREE.Quaternion();
const _quatB = new THREE.Quaternion();
const _outPos = new THREE.Vector3();
const _outQuat = new THREE.Quaternion();

export interface FrameTransformResult {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
  /** 0 mid-flight, 1 when magnetically locked into a formation */
  snapFactor: number;
}

const _sharedResult: FrameTransformResult = {
  position: _outPos,
  quaternion: _outQuat,
  scale: 1,
  snapFactor: 0,
};

/**
 * Sigmoid-like magnetic ease: lingers near 0 and 1 so blocks detach with
 * resistance and snap cleanly into their destination slots.
 */
export function magneticEase(t: number, sharpness: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped === 0 || clamped === 1) return clamped;
  const a = Math.pow(clamped, sharpness);
  const b = Math.pow(1 - clamped, sharpness);
  return a / (a + b);
}

/** Resolve the active pair of formations and blend progress from page scroll. */
export function resolveScrollFormations(scrollOffset: number): {
  from: SectionFormation;
  to: SectionFormation;
  progress: number;
} {
  const s = Math.max(0, Math.min(1, scrollOffset));
  const count = SECTION_FORMATIONS.length;

  const scaled = s * (count - 1);
  const fromIdx = Math.min(Math.floor(scaled), count - 2);
  const toIdx = fromIdx + 1;
  const rawProgress = scaled - fromIdx;

  return {
    from: SECTION_FORMATIONS[fromIdx],
    to: SECTION_FORMATIONS[toIdx],
    progress: magneticEase(rawProgress, CORE_CONFIG.magneticSnapSharpness),
  };
}

/** Which section index a scroll offset currently sits in (nearest stop). */
export function activeSectionIndex(scrollOffset: number): number {
  const s = Math.max(0, Math.min(1, scrollOffset));
  const scaled = s * (SECTION_FORMATIONS.length - 1);
  return Math.round(scaled);
}

/**
 * Compute position / rotation / scale for one block, for use inside useFrame.
 * Reuses module-level scratch objects — copy `.position` and `.quaternion`
 * into your mesh immediately, before calling again for the next node.
 */
export function getModuleTransform(
  node: ModuleNode,
  scrollOffset: number,
  elapsedTime: number,
  reducedMotion = false,
): FrameTransformResult {
  const { from, to, progress } = resolveScrollFormations(scrollOffset);
  const targetFrom = node.targets[from.id];
  const targetTo = node.targets[to.id];

  // 1. Interpolate base formation position
  _posA.copy(targetFrom.position);
  _posB.copy(targetTo.position);
  _outPos.lerpVectors(_posA, _posB, progress);

  const flightArc = Math.sin(progress * Math.PI);
  const snapFactor = 1 - flightArc;

  if (!reducedMotion) {
    // 2. Tangential arc mid-flight so blocks curve around the hub
    const arcAngle = elapsedTime * node.orbitSpeed + node.phase;
    _outPos.x += Math.cos(arcAngle) * node.orbitRadius * flightArc * 2.5;
    _outPos.z += Math.sin(arcAngle) * node.orbitRadius * flightArc * 2.5;

    // 3. Gentle idle breathing (dampened when docked in unified-core)
    const isDocked = to.id === "unified-core" && progress > 0.85;
    const hoverDamp = isDocked ? 0.2 : 1.0;
    _outPos.y +=
      Math.sin(elapsedTime * CORE_CONFIG.idleFloatFrequency + node.phase) *
      CORE_CONFIG.idleFloatAmplitude *
      hoverDamp;
  }

  // 4. Slerp for smooth rotational alignment
  _quatA.setFromEuler(targetFrom.rotation);
  _quatB.setFromEuler(targetTo.rotation);
  _outQuat.slerpQuaternions(_quatA, _quatB, progress);

  // 5. Scale interpolation
  const targetScale = THREE.MathUtils.lerp(targetFrom.scale, targetTo.scale, progress);
  _sharedResult.scale = node.baseScale * targetScale;
  _sharedResult.snapFactor = snapFactor;
  return _sharedResult;
}

/** Interpolated hub rotation + scale for the current scroll offset. */
const _hubEuler = new THREE.Euler();
export function getHubTransform(
  scrollOffset: number,
  elapsedTime: number,
  reducedMotion = false,
): { rotation: THREE.Euler; scale: number } {
  const { from, to, progress } = resolveScrollFormations(scrollOffset);
  const drift = reducedMotion ? 0 : Math.sin(elapsedTime * 0.3) * 0.05;
  _hubEuler.set(
    THREE.MathUtils.lerp(from.hubRotation[0], to.hubRotation[0], progress),
    THREE.MathUtils.lerp(from.hubRotation[1], to.hubRotation[1], progress) + drift,
    THREE.MathUtils.lerp(from.hubRotation[2], to.hubRotation[2], progress),
  );
  const scale = THREE.MathUtils.lerp(from.hubScale, to.hubScale, progress);
  return { rotation: _hubEuler, scale };
}

/** Palette for the modular core, aligned to the site's CSS tokens. */
export const CORE_PALETTE = {
  hubBase: "#17263c", // deep matte charcoal-blue (matches --c-mountain-shadow)
  hubSeam: "#a9c7d8", // ice seam
  matte: "#e6edf5", // snow / architectural ceramic
  frosted: "#a9c7d8", // ice / translucent glass tint
  accent: "#fbbf24", // amber highlight node
} as const;

/** Signature color per kit area — all within the site's cool + amber palette. */
export const MODULE_COLORS: Record<KitModuleId, string> = {
  log: "#a9c7d8", // ice
  config: "#b88a45", // brass
  resilience: "#fbbf24", // amber
  result: "#e6edf5", // snow
  timing: "#7f9bb3", // muted steel
};
