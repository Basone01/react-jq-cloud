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

// ─── Thai words dataset ───────────────────────────────────────────────────────

const thaiWords: Word[] = [
  { text: 'ส่งฟรี', weight: 196 },
  { text: 'ถ้าเป็นลูกค้าใหม่จะให้โอนครึ่งนึงของของนะคะถ้าลูกค้าเก่าจะไม่มีปัญหาค่ะกรุณาแจ้งที่อยู่เบอร์โทรให้ชัดเจนนะคะถ้าไม่ชัดเจนแม่ค้าจะไม่อาจส่งได้นะคะ', weight: 194 },
  { text: 'พัฒนาชนบท', weight: 194 },
  { text: 'พิกัดปั๊มปตท', weight: 194 },
  { text: 'ร่มเกล้าส่งฟรีเฉพาะเขตลาดกระบังเขตอื่นมีค่าส่งคิดตามระยะทาง', weight: 194 },
  { text: 'เอื้อร่มเกล้าส่งฟรีเฉพาะเขตลาดกระบังนะคะอ่านให้เข้าใจก่อนสั่งซื้อเขตอื่นมีค่าส่งตามรยะทางคะ', weight: 194 },
  { text: 'ขอบคุณ', weight: 193 },
  { text: 'นอกเขตนอกพื้นที่ส่งหมดค่ะคิดค่าส่งตามระยะทางเลยค่ะอ่านเข้าใจก่อนสั่งซื้อค่ะ', weight: 193 },
  { text: 'พิกัดปั๊มปตทคุ้มเกล้าไม่มีหน้าร้านนะคะ', weight: 193 },
  { text: 'ลาดกระบัง', weight: 193 },
  { text: 'เบอร์โทรติดต่อ', weight: 193 },
  { text: 'ไม่รับมิจฉาชีพนะคะไม่ต้องแอดมา❌', weight: 193 },
  { text: 'พูนสิน', weight: 192 },
  { text: 'เอื้อทับยาว1_2ส่งฟรีเลยเอื้อทับยาวมีค่าส่ง', weight: 192 },
  { text: 'หอยเชอรี่ต้มแกะตาแล้ว', weight: 176 },
  { text: 'กรุณาอ่านให้เข้าใจก่อนสั่งสินค้านะคะ', weight: 163 },
  { text: 'มิจฉาชีพ', weight: 154 },
  { text: 'พรรคประชาชน', weight: 135 },
  { text: 'เริ่มส่งบ่าย', weight: 133 },
  { text: 'เก็บเงินปลายทางได้นะคะแต่ต้องจ่ายให้แม่ค้านะคะถ้าไม่จ่ายจะดำเนินตามกฎหมายนะคะเป็น2เท่าคะ', weight: 128 },
  { text: 'ถ้าใช้หอยสดหอยแกะ5_10กิโลสั่งล่วงหน้า', weight: 124 },
  { text: 'หอยเชอรี่สดคละไซส์กิโลละ', weight: 119 },
  { text: 'สแกมเมอร์', weight: 116 },
  { text: 'กกต', weight: 102 },
  { text: 'ผักบ้านๆสวนครัวปลอดสารผักสดสั่งได้เลยนะคะหอยสดหอยแกะสั่งล่วงหน้าน่อยเพราะช่วงนี้หายหายาก', weight: 98 },
  { text: 'หอยถ้ารับเยอะถามสอบถามก่อนนะคะ🐌', weight: 98 },
  { text: 'กรุณาอ่านให้เข้าใจก่อนสั่งซื้อนะคะ🙏🏻', weight: 94 },
  { text: 'เตือนภัย', weight: 88 },
  { text: 'laserid', weight: 83 },
  { text: 'เตือนภัยออนไลน์', weight: 78 },
  { text: 'เลือกตั้ง69', weight: 77 },
  { text: 'thaipbs', weight: 76 },
  { text: 'ชีวิตง่ายได้ทุกวัน', weight: 76 },
  { text: 'แก๊งคอลเซ็นเตอร์', weight: 73 },
  { text: 'บุ๋มปนัดดา', weight: 69 },
  { text: 'krungsricard', weight: 60 },
  { text: 'ข่าววันนี้', weight: 60 },
  { text: 'บัตรเครดิต', weight: 60 },
  { text: 'เริ่มส่ง', weight: 60 },
  { text: 'topnewstv', weight: 59 },
  { text: 'บัตรเครดิตกรุงศรี', weight: 57 },
  { text: 'คุณค่าในแบบคุณ', weight: 50 },
  { text: 'บัญชีม้า', weight: 49 },
  { text: 'pptvhd36', weight: 47 },
  { text: 'เตือนภัยมิจฉาชีพ', weight: 47 },
  { text: 'เรื่องข่าวเรื่องใหญ่', weight: 47 },
  { text: 'โปรดีบอกต่อ', weight: 46 },
  { text: 'ภัยไซเบอร์', weight: 45 },
  { text: 'การเมือง', weight: 44 },
  { text: 'ข่าวtiktok', weight: 43 },
];

