/**
 * Shared types + stdin read for all hook events.
 */
import { readFileSync } from 'node:fs';

/** Every hook event Claude Code fires, in the order its schema lists them. */
export const HOOK_EVENT_NAMES = [
    'PreToolUse',
    'PostToolUse',
    'PostToolUseFailure',
    'PostToolBatch',
    'Notification',
    'UserPromptSubmit',
    'UserPromptExpansion',
    'SessionStart',
    'SessionEnd',
    'Stop',
    'StopFailure',
    'SubagentStart',
    'SubagentStop',
    'PreCompact',
    'PostCompact',
    'PreModelSwitch',
    'PostModelSwitch',
    'PermissionRequest',
    'PermissionDenied',
    'Setup',
    'TeammateIdle',
    'TaskCreated',
    'TaskCompleted',
    'Elicitation',
    'ElicitationResult',
    'ConfigChange',
    'WorktreeCreate',
    'WorktreeRemove',
    'InstructionsLoaded',
    'CwdChanged',
    'FileChanged',
    'DirectoryAdded',
    'MessageDisplay',
] as const;

export type HookEventName = typeof HOOK_EVENT_NAMES[number];

/**
 * `defer` pauses a headless (`-p`) run with the call preserved so an Agent
 * SDK wrapper can decide; interactive sessions ignore it.
 */
export type DecisionType = 'allow' | 'deny' | 'ask' | 'defer';

/**
 * A union of the values Claude Code sends today that still accepts any
 * string. Claude Code types these fields as plain strings and adds values
 * between releases, so a closed union would reject real input.
 */
export type OpenUnion<T extends string> = T | (string & {});

export type PermissionMode = OpenUnion<
    'default' | 'acceptEdits' | 'bypassPermissions' | 'plan' | 'dontAsk' | 'auto'
>;

export type EffortLevel = OpenUnion<'low' | 'medium' | 'high' | 'xhigh' | 'max'>;

/** The MCP server behind an `mcp__*` tool. Absent for built-in tools. */
export interface McpServerInfo {
    /** The server's config key. */
    name: string;
    source: OpenUnion<
        'sdk' | 'plugin' | 'user' | 'project' | 'local' | 'dynamic' | 'managed' | 'enterprise' | 'claudeai' | 'agent'
    >;
}

export type PermissionRuleBehavior = 'allow' | 'deny' | 'ask';

export type PermissionDestination = 'userSettings' | 'projectSettings' | 'localSettings' | 'session' | 'cliArg';

export interface PermissionRule {
    toolName: string;
    ruleContent?: string;
}

/**
 * A change to permission settings — what "always allow" in the permission
 * dialog applies. `PermissionRequest` receives these as suggestions and can
 * return them as `updatedPermissions`.
 */
export type PermissionUpdate =
    | { type: 'addRules' | 'replaceRules' | 'removeRules'; rules: PermissionRule[]; behavior: PermissionRuleBehavior; destination: PermissionDestination }
    | { type: 'setMode'; mode: PermissionMode; destination: PermissionDestination }
    | { type: 'addDirectories' | 'removeDirectories'; directories: string[]; destination: PermissionDestination };

/**
 * Common fields every hook receives. Keys match the Claude Code hook spec
 * verbatim (snake_case) so what you read in the docs is what you type.
 */
export interface CommonHookInput {
    hook_event_name: HookEventName;
    session_id: string;
    transcript_path: string;
    cwd: string;
    /** Correlates every event from one user prompt until the next. Absent before the first prompt. */
    prompt_id?: string;
    permission_mode?: PermissionMode;
    /** Present only inside a subagent. Use this, not `agent_type`, to tell subagent calls from main-thread calls. */
    agent_id?: string;
    /** Present inside a subagent, or on the main thread of a `--agent` session. */
    agent_type?: string;
    /** Present for tool-context events on models that support effort. */
    effort?: { level: EffortLevel };
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
