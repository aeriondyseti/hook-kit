/**
 * PreCompact — runs before Claude Code compacts the conversation.
 *
 * `trigger` distinguishes `auto` (context limit reached) from `manual`
 * (user ran /compact). Set `deny: true` to prevent the compaction.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface PreCompactInput extends RawHookInput<'PreCompact'> {
    trigger: 'manual' | 'auto';
    custom_instructions?: string;
}

export interface PreCompactEmitOptions extends CommonEmitOptions {
    /** Prevent compaction. Maps to top-level `decision: "block"`. */
    deny?: boolean;
    /** Paired with `deny`; shown to Claude. */
    reason?: string;
}

interface PreCompactJsonOutput extends CommonJsonOutput {
    decision?: 'block';
    reason?: string;
}

export class PreCompact {
    static parse(): PreCompactInput {
        return readHookInput('PreCompact') as PreCompactInput;
    }

    static emitOutput(opts: PreCompactEmitOptions = {}): never {
        const out = mixinCommon<PreCompactJsonOutput>({}, opts);
        if (opts.deny) out.decision = 'block';
        if (opts.reason !== undefined) out.reason = opts.reason;
        return emitJson(out);
    }
}
