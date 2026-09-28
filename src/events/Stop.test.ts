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

    it('parses last_assistant_message and background_tasks', () => {
        const input: StopInput = {
            ...baseInput,
            last_assistant_message: 'All done.',
            background_tasks: [{ id: 't1', type: 'shell', status: 'running', description: 'npm test', command: 'npm test' }],
        };
        testHook(input, () => {
            const parsed = Stop.parse();
            expect(parsed.last_assistant_message).toBe('All done.');
            expect(parsed.background_tasks?.[0]?.command).toBe('npm test');
            Stop.emitOutput({});
        });
    });

    it('maps toClaude to hookSpecificOutput.additionalContext alongside deny', () => {
        const { payload } = testHook(baseInput, () => {
            Stop.parse();
            Stop.emitOutput({ deny: true, reason: 'tests failing', toClaude: 'see test output' });
        });
        expect(payload).toEqual({
            decision: 'block',
            reason: 'tests failing',
            hookSpecificOutput: { hookEventName: 'Stop', additionalContext: 'see test output' },
        });
    });
});
