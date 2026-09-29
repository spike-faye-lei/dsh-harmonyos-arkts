# dsh-harmonyos-arkts

鸿蒙（HarmonyOS NEXT）开发技能插件 —— 面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）的 ArkTS / ArkUI 开发与代码审查技能。

A DeepSeek Harness plugin that ships HarmonyOS NEXT development skills — ArkTS / ArkUI coding knowledge and ArkTS code review.

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey)](./LICENSE)
[![DSH plugin](https://img.shields.io/badge/DeepSeek%20Harness-plugin-202724)](https://github.com/deepseek-ai/deepseek-harness)
[![Ecosystem](https://img.shields.io/badge/ecosystem-spike--faye--lei--dsh--skills-267A59)](https://github.com/spike-faye-lei/spike-faye-lei-dsh-skills)

## 这是什么 / What

一个 DSH 插件，安装后向 DSH 的 skill 注册表注入两个技能：

| 技能 | 用途 |
| --- | --- |
| `harmonyos-development` | 鸿蒙原生开发全量知识：API 23–24 + **API 26.0.0 Release（HarmonyOS 7）**、ArkTS/ArkUI、Stage 模型、状态管理、Navigation、权限、沉浸光感/材质、ArkTS 1.2 互操作、相机/文件系统、性能、打包签名等 |
| `arkts-review` | ArkTS 代码审查与修复：`.ets` 编译错误、API 弃用迁移、严格模式类型问题、`@kit.*` 导入、旧 UIContext API 迁移（getContext/router/animateTo/AlertDialog）、API 26.0.0 行为门控（沉浸光感范围、Agent Framework Kit）、相机/文件系统 API 迁移 |

覆盖版本基线：**HarmonyOS 7（API 26.0.0，2026-08-29 Release，新项目生产默认）/ HarmonyOS 6.1.1（API 24 Release，兼容下限）/ HarmonyOS 6.1.0（API 23）**。API 26 行为变更以 `targetSdkVersion >= 26.0.0` 为门控；API 26.0.0 已发布正式版，不再是预览版。

插件还带一个 **DSH 侧边栏面板**（客户端半）：左栏出现一个鸿蒙图标，点开是一个原生风格的页面——

- **知识基线卡**：产品（HarmonyOS 7）、当前基线（API 26.0.0 Release）、发布时间、兼容下限、DevEco Studio / SDK 版本号、核对日期；
- **速查表目录树**：`skills/harmonyos-development/references/` 下全部 15 份文档，点开看每份的摘要、体积与章节；
- **「把当前 .ets 丢进八轴审查」按钮**：复制一段带八轴与 `targetSdkVersion` 门控要求的提示词，粘贴到输入框即可发起审查。

面板数据由 `build-client.mjs` 在构建时**从真实的技能文件里读出来**（`references/*.md`、`platform-baseline.md`、`arkts-review/SKILL.md`），基线字段读不到就直接构建失败，所以面板不会显示过期知识。配色全部使用 DSH 自己的主题 token（`--dsw-alias-*`），跟随明暗主题。

## 安装 / Install

确保已安装 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)，然后从 GitHub 安装：

```sh
dsh plugin --profile web add git+https://github.com/spike-faye-lei/dsh-harmonyos-arkts.git
```

或从源码 / 本地目录安装：

```sh
git clone https://github.com/spike-faye-lei/dsh-harmonyos-arkts.git
cd dsh-harmonyos-arkts
dsh plugin --profile web add .
```

> 尚未发布到 npm（`dsh plugin --profile web add dsh-harmonyos-arkts` 暂不可用），npm 发布计划见 [issue 跟踪](https://github.com/spike-faye-lei/dsh-harmonyos-arkts/issues)。

安装后重启（或热挂载后刷新）DSH：agent 会话里可通过技能名触发 `harmonyos-development` 或 `arkts-review`，左栏同时出现鸿蒙图标，点开即侧边栏面板。

> 客户端半是**启动时同步读取**的，所以首次启用必须重启一次；之后改 `lib/client.js` 会被 client HMR 自动热更新，不用再重启。

> 只想用技能本身、不需要走插件机制的，也可以直接把 `skills/` 下两个目录复制进 `~/.dsh/skills/`。

## 目录结构 / Structure

```
src/
├── index.js               # 宿主半（Cordis 插件）：注册 skill provider
└── client/index.js        # 客户端半（Web UI）：侧边栏图标 + 面板，含 __PANEL_DATA__ 占位
lib/
└── client.js              # 构建产物：由 build-client.mjs 生成并注入真实数据，必须提交
build-client.mjs           # 从技能文件生成 lib/client.js；--check 用于 CI 防漂移
skills/
├── harmonyos-development/
│   ├── SKILL.md           # 主技能（入口）
│   ├── references/        # 15 份速查：平台基线、API 26.0.0、沉浸光感、ArkTS 1.2 互操作、ArkTS 规则、ArkUI 组件、状态管理、导航、权限、性能…
│   ├── recipes/           # 配方：编译报错定位、ArkTS 代码审查
│   ├── examples/          # 示例：LazyForEach/List、权限申请
│   └── evals/             # 评测用例
└── arkts-review/
    └── SKILL.md           # ArkTS 审查技能（八轴审查 + 一键修复表）
cordis.patch.yml           # bundle 补丁（挂载宿主半）
package.json               # dsh.bundle + dsh.client 元数据
```

改完技能内容后，面板数据需要重新生成：

```sh
node build-client.mjs           # 重新生成 lib/client.js
node build-client.mjs --check   # CI：lib/client.js 与技能文件不一致则失败
```

> `lib/client.js` **必须提交**——DSH 在启动时同步读取这个文件，缺失会导致插件不加载。
> 已启用插件后，DSH 的 client HMR 每 500ms 轮询这个文件，改完可直接热更新，不用重启。

## 标识 / Ecosystem

本项目是 [spike-faye-lei/spike-faye-lei-dsh-skills](https://github.com/spike-faye-lei/spike-faye-lei-dsh-skills) 技能合集生态的一员——该合集从社区收集整理了 1300+ 技能 + 94 个 agent。本仓库单独抽出鸿蒙开发这一垂直领域，做成可一键安装的 DSH 插件，方便独立安装与迭代。

- 主体合集（1300+ 技能）：https://github.com/spike-faye-lei/spike-faye-lei-dsh-skills
- 本仓库专注：鸿蒙 / ArkTS 开发与审查

## 许可 / License

本项目代码采用 [CC BY-NC 4.0](./LICENSE)。

> ⚠️ 禁止任何第三方将本代码用于商业用途。作者保留全部商业权利。
