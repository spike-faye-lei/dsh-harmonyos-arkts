# API 26.0.0 (HarmonyOS 7) — Released Baseline

Use this reference when the user targets **HarmonyOS 7 / API 26 / 26.0.0**, or when answering upgrade and adaptation questions. For the production default and the API 24 compatibility floor, read `platform-baseline.md` first.

## Status

- **API 26.0.0 Release: 2026-08-29.** It is a shipped Release SDK, not a Beta: Beta1 2026-06-12 (HDC 2026), Beta2 2026-07-28, Release 2026-08-29.
- API 26.0.0 is the API level of **HarmonyOS 7** (consumer release announced 2026-09-07; official upgrade opened 2026-09-28) and matches **OpenHarmony 7.0 Release**.
- As of 2026-09-30 no newer release is published (no 26.0.1, no 27.0.0); there is no API 25.
- Toolchain: DevEco Studio **26.0.0 Release (26.0.0.821)** with HarmonyOS SDK **26.0.0.105** (`Ohos_sdk_public 26.0.0.105`). System builds: **7.0.0.105 SP6** → **7.0.0.109 SP6**.
- Version format from 26.0.0: SemVer `X.Y.Z` replaces `X.Y.Z(N)`; `X` = major/adaptation-impacting, `Y` = new features, `Z` = fixes. Legacy ordering still holds: `26.0.0 > 6.1.1(24) > 6.1.0(23) > 6.0.2(22)`.

## How to answer API 26 questions

1. State that API 26.0.0 is a **Release**, and give the SDK/DevEco versions above.
2. Separate **always-effective** changes from changes gated by `targetSdkVersion >= 26.0.0`.
3. Keep the API 24 floor visible: if the project ships to un-upgraded devices, pair every API 26-only call with a runtime fallback.
4. Name the exact Kit and API; do not invent 26.0.0 signatures. If a signature is uncertain, mark the code as conceptual and point at the installed SDK docs.
5. Do not carry over wording from the Beta era ("preview only", "Beta SDK", "do not use in production").

## Adaptation-impacting changes

**Always effective after the SDK upgrade** (source: official API 26 behavior-change notes):

- Ability Kit: public package-change common events (`COMMON_EVENT_PACKAGE_ADDED`, `REMOVED`, `CHANGED`, `CACHE_CLEARED`).
- ArkTS/JSVM: Chromium/V8 core upgrade 132 → 144; async function type detection fixed; Wasm jitless default behavior; `fastConvertToJSObject` sibling-text preservation.
- ArkUI: `rawDeltaX`/`rawDeltaY` for mouse events; home `NavDestination` `queryNavDestinationInfo` / `onResult`; `@ReusableV2` dynamic reuse identifiers.
- ArkWeb: Chromium 132 → 144; the Cookie storage directory changed for all apps — audit any code that reads cookie files directly.
- Permissions: `ohos.permission.READ_IMAGEVIDEO` behavior, `getUidRxBytes` / `getUidTxBytes`, general permission-policy behavior.

**Effective only when `targetSdkVersion >= 26.0.0`:**

- In-House package-change event controls (`allowListenBundleChangedEvent` in `app.json5` for third-party listeners).
- ArkUI: `NodeAdapter.onAttachToNode`, `LayoutPolicy.matchParent`, `EmbeddedComponent` focus, `WithTheme`, `NODE_SWIPER_EVENT_ON_CONTENT_DID_SCROLL`, component shadow blur radius, attributed-string paragraph style with leading `CustomSpan` / `ImageAttachment`, `List` `onScrollVisibleContentChange` behavior.
- UX: minimum touch target for form controls grows 28vp → 32vp (Button / Button-style Toggle / Select / Chip / ChipGroup); built-in text line-breaking and small-language line height; immersive system material enabled by default for Dialog, Toast, AlphabetIndexer and the text selection menu; half-modal centered dialog max height.
- Permissions: the API 26 permission-policy changes.

## Breaking change: Agent Framework Kit

Only when `targetSdkVersion >= 26.0.0`:

