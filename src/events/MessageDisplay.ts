/**
 * MessageDisplay — runs with each batch of newly completed lines while an
 * assistant message streams to the screen.
 *
 * Display-only: `displayContent` replaces the `delta` on screen (redact a
 * token, restyle a line) without changing the stored message Claude sees.
 * Runs on every flush, so keep it fast.
 */

import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface MessageDisplayInput extends RawHookInput<'MessageDisplay'> {
    turn_id: string;
    /** Stable across every flush of the same message. Not the API `msg_…` id. */
    message_id: string;
    /** Zero-based flush index within the message. */
    index: number;
    /** True on the message's last flush. */
    final: boolean;
    /** Lines completed since the previous flush. Whole lines, except possibly on the final flush. */
    delta: string;
}

export interface MessageDisplayEmitOptions extends CommonEmitOptions {
    /** Text shown in place of `delta`. Maps to `hookSpecificOutput.displayContent`. */
    displayContent?: string;
}

interface MessageDisplayJsonOutput extends CommonJsonOutput {
    hookSpecificOutput?: { hookEventName: 'MessageDisplay'; displayContent: string };
}

export class MessageDisplay {
    static parse(): MessageDisplayInput {
        return readHookInput('MessageDisplay') as MessageDisplayInput;
    }

    static emitOutput(opts: MessageDisplayEmitOptions = {}): never {
        const out = mixinCommon<MessageDisplayJsonOutput>({}, opts);
        if (opts.displayContent !== undefined) {
            out.hookSpecificOutput = { hookEventName: 'MessageDisplay', displayContent: opts.displayContent };
        }
        return emitJson(out);
    }
}
