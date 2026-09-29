# Immersive Light Sense (沉浸光感) and the Material System

Use this reference for HarmonyOS 7 / API 26 material, blur, and system-material questions, and whenever a project raises `targetSdkVersion` to 26.0.0.

## What it is

API 26.0.0 (HarmonyOS 7) introduces the **immersive light sense** material system (沉浸光感). It gives system-styled material treatment to dialogs, popups, menus, toasts, tips, sliders, toggles, selects, chips, and — inside specific containers — ordinary components.

Two things bite developers:

1. the material treatment is **enabled by default** for several component families when `targetSdkVersion >= 26.0.0`; and
2. the **effective scope was narrowed** in a 2026-09-03 behavior change, so a component that looked material-styled in Beta may not be styled after the change.

## Effective scope after the 2026-09-03 narrowing

**Applies only when `targetSdkVersion >= 26.0.0`.**

**Full-page / component-wide treatment — still applies everywhere:**

| Area | Covered |
|---|---|
| Dialog components | `AlertDialog`, `ActionSheet`, `CustomDialog`, `CalendarPickerDialog`, `DatePickerDialog`, `TimePickerDialog`, `TextPickerDialog`, `SelectionMenu`, `AlphabetIndexer` dialog, text `copyOption` menu |
| Dialog APIs | PromptAction, ArkUI_NativeDialog, `@ohos.promptAction`, Popup, Tips, menu control, half-modal transition |
| Controls | `Slider`, `Toggle`, `Select` |

**All other components — treatment applies only inside:**

- a `Navigation` / `NavDestination` **title bar**, or
- a `Tabs` **bottom TabBar** with `barPosition: BarPosition.End`.

So a `Toggle` or `Slider` anywhere gets material styling; a generic container or list page only gets it when it sits in one of those two containers. Do not promise full-page material on arbitrary components.

## Component-level configuration

- `systemMaterial` configuration exists on Toggle, Tips bubbles, Toast, dialogs, action menus, popups, custom dialogs, half-modal sheets, and Popup.
- `Chip` gains `backgroundSystemMaterial` and `activatedBackgroundSystemMaterial`.
- New components in this release are built on state management **V2**; combine with `@ObservedV2` / `@Trace` rather than V1 decorators.

## Disabling it

- Globally, via `metadata` named `ohos.arkui.UIMaterial.state` with value `disable`.
- Per component, via `uiMaterial.Material.empty`.

## Adaptation checklist

1. Confirm `targetSdkVersion` before diagnosing any material difference — below 26.0.0 none of this applies.
2. Check the container: title bar of `Navigation`/`NavDestination`, or a bottom `TabBar` with `barPosition: BarPosition.End`. Otherwise expect no material treatment.
3. Re-test visually after upgrading the SDK: the 2026-09-03 narrowing silently removes styling from components outside the listed scope.
4. If a design depends on a specific surface (for example a custom card that must stay flat), set the global `disable` metadata or `uiMaterial.Material.empty` explicitly instead of relying on defaults.
5. Keep the API 24 compatibility floor in mind: on API 24 devices these defaults do not exist, so verify the layout without material as well.

## Related APIs in earlier SDKs

The older visual-effect APIs are still useful and are **not** replaced by the material system: `backgroundBlurStyle`, `foregroundBlurStyle`, `backgroundEffect`, `blur` / `backdropBlur`, `backgroundBrightness`, and `uiEffect` filters. Two traps remain from the older documentation set:

- `pointLight` is a **System API** — not available to third-party apps.
- `hdsMaterial` / `systemMaterialEffect` belongs to the closed-source HarmonyOS Design System (HDS), not OpenHarmony; prefer the official `systemMaterial` configuration for API 26 work.

## Source and verification notes

- Official surfaces: https://developer.huawei.com/consumer/cn/doc/ and the API 26 changelog pages (`changelogs-in-26003`). The 2026-09-03 scope narrowing is documented in the API 26 behavior notes.
- Where a detail rests only on third-party mirrors of Huawei's announcement, it is described as **reported**. Re-verify per-component defaults against the installed SDK before making a UX promise.
