# ArkTS 1.2 (Static Typing) and Interop Boundaries

Use this reference when the user asks about ArkTS 1.2, static ArkTS, "ArkTS 1.1 vs 1.2", ESObject, or interop between ArkTS and TypeScript/JavaScript.

> **Status caveat (checked 2026-09-30):** ArkTS 1.2 is documented in the ArkTS/OpenHarmony upstream material, but **it could not be confirmed from Huawei's HarmonyOS documentation that ArkTS 1.2 is enabled or shipping in HarmonyOS 26.0.0**. Present it as "documented upstream; HarmonyOS ship status unconfirmed", and tell the user to check the ArkTS version actually reported by their installed SDK before relying on it.

## What ArkTS 1.2 is

- Official naming: **ArkTS 1.2**, as opposed to ArkTS 1.0/1.1 (the current ArkTS used by HarmonyOS app development).
- It adds a static type system and concurrency model with its own compiler and runtime.
- Official adaptation guide heading: 从ArkTS1.1到ArkTS1.2的适配指导.
- It is **not** a drop-in replacement for ArkTS 1.1: the language restrictions and the interop rules below change how existing code must be written.

## Interop direction rules

| Direction | Allowed |
|---|---|
| ArkTS 1.2 → ArkTS 1.1 / TypeScript / JavaScript | Yes |
| ArkTS 1.1 → ArkTS 1.2 | Yes |
| TypeScript / JavaScript → ArkTS 1.2 (or 1.1) | **No** |

Consequences:

- A 1.2 module may call into 1.1/TS/JS code; the reverse direction is not supported, so a mixed project must keep the 1.2 code at the leaves or behind a 1.2-side boundary.
- JavaScript interop must go through explicit **ESObject** calls.

## Type ladder and mapping

- Ladder: `undefined`, `null`, `AnyObject` (internal) → `Object` → `ESObject`.
- TypeScript → ArkTS 1.2 mapping: `any`, `symbol`, `unknown`, `Function`, and the utility types `Pick` / `Omit` / `ReturnType` map to `ESObject`.
- Numeric mapping: `int`, `long`, `double`, `float`, `byte` → `number`; `char` → `string`.

## ESObject

`ESObject` is the dynamic-interop escape hatch. Its capability surface covers loading, wrapping, reading and writing properties, instantiation, invocation (including method invocation), and conversion to string/number.

> Do **not** encode exact ESObject method signatures. The upstream interop documentation is internally inconsistent about method names (for example `getProperty` / `setProperty` versus `getPropertyByName` / `setPropertyByName`). Describe the capability and have the user confirm names against their installed SDK.

## Object and typing restrictions

- **Object layout is immutable**: properties cannot be added, removed, or retyped after construction; doing so is a compile-time or runtime error.
- 1.2 objects have **no own properties** and are sealed; `Object` and `Reflect` behave differently from TypeScript — do not port reflection-based code unchanged.
- **No dynamic import** in ArkTS 1.2; use ESObject-based interop instead.
- `catch` accepts only `Error` instances. TypeScript-thrown values arrive wrapped in an `ESError`; unwrap with its value accessor rather than casting the caught object.
- Existing patterns to audit before migration: dynamic property access, `Object.keys` / `Object.assign` reshaping, prototype patching, and anything relying on structural typing.

## Features that cannot participate in interop

These 1.2-only features cannot cross an interop boundary:

- overload declarations, annotations, `final`, trailing closures, and functions declared with a receiver;
- `@Sendable` and `@Concurrent`;
- TypeScript decorators and call signatures.

**Exception:** ArkUI decorators are special-cased — they map to ArkTS 1.2 annotations, so existing ArkUI components are not automatically invalidated.

## How to answer

1. Ask what ArkTS version the project's SDK/toolchain reports before recommending 1.2 code.
2. Keep the ship-status caveat visible; do not claim HarmonyOS 26.0.0 enables ArkTS 1.2.
3. Describe ESObject by capability, never by an invented signature.
4. For migration reviews, prioritize the interop direction rule, immutable object layout, dynamic import removal, and the `catch` change — those are the four that break real code.
5. Keep the recommendation conservative for production apps: continue with ArkTS 1.1 (the `.ets` model documented in the main skill) unless the project explicitly targets 1.2.

## Source and verification notes

- Upstream ArkTS documentation (arkts-* guides) and the ArkTS 1.1 → 1.2 adaptation guide; HarmonyOS-side enablement is unconfirmed as of 2026-09-30.
- Official HarmonyOS doc entry: https://developer.huawei.com/consumer/cn/doc/ (ArkTS guides).
