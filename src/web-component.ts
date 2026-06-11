import { createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ReactJQCloud } from "./ReactJQCloud";
import type { Word, ReactJQCloudProps } from "./types";

/**
 * Framework-agnostic `<react-jq-cloud>` custom element.
 *
 * Wraps the React component behind a standard Web Component interface so the
 * cloud can be used from plain HTML, Vue, Svelte, Angular, etc. The
 * `web-component` build aliases React to preact/compat and bundles it
 * (~29 KB min) — the host page needs no framework. Because the embedded
 * runtime is Preact, the `renderText` / `renderTooltip` properties should
 * return plain values (strings/numbers), not React JSX from a host app.
 *
 * Configuration:
 * - Attributes (kebab-case, strings): `words` (JSON), `width`, `height`,
 *   `shape`, `spacing`, `font-sizes` (e.g. "12,60"), `colors` (JSON or
 *   comma-separated), `font-family`, `shrink-to-fit`, `remove-overflowing`,
 *   `wrap-at-percent`, `ellipsis-at-percent`, `wrap-at-percent-on-limit`,
 *   `ellipsis-at-percent-on-limit`, `word-delay`.
 * - Properties (rich values, take precedence over their attribute):
 *   `words`, `colors`, `fontSizes`, `renderText`, `renderTooltip`.
 * - Events (bubbling CustomEvents): `word-click` ({ word }),
 *   `word-reveal` ({ revealed, total }), `cloud-render`.
 *
 * Browser-only entry point — do not import it during SSR.
 */

// Default theme, mirrored from styles.css so the element is self-contained.
// Injected once into <head>; page CSS loaded later can override it.
const STYLE_ID = "react-jq-cloud-styles";
const STYLES = `
react-jq-cloud { display: block; }

.react-jq-cloud {
  overflow: hidden;
  position: relative;
  font-family: "Helvetica", "Arial", sans-serif;
}

.react-jq-cloud span {
  position: absolute;
  padding: 0;
  cursor: default;
}

.react-jq-cloud a {
  text-decoration: none;
  color: inherit;
}

.react-jq-cloud .w10 { color: #0cf; }
.react-jq-cloud .w9  { color: #0cf; }
.react-jq-cloud .w8  { color: #0cf; }
.react-jq-cloud .w7  { color: #39d; }
.react-jq-cloud .w6  { color: #90c5f0; }
.react-jq-cloud .w5  { color: #90a0dd; }
.react-jq-cloud .w4  { color: #90c5f0; }
.react-jq-cloud .w3  { color: #a0ddff; }
.react-jq-cloud .w2  { color: #99ccee; }
.react-jq-cloud .w1  { color: #aab5f0; }
`;

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLES;
  document.head.appendChild(style);
}

function parseJson<T>(raw: string | null, attrName: string): T | undefined {
  if (raw == null) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`<react-jq-cloud>: invalid JSON in "${attrName}" attribute`);
    return undefined;
  }
}

function parseNumber(raw: string | null): number | undefined {
  if (raw == null) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

// Boolean attribute: present (even empty) = true, unless explicitly "false"/"0".
function parseBoolean(raw: string | null): boolean | undefined {
  if (raw == null) return undefined;
  return raw !== "false" && raw !== "0";
}

// Accepts JSON ('["#f00","#0f0"]') or a comma-separated list ("#f00, #0f0").
function parseStringList(raw: string | null, attrName: string): string[] | undefined {
  if (raw == null) return undefined;
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) return parseJson<string[]>(trimmed, attrName);
  return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
}

// Accepts JSON ("[12,60]") or a comma-separated pair ("12,60").
function parseNumberPair(raw: string | null, attrName: string): [number, number] | undefined {
  const parts = parseStringList(raw, attrName)?.map(Number);
  if (!parts || parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) {
    if (raw != null) {
      console.warn(`<react-jq-cloud>: "${attrName}" must be two numbers, e.g. "12,60"`);
    }
    return undefined;
  }
  return [parts[0]!, parts[1]!];
}

export class ReactJQCloudElement extends HTMLElement {
  static observedAttributes = [
    "words",
    "width",
    "height",
    "shape",
    "spacing",
    "font-sizes",
    "colors",
    "font-family",
    "shrink-to-fit",
    "remove-overflowing",
    "wrap-at-percent",
    "ellipsis-at-percent",
    "wrap-at-percent-on-limit",
    "ellipsis-at-percent-on-limit",
    "word-delay",
  ];

