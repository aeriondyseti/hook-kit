/**
 * WorktreeRemove — runs when a worktree is removed (at session exit or on
 * deletion). The counterpart to `WorktreeCreate`: clean up whatever that
 * hook set up. Observational; removal can't be blocked.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface WorktreeRemoveInput extends RawHookInput<'WorktreeRemove'> {
    worktree_path: string;
}

export type WorktreeRemoveEmitOptions = CommonEmitOptions;

type WorktreeRemoveJsonOutput = CommonJsonOutput;

export class WorktreeRemove {
    static parse(): WorktreeRemoveInput {
        return readHookInput('WorktreeRemove') as WorktreeRemoveInput;
    }

    static emitOutput(opts: WorktreeRemoveEmitOptions = {}): never {
        const out = mixinCommon<WorktreeRemoveJsonOutput>({}, opts);
        return emitJson(out);
    }
}
