import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReactJQCloud } from '../src/ReactJQCloud';
import '../src/styles.css';
import type { Word } from '../src/types';

// ─── Shared code-block component ─────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  // Minimal JSX/TSX token colouring — no external deps
  const html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // strings
    .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
      '<span style="color:#a8ff78">$1</span>')
    // jsx tags  &lt;ReactJQCloud  &lt;/ReactJQCloud
    .replace(/(&lt;\/?[A-Z][A-Za-z]*)/g,
      '<span style="color:#79b8ff">$1</span>')
    // jsx closing >
    .replace(/(\s)(\/&gt;|&gt;)/g,
      '$1<span style="color:#79b8ff">$2</span>')
    // prop names  word={  width={  etc.
    .replace(/\b([a-zA-Z]+)(?==\{|=&quot;)/g,
      '<span style="color:#ffab70">$1</span>')
    // keywords
    .replace(/\b(const|let|function|return|import|from|type|interface|export|default|true|false|null|undefined|if|else|=&gt;)\b/g,
      '<span style="color:#f97583">$1</span>')
    // comments
    .replace(/(\/\/[^\n]*)/g,
      '<span style="color:#6a737d;font-style:italic">$1</span>');

  return (
    <div style={{ position: 'relative', marginTop: 16 }}>
      <pre style={{
        margin: 0,
        padding: '14px 16px',
        background: '#0d1117',
        borderRadius: 8,
        fontSize: 13,
        lineHeight: 1.6,
        overflowX: 'auto',
        color: '#e6edf3',
        fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
      }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <button
        onClick={copy}
        style={{
          position: 'absolute', top: 8, right: 8,
          padding: '3px 10px', fontSize: 11, borderRadius: 5,
          border: '1px solid #444', background: '#21262d',
          color: copied ? '#3fb950' : '#8b949e',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

function ShowCode({ code }: { code: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', color: '#0070f3', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        <span style={{
          display: 'inline-block',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 150ms',
          fontSize: 10,
        }}>▶</span>
        {open ? 'Hide code' : 'Show code'}
      </button>
      {open && <CodeBlock code={code} />}
    </div>
  );
}

// ─── Word data ────────────────────────────────────────────────────────────────

const basicWords: Word[] = [
  { text: 'React', weight: 10 },
  { text: 'TypeScript', weight: 9 },
  { text: 'Word Cloud', weight: 8 },
  { text: 'JavaScript', weight: 7 },
  { text: 'Visualization', weight: 7 },
  { text: 'npm', weight: 6 },
  { text: 'Open Source', weight: 6 },
  { text: 'Component', weight: 5 },
  { text: 'Layout', weight: 5 },
  { text: 'Algorithm', weight: 5 },
  { text: 'jQCloud', weight: 4 },
  { text: 'Spiral', weight: 4 },
  { text: 'Elliptic', weight: 3 },
  { text: 'Rectangular', weight: 3 },
  { text: 'CSS', weight: 3 },
  { text: 'Vite', weight: 2 },
  { text: 'tsup', weight: 2 },
  { text: 'Vitest', weight: 2 },
  { text: 'ESM', weight: 1 },
  { text: 'CJS', weight: 1 },
];

const linkedWords: Word[] = [
  { text: 'React', weight: 10, link: { href: 'https://react.dev', target: '_blank' } },
  { text: 'TypeScript', weight: 9, link: { href: 'https://www.typescriptlang.org', target: '_blank' } },
  { text: 'Vite', weight: 8, link: { href: 'https://vitejs.dev', target: '_blank' } },
  { text: 'Vitest', weight: 7, link: { href: 'https://vitest.dev', target: '_blank' } },
  { text: 'npm', weight: 7, link: { href: 'https://www.npmjs.com', target: '_blank' } },
  { text: 'GitHub', weight: 6, link: { href: 'https://github.com', target: '_blank' } },
  { text: 'MDN', weight: 6, link: { href: 'https://developer.mozilla.org', target: '_blank' } },
  { text: 'Node.js', weight: 5, link: { href: 'https://nodejs.org', target: '_blank' } },
  { text: 'ESLint', weight: 5, link: { href: 'https://eslint.org', target: '_blank' } },
  { text: 'Prettier', weight: 4, link: { href: 'https://prettier.io', target: '_blank' } },
  { text: 'Rollup', weight: 4, link: { href: 'https://rollupjs.org', target: '_blank' } },
  { text: 'esbuild', weight: 3, link: { href: 'https://esbuild.github.io', target: '_blank' } },
  { text: 'tsup', weight: 3, link: { href: 'https://tsup.egoist.dev', target: '_blank' } },
  { text: 'pnpm', weight: 2, link: { href: 'https://pnpm.io', target: '_blank' } },
  { text: 'Bun', weight: 2, link: { href: 'https://bun.sh', target: '_blank' } },
];

const longWords: Word[] = [
  { text: 'Supercalifragilisticexpialidocious', weight: 10 },
  { text: 'Electroencephalography', weight: 9 },
  { text: 'Antidisestablishmentarianism', weight: 8 },
  { text: 'Pseudopseudohypoparathyroidism', weight: 8 },
  { text: 'Pneumonoultramicroscopicsilicovolcanoconiosis', weight: 7 },
  { text: 'Floccinaucinihilipilification', weight: 7 },
  { text: 'Hippopotomonstrosesquippedaliophobia', weight: 6 },
  { text: 'Incomprehensibilities', weight: 6 },
  { text: 'Counterrevolutionary', weight: 5 },
  { text: 'Disproportionately', weight: 5 },
  { text: 'Internationalization', weight: 4 },
  { text: 'Multidimensional', weight: 4 },
  { text: 'Photosynthesis', weight: 3 },
  { text: 'Approximately', weight: 2 },
  { text: 'Cryptography', weight: 1 },
];

const fiftyWords: Word[] = [
  { text: 'React', weight: 10 },
  { text: 'Vue', weight: 9 },
  { text: 'Angular', weight: 9 },
  { text: 'Svelte', weight: 8 },
  { text: 'Next.js', weight: 8 },
  { text: 'Nuxt', weight: 7 },
  { text: 'Remix', weight: 7 },
  { text: 'Astro', weight: 7 },
  { text: 'SolidJS', weight: 6 },
  { text: 'Qwik', weight: 6 },
  { text: 'TypeScript', weight: 10 },
  { text: 'JavaScript', weight: 9 },
  { text: 'Python', weight: 8 },
  { text: 'Rust', weight: 7 },
  { text: 'Go', weight: 7 },
  { text: 'Java', weight: 6 },
  { text: 'C#', weight: 6 },
  { text: 'Kotlin', weight: 5 },
  { text: 'Swift', weight: 5 },
  { text: 'Zig', weight: 4 },
  { text: 'GraphQL', weight: 8 },
  { text: 'REST', weight: 7 },
  { text: 'tRPC', weight: 6 },
  { text: 'WebSocket', weight: 5 },
  { text: 'gRPC', weight: 5 },
  { text: 'Postgres', weight: 7 },
  { text: 'MySQL', weight: 6 },
  { text: 'Redis', weight: 6 },
  { text: 'MongoDB', weight: 5 },
  { text: 'SQLite', weight: 4 },
  { text: 'Docker', weight: 8 },
  { text: 'Kubernetes', weight: 7 },
  { text: 'AWS', weight: 7 },
  { text: 'Vercel', weight: 6 },
  { text: 'Netlify', weight: 5 },
  { text: 'Tailwind', weight: 8 },
  { text: 'CSS Modules', weight: 6 },
  { text: 'Sass', weight: 5 },
  { text: 'Styled Components', weight: 5 },
  { text: 'shadcn/ui', weight: 7 },
  { text: 'Vite', weight: 7 },
  { text: 'Webpack', weight: 6 },
  { text: 'ESBuild', weight: 5 },
  { text: 'Rollup', weight: 4 },
  { text: 'Turbopack', weight: 5 },
  { text: 'Vitest', weight: 6 },
  { text: 'Jest', weight: 5 },
  { text: 'Playwright', weight: 5 },
  { text: 'Cypress', weight: 4 },
  { text: 'Storybook', weight: 4 },
];

const allDelayWords: Word[] = [
  { text: 'React', weight: 10 },
  { text: 'TypeScript', weight: 9 },
  { text: 'Vite', weight: 8 },
  { text: 'Tailwind', weight: 8 },
  { text: 'GraphQL', weight: 7 },
  { text: 'Next.js', weight: 7 },
  { text: 'Zustand', weight: 6 },
  { text: 'React Query', weight: 6 },
  { text: 'Zod', weight: 5 },
  { text: 'Prisma', weight: 5 },
  { text: 'tRPC', weight: 5 },
  { text: 'Drizzle', weight: 4 },
  { text: 'Playwright', weight: 4 },
  { text: 'Storybook', weight: 3 },
  { text: 'Turborepo', weight: 3 },
  { text: 'pnpm', weight: 2 },
  { text: 'ESLint', weight: 2 },
  { text: 'Prettier', weight: 1 },
];

// ─── Code snippets ────────────────────────────────────────────────────────────

const fluidWords: Word[] = basicWords;

const SNIPPETS: Record<string, string> = {
  basic: `\
import { ReactJQCloud } from '@basone01/react-jq-cloud';
import '@basone01/react-jq-cloud/styles.css';

const words = [
  { text: 'React',      weight: 10 },
  { text: 'TypeScript', weight: 9 },
  { text: 'Vite',       weight: 8 },
  // ...
];

<ReactJQCloud
  words={words}
  width={740}
  height={460}
  shape="elliptic" // or "rectangular"
/>`,

  links: `\
const words = [
  {
    text: 'React',
    weight: 10,
    link: { href: 'https://react.dev', target: '_blank' },
  },
  {
    text: 'Vite',
    weight: 8,
    link: 'https://vitejs.dev', // string shorthand
  },
];

<ReactJQCloud words={words} width={740} height={460} />`,

  long: `\
// Long words may overflow the container.
// Toggle removeOverflowing to drop or keep them.

<ReactJQCloud
  words={words}
  width={740}
  height={460}
  removeOverflowing={true}  // drop words that don't fit
/>

// — or —

<ReactJQCloud
  words={words}
  width={740}
  height={460}
  removeOverflowing={false} // place them even if out of bounds
/>`,

  fifty: `\
// 50 words — heavier words land closest to center.
// Font sizes are linearly mapped across [minPx, maxPx].

<ReactJQCloud
  words={words}       // Word[]
  width={740}
  height={460}
  fontSizes={[12, 60]} // [minPx, maxPx] — default
/>`,

  delay: `\
const [words, setWords] = useState([]);
const [visible, setVisible] = useState(false);

// Simulate async fetch
function run() {
  setTimeout(() => setWords(apiData), 1500);
}

<ReactJQCloud
  words={words}
  width={740}
  height={460}
  afterCloudRender={() => setVisible(true)}
  style={{
    opacity: visible ? 1 : 0,
    transition: 'opacity 600ms ease',
  }}
/>`,

  'word-delay': `\
// Words appear one by one after layout (heaviest first).
// onWordReveal fires on every step for progress tracking.

<ReactJQCloud
  words={words}
  width={740}
  height={460}
  wordDelay={120} // ms between each word
  onWordReveal={(revealed, total) => {
    console.log(revealed + ' / ' + total);
  }}
  afterCloudRender={() => console.log('all done')}
/>`,

  shrink: `\
// removeOverflowing (default) — drops words that don't fit
<ReactJQCloud words={words} width={740} height={460} />

// removeOverflowing=false — places all words, may overflow
<ReactJQCloud
  words={words}
  width={740}
  height={460}
  removeOverflowing={false}
/>

// shrinkToFit — scales font down until everything fits
<ReactJQCloud
  words={words}
  width={740}
  height={460}
  shrinkToFit
/>`,

  fluid: `\
// Pass a CSS string like "100%" instead of a fixed number.
// The component measures its container and re-lays out on resize.

<div style={{ width: '60%' }}>
  <ReactJQCloud
    words={words}
    width="100%"
    height={320}
  />
</div>`,
};

// ─── Self-contained demos ─────────────────────────────────────────────────────

type Phase = 'idle' | 'fetching' | 'laying-out' | 'done';
const FETCH_DELAY_MS = 1500;
const LOG_MAX = 6;

function DelayDemo() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [words, setWords] = useState<Word[]>([]);
  const [visible, setVisible] = useState(false);
  const [log, setLog] = useState<{ t: number; msg: string }[]>([]);
  const startRef = useRef<number>(0);

  function addLog(msg: string) {
    const elapsed = Date.now() - startRef.current;
    setLog(prev => [...prev.slice(-(LOG_MAX - 1)), { t: elapsed, msg }]);
  }

  const run = useCallback(() => {
    setPhase('fetching');
    setWords([]);
    setVisible(false);
    setLog([]);
    startRef.current = Date.now();
    addLog('Fetching words from API…');
    setTimeout(() => {
      addLog(`Received ${allDelayWords.length} words`);
      setWords(allDelayWords);
      setPhase('laying-out');
      addLog('ReactJQCloud measuring + layout…');
    }, FETCH_DELAY_MS);
  }, []);

  const onRender = useCallback(() => {
    addLog('afterCloudRender fired — fading in');
    setVisible(true);
    setPhase('done');
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <button
          onClick={run}
          disabled={phase === 'fetching' || phase === 'laying-out'}
          style={{
            padding: '7px 18px', borderRadius: 6, border: 'none',
            background: '#0070f3', color: '#fff', fontWeight: 600,
            cursor: phase === 'fetching' || phase === 'laying-out' ? 'not-allowed' : 'pointer',
            opacity: phase === 'fetching' || phase === 'laying-out' ? 0.6 : 1,
          }}
        >
          {phase === 'idle' ? 'Simulate fetch & render'
            : phase === 'fetching' ? 'Fetching…'
            : phase === 'laying-out' ? 'Rendering…'
            : 'Run again'}
        </button>
        <PhaseIndicator phase={phase} />
      </div>

      {log.length > 0 && (
        <div style={{
          fontFamily: 'monospace', fontSize: 12, background: '#111', color: '#0f0',
          borderRadius: 6, padding: '8px 12px', marginBottom: 12, lineHeight: 1.7,
        }}>
          {log.map((entry, i) => (
            <div key={i}><span style={{ color: '#888' }}>[+{entry.t}ms]</span> {entry.msg}</div>
          ))}
        </div>
      )}

      <div style={{
        width: 740, height: 460, position: 'relative',
        border: '1px solid #ddd', borderRadius: 8, background: '#fafafa', overflow: 'hidden',
      }}>
        {(phase === 'idle' || phase === 'fetching') && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12,
          }}>
            {phase === 'fetching' && <Spinner />}
            <span style={{ color: '#aaa', fontSize: 14 }}>
              {phase === 'idle' ? 'Press the button to start' : `Fetching words… (${FETCH_DELAY_MS}ms delay)`}
            </span>
          </div>
        )}
        {words.length > 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            opacity: visible ? 1 : 0, transition: 'opacity 600ms ease',
          }}>
            <ReactJQCloud words={words} width={740} height={460} afterCloudRender={onRender} />
          </div>
        )}
      </div>

      <p style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
        <code>afterCloudRender</code> fires after the two-pass layout completes. Use it to fade in,
        hide a spinner, or trigger analytics.
      </p>
      <ShowCode code={SNIPPETS['delay']!} />
    </div>
  );
}

