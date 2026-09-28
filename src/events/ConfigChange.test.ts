import { describe, expect, it } from 'vitest';
import { mockConfigChange, testHook } from '../testing.js';
import { ConfigChange } from './ConfigChange.js';

describe('ConfigChange', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockConfigChange(), () => {
            const input = ConfigChange.parse();
            expect(input.source).toBe('project_settings');
            ConfigChange.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps deny + reason to top-level decision/reason', () => {
        const { payload, wasDenied } = testHook(mockConfigChange(), () => {
            ConfigChange.parse();
            ConfigChange.emitOutput({ deny: true, reason: 'not yet' });
        });
        expect(payload).toEqual({ decision: 'block', reason: 'not yet' });
        expect(wasDenied).toBe(true);
    });
});
