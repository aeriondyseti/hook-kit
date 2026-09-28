/**
 * WorktreeCreate — runs when Claude Code needs a worktree (`--worktree`,
 * `isolation: "worktree"`, background sessions). The hook *replaces* the
 * default `git worktree add`: create the directory however you like, then
 * report where it is.
 *
 *   const { name } = WorktreeCreate.parse();
 *   const path = createMyWorktree(name);
 *   WorktreeCreate.emitOutput({ worktreePath: path });
 *
 * The one event whose reply isn't JSON: command hooks print the bare path on
 * stdout, so `emitOutput` does exactly that. To fail creation, throw — any
 * non-zero exit fails it.
 */

import { emitText } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface WorktreeCreateInput extends RawHookInput<'WorktreeCreate'> {
    /** Suggested worktree name. */
    name: string;
}

export interface WorktreeCreateEmitOptions {
    /** Absolute path of the worktree you created. */
    worktreePath: string;
}

export class WorktreeCreate {
    static parse(): WorktreeCreateInput {
        return readHookInput('WorktreeCreate') as WorktreeCreateInput;
    }

    static emitOutput(opts: WorktreeCreateEmitOptions): never {
        return emitText(opts.worktreePath);
    }
}
