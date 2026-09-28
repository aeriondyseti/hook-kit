/**
 * InstructionsLoaded — runs when a CLAUDE.md or `.claude/rules/*.md` file is
 * loaded into context. Observational: audit which instructions a session
 * actually saw, and why (`load_reason`).
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface InstructionsLoadedInput extends RawHookInput<'InstructionsLoaded'> {
    file_path: string;
    memory_type: 'User' | 'Project' | 'Local' | 'Managed';
    load_reason: 'session_start' | 'nested_traversal' | 'path_glob_match' | 'include' | 'compact';
    /** For `path_glob_match`: the rule's globs. */
    globs?: string[];
    /** The file whose access triggered the load. */
    trigger_file_path?: string;
    /** For `include`: the file that included this one. */
    parent_file_path?: string;
}

export type InstructionsLoadedEmitOptions = CommonEmitOptions;

type InstructionsLoadedJsonOutput = CommonJsonOutput;

export class InstructionsLoaded {
    static parse(): InstructionsLoadedInput {
        return readHookInput('InstructionsLoaded') as InstructionsLoadedInput;
    }

    static emitOutput(opts: InstructionsLoadedEmitOptions = {}): never {
        const out = mixinCommon<InstructionsLoadedJsonOutput>({}, opts);
        return emitJson(out);
    }
}
