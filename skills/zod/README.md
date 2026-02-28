# Zod Skill

作者：**[Anivar Aravind](https://anivar.net)**

一个用于编写、验证和调试 Zod v4 模式的 AI 代理技能，采用现代最佳实践。

## 问题描述

AI 代理经常生成过时的 Zod v3 模式 — 使用 `z.string().email()` 而不是 `z.email()`，使用 `z.nativeEnum()` 而不是 `z.enum()`，使用 `required_error` 而不是 `error` 参数 — 并且遗漏了关键的解析陷阱，如使用 `parse()` 而不是 `safeParse()`，忘记异步精化的 `parseAsync`，或者假设 `z.object()` 会保留未知键。这些会产生编译但在运行时静默行为异常的模式。

## 解决方案

27 条规则，包含错误→正确的代码示例，教授代理 Zod v4 的实际 API 行为、模式设计模式、错误处理、架构位置、可观察性和 TypeScript 集成。每条规则针对特定错误，并确切展示如何修复它。

## 安装

```bash
npx skills add anivar/zod-skill -g
```

或使用完整 URL：

```bash
npx skills add https://github.com/anivar/zod-skill
```

## 基础要求

- zod ^4.0.0
- TypeScript ^5.5

## 包含内容

### 9 个类别中的 27 条规则

| 优先级 | 类别 | 规则数量 | 影响程度 |
|----------|----------|-------|--------|
| 1 | 解析与类型安全 | 3 | 关键 |
| 2 | 模式设计 | 4 | 关键 |
| 3 | 精化与转换 | 3 | 高 |
| 4 | 错误处理 | 3 | 高 |
| 5 | 性能与组合 | 3 | 中 |
| 6 | v4 迁移 | 3 | 中 |
| 7 | 高级模式 | 3 | 中 |
| 8 | 架构与边界 | 3 | 关键/高 |
| 9 | 可观察性 | 2 | 高/中 |

每个规则文件包含：
- 为什么重要
- 错误代码及解释
- 正确代码及解释
- 决策表和其他上下文

### 9 个深度参考文档

| 参考文档 | 涵盖内容 |
|-----------|--------|
| `schema-types.md` | 所有基本类型、字符串格式、数字、枚举、日期、文件、JSON |
| `parsing-and-inference.md` | parse、safeParse、parseAsync、z.infer、z.input、强制转换 |
| `objects-and-composition.md` | object/strict/loose、pick、omit、partial、递归、联合、元组 |
| `refinements-and-transforms.md` | refine、superRefine、transform、pipe、默认值、catch |
| `error-handling.md` | ZodError、flattenError、treeifyError、错误自定义、国际化 |
| `advanced-features.md` | 编解码器、品牌类型、JSON Schema、注册表、标准模式 |
| `anti-patterns.md` | 14 个常见错误及坏/好示例 |
| `boundary-architecture.md` | Zod 适用场景：Express、tRPC、Next.js、React Hook Form、环境变量、外部 API |
| `linter-and-ci.md` | ESLint 规则、CI 模式快照、未使用模式检测、循环依赖 |

## 结构

```
├── SKILL.md                          # AI 代理的入口点
├── AGENTS.md                         # 包含所有规则扩展的编译指南
├── rules/                            # 独立规则（错误→正确）
│   ├── parse-*                       # 解析与类型安全（关键）
│   ├── schema-*                      # 模式设计（关键）
│   ├── refine-*                      # 精化与转换（高）
│   ├── error-*                       # 错误处理（高）
│   ├── perf-*                        # 性能与组合（中）
│   ├── migrate-*                     # v4 迁移（中）
│   ├── pattern-*                     # 高级模式（中）
│   ├── arch-*                        # 架构与边界（关键/高）
│   └── observe-*                     # 可观察性（高/中）
└── references/                       # 深度参考文档
    ├── schema-types.md
    ├── parsing-and-inference.md
    ├── objects-and-composition.md
    ├── refinements-and-transforms.md
    ├── error-handling.md
    ├── advanced-features.md
    ├── anti-patterns.md
    ├── boundary-architecture.md
    └── linter-and-ci.md
```

## 生态系统 — [Anivar Aravind](https://anivar.net) 的技能

### 测试技能
| 技能 | 涵盖内容 | 安装 |
|-------|---------------|---------|
| [jest-skill](https://github.com/anivar/jest-skill) | Jest 最佳实践 — 模拟设计、异步测试、匹配器、计时器、快照 | `npx skills add anivar/jest-skill -g` |
| [zod-testing](https://github.com/anivar/zod-testing) | Zod 模式测试 — safeParse、模拟数据、基于属性的测试 | `npx skills add anivar/zod-testing -g` |
| [msw-skill](https://github.com/anivar/msw-skill) | MSW 2.0 API 模拟 — 处理器、响应、GraphQL | `npx skills add anivar/msw-skill -g` |
| [redux-saga-testing](https://github.com/anivar/redux-saga-testing) | Redux-Saga 测试 — expectSaga、testSaga、提供者 | `npx skills add anivar/redux-saga-testing -g` |

### 库与框架技能
| 技能 | 涵盖内容 | 安装 |
|-------|---------------|---------|
| [redux-saga-skill](https://github.com/anivar/redux-saga-skill) | Redux-Saga 效果、fork 模型、通道、RTK | `npx skills add anivar/redux-saga-skill -g` |
| [msw-skill](https://github.com/anivar/msw-skill) | MSW 2.0 处理器、响应、迁移 | `npx skills add anivar/msw-skill -g` |

### 工程分析
| 技能 | 涵盖内容 | 安装 |
|-------|---------------|---------|
| [contributor-codebase-analyzer](https://github.com/anivar/contributor-codebase-analyzer) | 代码分析、年度评审、晋升准备度 | `npx skills add anivar/contributor-codebase-analyzer -g` |

## 作者

**[Anivar Aravind](https://anivar.net)** — 为现代 JavaScript/TypeScript 开发构建 AI 代理技能。

## 许可证

MIT
