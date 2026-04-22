import { describe, expect, it } from 'vitest';
import { testHook } from '../testing.js';
import { Stop, type StopInput } from './Stop.js';

const baseInput: StopInput = {
    hook_event_name: 'Stop',
    session_id: 's',
    transcript_path: '/tmp/t.jsonl',
    cwd: '/tmp',
    stop_hook_active: false,
};

describe('Stop', () => {
    it('parses stop_hook_active', () => {
        const { payload } = testHook(baseInput, () => {
            const input = Stop.parse();
            expect(input.stop_hook_active).toBe(false);
            Stop.emitOutput({});
        });
        expect(payload).toEqual({});
    });

    it('maps deny + reason to top-level decision/reason', () => {
        const { payload } = testHook(baseInput, () => {
            Stop.parse();
            Stop.emitOutput({ deny: true, reason: 'not done' });
        });
        expect(payload).toEqual({ decision: 'block', reason: 'not done' });
    });

    it('maps toUser via the common mixin', () => {
        const { payload } = testHook(baseInput, () => {
            Stop.parse();
            Stop.emitOutput({ toUser: 'finished' });
        });
        expect(payload).toEqual({ systemMessage: 'finished' });
    });
});
