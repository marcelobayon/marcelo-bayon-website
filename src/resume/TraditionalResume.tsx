import { Link } from "react-router-dom";
import {
  PROFILE,
  EDUCATION,
  EXPERIENCE,
  SKILL_GROUPS,
  VENTURES,
  PUBLICATIONS,
  CERTIFICATIONS,
  SUMMIT,
  type ResumeItem,
} from "../data/resume-content";

function Role({ item }: { item: ResumeItem }) {
  return (
    <article className="tr-role">
      <div className="tr-role__head">
        <h3>
          {item.title}
          {item.organization && <span className="tr-role__org"> · {item.organization}</span>}
        </h3>
        {item.period && <span className="tr-role__period">{item.period}</span>}
      </div>
      {item.location && <p className="tr-role__loc">{item.location}</p>}
      <p className="tr-role__summary">{item.summary}</p>
      {item.highlights && (
        <ul className="tr-role__highlights">
          {item.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}
      {item.tech && (
        <ul className="chips chips--sm" aria-label="Technologies">
          {item.tech.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function TraditionalResume({
  canRide,
  onRide,
  reducedMotion,
}: {
  canRide: boolean;
  onRide: () => void;
  reducedMotion: boolean;
}) {
  return (
    <div className="tr">
      <a href="#tr-main" className="skip-link">
        Skip to résumé
      </a>

      <div className="tr-topbar">
        <Link to="/" className="tr-topbar__back">
          ← Home
        </Link>
        <div className="tr-topbar__actions">
          <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
            Print / PDF
          </button>
          {canRide && (
            <button type="button" className="btn btn-primary" onClick={onRide}>
              Enter the 3D railway →
            </button>
          )}
        </div>
      </div>

      <main id="tr-main" className="tr-main" role="main">
        <header className="tr-header">
          <h1>{PROFILE.name}</h1>
          <p className="tr-header__headline">{PROFILE.headline}</p>
          <p className="tr-header__tagline">{PROFILE.tagline}</p>
          <ul className="tr-contact">
            <li>{PROFILE.location}</li>
            <li>
              <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
            </li>
            <li>
              <a href={PROFILE.links.github} target="_blank" rel="noopener noreferrer">
                github.com/marcelobayon
              </a>
            </li>
          </ul>
          {reducedMotion && canRide && (
            <p className="tr-note">
              You have reduced-motion enabled, so the text résumé is shown by
              default. You can still{" "}
              <button type="button" className="tr-linkbtn" onClick={onRide}>
                load the 3D railway
              </button>
              .
            </p>
          )}
        </header>

        <section className="tr-section" aria-labelledby="h-summary">
          <h2 id="h-summary">Summary</h2>
          <p>{PROFILE.introduction}</p>
        </section>

        <section className="tr-section" aria-labelledby="h-exp">
          <h2 id="h-exp">Experience</h2>
          {EXPERIENCE.map((item) => (
            <Role key={item.id} item={item} />
          ))}
        </section>

        <section className="tr-section" aria-labelledby="h-skills">
          <h2 id="h-skills">Technical skills</h2>
          <div className="tr-skills">
            {SKILL_GROUPS.map((g) => (
              <div key={g.id}>
                <h3>{g.label}</h3>
                <ul className="chips chips--sm">
                  {g.items.map((s) => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="tr-section" aria-labelledby="h-edu">
          <h2 id="h-edu">Education &amp; training</h2>
          {EDUCATION.map((item) => (
            <Role key={item.id} item={item} />
          ))}
        </section>

        <section className="tr-section" aria-labelledby="h-vent">
          <h2 id="h-vent">Ventures</h2>
          <div className="tr-ventures">
            {VENTURES.map((v) => (
              <article key={v.id} className="tr-venture">
                <h3>
                  {v.name} <span className={`status status--${v.status}`}>{v.status.replace("-", " ")}</span>
                </h3>
                <p>{v.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="tr-section" aria-labelledby="h-pub">
          <h2 id="h-pub">Publications &amp; certifications</h2>
          {PUBLICATIONS.map((p) => (
            <p key={p.id}>
              <strong>{p.title}.</strong> {p.summary}
            </p>
          ))}
          {CERTIFICATIONS.map((c) => (
            <p key={c.id}>
              <strong>{c.title}.</strong> {c.summary}
            </p>
          ))}
        </section>

        <section className="tr-section" aria-labelledby="h-next">
          <h2 id="h-next">{SUMMIT.heading}</h2>
          <p>{SUMMIT.statement}</p>
          <p className="tr-values">
            <strong>Values:</strong> {SUMMIT.values.join(" · ")}
          </p>
          <div className="tr-cta">
            <a className="btn btn-primary" href={`mailto:${PROFILE.email}`}>
              Get in touch
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
