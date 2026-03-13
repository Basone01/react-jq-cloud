import type React from 'react';

export interface Word {
  text: string;
  weight: number;
  link?: string | { href: string; target?: string; [key: string]: string | undefined };
  color?: string;
  className?: string;
  handlers?: Record<string, (event: MouseEvent) => void>;
}

export interface ReactJQCloudProps {
  words: Word[];
  width?: number | string;
  height: number;
  center?: { x: number; y: number };
  shape?: 'elliptic' | 'rectangular';
  removeOverflowing?: boolean;
  encodeUri?: boolean;
  fontSizes?: [number, number];
  fontFamily?: string;
  colors?: string[];
  className?: string;
  style?: React.CSSProperties;
  shrinkToFit?: boolean;        // reduce font scale until all words fit within bounds
  wordDelay?: number;           // ms between each word appearing (0 = all at once)
  onWordClick?: (word: Word, event: React.MouseEvent) => void;
  onWordReveal?: (revealed: number, total: number) => void;
  afterCloudRender?: () => void;
}
