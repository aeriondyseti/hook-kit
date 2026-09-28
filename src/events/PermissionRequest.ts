/**
 * PermissionRequest — runs when a permission dialog is about to be shown.
 *
 * Answer it on the user's behalf, or emit nothing to let the dialog appear:
 *
 *   PermissionRequest.emitOutput({ decision: 'allow' });
 *   PermissionRequest.emitOutput({ decision: 'deny', reason: 'not on main', interrupt: true });
 *
 * Unlike `PreToolUse`, this only fires when a prompt would actually be
 * shown, so it can't see calls that settings already allow. The options are
 * a discriminated union on `decision`: `updatedInput` / `updatedPermissions`
 * only type-check with `allow`, `reason` / `interrupt` only with `deny`.
 */

import type { McpServerInfo, PermissionUpdate } from '../common.js';
import { mixinCommon, type CommonEmitOptions, type CommonJsonOutput } from './_common.js';
import { emitJson } from './_emit.js';
import { readHookInput, type RawHookInput } from './_parse.js';

export interface PermissionRequestInput extends RawHookInput<'PermissionRequest'> {
    tool_name: string;
    tool_input: Record<string, unknown>;
    /** The "always allow" options the dialog would offer. */
    permission_suggestions?: PermissionUpdate[];
    mcp_server?: McpServerInfo;
}

interface PermissionRequestNoDecision {
    decision?: undefined;
}

interface PermissionRequestAllow {
    /** Approve the call without showing the dialog. */
    decision: 'allow';
    /** Replace the tool's input before it runs. */
    updatedInput?: Record<string, unknown>;
    /** Apply permission changes, e.g. one of `permission_suggestions`. */
    updatedPermissions?: PermissionUpdate[];
}

interface PermissionRequestDeny {
    /** Reject the call without showing the dialog. */
    decision: 'deny';
    /** Tells Claude why. Maps to `decision.message`. */
    reason?: string;
    /** Stop Claude's turn instead of letting it try something else. */
    interrupt?: boolean;
}

export type PermissionRequestEmitOptions = CommonEmitOptions &
    (PermissionRequestNoDecision | PermissionRequestAllow | PermissionRequestDeny);

type PermissionRequestDecision =
    | { behavior: 'allow'; updatedInput?: Record<string, unknown>; updatedPermissions?: PermissionUpdate[] }
    | { behavior: 'deny'; message?: string; interrupt?: boolean };

interface PermissionRequestJsonOutput extends CommonJsonOutput {
    hookSpecificOutput?: { hookEventName: 'PermissionRequest'; decision: PermissionRequestDecision };
}

function toDecision(opts: PermissionRequestEmitOptions): PermissionRequestDecision | undefined {
    if (opts.decision === 'allow') {
        const d: PermissionRequestDecision = { behavior: 'allow' };
        if (opts.updatedInput !== undefined) d.updatedInput = opts.updatedInput;
        if (opts.updatedPermissions !== undefined) d.updatedPermissions = opts.updatedPermissions;
        return d;
    }
    if (opts.decision === 'deny') {
        const d: PermissionRequestDecision = { behavior: 'deny' };
        if (opts.reason !== undefined) d.message = opts.reason;
        if (opts.interrupt !== undefined) d.interrupt = opts.interrupt;
        return d;
    }
    return undefined;
}

export class PermissionRequest {
    static parse(): PermissionRequestInput {
        return readHookInput('PermissionRequest') as PermissionRequestInput;
    }

    static emitOutput(opts: PermissionRequestEmitOptions = {}): never {
        const out = mixinCommon<PermissionRequestJsonOutput>({}, opts);
        const decision = toDecision(opts);
        if (decision) out.hookSpecificOutput = { hookEventName: 'PermissionRequest', decision };
        return emitJson(out);
    }
}