function PhaseIndicator({ phase }: { phase: Phase }) {
  const map: Record<Phase, { label: string; color: string }> = {
    idle:         { label: 'idle',       color: '#999' },
    fetching:     { label: 'fetching',   color: '#f0a500' },
    'laying-out': { label: 'laying out', color: '#0070f3' },
    done:         { label: 'rendered',   color: '#0a0' },
  };
  const { label, color } = map[phase];
  return (
    <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 32, height: 32, border: '3px solid #ddd',
      borderTop: '3px solid #0070f3', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}

function WordDelayDemo() {
  const [delay, setDelay] = useState(120);
  const [cloudKey, setCloudKey] = useState(0);
  const [progress, setProgress] = useState<{ count: number; total: number } | null>(null);
  const [done, setDone] = useState(false);

  function replay() { setCloudKey(k => k + 1); setProgress(null); setDone(false); }
  function applyDelay(ms: number) { setDelay(ms); replay(); }

  const pct = progress ? Math.round((progress.count / progress.total) * 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          Delay per word:
          <input type="range" min={0} max={500} step={10} value={delay}
            onChange={e => applyDelay(Number(e.target.value))} style={{ width: 140 }} />
          <code style={{ minWidth: 52, fontSize: 13 }}>{delay}ms</code>
        </label>
        <button onClick={replay} style={{
          padding: '5px 14px', borderRadius: 6,
          border: '1px solid #ccc', cursor: 'pointer', background: '#fff',
        }}>↺ Replay</button>
        {progress && (
          <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'monospace' }}>{progress.count} / {progress.total}</span>
            <span style={{
              display: 'inline-block', width: 80, height: 6,
              background: '#eee', borderRadius: 3, overflow: 'hidden',
            }}>
              <span style={{
                display: 'block', height: '100%', borderRadius: 3,
                width: `${pct}%`,
                background: done ? '#0a0' : '#0070f3',
                transition: `width ${delay || 100}ms linear`,
              }} />
            </span>
            {done && <span style={{ color: '#0a0', fontWeight: 600 }}>done</span>}
          </span>
        )}
      </div>

      <ReactJQCloud
        key={cloudKey}
        words={allDelayWords}
        width={740}
        height={460}
        wordDelay={delay}
        onWordReveal={(count, total) => setProgress({ count, total })}
        afterCloudRender={() => setDone(true)}
        style={{ border: '1px solid #ddd', borderRadius: 8, background: '#fafafa' }}
      />

      <p style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
        Words appear heaviest-first (layout order). <code>onWordReveal(count, total)</code> fires
        on each step; <code>afterCloudRender</code> fires when all words are visible.
      </p>
      <ShowCode code={SNIPPETS['word-delay']!} />
    </div>
  );
}

