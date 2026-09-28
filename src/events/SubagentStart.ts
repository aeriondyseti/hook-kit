/**
 * SubagentStart — runs when a subagent is spawned.
 *
 * Use `toClaude` to seed the subagent with context (conventions, a reminder
 * of the task's constraints) before it starts working. Pair with
 * `SubagentStop` on `agent_id` to track a subagent's lifetime.
 */

import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface SubagentStartInput extends RawHookInput<'SubagentStart'> {
    agent_id: string;
    /** e.g. `general-purpose`, `Explore`, or a custom agent name. */
    agent_type: string;
}

export interface SubagentStartEmitOptions extends CommonEmitOptions {
    /** Added to the subagent's context. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
}

interface SubagentStartJsonOutput extends CommonJsonOutput {
    hookSpecificOutput?: { hookEventName: 'SubagentStart'; additionalContext: string };
}

export class SubagentStart {
    static parse(): SubagentStartInput {
        return readHookInput('SubagentStart') as SubagentStartInput;
    }

    static emitOutput(opts: SubagentStartEmitOptions = {}): never {
        const out = mixinCommon<SubagentStartJsonOutput>({}, opts);
        if (opts.toClaude !== undefined) {
            out.hookSpecificOutput = { hookEventName: 'SubagentStart', additionalContext: asString(opts.toClaude) };
        }
        return emitJson(out);
    }
}
