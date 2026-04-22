/**
 * Notification — runs when Claude Code wants to notify the user (permission
 * prompt, idle, auth success, elicitation). Observational; the only output
 * is a user-facing `systemMessage`.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface NotificationInput extends RawHookInput<'Notification'> {
    message: string;
    title?: string;
    notification_type: 'permission_prompt' | 'idle_prompt' | 'auth_success' | 'elicitation_dialog';
}

export type NotificationEmitOptions = CommonEmitOptions;

type NotificationJsonOutput = CommonJsonOutput;

export class Notification {
    static parse(): NotificationInput {
        return readHookInput('Notification') as NotificationInput;
    }

    static emitOutput(opts: NotificationEmitOptions = {}): never {
        const out = mixinCommon<NotificationJsonOutput>({}, opts);
        return emitJson(out);
    }
}
