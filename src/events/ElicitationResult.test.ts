import { describe, expect, it } from 'vitest';
import { mockElicitationResult, testHook } from '../testing.js';
import { ElicitationResult } from './ElicitationResult.js';

describe('ElicitationResult', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockElicitationResult(), () => {
            const input = ElicitationResult.parse();
            expect(input.action).toBe('accept');
            ElicitationResult.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('overrides the user\'s answer', () => {
        const { payload } = testHook(mockElicitationResult({ content: { token: 'secret' } }), () => {
            ElicitationResult.parse();
            ElicitationResult.emitOutput({ action: 'accept', content: { token: '[redacted]' } });
        });
        expect(payload).toEqual({
            hookSpecificOutput: { hookEventName: 'ElicitationResult', action: 'accept', content: { token: '[redacted]' } },
        });
    });
});
