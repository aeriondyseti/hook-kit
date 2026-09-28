/**
 * Notification — runs when Claude Code wants to notify the user (permission
 * prompt, idle, auth success, MCP elicitation, background-agent status,
 * usage-limit auto-resume). Mostly observational: show the user something,
 * forward it elsewhere, or ring the terminal with `terminalSequence`.
 */

import type { OpenUnion } from '../common.js';
import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export type NotificationType = OpenUnion<
    | 'permission_prompt'
    | 'idle_prompt'
    | 'auth_success'
    | 'elicitation_dialog'
    | 'elicitation_url_dialog'
    | 'elicitation_complete'
    | 'elicitation_response'
    | 'agent_needs_input'
    | 'agent_completed'
    | 'quota_auto_resume_fired'
    | 'quota_auto_resume_stale'
    | 'quota_auto_resume_disabled'
>;

export interface NotificationInput extends RawHookInput<'Notification'> {
    message: string;
    title?: string;
    notification_type: NotificationType;
}

export interface NotificationEmitOptions extends CommonEmitOptions {
    /** Added to Claude's context. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
}

interface NotificationJsonOutput extends CommonJsonOutput {
    hookSpecificOutput?: { hookEventName: 'Notification'; additionalContext: string };
}

export class Notification {
    static parse(): NotificationInput {
        return readHookInput('Notification') as NotificationInput;
    }

    static emitOutput(opts: NotificationEmitOptions = {}): never {
        const out = mixinCommon<NotificationJsonOutput>({}, opts);
        if (opts.toClaude !== undefined) {
            out.hookSpecificOutput = { hookEventName: 'Notification', additionalContext: asString(opts.toClaude) };
        }
        return emitJson(out);
    }
}
