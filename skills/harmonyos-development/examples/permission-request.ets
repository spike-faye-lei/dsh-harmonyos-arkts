import { abilityAccessCtrl, common, Permissions } from '@kit.AbilityKit';

const PERMISSION: Permissions = 'ohos.permission.CAMERA';

// `PermissionRequestResult` is not always exported by the namespace, and the
// callback/Promise overloads can intersect — declare the shape locally and cast.
interface PermResult {
  authResults: abilityAccessCtrl.GrantStatus[];
}

export async function requestCameraPermission(context: common.UIAbilityContext): Promise<boolean> {
  const atManager = abilityAccessCtrl.createAtManager();
  const result = await atManager.requestPermissionsFromUser(context, [PERMISSION]) as PermResult;
  return result.authResults.length > 0
    && result.authResults[0] === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED;
}
