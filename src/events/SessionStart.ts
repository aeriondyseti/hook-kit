/**
 * SessionStart — runs when a Claude Code session begins.
 *
 * `source` tells you which flavor of start this is — `startup`, `resume`,
 * `clear`, or `compact`. Scripts commonly branch on it to seed different
 * context (e.g. only inject TODO reminders on `startup`).
 *
 * No deny: there's no "session-start rejected" in the spec.
 */

import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface SessionStartInput extends RawHookInput<'SessionStart'> {
    source: 'startup' | 'resume' | 'clear' | 'compact';
    model: string;
    agent_type?: string;
}

export interface SessionStartEmitOptions extends CommonEmitOptions {
    /** Appended to Claude's session context. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
}

interface SessionStartHookSpecific {
    hookEventName: 'SessionStart';
    additionalContext?: string;
}

interface SessionStartJsonOutput extends CommonJsonOutput {
    hookSpecificOutput?: SessionStartHookSpecific;
}

export class SessionStart {
    static parse(): SessionStartInput {
        return readHookInput('SessionStart') as SessionStartInput;
    }

    static emitOutput(opts: SessionStartEmitOptions = {}): never {
        const out = mixinCommon<SessionStartJsonOutput>({}, opts);

        if (opts.toClaude !== undefined) {
            out.hookSpecificOutput = {
                hookEventName: 'SessionStart',
                additionalContext: asString(opts.toClaude),
            };
        }
        return emitJson(out);
    }
}
