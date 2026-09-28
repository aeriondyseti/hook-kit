/**
 * PostModelSwitch — runs after the session's model has changed, including
 * automatic fallbacks (`source: 'auto'`) and restores on resume, which
 * `PreModelSwitch` never sees.
 *
 * `toClaude` reaches the new model with the first request it serves.
 */

import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';
import type { ModelSwitchInfo } from './PreModelSwitch.js';

export interface PostModelSwitchInput extends RawHookInput<'PostModelSwitch'>, ModelSwitchInfo {
    /** As `PreModelSwitch`, plus `auto` (fallback or programmatic change) and `resume`. */
    source: 'command' | 'picker' | 'sdk' | 'auto' | 'resume';
}

export interface PostModelSwitchEmitOptions extends CommonEmitOptions {
    /** Added to the new model's context. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
}

interface PostModelSwitchJsonOutput extends CommonJsonOutput {
    hookSpecificOutput?: { hookEventName: 'PostModelSwitch'; additionalContext: string };
}

export class PostModelSwitch {
    static parse(): PostModelSwitchInput {
        return readHookInput('PostModelSwitch') as PostModelSwitchInput;
    }

    static emitOutput(opts: PostModelSwitchEmitOptions = {}): never {
        const out = mixinCommon<PostModelSwitchJsonOutput>({}, opts);
        if (opts.toClaude !== undefined) {
            out.hookSpecificOutput = { hookEventName: 'PostModelSwitch', additionalContext: asString(opts.toClaude) };
        }
        return emitJson(out);
    }
}
