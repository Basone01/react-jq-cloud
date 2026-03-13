import type { Word } from "./types";

export interface WordRect {
  width: number;
  height: number;
}

export interface WordPosition {
  left: number;
  top: number;
  fontSize: number;
  weightClass: number;
}

interface PlacedRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

// AABB (axis-aligned bounding box) overlap test.
// Two rectangles overlap when their center-to-center distance on both axes
// is less than the sum of their half-extents on that axis.
function overlaps(a: PlacedRect, b: PlacedRect): boolean {
  const aCenterX = a.left + a.width / 2;
  const aCenterY = a.top + a.height / 2;
  const bCenterX = b.left + b.width / 2;
  const bCenterY = b.top + b.height / 2;
  return (
    Math.abs(aCenterX - bCenterX) < (a.width + b.width) / 2 &&
    Math.abs(aCenterY - bCenterY) < (a.height + b.height) / 2
  );
}

// Returns true when any edge of `rect` falls outside the [0, width] × [0, height] canvas.
function isOutOfBounds(
  rect: PlacedRect,
  width: number,
  height: number,
): boolean {
  return (
    rect.left < 0 ||
    rect.top < 0 ||
    rect.left + rect.width > width ||
    rect.top + rect.height > height
  );
}

/**
 * Pure layout algorithm — no DOM access.
 *
 * Receives pre-measured word dimensions (`rects`) and places each word on the
 * canvas by spiralling outward from `center` until a collision-free position is
 * found.  Returns one `WordPosition` per input word (same order), or `null` when
 * a word was dropped because it overflowed the canvas with `removeOverflowing` on.
 *
 * Ported from jQCloud (https://github.com/lucaong/jQCloud).
 */
