# Biome Workflow in harvest-moon

> Last updated: 2026-05-14

This project uses [Biome](https://biomejs.dev/) as the primary local tool for
formatting, import sorting, and day-to-day linting. ESLint is kept as a temporary
secondary check while Biome's React and Next.js rule coverage continues to mature.

---

## Installation

Biome is installed as an exact project dev dependency:

```bash
pnpm add -D @biomejs/biome@2.4.15 --save-exact
```

Do not rely on a global Biome install. Run Biome through the project scripts or
through `pnpm exec biome` so every machine uses the same version.

Install the VS Code / Cursor extension **Biome** (`biomejs.biome`) for editor
formatting, diagnostics, safe fixes, and import sorting.

---

## Local Workflow

Use these project scripts:

```bash
# Read-only format, lint, and import-sorting check
pnpm check

# Format, sort imports, and apply safe fixes
pnpm check:write

# Format only
pnpm format

# Format-only read check
pnpm format:check

# Biome lint only
pnpm lint:biome

# ESLint fallback only
pnpm lint:eslint

# Biome lint followed by ESLint fallback
pnpm lint

# Full local quality gate
pnpm quality
```

For normal development:

1. Let the editor format, apply safe fixes, and sort imports on save.
2. Run `pnpm check` before reviewing a diff.
3. Run `pnpm check:write` when you want Biome to update files.
4. Run `pnpm quality` before handing off broader changes.

---

## Configuration

### `biome.json`

Key project choices:

- Formatter enabled with 2-space indentation and 100-character line width.
- Linter enabled with rules migrated from the old Next.js ESLint setup.
- Assist enabled for import organization.
- Git integration enabled with `.gitignore` support and `main` as the default branch.
- Unknown files ignored so broad commands can safely run at the repo root.
- Tailwind CSS v4 directives enabled through `css.parser.tailwindDirectives`.
- Generated Payload files such as `src/payload-types.ts` and migration JSON snapshots excluded from Biome processing.

### `.vscode/settings.json`

Workspace settings use Biome as the default formatter and enable explicit save-time
Biome actions:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.biome": "explicit",
    "source.organizeImports": "never",
    "source.organizeImports.biome": "explicit"
  }
}
```

### `.vscode/extensions.json`

The repo recommends the `biomejs.biome` extension so VS Code and Cursor users get
the expected editor behavior.

### `.zed/settings.json`

Zed is already configured to use the Biome language server for JavaScript,
TypeScript, and TSX formatting, safe fixes, and import sorting.

---

## ESLint Fallback

`eslint.config.mjs`, `eslint`, and `eslint-config-next` intentionally remain in
the project. Biome is the primary workflow, but ESLint still covers rules that
Biome does not yet implement.

Current fallback commands:

```bash
pnpm lint:eslint
pnpm lint
pnpm quality
```

Re-check the gap after one or two Biome upgrades with a dry-run migration audit:

```bash
pnpm exec biome migrate eslint --include-inspired
```

Do not add `--write` for routine audits. The existing Biome config is now curated,
and the migration command may propose duplicated or noisy config changes.

Remove ESLint only when the remaining unsupported rules are covered by Biome or
when the team intentionally accepts the lost coverage.

---

## Automation Later

This rollout is local-first. There is no pre-commit hook and no GitHub Actions
quality workflow yet.

Once the local workflow feels trustworthy, the next candidates are:

```bash
# Lightweight staged check hook
biome check --staged --files-ignore-unknown=true --no-errors-on-unmatched
```

or a GitHub Actions workflow that runs:

```bash
pnpm quality
```

Do not wire Biome into the Vercel build path yet. Keep deploy builds focused on
deployment until the local quality gate has settled.

---

## References

- [Getting Started](https://biomejs.dev/guides/getting-started/)
- [Configure Biome](https://biomejs.dev/guides/configure-biome/)
- [VCS Integration](https://biomejs.dev/guides/integrate-in-vcs/)
- [Migrate from ESLint and Prettier](https://biomejs.dev/guides/migrate-eslint-prettier/)
- [VS Code Extension](https://biomejs.dev/reference/vscode/)
- [Continuous Integration](https://biomejs.dev/recipes/continuous-integration/)
- [Versioning](https://biomejs.dev/internals/versioning/)
