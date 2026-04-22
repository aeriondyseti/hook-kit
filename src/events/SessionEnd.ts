/**
 * SessionEnd — runs when a Claude Code session ends.
 *
 * Output-only to the user — there's no future turn to influence. Use it for
 * teardown messaging: final stats, cleanup confirmations, etc.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface SessionEndInput extends RawHookInput<'SessionEnd'> {
    reason: 'clear' | 'logout' | 'prompt_input_exit' | 'other';
}

export type SessionEndEmitOptions = CommonEmitOptions;

type SessionEndJsonOutput = CommonJsonOutput;

export class SessionEnd {
    static parse(): SessionEndInput {
        return readHookInput('SessionEnd') as SessionEndInput;
    }

    static emitOutput(opts: SessionEndEmitOptions = {}): never {
        const out = mixinCommon<SessionEndJsonOutput>({}, opts);
        return emitJson(out);
    }
}
