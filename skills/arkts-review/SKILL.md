---
name: arkts-review
description: ArkTS/HarmonyOS 代码审查与修复。Use when reviewing or fixing .ets files, HarmonyOS compilation errors, ArkTS type issues, or API deprecation warnings. Covers SDK API 12-26.0.0 breaking changes, targetSdkVersion 26.0.0 behavior gates (systemMaterial/沉浸光感 scope, Agent Framework Kit, 32vp touch targets), @kit.* vs @ohos.* imports, strict mode rules, legacy UIContext migration (getContext/router/animateTo/AlertDialog), and camera/filesystem API migration.
---

# ArkTS Code Review

## Overview

ArkTS 代码审查，覆盖八轴：API 兼容性、类型正确性、模块导入、弃用 API、相机/文件系统用法、异常处理、结构化建议、API 26.0.0 行为门控与破坏性变更。

## 核心流程

收到 ".ets 文件报错" 时：

1. **先读 `build-profile.json5`** — 确认 `targetSdkVersion` / `compatibleSdkVersion`，API level 决定哪些 API 可用/弃用；**`targetSdkVersion` 是否 >= 26.0.0 决定 API 26 行为变更是否生效**（沉浸光感材质范围、触控目标尺寸、Agent Framework Kit 破坏性变更等）
2. **找到所有报错文件** — grep 报错关键词（`closeSync`, `createForResult`, `any`, `unknown` 等）
3. **逐文件修复** — 按下方规则改
4. **内存自查** — 对照 `harmonyos-arkts-reference` 记忆
5. **输出变更摘要** — 哪些文件改了什么

## 八大审查轴

### 1. API 兼容性（最常见）

**构建配置信息源：** 必须先读项目根 `build-profile.json5` / `entry/build-profile.json5`，确定：
- `targetSdkVersion` / `compatibleSdkVersion`
- `compileSdkVersion`

**关键弃用速查：**

| 弃用 API | API Level | 替代方案 |
|----------|-----------|---------|
| `file.closeSync()`（File 实例方法） | 12+ 移除 | `fs.closeSync(file)` / `await fs.close(file)` |
| `router.pushUrl()` | 18+ | `this.getUIContext().getRouter().pushUrl()` |
| `router.back()` | 18+ | `this.getUIContext().getRouter().back()` |
| `promptAction.showToast()` | 18+ | `this.getUIContext().getPromptAction().showToast()` |
| `READ_MEDIA` / `WRITE_MEDIA` 权限 | 12+ | `READ_IMAGEVIDEO` / `WRITE_IMAGEVIDEO` |
| `animateTo()` | 18+ | `this.getUIContext().animateTo()` |
| `PhotoViewPicker` | 12+ | `photoAccessHelper.PhotoViewPicker` |
| `getContext(this)` | 18+ | `this.getUIContext().getHostContext()` |
| `AlertDialog.show()` | 18+ | `this.getUIContext().showAlertDialog()` |
| `CustomDialog` / `CustomDialogController` | 18+ | `openCustomDialog` / `openBindSheet`（UIContext） |
| `@ohos.*` 直接导入（如 `@ohos.multimedia.camera`） | 12+ | `@kit.*` 命名空间（如 `@kit.CameraKit`），无需 oh-package 依赖 |

**审查要点：** 每个 File 实例方法调用（`file.closeSync()` 等）都要检查 → 替换为模块级函数 `fs.closeSync(file)` / `await fs.close(file)`（`await fs.close()` 必须在 async 函数内；模块级 `fs.closeSync()` 本身未废弃，仍可用）。

### 2. 类型正确性

**ArkTS 严格模式禁止：**
- `any` 类型 → 必须显式声明具体类型
- `unknown` 类型 → 同上
- 内联对象字面量作为类型注解 → 必须用 `interface` 定义

**JSON 解析规范：**
```typescript
// ❌ 错误
let data = JSON.parse(json)  // 推导为 any

// ✅ 正确
let data = JSON.parse(json) as SomeInterface
let data = JSON.parse(json) as Record<string, Object>
```

**Promise 返回类型：**
```typescript
// ❌ 错误
async getData(): Promise<object> { ... }

// ✅ 正确 — 用 interface 或 Record
async getData(): Promise<SomeInterface> { ... }
async getData(): Promise<Record<string, Object>> { ... }
```

### 3. 模块导入

**API 12+ 推荐用 `@kit.*` 命名空间：**
```typescript
// 老写法（仍可用但不推荐）
import camera from '@ohos.multimedia.camera'
import image from '@ohos.multimedia.image'

// 新写法
import { cameraPicker, camera } from '@kit.CameraKit'
import { image } from '@kit.ImageKit'
```

