import { describe, expect, it } from 'vitest';
import { testHook } from '../testing.js';
import { SessionStart, type SessionStartInput } from './SessionStart.js';

const baseInput: SessionStartInput = {
    hook_event_name: 'SessionStart',
    session_id: 's',
    transcript_path: '/tmp/t.jsonl',
    cwd: '/tmp',
    source: 'startup',
    model: 'claude-opus-4-7',
};

describe('SessionStart', () => {
    it('parses source and model', () => {
        const { payload } = testHook(baseInput, () => {
            const input = SessionStart.parse();
            expect(input.source).toBe('startup');
            expect(input.model).toBe('claude-opus-4-7');
            SessionStart.emitOutput({});
        });
        expect(payload).toEqual({});
    });

    it('maps toClaude to hookSpecificOutput.additionalContext', () => {
        const { payload } = testHook(baseInput, () => {
            SessionStart.parse();
            SessionStart.emitOutput({ toClaude: 'seed context' });
        });
        expect(payload).toEqual({
            hookSpecificOutput: {
                hookEventName: 'SessionStart',
                additionalContext: 'seed context',
            },
        });
    });

    it('maps toUser via the common mixin', () => {
        const { payload } = testHook(baseInput, () => {
            SessionStart.parse();
            SessionStart.emitOutput({ toUser: 'welcome' });
        });
        expect(payload).toEqual({ systemMessage: 'welcome' });
    });
});
