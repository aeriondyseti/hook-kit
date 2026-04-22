# Roadmap

Ideas captured for a future release. Nothing here is committed or
scheduled — open an issue if you want to push any of these up the stack.

## OutputBuilder

### Table alignment

`appendTable` is left-aligned only. If someone needs right-aligned numbers
or centered headers, add:

```ts
type Alignment = 'left' | 'right' | 'center';
builder.appendTable(rows, { align: ['left', 'right', 'right'] });
```

### Table row separators

Today we only draw a separator below the header. Some datasets read better
with a separator after every row (small, dense tables) or after every N
rows (striped long tables). A `separator?: 'header' | 'all' | number` opt
would cover both.

### Box ASCII fallback

Box-drawing characters render fine in Claude Code's UI, but a
`theme.unicode = false` path that swaps to `+`, `-`, `|` corners would help
if hook output is ever piped to a plain-text log.

### Multi-line items in `appendList`

Items with embedded newlines currently produce weirdly-aligned continuation
lines. A wrap policy (`wrap?: 'indent' | 'truncate'`) would fix it without
forcing every caller to pre-format.

## Icons

Wider name coverage (`warning`, `error`, `success`, `pending`, `running`,
`spinner` frames) as users hit them. The current set is intentionally
small — add names when a real use case asks for them.

## Tags

### Same-kind nesting

`<color:"red">..<color:"blue">..</color>..</color>` doesn't restore the
outer color after the inner close — the renderer always emits the default
foreground on `</color>`. A stack-based parser would fix it; today it's
called out in `tags.ts` and cross-kind nesting (`<bold><color>`) works
fine.

### User-registered colors

256-color or truecolor palette via `<color:"#ff00aa">` or named registration
(`registerColor('brand', '#ff00aa')`). Keeps the current 16-color vocab as
the default.

## Events

Richer input typing for `tool_input` / `tool_response` on PreToolUse and
PostToolUse. Today they're `Record<string, unknown>` / `unknown` —
accurate but unhelpful. A `ToolInputs` union keyed on `tool_name` would let
users write `if (input.tool_name === 'Bash') { input.tool_input.command }`
without a cast. Would need ongoing maintenance as Claude Code adds tools.

## Testing

### Subprocess runner

`runHookScript(path, input)` that spawns the real script file, feeds
stdin, collects stdout and exit code. Useful for integration tests that
want to verify the full script wiring (shebang, imports, emit). Costs a
subprocess per test, so it's opt-in on top of the in-process `testHook`.

### Snapshot helpers

The rendered `toUser` output is the thing a reviewer actually looks at. A
`stripAnsi(result.toUser)` + snapshot pattern is easy to hand-roll; a
dedicated helper might still be worth it.

## Documentation

- A dedicated doc on the hook protocol (exit codes, emit shapes,
  decision semantics) so library users don't have to cross-reference
  Claude Code's docs for every field.
- More examples for the "quiet" events (`Notification`, `PreCompact`,
  `SessionEnd`, `Stop`, `SubagentStop`) if they turn out to have
  non-obvious use cases beyond logging.
