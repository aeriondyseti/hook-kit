/**
 * `hook-kit/testing` — drive an event's parse → emit flow against a synthetic
 * input, without touching real stdin/stdout or calling `process.exit`.
 *
 * The harness installs two seams that already exist in the library:
 *
 *   1. `_setTestStdin` overrides `readStdinSync` to return a fixed JSON string.
 *   2. `_setEmitCapture` makes `emitJson` store the payload in a slot and
 *      throw a sentinel instead of writing + exiting.
 *
 * Parse failures surface naturally: `readHookInput` throws `HookParseError`,
 * which propagates out of `testHook` for the caller to inspect. Both seams
 * are cleared in `finally`, so a throwing runner can't leave them dangling.
 *
 * Usage:
 *
 *   const { payload } = testHook(
 *     { hook_event_name: 'PreToolUse', session_id: 's', transcript_path: '/t', cwd: '/', tool_name: 'Bash', tool_input: { command: 'rm -rf /' }, tool_use_id: 'x' },
 *     () => {
 *       const input = PreToolUse.parse();
 *       if (String(input.tool_input.command).includes('rm -rf /')) {
 *         PreToolUse.emitOutput({ decision: 'deny', reason: 'no' });
 *       } else {
 *         PreToolUse.emitOutput({});
 *       }
 *     },
 *   );
 *   expect(payload.hookSpecificOutput?.permissionDecision).toBe('deny');
 */

import { _clearTestStdin, _setTestStdin, type HookEventName } from './common.js';
import {
    _CAPTURED_SENTINEL,
    _clearEmitCapture,
    _setEmitCapture,
} from './events/_emit.js';
import type { NotificationInput } from './events/Notification.js';
import type { PostToolUseInput } from './events/PostToolUse.js';
import type { PreCompactInput } from './events/PreCompact.js';
import type { PreToolUseInput } from './events/PreToolUse.js';
import type { SessionEndInput } from './events/SessionEnd.js';
import type { SessionStartInput } from './events/SessionStart.js';
import type { StopInput } from './events/Stop.js';
import type { SubagentStopInput } from './events/SubagentStop.js';
import type { UserPromptSubmitInput } from './events/UserPromptSubmit.js';

export { HookParseError } from './events/_parse.js';

export interface TestHookResult<P = unknown> {
    /** The raw JSON that `emitOutput` would have written to stdout. */
    payload: P;
    /** The exit code the real hook would have used (usually 0). */
    exitCode: number;

    /**
     * True if the hook's emit signaled a deny — either a tri-state
     * `permissionDecision: 'deny'` (PreToolUse) or a top-level
     * `decision: 'block'` (PostToolUse, UserPromptSubmit, Stop, SubagentStop,
     * PreCompact).
     */
    wasDenied: boolean;
    /**
     * True if the hook's emit signaled allow — either an explicit
     * `permissionDecision: 'allow'`, or no blocking/ask signal at all
     * (an empty emit means "let it proceed").
     */
    wasAllowed: boolean;
    /** True if `permissionDecision === 'ask'` (PreToolUse only). */
    wasAsked: boolean;

    /** Shortcut to `payload.systemMessage` — what the user will see. */
    toUser: string | undefined;
    /**
     * Shortcut to whatever the hook told Claude: the first of
     * `hookSpecificOutput.additionalContext`,
     * `hookSpecificOutput.permissionDecisionReason`, or top-level `reason`.
     */
    toClaude: string | undefined;
}

interface NormalizablePayload {
    systemMessage?: string;
    decision?: string;
    reason?: string;
    hookSpecificOutput?: {
        permissionDecision?: string;
        permissionDecisionReason?: string;
        additionalContext?: string;
    };
}

