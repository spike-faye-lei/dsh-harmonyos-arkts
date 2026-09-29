# Permissions Reference

Use this reference for HarmonyOS permission declaration and user authorization flows.

## Defaults

- Mention both static declaration (`module.json5` → `requestPermissions`) and runtime request whenever user authorization is required.
- Prefer HarmonyOS permission names, for example camera permission constants from Ability Kit.
- Include module configuration notes when code requires permissions.
- Use the modern context accessor in new code: `this.getUIContext().getHostContext()`. `getContext(this)` is deprecated — see the migration table in `../SKILL.md`.

## Grant types

| Type | Declaration | Authorization |
|---|---|---|
| `system_grant` | `requestPermissions` entry with `name` only (for example `ohos.permission.INTERNET`) | Granted at install; no runtime dialog |
| `user_grant` | `name` + `reason` (a `$string:` resource) + `usedScene` (`abilities`, `when`: `inuse` / `always`) | Must be requested at runtime with `abilityAccessCtrl` |
| Restricted / ACL | `user_grant` plus an ACL entry in the signing profile (AppGallery Connect) | Runtime request **and** the ACL must be approved for the certificate |

`reason` and `usedScene` are mandatory for every `user_grant` permission; omitting them fails the build or the permission review.

## Quick reference

| Permission | Type | Notes |
|---|---|---|
| `ohos.permission.INTERNET` | `system_grant` | No extra fields; still required for all networking |
| `ohos.permission.CAMERA` | `user_grant` | Photo/video capture; not needed for `cameraPicker` or the default Scan Kit UI |
| `ohos.permission.MICROPHONE` | `user_grant` | Audio/video recording |
| `ohos.permission.LOCATION` / `ohos.permission.APPROXIMATELY_LOCATION` | `user_grant` | Map Kit and Location Kit; prefer the precise permission only when actually needed |
| `ohos.permission.READ_IMAGEVIDEO` / `ohos.permission.WRITE_IMAGEVIDEO` | `user_grant` | Replaced `READ_MEDIA` / `WRITE_MEDIA` from API 12; API 26 changes their behavior — see below |
| `ohos.permission.KEEP_BACKGROUND_RUNNING` | `system_grant` | Required for continuous background tasks |
| `ohos.permission.DEFAULT_WEB_BROWSER` | verify in SDK | New default-browser gate; the gating takes effect in the release **after** 26.0.0 |

## Runtime request pattern

```ts
import { abilityAccessCtrl, bundleManager, common } from '@kit.AbilityKit';

const atManager = abilityAccessCtrl.createAtManager();
const result = await atManager.requestPermissionsFromUser(context,
  ['ohos.permission.CAMERA', 'ohos.permission.MICROPHONE']);

if (result.authResults[0] === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED) {
  // Granted
} else if (result.dialogShownResults?.[0]) {
  // User saw the dialog and denied — show in-app guidance, do not re-pop
} else {
  // Permanently denied — send the user to the settings dialog
  await atManager.requestPermissionOnSetting(context, ['ohos.permission.CAMERA']);
}
```

Typing caveats that still apply on current SDKs:

- `abilityAccessCtrl.PermissionRequestResult` may not be exported by the namespace; declare a local interface (`{ authResults: abilityAccessCtrl.GrantStatus[] }`) and cast the awaited value rather than reading `.authResults` off an intersection type.
- `import type { Permissions } from '@ohos.bundleManager'` fails — `bundleManager` is reachable through `@kit.AbilityKit`. When a narrower type is needed, declare a local union of valid permission literals.
- Compare against `abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED`, not a bare `0`.

## API 26 permission changes

- Behavior changes for `ohos.permission.READ_IMAGEVIDEO`, `getUidRxBytes`, `getUidTxBytes`, and general permission policy apply under API 26 rules.
- Part of the API 26 permission-policy change set is gated by `targetSdkVersion >= 26.0.0` — do not attribute a behavior difference to the SDK alone without checking the target SDK.
- `ohos.permission.DEFAULT_WEB_BROWSER` is new; its enforcement arrives after 26.0.0, so design the flow now but do not assume it is active.

## Answering pattern

1. Identify the required permission and its grant type.
2. Add or verify the declaration (`name`, plus `reason` + `usedScene` for `user_grant`) in module configuration.
3. Request authorization at runtime when required.
4. Handle denial gracefully, including the "permanently denied" path via the settings dialog.
5. Explain SDK-version-specific behavior when relevant, and state the assumed `targetSdkVersion`.

## Review checklist

- Permission names are HarmonyOS permissions, not Android ones.
- Every `user_grant` entry has `reason` and `usedScene`.
- Runtime request uses the ability context correctly (`getUIContext().getHostContext()` in new code).
- Denial path is handled, including the settings fallback.
- API 26 permission behavior changes are stated with their `targetSdkVersion` gate.
