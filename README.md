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

安装后重启（或热挂载后刷新）DSH，即可在 agent 会话中通过技能名触发 `harmonyos-development` 或 `arkts-review`。

> 只想用技能本身、不需要走插件机制的，也可以直接把 `skills/` 下两个目录复制进 `~/.dsh/skills/`。

## 目录结构 / Structure

```
src/
└── index.js               # Cordis 插件：注册 skill provider
skills/
├── harmonyos-development/
│   ├── SKILL.md           # 主技能（入口）
│   ├── references/        # 15 份速查：平台基线、API 26.0.0、沉浸光感、ArkTS 1.2 互操作、ArkTS 规则、ArkUI 组件、状态管理、导航、权限、性能…
│   ├── recipes/           # 配方：编译报错定位、ArkTS 代码审查
│   ├── examples/          # 示例：LazyForEach/List、权限申请
│   └── evals/             # 评测用例
└── arkts-review/
    └── SKILL.md           # ArkTS 审查技能（八轴审查 + 一键修复表）
cordis.patch.yml           # bundle 补丁（挂载插件）
package.json               # dsh.bundle 元数据
```

## 标识 / Ecosystem

本项目是 [spike-faye-lei/spike-faye-lei-dsh-skills](https://github.com/spike-faye-lei/spike-faye-lei-dsh-skills) 技能合集生态的一员——该合集从社区收集整理了 1300+ 技能 + 94 个 agent。本仓库单独抽出鸿蒙开发这一垂直领域，做成可一键安装的 DSH 插件，方便独立安装与迭代。

- 主体合集（1300+ 技能）：https://github.com/spike-faye-lei/spike-faye-lei-dsh-skills
- 本仓库专注：鸿蒙 / ArkTS 开发与审查

## 许可 / License

本项目代码采用 [CC BY-NC 4.0](./LICENSE)。

> ⚠️ 禁止任何第三方将本代码用于商业用途。作者保留全部商业权利。
