/**
 * DirectoryAdded — runs when a working directory is added mid-session, via
 * `/add-dir` or the SDK's `register_repo_root`. Observational.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface DirectoryAddedInput extends RawHookInput<'DirectoryAdded'> {
    /** Absolute path of the added directory. */
    directory: string;
    source: 'slash_command' | 'register_repo_root';
}

export type DirectoryAddedEmitOptions = CommonEmitOptions;

type DirectoryAddedJsonOutput = CommonJsonOutput;

export class DirectoryAdded {
    static parse(): DirectoryAddedInput {
        return readHookInput('DirectoryAdded') as DirectoryAddedInput;
    }

    static emitOutput(opts: DirectoryAddedEmitOptions = {}): never {
        const out = mixinCommon<DirectoryAddedJsonOutput>({}, opts);
        return emitJson(out);
    }
}
