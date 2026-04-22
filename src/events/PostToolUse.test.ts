import { describe, expect, it } from 'vitest';
import { testHook } from '../testing.js';
import { PostToolUse, type PostToolUseInput } from './PostToolUse.js';

const baseInput: PostToolUseInput = {
    hook_event_name: 'PostToolUse',
    session_id: 's',
    transcript_path: '/tmp/t.jsonl',
    cwd: '/tmp',
    tool_name: 'Bash',
    tool_input: { command: 'ls' },
    tool_response: { stdout: 'file1\n' },
    tool_use_id: 'u',
};

describe('PostToolUse', () => {
    it('parses the input shape', () => {
        const { payload } = testHook(baseInput, () => {
            const input = PostToolUse.parse();
            expect(input.tool_name).toBe('Bash');
            expect(input.tool_response).toEqual({ stdout: 'file1\n' });
            PostToolUse.emitOutput({});
        });
        expect(payload).toEqual({});
    });

    it('maps deny + reason to top-level decision/reason (NOT hookSpecific)', () => {
        const { payload } = testHook(baseInput, () => {
            PostToolUse.parse();
            PostToolUse.emitOutput({ deny: true, reason: 'bad output' });
        });
        expect(payload).toEqual({ decision: 'block', reason: 'bad output' });
    });

    it('maps toClaude to hookSpecificOutput.additionalContext', () => {
        const { payload } = testHook(baseInput, () => {
            PostToolUse.parse();
            PostToolUse.emitOutput({ toClaude: 'note' });
        });
        expect(payload).toEqual({
            hookSpecificOutput: {
                hookEventName: 'PostToolUse',
                additionalContext: 'note',
            },
        });
    });

    it('maps updatedMCPToolOutput', () => {
        const { payload } = testHook(baseInput, () => {
            PostToolUse.parse();
            PostToolUse.emitOutput({ updatedMCPToolOutput: { replaced: true } });
        });
        expect(payload).toEqual({
            hookSpecificOutput: {
                hookEventName: 'PostToolUse',
                updatedMCPToolOutput: { replaced: true },
            },
        });
    });

    it('maps toUser via the common mixin', () => {
        const { payload } = testHook(baseInput, () => {
            PostToolUse.parse();
            PostToolUse.emitOutput({ toUser: 'seen' });
        });
        expect(payload).toEqual({ systemMessage: 'seen' });
    });
});
