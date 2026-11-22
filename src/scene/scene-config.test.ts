import { describe, it, expect } from "vitest";
import {
  MOUNTAIN_CONFIG,
  mountainRadiusAt,
  mountainSpline,
  trackFrames,
  sampleFrame,
  getStationPosition,
  STATION_PLACEMENTS,
  validateTrackClearance,
  distanceToProgressDelta,
  TRACK_LENGTH,
} from "./scene-config";

describe("mountain profile", () => {
  it("matches base and top radius at the ends", () => {
    expect(mountainRadiusAt(0)).toBeCloseTo(MOUNTAIN_CONFIG.baseRadius);
    expect(mountainRadiusAt(1)).toBeCloseTo(MOUNTAIN_CONFIG.topRadius);
  });

  it("is monotonically decreasing with height", () => {
    let prev = Infinity;
    for (let t = 0; t <= 1; t += 0.1) {
      const r = mountainRadiusAt(t);
      expect(r).toBeLessThanOrEqual(prev + 1e-9);
      prev = r;
    }
  });
});

describe("spline", () => {
  it("has positive arc length", () => {
    expect(TRACK_LENGTH).toBeGreaterThan(0);
    expect(mountainSpline.getLength()).toBeCloseTo(TRACK_LENGTH);
  });

  it("climbs from valley (y≈0) to summit (y≈height)", () => {
    const start = mountainSpline.getPointAt(0);
    const end = mountainSpline.getPointAt(1);
    expect(start.y).toBeLessThan(1);
    expect(end.y).toBeGreaterThan(MOUNTAIN_CONFIG.height - 1);
  });

  it("maps a world distance to a fractional progress delta", () => {
    const delta = distanceToProgressDelta(MOUNTAIN_CONFIG.baseRadius);
    expect(delta).toBeGreaterThan(0);
    expect(delta).toBeLessThan(1);
  });
});

describe("parallel-transport frames", () => {
  it("produces a frame per segment plus one", () => {
    expect(trackFrames.length).toBe(401);
  });

  it("keeps an orthonormal, unit-tangent frame", () => {
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      const f = sampleFrame(p);
      expect(f.tangent.length()).toBeCloseTo(1, 2);
      expect(f.normal.length()).toBeCloseTo(1, 2);
      // tangent and normal stay perpendicular (no twist collapse).
      expect(Math.abs(f.tangent.dot(f.normal))).toBeLessThan(0.05);
    }
  });

  it("keeps the train upright (up stays well above horizontal, no roll-over)", () => {
    for (let i = 0; i < trackFrames.length; i += 1) {
      // Upright frame field: 'up' only tilts with track slope, never banks
      // onto its side, so its y-component stays strongly positive everywhere.
      expect(trackFrames[i].normal.y).toBeGreaterThan(0.3);
    }
  });
});

describe("track clearance", () => {
  it("stays clear of the mountain body along the whole spline", () => {
    const { minClearance } = validateTrackClearance(300);
    expect(minClearance).toBeGreaterThan(0);
  });
});

describe("station placement", () => {
  it("places every station off the mountain axis and above the base", () => {
    for (const p of STATION_PLACEMENTS) {
      const v = getStationPosition(p);
      const radius = Math.hypot(v.x, v.z);
      expect(radius).toBeGreaterThan(0);
      expect(radius).toBeLessThan(MOUNTAIN_CONFIG.baseRadius + 3);
      expect(v.y).toBeGreaterThanOrEqual(-0.5);
      expect(v.y).toBeLessThanOrEqual(MOUNTAIN_CONFIG.height + 1);
    }
  });

  it("orders stations by increasing height (valley → summit)", () => {
    const ys = STATION_PLACEMENTS.map((p) => getStationPosition(p).y);
    for (let i = 1; i < ys.length; i += 1) {
      expect(ys[i]).toBeGreaterThan(ys[i - 1]);
    }
  });
});
