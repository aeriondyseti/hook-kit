/**
 * `hook-kit` — typed helpers for writing Claude Code hook scripts.
 *
 * Every hook event ships as a class with two static methods:
 *
 *   const input = PreToolUse.parse();          // read + typecheck stdin
 *   PreToolUse.emitOutput({ decision: 'deny' }); // serialize + exit(0)
 *
 * Input fields use snake_case (matching Claude Code's spec verbatim, so
 * what you read in the hook docs is what you type). Emit-option names use
 * camelCase — they're our API, mapped internally to the spec's JSON.
 *
 * Output formatting (colors, modifiers, future boxes/tables) is done
 * through `OutputBuilder`, which you can pass wherever a `toUser` or
 * `toClaude` option accepts a string.
 */

// Event classes + their input/option types.
export { Notification, type NotificationEmitOptions, type NotificationInput } from './events/Notification.js';
export { PostToolUse, type PostToolUseEmitOptions, type PostToolUseInput } from './events/PostToolUse.js';
export { PreCompact, type PreCompactEmitOptions, type PreCompactInput } from './events/PreCompact.js';
export { PreToolUse, type PreToolUseEmitOptions, type PreToolUseInput } from './events/PreToolUse.js';
export { SessionEnd, type SessionEndEmitOptions, type SessionEndInput } from './events/SessionEnd.js';
export { SessionStart, type SessionStartEmitOptions, type SessionStartInput } from './events/SessionStart.js';
export { Stop, type StopEmitOptions, type StopInput } from './events/Stop.js';
export { SubagentStop, type SubagentStopEmitOptions, type SubagentStopInput } from './events/SubagentStop.js';
export { UserPromptSubmit, type UserPromptSubmitEmitOptions, type UserPromptSubmitInput } from './events/UserPromptSubmit.js';

// Formatting primitives.
export {
    OutputBuilder,
    type BoxOptions,
    type DividerOptions,
    type ListOptions,
    type TableOptions,
} from './output/OutputBuilder.js';
export { currentTheme, setTheme, type Theme } from './formatting/theme.js';
export { renderTags, stripTags, visualWidth } from './formatting/tags.js';
export { ICONS, type IconName } from './formatting/icons.js';
export { COLORS, MODIFIERS, type ColorName, type ModifierName } from './formatting/vocab.js';

// Shared types.
export {
    HOOK_EVENT_NAMES,
    type CommonHookInput,
    type DecisionType,
    type HookEventName,
} from './common.js';
export { HookParseError } from './events/_parse.js';
export { runHook } from './runHook.js';
