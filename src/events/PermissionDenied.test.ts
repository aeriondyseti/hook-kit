import { describe, expect, it } from 'vitest';
import { mockPermissionDenied, testHook } from '../testing.js';
import { PermissionDenied } from './PermissionDenied.js';

describe('PermissionDenied', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockPermissionDenied(), () => {
            const input = PermissionDenied.parse();
            expect(input.reason).toBe('test denial');
            PermissionDenied.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps retry', () => {
        const { payload } = testHook(mockPermissionDenied(), () => {
            PermissionDenied.parse();
            PermissionDenied.emitOutput({ retry: true });
        });
        expect(payload).toEqual({ hookSpecificOutput: { hookEventName: 'PermissionDenied', retry: true } });
    });
});
