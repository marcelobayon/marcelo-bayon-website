import { STATIONS } from "../../data/resume-content";

export default function StationNavigation({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav className="station-nav" id="resume-nav" aria-label="Résumé chapters">
      <ol>
        {STATIONS.map((s, i) => {
          const active = i === activeIndex;
          return (
            <li key={s.id}>
              <button
                type="button"
                className={`station-nav__btn${active ? " is-active" : ""}`}
                aria-current={active ? "step" : undefined}
                onClick={() => onSelect(i)}
              >
                <span className="station-nav__dot" aria-hidden="true" />
                <span className="station-nav__labels">
                  <span className="station-nav__index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="station-nav__name">{s.title}</span>
                  <span className="station-nav__role">{s.shortLabel}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
