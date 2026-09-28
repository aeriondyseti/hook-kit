/**
 * FileChanged — runs when a watched file changes on disk. Files are watched
 * via the hook's matcher or `watchPaths` returned by `SessionStart`,
 * `CwdChanged`, or an earlier `FileChanged`.
 *
 * Return `watchPaths` to update the watch list.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface FileChangedInput extends RawHookInput<'FileChanged'> {
    file_path: string;
    event: 'change' | 'add' | 'unlink';
}

export interface FileChangedEmitOptions extends CommonEmitOptions {
    /** Files to watch. Maps to `hookSpecificOutput.watchPaths`. */
    watchPaths?: string[];
}

interface FileChangedJsonOutput extends CommonJsonOutput {
    hookSpecificOutput?: { hookEventName: 'FileChanged'; watchPaths: string[] };
}

export class FileChanged {
    static parse(): FileChangedInput {
        return readHookInput('FileChanged') as FileChangedInput;
    }

    static emitOutput(opts: FileChangedEmitOptions = {}): never {
        const out = mixinCommon<FileChangedJsonOutput>({}, opts);
        if (opts.watchPaths !== undefined) {
            out.hookSpecificOutput = { hookEventName: 'FileChanged', watchPaths: opts.watchPaths };
        }
        return emitJson(out);
    }
}
