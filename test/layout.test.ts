import { describe, it, expect } from 'vitest';
import { computeLayout } from '../src/layout';
import type { Word } from '../src/types';

const defaultOptions = {
  width: 600,
  height: 400,
  center: { x: 300, y: 200 },
  shape: 'elliptic' as const,
  removeOverflowing: false,
  fontSizes: [12, 60] as [number, number],
};

describe('computeLayout', () => {
  it('returns empty array for empty words', () => {
    expect(computeLayout([], [], defaultOptions)).toEqual([]);
  });

  it('all same-weight words get weight class 5 (midpoint) and mid font size', () => {
    const words: Word[] = [
      { text: 'a', weight: 5 },
      { text: 'b', weight: 5 },
      { text: 'c', weight: 5 },
    ];
    const rects = words.map(() => ({ width: 50, height: 20 }));
    const result = computeLayout(words, rects, defaultOptions);

    result.forEach(pos => {
      expect(pos).not.toBeNull();
      expect(pos!.weightClass).toBe(5);
      // With same weights, font size should be mid (fontSizes[0])
      expect(pos!.fontSize).toBe(defaultOptions.fontSizes[0]);
    });
  });

  it('highest-weight word is placed first (closest to center)', () => {
    const words: Word[] = [
      { text: 'small', weight: 1 },
      { text: 'huge', weight: 10 },
    ];
    const rects = [{ width: 40, height: 15 }, { width: 100, height: 40 }];
    const result = computeLayout(words, rects, defaultOptions);

    const hugePos = result[1]!;
    const smallPos = result[0]!;

    expect(hugePos).not.toBeNull();
    expect(smallPos).not.toBeNull();

    // Highest weight word should be closer to center
    const distHuge = Math.hypot(
      hugePos.left + rects[1]!.width / 2 - defaultOptions.center.x,
      hugePos.top + rects[1]!.height / 2 - defaultOptions.center.y
    );
    const distSmall = Math.hypot(
      smallPos.left + rects[0]!.width / 2 - defaultOptions.center.x,
      smallPos.top + rects[0]!.height / 2 - defaultOptions.center.y
    );

    expect(distHuge).toBeLessThanOrEqual(distSmall);
  });

  it('words with removeOverflowing that cant fit return null', () => {
    // Tiny container, large words → should return null
    const words: Word[] = [
      { text: 'word1', weight: 5 },
      { text: 'word2', weight: 5 },
      { text: 'word3', weight: 5 },
    ];
    const rects = words.map(() => ({ width: 200, height: 100 }));
    const result = computeLayout(words, rects, {
      ...defaultOptions,
      width: 50,
      height: 50,
      center: { x: 25, y: 25 },
      removeOverflowing: true,
    });

    // All words should overflow and be null
    result.forEach(pos => {
      expect(pos).toBeNull();
    });
  });

  it('removeOverflowing keeps searching past out-of-bounds spots instead of dropping', () => {
    // Dense 50-word cloud sized so the canvas is nearly — but not completely —
    // full. The pre-fix algorithm dropped words whose first collision-free
    // spiral position overflowed an edge; with out-of-bounds treated as a
    // collision, every word finds an in-bounds gap.
    const texts = (
      'React Vue Angular Svelte Next.js Nuxt Remix Astro SolidJS Qwik ' +
      'TypeScript JavaScript Python Rust Go Java C# Kotlin Swift Zig ' +
      'GraphQL REST tRPC WebSocket gRPC Postgres MySQL Redis MongoDB SQLite ' +
      'Docker Kubernetes AWS Vercel Netlify Tailwind CSSModules Sass ' +
      'StyledComponents shadcn/ui Vite Webpack ESBuild Rollup Turbopack ' +
      'Vitest Jest Playwright Cypress Storybook'
    ).split(' ');
    const weights = [
      10, 9, 9, 8, 8, 7, 7, 7, 6, 6, 10, 9, 8, 7, 7, 6, 6, 5, 5, 4,
      8, 7, 6, 5, 5, 7, 6, 6, 5, 4, 8, 7, 7, 6, 5, 8, 6, 5, 5, 7,
      7, 6, 5, 4, 5, 6, 5, 5, 4, 4,
    ];
    const words: Word[] = texts.map((text, i) => ({ text, weight: weights[i]! }));

    // Approximate text metrics at fontSizes [10.2, 51] (avg glyph ≈ 0.55em,
    // line ≈ 1.25em) — the scale at which everything fits with persistent search.
    const fontSizes: [number, number] = [10.2, 51];
    const rects = words.map((w) => {
      const fs = fontSizes[0] + ((w.weight - 4) / 6) * (fontSizes[1] - fontSizes[0]);
      return { width: w.text.length * fs * 0.55, height: fs * 1.25 };
    });

    const width = 740;
    const height = 460;
    const result = computeLayout(words, rects, {
      ...defaultOptions,
      width,
      height,
      center: { x: width / 2, y: height / 2 },
      fontSizes,
      removeOverflowing: true,
    });

    result.forEach((pos, i) => {
      expect(pos, `"${words[i]!.text}" should be placed`).not.toBeNull();
      expect(pos!.left).toBeGreaterThanOrEqual(0);
      expect(pos!.top).toBeGreaterThanOrEqual(0);
      expect(pos!.left + rects[i]!.width).toBeLessThanOrEqual(width);
      expect(pos!.top + rects[i]!.height).toBeLessThanOrEqual(height);
    });
  });

  it('a word larger than the canvas is still dropped with removeOverflowing', () => {
    const words: Word[] = [{ text: 'enormous', weight: 5 }];
    const result = computeLayout(words, [{ width: 800, height: 100 }], {
      ...defaultOptions,
      width: 740,
      height: 460,
      center: { x: 370, y: 230 },
      removeOverflowing: true,
    });
    expect(result[0]).toBeNull();
  });

  it('elliptic: placed words do not overlap', () => {
    const words: Word[] = Array.from({ length: 10 }, (_, i) => ({
      text: `word${i}`,
      weight: i + 1,
    }));
    const rects = words.map(() => ({ width: 60, height: 20 }));
    const result = computeLayout(words, rects, {
      ...defaultOptions,
      removeOverflowing: false,
    });

    const placed = result
      .map((pos, i) => pos ? { ...pos, ...rects[i]! } : null)
      .filter(Boolean) as Array<{ left: number; top: number; width: number; height: number }>;

    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i]!;
        const b = placed[j]!;
        const aCx = a.left + a.width / 2;
        const aCy = a.top + a.height / 2;
        const bCx = b.left + b.width / 2;
        const bCy = b.top + b.height / 2;
        const noOverlap =
          Math.abs(aCx - bCx) >= (a.width + b.width) / 2 ||
          Math.abs(aCy - bCy) >= (a.height + b.height) / 2;
        expect(noOverlap).toBe(true);
      }
    }
  });

  it('rectangular: placed words do not overlap', () => {
    const words: Word[] = Array.from({ length: 8 }, (_, i) => ({
      text: `word${i}`,
      weight: i + 1,
    }));
    const rects = words.map(() => ({ width: 60, height: 20 }));
    const result = computeLayout(words, rects, {
      ...defaultOptions,
      shape: 'rectangular',
      removeOverflowing: false,
    });

    const placed = result
      .map((pos, i) => pos ? { ...pos, ...rects[i]! } : null)
      .filter(Boolean) as Array<{ left: number; top: number; width: number; height: number }>;

    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i]!;
        const b = placed[j]!;
        const aCx = a.left + a.width / 2;
        const aCy = a.top + a.height / 2;
        const bCx = b.left + b.width / 2;
        const bCy = b.top + b.height / 2;
        const noOverlap =
          Math.abs(aCx - bCx) >= (a.width + b.width) / 2 ||
          Math.abs(aCy - bCy) >= (a.height + b.height) / 2;
        expect(noOverlap).toBe(true);
      }
    }
  });
});
