import { describe, expect, it } from 'vitest';
import { mockWorktreeRemove, testHook } from '../testing.js';
import { WorktreeRemove } from './WorktreeRemove.js';

describe('WorktreeRemove', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockWorktreeRemove(), () => {
            const input = WorktreeRemove.parse();
            expect(input.worktree_path).toBe('/tmp/test-worktree');
            WorktreeRemove.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps toUser via the common mixin', () => {
        const { payload } = testHook(mockWorktreeRemove(), () => {
            WorktreeRemove.parse();
            WorktreeRemove.emitOutput({ toUser: 'noted' });
        });
        expect(payload).toEqual({ systemMessage: '\nnoted' });
    });
});