// ─── Code snippets ────────────────────────────────────────────────────────────

const fluidWords: Word[] = basicWords;

const htmlWords: Word[] = basicWords.map((w, i) => ({
  ...w,
  html: { 'data-index': String(i), 'data-weight': String(w.weight), 'aria-label': w.text },
}));

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
  width="100%"
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

<ReactJQCloud words={words} width="100%" height={460} />`,

  long: `\
// Long words may overflow the container.
// Toggle removeOverflowing to drop or keep them.

<ReactJQCloud
  words={words}
  width="100%"
  height={460}
  removeOverflowing={true}  // drop words that don't fit
/>

// — or —

<ReactJQCloud
  words={words}
  width="100%"
  height={460}
  removeOverflowing={false} // place them even if out of bounds
/>`,

  fifty: `\
// 50 words — heavier words land closest to center.
// Font sizes are linearly mapped across [minPx, maxPx].

<ReactJQCloud
  words={words}       // Word[]
  width="100%"
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
  width="100%"
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
  width="100%"
  height={460}
  wordDelay={120} // ms between each word
  onWordReveal={(revealed, total) => {
    console.log(revealed + ' / ' + total);
  }}
  afterCloudRender={() => console.log('all done')}
/>`,

  shrink: `\
// removeOverflowing (default) — drops words that don't fit
<ReactJQCloud words={words} width="100%" height={460} />

// removeOverflowing=false — places all words, may overflow
<ReactJQCloud
  words={words}
  width="100%"
  height={460}
  removeOverflowing={false}
/>

// shrinkToFit — scales font down until everything fits
<ReactJQCloud
  words={words}
  width="100%"
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

  html: `\
// Use the html field to add arbitrary HTML attributes to each word's <span>.
// Useful for data-* attributes, aria-* attributes, or any other HTML attribute.

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

<ReactJQCloud words={words} width="100%" height={460} />`,

  tooltip: `\
// renderTooltip receives the Word object and returns any React node.
// The tooltip is rendered in a portal so it is never clipped.

<ReactJQCloud
  words={words}
  width="100%"
  height={460}
  renderTooltip={(word) => (
    <div style={{
      background: '#1e1e2e',
      color: '#cdd6f4',
      padding: '6px 10px',
      borderRadius: 6,
      fontSize: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      marginBottom: 6,
    }}>
      <strong>{word.text}</strong>
      <span style={{ marginLeft: 8, opacity: 0.6 }}>weight: {word.weight}</span>
    </div>
  )}
/>`,

  hashtag: `\
// Use renderText to add a "#" prefix to every word.

<ReactJQCloud
  words={words}
  width="100%"
  height={460}
  renderText={(word) => '#' + word.text}
/>`,

  spacing: `\
// spacing adds extra px padding around each word's bounding box
// during collision detection — words won't be placed this close together.

<ReactJQCloud
  words={words}
  width="100%"
  height={460}
  spacing={6}
/>`,

  overflow: `\
// wrapAtPercent — wrap words wider than N% of the container width.
<ReactJQCloud
  words={words}
  width="100%"
  height={460}
  wrapAtPercent={20}
/>

// ellipsisAtPercent — truncate words wider than N% with "…".
<ReactJQCloud
  words={words}
  width="100%"
  height={460}
  ellipsisAtPercent={20}
/>`,
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
            <ReactJQCloud words={words} width="100%" height={460} afterCloudRender={onRender} />
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
        width="100%"
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
        width="100%"
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

