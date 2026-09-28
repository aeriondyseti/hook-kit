import { describe, expect, it } from 'vitest';
import { mockTaskCreated, testHook } from '../testing.js';
import { TaskCreated } from './TaskCreated.js';

describe('TaskCreated', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockTaskCreated(), () => {
            const input = TaskCreated.parse();
            expect(input.task_subject).toBe('test task');
            TaskCreated.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps deny + reason to top-level decision/reason', () => {
        const { payload, wasDenied } = testHook(mockTaskCreated(), () => {
            TaskCreated.parse();
            TaskCreated.emitOutput({ deny: true, reason: 'not yet' });
        });
        expect(payload).toEqual({ decision: 'block', reason: 'not yet' });
        expect(wasDenied).toBe(true);
    });
});
