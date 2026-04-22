# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
