/**
 * PostToolBatch — runs once after every tool call in a batch has resolved,
 * before the next model request.
 *
 * `PostToolUse` fires per tool and may run concurrently for parallel calls;
 * this fires exactly once with the whole batch, so it's the place for checks
 * that need to see all the results together.
 */

import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface ToolCallResult {
    tool_name: string;
    tool_input: Record<string, unknown>;
    tool_use_id: string;
    tool_response?: unknown;
}

export interface PostToolBatchInput extends RawHookInput<'PostToolBatch'> {
    tool_calls: ToolCallResult[];
}

export interface PostToolBatchEmitOptions extends CommonEmitOptions {
    /** Added to Claude's context. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
}

interface PostToolBatchJsonOutput extends CommonJsonOutput {
    hookSpecificOutput?: { hookEventName: 'PostToolBatch'; additionalContext: string };
}

export class PostToolBatch {
    static parse(): PostToolBatchInput {
        return readHookInput('PostToolBatch') as PostToolBatchInput;
    }

    static emitOutput(opts: PostToolBatchEmitOptions = {}): never {
        const out = mixinCommon<PostToolBatchJsonOutput>({}, opts);
        if (opts.toClaude !== undefined) {
            out.hookSpecificOutput = { hookEventName: 'PostToolBatch', additionalContext: asString(opts.toClaude) };
        }
        return emitJson(out);
    }
}
