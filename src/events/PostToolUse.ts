/**
 * PostToolUse — runs after a tool has finished.
 *
 * Typical use: inspect `tool_response` and either let the result through
 * unchanged or tell Claude to treat it as failed (`deny: true`) with a
 * `reason` so the model knows why.
 */

import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface PostToolUseInput extends RawHookInput<'PostToolUse'> {
    tool_name: string;
    tool_input: Record<string, unknown>;
    tool_response: unknown;
    tool_use_id: string;
}

export interface PostToolUseEmitOptions extends CommonEmitOptions {
    /** Added to Claude's context. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
    /** Tell Claude to treat the just-completed call as rejected. Maps to top-level `decision: "block"`. */
    deny?: boolean;
    /** Paired with `deny` (shown to Claude) or as context for the user. */
    reason?: string;
    /** For MCP tools: replace what Claude sees as the tool's response. */
    updatedMCPToolOutput?: Record<string, unknown>;
}

interface PostToolUseHookSpecific {
    hookEventName: 'PostToolUse';
    additionalContext?: string;
    updatedMCPToolOutput?: Record<string, unknown>;
}

interface PostToolUseJsonOutput extends CommonJsonOutput {
    decision?: 'block';
    reason?: string;
    hookSpecificOutput?: PostToolUseHookSpecific;
}

export class PostToolUse {
    static parse(): PostToolUseInput {
        return readHookInput('PostToolUse') as PostToolUseInput;
    }

    static emitOutput(opts: PostToolUseEmitOptions = {}): never {
        const out = mixinCommon<PostToolUseJsonOutput>({}, opts);

        if (opts.deny) out.decision = 'block';
        if (opts.reason !== undefined) out.reason = opts.reason;

        if (opts.toClaude !== undefined || opts.updatedMCPToolOutput !== undefined) {
            const hs: PostToolUseHookSpecific = { hookEventName: 'PostToolUse' };
            if (opts.toClaude !== undefined) hs.additionalContext = asString(opts.toClaude);
            if (opts.updatedMCPToolOutput !== undefined) hs.updatedMCPToolOutput = opts.updatedMCPToolOutput;
            out.hookSpecificOutput = hs;
        }
        return emitJson(out);
    }
}
