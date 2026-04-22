/**
 * UserPromptSubmit — runs when the user submits a prompt, before Claude sees it.
 *
 * Set `deny: true` to cancel the prompt entirely. Use `toClaude` to inject
 * extra context alongside the user's prompt (Claude sees it, user doesn't).
 */

import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface UserPromptSubmitInput extends RawHookInput<'UserPromptSubmit'> {
    prompt: string;
}

export interface UserPromptSubmitEmitOptions extends CommonEmitOptions {
    /** Injected alongside the user's prompt. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
    /** Cancel the prompt before Claude sees it. Maps to top-level `decision: "block"`. */
    deny?: boolean;
    /** Paired with `deny`; explains why the prompt was cancelled. */
    reason?: string;
}

interface UserPromptSubmitHookSpecific {
    hookEventName: 'UserPromptSubmit';
    additionalContext?: string;
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

        if (opts.toClaude !== undefined) {
            out.hookSpecificOutput = {
                hookEventName: 'UserPromptSubmit',
                additionalContext: asString(opts.toClaude),
            };
        }
        return emitJson(out);
    }
}
