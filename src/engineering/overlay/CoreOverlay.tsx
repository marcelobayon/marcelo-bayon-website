import { Link } from "react-router-dom";
import { KIT_META, KIT_MODULES, KIT_SECTIONS, moduleById } from "../kit-content";
import { MODULE_COLORS, type KitModuleId } from "../scene-config";

type Props = {
  activeSection: number;
  activeModule: KitModuleId | null;
  onSelectSection: (index: number) => void;
  onSelectModule: (id: KitModuleId) => void;
  onCloseModule: () => void;
  onExitToText: () => void;
};

export default function CoreOverlay({
  activeSection,
  activeModule,
  onSelectSection,
  onSelectModule,
  onCloseModule,
  onExitToText,
}: Props) {
  const section = KIT_SECTIONS[Math.max(0, Math.min(activeSection, KIT_SECTIONS.length - 1))];
  const detail = activeModule ? moduleById(activeModule) : null;

  return (
    <div className="core-overlay">
      {/* Top bar: brand + exit to text */}
      <div className="core-overlay__top">
        <Link to="/engineering" className="core-overlay__back">
          ← {KIT_META.name}
        </Link>
        <button type="button" className="btn btn-ghost" onClick={onExitToText}>
          View as text
        </button>
      </div>

      {/* Section nav dots */}
      <nav className="core-overlay__dots" aria-label="Sections">
        {KIT_SECTIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`core-overlay__dot${i === activeSection ? " is-active" : ""}`}
            aria-label={s.title}
            aria-current={i === activeSection}
            onClick={() => onSelectSection(i)}
          />
        ))}
      </nav>

      {/* Current section card */}
      <div className="core-overlay__card" key={section.id}>
        <p className="core-overlay__eyebrow">{section.eyebrow}</p>
        <h2 className="core-overlay__title">{section.title}</h2>
        <p className="core-overlay__body">{section.body}</p>
        <div className="core-overlay__chips">
          {section.modules.map((id) => {
            const m = moduleById(id);
            return (
              <button
                key={id}
                type="button"
                className="core-chip"
                onClick={() => onSelectModule(id)}
              >
                <span className="core-chip__dot" style={{ background: MODULE_COLORS[id] }} />
                {m.name}
              </button>
            );
          })}
        </div>
        <p className="core-overlay__hint" aria-hidden="true">
          Scroll to reassemble ↓ · click a block to inspect it
        </p>
      </div>

      {/* Module detail panel */}
      {detail && (
        <div className="core-detail" role="dialog" aria-label={`${detail.name} details`}>
          <button
            type="button"
            className="core-detail__close"
            aria-label="Close"
            onClick={onCloseModule}
          >
            ✕
          </button>
          <span
            className="core-detail__tag"
            style={{ background: MODULE_COLORS[detail.id] }}
          >
            {detail.name}
          </span>
          <p className="core-detail__plain">{detail.plain}</p>
          <p className="core-detail__tech">{detail.technical}</p>
          <pre className="core-detail__code">
            <code>{detail.snippet}</code>
          </pre>
          <a
            className="core-detail__link"
            href={`${KIT_META.repoUrl}/blob/main/${detail.repoPath}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View {detail.repoPath} on GitHub →
          </a>
        </div>
      )}

      {/* Legend */}
      <div className="core-overlay__legend" aria-hidden="true">
        {KIT_MODULES.map((m) => (
          <span key={m.id} className="core-legend__item">
            <span className="core-legend__dot" style={{ background: MODULE_COLORS[m.id] }} />
            {m.name}
          </span>
        ))}
      </div>
    </div>
  );
}
