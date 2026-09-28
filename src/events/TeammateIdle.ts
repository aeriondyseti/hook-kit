/**
 * TeammateIdle — runs when an agent-team teammate is about to go idle.
 *
 * Set `deny: true` to keep the teammate working; `reason` tells it what's
 * left to do. To stop the teammate outright, use `continue: false`.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface TeammateIdleInput extends RawHookInput<'TeammateIdle'> {
    teammate_name: string;
    /** @deprecated Sessions have a single implicit team; Claude Code will remove this. */
    team_name: string;
}

export interface TeammateIdleEmitOptions extends CommonEmitOptions {
    /** Keep the teammate working. Maps to top-level `decision: "block"`. */
    deny?: boolean;
    /** Paired with `deny`; tells the teammate why it must keep going. */
    reason?: string;
}

interface TeammateIdleJsonOutput extends CommonJsonOutput {
    decision?: 'block';
    reason?: string;
}

export class TeammateIdle {
    static parse(): TeammateIdleInput {
        return readHookInput('TeammateIdle') as TeammateIdleInput;
    }

    static emitOutput(opts: TeammateIdleEmitOptions = {}): never {
        const out = mixinCommon<TeammateIdleJsonOutput>({}, opts);
        if (opts.deny) out.decision = 'block';
        if (opts.reason !== undefined) out.reason = opts.reason;
        return emitJson(out);
    }
}