function HtmlDemo() {
  return (
    <div>
      <ReactJQCloud
        words={htmlWords}
        width="100%"
        height={460}
        style={{ border: '1px solid #ddd', borderRadius: 8, background: '#fafafa' }}
      />
      <p style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
        Each word has <code>data-index</code>, <code>data-weight</code>, and <code>aria-label</code> attributes
        added via the <code>html</code> field. Inspect the DOM to see them on each <code>&lt;span&gt;</code>.
      </p>
      <ShowCode code={SNIPPETS['html']!} />
    </div>
  );
}

function TooltipDemo() {
  return (
    <div>
      <ReactJQCloud
        words={basicWords}
        width="100%"
        height={460}
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
        style={{ border: '1px solid #ddd', borderRadius: 8, background: '#fafafa' }}
      />
      <p style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
        Hover any word. <code>renderTooltip</code> receives the <code>Word</code> object and returns
        any React node — rendered in a portal so it is never clipped by the container.
      </p>
      <ShowCode code={SNIPPETS['tooltip']!} />
    </div>
  );
}

function HashtagDemo() {
  return (
    <div>
      <ReactJQCloud
        words={basicWords}
        width="100%"
        height={460}
        renderText={(word) => '#' + word.text}
        style={{ border: '1px solid #ddd', borderRadius: 8, background: '#fafafa' }}
      />
      <p style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
        <code>renderText</code> prepends <code>#</code> to every word at render time.
        Layout sizing still uses the original <code>word.text</code>.
      </p>
      <ShowCode code={SNIPPETS['hashtag']!} />
    </div>
  );
}

