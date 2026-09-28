/**
 * SessionStart — runs when a Claude Code session begins.
 *
 * `source` tells you which flavor of start this is — `startup`, `resume`,
 * `clear`, `compact`, or `fork`. Scripts commonly branch on it to seed
 * different context (e.g. only inject TODO reminders on `startup`).
 *
 * No deny: there's no "session-start rejected" in the spec.
 */

import type { OutputBuilder } from '../output/OutputBuilder.js';
import { asString, hasHookSpecificFields, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface SessionStartInput extends RawHookInput<'SessionStart'> {
    source: 'startup' | 'resume' | 'clear' | 'compact' | 'fork';
    model?: string;
    session_title?: string;
    /** resume/fork only: seconds since the resumed transcript's last assistant response. */
    seconds_since_last_response?: number;
    /** resume/fork only: tokens the first request will re-send. */
    context_tokens?: number;
    /** resume/fork only: the prompt cache has likely expired, so `context_tokens` will be re-cached. */
    prompt_cache_likely_expired?: boolean;
    /** resume/fork only: estimated USD cost of re-caching `context_tokens`. */
    estimated_cache_write_usd?: number;
}

export interface SessionStartEmitOptions extends CommonEmitOptions {
    /** Appended to Claude's session context. Maps to `hookSpecificOutput.additionalContext`. */
    toClaude?: string | OutputBuilder;
    /** Submitted as the session's first user message. */
    initialUserMessage?: string;
    /** Set the session's title. */
    sessionTitle?: string;
    /** Files to watch; changes fire `FileChanged` hooks. */
    watchPaths?: string[];
    /** Re-scan skill directories after SessionStart hooks finish, so skills this hook installed are usable immediately. */
    reloadSkills?: boolean;
}

interface SessionStartHookSpecific {
    hookEventName: 'SessionStart';
    additionalContext?: string;
    initialUserMessage?: string;
    sessionTitle?: string;
    watchPaths?: string[];
    reloadSkills?: boolean;
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

        const hs: SessionStartHookSpecific = { hookEventName: 'SessionStart' };
        if (opts.toClaude !== undefined) hs.additionalContext = asString(opts.toClaude);
        if (opts.initialUserMessage !== undefined) hs.initialUserMessage = opts.initialUserMessage;
        if (opts.sessionTitle !== undefined) hs.sessionTitle = opts.sessionTitle;
        if (opts.watchPaths !== undefined) hs.watchPaths = opts.watchPaths;
        if (opts.reloadSkills !== undefined) hs.reloadSkills = opts.reloadSkills;
        if (hasHookSpecificFields(hs)) out.hookSpecificOutput = hs;

        return emitJson(out);
    }
}
