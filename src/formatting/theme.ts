/**
 * Theme controls how tagged markup renders: colors on/off.
 *
 * Default is ON — hook scripts don't write to a TTY (stdout is a pipe to
 * Claude Code), but Claude Code renders the emitted ANSI. The usual TTY
 * auto-detect would disable colors here, which is exactly backwards.
 *
 * Honored env vars:
 *   - NO_COLOR (any non-empty value) → colors off
 *   - FORCE_COLOR=0                  → colors off
 *
 * `setTheme` lets hook authors override explicitly.
 */

export interface Theme {
    colors: boolean;
}

let _override: Partial<Theme> | undefined;

export function setTheme(override: Partial<Theme>): void {
    _override = override;
}

export function currentTheme(): Theme {
    return {
        colors: _override?.colors ?? detectColors(),
    };
}

function detectColors(): boolean {
    if (process.env.NO_COLOR) return false;
    if (process.env.FORCE_COLOR === '0') return false;
    return true;
}

export function _resetTheme(): void {
    _override = undefined;
}
