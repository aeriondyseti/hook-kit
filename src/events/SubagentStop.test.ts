import { describe, expect, it } from 'vitest';
import { testHook } from '../testing.js';
import { SubagentStop, type SubagentStopInput } from './SubagentStop.js';

const baseInput: SubagentStopInput = {
    hook_event_name: 'SubagentStop',
    session_id: 's',
    transcript_path: '/tmp/t.jsonl',
    cwd: '/tmp',
    stop_hook_active: false,
};

describe('SubagentStop', () => {
    it('parses stop_hook_active', () => {
        const { payload } = testHook(baseInput, () => {
            const input = SubagentStop.parse();
            expect(input.stop_hook_active).toBe(false);
            SubagentStop.emitOutput({});
        });
        expect(payload).toEqual({});
    });

    it('maps deny + reason to top-level decision/reason', () => {
        const { payload } = testHook(baseInput, () => {
            SubagentStop.parse();
            SubagentStop.emitOutput({ deny: true, reason: 'more work' });
        });
        expect(payload).toEqual({ decision: 'block', reason: 'more work' });
    });
});
