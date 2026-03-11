# react-word-cloud

A React + TypeScript word cloud component based on the layout algorithm from [jQCloud](https://github.com/lucaong/jQCloud).

Words are placed on a spiral (elliptic or rectangular) starting from the center outward. Heavier words land closest to the center. Collision detection uses AABB (axis-aligned bounding box) checks so words never overlap. Font sizes are rendered with a **two-pass approach** — words are first rendered invisibly to measure their real DOM dimensions, then the pure layout algorithm runs, and finally words are re-rendered at their computed positions.

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
  - [Async data loading pattern](#async-data-loading-pattern)
- [Credits](#credits)
- [Contributing](#contributing)

---

## Installation

```bash
npm install react-word-cloud
```

Peer dependencies (`react` and `react-dom` ≥ 17) must already be installed in your project.

---

## Quick start

```tsx
import { WordCloud } from 'react-word-cloud';
import 'react-word-cloud/styles.css';

const words = [
  { text: 'React',      weight: 10 },
  { text: 'TypeScript', weight: 8 },
  { text: 'Open Source',weight: 6 },
  { text: 'Vite',       weight: 5 },
  { text: 'npm',        weight: 3 },
];

export default function App() {
  return <WordCloud words={words} width={600} height={400} />;
}
```

The stylesheet provides the default `w1`–`w10` color classes. You can skip it and supply your own colors via the `colors` prop or per-word `color` field.

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `words` | `Word[]` | — | **Required.** Array of words to render. |
| `width` | `number` | — | **Required.** Container width in px. |
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

### Word shape

```ts
interface Word {
  text: string;    // displayed label
  weight: number;  // relative importance — drives font size and color class

  // optional
  link?:      string | { href: string; target?: string; [key: string]: string | undefined };
  color?:     string;     // per-word inline color (overrides CSS class and colors prop)
  className?: string;     // extra class added to this word's <span>
}
```

---

## Theming

### CSS weight classes

When you import `react-word-cloud/styles.css` each word receives a class `w1`–`w10` (1 = lightest, 10 = heaviest). You can override these classes in your own stylesheet:

```css
/* your-styles.css */
.react-word-cloud .w10 { color: #e63946; }
.react-word-cloud .w9  { color: #e63946; }
.react-word-cloud .w8  { color: #457b9d; }
/* … */
.react-word-cloud .w1  { color: #a8dadc; }
```

### Inline colors

Pass a 10-element array to the `colors` prop. Index 0 maps to class `w1` (lightest), index 9 to `w10` (heaviest):

```tsx
<WordCloud
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
<WordCloud
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

<WordCloud words={words} width={600} height={400} />
```

### Animated reveal with `wordDelay`

Words appear one by one after layout, heaviest first.

```tsx
<WordCloud
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

<WordCloud
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
<WordCloud
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
  <WordCloud
    words={words}
    width={600}
    height={400}
    style={{ opacity: ready ? 1 : 0, transition: 'opacity 400ms' }}
    afterCloudRender={() => setReady(true)}
  />
</>
```

When `wordDelay` is set, `afterCloudRender` fires after the **last word** is revealed, not immediately after layout.

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
    <WordCloud
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
git clone https://github.com/your-org/react-word-cloud.git
cd react-word-cloud
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
  types.ts        TypeScript interfaces (Word, WordCloudProps)
  layout.ts       pure layout algorithm — no DOM, fully unit-tested
  WordCloud.tsx   React component (two-pass render)
  styles.css      default w1–w10 color classes

test/
  layout.test.ts       unit tests for the layout algorithm
  WordCloud.test.tsx   component rendering tests
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
