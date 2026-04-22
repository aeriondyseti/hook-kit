import { describe, expect, it } from 'vitest';
import { PostToolUse } from '../../src/index.js';
import { mockPostToolUse, testHook } from '../../src/testing.js';
import { handle } from './post-tool-use.js';

describe('post-tool-use hook', () => {
    it('denies and feeds context back to Claude when the tool hit a permission error', () => {
        const result = testHook(
            mockPostToolUse({
                tool_name: 'Bash',
                tool_input: { command: 'cat /root/secret' },
                tool_response: { stderr: 'cat: /root/secret: Permission denied' },
            }),
            () => handle(PostToolUse.parse()),
        );

        expect(result.wasDenied).toBe(true);
        expect(result.toClaude).toContain('permissions');
    });

    it('passes through ordinary tool responses with a user-facing summary', () => {
        const result = testHook(
            mockPostToolUse({
                tool_name: 'Read',
                tool_input: { file_path: '/tmp/a' },
                tool_response: { content: 'hi' },
            }),
            () => handle(PostToolUse.parse()),
        );

        expect(result.wasAllowed).toBe(true);
        expect(result.toUser).toContain('Read');
    });
});
