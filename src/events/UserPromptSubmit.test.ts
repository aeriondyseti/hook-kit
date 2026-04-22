import { describe, expect, it } from 'vitest';
import { testHook } from '../testing.js';
import { UserPromptSubmit, type UserPromptSubmitInput } from './UserPromptSubmit.js';

const baseInput: UserPromptSubmitInput = {
    hook_event_name: 'UserPromptSubmit',
    session_id: 's',
    transcript_path: '/tmp/t.jsonl',
    cwd: '/tmp',
    prompt: 'what is 1+1?',
};

describe('UserPromptSubmit', () => {
    it('parses the prompt', () => {
        const { payload } = testHook(baseInput, () => {
            const input = UserPromptSubmit.parse();
            expect(input.prompt).toBe('what is 1+1?');
            UserPromptSubmit.emitOutput({});
        });
        expect(payload).toEqual({});
    });

    it('maps deny + reason to top-level decision/reason', () => {
        const { payload } = testHook(baseInput, () => {
            UserPromptSubmit.parse();
            UserPromptSubmit.emitOutput({ deny: true, reason: 'off-topic' });
        });
        expect(payload).toEqual({ decision: 'block', reason: 'off-topic' });
    });

    it('maps toClaude to hookSpecificOutput.additionalContext', () => {
        const { payload } = testHook(baseInput, () => {
            UserPromptSubmit.parse();
            UserPromptSubmit.emitOutput({ toClaude: 'extra context' });
        });
        expect(payload).toEqual({
            hookSpecificOutput: {
                hookEventName: 'UserPromptSubmit',
                additionalContext: 'extra context',
            },
        });
    });

    it('maps toUser via the common mixin', () => {
        const { payload } = testHook(baseInput, () => {
            UserPromptSubmit.parse();
            UserPromptSubmit.emitOutput({ toUser: 'hello' });
        });
        expect(payload).toEqual({ systemMessage: 'hello' });
    });
});
