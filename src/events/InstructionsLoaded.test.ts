import { describe, expect, it } from 'vitest';
import { mockInstructionsLoaded, testHook } from '../testing.js';
import { InstructionsLoaded } from './InstructionsLoaded.js';

describe('InstructionsLoaded', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockInstructionsLoaded(), () => {
            const input = InstructionsLoaded.parse();
            expect(input.load_reason).toBe('session_start');
            expect(input.memory_type).toBe('Project');
            InstructionsLoaded.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps toUser via the common mixin', () => {
        const { payload } = testHook(mockInstructionsLoaded(), () => {
            InstructionsLoaded.parse();
            InstructionsLoaded.emitOutput({ toUser: 'noted' });
        });
        expect(payload).toEqual({ systemMessage: '\nnoted' });
    });
});
