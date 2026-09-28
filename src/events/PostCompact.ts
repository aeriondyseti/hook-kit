/**
 * PostCompact — runs after Claude Code compacts the conversation.
 *
 * `compact_summary` is the summary that replaced the history — useful for
 * archiving or checking that nothing important was dropped. Compaction has
 * already happened, so there's nothing to block.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface PostCompactInput extends RawHookInput<'PostCompact'> {
    trigger: 'manual' | 'auto';
    compact_summary: string;
}

export type PostCompactEmitOptions = CommonEmitOptions;

type PostCompactJsonOutput = CommonJsonOutput;

export class PostCompact {
    static parse(): PostCompactInput {
        return readHookInput('PostCompact') as PostCompactInput;
    }

    static emitOutput(opts: PostCompactEmitOptions = {}): never {
        const out = mixinCommon<PostCompactJsonOutput>({}, opts);
        return emitJson(out);
    }
}
