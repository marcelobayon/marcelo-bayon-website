import { Link } from "react-router-dom";
import { PROFILE } from "../data/resume-content";
import "./SiteHeader.css";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__brand" aria-label="Marcelo Bayon — home">
          <span className="site-header__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="26" height="26">
              <circle cx="23" cy="9" r="2.4" fill="var(--c-amber)" />
              <path d="M3 26 L13 11 L19 20 L22 15 L29 26 Z" fill="var(--c-slate)" />
              <path d="M13 11 L16.5 16.5 L14 17.5 L11.8 14.5 Z" fill="var(--c-snow)" />
            </svg>
          </span>
          <span className="site-header__name">Marcelo&nbsp;Bayon</span>
        </Link>

        <nav className="site-header__nav" aria-label="Primary">
          <a href="/#work">Work</a>
          <a href="/#ventures">Ventures</a>
          <a href="/#contact">Contact</a>
          <a
            href={PROFILE.links.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <Link to="/resume" className="btn btn-primary site-header__cta">
            Interactive résumé
          </Link>
        </nav>
      </div>
    </header>
  );
}
