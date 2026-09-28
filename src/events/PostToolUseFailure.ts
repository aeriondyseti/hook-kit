/**
 * PostToolUseFailure — runs after a tool call fails (the counterpart to
 * `PostToolUse`, which only fires on success).
 *
 * The call has already failed, so there's nothing to block. Use `toClaude`
 * to explain the failure or suggest a fix. `is_interrupt` separates a user
 * interrupt from a genuine error.
 */

import type { McpServerInfo } from '../common.js';
import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface PostToolUseFailureInput extends RawHookInput<'PostToolUseFailure'> {
    tool_name: string;
    tool_input: Record<string, unknown>;
    tool_use_id: string;
    error: string;
    is_interrupt?: boolean;
    /** Tool execution time, excluding permission-prompt and hook time. */
    duration_ms?: number;
    mcp_server?: McpServerInfo;
}

export interface PostToolUseFailureEmitOptions extends CommonEmitOptions {
    /** Added to Claude's context. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
}

interface PostToolUseFailureJsonOutput extends CommonJsonOutput {
    hookSpecificOutput?: { hookEventName: 'PostToolUseFailure'; additionalContext: string };
}

export class PostToolUseFailure {
    static parse(): PostToolUseFailureInput {
        return readHookInput('PostToolUseFailure') as PostToolUseFailureInput;
    }

    static emitOutput(opts: PostToolUseFailureEmitOptions = {}): never {
        const out = mixinCommon<PostToolUseFailureJsonOutput>({}, opts);
        if (opts.toClaude !== undefined) {
            out.hookSpecificOutput = { hookEventName: 'PostToolUseFailure', additionalContext: asString(opts.toClaude) };
        }
        return emitJson(out);
    }
}
