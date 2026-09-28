import { describe, expect, it } from 'vitest';
import { mockPostToolUseFailure, testHook } from '../testing.js';
import { PostToolUseFailure } from './PostToolUseFailure.js';

describe('PostToolUseFailure', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockPostToolUseFailure(), () => {
            const input = PostToolUseFailure.parse();
            expect(input.error).toBe('test error');
            PostToolUseFailure.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps toClaude to hookSpecificOutput.additionalContext', () => {
        const { payload } = testHook(mockPostToolUseFailure(), () => {
            PostToolUseFailure.parse();
            PostToolUseFailure.emitOutput({ toClaude: 'note' });
        });
        expect(payload).toEqual({
            hookSpecificOutput: { hookEventName: 'PostToolUseFailure', additionalContext: 'note' },
        });
    });
});
