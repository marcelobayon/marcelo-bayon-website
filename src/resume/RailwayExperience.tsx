import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import MountainScene from "./scene/MountainScene";
import ResumeOverlay from "./overlay/ResumeOverlay";
import { STATIONS } from "../data/resume-content";
import {
  nearestStationIndex,
  progressToScrollTop,
  scrollTopToProgress,
} from "./journey";
import { CAMERA_CONFIG } from "../scene/scene-config";
import { useReducedMotion } from "../lib/useReducedMotion";

type Props = { onExitToText: () => void };

export default function RailwayExperience({ onExitToText }: Props) {
  const reducedMotion = useReducedMotion();

  // Lower the quality bar on phones: no real-time shadows, lower pixel ratio,
  // fewer snow particles.
  const isMobile = useMemo(
    () =>
      typeof window !== "undefined" &&
      (window.matchMedia("(max-width: 820px)").matches || "ontouchstart" in window),
    [],
  );

  // Frame-loop state lives in refs so scrolling never re-renders the 3D tree.
  const progressRef = useRef(0);
  const activeIndexRef = useRef(0);
  const userInteractingRef = useRef(false);

  // Only the overlay (HTML) needs React state, and only when the chapter flips.
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const p = scrollTopToProgress();
        progressRef.current = p;
        const idx = nearestStationIndex(p);
        activeIndexRef.current = idx;
        setActiveIndex((prev) => (prev === idx ? prev : idx));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const goToStation = useCallback(
    (index: number) => {
      const station = STATIONS[Math.max(0, Math.min(index, STATIONS.length - 1))];
      window.scrollTo({
        top: progressToScrollTop(station.progress),
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion],
  );

  return (
    <div className="railway">
      {/* Tall spacer: gives the page scroll distance to drive the journey. */}
      <div
        className="railway__scroll"
        style={{ height: `${STATIONS.length * 100}vh` }}
        aria-hidden="true"
      />

      {/* Fixed stage holds the canvas and the HTML overlay. */}
      <div className="railway__stage">
        <Canvas
          className="railway__canvas"
          shadows={!isMobile}
          dpr={[1, isMobile ? 1.5 : 2]}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.25,
          }}
          camera={{
            position: [...CAMERA_CONFIG.initialPosition],
            fov: 42,
            near: 0.1,
            far: 200,
          }}
        >
          <MountainScene
            progressRef={progressRef}
            activeIndexRef={activeIndexRef}
            userInteractingRef={userInteractingRef}
            reducedMotion={reducedMotion}
            isMobile={isMobile}
          />
        </Canvas>

        <ResumeOverlay
          activeIndex={activeIndex}
          onSelect={goToStation}
          onExitToText={onExitToText}
        />
      </div>
    </div>
  );
}