- `OnDataCallback.method` changes enum type `AgentOperation` → `string`.
- `RequestContext.getClientSessionId()` is **removed**.

Review and migration rule: grep for `AgentOperation` and `getClientSessionId` when raising `targetSdkVersion` to 26.0.0. These are compile-time breaks, so they surface in the build, but only after the target SDK is raised — a project can compile clean at `targetSdkVersion 24` and fail immediately after the bump. See `ai-development-tools.md`.

## Other API 26 capability areas

- **Ability Kit**: `ModularObjectExtensionAbility` exposes app features as modular objects (C headers `modular_object_extension_ability.h`, `modular_object_extension_manager.h`); `AgentCard` (configure / parse / persist); ArkTS-script-based app Skill development and script management; autofill request info; `pluginBundleManager` for self-distributed plugins.
- **ArkUI**: components built on state management V2; **global reuse pool** for `@Reusable` / `@ReusableV2`; **standard floating windows**; on-demand module loading for indexing; 8-breakpoint UI preview in DevEco Studio.
- **Accessory Kit** (new), **AOD Navigation Kit** (always-on-display navigation), **Service Support Kit** (enterprise hardware inspection), **Service Collaboration Kit** (tap-to-connect), **AppGallery Kit** (pause downloads; Car-device capabilities), **Driver Development Kit** (user-mode USB drivers), **Enterprise Space Kit**, **Enterprise Data Guard Kit** (`getPolicy`, `isKia`), **Data Augmentation Kit**, **FAST Kit** (real FFT / inverse FFT, sequence prediction), **Preview Kit**, **PDF Kit** (custom rendering, binary-load, coordinate conversion), **Pen Kit** (stylus latency), **Ringtone Kit** (file-size limits), **XEngine Kit** (split-display for foldables, Vulkan AI super-resolution), **Spatial Recon Kit** (3DGS tiles), **Online Authentication Kit** (DID keys/credentials), **Scenario Fusion Kit**, **Accessibility Kit** (care mode), **Input Kit** (input-event injection), **Device Security Kit** (Star Shield risk engine, privacy controls for camera/microphone/location), **Core File Kit** (`UNCACHE`, recursive `listFileExt`, mmap, sandbox-directory sharing), **Core Vision Kit** (image super-resolution, text-semantic image search), **Graphics Accelerate Kit** (game prelaunch), **Notification Kit** (half-modal settings entry), **Live View Kit** (progress-ring template), **Remote Communication Kit** (`HttpVersionSelectCallback`, QUIC C API, TLCP, MPTCP), **NearLink Kit** (`startScan`), **NDK/JSVM** (`ArrayBuffer` from external memory).
- **New permission**: `ohos.permission.DEFAULT_WEB_BROWSER` — new default-browser gating. It takes effect in the release **after** 26.0.0, so do not gate current code on it; design the flow now, ship it later.

## Immersive light sense (沉浸光感)

API 26 introduces the `systemMaterial` material system, and its effective scope was **narrowed** on 2026-09-03. This is an adaptation trap: read `immersive-material.md` before advising on blur/material behavior and before raising `targetSdkVersion` to 26.0.0.

## Changelog document-ID pattern (official docs)

Huawei's API-26 changelog pages follow a version pattern that makes verification fast:

- Beta1 → `*-7001`
- Beta2 → `changelogs-in-26002`
- Release → `*-7003` / `changelogs-in-26003`

Use it to locate the authoritative note for any claim in this file.

## Source and verification notes

- Official entry points: https://developer.huawei.com/consumer/cn/doc/ (API reference), https://developer.huawei.com/consumer/cn/doc/harmonyos-releases/ (release notes), https://developer.huawei.com/consumer/cn/deveco-studio/ (IDE/SDK).
- Many official doc pages are JavaScript-rendered; page bodies are frequently not retrievable by tooling. Date/version details here were cross-checked against Huawei announcements as mirrored by third-party tech media. Where a detail rests only on a mirror, it is described as **reported**, not as an official specification.
- Do not encode rumoured versions (for example an "API 27") until an official release page exists.
