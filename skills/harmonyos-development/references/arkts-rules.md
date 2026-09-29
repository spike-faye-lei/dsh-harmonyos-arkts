# ArkTS Rules

Use this file for ArkTS syntax, TypeScript-to-ArkTS migration, and code review.

## Defaults

- Prefer `.ets` examples for HarmonyOS UI and ability code.
- Prefer explicit types over dynamic object shapes.
- Avoid generic TypeScript, DOM, React, Android, or Web-only advice unless the user explicitly asks for comparison.
- Include imports from `@kit.*` where possible.
- For ArkTS 1.2 / static ArkTS, ESObject, or ArkTS↔TypeScript interop questions, read `arkts-1.2-interop.md` and keep its ship-status caveat.

## Review checklist

- Strict typing is respected.
- State is not mutated through unsupported dynamic patterns.
- Async work is not placed in unsafe lifecycle positions.
- Classes used with `@ObjectLink` are marked with `@Observed`.
- Nullability and optional values are handled explicitly.
- API version assumptions and the `targetSdkVersion` gate are stated.
- In mixed ArkTS/TypeScript code, interop direction is legal (TypeScript/JavaScript → ArkTS is not allowed).

## Common output pattern

When generating implementation code, include:

1. File path suggestion.
2. ArkTS code.
3. Required config changes.
4. Integration notes.
5. API baseline notes.