type FitMode = 'removeOverflowing' | 'allowOverflow' | 'shrinkToFit';

function ShrinkToFitDemo() {
  const [mode, setMode] = useState<FitMode>('removeOverflowing');
  const [cloudKey, setCloudKey] = useState(0);

  function setModeAndReset(m: FitMode) { setMode(m); setCloudKey(k => k + 1); }

  const modes: { key: FitMode; label: string; description: string }[] = [
    { key: 'removeOverflowing', label: 'removeOverflowing', description: "Words that don't fit are dropped (default)" },
    { key: 'allowOverflow',     label: 'removeOverflowing=false', description: 'All words placed; may extend outside container' },
    { key: 'shrinkToFit',       label: 'shrinkToFit', description: 'Font scale reduced until every word fits inside bounds' },
  ];

  const props = {
    removeOverflowing: mode === 'removeOverflowing',
    shrinkToFit: mode === 'shrinkToFit',
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {modes.map(m => (
          <button key={m.key} onClick={() => setModeAndReset(m.key)} style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid #ccc',
            background: mode === m.key ? '#0070f3' : '#fff',
            color: mode === m.key ? '#fff' : '#333',
            cursor: 'pointer', fontWeight: mode === m.key ? 600 : 400,
          }}>{m.label}</button>
        ))}
      </div>
      <p style={{ margin: '0 0 12px', color: '#555', fontSize: 13 }}>
        {modes.find(m => m.key === mode)!.description}
      </p>
      <ReactJQCloud
        key={cloudKey}
        words={fiftyWords}
        width={740}
        height={460}
        {...props}
        style={{ border: '1px solid #ddd', borderRadius: 8, background: '#fafafa' }}
      />
      <p style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
        50 words. With <code>shrinkToFit</code>, font sizes are scaled down (up to ×0.30 min)
        until all words fit without any being dropped.
      </p>
      <ShowCode code={SNIPPETS['shrink']!} />
    </div>
  );
}

