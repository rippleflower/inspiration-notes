# 灵感笔记

极简、离线优先的 Markdown 灵感笔记客户端，目标覆盖 Web、iOS 和 Android。

## Current Scope

This repository bootstraps milestone 1:

- Expo + React Native + TypeScript client for Web/iOS/Android.
- Local-first repository interfaces with Web IndexedDB and native SQLite adapters.
- Markdown editing with live preview.
- Built-in plugin registry primitives.
- CI for type checking, linting, tests, and Web export.

Automatic Supabase sync is planned for milestone 2.

## Tech Stack

- Client: Expo, React Native, Expo Router, TypeScript.
- State: Zustand.
- Markdown: `react-markdown` on Web and `react-native-markdown-display` on native.
- Storage: IndexedDB on Web, SQLite on iOS/Android, shared repository contract.
- Tests: Vitest.
- CI: GitHub Actions.

## Development

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build:web
pnpm --filter @inspiration-notes/client start
```

## Git Workflow

The default branch is `main`. Feature work happens on short-lived `feature/*` branches and is merged through pull requests after CI passes.
