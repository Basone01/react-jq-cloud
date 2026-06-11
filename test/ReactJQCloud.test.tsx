import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ReactJQCloud } from '../src/ReactJQCloud';
import type { Word } from '../src/types';
import * as layoutModule from '../src/layout';

vi.mock('../src/layout', () => ({
  computeLayout: vi.fn(),
}));

const words: Word[] = [
  { text: 'React', weight: 10 },
  { text: 'TypeScript', weight: 8 },
  { text: 'Cloud', weight: 5 },
];

// All three words placed at valid positions
const mockPositions = [
  { left: 10, top: 20, fontSize: 48, weightClass: 10 },
  { left: 50, top: 60, fontSize: 36, weightClass: 8 },
  { left: 100, top: 120, fontSize: 24, weightClass: 5 },
];

// Makes requestAnimationFrame fire synchronously so layout completes inside act()
function mockRafSync() {
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0);
    return 0;
  });
}

describe('ReactJQCloud', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── basic rendering ──────────────────────────────────────────────────────

  it('renders container with correct width and height', () => {
    const { container } = render(
      <ReactJQCloud words={words} width={600} height={400} />,
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe('600px');
    expect(div.style.height).toBe('400px');
  });

  it('renders word text content', () => {
    render(<ReactJQCloud words={words} width={600} height={400} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Cloud')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ReactJQCloud words={words} width={600} height={400} className="my-cloud" />,
    );
    const div = container.firstChild as HTMLElement;
    expect(div.classList.contains('react-jq-cloud')).toBe(true);
    expect(div.classList.contains('my-cloud')).toBe(true);
  });

  it('calls onWordClick when a word is clicked', () => {
    const handleClick = vi.fn();
    render(
      <ReactJQCloud words={words} width={600} height={400} onWordClick={handleClick} />,
    );
    fireEvent.click(screen.getByText('React'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(words[0], expect.anything());
  });

  it('renders links when word.link is a string', () => {
    const linkedWords: Word[] = [{ text: 'ReactJS', weight: 10, link: 'https://react.dev' }];
    const { container } = render(<ReactJQCloud words={linkedWords} width={600} height={400} />);
    const link = container.querySelector('a[href="https://react.dev"]');
    expect(link).toBeInTheDocument();
    expect(link!.textContent).toBe('ReactJS');
  });

  it('renders links with object link prop (href + target)', () => {
    const linkedWords: Word[] = [
      { text: 'Docs', weight: 8, link: { href: 'https://example.com', target: '_blank' } },
    ];
    const { container } = render(<ReactJQCloud words={linkedWords} width={600} height={400} />);
    const link = container.querySelector('a[href="https://example.com"]');
    expect(link).toBeInTheDocument();
    expect(link!.getAttribute('target')).toBe('_blank');
  });

  // ── container / style props ──────────────────────────────────────────────

  it('merges custom style into container', () => {
    const { container } = render(
      <ReactJQCloud
        words={words}
        width={600}
        height={400}
        style={{ border: '2px solid blue', opacity: 0.8 }}
      />,
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.border).toBe('2px solid blue');
    expect(div.style.opacity).toBe('0.8');
    // core layout styles are not overwritten
    expect(div.style.position).toBe('relative');
    expect(div.style.overflow).toBe('hidden');
  });

  it('accepts a string width and sets it on the container', () => {
    const mockObserver = { observe: vi.fn(), disconnect: vi.fn() };
    vi.stubGlobal('ResizeObserver', vi.fn(() => mockObserver));

    const { container } = render(
      <ReactJQCloud words={words} width="100%" height={400} />,
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe('100%');
  });

  // ── word-span style props (observable before layout completes) ───────────

  it('applies fontFamily to every word span', () => {
    render(<ReactJQCloud words={words} width={600} height={400} fontFamily="Georgia" />);
    expect(screen.getByText('React').style.fontFamily).toBe('Georgia');
    expect(screen.getByText('Cloud').style.fontFamily).toBe('Georgia');
  });

  it('scales font sizes proportionally to word weights via fontSizes', () => {
    // single word: minWeight=0, maxWeight=1, weight=1 → fontSize = 20 + (1/1)*60 = 80
    render(
      <ReactJQCloud
        words={[{ text: 'Solo', weight: 1 }]}
        width={600}
        height={400}
        fontSizes={[20, 80]}
      />,
    );
    expect(screen.getByText('Solo').style.fontSize).toBe('80px');
  });

  it('applies the minimum fontSizes value to the lightest word', () => {
    // two words: min=5, max=10 → weight=5 → fontSize = 10 + (0/5)*40 = 10
    render(
      <ReactJQCloud
        words={[
          { text: 'Heavy', weight: 10 },
          { text: 'Light', weight: 5 },
        ]}
        width={600}
        height={400}
        fontSizes={[10, 50]}
      />,
    );
    // minWeight = Math.min(5,10,0) = 0; weight=5 → (5/10)*40 + 10 = 30
    expect(screen.getByText('Light').style.fontSize).toBe('30px');
  });

  it('applies colors array by weight class', () => {
    // single word weight=1 → minWeight=0, maxWeight=1, weightClass = round(9)+1 = 10 → colors[9]
    const colors = ['#000', '#111', '#222', '#333', '#444', '#555', '#666', '#777', '#888', '#a1b2c3'];
    render(
      <ReactJQCloud
        words={[{ text: 'Solo', weight: 1 }]}
        width={600}
        height={400}
        colors={colors}
      />,
    );
    expect(screen.getByText('Solo')).toHaveStyle({ color: '#a1b2c3' });
  });

  it('applies word.color directly, overriding the colors array', () => {
    const coloredWords: Word[] = [
      { text: 'Vivid', weight: 5, color: 'rgb(0, 128, 255)' },
    ];
    render(<ReactJQCloud words={coloredWords} width={600} height={400} />);
    expect(screen.getByText('Vivid').style.color).toBe('rgb(0, 128, 255)');
  });

  it('applies word.className to the span', () => {
    const tagged: Word[] = [{ text: 'Tagged', weight: 5, className: 'highlight' }];
    render(<ReactJQCloud words={tagged} width={600} height={400} />);
    expect(screen.getByText('Tagged')).toHaveClass('highlight');
  });

  it('spreads word.html as extra attributes on the span', () => {
    const htmlWord: Word[] = [
      { text: 'Rich', weight: 5, html: { 'data-id': 'w42', title: 'A word' } },
    ];
    render(<ReactJQCloud words={htmlWord} width={600} height={400} />);
    const span = screen.getByText('Rich');
    expect(span.getAttribute('data-id')).toBe('w42');
    expect(span.getAttribute('title')).toBe('A word');
  });

  // ── text-overflow props ──────────────────────────────────────────────────

  it('wrapAtPercent sets max-width, word-break, and white-space on spans', () => {
    render(<ReactJQCloud words={words} width={600} height={400} wrapAtPercent={60} />);
    const span = screen.getByText('React');
    expect(span.style.maxWidth).toBe('60%');
    expect(span.style.wordBreak).toBe('break-word');
    expect(span.style.whiteSpace).toBe('normal');
  });

  it('ellipsisAtPercent sets max-width and text-overflow ellipsis on spans', () => {
    render(<ReactJQCloud words={words} width={600} height={400} ellipsisAtPercent={70} />);
    const span = screen.getByText('React');
    expect(span.style.maxWidth).toBe('70%');
    expect(span.style.overflow).toBe('hidden');
    expect(span.style.textOverflow).toBe('ellipsis');
  });

  it('wrapAtPercentOnLimit does not apply styles before shrinkToFit limit is reached', () => {
    render(
      <ReactJQCloud words={words} width={600} height={400} wrapAtPercentOnLimit={50} />,
    );
    // fallbackTriggered starts false → no maxWidth from this prop
    expect(screen.getByText('React').style.maxWidth).toBe('');
  });

  it('ellipsisAtPercentOnLimit does not apply styles before shrinkToFit limit is reached', () => {
    render(
      <ReactJQCloud words={words} width={600} height={400} ellipsisAtPercentOnLimit={50} />,
    );
    expect(screen.getByText('React').style.textOverflow).toBe('');
  });

  // ── renderText ───────────────────────────────────────────────────────────

  it('uses renderText to display custom text content', () => {
    render(
      <ReactJQCloud
        words={words}
        width={600}
        height={400}
        renderText={(w) => `★ ${w.text}`}
      />,
    );
    expect(screen.getByText('★ React')).toBeInTheDocument();
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  // ── renderTooltip / tooltipContainer ────────────────────────────────────

  it('renderTooltip shows tooltip on mouseenter and hides on mouseleave', () => {
    render(
      <ReactJQCloud
        words={words}
        width={600}
        height={400}
        renderTooltip={(w) => <span data-testid="tip">{w.text} info</span>}
      />,
    );
    fireEvent.mouseEnter(screen.getByText('React'));
    expect(screen.getByTestId('tip')).toBeInTheDocument();
    expect(screen.getByTestId('tip').textContent).toBe('React info');

    fireEvent.mouseLeave(screen.getByText('React'));
    expect(screen.queryByTestId('tip')).not.toBeInTheDocument();
  });

  it('tooltipContainer portals the tooltip into a custom element', () => {
    const portalTarget = document.createElement('div');
    document.body.appendChild(portalTarget);

    render(
      <ReactJQCloud
        words={words}
        width={600}
        height={400}
        renderTooltip={(w) => <span data-testid="portal-tip">{w.text}</span>}
        tooltipContainer={portalTarget}
      />,
    );

    fireEvent.mouseEnter(screen.getByText('React'));
    expect(portalTarget.querySelector('[data-testid="portal-tip"]')).toBeInTheDocument();

    document.body.removeChild(portalTarget);
  });

  // ── props passed to computeLayout (require layout to run) ───────────────

  describe('computeLayout arguments', () => {
    beforeEach(() => {
      vi.mocked(layoutModule.computeLayout).mockReturnValue(mockPositions);
      mockRafSync();
    });

    it('passes shape="rectangular" to computeLayout', async () => {
      await act(async () => {
        render(<ReactJQCloud words={words} width={600} height={400} shape="rectangular" />);
      });
      expect(vi.mocked(layoutModule.computeLayout)).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ shape: 'rectangular' }),
      );
    });

    it('passes spacing to computeLayout', async () => {
      await act(async () => {
        render(<ReactJQCloud words={words} width={600} height={400} spacing={10} />);
      });
      expect(vi.mocked(layoutModule.computeLayout)).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ spacing: 10 }),
      );
    });

    it('passes custom center to computeLayout', async () => {
      await act(async () => {
        render(
          <ReactJQCloud words={words} width={600} height={400} center={{ x: 200, y: 150 }} />,
        );
      });
      expect(vi.mocked(layoutModule.computeLayout)).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ center: { x: 200, y: 150 } }),
      );
    });

    it('passes removeOverflowing=false to computeLayout when shrinkToFit is off', async () => {
      await act(async () => {
        render(
          <ReactJQCloud words={words} width={600} height={400} removeOverflowing={false} />,
        );
      });
      expect(vi.mocked(layoutModule.computeLayout)).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ removeOverflowing: false }),
      );
    });

    it('shrinkToFit forces removeOverflowing=true regardless of the prop value', async () => {
      await act(async () => {
        render(
          <ReactJQCloud
            words={words}
            width={600}
            height={400}
            shrinkToFit
            removeOverflowing={false}
          />,
        );
      });
      expect(vi.mocked(layoutModule.computeLayout)).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ removeOverflowing: true }),
      );
    });
  });

  // ── callbacks after layout ───────────────────────────────────────────────

  describe('reveal callbacks', () => {
    beforeEach(() => {
      vi.mocked(layoutModule.computeLayout).mockReturnValue(mockPositions);
      mockRafSync();
    });

    it('calls onWordReveal with final count when wordDelay=0', async () => {
      const onReveal = vi.fn();
      await act(async () => {
        render(
          <ReactJQCloud words={words} width={600} height={400} onWordReveal={onReveal} />,
        );
      });
      expect(onReveal).toHaveBeenLastCalledWith(3, 3);
    });

    it('calls afterCloudRender once when all words are revealed', async () => {
      const afterRender = vi.fn();
      await act(async () => {
        render(
          <ReactJQCloud
            words={words}
            width={600}
            height={400}
            afterCloudRender={afterRender}
          />,
        );
      });
      expect(afterRender).toHaveBeenCalledTimes(1);
    });
  });

  // ── re-layout on prop changes that affect rendered word size ─────────────

  describe('re-layout on prop change', () => {
    beforeEach(() => {
      vi.mocked(layoutModule.computeLayout).mockReturnValue(mockPositions);
      mockRafSync();
    });

    it('re-runs layout when wrapAtPercent changes', async () => {
      let rerender!: (ui: React.ReactElement) => void;
      await act(async () => {
        ({ rerender } = render(
          <ReactJQCloud words={words} width={600} height={400} wrapAtPercent={20} />,
        ));
      });
      const callsAfterMount = vi.mocked(layoutModule.computeLayout).mock.calls.length;

      await act(async () => {
        rerender(
          <ReactJQCloud words={words} width={600} height={400} wrapAtPercent={40} />,
        );
      });
      expect(vi.mocked(layoutModule.computeLayout).mock.calls.length).toBeGreaterThan(
        callsAfterMount,
      );
    });

    it('re-runs layout when fontFamily changes', async () => {
      let rerender!: (ui: React.ReactElement) => void;
      await act(async () => {
        ({ rerender } = render(
          <ReactJQCloud words={words} width={600} height={400} fontFamily="Georgia" />,
        ));
      });
      const callsAfterMount = vi.mocked(layoutModule.computeLayout).mock.calls.length;

      await act(async () => {
        rerender(
          <ReactJQCloud words={words} width={600} height={400} fontFamily="Verdana" />,
        );
      });
      expect(vi.mocked(layoutModule.computeLayout).mock.calls.length).toBeGreaterThan(
        callsAfterMount,
      );
    });
  });

  // ── re-layout when web fonts load after the initial measurement ──────────

  describe('font loading', () => {
    beforeEach(() => {
      vi.mocked(layoutModule.computeLayout).mockReturnValue(mockPositions);
      mockRafSync();
    });

    afterEach(() => {
      // jsdom has no document.fonts; remove the stub we installed
      delete (document as { fonts?: unknown }).fonts;
    });

    function stubFonts(fonts: object) {
      Object.defineProperty(document, 'fonts', {
        value: fonts,
        configurable: true,
        writable: true,
      });
    }

    it('re-runs layout when a font load completes after mount', async () => {
      const listeners: EventListener[] = [];
      stubFonts({
        status: 'loaded',
        ready: Promise.resolve(),
        addEventListener: (type: string, cb: EventListener) => {
          if (type === 'loadingdone') listeners.push(cb);
        },
        removeEventListener: vi.fn(),
      });

      await act(async () => {
        render(<ReactJQCloud words={words} width={600} height={400} />);
      });
      const callsAfterMount = vi.mocked(layoutModule.computeLayout).mock.calls.length;
      expect(listeners.length).toBeGreaterThan(0);

      await act(async () => {
        listeners.forEach((cb) => cb(new Event('loadingdone')));
      });
      expect(vi.mocked(layoutModule.computeLayout).mock.calls.length).toBeGreaterThan(
        callsAfterMount,
      );
    });

    it('re-runs layout via fonts.ready when fonts are loading at mount', async () => {
      let resolveReady!: () => void;
      stubFonts({
        status: 'loading',
        ready: new Promise<void>((r) => {
          resolveReady = r;
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      await act(async () => {
        render(<ReactJQCloud words={words} width={600} height={400} />);
      });
      const callsAfterMount = vi.mocked(layoutModule.computeLayout).mock.calls.length;

      await act(async () => {
        resolveReady();
      });
      expect(vi.mocked(layoutModule.computeLayout).mock.calls.length).toBeGreaterThan(
        callsAfterMount,
      );
    });
  });

  // ── wordDelay staggered reveal ───────────────────────────────────────────

  describe('wordDelay', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.mocked(layoutModule.computeLayout).mockReturnValue(mockPositions);
      mockRafSync();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('reveals words one at a time via setInterval', async () => {
      const onReveal = vi.fn();
      await act(async () => {
        render(
          <ReactJQCloud
            words={words}
            width={600}
            height={400}
            wordDelay={100}
            onWordReveal={onReveal}
          />,
        );
      });

      // After layout, no words revealed yet (wordDelay > 0 resets to 0)
      expect(onReveal).toHaveBeenCalledWith(0, 3);

      // One interval tick
      await act(async () => {
        vi.advanceTimersByTime(100);
      });
      expect(onReveal).toHaveBeenCalledWith(1, 3);

      // Remaining two ticks
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      expect(onReveal).toHaveBeenLastCalledWith(3, 3);
    });
  });
});