function SpacingDemo() {
  const [spacing, setSpacing] = useState(0);
  const [shrinkToFit, setShrinkToFit] = useState(false);
  const [removeOverflowing, setRemoveOverflowing] = useState(true);
  const [cloudKey, setCloudKey] = useState(0);

  function reset() { setCloudKey(k => k + 1); }

  return (
    <div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          Spacing:
          <input type="range" min={0} max={20} step={1} value={spacing}
            onChange={e => { setSpacing(Number(e.target.value)); reset(); }} style={{ width: 140 }} />
          <code style={{ minWidth: 36, fontSize: 13 }}>{spacing}px</code>
        </label>
        <label style={{ cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={shrinkToFit}
            onChange={e => { setShrinkToFit(e.target.checked); if (e.target.checked) setRemoveOverflowing(true); reset(); }} />
          Shrink to fit
        </label>
        <label style={{ cursor: shrinkToFit ? 'not-allowed' : 'pointer', display: 'flex', gap: 6, alignItems: 'center', opacity: shrinkToFit ? 0.4 : 1 }}>
          <input type="checkbox" checked={removeOverflowing} disabled={shrinkToFit}
            onChange={e => { setRemoveOverflowing(e.target.checked); reset(); }} />
          Remove overflowing
        </label>
      </div>

      <ReactJQCloud
        key={cloudKey}
        words={fiftyWords}
        width="100%"
        height={460}
        spacing={spacing}
        shrinkToFit={shrinkToFit}
        removeOverflowing={removeOverflowing}
        style={{ border: '1px solid #ddd', borderRadius: 8, background: '#fafafa' }}
      />

      <p style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
        50 words. Drag the slider to add breathing room between words.
        <code> spacing</code> inflates each word's collision box without changing its rendered size.
      </p>
      <ShowCode code={SNIPPETS['spacing']!} />
    </div>
  );
}

type OverflowMode = 'none' | 'wrap' | 'ellipsis';

function OverflowDemo() {
  const [mode, setMode] = useState<OverflowMode>('none');
  const [threshold, setThreshold] = useState(20);
  const [cloudKey, setCloudKey] = useState(0);

  function reset() { setCloudKey(k => k + 1); }

  const modes: { key: OverflowMode; label: string }[] = [
    { key: 'none',     label: 'No limit' },
    { key: 'wrap',     label: 'wrapAtPercent' },
    { key: 'ellipsis', label: 'ellipsisAtPercent' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {modes.map(m => (
            <button key={m.key} onClick={() => { setMode(m.key); reset(); }} style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid #ccc',
              background: mode === m.key ? '#0070f3' : '#fff',
              color: mode === m.key ? '#fff' : '#333',
              cursor: 'pointer', fontWeight: mode === m.key ? 600 : 400,
            }}>{m.label}</button>
          ))}
        </div>
        {mode !== 'none' && (
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            Max width:
            <input type="range" min={5} max={60} step={5} value={threshold}
              onChange={e => { setThreshold(Number(e.target.value)); reset(); }} style={{ width: 120 }} />
            <code style={{ minWidth: 40, fontSize: 13 }}>{threshold}%</code>
          </label>
        )}
      </div>

      <ReactJQCloud
        key={cloudKey}
        words={longWords}
        width="100%"
        height={460}
        wrapAtPercent={mode === 'wrap' ? threshold : undefined}
        ellipsisAtPercent={mode === 'ellipsis' ? threshold : undefined}
        style={{ border: '1px solid #ddd', borderRadius: 8, background: '#fafafa' }}
      />

      <p style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
        Long words dataset. <code>wrapAtPercent</code> breaks onto multiple lines;{' '}
        <code>ellipsisAtPercent</code> truncates with "…". Both accept a percentage of the container width.
      </p>
      <ShowCode code={SNIPPETS['overflow']!} />
    </div>
  );
}

// ─── Playground ───────────────────────────────────────────────────────────────

type DatasetKey = 'thai' | 'basic' | 'fifty' | 'long' | 'links';

const DATASETS: { key: DatasetKey; label: string; words: Word[] }[] = [
  { key: 'thai',  label: 'Thai (50)',    words: thaiWords },
  { key: 'basic', label: 'Basic (20)',   words: basicWords },
  { key: 'fifty', label: '50 Keywords', words: fiftyWords },
  { key: 'long',  label: 'Long Words',  words: longWords },
  { key: 'links', label: 'With Links',  words: linkedWords },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ minWidth: 140, fontSize: 13, color: '#555', fontWeight: 600 }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, fontSize: 13 }}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function Slider({ min, max, step, value, onChange, unit = '' }: { min: number; max: number; step: number; value: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))} style={{ width: 140 }} />
      <code style={{ minWidth: 48 }}>{value}{unit}</code>
    </label>
  );
}

