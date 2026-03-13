import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { computeLayout } from "./layout";
import type { WordPosition } from "./layout";
import type { Word, ReactJQCloudProps } from "./types";

const SHRINK_STEP = 0.85;
const SHRINK_MIN_SCALE = 0.3;

export function ReactJQCloud({
  words,
  width,
  height,
  center,
  shape = "elliptic",
  removeOverflowing = true,
  spacing = 0,
  wrapAtPercent,
  ellipsisAtPercent,
  wrapAtPercentOnLimit,
  ellipsisAtPercentOnLimit,
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
  renderText,
  renderTooltip,
  tooltipContainer,
}: ReactJQCloudProps) {
  const [positions, setPositions] = useState<(WordPosition | null)[] | null>(
    null,
  );
  // Effective font sizes after shrink-to-fit scaling (may differ from prop)
  const [activeFontSizes, setActiveFontSizes] =
    useState<[number, number]>(fontSizes);
  // How many words have been revealed so far (for wordDelay animation)
  const [revealedCount, setRevealedCount] = useState(0);
  // True after shrinkToFit exhausts its minimum scale and on-limit fallback props activate
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{ word: Word; rect: DOMRect } | null>(null);

  // Resolved pixel width — equals the prop when it's a number, or the measured
  // container width when it's a CSS string like "100%".
  const [layoutWidth, setLayoutWidth] = useState<number>(
    typeof width === "number" ? width : 0,
  );

  useEffect(() => {
    if (typeof width === "number") {
      setLayoutWidth(width);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setLayoutWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setLayoutWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, [width]);

  const resolvedCenter = center ?? { x: layoutWidth / 2, y: height / 2 };

  const weights = words.map((w) => w.weight);
  const minWeight = Math.min(...weights, 0);
  const maxWeight = Math.max(...weights, 1);
  const weightRange = maxWeight - minWeight || 1;

  // Pass-1 uses activeFontSizes so the invisible spans are sized for measurement
  function getFontSize(weight: number): number {
    return (
      activeFontSizes[0] +
      ((weight - minWeight) / weightRange) *
        (activeFontSizes[1] - activeFontSizes[0])
    );
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
    revealOrder.forEach((idx, r) => {
      rank[idx] = r;
    });
    return rank;
  }, [words.length, revealOrder]);

  // Reset on key prop changes
  useEffect(() => {
    setPositions(null);
    setActiveFontSizes(fontSizes);
    setRevealedCount(0);
    setFallbackTriggered(false);
  }, [
    words,
    layoutWidth,
    height,
    shape,
    spacing,
    shrinkToFit,
    fontSizes[0],
    fontSizes[1],
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pass 1: measure spans → compute layout
  useEffect(() => {
    if (positions !== null) return;
    if (layoutWidth === 0) return; // wait until the container has been measured
    if (words.length === 0) {
      setPositions([]);
      return;
    }

    const frame = requestAnimationFrame(() => {
      // Measure actual DOM dimensions at the current activeFontSizes.
      const rects = spanRefs.current.slice(0, words.length).map((el) => {
        if (!el) return { width: 0, height: 0 };
        const r = el.getBoundingClientRect();
        return { width: r.width, height: r.height };
      });

      const computed = computeLayout(words, rects, {
        width: layoutWidth,
        height,
        center: resolvedCenter,
        shape,
        removeOverflowing: shrinkToFit ? true : removeOverflowing,
        fontSizes: activeFontSizes,
        spacing,
      });

      // When shrinkToFit is on and words don't fit, reduce the font scale and
      // leave positions as null so the component re-renders at the smaller font
      // and this effect re-runs with fresh DOM measurements.
      // This correctly handles wrap/ellipsis constraints whose height depends
      // on actual line-wrapping, which can't be approximated by scaling alone.
      if (shrinkToFit && computed.some((p) => p === null)) {
        const currentScale = activeFontSizes[0] / fontSizes[0];
        if (currentScale > SHRINK_MIN_SCALE) {
          setActiveFontSizes([
            activeFontSizes[0] * SHRINK_STEP,
            activeFontSizes[1] * SHRINK_STEP,
          ]);
          return; // re-render → re-measure at smaller font
        }
        // At minimum scale — activate on-limit fallback props if provided and not yet triggered
        if (!fallbackTriggered && (wrapAtPercentOnLimit !== undefined || ellipsisAtPercentOnLimit !== undefined)) {
          setFallbackTriggered(true);
          return; // re-render with fallback CSS constraints → re-measure
        }
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
    position: "relative",
    overflow: "hidden",
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`react-jq-cloud${className ? ` ${className}` : ""}`}
      style={containerStyle}
    >
      {words.map((word, i) => {
        const pos = positions?.[i];
        const fontSize = getFontSize(word.weight);
        const weightClass =
          pos?.weightClass ??
          Math.round(((word.weight - minWeight) / weightRange) * 9) + 1;

        // Skip unplaced words once layout is done
        if (positions !== null && pos === null) return null;

        // Word is visible only once its reveal rank has been reached
        const isRevealed =
          positions !== null &&
          pos !== undefined &&
          (revealRank[i] ?? -1) < revealedCount;

        const spanStyle: React.CSSProperties = {
          fontSize: pos ? pos.fontSize : fontSize,
          fontFamily: fontFamily ?? undefined,
          position: "absolute",
          visibility: isRevealed ? "visible" : "hidden",
          left: pos ? pos.left : 0,
          top: pos ? pos.top : 0,
          whiteSpace: (wrapAtPercent || (fallbackTriggered && wrapAtPercentOnLimit)) ? "normal" : "nowrap",
          ...(wrapAtPercent ? { maxWidth: `${wrapAtPercent}%`, wordBreak: "break-word" } : {}),
          ...(fallbackTriggered && wrapAtPercentOnLimit && !wrapAtPercent
            ? { maxWidth: `${wrapAtPercentOnLimit}%`, wordBreak: "break-word" }
            : {}),
          ...(ellipsisAtPercent
            ? { maxWidth: `${ellipsisAtPercent}%`, overflow: "hidden", textOverflow: "ellipsis" }
            : {}),
          ...(fallbackTriggered && ellipsisAtPercentOnLimit && !ellipsisAtPercent
            ? { maxWidth: `${ellipsisAtPercentOnLimit}%`, overflow: "hidden", textOverflow: "ellipsis" }
            : {}),
          ...(word.color
            ? { color: word.color }
            : colors?.[weightClass - 1]
              ? { color: colors[weightClass - 1] }
              : {}),
        };

        const classes = ["w" + weightClass, word.className]
          .filter(Boolean)
          .join(" ");

        const handleClick = onWordClick
          ? (e: React.MouseEvent) => onWordClick(word, e)
          : undefined;

        const displayText = renderText ? renderText(word) : word.text;

        const inner = word.link ? (
          <a
            href={typeof word.link === "string" ? word.link : word.link.href}
            target={
              typeof word.link === "object" ? word.link.target : undefined
            }
            onClick={handleClick}
            {...word.html}
          >
            {displayText}
          </a>
        ) : (
          displayText
        );

        const tooltipHandlers = renderTooltip
          ? {
              onMouseEnter: (e: React.MouseEvent) =>
                setTooltip({ word, rect: e.currentTarget.getBoundingClientRect() }),
              onMouseLeave: () => setTooltip(null),
            }
          : {};

        return (
          <span
            key={i}
            ref={(el) => {
              spanRefs.current[i] = el;
            }}
            className={classes}
            style={spanStyle}
            onClick={!word.link ? handleClick : undefined}
            {...tooltipHandlers}
            {...word.html}
          >
            {inner}
          </span>
        );
      })}

      {tooltip &&
        renderTooltip &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: tooltip.rect.left + tooltip.rect.width / 2,
              top: tooltip.rect.top,
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            {renderTooltip(tooltip.word)}
          </div>,
          tooltipContainer ?? document.body,
        )}
    </div>
  );
}
