import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { _resetTheme, currentTheme, setTheme } from './theme.js';

describe('theme', () => {
    // Theme is module-scoped state + env-driven. Capture env and reset after each test.
    const savedEnv = { NO_COLOR: process.env.NO_COLOR, FORCE_COLOR: process.env.FORCE_COLOR };

    beforeEach(() => {
        delete process.env.NO_COLOR;
        delete process.env.FORCE_COLOR;
        _resetTheme();
    });
    afterEach(() => {
        process.env.NO_COLOR = savedEnv.NO_COLOR;
        process.env.FORCE_COLOR = savedEnv.FORCE_COLOR;
        _resetTheme();
    });

    it('defaults colors ON (hook scripts are piped to Claude Code, not a TTY)', () => {
        expect(currentTheme().colors).toBe(true);
    });

    it('NO_COLOR disables colors', () => {
        process.env.NO_COLOR = '1';
        expect(currentTheme().colors).toBe(false);
    });

    it('FORCE_COLOR=0 disables colors', () => {
        process.env.FORCE_COLOR = '0';
        expect(currentTheme().colors).toBe(false);
    });

    it('setTheme override wins over env detection', () => {
        process.env.NO_COLOR = '1';
        setTheme({ colors: true });
        expect(currentTheme().colors).toBe(true);
    });

    it('_resetTheme clears the override', () => {
        setTheme({ colors: false });
        _resetTheme();
        expect(currentTheme().colors).toBe(true);
    });
});
