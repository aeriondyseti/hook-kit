import { describe, expect, it } from 'vitest';
import { testHook } from '../testing.js';
import { SessionEnd, type SessionEndInput } from './SessionEnd.js';

const baseInput: SessionEndInput = {
    hook_event_name: 'SessionEnd',
    session_id: 's',
    transcript_path: '/tmp/t.jsonl',
    cwd: '/tmp',
    reason: 'logout',
};

describe('SessionEnd', () => {
    it('parses reason', () => {
        const { payload } = testHook(baseInput, () => {
            const input = SessionEnd.parse();
            expect(input.reason).toBe('logout');
            SessionEnd.emitOutput({});
        });
        expect(payload).toEqual({});
    });

    it('maps toUser via the common mixin', () => {
        const { payload } = testHook(baseInput, () => {
            SessionEnd.parse();
            SessionEnd.emitOutput({ toUser: 'bye' });
        });
        expect(payload).toEqual({ systemMessage: 'bye' });
    });
});
