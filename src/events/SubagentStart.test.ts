import { describe, expect, it } from 'vitest';
import { mockSubagentStart, testHook } from '../testing.js';
import { SubagentStart } from './SubagentStart.js';

describe('SubagentStart', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockSubagentStart(), () => {
            const input = SubagentStart.parse();
            expect(input.agent_type).toBe('general-purpose');
            SubagentStart.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps toClaude to hookSpecificOutput.additionalContext', () => {
        const { payload } = testHook(mockSubagentStart(), () => {
            SubagentStart.parse();
            SubagentStart.emitOutput({ toClaude: 'note' });
        });
        expect(payload).toEqual({
            hookSpecificOutput: { hookEventName: 'SubagentStart', additionalContext: 'note' },
        });
    });
});
