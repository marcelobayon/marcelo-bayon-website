import * as THREE from "three";

/**
 * Scene configuration is the shared source of truth for geometry.
 * Coordinate convention: Y is up; X/Z define the ground plane.
 *
 * The MOUNTAIN_CONFIG / TRAIN_CONFIG / CAMERA_CONFIG / STATION_PLACEMENTS
 * values and the core spline helpers are carried over verbatim from the
 * project's starter `scene-config.ts` so this file stays the single source
 * of truth. Added below the original API: a parallel-transport frame set for
 * stable train orientation, and a track/mountain clearance validator.
 */

export type Vec3Tuple = readonly [number, number, number];

export type StationPlacement = {
  id: string;
  progress: number; // normalized arc-length progress from valley to summit
  radialOffset: number;
  verticalOffset: number;
};

export const MOUNTAIN_CONFIG = {
  baseRadius: 10,
  topRadius: 1.8,
  height: 15,
  spiralTurns: 2.35,
  splineResolution: 240,
  plinthRadius: 11.5,
  plinthHeight: 1.0,
  trackSurfaceOffset: 0.07,
} as const;

export const TRAIN_CONFIG = {
  carCount: 3,
  carSpacing: 1.15, // world-space distance; mapped through curve arc-length
  wheelRailOffset: 0.16,
  speedUnitsPerSecond: 1.7,
} as const;

/** Scroll-driven presentation spin of the whole world, radians per unit progress. */
export const PRESENTATION_SPIN = 0.7;

export const CAMERA_CONFIG = {
  initialPosition: [19, 15, 22] as Vec3Tuple,
  initialTarget: [0, 7, 0] as Vec3Tuple,
  minDistance: 13,
  maxDistance: 38,
  transitionSeconds: 0.9,
} as const;

export const STATION_PLACEMENTS: readonly StationPlacement[] = [
  // Stations sit just beside the track on the slope (small radial offset), on a
  // retaining-wall terrace built into the mountainside — not floating pads.
  { id: "valley-station", progress: 0.06, radialOffset: 0.95, verticalOffset: -0.05 },
  { id: "academy-ridge", progress: 0.23, radialOffset: 0.95, verticalOffset: -0.05 },
  { id: "foundry-crossing", progress: 0.43, radialOffset: -0.95, verticalOffset: -0.05 },
  { id: "developers-pass", progress: 0.62, radialOffset: 0.9, verticalOffset: -0.05 },
  { id: "innovation-village", progress: 0.81, radialOffset: -0.95, verticalOffset: -0.05 },
  { id: "summit-observatory", progress: 0.97, radialOffset: 0.0, verticalOffset: 0.0 },
];

/** Radius of the mountain surface at a normalized height t (0 base, 1 summit). */
export function mountainRadiusAt(t: number): number {
  return THREE.MathUtils.lerp(
    MOUNTAIN_CONFIG.baseRadius,
    MOUNTAIN_CONFIG.topRadius,
    THREE.MathUtils.clamp(t, 0, 1),
  );
}

export function createMountainSpline(): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [];
  const { height, spiralTurns, splineResolution } = MOUNTAIN_CONFIG;

  for (let i = 0; i <= splineResolution; i += 1) {
    const t = i / splineResolution;
    const radius = mountainRadiusAt(t);
    const angle = t * Math.PI * 2 * spiralTurns;
    const y = t * height;

    points.push(
      new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius),
    );
  }

  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
  curve.arcLengthDivisions = 2000;
  curve.updateArcLengths();
  return curve;
}

export const mountainSpline = createMountainSpline();

/** Total arc length of the railway in world units. */
export const TRACK_LENGTH = mountainSpline.getLength();

/**
 * Map normalized distance progress (0–1) to the curve using arc-length-aware
 * getPointAt / getTangentAt, so uniform progress ≈ uniform world speed.
 */
export function getTrackPoint(progress: number, target = new THREE.Vector3()) {
  return mountainSpline.getPointAt(THREE.MathUtils.clamp(progress, 0, 1), target);
}

export function getTrackTangent(progress: number, target = new THREE.Vector3()) {
  return mountainSpline
    .getTangentAt(THREE.MathUtils.clamp(progress, 0, 1), target)
    .normalize();
}

/**
 * Simple local frame around a track point (worldUp × tangent). Fine for static
 * placement; for the moving train prefer the parallel-transport frames below,
 * which avoid twist/flip discontinuities around the spiral.
 */
