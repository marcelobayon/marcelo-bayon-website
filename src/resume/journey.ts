import { STATIONS } from "../data/resume-content";
import { clampProgress } from "../scene/scene-config";

/**
 * How the visitor is currently driving the journey.
 * - guided: scroll position maps to train progress (default).
 * - direct: a station was selected; we smooth-scroll to its progress.
 * - free:   the visitor is orbiting the scene; auto-camera framing pauses.
 */
export type NavigationMode = "guided" | "direct" | "free";

/**
 * The journey never starts at raw progress 0: the train has length, so at 0 the
 * cars would clamp and pile up at the base ("appear from nowhere"). We start at
 * the valley station, with the whole train already on the track, and run just
 * past the summit.
 */
export const JOURNEY_MIN = STATIONS[0].progress; // valley station
export const JOURNEY_MAX = 0.99;

function remapToJourney(frac: number): number {
  return JOURNEY_MIN + clampProgress(frac) * (JOURNEY_MAX - JOURNEY_MIN);
}
function journeyToFrac(progress: number): number {
  return (
    (clampProgress(progress) - JOURNEY_MIN) / (JOURNEY_MAX - JOURNEY_MIN)
  );
}

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
  return Math.max(0, Math.min(1, journeyToFrac(progress))) * Math.max(scrollable, 1);
}

/** Current journey progress (JOURNEY_MIN…JOURNEY_MAX) from the scroll position. */
export function scrollTopToProgress(): number {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return JOURNEY_MIN;
  return remapToJourney(window.scrollY / scrollable);
}
