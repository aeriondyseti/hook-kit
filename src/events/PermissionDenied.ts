/**
 * PermissionDenied — runs when auto mode's classifier denies a tool call.
 *
 * Set `retry: true` to tell Claude it may try the call again (e.g. after
 * your hook has fixed whatever the classifier objected to). Ignored when the
 * classifier produced no verdict.
 */

import type { McpServerInfo } from '../common.js';
import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface PermissionDeniedInput extends RawHookInput<'PermissionDenied'> {
    tool_name: string;
    tool_input: Record<string, unknown>;
    tool_use_id: string;
    /** Why the call was denied. */
    reason: string;
    mcp_server?: McpServerInfo;
}

export interface PermissionDeniedEmitOptions extends CommonEmitOptions {
    /** Let Claude retry the denied call. Maps to `hookSpecificOutput.retry`. */
    retry?: boolean;
}

interface PermissionDeniedJsonOutput extends CommonJsonOutput {
    hookSpecificOutput?: { hookEventName: 'PermissionDenied'; retry: boolean };
}

export class PermissionDenied {
    static parse(): PermissionDeniedInput {
        return readHookInput('PermissionDenied') as PermissionDeniedInput;
    }

    static emitOutput(opts: PermissionDeniedEmitOptions = {}): never {
        const out = mixinCommon<PermissionDeniedJsonOutput>({}, opts);
        if (opts.retry !== undefined) {
            out.hookSpecificOutput = { hookEventName: 'PermissionDenied', retry: opts.retry };
        }
        return emitJson(out);
    }
}
