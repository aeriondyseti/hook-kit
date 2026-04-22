import { describe, expect, it } from 'vitest';
import { SessionStart } from '../../src/index.js';
import { mockSessionStart, testHook } from '../../src/testing.js';
import { buildContext, handle } from './session-start.js';

describe('session-start hook', () => {
    it('injects a session preamble into toClaude', () => {
        const result = testHook(
            mockSessionStart({ source: 'startup', model: 'claude-opus-4-7', cwd: '/work' }),
            () => handle(SessionStart.parse()),
        );

        expect(result.toClaude).toContain('claude-opus-4-7');
        expect(result.toClaude).toContain('startup');
        expect(result.toClaude).toContain('/work');
    });

    it('renders a user-facing start marker', () => {
        const result = testHook(
            mockSessionStart({ source: 'resume', model: 'claude-opus-4-7' }),
            () => handle(SessionStart.parse()),
        );

        expect(result.toUser).toContain('session started');
        expect(result.toUser).toContain('resume');
    });

    it('buildContext is pure and testable in isolation', () => {
        const ctx = buildContext(
            mockSessionStart({ source: 'clear', model: 'haiku', cwd: '/x' }),
        );
        expect(ctx).toContain('Source: clear');
        expect(ctx).toContain('/x');
    });
});
