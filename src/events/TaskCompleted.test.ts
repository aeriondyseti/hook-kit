import { describe, expect, it } from 'vitest';
import { mockTaskCompleted, testHook } from '../testing.js';
import { TaskCompleted } from './TaskCompleted.js';

describe('TaskCompleted', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockTaskCompleted(), () => {
            const input = TaskCompleted.parse();
            expect(input.task_id).toBe('test-task-id');
            TaskCompleted.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps deny + reason to top-level decision/reason', () => {
        const { payload, wasDenied } = testHook(mockTaskCompleted(), () => {
            TaskCompleted.parse();
            TaskCompleted.emitOutput({ deny: true, reason: 'not yet' });
        });
        expect(payload).toEqual({ decision: 'block', reason: 'not yet' });
        expect(wasDenied).toBe(true);
    });
});
