import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import MountainBackdrop from "../components/MountainBackdrop";
import { useDocumentHead } from "../lib/useDocumentHead";
import {
  PROFILE,
  EXPERIENCE,
  VENTURES,
  PUBLICATIONS,
  type VentureStatus,
} from "../data/resume-content";
import "./HomePage.css";

const STATUS_LABEL: Record<VentureStatus, string> = {
  concept: "Concept",
  prototype: "Prototype",
  "in-development": "In development",
  live: "Live",
  "needs-review": "In progress",
};

// A few representative roles for the home page; the full list lives at /resume.
const FEATURED_IDS = ["udaf", "amazon", "braveheart", "taco-fest"];

export default function HomePage() {
  useDocumentHead({
    title: "Marcelo Bayon — Software Developer & Operational Leader",
    description:
      "Marcelo Bayon — software developer and operational leader in Salt Lake City. Salesforce/Omnistudio, internal tooling, automation, and the teams behind the work.",
    canonical: "https://marcelobayon.com/",
  });

  const featured = FEATURED_IDS.map(
    (id) => EXPERIENCE.find((e) => e.id === id)!,
  ).filter(Boolean);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />

      <main id="main">
        {/* Hero */}
        <section className="hero">
          <MountainBackdrop />
          <div className="container hero__inner">
            <p className="eyebrow hero__eyebrow">{PROFILE.location}</p>
            <h1 className="hero__name">{PROFILE.name}</h1>
            <p className="hero__headline">{PROFILE.headline}</p>
            <p className="hero__tagline">{PROFILE.tagline}</p>
            <div className="hero__actions">
              <Link to="/resume" className="btn btn-primary">
                Enter the Midnight Mountain Railway →
              </Link>
              <Link to="/resume#resume-text" className="btn btn-ghost">
                Read the text résumé
              </Link>
            </div>
            <p className="hero__hint">
              An interactive resume — ride a model railway up through the work, or
              read it straight.
            </p>
          </div>
        </section>

        {/* About / focus */}
        <section className="section container">
          <p className="section__lead">{PROFILE.introduction}</p>
          <div className="focus">
            <article className="focus__card">
              <h3>Software &amp; platforms</h3>
              <p>
                Salesforce and Omnistudio platforms, internal tooling, data
                dashboards, and automation — built with JavaScript, Apex, AWS,
                and a test-driven habit.
              </p>
            </article>
            <article className="focus__card">
              <h3>Operations &amp; leadership</h3>
              <p>
                Years of running operations and leading teams — from a 700-person
                support account to a 55-user platform — before and alongside the
                code. I build the software and the process around it.
              </p>
            </article>
          </div>
        </section>

        {/* Selected work */}
        <section className="section container" id="work">
          <header className="section__head">
            <p className="eyebrow">Selected work</p>
            <h2>Where I've shipped</h2>
          </header>
          <div className="work-grid">
            {featured.map((item) => (
              <article key={item.id} className="work-card">
                <div className="work-card__top">
                  <h3>{item.title}</h3>
                  {item.period && (
                    <span className="work-card__period">{item.period}</span>
                  )}
                </div>
                {item.organization && (
                  <p className="work-card__org">{item.organization}</p>
                )}
                <p className="work-card__summary">{item.summary}</p>
                {item.tech && (
                  <ul className="chips" aria-label="Technologies">
                    {item.tech.slice(0, 5).map((t) => (
                      <li key={t} className="chip">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
          <Link to="/resume#resume-text" className="section__more">
            See the full résumé →
          </Link>
        </section>

        {/* Ventures */}
        <section className="section container" id="ventures">
          <header className="section__head">
            <p className="eyebrow">Ventures</p>
            <h2>Ideas I'm building</h2>
            <p className="section__note">
              Honest status labels — concepts and in-progress products, not
              overnight unicorns.
            </p>
          </header>
          <div className="venture-grid">
            {VENTURES.map((v) => (
              <article key={v.id} className="venture-card">
                <div className="venture-card__head">
                  <h3>{v.name}</h3>
                  <span className={`status status--${v.status}`}>
                    {STATUS_LABEL[v.status]}
                  </span>
                </div>
                <p>{v.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Writing */}
        <section className="section container">
          <header className="section__head">
            <p className="eyebrow">Writing</p>
            <h2>Published work</h2>
          </header>
          {PUBLICATIONS.map((p) => (
            <p key={p.id} className="writing">
              {p.summary}
            </p>
          ))}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
