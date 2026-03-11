import { useEffect, useMemo, useRef, useState } from 'react';
import { computeLayout } from './layout';
import type { WordPosition } from './layout';
import type { Word, ReactJQCloudProps } from './types';

const SHRINK_STEP = 0.85;
const SHRINK_MIN_SCALE = 0.3;

export function ReactJQCloud({
  words,
  width,
  height,
  center,
  shape = 'elliptic',
  removeOverflowing = true,
  shrinkToFit = false,
  fontSizes = [12, 60],
  fontFamily,
  colors,
  className,
  style,
  wordDelay = 0,
  onWordClick,
  onWordReveal,
  afterCloudRender,
}: ReactJQCloudProps) {
  const [positions, setPositions] = useState<(WordPosition | null)[] | null>(null);
  // Effective font sizes after shrink-to-fit scaling (may differ from prop)
  const [activeFontSizes, setActiveFontSizes] = useState<[number, number]>(fontSizes);
  // How many words have been revealed so far (for wordDelay animation)
  const [revealedCount, setRevealedCount] = useState(0);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const resolvedCenter = center ?? { x: width / 2, y: height / 2 };

  const weights = words.map(w => w.weight);
  const minWeight = Math.min(...weights, 0);
  const maxWeight = Math.max(...weights, 1);
  const weightRange = maxWeight - minWeight || 1;

  // Pass-1 uses activeFontSizes so the invisible spans are sized for measurement
  function getFontSize(weight: number): number {
    return activeFontSizes[0] + ((weight - minWeight) / weightRange) * (activeFontSizes[1] - activeFontSizes[0]);
  }

  // Reveal order: original indices of placed words, sorted by weight desc (= layout order).
  // Words appear in this sequence when wordDelay > 0.
  const revealOrder = useMemo<number[]>(() => {
    if (!positions) return [];
    return words
      .map((w, i) => ({ weight: w.weight, index: i }))
      .filter(({ index }) => positions[index] !== null)
      .sort((a, b) => b.weight - a.weight || a.index - b.index)
      .map(({ index }) => index);
  }, [words, positions]);

  // revealRank[i] = position of word i in the reveal sequence (-1 = not placed)
  const revealRank = useMemo<number[]>(() => {
    const rank = new Array(words.length).fill(-1);
    revealOrder.forEach((idx, r) => { rank[idx] = r; });
    return rank;
  }, [words.length, revealOrder]);

  // Reset on key prop changes
  useEffect(() => {
    setPositions(null);
    setActiveFontSizes(fontSizes);
    setRevealedCount(0);
  }, [words, width, height, shape, shrinkToFit, fontSizes[0], fontSizes[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pass 1: measure spans → compute layout
  useEffect(() => {
    if (positions !== null) return;
    if (words.length === 0) {
      setPositions([]);
      return;
    }

    const frame = requestAnimationFrame(() => {
      const baseRects = spanRefs.current.slice(0, words.length).map(el => {
        if (!el) return { width: 0, height: 0 };
        const r = el.getBoundingClientRect();
        return { width: r.width, height: r.height };
      });

      // When shrinkToFit is on, iteratively reduce font scale until all words
      // fit within the container (no null positions from removeOverflowing).
      // Rects scale proportionally with font size so no re-measurement needed.
      let scale = 1.0;
      let currentFontSizes: [number, number] = fontSizes;
      let rects = baseRects;
      let computed = computeLayout(words, rects, {
        width, height, center: resolvedCenter, shape,
        removeOverflowing: shrinkToFit ? true : removeOverflowing,
        fontSizes: currentFontSizes,
      });

      if (shrinkToFit) {
        while (scale > SHRINK_MIN_SCALE && computed.some(p => p === null)) {
          scale *= SHRINK_STEP;
          currentFontSizes = [fontSizes[0] * scale, fontSizes[1] * scale];
          rects = baseRects.map(r => ({ width: r.width * scale, height: r.height * scale }));
          computed = computeLayout(words, rects, {
            width, height, center: resolvedCenter, shape,
            removeOverflowing: true,
            fontSizes: currentFontSizes,
          });
        }
        setActiveFontSizes(currentFontSizes);
      }

      setPositions(computed);
    });

    return () => cancelAnimationFrame(frame);
  });

  // After layout: start reveal interval (or reveal all immediately)
  useEffect(() => {
    if (positions === null) return;
    const total = revealOrder.length;
    if (total === 0) return;

    if (!wordDelay || wordDelay <= 0) {
      setRevealedCount(total);
      return;
    }

    setRevealedCount(0);
    let count = 0;
    const id = setInterval(() => {
      count++;
      setRevealedCount(count);
      if (count >= total) clearInterval(id);
    }, wordDelay);

    return () => clearInterval(id);
  }, [positions, wordDelay]); // eslint-disable-line react-hooks/exhaustive-deps

  // Report reveal progress and fire afterCloudRender when complete
  useEffect(() => {
    if (revealOrder.length === 0) return;
    onWordReveal?.(revealedCount, revealOrder.length);
    if (revealedCount >= revealOrder.length) {
      afterCloudRender?.();
    }
  }, [revealedCount, revealOrder.length, onWordReveal, afterCloudRender]);

  const containerStyle: React.CSSProperties = {
    width,
    height,
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div
      className={`react-jq-cloud${className ? ` ${className}` : ''}`}
      style={containerStyle}
    >
      {words.map((word, i) => {
        const pos = positions?.[i];
        const fontSize = getFontSize(word.weight);
        const weightClass = pos?.weightClass ?? Math.round(((word.weight - minWeight) / weightRange) * 9) + 1;

        // Skip unplaced words once layout is done
        if (positions !== null && pos === null) return null;

        // Word is visible only once its reveal rank has been reached
        const isRevealed = positions !== null && pos !== undefined && (revealRank[i] ?? -1) < revealedCount;

        const spanStyle: React.CSSProperties = {
          fontSize: pos ? pos.fontSize : fontSize,
          fontFamily: fontFamily ?? undefined,
          position: 'absolute',
          visibility: isRevealed ? 'visible' : 'hidden',
          left: pos ? pos.left : 0,
          top: pos ? pos.top : 0,
          whiteSpace: 'nowrap',
          ...(word.color
            ? { color: word.color }
            : colors?.[weightClass - 1]
              ? { color: colors[weightClass - 1] }
              : {}),
        };

        const classes = ['w' + weightClass, word.className].filter(Boolean).join(' ');

        const handleClick = onWordClick
          ? (e: React.MouseEvent) => onWordClick(word, e)
          : undefined;

        const inner = word.link ? (
          <a
            href={typeof word.link === 'string' ? word.link : word.link.href}
            target={typeof word.link === 'object' ? word.link.target : undefined}
            onClick={handleClick}
          >
            {word.text}
          </a>
        ) : (
          word.text
        );

        return (
          <span
            key={i}
            ref={el => { spanRefs.current[i] = el; }}
            className={classes}
            style={spanStyle}
            onClick={!word.link ? handleClick : undefined}
          >
            {inner}
          </span>
        );
      })}
    </div>
  );
}
