import { describe, it, expect, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { Word } from '../src/types';
import type { ReactJQCloudElement } from '../src/web-component';

// Smoke test against the BUILT bundle (dist/web-component.js), which swaps
// React for preact/compat — the source tests run against real React, so this
// is the only coverage of the Preact runtime path. Skipped when dist/ hasn't
// been built (run `npm run build` first).
const distPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../dist/web-component.js',
);

const words: Word[] = [
  { text: 'React', weight: 10 },
  { text: 'TypeScript', weight: 8 },
  { text: 'Cloud', weight: 5 },
];

describe.skipIf(!existsSync(distPath))('built web component (Preact runtime)', () => {
  it('registers, renders words from attributes, and bridges word-click', async () => {
    await import(/* @vite-ignore */ distPath);

    expect(customElements.get('react-jq-cloud')).toBeDefined();

    const el = document.createElement('react-jq-cloud') as ReactJQCloudElement;
    el.setAttribute('width', '600');
    el.setAttribute('height', '400');
    el.setAttribute('words', JSON.stringify(words));
    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(el.textContent).toContain('React');
      expect(el.textContent).toContain('TypeScript');
      expect(el.textContent).toContain('Cloud');
    });

    const onClick = vi.fn();
    el.addEventListener('word-click', onClick);
    const span = Array.from(el.querySelectorAll('span')).find(
      (s) => s.textContent === 'React',
    )!;
    span.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => expect(onClick).toHaveBeenCalledTimes(1));
    const event = onClick.mock.calls[0]![0] as CustomEvent<{ word: Word }>;
    expect(event.detail.word.text).toBe('React');

    // Property assignment re-renders (string return from renderText —
    // function properties must return plain values with the Preact build)
    el.renderText = (word) => `#${word.text}`;
    await vi.waitFor(() => expect(el.textContent).toContain('#React'));

    el.remove();
    await vi.waitFor(() => expect(el.innerHTML).toBe(''));
  });
});
