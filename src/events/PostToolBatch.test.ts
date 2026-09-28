import { describe, expect, it } from 'vitest';
import { mockPostToolBatch, testHook } from '../testing.js';
import { PostToolBatch } from './PostToolBatch.js';

describe('PostToolBatch', () => {
    it('parses every call in the batch', () => {
        const calls = [
            { tool_name: 'Read', tool_input: { file_path: '/a' }, tool_use_id: '1', tool_response: 'x' },
            { tool_name: 'Bash', tool_input: { command: 'ls' }, tool_use_id: '2' },
        ];
        testHook(mockPostToolBatch({ tool_calls: calls }), () => {
            expect(PostToolBatch.parse().tool_calls.map((c) => c.tool_name)).toEqual(['Read', 'Bash']);
            PostToolBatch.emitOutput();
        });
    });

    it('maps toClaude to hookSpecificOutput.additionalContext', () => {
        const { payload } = testHook(mockPostToolBatch(), () => {
            PostToolBatch.parse();
            PostToolBatch.emitOutput({ toClaude: 'note' });
        });
        expect(payload).toEqual({
            hookSpecificOutput: { hookEventName: 'PostToolBatch', additionalContext: 'note' },
        });
    });
});