  private root: Root | null = null;
  private wordsProp: Word[] | null = null;
  private colorsProp: string[] | null = null;
  private fontSizesProp: [number, number] | null = null;
  private renderTextProp: ((word: Word) => string) | null = null;
  private renderTooltipProp: ((word: Word) => ReactNode) | null = null;

  get words(): Word[] {
    return this.wordsProp ?? parseJson<Word[]>(this.getAttribute("words"), "words") ?? [];
  }
  set words(value: Word[]) {
    this.wordsProp = value;
    this.update();
  }

  get colors(): string[] | undefined {
    return this.colorsProp ?? parseStringList(this.getAttribute("colors"), "colors");
  }
  set colors(value: string[] | undefined) {
    this.colorsProp = value ?? null;
    this.update();
  }

  get fontSizes(): [number, number] | undefined {
    return this.fontSizesProp ?? parseNumberPair(this.getAttribute("font-sizes"), "font-sizes");
  }
  set fontSizes(value: [number, number] | undefined) {
    this.fontSizesProp = value ?? null;
    this.update();
  }

  set renderText(fn: ((word: Word) => string) | undefined) {
    this.renderTextProp = fn ?? null;
    this.update();
  }

  set renderTooltip(fn: ((word: Word) => ReactNode) | undefined) {
    this.renderTooltipProp = fn ?? null;
    this.update();
  }

  connectedCallback(): void {
    injectStyles();
    if (!this.root) this.root = createRoot(this);
    this.update();
  }

  disconnectedCallback(): void {
    // Defer the unmount: disconnectedCallback can fire synchronously while
    // React is rendering (e.g. a parent re-render removed this node), and
    // unmounting mid-render is not allowed. Skip if the element reconnected.
    queueMicrotask(() => {
      if (!this.isConnected && this.root) {
        this.root.unmount();
        this.root = null;
      }
    });
  }

  attributeChangedCallback(): void {
    this.update();
  }

  private update(): void {
    if (!this.root || !this.isConnected) return;
    this.root.render(createElement(ReactJQCloud, this.buildProps()));
  }

  private buildProps(): ReactJQCloudProps {
    const attr = (name: string) => this.getAttribute(name);

    // width: numeric strings become pixel numbers, anything else (e.g. "100%")
    // is passed through as a CSS length. Defaults to fluid width.
    const widthRaw = attr("width");
    const width =
      widthRaw == null ? "100%" : (parseNumber(widthRaw) ?? widthRaw);

    const shapeRaw = attr("shape");
    const shape =
      shapeRaw === "elliptic" || shapeRaw === "rectangular" ? shapeRaw : undefined;

    return {
      words: this.words,
      width,
      height: parseNumber(attr("height")) ?? 400,
      shape,
      spacing: parseNumber(attr("spacing")),
      fontSizes: this.fontSizes,
      colors: this.colors,
      fontFamily: attr("font-family") ?? undefined,
      shrinkToFit: parseBoolean(attr("shrink-to-fit")),
      removeOverflowing: parseBoolean(attr("remove-overflowing")),
      wrapAtPercent: parseNumber(attr("wrap-at-percent")),
      ellipsisAtPercent: parseNumber(attr("ellipsis-at-percent")),
      wrapAtPercentOnLimit: parseNumber(attr("wrap-at-percent-on-limit")),
      ellipsisAtPercentOnLimit: parseNumber(attr("ellipsis-at-percent-on-limit")),
      wordDelay: parseNumber(attr("word-delay")),
      renderText: this.renderTextProp ?? undefined,
      renderTooltip: this.renderTooltipProp ?? undefined,
      onWordClick: (word) => {
        this.dispatchEvent(
          new CustomEvent("word-click", { detail: { word }, bubbles: true }),
        );
      },
      onWordReveal: (revealed, total) => {
        this.dispatchEvent(
          new CustomEvent("word-reveal", { detail: { revealed, total }, bubbles: true }),
        );
      },
      afterCloudRender: () => {
        this.dispatchEvent(new CustomEvent("cloud-render", { bubbles: true }));
      },
    };
  }
}

/** Register the element; call with a custom tag name to avoid collisions. */
export function defineReactJQCloud(tagName = "react-jq-cloud"): void {
  if (typeof customElements === "undefined") return;
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ReactJQCloudElement);
  }
}

defineReactJQCloud();

export type { Word, ReactJQCloudProps };