function PlaygroundDemo() {
  const [dataset, setDataset] = useState<DatasetKey>('thai');
  const [shape, setShape] = useState<'elliptic' | 'rectangular'>('elliptic');
  const [height, setHeight] = useState(460);
  const [fontMin, setFontMin] = useState(12);
  const [fontMax, setFontMax] = useState(60);
  const [spacing, setSpacing] = useState(4);
  const [wordDelay, setWordDelay] = useState(0);
  const [shrinkToFit, setShrinkToFit] = useState(false);
  const [removeOverflowing, setRemoveOverflowing] = useState(true);
  const [useWrap, setUseWrap] = useState(false);
  const [wrapPct, setWrapPct] = useState(25);
  const [useEllipsis, setUseEllipsis] = useState(false);
  const [ellipsisPct, setEllipsisPct] = useState(25);
  const [useWrapOnLimit, setUseWrapOnLimit] = useState(false);
  const [wrapOnLimitPct, setWrapOnLimitPct] = useState(25);
  const [useEllipsisOnLimit, setUseEllipsisOnLimit] = useState(false);
  const [ellipsisOnLimitPct, setEllipsisOnLimitPct] = useState(25);
  const [hashPrefix, setHashPrefix] = useState(false);
  const [cloudKey, setCloudKey] = useState(0);

  function reset() { setCloudKey(k => k + 1); }

  const words = DATASETS.find(d => d.key === dataset)!.words;

  const propsCode = [
    `words={words}`,
    `width="100%"`,
    `height={${height}}`,
    shape !== 'elliptic' ? `shape="${shape}"` : null,
    `fontSizes={[${fontMin}, ${fontMax}]}`,
    spacing ? `spacing={${spacing}}` : null,
    wordDelay ? `wordDelay={${wordDelay}}` : null,
    shrinkToFit ? `shrinkToFit` : null,
    !removeOverflowing && !shrinkToFit ? `removeOverflowing={false}` : null,
    useWrap ? `wrapAtPercent={${wrapPct}}` : null,
    useEllipsis ? `ellipsisAtPercent={${ellipsisPct}}` : null,
    useWrapOnLimit ? `wrapAtPercentOnLimit={${wrapOnLimitPct}}` : null,
    useEllipsisOnLimit ? `ellipsisAtPercentOnLimit={${ellipsisOnLimitPct}}` : null,
    hashPrefix ? `renderText={(word) => '#' + word.text}` : null,
  ].filter(Boolean).map(p => `  ${p}`).join('\n');

  const snippet = `<ReactJQCloud\n${propsCode}\n/>`;

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, padding: '16px', background: '#f8f9fa', borderRadius: 8, border: '1px solid #e0e0e0' }}>

        <Row label="Dataset">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DATASETS.map(d => (
              <button key={d.key} onClick={() => { setDataset(d.key); reset(); }} style={{
                padding: '4px 12px', borderRadius: 5, border: '1px solid #ccc', fontSize: 12,
                background: dataset === d.key ? '#0070f3' : '#fff',
                color: dataset === d.key ? '#fff' : '#333',
                cursor: 'pointer', fontWeight: dataset === d.key ? 600 : 400,
              }}>{d.label}</button>
            ))}
          </div>
        </Row>

        <Row label="Shape">
          {(['elliptic', 'rectangular'] as const).map(s => (
            <label key={s} style={{ cursor: 'pointer', fontSize: 13, display: 'flex', gap: 4, alignItems: 'center' }}>
              <input type="radio" value={s} checked={shape === s} onChange={() => { setShape(s); reset(); }} />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </label>
          ))}
        </Row>

        <Row label="Height">
          <Slider min={200} max={800} step={20} value={height} onChange={v => { setHeight(v); reset(); }} unit="px" />
        </Row>

        <Row label="Font sizes">
          <span style={{ fontSize: 12, color: '#888' }}>min</span>
          <Slider min={6} max={40} step={1} value={fontMin} onChange={v => { setFontMin(v); reset(); }} unit="px" />
          <span style={{ fontSize: 12, color: '#888' }}>max</span>
          <Slider min={20} max={120} step={2} value={fontMax} onChange={v => { setFontMax(v); reset(); }} unit="px" />
        </Row>

        <Row label="Spacing">
          <Slider min={0} max={20} step={1} value={spacing} onChange={v => { setSpacing(v); reset(); }} unit="px" />
        </Row>

        <Row label="Word delay">
          <Slider min={0} max={500} step={10} value={wordDelay} onChange={v => { setWordDelay(v); reset(); }} unit="ms" />
        </Row>

        <Row label="Fit / overflow">
          <Toggle label="Shrink to fit" checked={shrinkToFit} onChange={v => { setShrinkToFit(v); if (v) setRemoveOverflowing(true); reset(); }} />
          <Toggle label="Remove overflowing" checked={removeOverflowing} disabled={shrinkToFit} onChange={v => { setRemoveOverflowing(v); reset(); }} />
        </Row>

        <Row label="Wrap at %">
          <Toggle label="Enable" checked={useWrap} onChange={v => { setUseWrap(v); if (v) setUseEllipsis(false); reset(); }} />
          {useWrap && <Slider min={5} max={80} step={5} value={wrapPct} onChange={v => { setWrapPct(v); reset(); }} unit="%" />}
        </Row>

        <Row label="Ellipsis at %">
          <Toggle label="Enable" checked={useEllipsis} onChange={v => { setUseEllipsis(v); if (v) setUseWrap(false); reset(); }} />
          {useEllipsis && <Slider min={5} max={80} step={5} value={ellipsisPct} onChange={v => { setEllipsisPct(v); reset(); }} unit="%" />}
        </Row>

        <Row label="Wrap on limit %">
          <Toggle label="Enable (shrinkToFit only)" checked={useWrapOnLimit} disabled={!shrinkToFit} onChange={v => { setUseWrapOnLimit(v); if (v) setUseEllipsisOnLimit(false); reset(); }} />
          {useWrapOnLimit && shrinkToFit && <Slider min={5} max={80} step={5} value={wrapOnLimitPct} onChange={v => { setWrapOnLimitPct(v); reset(); }} unit="%" />}
        </Row>

        <Row label="Ellipsis on limit %">
          <Toggle label="Enable (shrinkToFit only)" checked={useEllipsisOnLimit} disabled={!shrinkToFit} onChange={v => { setUseEllipsisOnLimit(v); if (v) setUseWrapOnLimit(false); reset(); }} />
          {useEllipsisOnLimit && shrinkToFit && <Slider min={5} max={80} step={5} value={ellipsisOnLimitPct} onChange={v => { setEllipsisOnLimitPct(v); reset(); }} unit="%" />}
        </Row>

        <Row label="Render text">
          <Toggle label="Hashtag prefix (#)" checked={hashPrefix} onChange={v => { setHashPrefix(v); reset(); }} />
        </Row>
      </div>

      {/* Cloud */}
      <ReactJQCloud
        key={cloudKey}
        words={words}
        width="100%"
        height={height}
        shape={shape}
        fontSizes={[fontMin, fontMax]}
        spacing={spacing}
        wordDelay={wordDelay}
        shrinkToFit={shrinkToFit}
        removeOverflowing={removeOverflowing}
        wrapAtPercent={useWrap ? wrapPct : undefined}
        ellipsisAtPercent={useEllipsis ? ellipsisPct : undefined}
        wrapAtPercentOnLimit={useWrapOnLimit && shrinkToFit ? wrapOnLimitPct : undefined}
        ellipsisAtPercentOnLimit={useEllipsisOnLimit && shrinkToFit ? ellipsisOnLimitPct : undefined}
        renderText={hashPrefix ? (word) => '#' + word.text : undefined}
        style={{ border: '1px solid #ddd', borderRadius: 8, background: '#fafafa' }}
      />

      {/* Live snippet */}
      <div style={{ marginTop: 16 }}>
        <p style={{ margin: '0 0 6px', fontSize: 12, color: '#888' }}>Generated code</p>
        <CodeBlock code={snippet} />
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

