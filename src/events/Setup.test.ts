import { describe, expect, it } from 'vitest';
import { mockSetup, testHook } from '../testing.js';
import { Setup } from './Setup.js';

describe('Setup', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockSetup(), () => {
            const input = Setup.parse();
            expect(input.trigger).toBe('init');
            Setup.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps toClaude to hookSpecificOutput.additionalContext', () => {
        const { payload } = testHook(mockSetup(), () => {
            Setup.parse();
            Setup.emitOutput({ toClaude: 'note' });
        });
        expect(payload).toEqual({
            hookSpecificOutput: { hookEventName: 'Setup', additionalContext: 'note' },
        });
    });
});
