/**
 * PreToolUse — runs before Claude calls a tool.
 *
 *   const input = PreToolUse.parse();
 *   if (isDangerous(input.tool_name, input.tool_input)) {
 *       PreToolUse.emitOutput({ decision: 'deny', reason: 'no raw rm' });
 *   } else {
 *       PreToolUse.emitOutput({});
 *   }
 *
 * Input fields are snake_case — they match Claude Code's JSON spec verbatim.
 * Output option names are camelCase — they're our API, mapped to the spec's
 * JSON field names by `emitOutput`.
 */

import type { DecisionType } from '../common.js';
import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface PreToolUseInput extends RawHookInput<'PreToolUse'> {
    tool_name: string;
    tool_input: Record<string, unknown>;
    tool_use_id: string;
}

export interface PreToolUseEmitOptions extends CommonEmitOptions {
    /** Added to Claude's context. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
    /** allow / deny / ask. Maps to `hookSpecificOutput.permissionDecision`. */
    decision?: DecisionType;
    /** Explanation Claude (or the user, for `ask`) sees alongside the decision. */
    reason?: string;
    /** Patch to apply to the tool input before the call. */
    updatedInput?: Record<string, unknown>;
}

interface PreToolUseHookSpecific {
    hookEventName: 'PreToolUse';
    permissionDecision?: DecisionType;
    permissionDecisionReason?: string;
    updatedInput?: Record<string, unknown>;
    additionalContext?: string;
}

interface PreToolUseJsonOutput extends CommonJsonOutput {
    hookSpecificOutput?: PreToolUseHookSpecific;
}

export class PreToolUse {
    static parse(): PreToolUseInput {
        return readHookInput('PreToolUse') as PreToolUseInput;
    }

    static emitOutput(opts: PreToolUseEmitOptions = {}): never {
        const out = mixinCommon<PreToolUseJsonOutput>({}, opts);

        const hasHS =
            opts.decision !== undefined ||
            opts.reason !== undefined ||
            opts.updatedInput !== undefined ||
            opts.toClaude !== undefined;

        if (hasHS) {
            const hs: PreToolUseHookSpecific = { hookEventName: 'PreToolUse' };
            if (opts.decision !== undefined) hs.permissionDecision = opts.decision;
            if (opts.reason !== undefined) hs.permissionDecisionReason = opts.reason;
            if (opts.updatedInput !== undefined) hs.updatedInput = opts.updatedInput;
            if (opts.toClaude !== undefined) hs.additionalContext = asString(opts.toClaude);
            out.hookSpecificOutput = hs;
        }
        return emitJson(out);
    }
}
