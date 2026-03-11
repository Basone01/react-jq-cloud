import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactJQCloud } from '../src/ReactJQCloud';
import type { Word } from '../src/types';

const words: Word[] = [
  { text: 'React', weight: 10 },
  { text: 'TypeScript', weight: 8 },
  { text: 'Cloud', weight: 5 },
];

describe('ReactJQCloud', () => {
  it('renders container with correct width and height', () => {
    const { container } = render(
      <ReactJQCloud words={words} width={600} height={400} />
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
      <ReactJQCloud words={words} width={600} height={400} className="my-cloud" />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.classList.contains('react-jq-cloud')).toBe(true);
    expect(div.classList.contains('my-cloud')).toBe(true);
  });

  it('calls onWordClick when a word is clicked', () => {
    const handleClick = vi.fn();
    render(
      <ReactJQCloud words={words} width={600} height={400} onWordClick={handleClick} />
    );
    fireEvent.click(screen.getByText('React'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(words[0], expect.anything());
  });

  it('renders links when word.link is set', () => {
    const linkedWords: Word[] = [
      { text: 'ReactJS', weight: 10, link: 'https://react.dev' },
    ];
    const { container } = render(<ReactJQCloud words={linkedWords} width={600} height={400} />);
    const link = container.querySelector('a[href="https://react.dev"]');
    expect(link).toBeInTheDocument();
    expect(link!.textContent).toBe('ReactJS');
  });

  it('renders links with object link prop', () => {
    const linkedWords: Word[] = [
      { text: 'Docs', weight: 8, link: { href: 'https://example.com', target: '_blank' } },
    ];
    const { container } = render(<ReactJQCloud words={linkedWords} width={600} height={400} />);
    const link = container.querySelector('a[href="https://example.com"]');
    expect(link).toBeInTheDocument();
    expect(link!.getAttribute('target')).toBe('_blank');
  });
});
