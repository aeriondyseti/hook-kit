/**
 * SubagentStop — runs when a subagent finishes.
 *
 * Same shape as `Stop`: `deny: true` forces the subagent to keep going,
 * `toClaude` sends it non-error feedback. Separate event so you can gate
 * subagents differently from the top-level agent — `agent_type` says which
 * kind of subagent this is.
 */

import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';
import type { BackgroundTask, SessionCron } from './Stop.js';

export interface SubagentStopInput extends RawHookInput<'SubagentStop'> {
    stop_hook_active: boolean;
    agent_id: string;
    /** e.g. `general-purpose`, `Explore`, or a custom agent name. */
    agent_type: string;
    agent_transcript_path: string;
    /** Text of the subagent's final message — saves parsing the transcript. */
    last_assistant_message?: string;
    background_tasks?: BackgroundTask[];
    session_crons?: SessionCron[];
}

export interface SubagentStopEmitOptions extends CommonEmitOptions {
    /** Non-error feedback for the subagent; it continues. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
    /** Prevent the subagent from stopping. Maps to top-level `decision: "block"`. */
    deny?: boolean;
    /** Paired with `deny`; tells the subagent why it must keep going. */
    reason?: string;
}

interface SubagentStopJsonOutput extends CommonJsonOutput {
    decision?: 'block';
    reason?: string;
    hookSpecificOutput?: { hookEventName: 'SubagentStop'; additionalContext: string };
}

export class SubagentStop {
    static parse(): SubagentStopInput {
        return readHookInput('SubagentStop') as SubagentStopInput;
    }

    static emitOutput(opts: SubagentStopEmitOptions = {}): never {
        const out = mixinCommon<SubagentStopJsonOutput>({}, opts);
        if (opts.deny) out.decision = 'block';
        if (opts.reason !== undefined) out.reason = opts.reason;
        if (opts.toClaude !== undefined) {
            out.hookSpecificOutput = { hookEventName: 'SubagentStop', additionalContext: asString(opts.toClaude) };
        }
        return emitJson(out);
    }
}
