/**
 * Shared emit-side helpers used by every event's `emitOutput`.
 *
 * - `asString(body)`: accept a string or a built-up `OutputBuilder`, return
 *   a plain string. Used for `toUser` / `toClaude` options.
 *
 * - `CommonEmitOptions` / `CommonJsonOutput`: the fields every Claude Code
 *   hook supports at the top level of the output JSON.
 *
 * - `mixinCommon(out, opts)`: apply those top-level common fields from an
 *   options object onto an output payload. Each event's `emitOutput` calls
 *   this first, then layers its event-specific fields on top.
 */

import { OutputBuilder } from '../output/OutputBuilder.js';

export function asString(body: string | OutputBuilder): string {
    return typeof body === 'string' ? body : body.render();
}

export interface CommonEmitOptions {
    /** Shown to the user in the Claude Code UI. Maps to `systemMessage`. */
    toUser?: string | OutputBuilder;
    /** Default true. Setting false tells Claude to stop entirely. */
    continue?: boolean;
    /** Shown when `continue: false`. */
    stopReason?: string;
    /** If true, hide the hook's stdout from the transcript. */
    suppressOutput?: boolean;
}

export interface CommonJsonOutput {
    systemMessage?: string;
    continue?: boolean;
    stopReason?: string;
    suppressOutput?: boolean;
}

export function mixinCommon<T extends CommonJsonOutput>(out: T, opts: CommonEmitOptions): T {
    if (opts.toUser !== undefined) out.systemMessage = asString(opts.toUser);
    if (opts.continue !== undefined) out.continue = opts.continue;
    if (opts.stopReason !== undefined) out.stopReason = opts.stopReason;
    if (opts.suppressOutput !== undefined) out.suppressOutput = opts.suppressOutput;
    return out;
}
