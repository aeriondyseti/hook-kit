import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { _resetTheme, setTheme } from '../formatting/theme.js';
import { OutputBuilder } from './OutputBuilder.js';

describe('OutputBuilder', () => {
    beforeEach(() => setTheme({ colors: false })); // keep snapshots ANSI-free
    afterEach(() => _resetTheme());

    it('renders empty for a fresh builder', () => {
        const ob = new OutputBuilder();
        expect(ob.render()).toBe('');
        expect(ob.isEmpty).toBe(true);
    });

    it('appends text without a trailing newline', () => {
        const ob = new OutputBuilder().append('hi');
        expect(ob.render()).toBe('hi');
        expect(ob.isEmpty).toBe(false);
    });

    it('appendLine always adds a trailing newline, even for empty arg', () => {
        const ob = new OutputBuilder().appendLine('a').appendLine();
        expect(ob.render()).toBe('a\n\n');
    });

    it('chains append + appendLine', () => {
        const ob = new OutputBuilder().append('x').appendLine('y').append('z');
        expect(ob.render()).toBe('xy\nz');
    });

    it('resolves tags against the current theme at render time', () => {
        const ob = new OutputBuilder().append('<color:"red">x</color>');

        // colors off → tags stripped
        expect(ob.render()).toBe('x');

        // colors on → ANSI emitted from the SAME builder
        setTheme({ colors: true });
        expect(ob.render()).toBe('\x1b[31mx\x1b[39m\x1b[0m');
    });

    it('toString() is an alias for render()', () => {
        const ob = new OutputBuilder().append('hi');
        expect(String(ob)).toBe('hi');
    });

    describe('appendDivider', () => {
        it('defaults to a dash repeated to the explicit width', () => {
            const ob = new OutputBuilder().appendDivider('-', { width: 10 });
            expect(ob.render()).toBe('-'.repeat(10) + '\n');
        });

        it('accepts a custom character', () => {
            const ob = new OutputBuilder().appendDivider('=', { width: 5 });
            expect(ob.render()).toBe('=====\n');
        });

        it('fits as many whole copies of a multi-char string as possible', () => {
            const ob = new OutputBuilder().appendDivider('-=', { width: 7 });
            // 7 cells ÷ 2 per copy = 3 copies → 6 cells, no partial 7th.
            expect(ob.render()).toBe('-=-=-=\n');
        });

        it('counts emoji cells correctly (2 cells per emoji)', () => {
            const ob = new OutputBuilder().appendDivider('🚀', { width: 5 });
            // 5 ÷ 2 = 2 copies → 4 cells.
            expect(ob.render()).toBe('🚀🚀\n');
        });

        it('wraps the divider in a color tag when color is given', () => {
            setTheme({ colors: true });
            const ob = new OutputBuilder().appendDivider('-', { width: 3, color: 'red' });
            expect(ob.render()).toBe('\x1b[31m---\x1b[39m\n\x1b[0m');
        });

        it('honors $COLUMNS when no width is given', () => {
            const prev = process.env.COLUMNS;
            process.env.COLUMNS = '42';
            try {
                const ob = new OutputBuilder().appendDivider();
                expect(ob.render()).toBe('-'.repeat(42) + '\n');
            } finally {
                if (prev === undefined) delete process.env.COLUMNS;
                else process.env.COLUMNS = prev;
            }
        });

        it('rejects nonsense $COLUMNS values (≤ 20) and falls through', () => {
            const prev = process.env.COLUMNS;
            process.env.COLUMNS = '3';
            try {
                const ob = new OutputBuilder().appendDivider();
                const line = ob.render().replace(/\n$/, '');
                expect(line.length).toBeGreaterThan(20);
            } finally {
                if (prev === undefined) delete process.env.COLUMNS;
                else process.env.COLUMNS = prev;
            }
        });
    });

    describe('list', () => {
        it('renders each item as a bulleted line with default bullet', () => {
            const ob = new OutputBuilder().appendList(['a', 'b']);
            expect(ob.render()).toBe('• a\n• b\n');
        });

        it('accepts a custom bullet', () => {
            const ob = new OutputBuilder().appendList(['a'], { bullet: '-' });
            expect(ob.render()).toBe('- a\n');
        });

        it('indents by the given number of spaces', () => {
            const ob = new OutputBuilder().appendList(['a'], { indent: 2 });
            expect(ob.render()).toBe('  • a\n');
        });

        it('resolves tag markup inside items at render time', () => {
            const ob = new OutputBuilder().appendList(['<color:"red">oops</color>']);
            // colors off per beforeEach → tags stripped, bullet survives
            expect(ob.render()).toBe('• oops\n');
        });

        it('is a no-op for an empty list', () => {
            const ob = new OutputBuilder().appendList([]);
            expect(ob.render()).toBe('');
            expect(ob.isEmpty).toBe(true);
        });
    });

    describe('box', () => {
        it('draws a simple single-line box with default padding', () => {
            const ob = new OutputBuilder().appendBox('hi');
            expect(ob.render()).toBe(
                '┌────┐\n' +
                '│ hi │\n' +
                '└────┘\n',
            );
        });

        it('sizes to the widest content line', () => {
            const ob = new OutputBuilder().appendBox('short\nlonger line');
            expect(ob.render()).toBe(
                '┌─────────────┐\n' +
                '│ short       │\n' +
                '│ longer line │\n' +
                '└─────────────┘\n',
            );
        });

        it('renders a title in the top border', () => {
            const ob = new OutputBuilder().appendBox('body', { title: 'Hi' });
            expect(ob.render()).toBe(
                '┌─ Hi ─┐\n' +
                '│ body │\n' +
                '└──────┘\n',
            );
        });

        it('widens to fit a long title', () => {
            const ob = new OutputBuilder().appendBox('x', { title: 'Long Title' });
            expect(ob.render()).toBe(
                '┌─ Long Title ┐\n' +
                '│ x           │\n' +
                '└─────────────┘\n',
            );
        });

        it('respects custom padding', () => {
            const ob = new OutputBuilder().appendBox('hi', { padding: 0 });
            expect(ob.render()).toBe(
                '┌──┐\n' +
                '│hi│\n' +
                '└──┘\n',
            );
        });

        it('counts emoji as two cells when padding', () => {
            const ob = new OutputBuilder().appendBox('🚀 go');
            expect(ob.render()).toBe(
                '┌───────┐\n' +
                '│ 🚀 go │\n' +
                '└───────┘\n',
            );
        });

        it('ignores tag markup when computing width', () => {
            const ob = new OutputBuilder().appendBox('<color:"red">hi</color>');
            // colors off per beforeEach → tags strip to 'hi', padding same as plain 'hi'.
            expect(ob.render()).toBe(
                '┌────┐\n' +
                '│ hi │\n' +
                '└────┘\n',
            );
        });

        it('drops one trailing newline so there is no empty bottom row', () => {
            const ob = new OutputBuilder().appendBox('hi\n');
            expect(ob.render()).toBe(
                '┌────┐\n' +
                '│ hi │\n' +
                '└────┘\n',
            );
        });

        it('paints borders with the requested color when colors are on', () => {
            setTheme({ colors: true });
            const ob = new OutputBuilder().appendBox('x', { color: 'red' });
            // Each border line is wrapped with red fg/default-fg; RESET at end of render.
            const red = '\x1b[31m';
            const defFg = '\x1b[39m';
            expect(ob.render()).toBe(
                `${red}┌───┐${defFg}\n` +
                `${red}│${defFg} x ${red}│${defFg}\n` +
                `${red}└───┘${defFg}` +
                '\n' +
                '\x1b[0m',
            );
        });
    });

    describe('table', () => {
        it('renders rows with auto-sized columns', () => {
            const ob = new OutputBuilder().appendTable([
                ['a', 'bb'],
                ['cc', 'ddd'],
            ]);
            expect(ob.render()).toBe(
                '┌────┬─────┐\n' +
                '│ a  │ bb  │\n' +
                '│ cc │ ddd │\n' +
                '└────┴─────┘\n',
            );
        });

        it('renders headers with a separator row', () => {
            const ob = new OutputBuilder().appendTable(
                [
                    ['a', 'bb'],
                    ['cc', 'ddd'],
                ],
                { headers: ['H1', 'H2'] },
            );
            expect(ob.render()).toBe(
                '┌────┬─────┐\n' +
                '│ H1 │ H2  │\n' +
                '├────┼─────┤\n' +
                '│ a  │ bb  │\n' +
                '│ cc │ ddd │\n' +
                '└────┴─────┘\n',
            );
        });

        it('widens columns to fit headers', () => {
            const ob = new OutputBuilder().appendTable([['a', 'b']], { headers: ['LONG', 'X'] });
            expect(ob.render()).toBe(
                '┌──────┬───┐\n' +
                '│ LONG │ X │\n' +
                '├──────┼───┤\n' +
                '│ a    │ b │\n' +
                '└──────┴───┘\n',
            );
        });

        it('handles ragged rows by padding missing cells as empty', () => {
            const ob = new OutputBuilder().appendTable([['a', 'b'], ['c']]);
            expect(ob.render()).toBe(
                '┌───┬───┐\n' +
                '│ a │ b │\n' +
                '│ c │   │\n' +
                '└───┴───┘\n',
            );
        });

        it('counts emoji widths correctly', () => {
            const ob = new OutputBuilder().appendTable([['🚀', 'go']]);
            expect(ob.render()).toBe(
                '┌────┬────┐\n' +
                '│ 🚀 │ go │\n' +
                '└────┴────┘\n',
            );
        });

        it('ignores tag markup when sizing columns', () => {
            const ob = new OutputBuilder().appendTable([['<color:"red">hi</color>', 'x']]);
            // colors off → tags strip to 'hi', column sized to 2.
            expect(ob.render()).toBe(
                '┌────┬───┐\n' +
                '│ hi │ x │\n' +
                '└────┴───┘\n',
            );
        });

        it('is a no-op with no rows and no headers', () => {
            const ob = new OutputBuilder().appendTable([]);
            expect(ob.render()).toBe('');
            expect(ob.isEmpty).toBe(true);
        });

        it('renders a headers-only table when rows is empty', () => {
            const ob = new OutputBuilder().appendTable([], { headers: ['A', 'B'] });
            expect(ob.render()).toBe(
                '┌───┬───┐\n' +
                '│ A │ B │\n' +
                '├───┼───┤\n' +
                '└───┴───┘\n',
            );
        });
    });
});
