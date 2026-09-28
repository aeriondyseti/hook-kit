import { describe, expect, it } from 'vitest';
import { mockStopFailure, testHook } from '../testing.js';
import { StopFailure } from './StopFailure.js';

describe('StopFailure', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockStopFailure(), () => {
            const input = StopFailure.parse();
            expect(input.error).toBe('unknown');
            StopFailure.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps toUser via the common mixin', () => {
        const { payload } = testHook(mockStopFailure(), () => {
            StopFailure.parse();
            StopFailure.emitOutput({ toUser: 'noted' });
        });
        expect(payload).toEqual({ systemMessage: '\nnoted' });
    });
});
