import { describe, expect, it } from 'vitest';
import { mockPreModelSwitch, testHook } from '../testing.js';
import { PreModelSwitch } from './PreModelSwitch.js';

describe('PreModelSwitch', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockPreModelSwitch(), () => {
            const input = PreModelSwitch.parse();
            expect(input.to_model).toBe('claude-opus-5-5');
            expect(input.requested_model).toBe('opus');
            PreModelSwitch.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps decision + reason to permissionDecision / permissionDecisionReason', () => {
        const { payload, wasDenied } = testHook(mockPreModelSwitch(), () => {
            PreModelSwitch.parse();
            PreModelSwitch.emitOutput({ decision: 'deny', reason: 'cache is warm' });
        });
        expect(payload).toEqual({
            hookSpecificOutput: {
                hookEventName: 'PreModelSwitch',
                permissionDecision: 'deny',
                permissionDecisionReason: 'cache is warm',
            },
        });
        expect(wasDenied).toBe(true);
    });
});
