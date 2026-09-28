/**
 * TaskCreated — runs when a task is created with the `TaskCreate` tool.
 *
 * Set `deny: true` to reject the task (e.g. it lacks acceptance criteria);
 * `reason` tells Claude what to fix.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

/** Fields shared by `TaskCreated` and `TaskCompleted`. */
export interface TaskInfo {
    task_id: string;
    task_subject: string;
    task_description?: string;
    /** Set when the task belongs to an agent-team teammate. */
    teammate_name?: string;
    /** @deprecated Sessions have a single implicit team; Claude Code will remove this. */
    team_name?: string;
}

export interface TaskCreatedInput extends RawHookInput<'TaskCreated'>, TaskInfo {}

export interface TaskCreatedEmitOptions extends CommonEmitOptions {
    /** Reject the task. Maps to top-level `decision: "block"`. */
    deny?: boolean;
    /** Paired with `deny`; tells Claude why. */
    reason?: string;
}

interface TaskCreatedJsonOutput extends CommonJsonOutput {
    decision?: 'block';
    reason?: string;
}

export class TaskCreated {
    static parse(): TaskCreatedInput {
        return readHookInput('TaskCreated') as TaskCreatedInput;
    }

    static emitOutput(opts: TaskCreatedEmitOptions = {}): never {
        const out = mixinCommon<TaskCreatedJsonOutput>({}, opts);
        if (opts.deny) out.decision = 'block';
        if (opts.reason !== undefined) out.reason = opts.reason;
        return emitJson(out);
    }
}
