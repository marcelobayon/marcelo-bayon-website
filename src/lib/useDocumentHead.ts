import { useEffect } from "react";

type HeadOptions = {
  title: string;
  description?: string;
  canonical?: string;
};

function setMeta(selector: string, attr: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    const [, name] = selector.match(/\[(?:name|property)="(.+)"\]/) ?? [];
    if (selector.includes("property=")) el.setAttribute("property", name ?? "");
    else el.setAttribute("name", name ?? "");
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Minimal per-route <head> manager — avoids pulling in a helmet dependency.
 * Updates title, description, and canonical when a route mounts.
 */
export function useDocumentHead({ title, description, canonical }: HeadOptions) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    if (description) {
      setMeta('meta[name="description"]', "content", description);
      setMeta('meta[property="og:description"]', "content", description);
    }
    setMeta('meta[property="og:title"]', "content", title);
    if (canonical) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
    return () => {
      document.title = previousTitle;
    };
  }, [title, description, canonical]);
}
