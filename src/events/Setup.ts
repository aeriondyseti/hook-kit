/**
 * Setup — runs for Claude Code's `--init`, `--init-only`, and
 * `--maintenance` flags: one-off repository setup (install deps, seed
 * config) or periodic upkeep, outside a normal session start.
 *
 * `trigger` says which flag ran it. `toClaude` adds context for the run.
 */

import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface SetupInput extends RawHookInput<'Setup'> {
    trigger: 'init' | 'maintenance';
}

export interface SetupEmitOptions extends CommonEmitOptions {
    /** Added to Claude's context. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
}

interface SetupJsonOutput extends CommonJsonOutput {
    hookSpecificOutput?: { hookEventName: 'Setup'; additionalContext: string };
}

export class Setup {
    static parse(): SetupInput {
        return readHookInput('Setup') as SetupInput;
    }

    static emitOutput(opts: SetupEmitOptions = {}): never {
        const out = mixinCommon<SetupJsonOutput>({}, opts);
        if (opts.toClaude !== undefined) {
            out.hookSpecificOutput = { hookEventName: 'Setup', additionalContext: asString(opts.toClaude) };
        }
        return emitJson(out);
    }
}
