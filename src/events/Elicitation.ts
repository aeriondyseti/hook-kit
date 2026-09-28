/**
 * Elicitation — runs when an MCP server asks the user for input mid-tool-call.
 *
 * Answer it programmatically instead of showing the dialog:
 *
 *   Elicitation.emitOutput({ action: 'accept', content: { env: 'staging' } });
 *   Elicitation.emitOutput({ action: 'decline', reason: 'not allowed from CI' });
 *
 * Emit nothing to let the user answer as usual. `requested_schema` is the
 * JSON schema `content` must satisfy (form mode); `url` is set in URL mode.
 */

import { hasHookSpecificFields, mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export type ElicitationAction = 'accept' | 'decline' | 'cancel';

export interface ElicitationInput extends RawHookInput<'Elicitation'> {
    mcp_server_name: string;
    message: string;
    mode?: 'form' | 'url';
    url?: string;
    elicitation_id?: string;
    requested_schema?: Record<string, unknown>;
}

export interface ElicitationEmitOptions extends CommonEmitOptions {
    /** Respond on the user's behalf. Maps to `hookSpecificOutput.action`. */
    action?: ElicitationAction;
    /** The form values to send with `accept`. Maps to `hookSpecificOutput.content`. */
    content?: Record<string, unknown>;
    /** With `decline`, the message reported back. */
    reason?: string;
}

interface ElicitationHookSpecific {
    hookEventName: 'Elicitation';
    action?: ElicitationAction;
    content?: Record<string, unknown>;
}

interface ElicitationJsonOutput extends CommonJsonOutput {
    reason?: string;
    hookSpecificOutput?: ElicitationHookSpecific;
}

export class Elicitation {
    static parse(): ElicitationInput {
        return readHookInput('Elicitation') as ElicitationInput;
    }

    static emitOutput(opts: ElicitationEmitOptions = {}): never {
        const out = mixinCommon<ElicitationJsonOutput>({}, opts);
        if (opts.reason !== undefined) out.reason = opts.reason;

        const hs: ElicitationHookSpecific = { hookEventName: 'Elicitation' };
        if (opts.action !== undefined) hs.action = opts.action;
        if (opts.content !== undefined) hs.content = opts.content;
        if (hasHookSpecificFields(hs)) out.hookSpecificOutput = hs;

        return emitJson(out);
    }
}
