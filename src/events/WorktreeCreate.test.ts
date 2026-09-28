import { describe, expect, it } from 'vitest';
import { mockWorktreeCreate, testHook } from '../testing.js';
import { WorktreeCreate } from './WorktreeCreate.js';

describe('WorktreeCreate', () => {
    it('parses the suggested name', () => {
        testHook(mockWorktreeCreate(), () => {
            expect(WorktreeCreate.parse().name).toBe('test-worktree');
            WorktreeCreate.emitOutput({ worktreePath: '/wt' });
        });
    });

    it('emits the bare path as plain text, not JSON', () => {
        const { payload, exitCode } = testHook(mockWorktreeCreate(), () => {
            WorktreeCreate.parse();
            WorktreeCreate.emitOutput({ worktreePath: '/work/trees/feature-x' });
        });
        expect(payload).toBe('/work/trees/feature-x');
        expect(exitCode).toBe(0);
    });
});
