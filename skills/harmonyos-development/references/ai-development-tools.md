# HarmonyOS AI Development Tools

Use this reference for DevEco Code, DevEco CLI, Agent Framework Kit, app Skills, Intents Kit, A2A, and HarmonyOS 7 AI-assisted development questions.

## Tool selection

| Need | Prefer |
|---|---|
| Full IDE editing, preview, profiling, signing, emulator, and graphical debugging | DevEco Studio |
| Agent-led HarmonyOS implementation and iterative build/run/verify/fix workflows | DevEco Code |
| Scriptable project, build, check, device, and debugging actions for Agents or CI/CD | DevEco CLI |
| General-purpose third-party coding Agent | Its native workflow plus DevEco CLI/Hvigor/HDC and this skill |

DevEco Code is a HarmonyOS-focused coding Agent, while DevEco CLI is the execution layer designed for command-line automation and Agent invocation. Neither changes the production baseline: **API 26.0.0 (HarmonyOS 7) is a Release SDK since 2026-08-29**, and API 24 remains the compatibility floor for devices that have not upgraded.

## Agent capability boundaries

| Capability | Purpose |
|---|---|
| Agent Framework Kit | Let an app actively launch system Agent combinations through UI controls |
| Intents Kit | Declare app or atomic-service functions as system-recognizable intents |
| ArkTS script-based app Skill | Expose app business capabilities to system intelligent entry points through a declared contract |
| Device-side A2A | Connect an app-side Agent with system Agents using registered components, authenticated bidirectional communication, and interactive UI |
| AgentCard | Present Agent-related content or interaction through supported card capabilities |

Do not use these names interchangeably. First identify whether the user needs UI-triggered Agent invocation, intent exposure, an app Skill, Agent-to-Agent communication, or card presentation.

## Agent Framework Kit breaking change (API 26.0.0)

Effective **only when `targetSdkVersion >= 26.0.0`**:

- `OnDataCallback.method` changes enum type `AgentOperation` → `string`.
- `RequestContext.getClientSessionId()` is **removed**.

Migration rule: before raising `targetSdkVersion` to 26.0.0, grep the project for `AgentOperation` and `getClientSessionId`, replace the removed session-id call with the current session/context accessor documented in the installed SDK, and re-run the build — these are compile-time breaks that a `targetSdkVersion 24` build will not surface.

## HarmonyOS 7 capability notes

- HarmonyOS 7 is a shipping consumer release (announced 2026-09-07; staged official upgrade from 2026-09-28), not a preview. Do not describe its capabilities as Beta-only.
- **Ark Agentic Framework (方舟智能开发框架)**, device-side **A2A** framework, ArkTS script-based app Skill development, and Xiaoyi/Xiaoyi-Open-Platform Skill creation via Vibe Coding are the headline AI areas.
- Skill Vibe Coding assists app Skill development, debugging, review, and publishing.
- Visual AI, 3DGS, spatial-audio nodes, app/game quick start, cold-start network preconnection, QUIC, weak-network live-stream optimization, and LTPO variable frame rate are highlighted HarmonyOS 7 capability areas.
- Treat marketing-level capability descriptions as discovery signals, not stable API signatures. Verify the API 26.0.0 SDK reference, device category, permissions, and feature availability before generating production code.
- **ArkTS 1.2 (static ArkTS)** is documented upstream, but its HarmonyOS ship status is unconfirmed (checked 2026-09-30). Read `arkts-1.2-interop.md` before advising on it.
- For AGC cloud debugging, filter remote devices by API 26 or system version `7.0.0.105` / `7.0.0.109` when validating HarmonyOS 7 compatibility. (The earlier `7.0.0.23` filter value came from the Beta era.)

## Ecosystem context (short)

- Meta-services (元服务) remain the installation-free distribution model; ASCF supports both high-code and zero-code authoring, and the service-distribution platform (SDG) drives discovery. Wallet Kit opened card/certificate/ticket capabilities.
- Reported ecosystem figures (2026, third-party mirrors of Huawei announcements): 24,000+ meta-service partners and >190M MAU on the negative-one-screen entry. Treat them as **reported** context, not verifiable specifications.

## Answer rules

1. State whether the request is about DevEco Studio, DevEco Code, DevEco CLI, or a third-party Agent.
2. Default to API 26.0.0 for new code, but always keep the API 24 compatibility floor visible and name it.
3. Name the exact Agent capability layer instead of using generic terms such as "HarmonyOS Agent API."
4. Do not invent DevEco CLI command names. Use installed-tool help or official documentation for exact commands and flags.
5. For device-dependent capabilities such as LTPO or spatial audio, require SDK and hardware support verification.
6. Where a claim rests only on third-party mirrors of Huawei's announcements, phrase it as reported rather than as an official specification.

## Sources

- https://developer.huawei.com/consumer/cn/doc/ (guides), https://developer.huawei.com/consumer/cn/deveco-studio/ (tooling), https://developer.huawei.com/consumer/cn/doc/harmonyos-releases/ (release notes).