type DemoKey = 'basic' | 'links' | 'long' | 'fifty' | 'delay' | 'word-delay' | 'shrink' | 'fluid' | 'html' | 'tooltip' | 'hashtag' | 'spacing' | 'overflow' | 'playground';

const DEMOS: { key: DemoKey; label: string; words: Word[]; description: string }[] = [
  { key: 'basic',      label: 'Basic',           words: basicWords,   description: '20 words — shape toggle' },
  { key: 'links',      label: 'With Links',       words: linkedWords,  description: '15 clickable words linking to external sites' },
  { key: 'long',       label: 'Long Keywords',    words: longWords,    description: 'Very long words — observe overflow behaviour with removeOverflowing on/off' },
  { key: 'fifty',      label: '50 Keywords',      words: fiftyWords,   description: '50 tech keywords across frameworks, languages, databases, and tools' },
  { key: 'delay',      label: 'Async fetch',      words: [],           description: 'Simulates async data loading: spinner while fetching, then afterCloudRender triggers a fade-in.' },
  { key: 'word-delay', label: 'Word delay',        words: [],           description: 'wordDelay prop: words appear one by one (heaviest first). Drag the slider to control the interval.' },
  { key: 'shrink',     label: 'Shrink to fit',    words: [],           description: 'Compare removeOverflowing vs allowOverflow vs shrinkToFit on 50 words.' },
  { key: 'fluid',      label: 'Fluid width',       words: [],           description: 'Pass width="100%" to fill the container. A ResizeObserver re-lays out the cloud on every resize.' },
  { key: 'html',       label: 'HTML words',        words: [],           description: 'Use the html field to embed emoji or arbitrary inline HTML inside each word.' },
  { key: 'tooltip',    label: 'Tooltip',           words: [],           description: 'renderTooltip prop: hover a word to show a custom tooltip rendered in a portal.' },
  { key: 'hashtag',    label: 'Hashtag prefix',    words: [],           description: 'renderText prop: prepend "#" to every word label without changing layout sizing.' },
  { key: 'spacing',    label: 'Spacing',           words: [],           description: '50 words — drag the slider to add breathing room between words via the spacing prop.' },
  { key: 'overflow',    label: 'Wrap / Ellipsis',   words: [],           description: 'wrapAtPercent and ellipsisAtPercent props: constrain long words to a max percentage of the container width.' },
  { key: 'playground', label: '🛝 Playground',      words: [],           description: 'Live playground — toggle every prop and switch datasets (incl. Thai). Generates code as you go.' },
];

