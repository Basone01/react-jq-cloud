import { describe, it, expect, vi, afterEach } from 'vitest';
import { ReactJQCloudElement } from '../src/web-component';
import type { Word } from '../src/types';

// The element drives its own React root outside of act(); silence act warnings.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;

const words: Word[] = [
  { text: 'React', weight: 10 },
  { text: 'TypeScript', weight: 8 },
  { text: 'Cloud', weight: 5 },
];

function createCloud(attrs: Record<string, string> = {}): ReactJQCloudElement {
  const el = document.createElement('react-jq-cloud') as ReactJQCloudElement;
  el.setAttribute('width', '600');
  el.setAttribute('height', '400');
  for (const [name, value] of Object.entries(attrs)) {
    el.setAttribute(name, value);
  }
  return el;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('ReactJQCloudElement', () => {
  it('registers the <react-jq-cloud> custom element', () => {
    expect(customElements.get('react-jq-cloud')).toBe(ReactJQCloudElement);
  });

  it('renders words from a JSON "words" attribute', async () => {
    const el = createCloud({ words: JSON.stringify(words) });
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.textContent).toContain('React');
      expect(el.textContent).toContain('TypeScript');
      expect(el.textContent).toContain('Cloud');
    });
  });

  it('renders words assigned via the "words" property', async () => {
    const el = createCloud();
    el.words = words;
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.textContent).toContain('React');
    });
  });

  it('re-renders when an observed attribute changes', async () => {
    const el = createCloud({ words: JSON.stringify(words) });
    document.body.appendChild(el);
    await vi.waitFor(() => expect(el.textContent).toContain('React'));

    el.setAttribute('words', JSON.stringify([{ text: 'Svelte', weight: 5 }]));
    await vi.waitFor(() => {
      expect(el.textContent).toContain('Svelte');
      expect(el.textContent).not.toContain('React');
    });
  });

  it('injects the default stylesheet once', () => {
    document.body.appendChild(createCloud());
    document.body.appendChild(createCloud());
    expect(document.querySelectorAll('#react-jq-cloud-styles')).toHaveLength(1);
  });

  it('dispatches "word-click" with the clicked word in detail', async () => {
    const el = createCloud({ words: JSON.stringify(words) });
    document.body.appendChild(el);
    await vi.waitFor(() => expect(el.textContent).toContain('React'));

    const onClick = vi.fn();
    el.addEventListener('word-click', onClick);

    const span = Array.from(el.querySelectorAll('span')).find(
      (s) => s.textContent === 'React',
    )!;
    span.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => expect(onClick).toHaveBeenCalledTimes(1));
    const event = onClick.mock.calls[0]![0] as CustomEvent<{ word: Word }>;
    expect(event.detail.word.text).toBe('React');
  });

  it('dispatches "cloud-render" after layout completes', async () => {
    const el = createCloud({ words: JSON.stringify(words) });
    const onRender = vi.fn();
    el.addEventListener('cloud-render', onRender);
    document.body.appendChild(el);

    await vi.waitFor(() => expect(onRender).toHaveBeenCalled());
  });

  it('unmounts the React tree when removed from the DOM', async () => {
    const el = createCloud({ words: JSON.stringify(words) });
    document.body.appendChild(el);
    await vi.waitFor(() => expect(el.textContent).toContain('React'));

    el.remove();
    await vi.waitFor(() => expect(el.innerHTML).toBe(''));
  });

  it('parses "font-sizes" and boolean attributes without warnings', async () => {
    const warn = vi.spyOn(console, 'warn');
    const el = createCloud({
      words: JSON.stringify(words),
      'font-sizes': '14,48',
      'shrink-to-fit': '',
      colors: '#111,#222,#333,#444,#555,#666,#777,#888,#999,#aaa',
    });
    document.body.appendChild(el);
    await vi.waitFor(() => expect(el.textContent).toContain('React'));

    expect(el.fontSizes).toEqual([14, 48]);
    expect(el.colors).toHaveLength(10);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