function summarize(payload: unknown): Omit<TestHookResult, 'payload' | 'exitCode'> {
    const p = (payload ?? {}) as NormalizablePayload;
    const permissionDecision = p.hookSpecificOutput?.permissionDecision;
    const wasDenied = permissionDecision === 'deny' || p.decision === 'block';
    const wasAsked = permissionDecision === 'ask';
    const wasAllowed =
        permissionDecision === 'allow' || (!wasDenied && !wasAsked);

    return {
        wasDenied,
        wasAllowed,
        wasAsked,
        toUser: p.systemMessage,
        toClaude:
            p.hookSpecificOutput?.additionalContext ??
            p.hookSpecificOutput?.permissionDecisionReason ??
            p.reason,
    };
}

export function testHook<P = unknown>(
    input: object,
    runner: () => void,
): TestHookResult<P> {
    const slot: { payload?: unknown; exitCode?: number } = {};
    _setTestStdin(JSON.stringify(input));
    _setEmitCapture(slot);

    try {
        try {
            runner();
        } catch (e) {
            // The emit sentinel means the runner successfully emitted and
            // "exited" — swallow it. Anything else (HookParseError, a bug in
            // the hook body, whatever) propagates to the caller.
            if (e !== _CAPTURED_SENTINEL) throw e;
        }
    } finally {
        _clearTestStdin();
        _clearEmitCapture();
    }

    if (slot.payload === undefined) {
        throw new Error('testHook: runner did not call emitOutput');
    }
    return {
        payload: slot.payload as P,
        exitCode: slot.exitCode ?? 0,
        ...summarize(slot.payload),
    };
}

/**
 * Input factories — each builds a valid, minimally-plausible input for the
 * corresponding event with overrides layered on top.
 *
 *   const input = mockPreToolUse({ tool_name: 'Write', tool_input: { file_path: '/x' } });
 *
 * Overrides are typed as `Partial<Input>`, so typos are compile errors.
 */

function commonDefaults<N extends HookEventName>(name: N) {
    return {
        hook_event_name: name,
        session_id: 'test-session',
        transcript_path: '/tmp/test-transcript.jsonl',
        cwd: '/tmp',
    } as const;
}

export function mockNotification(overrides: Partial<NotificationInput> = {}): NotificationInput {
    return {
        ...commonDefaults('Notification'),
        message: 'test notification',
        notification_type: 'idle_prompt',
        ...overrides,
    };
}

export function mockPostToolUse(overrides: Partial<PostToolUseInput> = {}): PostToolUseInput {
    return {
        ...commonDefaults('PostToolUse'),
        tool_name: 'Bash',
        tool_input: {},
        tool_response: {},
        tool_use_id: 'test-tool-use-id',
        ...overrides,
    };
}

export function mockPreCompact(overrides: Partial<PreCompactInput> = {}): PreCompactInput {
    return {
        ...commonDefaults('PreCompact'),
        trigger: 'auto',
        ...overrides,
    };
}

export function mockPreToolUse(overrides: Partial<PreToolUseInput> = {}): PreToolUseInput {
    return {
        ...commonDefaults('PreToolUse'),
        tool_name: 'Bash',
        tool_input: {},
        tool_use_id: 'test-tool-use-id',
        ...overrides,
    };
}

export function mockSessionEnd(overrides: Partial<SessionEndInput> = {}): SessionEndInput {
    return {
        ...commonDefaults('SessionEnd'),
        reason: 'other',
        ...overrides,
    };
}

export function mockSessionStart(overrides: Partial<SessionStartInput> = {}): SessionStartInput {
    return {
        ...commonDefaults('SessionStart'),
        source: 'startup',
        model: 'claude-opus-4-7',
        ...overrides,
    };
}

export function mockStop(overrides: Partial<StopInput> = {}): StopInput {
    return {
        ...commonDefaults('Stop'),
        stop_hook_active: false,
        ...overrides,
    };
}

export function mockSubagentStop(overrides: Partial<SubagentStopInput> = {}): SubagentStopInput {
    return {
        ...commonDefaults('SubagentStop'),
        stop_hook_active: false,
        ...overrides,
    };
}

export function mockUserPromptSubmit(overrides: Partial<UserPromptSubmitInput> = {}): UserPromptSubmitInput {
    return {
        ...commonDefaults('UserPromptSubmit'),
        prompt: 'test prompt',
        ...overrides,
    };
}
