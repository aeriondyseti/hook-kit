import { describe, expect, it } from 'vitest';
import { mockMessageDisplay, testHook } from '../testing.js';
import { MessageDisplay } from './MessageDisplay.js';

describe('MessageDisplay', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockMessageDisplay(), () => {
            const input = MessageDisplay.parse();
            expect(input.final).toBe(true);
            expect(input.delta).toBe('test line\n');
            MessageDisplay.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps displayContent', () => {
        const { payload } = testHook(mockMessageDisplay({ delta: 'key=sk-123\n' }), () => {
            MessageDisplay.parse();
            MessageDisplay.emitOutput({ displayContent: 'key=[redacted]\n' });
        });
        expect(payload).toEqual({
            hookSpecificOutput: { hookEventName: 'MessageDisplay', displayContent: 'key=[redacted]\n' },
        });
    });
});
