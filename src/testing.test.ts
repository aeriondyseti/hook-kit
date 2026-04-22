import { describe, expect, it } from 'vitest';
import { PostToolUse } from './events/PostToolUse.js';
import { PreToolUse } from './events/PreToolUse.js';
import { SessionStart } from './events/SessionStart.js';
import {
    mockNotification,
    mockPostToolUse,
    mockPreCompact,
    mockPreToolUse,
    mockSessionEnd,
    mockSessionStart,
    mockStop,
    mockSubagentStop,
    mockUserPromptSubmit,
    testHook,
} from './testing.js';

describe('mock input factories', () => {
    it('produce inputs with the correct hook_event_name', () => {
        expect(mockNotification().hook_event_name).toBe('Notification');
        expect(mockPostToolUse().hook_event_name).toBe('PostToolUse');
        expect(mockPreCompact().hook_event_name).toBe('PreCompact');
        expect(mockPreToolUse().hook_event_name).toBe('PreToolUse');
        expect(mockSessionEnd().hook_event_name).toBe('SessionEnd');
        expect(mockSessionStart().hook_event_name).toBe('SessionStart');
        expect(mockStop().hook_event_name).toBe('Stop');
        expect(mockSubagentStop().hook_event_name).toBe('SubagentStop');
        expect(mockUserPromptSubmit().hook_event_name).toBe('UserPromptSubmit');
    });

    it('fill common fields with sensible defaults', () => {
        const m = mockPreToolUse();
        expect(m.session_id).toBe('test-session');
        expect(m.transcript_path).toBe('/tmp/test-transcript.jsonl');
        expect(m.cwd).toBe('/tmp');
    });

    it('accept partial overrides that take precedence over defaults', () => {
        const m = mockPreToolUse({ tool_name: 'Write', cwd: '/work' });
        expect(m.tool_name).toBe('Write');
        expect(m.cwd).toBe('/work');
        expect(m.tool_input).toEqual({}); // untouched default
    });

    it('work as a drop-in for testHook', () => {
        const { payload } = testHook(
            mockPreToolUse({ tool_name: 'Bash', tool_input: { command: 'rm -rf /' } }),
            () => {
                const input = PreToolUse.parse();
                if (String(input.tool_input['command']).includes('rm -rf /')) {
                    PreToolUse.emitOutput({ decision: 'deny', reason: 'no' });
                } else {
                    PreToolUse.emitOutput({});
                }
            },
        );
        expect(payload).toMatchObject({
            hookSpecificOutput: { permissionDecision: 'deny' },
        });
    });
});

describe('TestHookResult normalized fields', () => {
    it('wasDenied is true for PreToolUse permissionDecision=deny', () => {
        const r = testHook(mockPreToolUse(), () =>
            PreToolUse.emitOutput({ decision: 'deny', reason: 'no' }),
        );
        expect(r.wasDenied).toBe(true);
        expect(r.wasAllowed).toBe(false);
        expect(r.wasAsked).toBe(false);
    });

    it('wasAsked is true for PreToolUse permissionDecision=ask', () => {
        const r = testHook(mockPreToolUse(), () =>
            PreToolUse.emitOutput({ decision: 'ask' }),
        );
        expect(r.wasAsked).toBe(true);
        expect(r.wasDenied).toBe(false);
        expect(r.wasAllowed).toBe(false);
    });

    it('wasDenied is true for binary deny via top-level decision=block', () => {
        const r = testHook(mockPostToolUse(), () =>
            PostToolUse.emitOutput({ deny: true, reason: 'no' }),
        );
        expect(r.wasDenied).toBe(true);
        expect(r.wasAllowed).toBe(false);
    });

    it('wasAllowed is true for an empty emit (no blocking signal)', () => {
        const r = testHook(mockPreToolUse(), () => PreToolUse.emitOutput({}));
        expect(r.wasAllowed).toBe(true);
        expect(r.wasDenied).toBe(false);
        expect(r.wasAsked).toBe(false);
    });

    it('toUser surfaces payload.systemMessage', () => {
        const r = testHook(mockPreToolUse(), () =>
            PreToolUse.emitOutput({ toUser: 'hello user' }),
        );
        expect(r.toUser).toBe('hello user');
    });

    it('toClaude surfaces additionalContext when present', () => {
        const r = testHook(mockSessionStart({ source: 'startup' }), () =>
            SessionStart.emitOutput({ toClaude: 'extra context for Claude' }),
        );
        expect(r.toClaude).toBe('extra context for Claude');
    });

    it('toClaude falls back to permissionDecisionReason for PreToolUse deny', () => {
        const r = testHook(mockPreToolUse(), () =>
            PreToolUse.emitOutput({ decision: 'deny', reason: 'blocked because' }),
        );
        expect(r.toClaude).toBe('blocked because');
    });

    it('toClaude falls back to top-level reason for binary deny events', () => {
        const r = testHook(mockPostToolUse(), () =>
            PostToolUse.emitOutput({ deny: true, reason: 'nope' }),
        );
        expect(r.toClaude).toBe('nope');
    });

    it('toUser and toClaude are undefined when nothing was set', () => {
        const r = testHook(mockPreToolUse(), () => PreToolUse.emitOutput({}));
        expect(r.toUser).toBeUndefined();
        expect(r.toClaude).toBeUndefined();
    });
});
