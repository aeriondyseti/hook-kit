import { describe, expect, it } from 'vitest';
import { testHook } from '../testing.js';
import { HookParseError } from './_parse.js';
import { PreToolUse } from './PreToolUse.js';

describe('HookParseError propagation', () => {
    it('throws when hook_event_name does not match the expected event', () => {
        const wrongEvent = {
            hook_event_name: 'PostToolUse',
            session_id: 's',
            transcript_path: '/t',
            cwd: '/',
        };
        expect(() =>
            testHook(wrongEvent, () => {
                PreToolUse.parse();
            }),
        ).toThrow(HookParseError);
    });

    it('carries a structured parseError and exitCode on the thrown error', () => {
        const wrongEvent = {
            hook_event_name: 'PostToolUse',
            session_id: 's',
            transcript_path: '/t',
            cwd: '/',
        };
        try {
            testHook(wrongEvent, () => PreToolUse.parse());
            expect.fail('expected HookParseError');
        } catch (e) {
            expect(e).toBeInstanceOf(HookParseError);
            const err = e as HookParseError;
            expect(err.parseError).toContain('PreToolUse');
            expect(err.parseError).toContain('PostToolUse');
            expect(err.exitCode).toBe(2);
        }
    });
});
