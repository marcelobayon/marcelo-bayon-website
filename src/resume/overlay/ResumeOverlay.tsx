import { useEffect } from "react";
import { Link } from "react-router-dom";
import StationNavigation from "./StationNavigation";
import StationContent from "./StationContent";
import { STATIONS } from "../../data/resume-content";

export default function ResumeOverlay({
  activeIndex,
  onSelect,
  onExitToText,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
  onExitToText: () => void;
}) {
  const active = STATIONS[activeIndex];
  const progressPct = Math.round((activeIndex / (STATIONS.length - 1)) * 100);

  // Keyboard: arrow keys step between chapters.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        onSelect(Math.min(activeIndex + 1, STATIONS.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        onSelect(Math.max(activeIndex - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, onSelect]);

  return (
    <div className="overlay">
      {/* Top bar */}
      <div className="overlay__bar">
        <Link to="/" className="overlay__back">
          ← Marcelo Bayon
        </Link>
        <p className="overlay__title" aria-hidden="true">
          The Midnight Mountain Railway
        </p>
        <button type="button" className="btn btn-ghost overlay__text" onClick={onExitToText}>
          Text résumé
        </button>
      </div>

      {/* Station navigation */}
      <StationNavigation activeIndex={activeIndex} onSelect={onSelect} />

      {/* Active station card (live region so screen readers hear chapter changes) */}
      <section className="overlay__card" aria-live="polite">
        <p className="eyebrow">{active.eyebrow}</p>
        <div className="overlay__card-scroll">
          <StationContent stationId={active.id} />
        </div>
      </section>

      {/* Progress */}
      <div className="overlay__progress" aria-hidden="true">
        <div className="overlay__progress-track">
          <div className="overlay__progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="overlay__progress-label">
          {String(activeIndex + 1).padStart(2, "0")} / {String(STATIONS.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
