# @aeriondyseti/hook-kit

Ergonomic, typed helpers for writing [Claude Code](https://docs.claude.com/en/docs/claude-code) hook scripts.

- One class per hook event with two static methods: `parse()` reads and
  validates stdin, `emitOutput()` writes the response JSON and exits.
- A small `OutputBuilder` for styled multi-line text — boxes, tables, lists,
  dividers, icons, colors via tag markup.
- A testing subpath (`@aeriondyseti/hook-kit/testing`) with `testHook`,
  `mockXxx` input factories, and normalized result fields so you can assert
  `result.wasDenied` instead of spelunking the payload.

## Install

```bash
npm install @aeriondyseti/hook-kit
```

Requires Node 20+. ESM-only.

## A minimal hook

```ts
#!/usr/bin/env node
import { PreToolUse, runHook } from '@aeriondyseti/hook-kit';

runHook(() => {
    const input = PreToolUse.parse();
    const cmd = String((input.tool_input as { command?: unknown }).command ?? '');

    if (/\brm\b.*-rf?\s+\//.test(cmd)) {
        PreToolUse.emitOutput({
            decision: 'deny',
            reason: 'Refusing dangerous rm on the filesystem root.',
        });
    }

    PreToolUse.emitOutput({});
});
```

Wire it up in your `settings.json`:

```json
{
    "hooks": {
        "PreToolUse": [
            { "matcher": "Bash", "hooks": [{ "type": "command", "command": "node /path/to/pre-tool-use.ts" }] }
        ]
    }
}
```

## Styled output

```ts
import { ICONS, OutputBuilder, PostToolUse } from '@aeriondyseti/hook-kit';

const toUser = new OutputBuilder()
    .appendBox(`${ICONS.check} ${input.tool_name}`, { title: '● PostToolUse', color: 'green' })
    .appendTable(rows, { headers: ['key', 'value'], color: 'green' });

PostToolUse.emitOutput({ toUser });
```

Colors and modifiers also work via inline tags:

```ts
builder.appendLine('<color:"red"><bold>boom</bold></color>');
```

Available icons: `check cross warn info arrow bullet dot star`.
Available colors: `black red green yellow blue magenta cyan white gray`.
Available modifiers: `bold dim italic underline`.

## Testing your hooks

```ts
import { describe, expect, it } from 'vitest';
import { PreToolUse } from '@aeriondyseti/hook-kit';
import { mockPreToolUse, testHook } from '@aeriondyseti/hook-kit/testing';
import { handle } from './pre-tool-use.js';

it('denies rm -rf', () => {
    const result = testHook(
        mockPreToolUse({ tool_name: 'Bash', tool_input: { command: 'rm -rf /' } }),
        () => handle(PreToolUse.parse()),
    );
    expect(result.wasDenied).toBe(true);
    expect(result.toClaude).toContain('rm');
});
```

`TestHookResult` carries normalized fields so you don't have to walk the
payload yourself:

| Field          | Meaning                                                                    |
| -------------- | -------------------------------------------------------------------------- |
| `wasDenied`    | `permissionDecision === 'deny'` or top-level `decision === 'block'`        |
| `wasAllowed`   | explicit allow, or no blocking/ask signal at all                           |
| `wasAsked`     | `permissionDecision === 'ask'`                                             |
| `toUser`       | `payload.systemMessage`                                                    |
| `toClaude`     | `additionalContext` → `permissionDecisionReason` → top-level `reason`      |

Negative paths (malformed stdin, wrong `hook_event_name`) surface as a
thrown `HookParseError`:

```ts
expect(() => testHook(wrongEvent, () => PreToolUse.parse())).toThrow(HookParseError);
```

## Examples

Runnable dogfood hooks with colocated tests live in
[`examples/hooks/`](examples/hooks). Each hook exports a pure `handle(input)`
function so its policy is testable without touching stdin, with an
`import.meta.url` guard that drives the real parse/emit only when run as a
script.

| Hook                                                             | Shows                                                       |
| ---------------------------------------------------------------- | ----------------------------------------------------------- |
| [`pre-tool-use.ts`](examples/hooks/pre-tool-use.ts)              | Deny branch, `OutputBuilder` with box + table, icons        |
| [`pre-tool-use-advanced.ts`](examples/hooks/pre-tool-use-advanced.ts) | `decision: 'ask'` and `updatedInput` rewrites               |
| [`post-tool-use.ts`](examples/hooks/post-tool-use.ts)            | Binary `deny: true`, `toClaude` context injection           |
| [`user-prompt-submit.ts`](examples/hooks/user-prompt-submit.ts)  | Prompt-level deny, divider + list                           |
| [`session-start.ts`](examples/hooks/session-start.ts)            | Context-injection pattern (no deny concept)                 |

## Project direction

- [`ROADMAP.md`](ROADMAP.md) — features under consideration for future
  releases.
- [`CHANGELOG.md`](CHANGELOG.md) — release history, [Keep a Changelog]
  format.
- [`TECH-DEBT.md`](TECH-DEBT.md) — known shortcuts and the context behind
  them, so contributors know what's intentional vs. what's waiting.

## License

MIT.

[Keep a Changelog]: https://keepachangelog.com/en/1.1.0/