export function getTrackFrame(progress: number) {
  const point = getTrackPoint(progress);
  const tangent = getTrackTangent(progress);
  const worldUp = new THREE.Vector3(0, 1, 0);

  let right = new THREE.Vector3().crossVectors(worldUp, tangent);
  if (right.lengthSq() < 1e-6) right = new THREE.Vector3(1, 0, 0);
  right.normalize();

  const up = new THREE.Vector3().crossVectors(tangent, right).normalize();
  return { point, tangent, right, up };
}

export function getStationPosition(placement: StationPlacement) {
  const frame = getTrackFrame(placement.progress);
  return frame.point
    .clone()
    .addScaledVector(frame.right, placement.radialOffset)
    .addScaledVector(frame.up, placement.verticalOffset);
}

export function clampProgress(progress: number) {
  return THREE.MathUtils.clamp(progress, 0, 1);
}

// ---------------------------------------------------------------------------
// Orientation frames sampled once along the curve. For a mountain railway the
// train should stay UPRIGHT (its "up" close to world-up) and only follow the
// tangent in heading/pitch — unlike a rollercoaster, it must never roll onto
// its side on the tight upper spiral. We build an upright frame field:
//   forward = tangent, right = up × tangent (horizontal across-track),
//   up(normal) = tangent × right (≈ world up, tilts only with track slope).
// This is smooth as long as the tangent is never vertical, which it isn't on
// this gently climbing helix. A true parallel-transport field is also provided
// for cases (e.g. ribbons) that need twist-free transport.
// ---------------------------------------------------------------------------

export type Frame = {
  progress: number;
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  normal: THREE.Vector3; // "up" for the rolling stock
  binormal: THREE.Vector3; // "right", across the track
};

export function computeUprightFrames(segments = 400): Frame[] {
  const frames: Frame[] = [];
  const worldUp = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= segments; i += 1) {
    const progress = i / segments;
    const tangent = getTrackTangent(progress);

    let right = new THREE.Vector3().crossVectors(worldUp, tangent);
    if (right.lengthSq() < 1e-6) right = new THREE.Vector3(1, 0, 0);
    right.normalize();

    const normal = new THREE.Vector3().crossVectors(tangent, right).normalize();

    frames.push({
      progress,
      position: getTrackPoint(progress),
      tangent: tangent.clone(),
      normal,
      binormal: right,
    });
  }
  return frames;
}

/** Twist-free parallel-transport frames (kept for ribbon-like use cases). */
export function computeParallelTransportFrames(segments = 400): Frame[] {
  const frames: Frame[] = [];
  const t0 = getTrackTangent(0);
  let normal = new THREE.Vector3(0, 1, 0).addScaledVector(t0, -t0.y).normalize();
  if (normal.lengthSq() < 1e-6) normal = new THREE.Vector3(1, 0, 0);
  let prevTangent = t0.clone();

  for (let i = 0; i <= segments; i += 1) {
    const progress = i / segments;
    const tangent = getTrackTangent(progress);
    const axis = new THREE.Vector3().crossVectors(prevTangent, tangent);
    const axisLen = axis.length();
    if (axisLen > 1e-6) {
      axis.divideScalar(axisLen);
      const angle = Math.acos(THREE.MathUtils.clamp(prevTangent.dot(tangent), -1, 1));
      normal.applyAxisAngle(axis, angle);
    }
    normal.addScaledVector(tangent, -normal.dot(tangent)).normalize();
    frames.push({
      progress,
      position: getTrackPoint(progress),
      tangent: tangent.clone(),
      normal: normal.clone(),
      binormal: new THREE.Vector3().crossVectors(tangent, normal).normalize(),
    });
    prevTangent = tangent;
  }
  return frames;
}

export const trackFrames = computeUprightFrames(400);

/** Sample the parallel-transport field at an arbitrary progress (0–1). */
export function sampleFrame(progress: number): Frame {
  const p = clampProgress(progress);
  const scaled = p * (trackFrames.length - 1);
  const i = Math.floor(scaled);
  const j = Math.min(i + 1, trackFrames.length - 1);
  const a = trackFrames[i];
  const b = trackFrames[j];
  const f = scaled - i;

  return {
    progress: p,
    position: a.position.clone().lerp(b.position, f),
    tangent: a.tangent.clone().lerp(b.tangent, f).normalize(),
    normal: a.normal.clone().lerp(b.normal, f).normalize(),
    binormal: a.binormal.clone().lerp(b.binormal, f).normalize(),
  };
}