export function computeLayout(
  words: Word[],
  rects: WordRect[], // measured pixel dimensions for each word (parallel array)
  options: {
    width: number;
    height: number;
    center: { x: number; y: number };
    shape: "elliptic" | "rectangular";
    removeOverflowing: boolean;
    fontSizes: [number, number]; // [minPx, maxPx]
  },
): (WordPosition | null)[] {
  if (words.length === 0) return [];

  const { width, height, center, shape, removeOverflowing, fontSizes } =
    options;

  // Aspect ratio stretches the horizontal step of the elliptic spiral so the
  // cloud fills a rectangular canvas instead of always forming a circle.
  const aspectRatio = width / height;

  // ─── Step 1: sort by weight descending ───────────────────────────────────
  // Heavier words are placed first so they land closest to the center.
  // We keep the original array index so the result can be written back in
  // input order (the caller's `words[i]` must map to `result[i]`).
  const indexed = words.map((w, i) => ({ word: w, rect: rects[i]!, index: i }));
  indexed.sort((a, b) => b.word.weight - a.word.weight);

  // ─── Step 2: derive weight → font size and weight → class mappings ───────
  const weights = words.map((w) => w.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight; // 0 when all words share the same weight

  // Linear interpolation: weight maps to a font size between fontSizes[0] and fontSizes[1].
  // When all weights are equal the range is 0, so every word gets the minimum font size.
  function getFontSize(weight: number): number {
    if (weightRange === 0) return fontSizes[0];
    return (
      fontSizes[0] +
      ((weight - minWeight) / weightRange) * (fontSizes[1] - fontSizes[0])
    );
  }

  // CSS class w1–w10: evenly maps the weight range onto 10 buckets.
  // When all weights are equal every word lands in the middle bucket (5).
  function getWeightClass(weight: number): number {
    if (weightRange === 0) return 5;
    return Math.round(((weight - minWeight) / weightRange) * 9) + 1;
  }

  // ─── Step 3: initialise output and collision list ─────────────────────────
  // `result` is pre-filled with null; each placed word overwrites its slot.
  // `placed` accumulates the bounding boxes of successfully placed words and
  // is checked on every candidate position for collision.
  const result: (WordPosition | null)[] = new Array(words.length).fill(null);
  const placed: PlacedRect[] = [];

  // ─── Step 4: place each word ──────────────────────────────────────────────
  for (let i = 0; i < indexed.length; i++) {
    const { word, rect, index } = indexed[i]!;
    const fontSize = getFontSize(word.weight);
    const weightClass = getWeightClass(word.weight);
    const w = rect.width;
    const h = rect.height;

    // Start at the canvas center, anchored so the word is visually centred.
    let left = center.x - w / 2;
    let top = center.y - h / 2;

    if (shape === "elliptic") {
      // ── Elliptic spiral ──────────────────────────────────────────────────
      // The candidate position is tested; if it collides the spiral advances.
      // `radius` grows on every iteration, `angle` alternates direction
      // (odd-indexed words go counter-clockwise) to fill both sides evenly.
      let radius = 0;
      let angle = 0;
      let placed_flag = false;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const candidate: PlacedRect = { left, top, width: w, height: h };

        // Step 4a: collision check — test against every already-placed word.
        const hasCollision = placed.some((p) => overlaps(candidate, p));

        if (!hasCollision) {
          // Step 4b: accept the position (or drop if it overflows the canvas).
          if (removeOverflowing && isOutOfBounds(candidate, width, height)) {
            // Word falls (at least partially) outside the canvas — discard it.
            result[index] = null;
          } else {
            result[index] = { left, top, fontSize, weightClass };
            // Register this word's bounding box so future words avoid it.
            placed.push(candidate);
          }
          placed_flag = true;
          break;
        }

        // Step 4c: advance the spiral.
        // Radius grows linearly; angle increments in alternating directions so
        // odd and even words spiral in opposite senses, producing a denser fill.
        // The horizontal component is scaled by aspectRatio to match the canvas shape.
        radius += 2.0;
        angle += (i % 2 === 0 ? 1 : -1) * 2.0;
        left = center.x - w / 2 + radius * Math.cos(angle) * aspectRatio;
        top = center.y - h / 2 + radius * Math.sin(angle);

        // Safety bail-out: if the spiral has expanded far beyond the canvas
        // there is no room left — mark the word as unplaceable.
        if (radius > Math.max(width, height) * 2) {
          break;
        }
      }

      if (!placed_flag) {
        result[index] = null;
      }
    } else {
      // ── Rectangular spiral ───────────────────────────────────────────────
      // Instead of polar coordinates the spiral walks along the four cardinal
      // directions in a square outward pattern: right → down → left → up → …
      // The step size is scaled by aspectRatio on horizontal moves so the
      // spiral expands proportionally to the canvas dimensions.
      let step = 18.0;
      let steps_in_direction = 0; // steps taken in the current direction
      let quarter_turns = 0; // total direction changes so far
      let direction = 0; // 0=right, 1=down, 2=left, 3=up
      const dx = [1, 0, -1, 0];
      const dy = [0, 1, 0, -1];
      // Horizontal moves (right/left) are widened by aspectRatio so the spiral
      // covers the canvas evenly rather than forming a tall narrow column.
      const directionStepSize = [
        step * aspectRatio,
        step,
        step * aspectRatio,
        step,
      ];

      let placed_flag = false;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const candidate: PlacedRect = { left, top, width: w, height: h };

        // Step 4a: collision check.
        const hasCollision = placed.some((p) => overlaps(candidate, p));

        if (!hasCollision) {
          // Step 4b: accept or drop.
          if (removeOverflowing && isOutOfBounds(candidate, width, height)) {
            result[index] = null;
          } else {
            result[index] = { left, top, fontSize, weightClass };
            placed.push(candidate);
          }
          placed_flag = true;
          break;
        }

        // Step 4c: advance one step in the current direction.
        steps_in_direction++;
        left += dx[direction]! * directionStepSize[direction]!;
        top += dy[direction]! * directionStepSize[direction]!;

        // Step 4d: decide whether to turn.
        // The rectangular spiral turns after 1 step, then 1 step, then 2, 2, 3, 3, …
        // — i.e. after every pair of quarter-turns the allowed run length increases
        // by one.  This produces the characteristic square-outward expansion.
        const stepsBeforeTurn = Math.floor(quarter_turns / 2) + 1;
        if (steps_in_direction >= stepsBeforeTurn) {
          steps_in_direction = 0;
          quarter_turns++;
          direction = quarter_turns % 4;
        }

        // Safety bail-out: stop when the spiral has made enough turns to have
        // covered an area larger than the canvas.
        if (quarter_turns > ((width + height) / step) * 4) {
          break;
        }
      }

      if (!placed_flag) {
        result[index] = null;
      }
    }
  }

  // ─── Step 5: return results in original word order ────────────────────────
  return result;
}
