# Recipe: Review ArkTS / ArkUI Code

Use this recipe when the user asks for code review, refactoring, migration review, or bug analysis.

## Review order

1. Target SDK and `targetSdkVersion` behavior gate.
2. ArkTS strict typing and null safety.
3. ArkUI state decorator correctness.
4. Lifecycle side effects and async work.
5. Permission and module configuration requirements.
6. UI rendering and list performance.
7. Build, signing, and package implications.

## Output format

- Summary judgment
- Critical issues
- Recommended patch direction
- HarmonyOS-specific risks
- Verification checklist

## Avoid

- Generic React or Android advice.
- Rewriting the whole file when a targeted fix is enough.
- Recommending API 26-only calls to a project whose `compatibleSdkVersion` cannot support them without a fallback.
- Treating API 26.0.0 as a preview/Beta SDK.
