import { describe, expect, it } from 'vitest';
import type { PermissionUpdate } from '../common.js';
import { mockPermissionRequest, testHook } from '../testing.js';
import { PermissionRequest } from './PermissionRequest.js';

describe('PermissionRequest', () => {
    it('emits {} when no decision is given, letting the dialog show', () => {
        const { payload, wasAllowed } = testHook(mockPermissionRequest(), () => {
            PermissionRequest.parse();
            PermissionRequest.emitOutput();
        });
        expect(payload).toEqual({});
        expect(wasAllowed).toBe(true);
    });

    it('maps allow + updatedInput + updatedPermissions to decision.behavior', () => {
        const rule: PermissionUpdate = { type: 'addRules', rules: [{ toolName: 'Bash', ruleContent: 'ls:*' }], behavior: 'allow', destination: 'session' };
        const { payload, wasAllowed } = testHook(mockPermissionRequest(), () => {
            PermissionRequest.parse();
            PermissionRequest.emitOutput({ decision: 'allow', updatedInput: { command: 'ls -la' }, updatedPermissions: [rule] });
        });
        expect(payload).toEqual({
            hookSpecificOutput: {
                hookEventName: 'PermissionRequest',
                decision: { behavior: 'allow', updatedInput: { command: 'ls -la' }, updatedPermissions: [rule] },
            },
        });
        expect(wasAllowed).toBe(true);
    });

    it('maps deny + reason + interrupt to decision.message / interrupt', () => {
        const r = testHook(mockPermissionRequest(), () => {
            PermissionRequest.parse();
            PermissionRequest.emitOutput({ decision: 'deny', reason: 'not on main', interrupt: true });
        });
        expect(r.payload).toEqual({
            hookSpecificOutput: {
                hookEventName: 'PermissionRequest',
                decision: { behavior: 'deny', message: 'not on main', interrupt: true },
            },
        });
        expect(r.wasDenied).toBe(true);
        expect(r.wasAllowed).toBe(false);
        expect(r.toClaude).toBe('not on main');
    });

    it('rejects options that belong to the other decision at compile time', () => {
        testHook(mockPermissionRequest(), () => {
            // @ts-expect-error — `interrupt` only exists on a deny.
            PermissionRequest.emitOutput({ decision: 'allow', interrupt: true });
        });
    });
});
