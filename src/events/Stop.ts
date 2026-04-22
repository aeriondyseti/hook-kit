/**
 * Stop — runs when Claude finishes responding.
 *
 * Set `deny: true` to force Claude to keep going (the only valid decision
 * for Stop hooks). `reason` is shown to Claude so it knows why it must
 * continue. `stop_hook_active` lets you detect re-entry and avoid loops.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface StopInput extends RawHookInput<'Stop'> {
    stop_hook_active: boolean;
}

export interface StopEmitOptions extends CommonEmitOptions {
    /** Prevent Claude from stopping. Maps to top-level `decision: "block"`. */
    deny?: boolean;
    /** Paired with `deny`; tells Claude why it must keep going. */
    reason?: string;
}

interface StopJsonOutput extends CommonJsonOutput {
    decision?: 'block';
    reason?: string;
}

export class Stop {
    static parse(): StopInput {
        return readHookInput('Stop') as StopInput;
    }

    static emitOutput(opts: StopEmitOptions = {}): never {
        const out = mixinCommon<StopJsonOutput>({}, opts);
        if (opts.deny) out.decision = 'block';
        if (opts.reason !== undefined) out.reason = opts.reason;
        return emitJson(out);
    }
}
