import { Link } from "react-router-dom";
import { useDocumentHead } from "../lib/useDocumentHead";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { KIT_META, KIT_MODULES, KIT_SECTIONS } from "../engineering/kit-content";
import { MODULE_COLORS } from "../engineering/scene-config";
import "../engineering/engineering.css";

/**
 * /engineering — the plain-English overview of the Personal Engineering Kit.
 * No WebGL required: this is fast, crawlable, and readable by everyone. The 3D
 * "Floating Modular Core" lives one click away at /engineering/interactive.
 */
export default function EngineeringPage() {
  useDocumentHead({
    title: "Engineering — Marcelo Bayon | The Personal Engineering Kit",
    description:
      "A personal toolkit of reusable, tested software building blocks — explained in plain English, with an interactive 3D model of how the parts fit together.",
    canonical: "https://marcelobayon.com/engineering",
  });

  return (
    <>
      <SiteHeader />
      <main id="main" className="eng">
        {/* Hero */}
        <section className="eng-hero container">
          <p className="eng-hero__eyebrow">The Personal Engineering Kit</p>
          <h1 className="eng-hero__title">The reliable parts I reuse in every project.</h1>
          <p className="eng-hero__lead">{KIT_META.plainSummary}</p>
          <div className="eng-hero__actions">
            <Link to="/engineering/interactive" className="btn btn-primary">
              Explore it in 3D →
            </Link>
            <a
              href={KIT_META.repoUrl}
              className="btn btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </section>

        {/* Analogy strip */}
        <section className="eng-analogy container">
          <p>
            Think of it like a professional's toolbox. Instead of buying a new drill for
            every job, you keep the good tools in one box and bring them to whatever you're
            building. This is that box — for software.
          </p>
        </section>

        {/* The building blocks */}
        <section className="eng-blocks container" aria-labelledby="blocks-heading">
          <h2 id="blocks-heading">The building blocks</h2>
          <div className="eng-blocks__grid">
            {KIT_MODULES.map((m) => (
              <article className="eng-block" key={m.id}>
                <span className="eng-block__dot" style={{ background: MODULE_COLORS[m.id] }} />
                <h3 className="eng-block__name">{m.name}</h3>
                <p className="eng-block__plain">{m.plain}</p>
                <p className="eng-block__tech">{m.technical}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it fits together (section narrative) */}
        <section className="eng-story container" aria-labelledby="story-heading">
          <h2 id="story-heading">How the parts fit together</h2>
          <ol className="eng-story__list">
            {KIT_SECTIONS.map((s) => (
              <li className="eng-story__item" key={s.id}>
                <p className="eng-story__eyebrow">{s.eyebrow}</p>
                <h3 className="eng-story__title">{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="eng-story__cta">
            <Link to="/engineering/interactive" className="btn btn-primary">
              Watch the parts assemble →
            </Link>
          </div>
        </section>

        {/* Developer block */}
        <section className="eng-dev container" aria-labelledby="dev-heading">
          <h2 id="dev-heading">For developers</h2>
          <p>
            Standard-library-only Python, typed and tested. Install it straight from GitHub
            and import it into any project:
          </p>
          <pre className="eng-dev__code">
            <code>
              {KIT_META.pipInstall}
              {"\n\n"}
              {KIT_META.importLine}
            </code>
          </pre>
          <a
            href={KIT_META.repoUrl}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the docs on GitHub →
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
