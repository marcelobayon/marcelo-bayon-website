import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentHead } from "../lib/useDocumentHead";
import { useReducedMotion } from "../lib/useReducedMotion";
import { isWebGLAvailable } from "../lib/webgl";
import RouteFallback from "../components/RouteFallback";
import "../engineering/engineering.css";

// The WebGL scene is a second code-split layer: visitors who can't (or prefer
// not to) run it never download three.js at all.
const ModularCoreExperience = lazy(() => import("../engineering/ModularCoreExperience"));

type Mode = "explore" | "text";

export default function EngineeringInteractivePage() {
  useDocumentHead({
    title: "The Floating Modular Core — Marcelo Bayon",
    description:
      "An interactive 3D model of the Personal Engineering Kit: reusable software building blocks that assemble into a different structure for each idea.",
    canonical: "https://marcelobayon.com/engineering/interactive",
  });

  const reducedMotion = useReducedMotion();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => {
    setWebgl(isWebGLAvailable());
  }, []);

  const defaultMode: Mode = useMemo(() => {
    if (reducedMotion) return "text";
    if (webgl === false) return "text";
    return "explore";
  }, [reducedMotion, webgl]);

  const [mode, setMode] = useState<Mode>(defaultMode);
  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  if (webgl === null) {
    return <RouteFallback label="Preparing the core…" />;
  }

  if (mode === "text" || !webgl) {
    return (
      <main id="main" className="core-fallback">
        <div className="container core-fallback__inner">
          <h1>The Floating Modular Core</h1>
          <p>
            {reducedMotion
              ? "You prefer reduced motion, so the animated 3D model is paused."
              : "Your browser can't run the 3D model right now."}{" "}
            The full kit is written up in plain English on the overview page.
          </p>
          <div className="core-fallback__actions">
            <Link to="/engineering" className="btn btn-primary">
              Read the overview →
            </Link>
            {webgl && reducedMotion && (
              <button type="button" className="btn btn-ghost" onClick={() => setMode("explore")}>
                Show the 3D model anyway
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <Suspense fallback={<RouteFallback label="Assembling the core…" />}>
      <ModularCoreExperience onExitToText={() => setMode("text")} />
    </Suspense>
  );
}
