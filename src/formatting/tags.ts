/**
 * Tag parser + ANSI renderer.
 *
 * Tiny XML-like markup so callers can style strings declaratively:
 *
 *   <color:"red">error</color>
 *   <bg:"yellow">!</bg>
 *   <bold><color:"red">hi</color></bold>
 *
 * For icons, use the `ICONS` constants directly in template strings:
 *
 *   `${ICONS.check} done`
 *
 * Rules:
 *   - Unknown tags pass through literally (users see their typos).
 *   - Colors off → tags are stripped, contents survive.
 *   - A trailing `\x1b[0m` is appended when any ANSI was emitted, so escape
 *     state never leaks past the rendered string.
 *
 * Known limitation: same-kind nesting (`<color:"red">..<color:"blue">..</color>..</color>`)
 * doesn't restore the outer color after the inner close — `</color>` always
 * emits the default-foreground reset. Cross-kind nesting (`<bold><color>`) is
 * fine. For the common case (colorize a span, optionally bold it) this is
 * more than enough.
 */

import stringWidth from 'string-width';
import { currentTheme, type Theme } from './theme.js';
import type { ColorName, ModifierName } from './vocab.js';

const FG: Record<ColorName, number> = {
    black: 30, red: 31, green: 32, yellow: 33, blue: 34,
    magenta: 35, cyan: 36, white: 37, gray: 90, grey: 90,
};
const BG: Record<ColorName, number> = Object.fromEntries(
    Object.entries(FG).map(([k, v]) => [k, v + 10]),
) as Record<ColorName, number>;
const MOD: Record<ModifierName, number> = { bold: 1, dim: 2, italic: 3, underline: 4 };
const MOD_CLOSE: Record<ModifierName, number> = { bold: 22, dim: 22, italic: 23, underline: 24 };

const ESC = '\x1b[';
const RESET = `${ESC}0m`;

const TAG_RE = /<(\/?)([a-z][a-z0-9_-]*)(?::"([^"]*)")?(\s*\/)?>/gi;

export function renderTags(input: string, theme: Theme = currentTheme()): string {
    if (!input.includes('<')) return input;
    if (!theme.colors) return stripTags(input);

    let emittedAnsi = false;
    const rendered = input.replace(TAG_RE, (full, slash: string, tagRaw: string, attr: string | undefined) => {
        const tag = tagRaw.toLowerCase();
        const code = slash ? closeCode(tag) : openCode(tag, attr);
        if (code === null) return full;
        emittedAnsi = true;
        return code;
    });
    return emittedAnsi ? rendered + RESET : rendered;
}

function openCode(tag: string, attr: string | undefined): string | null {
    if (tag === 'color' && attr) {
        const code = (FG as Record<string, number>)[attr.toLowerCase()];
        if (code !== undefined) return `${ESC}${code}m`;
    }
    if (tag === 'bg' && attr) {
        const code = (BG as Record<string, number>)[attr.toLowerCase()];
        if (code !== undefined) return `${ESC}${code}m`;
    }
    const mod = (MOD as Record<string, number>)[tag];
    if (mod !== undefined) return `${ESC}${mod}m`;
    return null;
}

function closeCode(tag: string): string | null {
    if (tag === 'color') return `${ESC}39m`;
    if (tag === 'bg') return `${ESC}49m`;
    const mod = (MOD_CLOSE as Record<string, number>)[tag];
    if (mod !== undefined) return `${ESC}${mod}m`;
    return null;
}

export function stripTags(input: string): string {
    if (!input.includes('<')) return input;
    return input.replace(TAG_RE, '');
}

/**
 * Cell width of a rendered string. Delegates to `string-width` for CJK /
 * emoji / ZWJ correctness; strips our own tag markup first.
 */
export function visualWidth(input: string): number {
    return stringWidth(stripTags(input));
}
