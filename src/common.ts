/**
 * Shared types + stdin read for all hook events.
 */
import { readFileSync } from 'node:fs';

export const HOOK_EVENT_NAMES = [
    'PreToolUse',
    'PostToolUse',
    'UserPromptSubmit',
    'SessionStart',
    'SessionEnd',
    'Stop',
    'SubagentStop',
    'Notification',
    'PreCompact',
] as const;

export type HookEventName = typeof HOOK_EVENT_NAMES[number];

export type DecisionType = 'allow' | 'deny' | 'ask';

/**
 * Common fields every hook receives. Keys match the Claude Code hook spec
 * verbatim (snake_case) so what you read in the docs is what you type.
 */
export interface CommonHookInput {
    hook_event_name: HookEventName;
    session_id: string;
    transcript_path: string;
    cwd: string;
    permission_mode?: string;
}

let _testStdin: string | undefined;

export function readStdinSync(): string {
    if (_testStdin !== undefined) return _testStdin;
    return readFileSync(0, 'utf8');
}

export function _setTestStdin(s: string): void {
    _testStdin = s;
}

export function _clearTestStdin(): void {
    _testStdin = undefined;
}
