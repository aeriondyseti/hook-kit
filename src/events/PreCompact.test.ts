import { describe, expect, it } from 'vitest';
import { testHook } from '../testing.js';
import { PreCompact, type PreCompactInput } from './PreCompact.js';

const baseInput: PreCompactInput = {
    hook_event_name: 'PreCompact',
    session_id: 's',
    transcript_path: '/tmp/t.jsonl',
    cwd: '/tmp',
    trigger: 'auto',
};

describe('PreCompact', () => {
    it('parses trigger', () => {
        const { payload } = testHook(baseInput, () => {
            const input = PreCompact.parse();
            expect(input.trigger).toBe('auto');
            PreCompact.emitOutput({});
        });
        expect(payload).toEqual({});
    });

    it('maps deny + reason to top-level decision/reason', () => {
        const { payload } = testHook(baseInput, () => {
            PreCompact.parse();
            PreCompact.emitOutput({ deny: true, reason: 'need context' });
        });
        expect(payload).toEqual({ decision: 'block', reason: 'need context' });
    });
});
