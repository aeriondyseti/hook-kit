import { describe, expect, it } from 'vitest';
import { PreToolUse } from '../../src/index.js';
import { mockPreToolUse, testHook } from '../../src/testing.js';
import { handle } from './pre-tool-use-advanced.js';

describe('pre-tool-use-advanced hook', () => {
    it('escalates sudo commands to the ask branch', () => {
        const result = testHook(
            mockPreToolUse({ tool_name: 'Bash', tool_input: { command: 'sudo rm /etc/hosts' } }),
            () => handle(PreToolUse.parse()),
        );

        expect(result.wasAsked).toBe(true);
        expect(result.wasDenied).toBe(false);
        expect(result.wasAllowed).toBe(false);
        expect(result.toClaude).toContain('sudo');
    });

    it('auto-appends a trailing newline to Write content via updatedInput', () => {
        const result = testHook(
            mockPreToolUse({
                tool_name: 'Write',
                tool_input: { file_path: '/tmp/x', content: 'no newline here' },
            }),
            () => handle(PreToolUse.parse()),
        );

        expect(result.wasAllowed).toBe(true);
        const updated = (result.payload as {
            hookSpecificOutput?: { updatedInput?: { content?: string } };
        }).hookSpecificOutput?.updatedInput;
        expect(updated?.content).toBe('no newline here\n');
    });

    it('passes Write content through unchanged when it already ends with a newline', () => {
        const result = testHook(
            mockPreToolUse({
                tool_name: 'Write',
                tool_input: { file_path: '/tmp/x', content: 'good\n' },
            }),
            () => handle(PreToolUse.parse()),
        );

        expect(result.wasAllowed).toBe(true);
        expect(
            (result.payload as { hookSpecificOutput?: unknown }).hookSpecificOutput,
        ).toBeUndefined();
    });

    it('allows unrelated Bash commands with no decoration', () => {
        const result = testHook(
            mockPreToolUse({ tool_name: 'Bash', tool_input: { command: 'ls -la' } }),
            () => handle(PreToolUse.parse()),
        );

        expect(result.wasAllowed).toBe(true);
        expect(result.wasAsked).toBe(false);
    });
});
