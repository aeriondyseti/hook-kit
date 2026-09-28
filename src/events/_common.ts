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
 *
 * - `hasHookSpecificFields(hs)`: whether a `hookSpecificOutput` carries
 *   anything worth emitting.
 */

import { OutputBuilder } from '../output/OutputBuilder.js';

export function asString(body: string | OutputBuilder): string {
    return typeof body === 'string' ? body : body.render();
}

export interface CommonEmitOptions {
    /**
     * Shown to the user in the Claude Code UI. Maps to `systemMessage`,
     * with a leading newline prepended so the first row of formatted output
     * (a box's top border, a table header) doesn't render on the same line
     * as Claude Code's hook label.
     */
    toUser?: string | OutputBuilder;
    /** Default true. Setting false tells Claude to stop entirely. */
    continue?: boolean;
    /** Shown when `continue: false`. */
    stopReason?: string;
    /** If true, hide the hook's stdout from the transcript. */
    suppressOutput?: boolean;
    /**
     * Terminal escape sequence for Claude Code to emit on your behalf, e.g. an
     * OSC 9 desktop notification. Only OSC 0/1/2/9/99/777 and BEL survive.
     */
    terminalSequence?: string;
}

export interface CommonJsonOutput {
    systemMessage?: string;
    continue?: boolean;
    stopReason?: string;
    suppressOutput?: boolean;
    terminalSequence?: string;
}

/**
 * True once anything besides `hookEventName` has been set. Events build a
 * `hookSpecificOutput` unconditionally and attach it only when this holds,
 * so an empty emit stays `{}`.
 */
export function hasHookSpecificFields(hs: { hookEventName: string }): boolean {
    return Object.keys(hs).length > 1;
}

export function mixinCommon<T extends CommonJsonOutput>(out: T, opts: CommonEmitOptions): T {
    if (opts.toUser !== undefined) out.systemMessage = '\n' + asString(opts.toUser);
    if (opts.continue !== undefined) out.continue = opts.continue;
    if (opts.stopReason !== undefined) out.stopReason = opts.stopReason;
    if (opts.suppressOutput !== undefined) out.suppressOutput = opts.suppressOutput;
    if (opts.terminalSequence !== undefined) out.terminalSequence = opts.terminalSequence;
    return out;
}
