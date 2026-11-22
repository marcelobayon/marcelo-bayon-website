import { Link } from "react-router-dom";
import { PROFILE } from "../data/resume-content";
import "./SiteFooter.css";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" id="contact">
      <div className="container site-footer__inner">
        <div>
          <p className="eyebrow">Get in touch</p>
          <h2 className="site-footer__title">Let's build something that works.</h2>
          <p className="site-footer__sub">{PROFILE.availability}</p>
          <div className="site-footer__actions">
            <a className="btn btn-primary" href={`mailto:${PROFILE.email}`}>
              Email me
            </a>
            <a
              className="btn btn-ghost"
              href={PROFILE.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <Link className="btn btn-ghost" to="/resume">
              Interactive résumé
            </Link>
          </div>
        </div>
        <div className="site-footer__meta">
          <p>{PROFILE.location}</p>
          <p>© {year} Marcelo Bayon</p>
        </div>
      </div>
    </footer>
  );
}