export default function App() {
  const [demo, setDemo] = useState<DemoKey>('basic');
  const [shape, setShape] = useState<'elliptic' | 'rectangular'>('elliptic');
  const [removeOverflowing, setRemoveOverflowing] = useState(true);
  const [shrinkToFit, setShrinkToFit] = useState(false);
  const [clicked, setClicked] = useState<string | null>(null);

  const current = DEMOS.find(d => d.key === demo)!;
  const isSelfContained = demo === 'delay' || demo === 'word-delay' || demo === 'shrink' || demo === 'fluid' || demo === 'html' || demo === 'tooltip' || demo === 'hashtag' || demo === 'spacing' || demo === 'overflow' || demo === 'playground';

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
    <div style={{ fontFamily: 'sans-serif', padding: 24, maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 4px' }}>
        <h1 style={{ margin: 0 }}>React JQCloud</h1>
        <a
          href="https://github.com/Basone01/react-jq-cloud"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555', textDecoration: 'none', border: '1px solid #d0d7de', borderRadius: 6, padding: '4px 10px', background: '#f6f8fa' }}
        >
          <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          GitHub
        </a>
      </div>
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
      ) : demo === 'html' ? (
        <HtmlDemo key="html" />
      ) : demo === 'tooltip' ? (
        <TooltipDemo key="tooltip" />
      ) : demo === 'hashtag' ? (
        <HashtagDemo key="hashtag" />
      ) : demo === 'spacing' ? (
        <SpacingDemo key="spacing" />
      ) : demo === 'overflow' ? (
        <OverflowDemo key="overflow" />
      ) : demo === 'playground' ? (
        <PlaygroundDemo key="playground" />
      ) : (
        <>
          <ReactJQCloud
            key={`${demo}-${shape}-${removeOverflowing}-${shrinkToFit}`}
            words={current.words}
            width="100%"
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
