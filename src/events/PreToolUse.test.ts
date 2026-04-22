import { describe, expect, it } from 'vitest';
import { OutputBuilder } from '../output/OutputBuilder.js';
import { testHook } from '../testing.js';
import { PreToolUse, type PreToolUseInput } from './PreToolUse.js';

const baseInput: PreToolUseInput = {
    hook_event_name: 'PreToolUse',
    session_id: 's',
    transcript_path: '/tmp/t.jsonl',
    cwd: '/tmp',
    tool_name: 'Bash',
    tool_input: { command: 'ls' },
    tool_use_id: 'u',
};

describe('PreToolUse.parse', () => {
    it('returns the parsed input with snake_case fields', () => {
        const { payload } = testHook(baseInput, () => {
            const input = PreToolUse.parse();
            expect(input.tool_name).toBe('Bash');
            expect(input.tool_input).toEqual({ command: 'ls' });
            expect(input.hook_event_name).toBe('PreToolUse');
            PreToolUse.emitOutput({});
        });
        expect(payload).toEqual({});
    });
});

describe('PreToolUse.emitOutput', () => {
    it('emits an empty object when given no options', () => {
        const { payload, exitCode } = testHook(baseInput, () => {
            PreToolUse.parse();
            PreToolUse.emitOutput({});
        });
        expect(payload).toEqual({});
        expect(exitCode).toBe(0);
    });

    it('maps toUser to systemMessage', () => {
        const { payload } = testHook(baseInput, () => {
            PreToolUse.parse();
            PreToolUse.emitOutput({ toUser: 'hello user' });
        });
        expect(payload).toEqual({ systemMessage: 'hello user' });
    });

    it('renders an OutputBuilder passed as toUser', () => {
        const { payload } = testHook<{ systemMessage: string }>(baseInput, () => {
            PreToolUse.parse();
            const ob = new OutputBuilder().append('built ').append('content');
            PreToolUse.emitOutput({ toUser: ob });
        });
        expect(payload.systemMessage).toContain('built content');
    });

    it('maps toClaude to hookSpecificOutput.additionalContext', () => {
        const { payload } = testHook(baseInput, () => {
            PreToolUse.parse();
            PreToolUse.emitOutput({ toClaude: 'note for claude' });
        });
        expect(payload).toEqual({
            hookSpecificOutput: {
                hookEventName: 'PreToolUse',
                additionalContext: 'note for claude',
            },
        });
    });

    it('maps decision + reason to hookSpecificOutput', () => {
        const { payload } = testHook(baseInput, () => {
            PreToolUse.parse();
            PreToolUse.emitOutput({ decision: 'deny', reason: 'unsafe' });
        });
        expect(payload).toEqual({
            hookSpecificOutput: {
                hookEventName: 'PreToolUse',
                permissionDecision: 'deny',
                permissionDecisionReason: 'unsafe',
            },
        });
    });

    it('omits reason when not provided', () => {
        const { payload } = testHook(baseInput, () => {
            PreToolUse.parse();
            PreToolUse.emitOutput({ decision: 'allow' });
        });
        expect(payload).toEqual({
            hookSpecificOutput: {
                hookEventName: 'PreToolUse',
                permissionDecision: 'allow',
            },
        });
    });

    it('maps updatedInput', () => {
        const { payload } = testHook(baseInput, () => {
            PreToolUse.parse();
            PreToolUse.emitOutput({ updatedInput: { command: 'ls -la' } });
        });
        expect(payload).toEqual({
            hookSpecificOutput: {
                hookEventName: 'PreToolUse',
                updatedInput: { command: 'ls -la' },
            },
        });
    });

    it('maps top-level continue / stopReason / suppressOutput', () => {
        const { payload } = testHook(baseInput, () => {
            PreToolUse.parse();
            PreToolUse.emitOutput({ continue: false, stopReason: 'stop', suppressOutput: true });
        });
        expect(payload).toEqual({
            continue: false,
            stopReason: 'stop',
            suppressOutput: true,
        });
    });

    it('combines toUser + decision + toClaude into one payload', () => {
        const { payload } = testHook(baseInput, () => {
            PreToolUse.parse();
            PreToolUse.emitOutput({
                toUser: 'denied',
                toClaude: 'because unsafe',
                decision: 'deny',
                reason: 'unsafe',
            });
        });
        expect(payload).toEqual({
            systemMessage: 'denied',
            hookSpecificOutput: {
                hookEventName: 'PreToolUse',
                permissionDecision: 'deny',
                permissionDecisionReason: 'unsafe',
                additionalContext: 'because unsafe',
            },
        });
    });
});