**审查要点：** `@kit.*` 包是系统级 API，无需在 `oh-package.json5` 添加依赖。

### 4. 相机 / 拍照

**API 12+ 推荐 `cameraPicker`：**
```typescript
import { cameraPicker, camera } from '@kit.CameraKit'

// 拍照
let result = await cameraPicker.pick(
  context,
  [cameraPicker.PickerMediaType.PHOTO],
  { cameraPosition: camera.CameraPosition.CAMERA_POSITION_BACK }  // ⚠️ 完整枚举名
)
let uri = result.resultUri

// 预览
let imgSource = image.createImageSource(uri)
let pixelMap = await imgSource.createPixelMap()

// 保存原图到文件
let srcFile = fs.openSync(uri, fs.OpenMode.READ_ONLY)
let stat = fs.statSync(srcFile.fd)       // ⚠️ 非 srcFile.statSync()
let buf = new ArrayBuffer(stat.size)
fs.readSync(srcFile.fd, buf)              // ⚠️ 非 srcFile.readSync(buf)
await fs.close(srcFile)                   // ⚠️ 非 srcFile.close()
```

**审查要点：**
- 低级 API（`CameraManager` / `PhotoOutput` / `CaptureSession`）复杂且容易出错，优先 `cameraPicker`
- `context` 用 `this.getUIContext().getHostContext() as common.UIAbilityContext`（`getContext(this)` 已废弃；模块级函数必须把 ctx 作为参数传入）
- 人脸拍照用 `camera.CameraPosition.CAMERA_POSITION_FRONT`（前置镜头，⚠️ 完整枚举名）

### 5. 文件系统

**API 12+ 变更：**
```typescript
// ❌ 全部移除（API 12+）— File 实例方法全部移除
file.closeSync()
file.close()        // 也不存在！
file.readSync(buf)  // 不存在！
file.statSync()     // 不存在！

// ✅ 正确 — 用 fs 模块函数 + file.fd
await fs.close(file)
fs.readSync(file.fd, buf)
fs.statSync(file.fd)
fs.writeSync(file.fd, buf)
```

**`openSync` / `writeSync` / `closeSync` / `readSync` / `statSync` / `close` 仍可用（模块函数，传入 File 或 fd 均可）。**
**仅 File 实例方法被移除：`file.xxx()` → `fs.xxx(file.fd)`（`close` 用 `await fs.close(file)`）。**

**审查要点：** 每个 `File` 实例方法调用都要检查 → `file.xxx()` → `fs.xxx(file.fd)`。外层函数必须 `async` 以支持 `await fs.close()`。

### 6. 异常处理

**ArkTS 对抛出异常的函数要求处理：**
```typescript
// ❌ 缺少 try-catch
let file = fs.openSync(path, fs.OpenMode.READ_ONLY)  // 可能抛出异常

// ✅ 正确 — 加 try-catch
try {
  let file = fs.openSync(path, fs.OpenMode.READ_ONLY)
  let stat = fs.statSync(file.fd)
  // ...
  await fs.close(file)
} catch (e) {
  // 处理错误
}
```

**审查要点：**
- `fs.openSync`、`readSync`、`writeSync`、`statSync` 都可能抛异常
- 已有外层 try-catch 的函数内可以不加（但 HTTP 工具类的方法通常需要独立处理）

### 7. 结构化建议

- **组件无用的 import 删掉**（如 `import camera from '@ohos.multimedia.camera'` 但未使用）
- **声明后未使用的变量** — 要么删除，要么填上逻辑
- **硬编码颜色值** — 建议抽到 `$r()` 资源，但非阻塞
- **`space` 是构造参数不是链式方法** — `Row({ space: 12 })` 而非 `Row().space(12)`
- **`createImageSource` 可接受 fd (number) 或 URI (string)**

### 8. API 26.0.0 行为门控与破坏性变更（新增，仅当 `targetSdkVersion >= 26.0.0`）

审查前先确认 `targetSdkVersion`；下面这些变更只在 `targetSdkVersion >= 26.0.0` 时生效，但 `compatibleSdkVersion` 低于 26 的项目必须保证回退路径：

