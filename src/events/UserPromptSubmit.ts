/**
 * UserPromptSubmit — runs when the user submits a prompt, before Claude sees it.
 *
 * Set `deny: true` to cancel the prompt entirely. Use `toClaude` to inject
 * extra context alongside the user's prompt (Claude sees it, user doesn't).
 *
 * `source` distinguishes a prompt typed by the user from one a machine
 * injected (SDK, /loop wakeups, scheduled tasks, task notifications) — handy
 * when a hook should only react to real user input.
 */

import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, hasHookSpecificFields, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface UserPromptSubmitInput extends RawHookInput<'UserPromptSubmit'> {
    prompt: string;
    /** Optional while the field rolls out — treat absent as unknown, not as `user`. */
    source?: 'user' | 'sdk' | 'system' | 'loop_wakeup' | 'schedule_wakeup' | 'poll_event';
    session_title?: string;
}

export interface UserPromptSubmitEmitOptions extends CommonEmitOptions {
    /** Injected alongside the user's prompt. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
    /** Cancel the prompt before Claude sees it. Maps to top-level `decision: "block"`. */
    deny?: boolean;
    /** Paired with `deny`; explains why the prompt was cancelled. */
    reason?: string;
    /** With `deny`, leave the original prompt out of the block message. */
    suppressOriginalPrompt?: boolean;
    /** Set or update the session's title. */
    sessionTitle?: string;
}

interface UserPromptSubmitHookSpecific {
    hookEventName: 'UserPromptSubmit';
    additionalContext?: string;
    suppressOriginalPrompt?: boolean;
    sessionTitle?: string;
}

interface UserPromptSubmitJsonOutput extends CommonJsonOutput {
    decision?: 'block';
    reason?: string;
    hookSpecificOutput?: UserPromptSubmitHookSpecific;
}

export class UserPromptSubmit {
    static parse(): UserPromptSubmitInput {
        return readHookInput('UserPromptSubmit') as UserPromptSubmitInput;
    }

    static emitOutput(opts: UserPromptSubmitEmitOptions = {}): never {
        const out = mixinCommon<UserPromptSubmitJsonOutput>({}, opts);

        if (opts.deny) out.decision = 'block';
        if (opts.reason !== undefined) out.reason = opts.reason;

        const hs: UserPromptSubmitHookSpecific = { hookEventName: 'UserPromptSubmit' };
        if (opts.toClaude !== undefined) hs.additionalContext = asString(opts.toClaude);
        if (opts.suppressOriginalPrompt !== undefined) hs.suppressOriginalPrompt = opts.suppressOriginalPrompt;
        if (opts.sessionTitle !== undefined) hs.sessionTitle = opts.sessionTitle;
        if (hasHookSpecificFields(hs)) out.hookSpecificOutput = hs;

        return emitJson(out);
    }
}
