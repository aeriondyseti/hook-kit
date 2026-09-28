/**
 * CwdChanged — runs when the session's working directory changes.
 *
 * Return `watchPaths` to (re)arm `FileChanged` hooks for files in the new
 * directory — e.g. watch `.envrc` or `.nvmrc` wherever the user goes.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface CwdChangedInput extends RawHookInput<'CwdChanged'> {
    old_cwd: string;
    new_cwd: string;
}

export interface CwdChangedEmitOptions extends CommonEmitOptions {
    /** Files to watch; changes fire `FileChanged` hooks. Maps to `hookSpecificOutput.watchPaths`. */
    watchPaths?: string[];
}

interface CwdChangedJsonOutput extends CommonJsonOutput {
    hookSpecificOutput?: { hookEventName: 'CwdChanged'; watchPaths: string[] };
}

export class CwdChanged {
    static parse(): CwdChangedInput {
        return readHookInput('CwdChanged') as CwdChangedInput;
    }

    static emitOutput(opts: CwdChangedEmitOptions = {}): never {
        const out = mixinCommon<CwdChangedJsonOutput>({}, opts);
        if (opts.watchPaths !== undefined) {
            out.hookSpecificOutput = { hookEventName: 'CwdChanged', watchPaths: opts.watchPaths };
        }
        return emitJson(out);
    }
}