| 变更 | 检查点 |
|------|--------|
| Agent Framework Kit 破坏性变更 | grep `AgentOperation`（枚举 → `string`）与 `getClientSessionId()`（已移除）；`targetSdkVersion` 提到 26.0.0 后才会编译失败 |
| 沉浸光感 `systemMaterial` 生效范围（2026/09/03 收窄） | 全页生效仅限弹窗类组件与 dialog API、Slider/Toggle/Select；其它组件仅在 `Navigation`/`NavDestination` 标题栏或 `barPosition: BarPosition.End` 的 Tabs 底部 TabBar 内生效。禁用方式：`metadata` `ohos.arkui.UIMaterial.state`=`disable`，或组件级 `uiMaterial.Material.empty` |
| 表单控件最小触控目标 28vp → 32vp | Button / Button 风格 Toggle / Select / Chip / ChipGroup 的布局与点击区域重新验证 |
| 权限策略与 `READ_IMAGEVIDEO`、`getUidRxBytes` / `getUidTxBytes` | 权限申请流程与埋点统计口径重新验证 |
| ArkWeb Chromium 132 → 144、Cookie 存储目录变更 | 直接读写 cookie 文件、依赖旧内核行为的代码必须适配 |
| 列表/节点适配项 | `List` `onScrollVisibleContentChange`、`NodeAdapter.onAttachToNode`、`LayoutPolicy.matchParent`、`EmbeddedComponent` 焦点、`WithTheme`、鼠标 `rawDeltaX/rawDeltaY` |

**审查要点：** 如果项目 `targetSdkVersion` 仍 < 26.0.0，不要把这些变更当成缺陷；如果已 >= 26.0.0，逐项对照上表。API 26.0.0 已是 Release（2026/08/29），不要以"预览版"为由劝阻使用。官方发布说明：https://developer.huawei.com/consumer/cn/doc/harmonyos-releases/ （文档 ID `*-7003` / `changelogs-in-26003`）。

## 审查输出格式

```markdown
## 审查结果

### 文件: xxx.ets
- **问题**: [描述]
- **严重度**: Critical / Required / Nit
- **修复**: [具体改动]

### 总结
- 修改了 N 个文件
- Critical: X 个 / Required: Y 个 / Nit: Z 个
```

## 常见错误一键修复表

| 报错信息 | 原因 | 修复 |
|---------|------|-----|
| `Property 'closeSync' does not exist on type 'File'` | File 实例方法移除 | `await fs.close(file)` |
| `Property 'close' does not exist on type 'File'` | File 实例方法移除 | `await fs.close(file)` |
| `Property 'readSync' does not exist on type 'File'` | File 实例方法移除 | `fs.readSync(file.fd, buf)` |
| `Property 'statSync' does not exist on type 'File'` | File 实例方法移除 | `fs.statSync(file.fd)` |
| `Property 'BACK' does not exist on type 'typeof CameraPosition'` | 枚举命名变更 | `CameraPosition.CAMERA_POSITION_BACK` |
| `Property 'createForResult' does not exist on type 'UIAbilityContext'` | 方法不存在 | 用 `cameraPicker` 或其他方式 |
| `arkts-no-any-unknown` | 隐式 any/unknown | 显式声明类型或 `as` 转换 |
| `arkts-no-untyped-obj-literals` | 内联对象字面量 | 定义 interface |
| `Function may throw exceptions` | 缺少 try-catch | 包裹文件操作 try-catch |
| `Property 'space' does not exist on type 'RowAttribute'` | space 是构造参数 | `Row({ space: N })` |
| `'xxx' is declared but its value is never read` | 声明但未使用 | 删除或实现逻辑 |

## Red Flags

- 用 `@ohos.multimedia.camera` 低级 API 做简单拍照（对面部识别/食物拍照，`cameraPicker` 更合适）
- `file.closeSync()`（File 实例方法）在 API 12+ 项目中仍存在（模块级 `fs.closeSync(file)` 不受影响）
- `Promise<object>` 作为返回类型
- 回调函数无显式类型
- 在 `takePhoto()` 里反复注册 `on('photoAvailable')` 导致内存泄漏
- 只用 `openSync` 创建空文件但从不实际拍照
- `captureSession` 创建了但没 `commitConfig()` / `start()`
- `capability.photoProfiles` 不检查 null/空数组直接 `[0]`
- `targetSdkVersion` 已提到 26.0.0，但代码未处理 Agent Framework Kit 的 `AgentOperation` / `getClientSessionId` 破坏性变更
- 断言沉浸光感在任意组件上全页生效（2026/09/03 收窄后只对弹窗类与 Slider/Toggle/Select 全页生效）
- 仍在使用 `getContext(this)`、裸 `animateTo()`、`router.pushUrl()`、`AlertDialog.show()`
- 把 API 26.0.0 当作预览/Beta 版本，从而拒绝使用已发布的 Release API
