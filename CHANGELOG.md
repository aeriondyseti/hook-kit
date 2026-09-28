# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Synced with the Claude Code 2.1.283 hook schema.

### Added

- Common input fields: `prompt_id`, `agent_id`, `agent_type`, `effort`.
  `permission_mode` is now typed as `PermissionMode`.
- `terminalSequence` emit option on every event (OSC desktop notifications).
- `DecisionType` gains `'defer'`; `TestHookResult` gains `wasDeferred`.
- `PreToolUse` / `PostToolUse` inputs: `mcp_server`; `PostToolUse` also
  gets `duration_ms`.
- `PostToolUse.emitOutput({ updatedToolOutput })` — replaces the output of
  any tool, not just MCP tools.
- `UserPromptSubmit`: `source` / `session_title` inputs;
  `suppressOriginalPrompt` / `sessionTitle` emit options.
- `SessionStart`: `session_title` and resume/fork cache-cost inputs;
  `initialUserMessage`, `sessionTitle`, `watchPaths`, `reloadSkills` emit
  options.
- `Stop` / `SubagentStop`: `last_assistant_message`, `background_tasks`,
  `session_crons` inputs, and a `toClaude` emit option (non-blocking
  feedback that keeps the turn going).
- `Notification`: `toClaude` emit option.
- Exported types: `OpenUnion`, `PermissionMode`, `EffortLevel`,
  `McpServerInfo`, `NotificationType`, `BackgroundTask`, `SessionCron`.

### Changed

- `Notification.notification_type` is now an open union (known values
  autocomplete; newer ones still type-check). Claude Code has added eight
  values since 1.0.0.

### Deprecated

- `PostToolUse`'s `updatedMCPToolOutput` — use `updatedToolOutput`.

### Fixed

Input types that didn't match what Claude Code sends. These can surface as
new compile errors in code that relied on the old (wrong) shapes:

- `SessionStartInput.model` is optional; `source` includes `'fork'`.
- `SessionEndInput.reason` includes `'resume'`.
- `SubagentStopInput` includes the always-present `agent_id`,
  `agent_type`, and `agent_transcript_path`.
- `PreCompactInput.custom_instructions` is `string | null` and always
  present.

## [1.0.0] - 2026-04-22

### Added

- Nine event classes (`PreToolUse`, `PostToolUse`, `UserPromptSubmit`,
  `SessionStart`, `SessionEnd`, `Stop`, `SubagentStop`, `Notification`,
  `PreCompact`) with `parse()` / `emitOutput()` static methods.
- `OutputBuilder` with `append`, `appendLine`, `appendDivider`,
  `appendList`, `appendBox`, `appendTable` — all chainable, all
  theme-aware at render time.
- Tag markup renderer (`<color:"red">`, `<bg:"yellow">`, `<bold>`,
  `<dim>`, `<italic>`, `<underline>`) with `renderTags`, `stripTags`,
  `visualWidth` primitives.
- `ICONS` constants: `check cross warn info arrow bullet dot star`.
- `HookParseError` for structured parse failures; `runHook(fn)` opt-in
  helper that catches it and writes to stderr + exits(2) per hook
  protocol.
- `@aeriondyseti/hook-kit/testing` subpath with:
  - `testHook(input, runner)` — drives parse → emit against synthetic
    input, captures the emitted payload.
  - Nine `mockXxx(overrides?)` factories, one per event.
  - Normalized `TestHookResult` fields: `wasDenied`, `wasAllowed`,
    `wasAsked`, `toUser`, `toClaude`.
- `examples/hooks/` — five runnable dogfood hooks with colocated tests
  showing deny / allow / ask / `updatedInput` / context-injection
  patterns.

[1.0.0]: https://github.com/aeriondyseti/hook-kit/releases/tag/v1.0.0
