# Platform Baseline

## Default policy

- Production default: **HarmonyOS 26.0.0 / API 26.0.0** — API 26.0.0 was released on **2026-08-29** (Beta1 2026/06/12, Beta2 2026/07/28). It is the API level marketed as **HarmonyOS 7** (consumer release announced 2026-09-07; staged official upgrade opened 2026-09-28) and matches OpenHarmony 7.0 Release.
- **Compatibility floor: API 24 (HarmonyOS 6.1.1 Release, 2026-05-26).** New apps should target API 26.0.0 while setting `compatibleSdkVersion` as low as the product actually supports — API 24 is the practical floor for broad device coverage.
- API 23 (HarmonyOS 6.1.0, 2026-04-20) is now a legacy maintenance baseline only.
- API 26.0.0 is **not** a preview/Beta any more. Do not describe HarmonyOS 7 / API 26 as preview-only, and do not refuse to use API 26 APIs in production answers.
- Device share at the API 26.0.0 release: **API 24 ≈ 84.93%**, **API 26.0.0 ≈ 4.65%** (reported figure, not an official Huawei specification sheet). That is the reason to keep a low `compatibleSdkVersion`, not a reason to treat API 26 as unreleased.
- As of 2026-09-30 no release newer than 26.0.0 is published (no 26.0.1, no 27.0.0). There is no API 25.

## Version-number format (changed at 26.0.0)

Starting with API **26.0.0**, HarmonyOS developer kit API versions use SemVer `X.Y.Z` and drop the legacy `X.Y.Z(N)` form:

- `X` — major version with substantial capabilities or adaptation-impacting changes;
- `Y` — minor version with new capabilities (mostly backward compatible);
- `Z` — compatible fixes and small improvements.

The old parenthetical `N` was the OpenHarmony base API level. Compatibility ordering is still linear:

`26.0.0 > 6.1.1(24) > 6.1.0(23) > 6.0.2(22)`

## Toolchain

| Baseline | DevEco Studio | HarmonyOS SDK | Notes |
|---|---|---|---|
| API 26.0.0 Release | **26.0.0 Release (26.0.0.821)** | **26.0.0.105** (`Ohos_sdk_public 26.0.0.105`) | 2026-08-29 |
| API 26.0.0 Beta2 | 26.0.0 Beta2 (26.0.0.621) | 26.0.0.32 | 2026-07-28, superseded |
| API 26.0.0 Beta1 | 26.0.0 Beta1 (26.0.0.461) | 26.0.0.23 | 2026-06-12, superseded |
| API 24 Release | 6.1.1 Release (6.1.1.280) | 6.1.1 Release (`Ohos_sdk_public 6.1.1.125`) | Hvigor 6.24.2, ohpm 6.1.2.268 |

System builds: HarmonyOS **7.0.0.105 SP6** (2026-08-28) → **7.0.0.109 SP6**. AGC remote-device cloud debugging can filter by API 26 or system version `7.0.0.105` / `7.0.0.109` for compatibility validation.

## Answering rules

1. If the user does not provide a target SDK, assume **API 26.0.0 for new code** and ask for `compatibleSdkVersion` before recommending APIs that do not exist on older devices.
2. Keep the API 24 compatibility floor in mind for anything that must run on the un-upgraded majority: state the floor explicitly, and prefer `APIAVAILABLE`-guarded native calls and runtime feature checks over unconditional API 26 usage.
3. Separate **always-effective** API 26 changes from changes that only apply when `targetSdkVersion >= 26.0.0`. Raising `targetSdkVersion` is a behavior decision, not a cosmetic change.
4. For debugging, request or inspect:
   - DevEco Studio version
   - `compileSdkVersion`
   - `compatibleSdkVersion` / `targetSdkVersion`
   - `module.json5`
   - `oh-package.json5`
   - full build error log
5. Never describe API 26 capabilities as unreleased, and never recommend API 26-only APIs to a project whose `compatibleSdkVersion` cannot support them without a fallback.

## Source and verification notes

- Official release/download surfaces: https://developer.huawei.com/consumer/cn/deveco-studio/ and https://developer.huawei.com/consumer/cn/sdk
- Many `developer.huawei.com/consumer/*/doc/...` pages are JavaScript-rendered, so their body text is often not retrievable programmatically. Version/date claims in this file were cross-checked against Huawei's own announcements as mirrored by third-party tech media; where a detail rests only on a mirror, treat it as **reported** rather than as an official specification, and re-verify against the installed SDK before publishing code.
- The earlier note that DevEco Studio and Command Line Tools move from Node.js 18 to Node.js 24 could **not** be verified against an official Huawei source (checked 2026-09-30). Treat it as unverified until confirmed; use the Node.js version bundled with the installed Command Line Tools.
