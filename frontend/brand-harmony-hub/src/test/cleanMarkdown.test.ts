import { describe, it, expect } from 'vitest';
import { cleanMarkdown } from '@/lib/cleanMarkdown';

describe('cleanMarkdown', () => {
  it('removes headings', () => {
    expect(cleanMarkdown('## Heading\nText')).toBe('Heading\nText');
    expect(cleanMarkdown('### Sub Heading')).toBe('Sub Heading');
  });

  it('removes bold and italic markers', () => {
    expect(cleanMarkdown('This is **bold** and *italic*')).toBe('This is bold and italic');
    expect(cleanMarkdown('__underline bold__ and _underline italic_')).toBe('underline bold and underline italic');
  });

  it('removes inline code', () => {
    expect(cleanMarkdown('Use `console.log` here')).toBe('Use console.log here');
  });

  it('removes links but keeps text', () => {
    expect(cleanMarkdown('[Click here](https://example.com)')).toBe('Click here');
  });

  it('converts bullet points', () => {
    expect(cleanMarkdown('- Item 1\n- Item 2')).toBe('• Item 1\n• Item 2');
  });

  it('removes horizontal rules', () => {
    expect(cleanMarkdown('Text\n---\nMore text')).toBe('Text\n\nMore text');
  });

  it('handles empty input', () => {
    expect(cleanMarkdown('')).toBe('');
    expect(cleanMarkdown(null as any)).toBe('');
  });

  it('cleans a realistic AI response', () => {
    const input = `## Welcome to Our Platform

**Introducing** our *new* AI-powered tool.

- Feature one
- Feature two
- Feature three

Visit [our site](https://example.com) for more.

---

### Get Started Today`;

    const output = cleanMarkdown(input);
    expect(output).not.toContain('##');
    expect(output).not.toContain('**');
    expect(output).not.toContain('*');
    expect(output).not.toContain('[');
    expect(output).not.toContain('---');
    expect(output).toContain('Introducing');
    expect(output).toContain('• Feature one');
  });
});
