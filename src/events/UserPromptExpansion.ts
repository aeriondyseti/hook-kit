/**
 * UserPromptExpansion — runs when a slash command or MCP prompt the user
 * typed expands, before the expanded text reaches Claude.
 *
 * Same controls as `UserPromptSubmit`: `deny: true` cancels it, `toClaude`
 * adds context alongside it. `prompt` is the expanded text; `command_name` /
 * `command_args` are what the user actually typed.
 */

import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, hasHookSpecificFields, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface UserPromptExpansionInput extends RawHookInput<'UserPromptExpansion'> {
    expansion_type: 'slash_command' | 'mcp_prompt';
    command_name: string;
    command_args: string;
    command_source?: string;
    prompt: string;
}

export interface UserPromptExpansionEmitOptions extends CommonEmitOptions {
    /** Added alongside the expanded prompt. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
    /** Cancel the expansion. Maps to top-level `decision: "block"`. */
    deny?: boolean;
    /** Paired with `deny`; explains why. */
    reason?: string;
    /** With `deny`, leave the original prompt out of the block message. */
    suppressOriginalPrompt?: boolean;
}

interface UserPromptExpansionHookSpecific {
    hookEventName: 'UserPromptExpansion';
    additionalContext?: string;
    suppressOriginalPrompt?: boolean;
}

interface UserPromptExpansionJsonOutput extends CommonJsonOutput {
    decision?: 'block';
    reason?: string;
    hookSpecificOutput?: UserPromptExpansionHookSpecific;
}

export class UserPromptExpansion {
    static parse(): UserPromptExpansionInput {
        return readHookInput('UserPromptExpansion') as UserPromptExpansionInput;
    }

    static emitOutput(opts: UserPromptExpansionEmitOptions = {}): never {
        const out = mixinCommon<UserPromptExpansionJsonOutput>({}, opts);

        if (opts.deny) out.decision = 'block';
        if (opts.reason !== undefined) out.reason = opts.reason;

        const hs: UserPromptExpansionHookSpecific = { hookEventName: 'UserPromptExpansion' };
        if (opts.toClaude !== undefined) hs.additionalContext = asString(opts.toClaude);
        if (opts.suppressOriginalPrompt !== undefined) hs.suppressOriginalPrompt = opts.suppressOriginalPrompt;
        if (hasHookSpecificFields(hs)) out.hookSpecificOutput = hs;

        return emitJson(out);
    }
}
