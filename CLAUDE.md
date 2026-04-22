# Working on hook-kit

Guidance for future contributors — human or AI — about how this project is
built. Short. Opinionated. Read it before you start.

## Development loop

Build one feature at a time. For anything bigger than a one-line fix:

1. **Propose the shape** in prose before writing code. Name the inputs,
   outputs, and the 2–3 decisions that could go either way. Get sign-off.
2. **Implement** — source file first, then colocated `*.test.ts`.
3. **Run `npm test` and `npx tsc --noEmit`** — green before moving on.
4. **Run the simplify analysis** (below). Fix anything it turns up.
5. **Mark the phase done** and propose the next.

Don't batch four features into one PR. Phase-by-phase keeps the review
surface small and surfaces bad designs while they're cheap to change.

## The simplify analysis

After each major component, read the diff with fresh eyes and answer:

> Is this the simplest method of implementing this that actually solves the
> use case? The goal is to lower the bar for a newbie (or an AI agent) to
> contribute — without sacrificing that it satisfies the requirements.

Concrete checks:

- **Reuse**: does this duplicate something in the codebase? Search before
  writing new utilities.
- **Redundant state**: any cached value that could be derived, or any state
  that duplicates existing state?
- **Parameter sprawl**: would a zero-config call work? Are any options
  unused in the common case?
- **Stringly-typed**: are enum-like strings actual unions? Would a typo be
  a compile error?
- **Copy-paste**: near-duplicate blocks that want a shared helper?
- **Nested conditionals**: ternary chains or if/else deeper than 2 levels?
  Flatten with early returns or a lookup.
- **Comments**: every comment explains *why*, not *what*. If removing it
  wouldn't confuse a future reader, delete it.
- **Newbie test**: could someone reading this file for the first time
  predict the output from the inputs without reading the body twice?

Finish with a one-sentence **trade-offs avoided** line so the *intentional*
omissions are visible (goes in TECH-DEBT if it's a real deferral).

## Design discipline

- **Surface alternatives, even when requirements feel fixed.** Before
  building, name at least one other shape and why the chosen one wins.
  Throwing vs returning a discriminated union for parse errors is the
  classic example — both were viable, throw won on Node idioms.
- **YAGNI.** Cut speculative features. A v1 with `left-align-only` tables
  ships; a v1 with alignment/wrap/row-separators/ASCII-fallback doesn't.
  Deferred work goes in `ROADMAP.md` (future features) or `TECH-DEBT.md`
  (shortcuts in live code) — never "I'll remember."
- **SRP over convenience.** Pure parser that throws beats a parser that
  also writes to stderr and exits. If the caller needs the exit behavior,
  give them a thin wrapper (`runHook`) to opt in.
- **Consistency matters more than it looks.** If `appendLine` and
  `appendDivider` mutate the buffer, then `list` / `box` / `table` should
  wear the same `append` prefix. Spot drift early; rename is cheap pre-1.0.
- **Check the archive before reinventing.** The `__ARCHIVE__/` folder
  (gitignored) holds the pre-refactor code. If you're solving a problem
  the prototype already solved — terminal-width detection, tag grammar,
  stdin reading — audit there first.

## Coding conventions

- **Method signatures**: positional primary input, trailing options bag.
  `list(items, { bullet, indent })` beats `list({ content, bullet, indent })`.
  Switch to a full option bag only when ≥2 inputs genuinely compete for
  primacy.
- **Exceptional cases throw; expected outcomes return.** `HookParseError`
  extends `Error`; happy paths return a typed result.
- **Constants beat parsers** for inert vocab. `ICONS.check` is better than
  `<icon:"check">` — typo-proof, no grammar to learn, works anywhere.
- **Tests live next to source.** `src/foo/bar.ts` → `src/foo/bar.test.ts`.
  Vitest picks them up from `src/**/*.test.ts` and `examples/**/*.test.ts`.
- **Input field names match Claude Code's spec verbatim** (snake_case).
  Our option names (emit, tests, helpers) are camelCase.
- **No `as unknown as T` casts.** They're a code smell — fix the abstraction
  instead. Use a generic (`testHook<P>`), narrow through a well-typed
  internal, or change the underlying type.
- **4-space indent**, ESM-only, Node 20+. `exactOptionalPropertyTypes` +
  `noUncheckedIndexedAccess` are on — honor them.

## When you finish something

- Green tests, clean typecheck (both `tsc --noEmit` at the root and
  `tsc -p examples/tsconfig.json` if you touched examples).
- Intentional shortcuts → `TECH-DEBT.md` with file path + revisit trigger.
- Future ideas → `ROADMAP.md` with motivation.
- User-visible changes → `CHANGELOG.md` under `[Unreleased]`.

## Release

Semver + [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

1. Bump `package.json` version.
2. Move `[Unreleased]` entries to a dated `[x.y.z]` section in CHANGELOG.
3. `npm run build && npm test && npx tsc --noEmit`.
4. `npm pack --dry-run` — review the file list.
5. Commit as `Release x.y.z`, tag `vx.y.z`.
6. `npm publish && git push origin main --follow-tags` (user runs this).

## Memory and this file

`CLAUDE.md` is project-wide process. Personal preferences or per-machine
overrides live in `CLAUDE.local.md` (gitignored). Don't conflate the two —
what ships here is what every collaborator signs up for.
