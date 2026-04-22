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
        expect(payload).toEqual({ systemMessage: 'heads up' });
    });
});
