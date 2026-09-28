import { describe, expect, it } from 'vitest';
import { testHook } from '../testing.js';
import { Notification, type NotificationInput } from './Notification.js';

const baseInput: NotificationInput = {
    hook_event_name: 'Notification',
    session_id: 's',
    transcript_path: '/tmp/t.jsonl',
    cwd: '/tmp',
    message: 'Claude needs your attention',
    notification_type: 'permission_prompt',
};

describe('Notification', () => {
    it('parses message and notification_type', () => {
        const { payload } = testHook(baseInput, () => {
            const input = Notification.parse();
            expect(input.message).toBe('Claude needs your attention');
            expect(input.notification_type).toBe('permission_prompt');
            Notification.emitOutput({});
        });
        expect(payload).toEqual({});
    });

    it('maps toUser via the common mixin', () => {
        const { payload } = testHook(baseInput, () => {
            Notification.parse();
            Notification.emitOutput({ toUser: 'heads up' });
        });
        expect(payload).toEqual({ systemMessage: '\nheads up' });
    });

    it('accepts notification types newer than the known list', () => {
        testHook({ ...baseInput, notification_type: 'some_future_type' }, () => {
            expect(Notification.parse().notification_type).toBe('some_future_type');
            Notification.emitOutput({});
        });
    });

    it('maps toClaude and terminalSequence', () => {
        const { payload } = testHook(baseInput, () => {
            Notification.parse();
            Notification.emitOutput({ toClaude: 'user was pinged', terminalSequence: '\u001b]9;ping\u0007' });
        });
        expect(payload).toEqual({
            terminalSequence: '\u001b]9;ping\u0007',
            hookSpecificOutput: { hookEventName: 'Notification', additionalContext: 'user was pinged' },
        });
    });
});
