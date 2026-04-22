import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { _resetTheme, setTheme } from './theme.js';
import { renderTags, stripTags, visualWidth } from './tags.js';

const RESET = '\x1b[0m';

describe('renderTags', () => {
    beforeEach(() => setTheme({ colors: true }));
    afterEach(() => _resetTheme());

    it('passes plain text through unchanged', () => {
        expect(renderTags('hello')).toBe('hello');
    });

    it('renders a foreground color', () => {
        expect(renderTags('<color:"red">x</color>')).toBe(`\x1b[31mx\x1b[39m${RESET}`);
    });

    it('renders a background color', () => {
        expect(renderTags('<bg:"yellow">x</bg>')).toBe(`\x1b[43mx\x1b[49m${RESET}`);
    });

    it('renders a modifier (bold)', () => {
        expect(renderTags('<bold>x</bold>')).toBe(`\x1b[1mx\x1b[22m${RESET}`);
    });

    it('handles cross-kind nesting (bold + color)', () => {
        // Open bold, open red, text, close red (fg → default), close bold.
        expect(renderTags('<bold><color:"red">x</color></bold>')).toBe(
            `\x1b[1m\x1b[31mx\x1b[39m\x1b[22m${RESET}`,
        );
    });

    it('appends a single RESET at the end (belt-and-suspenders)', () => {
        const out = renderTags('<color:"red">x</color>');
        expect(out.endsWith(RESET)).toBe(true);
    });

    it('does not append RESET when no ANSI was emitted', () => {
        expect(renderTags('<unknown>x</unknown>')).toBe('<unknown>x</unknown>');
    });

    it('passes unknown tags through literally', () => {
        expect(renderTags('<froblify>x</froblify>')).toBe('<froblify>x</froblify>');
    });

    it('strips tags when colors are disabled', () => {
        setTheme({ colors: false });
        expect(renderTags('<color:"red"><bold>x</bold></color>')).toBe('x');
    });
});

describe('stripTags', () => {
    it('removes all tag markup', () => {
        expect(stripTags('<color:"red"><bold>hi</bold></color>')).toBe('hi');
    });

    it('is a no-op when there are no tags', () => {
        expect(stripTags('plain')).toBe('plain');
    });
});

describe('visualWidth', () => {
    it('returns cell count for plain ASCII', () => {
        expect(visualWidth('hello')).toBe(5);
    });

    it('ignores tag markup', () => {
        expect(visualWidth('<color:"red">hi</color>')).toBe(2);
    });

    it('counts wide characters (emoji) as 2 cells', () => {
        expect(visualWidth('🚀')).toBe(2);
    });

    it('counts wide CJK as 2 cells each', () => {
        expect(visualWidth('日本')).toBe(4);
    });
});
