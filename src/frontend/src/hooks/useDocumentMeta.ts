import { useEffect } from "react";

const DEFAULT_TITLE = "Rebunked | Community Fact-Checking";
const DEFAULT_DESCRIPTION =
  "A community-sourced platform where anyone can submit publicly available claims and the community collectively weighs in with votes and evidence.";
const SITE_NAME = "Rebunked";

interface DocMetaOptions {
  title?: string;
  description?: string;
  url?: string;
}

function upsertMeta(property: string, content: string, isName = false) {
  const attr = isName ? "name" : "property";
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${property}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Manages document.title and Open Graph / Twitter meta tags.
 * Pass null to reset to the app-level defaults.
 */
export function useDocumentMeta(opts: DocMetaOptions | null) {
  useEffect(() => {
    const title = opts?.title ? `${opts.title} | ${SITE_NAME}` : DEFAULT_TITLE;

    const description = opts?.description
      ? truncate(opts.description, 160)
      : DEFAULT_DESCRIPTION;

    const url = opts?.url ?? window.location.href;

    // Document title
    document.title = title;

    // Open Graph
    upsertMeta("og:title", title);
    upsertMeta("og:description", description);
    upsertMeta("og:url", url);
    upsertMeta("og:type", "website");
    upsertMeta("og:site_name", SITE_NAME);

    // Twitter / X card
    upsertMeta("twitter:card", "summary", true);
    upsertMeta("twitter:title", title, true);
    upsertMeta("twitter:description", description, true);

    // Standard description
    upsertMeta("description", description, true);
  });
}
