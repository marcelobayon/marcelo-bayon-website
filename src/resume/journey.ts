import { STATIONS } from "../data/resume-content";
import { clampProgress } from "../scene/scene-config";

/**
 * How the visitor is currently driving the journey.
 * - guided: scroll position maps to train progress (default).
 * - direct: a station was selected; we smooth-scroll to its progress.
 * - free:   the visitor is orbiting the scene; auto-camera framing pauses.
 */
export type NavigationMode = "guided" | "direct" | "free";

/** The station nearest to a normalized journey progress (0–1). */
export function nearestStationIndex(progress: number): number {
  const p = clampProgress(progress);
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < STATIONS.length; i += 1) {
    const d = Math.abs(STATIONS[i].progress - p);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

export function stationById(id: string) {
  return STATIONS.find((s) => s.id === id);
}

/** Map a station's normalized progress to a page scroll offset in pixels. */
export function progressToScrollTop(progress: number): number {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  return clampProgress(progress) * Math.max(scrollable, 1);
}

/** Current normalized progress from the page scroll position. */
export function scrollTopToProgress(): number {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  return clampProgress(window.scrollY / scrollable);
}
