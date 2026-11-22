import {
  PROFILE,
  EDUCATION,
  EXPERIENCE,
  SKILL_GROUPS,
  VENTURES,
  PUBLICATIONS,
  CERTIFICATIONS,
  SUMMIT,
  STATIONS,
} from "../../data/resume-content";

function ItemList({ items }: { items: typeof EXPERIENCE }) {
  return (
    <div className="st-items">
      {items.map((item) => (
        <article key={item.id} className="st-item">
          <div className="st-item__head">
            <h4>{item.title}</h4>
            {item.period && <span className="st-item__period">{item.period}</span>}
          </div>
          {item.organization && (
            <p className="st-item__org">
              {item.organization}
              {item.location ? ` · ${item.location}` : ""}
            </p>
          )}
          <p className="st-item__summary">{item.summary}</p>
          {item.highlights && (
            <ul className="st-item__highlights">
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
      ))}
    </div>
  );
}

export default function StationContent({ stationId }: { stationId: string }) {
  switch (stationId) {
    case "valley-station":
      return (
        <div className="st-body">
          <h3 className="st-title">{PROFILE.name}</h3>
          <p className="st-headline">{PROFILE.headline}</p>
          <p>{PROFILE.introduction}</p>
          <p className="st-muted">{PROFILE.location}</p>
          <div className="st-actions">
            <a className="btn btn-primary" href={`mailto:${PROFILE.email}`}>
              Contact
            </a>
            <a
              className="btn btn-ghost"
              href={PROFILE.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
          <p className="st-hint">Scroll to ride the railway — or pick a stop →</p>
        </div>
      );

    case "academy-ridge":
      return (
        <div className="st-body">
          <h3 className="st-title">Education &amp; training</h3>
          <ItemList items={EDUCATION} />
        </div>
      );

    case "foundry-crossing":
      return (
        <div className="st-body">
          <h3 className="st-title">Experience</h3>
          <p className="st-muted">Software, platform work, and operational leadership.</p>
          <ItemList items={EXPERIENCE} />
        </div>
      );

    case "developers-pass":
      return (
        <div className="st-body">
          <h3 className="st-title">Technical skills</h3>
          <div className="st-skills">
            {SKILL_GROUPS.map((g) => (
              <div key={g.id} className="st-skillgroup">
                <h4>{g.label}</h4>
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
          <div className="st-certs">
            {CERTIFICATIONS.map((c) => (
              <p key={c.id} className="st-cert">
                <strong>{c.title}</strong>
                {c.summary ? ` — ${c.summary}` : ""}
              </p>
            ))}
          </div>
        </div>
      );

    case "innovation-village":
      return (
        <div className="st-body">
          <h3 className="st-title">Ventures &amp; writing</h3>
          <div className="st-ventures">
            {VENTURES.map((v) => (
              <div key={v.id} className="st-venture">
                <div className="st-venture__head">
                  <h4>{v.name}</h4>
                  <span className={`status status--${v.status}`}>{v.status.replace("-", " ")}</span>
                </div>
                <p>{v.description}</p>
              </div>
            ))}
          </div>
          {PUBLICATIONS.map((p) => (
            <p key={p.id} className="st-pub">
              <strong>{p.title}.</strong> {p.summary}
            </p>
          ))}
        </div>
      );

    case "summit-observatory":
      return (
        <div className="st-body">
          <h3 className="st-title">{SUMMIT.heading}</h3>
          <p>{SUMMIT.statement}</p>
          <ul className="chips chips--sm st-values">
            {SUMMIT.values.map((v) => (
              <li key={v} className="chip">
                {v}
              </li>
            ))}
          </ul>
          <div className="st-actions">
            <a className="btn btn-primary" href={`mailto:${PROFILE.email}`}>
              Email {PROFILE.name.split(" ")[0]}
            </a>
            <a
              className="btn btn-ghost"
              href={PROFILE.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      );

    default: {
      const s = STATIONS.find((x) => x.id === stationId);
      return <div className="st-body">{s && <p>{s.summary}</p>}</div>;
    }
  }
}
