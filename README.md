# @basone01/react-jq-cloud

A React + TypeScript word cloud component based on the layout algorithm from [jQCloud](https://github.com/lucaong/jQCloud).

Words are placed on a spiral (elliptic or rectangular) starting from the center outward. Heavier words land closest to the center. Collision detection uses AABB (axis-aligned bounding box) checks so words never overlap. Font sizes are rendered with a **two-pass approach** — words are first rendered invisibly to measure their real DOM dimensions, then the pure layout algorithm runs, and finally words are re-rendered at their computed positions.

**🟢 [Live Demo](https://react-jq-cloud.basone01.com/)**

---

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Props](#props)
  - [Word shape](#word-shape)
- [Theming](#theming)
  - [CSS weight classes](#css-weight-classes)
  - [Inline colors](#inline-colors)
- [Recipes](#recipes)
  - [Clickable words](#clickable-words)
  - [Words as links](#words-as-links)
  - [Animated reveal with wordDelay](#animated-reveal-with-worddelay)
  - [Track reveal progress](#track-reveal-progress)
  - [Fit all words with shrinkToFit](#fit-all-words-with-shrinktofit)
  - [React to render completion](#react-to-render-completion)
  - [Custom tooltips](#custom-tooltips)
  - [Embedding HTML in words](#embedding-html-in-words)
  - [Fluid / responsive width](#fluid--responsive-width)
  - [Async data loading pattern](#async-data-loading-pattern)
- [Credits](#credits)
- [Contributing](#contributing)

---

## Installation

```bash
npm install @basone01/react-jq-cloud
```

Peer dependencies (`react` and `react-dom` ≥ 17) must already be installed in your project.

---

## Quick start

```tsx
import { ReactJQCloud } from '@basone01/react-jq-cloud';
import '@basone01/react-jq-cloud/styles.css';

const words = [
  { text: 'React',      weight: 10 },
  { text: 'TypeScript', weight: 8 },
  { text: 'Open Source',weight: 6 },
  { text: 'Vite',       weight: 5 },
  { text: 'npm',        weight: 3 },
];

export default function App() {
  return <ReactJQCloud words={words} width={600} height={400} />;
}
```

The stylesheet provides the default `w1`–`w10` color classes. You can skip it and supply your own colors via the `colors` prop or per-word `color` field.

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `words` | `Word[]` | — | **Required.** Array of words to render. |
| `width` | `number \| string` | — | **Required.** Container width — a pixel number or any CSS value (e.g. `"100%"`). When a string is passed, the actual pixel width is measured via `ResizeObserver`. |
| `height` | `number` | — | **Required.** Container height in px. |
| `center` | `{ x: number; y: number }` | `{ x: width/2, y: height/2 }` | Starting point of the spiral. |
| `shape` | `'elliptic' \| 'rectangular'` | `'elliptic'` | Spiral shape. |
| `fontSizes` | `[number, number]` | `[12, 60]` | `[minPx, maxPx]` — font size range mapped linearly to the weight range. |
| `fontFamily` | `string` | inherited | Font family applied to every word. |
| `removeOverflowing` | `boolean` | `true` | Drop words whose bounding box extends outside the container. |
| `shrinkToFit` | `boolean` | `false` | Iteratively reduce font scale (down to 30 % of original) until all words fit inside the container. Overrides `removeOverflowing`. |
| `wordDelay` | `number` | `0` | Milliseconds between each word appearing after layout. Words reveal in weight-descending order (heaviest first). `0` = all words appear at once. |
| `colors` | `string[]` | — | 10-element color array indexed by weight class (index 0 = class `w1`). Overrides CSS classes. |
| `className` | `string` | — | Extra class name added to the container `<div>`. |
| `style` | `React.CSSProperties` | — | Inline styles merged onto the container `<div>`. |
| `onWordClick` | `(word: Word, event: React.MouseEvent) => void` | — | Click handler called with the `Word` object and the native event. |
| `onWordReveal` | `(revealed: number, total: number) => void` | — | Called on each step of the `wordDelay` animation with the current count and total placed words. |
| `afterCloudRender` | `() => void` | — | Called once after all words are visible (after the last `wordDelay` step when used, or immediately after layout otherwise). |
| `renderText` | `(word: Word) => string` | — | Override the displayed text for each word. Receives the `Word` object; the returned string is rendered in place of `word.text`. Layout measurement still uses `word.text`. |
| `renderTooltip` | `(word: Word) => React.ReactNode` | — | Custom tooltip renderer. Called with the hovered `Word`; the returned node is rendered in a portal above the word. |
| `tooltipContainer` | `Element` | `document.body` | DOM element used as the portal target for `renderTooltip`. |

### Word shape

```ts
interface Word {
  text: string;    // displayed label
  weight: number;  // relative importance — drives font size and color class

  // optional
  html?:      Record<string, string>;  // extra HTML attributes spread onto the word's <span>
  link?:      string | { href: string; target?: string; [key: string]: string | undefined };
  color?:     string;     // per-word inline color (overrides CSS class and colors prop)
  className?: string;     // extra class added to this word's <span>
}
```

---

## Theming

### CSS weight classes

When you import `@basone01/react-jq-cloud/styles.css` each word receives a class `w1`–`w10` (1 = lightest, 10 = heaviest). You can override these classes in your own stylesheet:

```css
/* your-styles.css */
.react-jq-cloud .w10 { color: #e63946; }
.react-jq-cloud .w9  { color: #e63946; }
.react-jq-cloud .w8  { color: #457b9d; }
/* … */
.react-jq-cloud .w1  { color: #a8dadc; }
```

### Inline colors

Pass a 10-element array to the `colors` prop. Index 0 maps to class `w1` (lightest), index 9 to `w10` (heaviest):

```tsx
<ReactJQCloud
  words={words}
  width={600}
  height={400}
  colors={[
    '#ccc', '#bbb', '#aaa', '#999', '#888',
    '#666', '#555', '#333', '#111', '#000',
  ]}
/>
```

A per-word `color` field takes precedence over both the `colors` prop and the CSS class.

---

## Recipes

### Clickable words

```tsx
<ReactJQCloud
  words={words}
  width={600}
  height={400}
  onWordClick={(word, event) => {
    console.log('clicked', word.text);
  }}
/>
```

### Words as links

Pass a URL string or an object with `href` (and optionally `target`) to `word.link`. The word will be wrapped in an `<a>` tag.

```tsx
const words = [
  { text: 'React',  weight: 10, link: 'https://react.dev' },
  { text: 'Vite',   weight: 8,  link: { href: 'https://vitejs.dev', target: '_blank' } },
];

<ReactJQCloud words={words} width={600} height={400} />
```

### Animated reveal with `wordDelay`

Words appear one by one after layout, heaviest first.

```tsx
<ReactJQCloud
  words={words}
  width={600}
  height={400}
  wordDelay={80}  // 80 ms between each word
/>
```

Set `wordDelay={0}` (the default) to skip the animation.

### Track reveal progress

`onWordReveal` fires on every step of the `wordDelay` animation, letting you drive an external progress indicator.

```tsx
const [progress, setProgress] = useState({ revealed: 0, total: 0 });

<ReactJQCloud
  words={words}
  width={600}
  height={400}
  wordDelay={100}
  onWordReveal={(revealed, total) => setProgress({ revealed, total })}
/>

<p>{progress.revealed} / {progress.total} words</p>
```

### Fit all words with `shrinkToFit`

When the canvas is small or the word list is large, some words may be pushed outside the container and dropped. `shrinkToFit` reduces the overall font scale in steps of 15 % until every word fits — down to a minimum of 30 % of the original `fontSizes`.

```tsx
<ReactJQCloud
  words={words}
  width={400}
  height={300}
  shrinkToFit
/>
```

> **Note:** `shrinkToFit` internally forces `removeOverflowing: true` during each layout attempt. The two props are mutually exclusive — when `shrinkToFit` is enabled, `removeOverflowing` has no additional effect.

### React to render completion

`afterCloudRender` fires once after all words are visible. Use it to hide a loading spinner, trigger analytics, or start a follow-up animation.

```tsx
const [ready, setReady] = useState(false);

<>
  {!ready && <Spinner />}
  <ReactJQCloud
    words={words}
    width={600}
    height={400}
    style={{ opacity: ready ? 1 : 0, transition: 'opacity 400ms' }}
    afterCloudRender={() => setReady(true)}
  />
</>
```

When `wordDelay` is set, `afterCloudRender` fires after the **last word** is revealed, not immediately after layout.

### Custom tooltips

Pass `renderTooltip` to show a tooltip on hover. It receives the `Word` object and returns any React node. The tooltip is rendered in a `document.body` portal so it is never clipped by the container's `overflow: hidden`.

```tsx
<ReactJQCloud
  words={words}
  width={600}
  height={400}
  renderTooltip={(word) => (
    <div style={{
      background: '#1e1e2e',
      color: '#cdd6f4',
      padding: '6px 10px',
      borderRadius: 6,
      fontSize: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      marginBottom: 6,
      whiteSpace: 'nowrap',
    }}>
      <strong>{word.text}</strong>
      <span style={{ marginLeft: 8, opacity: 0.6 }}>weight: {word.weight}</span>
    </div>
  )}
/>
```

The tooltip div is positioned above the hovered word via `position: fixed` + `transform: translate(-50%, -100%)`. You have full control over its appearance through the returned node.

### Adding HTML attributes to words

Set `word.html` to a `Record<string, string>` to spread arbitrary HTML attributes onto the word's `<span>`. Useful for `data-*`, `aria-*`, or any other attribute.

```tsx
const words = [
  {
    text: 'React',
    weight: 10,
    html: { 'data-id': 'react', 'aria-label': 'React framework' },
  },
  {
    text: 'TypeScript',
    weight: 9,
    html: { 'data-id': 'typescript', 'data-category': 'language' },
  },
];

<ReactJQCloud words={words} width={600} height={400} />
```

### Fluid / responsive width

Pass any CSS string (e.g. `"100%"`) to `width`. The component attaches a `ResizeObserver` to its container and re-runs the layout whenever the measured pixel width changes.

```tsx
<div style={{ width: '60%' }}>
  <ReactJQCloud
    words={words}
    width="100%"
    height={320}
  />
</div>
```

The cloud will re-layout automatically when the container is resized.

### Async data loading pattern

```tsx
function MyCloud() {
  const [words, setWords] = useState<Word[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchWords().then(data => setWords(data));
  }, []);

  if (words.length === 0) return <Spinner />;

  return (
    <ReactJQCloud
      words={words}
      width={700}
      height={450}
      wordDelay={60}
      afterCloudRender={() => setReady(true)}
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 600ms ease' }}
    />
  );
}
```

---

## Credits

The layout algorithm is a direct port of [jQCloud](https://github.com/lucaong/jQCloud) by [Luca Ongaro](https://github.com/lucaong), originally released under the MIT license.

Key adaptations for React:

- **Two-pass rendering** — words are first rendered invisibly at the correct font size so the browser can measure their real pixel dimensions; the pure layout algorithm then runs with those measurements, and words are re-rendered at their computed absolute positions.
- **`shrinkToFit`** — iterative font scaling that is not present in the original library.
- **`wordDelay` / `onWordReveal`** — staggered reveal animation with progress callbacks.

---

## Contributing

Contributions are welcome — bug reports, feature requests, and pull requests alike.

### Development setup

```bash
git clone https://github.com/basone01/react-jq-cloud.git
cd react-jq-cloud  # or your fork
npm install
```

| Command | Purpose |
|---|---|
| `npm run dev` | Build in watch mode (tsup) |
| `npm run example` | Start the Vite dev server for the example app at http://localhost:5173 |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in interactive watch mode |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm run build` | Production build → `dist/` |

### Project layout

```
src/
  index.ts        public exports
  types.ts        TypeScript interfaces (Word, ReactJQCloudProps)
  layout.ts       pure layout algorithm — no DOM, fully unit-tested
  ReactJQCloud.tsx   React component (two-pass render)
  styles.css      default w1–w10 color classes

test/
  layout.test.ts       unit tests for the layout algorithm
  ReactJQCloud.test.tsx   component rendering tests
  setup.ts             jest-dom setup

example/
  App.tsx         interactive demos (basic, links, long keywords, 50 words,
                  async fetch, word delay, shrink-to-fit)
```

### Guidelines

- **Keep `layout.ts` pure.** It must not import React or touch the DOM. This makes it easy to unit-test and reason about independently of the rendering layer.
- **Write tests for new behaviour.** The test suite lives in `test/`. Run `npm test` before opening a PR.
- **Match existing code style.** TypeScript strict mode is enabled; `noUncheckedIndexedAccess` is on — index operations need null guards.
- **One concern per PR.** Smaller, focused pull requests are easier to review.

### Reporting bugs

Please open a GitHub issue with:

1. A minimal reproduction (ideally a code snippet or a link to a StackBlitz / CodeSandbox).
2. Expected vs actual behaviour.
3. Browser and React version.

### Releasing (maintainers)

```bash
# bump version in package.json, then:
npm run build
npm publish
```

`prepublishOnly` runs the build automatically, so `dist/` is always up to date before publishing.

---

## License

MIT
