/**
 * Stop — runs when Claude finishes responding.
 *
 * Two ways to keep Claude going:
 *   - `deny: true` + `reason` blocks the stop; `reason` tells Claude why it
 *     must continue. `stop_hook_active` lets you detect re-entry and avoid
 *     loops.
 *   - `toClaude` sends non-error feedback; the conversation continues so
 *     Claude can act on it, without the stop being treated as rejected.
 *
 * `background_tasks` / `session_crons` tell "done" apart from "paused until
 * background work or a scheduled wakeup resumes the session".
 */

import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

/** In-flight background work (shells, subagents, monitors, workflows). */
export interface BackgroundTask {
    id: string;
    /** e.g. `shell`, `subagent`, `monitor`, `workflow`. */
    type: string;
    status: string;
    description: string;
    /** `shell` tasks only. */
    command?: string;
    /** `subagent` tasks only. */
    agent_type?: string;
    /** MCP tasks only. */
    server?: string;
    /** MCP tasks only. */
    tool?: string;
    /** `workflow` tasks only. */
    name?: string;
}

/** A session-scoped scheduled wakeup (CronCreate, ScheduleWakeup, /loop). */
export interface SessionCron {
    id: string;
    /** Cron expression, e.g. `0 9 * * 1-5`. */
    schedule: string;
    /** False for one-shot wakeups. */
    recurring: boolean;
    prompt: string;
}

export interface StopInput extends RawHookInput<'Stop'> {
    stop_hook_active: boolean;
    /** Text of Claude's final message — saves parsing the transcript. */
    last_assistant_message?: string;
    background_tasks?: BackgroundTask[];
    session_crons?: SessionCron[];
}

export interface StopEmitOptions extends CommonEmitOptions {
    /** Non-error feedback for Claude; the conversation continues. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
    /** Prevent Claude from stopping. Maps to top-level `decision: "block"`. */
    deny?: boolean;
    /** Paired with `deny`; tells Claude why it must keep going. */
    reason?: string;
}

interface StopJsonOutput extends CommonJsonOutput {
    decision?: 'block';
    reason?: string;
    hookSpecificOutput?: { hookEventName: 'Stop'; additionalContext: string };
}

export class Stop {
    static parse(): StopInput {
        return readHookInput('Stop') as StopInput;
    }

    static emitOutput(opts: StopEmitOptions = {}): never {
        const out = mixinCommon<StopJsonOutput>({}, opts);
        if (opts.deny) out.decision = 'block';
        if (opts.reason !== undefined) out.reason = opts.reason;
        if (opts.toClaude !== undefined) {
            out.hookSpecificOutput = { hookEventName: 'Stop', additionalContext: asString(opts.toClaude) };
        }
        return emitJson(out);
    }
}
