/**
 * SubagentStop — runs when a subagent finishes.
 *
 * Same shape as `Stop`: only meaningful decision is `deny: true` to force
 * the subagent to keep going. Separate event so you can gate subagents
 * differently from the top-level agent.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface SubagentStopInput extends RawHookInput<'SubagentStop'> {
    stop_hook_active: boolean;
}

export interface SubagentStopEmitOptions extends CommonEmitOptions {
    /** Prevent the subagent from stopping. Maps to top-level `decision: "block"`. */
    deny?: boolean;
    /** Paired with `deny`; tells the subagent why it must keep going. */
    reason?: string;
}

interface SubagentStopJsonOutput extends CommonJsonOutput {
    decision?: 'block';
    reason?: string;
}

export class SubagentStop {
    static parse(): SubagentStopInput {
        return readHookInput('SubagentStop') as SubagentStopInput;
    }

    static emitOutput(opts: SubagentStopEmitOptions = {}): never {
        const out = mixinCommon<SubagentStopJsonOutput>({}, opts);
        if (opts.deny) out.decision = 'block';
        if (opts.reason !== undefined) out.reason = opts.reason;
        return emitJson(out);
    }
}
