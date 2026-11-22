import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDocumentHead } from "../lib/useDocumentHead";
import { useReducedMotion } from "../lib/useReducedMotion";
import { isWebGLAvailable } from "../lib/webgl";
import TraditionalResume from "../resume/TraditionalResume";
import RouteFallback from "../components/RouteFallback";
import "../resume/resume.css";

// The WebGL scene is a second code-split layer: visitors who only read the
// text résumé never download three.js at all.
const RailwayExperience = lazy(() => import("../resume/RailwayExperience"));

type Mode = "ride" | "text";

export default function ResumePage() {
  useDocumentHead({
    title: "Résumé — Marcelo Bayon | The Midnight Mountain Railway",
    description:
      "The interactive resume of Marcelo Bayon — ride a model mountain railway through his software and operations career, or read the full text résumé.",
    canonical: "https://resume.marcelobayon.com/resume",
  });

  const reducedMotion = useReducedMotion();
  const location = useLocation();

  // WebGL support is detected once on mount (client-only).
  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => {
    setWebgl(isWebGLAvailable());
  }, []);

  const wantsTextFirst = location.hash === "#resume-text";

  // Default experience: the ride, unless the visitor prefers reduced motion,
  // asked for the text résumé, or WebGL is unavailable.
  const defaultMode: Mode = useMemo(() => {
    if (wantsTextFirst) return "text";
    if (reducedMotion) return "text";
    if (webgl === false) return "text";
    return "ride";
  }, [wantsTextFirst, reducedMotion, webgl]);

  const [mode, setMode] = useState<Mode>(defaultMode);

  // Sync once WebGL detection resolves (null → true/false).
  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  // Wait for the one-tick WebGL probe before committing to a layout.
  if (webgl === null) {
    return <RouteFallback label="Preparing the résumé…" />;
  }

  if (mode === "text" || !webgl) {
    return (
      <TraditionalResume
        canRide={webgl && !reducedMotion}
        onRide={() => setMode("ride")}
        reducedMotion={reducedMotion}
      />
    );
  }

  return (
    <Suspense fallback={<RouteFallback label="Building the mountain…" />}>
      <RailwayExperience onExitToText={() => setMode("text")} />
    </Suspense>
  );
}
