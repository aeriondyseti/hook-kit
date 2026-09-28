import { describe, expect, it } from 'vitest';
import { mockTeammateIdle, testHook } from '../testing.js';
import { TeammateIdle } from './TeammateIdle.js';

describe('TeammateIdle', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockTeammateIdle(), () => {
            const input = TeammateIdle.parse();
            expect(input.teammate_name).toBe('test-teammate');
            TeammateIdle.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps deny + reason to top-level decision/reason', () => {
        const { payload, wasDenied } = testHook(mockTeammateIdle(), () => {
            TeammateIdle.parse();
            TeammateIdle.emitOutput({ deny: true, reason: 'not yet' });
        });
        expect(payload).toEqual({ decision: 'block', reason: 'not yet' });
        expect(wasDenied).toBe(true);
    });
});
