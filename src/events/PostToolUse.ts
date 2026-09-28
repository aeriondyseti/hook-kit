/**
 * PostToolUse — runs after a tool has finished.
 *
 * Typical use: inspect `tool_response` and either let the result through
 * unchanged or tell Claude to treat it as failed (`deny: true`) with a
 * `reason` so the model knows why.
 */

import type { McpServerInfo } from '../common.js';
import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, hasHookSpecificFields, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface PostToolUseInput extends RawHookInput<'PostToolUse'> {
    tool_name: string;
    tool_input: Record<string, unknown>;
    tool_response: unknown;
    tool_use_id: string;
    /** Tool execution time, excluding permission-prompt and hook time. */
    duration_ms?: number;
    mcp_server?: McpServerInfo;
}

export interface PostToolUseEmitOptions extends CommonEmitOptions {
    /** Added to Claude's context. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
    /** Tell Claude to treat the just-completed call as rejected. Maps to top-level `decision: "block"`. */
    deny?: boolean;
    /** Paired with `deny` (shown to Claude) or as context for the user. */
    reason?: string;
    /** Replace what Claude sees as the tool's response. Works for every tool. */
    updatedToolOutput?: unknown;
    /** @deprecated MCP tools only — use `updatedToolOutput`, which works for every tool. */
    updatedMCPToolOutput?: Record<string, unknown>;
}

interface PostToolUseHookSpecific {
    hookEventName: 'PostToolUse';
    additionalContext?: string;
    updatedToolOutput?: unknown;
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

        const hs: PostToolUseHookSpecific = { hookEventName: 'PostToolUse' };
        if (opts.toClaude !== undefined) hs.additionalContext = asString(opts.toClaude);
        if (opts.updatedToolOutput !== undefined) hs.updatedToolOutput = opts.updatedToolOutput;
        if (opts.updatedMCPToolOutput !== undefined) hs.updatedMCPToolOutput = opts.updatedMCPToolOutput;
        if (hasHookSpecificFields(hs)) out.hookSpecificOutput = hs;

        return emitJson(out);
    }
}
