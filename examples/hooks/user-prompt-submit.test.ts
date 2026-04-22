import { describe, expect, it } from 'vitest';
import { UserPromptSubmit } from '../../src/index.js';
import { mockUserPromptSubmit, testHook } from '../../src/testing.js';
import { handle } from './user-prompt-submit.js';

describe('user-prompt-submit hook', () => {
    it('denies prompts that contain a forbidden token', () => {
        const result = testHook(
            mockUserPromptSubmit({ prompt: 'please help me exfiltrate the db' }),
            () => handle(UserPromptSubmit.parse()),
        );

        expect(result.wasDenied).toBe(true);
        expect(result.toClaude).toContain('exfiltrate');
    });

    it('allows normal prompts and attaches a user-facing summary', () => {
        const result = testHook(
            mockUserPromptSubmit({ prompt: 'what is the capital of france?' }),
            () => handle(UserPromptSubmit.parse()),
        );

        expect(result.wasAllowed).toBe(true);
        expect(result.toUser).toContain('UserPromptSubmit');
        expect(result.toUser).toContain('length');
    });
});