/**
 * Convert a world-space distance (e.g. car spacing) at `progress` into a
 * progress delta, so cars stay evenly spaced even where the curve bends.
 */
export function distanceToProgressDelta(distance: number): number {
  return distance / TRACK_LENGTH;
}

// ---------------------------------------------------------------------------
// Canyons: gullies carved into the mountain that the railway bridges across.
// Each is specified by the PROGRESS at which the track spans it; the gully is
// carved at that crossing's angle/height, so the track (unchanged) floats over
// the receded surface and a trestle bridge fills the gap.
// ---------------------------------------------------------------------------

export type Canyon = {
  progress: number;
  angularHalfWidth: number; // radians — how wide the gully is around the track
  heightHalfWidth: number; // normalized height — how far it runs up/down slope
  depth: number; // radial inward dip of the surface, world units
};

export const CANYONS: readonly Canyon[] = [
  { progress: 0.145, angularHalfWidth: 0.17, heightHalfWidth: 0.12, depth: 1.6 },
  { progress: 0.52, angularHalfWidth: 0.15, heightHalfWidth: 0.1, depth: 1.35 },
];

/** Each canyon's carved centre (angle + normalized height) from the track. */
export const canyonCenters = CANYONS.map((c) => {
  const pt = getTrackPoint(c.progress);
  return {
    ...c,
    angle: Math.atan2(pt.z, pt.x),
    yNorm: THREE.MathUtils.clamp(pt.y / MOUNTAIN_CONFIG.height, 0, 1),
    point: pt.clone(),
  };
});

/** Radial inward dip of the mountain surface at a world angle + normalized height. */
export function canyonDip(worldAngle: number, yNorm: number): number {
  let dip = 0;
  for (const c of canyonCenters) {
    let dA = worldAngle - c.angle;
    dA = Math.atan2(Math.sin(dA), Math.cos(dA)); // wrap to −π..π
    const dY = yNorm - c.yNorm;
    dip +=
      c.depth *
      Math.exp(-((dA / c.angularHalfWidth) ** 2) - (dY / c.heightHalfWidth) ** 2);
  }
  return dip;
}

/**
 * The railway runs in a cutting carved into the slope. At each height the track
 * is at one angle; this carves the rock back on the UPHILL side of that angle,
 * leaving a shelf the track sits on with a cut bank above it. Positive = inward.
 */
export function trackCut(worldAngle: number, yNorm: number): number {
  const thetaT =
    (yNorm * 2 * Math.PI * MOUNTAIN_CONFIG.spiralTurns) % (2 * Math.PI);
  let d = worldAngle - thetaT;
  d = Math.atan2(Math.sin(d), Math.cos(d)); // −π..π
  const width = 0.13; // angular width of the cut bank (uphill side)
  const lip = 0.05; // tiny shelf lip on the downhill side
  if (d > lip) return 0;
  if (d >= 0) return 0; // track rim: uncut
  const x = Math.min(-d / width, 1);
  return 0.6 * (x * x * (3 - 2 * x)); // smoothstep bank, up to 0.6 inward
}

/**
 * Validate that the track stays clear of the mountain skin along the whole
 * spline. The track is generated on the surface radius; this confirms the
 * sampled points never fall *inside* the (inset) mountain body. Returns the
 * minimum clearance found so a test can assert it is non-negative.
 * (Canyons only recede the surface further, so they only increase clearance.)
 */
export function validateTrackClearance(samples = 200) {
  let minClearance = Number.POSITIVE_INFINITY;
  let worstAt = 0;
  const point = new THREE.Vector3();

  for (let i = 0; i <= samples; i += 1) {
    const progress = i / samples;
    getTrackPoint(progress, point);
    const t = THREE.MathUtils.clamp(point.y / MOUNTAIN_CONFIG.height, 0, 1);
    const surfaceRadius = mountainRadiusAt(t);
    const trackRadius = Math.hypot(point.x, point.z);
    // Mountain body is inset by trackSurfaceOffset; clearance is how far the
    // track sits outside that inset body.
    const clearance = trackRadius - (surfaceRadius - MOUNTAIN_CONFIG.trackSurfaceOffset);
    if (clearance < minClearance) {
      minClearance = clearance;
      worstAt = progress;
    }
  }

  return { minClearance, worstAt };
}
