import { describe, expect, it } from 'vitest';
import { mockElicitation, testHook } from '../testing.js';
import { Elicitation } from './Elicitation.js';

describe('Elicitation', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockElicitation(), () => {
            const input = Elicitation.parse();
            expect(input.mcp_server_name).toBe('test-server');
            Elicitation.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps action + content to hookSpecificOutput', () => {
        const { payload } = testHook(mockElicitation(), () => {
            Elicitation.parse();
            Elicitation.emitOutput({ action: 'accept', content: { env: 'staging' } });
        });
        expect(payload).toEqual({
            hookSpecificOutput: { hookEventName: 'Elicitation', action: 'accept', content: { env: 'staging' } },
        });
    });

    it('puts a decline reason at the top level', () => {
        const { payload } = testHook(mockElicitation(), () => {
            Elicitation.parse();
            Elicitation.emitOutput({ action: 'decline', reason: 'not from CI' });
        });
        expect(payload).toEqual({
            reason: 'not from CI',
            hookSpecificOutput: { hookEventName: 'Elicitation', action: 'decline' },
        });
    });
});
