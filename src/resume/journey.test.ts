import { describe, it, expect } from "vitest";
import { nearestStationIndex } from "./journey";
import { STATIONS } from "../data/resume-content";

describe("nearestStationIndex", () => {
  it("returns the first station at the very start", () => {
    expect(nearestStationIndex(0)).toBe(0);
  });

  it("returns the last station at the very end", () => {
    expect(nearestStationIndex(1)).toBe(STATIONS.length - 1);
  });

  it("snaps to each station at its own progress", () => {
    STATIONS.forEach((s, i) => {
      expect(nearestStationIndex(s.progress)).toBe(i);
    });
  });

  it("clamps out-of-range progress", () => {
    expect(nearestStationIndex(-5)).toBe(0);
    expect(nearestStationIndex(99)).toBe(STATIONS.length - 1);
  });

  it("picks the nearer of two neighbours", () => {
    const a = STATIONS[1].progress;
    const b = STATIONS[2].progress;
    expect(nearestStationIndex(a + (b - a) * 0.25)).toBe(1);
    expect(nearestStationIndex(a + (b - a) * 0.75)).toBe(2);
  });
});
