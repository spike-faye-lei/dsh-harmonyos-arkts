# HarmonyOS Skill Reference Loading Guide

This directory contains supporting reference files for the `harmonyos-development` skill.

The root `SKILL.md` remains the discovery entry. These files are loaded only when the user request needs deeper guidance.

## Intent routing

| User intent | Read first | Then read |
|---|---|---|
| Version, SDK, DevEco Studio, API baseline | `platform-baseline.md` | `api26.md` for API 26.0.0 / HarmonyOS 7 detail |
| API 26.0.0 upgrade, adaptation, breaking changes, new kits | `api26.md` | `immersive-material.md` for material behavior, `native-api-compatibility.md` for the API 24 floor |
| Blur, material, 沉浸光感, dialog styling | `immersive-material.md` | `arkui-components.md` |
| ArkTS 1.2 / static ArkTS, ESObject, TS interop | `arkts-1.2-interop.md` | `arkts-rules.md` |
| DevEco Code/CLI, Agent Framework, app Skill, Intents, A2A | `ai-development-tools.md` | `api26.md` for the Agent Framework Kit break |
| ArkTS syntax or TypeScript migration | `arkts-rules.md` | `../examples/*.ets` |
| ArkUI layout, components, rendering | `arkui-components.md` | `state-management.md` |
| Native C/C++ API availability across OS versions | `native-api-compatibility.md` | `build-sign-release.md` |
| Stage model lifecycle | `stage-model.md` | `../recipes/debug-build-error.md` |
| Navigation and page stack | `navigation.md` | `state-management.md` |
| State decorators and data flow | `state-management.md` | `arkts-rules.md` |
| Permissions and privacy prompts | `permissions.md` | `../examples/permission-request.ets` |
| Build, CI, signing, packaging, release | `build-sign-release.md` | `platform-baseline.md` |
| Performance and large lists | `performance.md` | `../examples/lazyforeach-list.ets` |

## Production default

- **Production default: API 26.0.0 (HarmonyOS 7, Release 2026-08-29).**
- **Compatibility floor: API 24 (HarmonyOS 6.1.1 Release)** for devices that have not upgraded. Keep `compatibleSdkVersion` as low as the product requires.
- API 26.0.0 is a Release, not a preview. Do not describe HarmonyOS 7 as preview-only.
- Distinguish always-effective API 26 changes from changes gated by `targetSdkVersion >= 26.0.0`.