function FluidDemo() {
  const [widthPct, setWidthPct] = useState(100);
  const [cloudKey, setCloudKey] = useState(0);

  function apply(pct: number) { setWidthPct(pct); setCloudKey(k => k + 1); }

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          Container width:
          <input type="range" min={30} max={100} step={5} value={widthPct}
            onChange={e => apply(Number(e.target.value))} style={{ width: 140 }} />
          <code style={{ minWidth: 40, fontSize: 13 }}>{widthPct}%</code>
        </label>
      </div>

      <div style={{ width: `${widthPct}%`, transition: 'width 200ms ease' }}>
        <ReactJQCloud
          key={cloudKey}
          words={fluidWords}
          width="100%"
          height={320}
          style={{ border: '1px solid #ddd', borderRadius: 8, background: '#fafafa' }}
        />
      </div>

      <p style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
        Drag the slider to resize the container. The cloud re-lays out automatically via{' '}
        <code>ResizeObserver</code>.
      </p>
      <ShowCode code={SNIPPETS['fluid']!} />
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

type DemoKey = 'basic' | 'links' | 'long' | 'fifty' | 'delay' | 'word-delay' | 'shrink' | 'fluid';

const DEMOS: { key: DemoKey; label: string; words: Word[]; description: string }[] = [
  { key: 'basic',      label: 'Basic',           words: basicWords,   description: '20 words — shape toggle' },
  { key: 'links',      label: 'With Links',       words: linkedWords,  description: '15 clickable words linking to external sites' },
  { key: 'long',       label: 'Long Keywords',    words: longWords,    description: 'Very long words — observe overflow behaviour with removeOverflowing on/off' },
  { key: 'fifty',      label: '50 Keywords',      words: fiftyWords,   description: '50 tech keywords across frameworks, languages, databases, and tools' },
  { key: 'delay',      label: 'Async fetch',      words: [],           description: 'Simulates async data loading: spinner while fetching, then afterCloudRender triggers a fade-in.' },
  { key: 'word-delay', label: 'Word delay',        words: [],           description: 'wordDelay prop: words appear one by one (heaviest first). Drag the slider to control the interval.' },
  { key: 'shrink',     label: 'Shrink to fit',    words: [],           description: 'Compare removeOverflowing vs allowOverflow vs shrinkToFit on 50 words.' },
  { key: 'fluid',      label: 'Fluid width',       words: [],           description: 'Pass width="100%" to fill the container. A ResizeObserver re-lays out the cloud on every resize.' },
];

export default function App() {
  const [demo, setDemo] = useState<DemoKey>('basic');
  const [shape, setShape] = useState<'elliptic' | 'rectangular'>('elliptic');
  const [removeOverflowing, setRemoveOverflowing] = useState(true);
  const [shrinkToFit, setShrinkToFit] = useState(false);
  const [clicked, setClicked] = useState<string | null>(null);

  const current = DEMOS.find(d => d.key === demo)!;
  const isSelfContained = demo === 'delay' || demo === 'word-delay' || demo === 'shrink' || demo === 'fluid';

  useEffect(() => {
    const id = 'rwc-spin-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24, maxWidth: 800 }}>
      <h1 style={{ margin: '0 0 4px' }}>React JQCloud</h1>
      <p style={{ margin: '0 0 20px', color: '#666', fontSize: 14 }}>Demos</p>

      {/* Demo selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {DEMOS.map(d => (
          <button
            key={d.key}
            onClick={() => { setDemo(d.key); setClicked(null); }}
            style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid #ccc',
              background: demo === d.key ? '#0070f3' : '#fff',
              color: demo === d.key ? '#fff' : '#333',
              cursor: 'pointer', fontWeight: demo === d.key ? 600 : 400,
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      <p style={{ margin: '0 0 12px', color: '#555', fontSize: 13 }}>{current.description}</p>

      {/* Controls — hidden for self-contained demos */}
      {!isSelfContained && (
        <div style={{ display: 'flex', gap: 20, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {(['elliptic', 'rectangular'] as const).map(s => (
              <label key={s} style={{ cursor: 'pointer' }}>
                <input type="radio" value={s} checked={shape === s} onChange={() => setShape(s)} />{' '}
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </label>
            ))}
          </div>
          <label style={{ cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={shrinkToFit}
              onChange={e => { setShrinkToFit(e.target.checked); if (e.target.checked) setRemoveOverflowing(true); }} />
            Shrink to fit
          </label>
          <label style={{ cursor: shrinkToFit ? 'not-allowed' : 'pointer', display: 'flex', gap: 6, alignItems: 'center', opacity: shrinkToFit ? 0.4 : 1 }}>
            <input type="checkbox" checked={removeOverflowing} disabled={shrinkToFit}
              onChange={e => setRemoveOverflowing(e.target.checked)} />
            Remove overflowing
          </label>
          {clicked && (
            <span style={{ color: '#555', fontSize: 13 }}>
              Clicked: <strong>{clicked}</strong>
            </span>
          )}
        </div>
      )}

      {/* Cloud */}
      {demo === 'delay' ? (
        <DelayDemo key="delay" />
      ) : demo === 'word-delay' ? (
        <WordDelayDemo key="word-delay" />
      ) : demo === 'shrink' ? (
        <ShrinkToFitDemo key="shrink" />
      ) : demo === 'fluid' ? (
        <FluidDemo key="fluid" />
      ) : (
        <>
          <ReactJQCloud
            key={`${demo}-${shape}-${removeOverflowing}-${shrinkToFit}`}
            words={current.words}
            width={740}
            height={460}
            shape={shape}
            removeOverflowing={removeOverflowing}
            shrinkToFit={shrinkToFit}
            onWordClick={word => setClicked(word.text)}
            style={{ border: '1px solid #ddd', borderRadius: 8, background: '#fafafa' }}
          />
          {demo === 'links' && (
            <p style={{ marginTop: 10, fontSize: 12, color: '#888' }}>
              Words are hyperlinks — click to open in a new tab.
            </p>
          )}
          <ShowCode code={SNIPPETS[demo]!} />
        </>
      )}
    </div>
  );
}
