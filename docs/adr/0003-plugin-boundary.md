# ADR-0003: Keep Plugins Built-In for Milestone 1

## Status

Accepted

## Context

The product needs extensibility, but third-party plugin execution introduces sandboxing, permissions, signing, and compatibility concerns.

## Decision

Milestone 1 exposes an internal plugin registry for commands, Markdown transforms, preview extensions, and import/export extensions. Only bundled plugins are loaded.

## Consequences

### Positive

- Extensibility points are designed early.
- The app avoids remote code execution risk.
- Built-in plugins can be tested like normal application code.

### Negative

- Users cannot install arbitrary third-party plugins in milestone 1.

## Alternatives Considered

- Third-party local plugins: rejected for milestone 1 due to security and compatibility cost.
- Plugin marketplace: rejected as out of scope for the bootstrap release.
