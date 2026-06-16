# ADR-0002: Use Platform Storage Behind a Repository Contract

## Status

Accepted

## Context

The client must open quickly and work offline. Expo SQLite Web support is not mature enough to be the single storage layer for all targets.

## Decision

Expose a shared `NoteRepository` contract. Use IndexedDB on Web, SQLite on iOS/Android, and an in-memory implementation for tests and non-platform fallbacks.

## Consequences

### Positive

- Offline behavior is available before Supabase sync.
- Platform differences are isolated from the UI and domain logic.
- Repository contract tests can be reused across adapters.

### Negative

- Two persistent adapters must be maintained.
- Sync in milestone 2 must reconcile local adapter metadata consistently.

## Alternatives Considered

- Single SQLite adapter for all platforms: rejected due to Web maturity risk.
- Server-only storage: rejected because it fails offline-first requirements.
