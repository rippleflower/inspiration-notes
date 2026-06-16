# ADR-0001: Use Expo for the Three-Platform Client

## Status

Accepted

## Context

The product must support Web, iOS, and Android with a small codebase, fast startup, and a simple Markdown-first editing experience.

## Decision

Use Expo, React Native, Expo Router, and TypeScript for the client. Keep UI dependencies light and put product logic in shared workspace packages.

## Consequences

### Positive

- One client codebase covers the target platforms.
- Expo gives predictable local development and CI scripts.
- Shared packages keep notes, plugins, and storage contracts testable outside the app.

### Negative

- Platform storage still needs separate adapters.
- Some Markdown rendering behavior differs between Web and native.

## Alternatives Considered

- Separate native apps: rejected due to higher implementation and maintenance cost.
- Tauri desktop app: rejected because the confirmed platforms are Web, iOS, and Android.
