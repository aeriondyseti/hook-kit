import { describe, expect, it } from 'vitest';
import { mockPostModelSwitch, testHook } from '../testing.js';
import { PostModelSwitch } from './PostModelSwitch.js';

describe('PostModelSwitch', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockPostModelSwitch(), () => {
            const input = PostModelSwitch.parse();
            expect(input.from_model).toBe('claude-sonnet-5');
            PostModelSwitch.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('accepts the auto and resume sources PreModelSwitch never sees', () => {
        testHook(mockPostModelSwitch({ source: 'auto' }), () => {
            expect(PostModelSwitch.parse().source).toBe('auto');
            PostModelSwitch.emitOutput();
        });
    });

    it('maps toClaude to hookSpecificOutput.additionalContext', () => {
        const { payload } = testHook(mockPostModelSwitch(), () => {
            PostModelSwitch.parse();
            PostModelSwitch.emitOutput({ toClaude: 'note' });
        });
        expect(payload).toEqual({
            hookSpecificOutput: { hookEventName: 'PostModelSwitch', additionalContext: 'note' },
        });
    });
});
