/**
 * ElicitationResult — runs after the user answers an MCP elicitation, before
 * the answer is sent back to the server.
 *
 * Observe the answer, or override it: `action` / `content` replace what the
 * user chose; `action: 'decline'` blocks the response, with `reason` as the
 * message.
 */

import { hasHookSpecificFields, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';
import type { ElicitationAction, ElicitationEmitOptions } from './Elicitation.js';

export interface ElicitationResultInput extends RawHookInput<'ElicitationResult'> {
    mcp_server_name: string;
    elicitation_id?: string;
    mode?: 'form' | 'url';
    /** What the user chose. */
    action: ElicitationAction;
    /** The values the user submitted. */
    content?: Record<string, unknown>;
}

export type ElicitationResultEmitOptions = ElicitationEmitOptions;

interface ElicitationResultHookSpecific {
    hookEventName: 'ElicitationResult';
    action?: ElicitationAction;
    content?: Record<string, unknown>;
}

interface ElicitationResultJsonOutput extends CommonJsonOutput {
    reason?: string;
    hookSpecificOutput?: ElicitationResultHookSpecific;
}

export class ElicitationResult {
    static parse(): ElicitationResultInput {
        return readHookInput('ElicitationResult') as ElicitationResultInput;
    }

    static emitOutput(opts: ElicitationResultEmitOptions = {}): never {
        const out = mixinCommon<ElicitationResultJsonOutput>({}, opts);
        if (opts.reason !== undefined) out.reason = opts.reason;

        const hs: ElicitationResultHookSpecific = { hookEventName: 'ElicitationResult' };
        if (opts.action !== undefined) hs.action = opts.action;
        if (opts.content !== undefined) hs.content = opts.content;
        if (hasHookSpecificFields(hs)) out.hookSpecificOutput = hs;

        return emitJson(out);
    }
}
