/**
 * TaskCompleted — runs when a task is being marked completed.
 *
 * Set `deny: true` to keep the task open (e.g. tests still fail); `reason`
 * tells Claude what's missing.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';
import type { TaskInfo } from './TaskCreated.js';

export interface TaskCompletedInput extends RawHookInput<'TaskCompleted'>, TaskInfo {}

export interface TaskCompletedEmitOptions extends CommonEmitOptions {
    /** Keep the task open. Maps to top-level `decision: "block"`. */
    deny?: boolean;
    /** Paired with `deny`; tells Claude what's missing. */
    reason?: string;
}

interface TaskCompletedJsonOutput extends CommonJsonOutput {
    decision?: 'block';
    reason?: string;
}

export class TaskCompleted {
    static parse(): TaskCompletedInput {
        return readHookInput('TaskCompleted') as TaskCompletedInput;
    }

    static emitOutput(opts: TaskCompletedEmitOptions = {}): never {
        const out = mixinCommon<TaskCompletedJsonOutput>({}, opts);
        if (opts.deny) out.decision = 'block';
        if (opts.reason !== undefined) out.reason = opts.reason;
        return emitJson(out);
    }
}
