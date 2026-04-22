import { describe, expect, it } from 'vitest';
import { PreToolUse } from '../../src/index.js';
import { mockPreToolUse, testHook } from '../../src/testing.js';
import { handle } from './pre-tool-use.js';

describe('pre-tool-use hook', () => {
    it('denies dangerous rm -rf commands', () => {
        const result = testHook(
            mockPreToolUse({
                tool_name: 'Bash',
                tool_input: { command: 'rm -rf /' },
            }),
            () => handle(PreToolUse.parse()),
        );

        expect(result.wasDenied).toBe(true);
        expect(result.toClaude).toContain('rm -rf');
    });

    it('allows ordinary bash commands and renders a user-facing summary', () => {
        const result = testHook(
            mockPreToolUse({
                tool_name: 'Bash',
                tool_input: { command: 'ls -la' },
            }),
            () => handle(PreToolUse.parse()),
        );

        expect(result.wasAllowed).toBe(true);
        expect(result.toUser).toContain('Bash');
        expect(result.toUser).toContain('PreToolUse');
    });

    it('allows commands that happen to mention rm without the dangerous flag combo', () => {
        const result = testHook(
            mockPreToolUse({
                tool_name: 'Bash',
                tool_input: { command: 'echo "we never rm -r the repo"' },
            }),
            () => handle(PreToolUse.parse()),
        );

        expect(result.wasDenied).toBe(false);
    });
});
