import { describe, expect, it } from 'vitest';
import { mockUserPromptExpansion, testHook } from '../testing.js';
import { UserPromptExpansion } from './UserPromptExpansion.js';

describe('UserPromptExpansion', () => {
    it('parses the input and emits {} by default', () => {
        const { payload } = testHook(mockUserPromptExpansion(), () => {
            const input = UserPromptExpansion.parse();
            expect(input.expansion_type).toBe('slash_command');
            UserPromptExpansion.emitOutput();
        });
        expect(payload).toEqual({});
    });

    it('maps toClaude to hookSpecificOutput.additionalContext', () => {
        const { payload } = testHook(mockUserPromptExpansion(), () => {
            UserPromptExpansion.parse();
            UserPromptExpansion.emitOutput({ toClaude: 'note' });
        });
        expect(payload).toEqual({
            hookSpecificOutput: { hookEventName: 'UserPromptExpansion', additionalContext: 'note' },
        });
    });

    it('maps deny + reason + suppressOriginalPrompt', () => {
        const { payload } = testHook(mockUserPromptExpansion(), () => {
            UserPromptExpansion.parse();
            UserPromptExpansion.emitOutput({ deny: true, reason: 'disabled', suppressOriginalPrompt: true });
        });
        expect(payload).toEqual({
            decision: 'block',
            reason: 'disabled',
            hookSpecificOutput: { hookEventName: 'UserPromptExpansion', suppressOriginalPrompt: true },
        });
    });
});
