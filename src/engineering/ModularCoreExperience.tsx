import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import ModularCoreScene from "./scene/ModularCoreScene";
import CoreOverlay from "./overlay/CoreOverlay";
import { SECTION_FORMATIONS, activeSectionIndex, type KitModuleId } from "./scene-config";
import { useReducedMotion } from "../lib/useReducedMotion";

type Props = { onExitToText: () => void };

/** Normalized scroll [0..1] from the window scroll position. */
function readScrollProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

export default function ModularCoreExperience({ onExitToText }: Props) {
  const reducedMotion = useReducedMotion();

  // Frame-loop state in refs so scrolling never re-renders the 3D tree.
  const progressRef = useRef(0);

  // Only the overlay needs React state, and only when the section flips.
  const [activeSection, setActiveSection] = useState(0);
  const [activeModule, setActiveModule] = useState<KitModuleId | null>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const p = readScrollProgress();
        progressRef.current = p;
        const idx = activeSectionIndex(p);
        setActiveSection((prev) => (prev === idx ? prev : idx));
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

  const goToSection = useCallback(
    (index: number) => {
      const count = SECTION_FORMATIONS.length;
      const clamped = Math.max(0, Math.min(index, count - 1));
      const progress = clamped / (count - 1);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({
        top: progress * max,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion],
  );

  return (
    <div className="core">
      {/* Tall spacer gives the page scroll distance to drive the formations. */}
      <div
        className="core__scroll"
        style={{ height: `${SECTION_FORMATIONS.length * 100}vh` }}
        aria-hidden="true"
      />

      <div className="core__stage">
        <Canvas
          className="core__canvas"
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
          camera={{ position: [0, 0.5, 7], fov: 42, near: 0.1, far: 100 }}
        >
          <ModularCoreScene
            progressRef={progressRef}
            reducedMotion={reducedMotion}
            activeModule={activeModule}
            onSelect={setActiveModule}
          />
        </Canvas>

        <CoreOverlay
          activeSection={activeSection}
          activeModule={activeModule}
          onSelectSection={goToSection}
          onSelectModule={setActiveModule}
          onCloseModule={() => setActiveModule(null)}
          onExitToText={onExitToText}
        />
      </div>
    </div>
  );
}
