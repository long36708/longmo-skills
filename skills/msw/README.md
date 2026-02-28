# MSW Skill

作者：**[Anivar Aravind](https://anivar.net)**

一个用于编写、审查和调试 MSW (Mock Service Worker) v2 处理器、服务器设置和测试模式的 AI 代理技能，采用现代最佳实践。

## 问题描述

AI 代理经常生成过时的 MSW v1 模式 — 使用 `rest.get()` 而不是 `http.get()`，使用 `res(ctx.json(...))` 而不是 `HttpResponse.json()`，使用 `(req, res, ctx)` 而不是 `({ request, params })` — 并且遗漏了关键的测试最佳实践，如并发测试的 `server.boundary()`、`onUnhandledRequest: 'error'` 和正确的生命周期钩子设置。这些会产生无法编译或在运行时静默行为异常的代码。

## 解决方案

20 条规则，包含错误/正确的代码示例，教授代理 MSW v2 的实际 API、处理器设计、服务器生命周期、响应构造、测试模式、GraphQL 使用以及 v1 到 v2 的迁移。每条规则针对特定错误，并确切展示如何修复它。

## 安装

```bash
npx skills add anivar/msw-skill -g
```

或使用完整 URL：

```bash
npx skills add https://github.com/anivar/msw-skill
```

## 基础要求

- msw ^2.0.0
- TypeScript/JavaScript

## 包含内容

### 7 个类别中的 20 条规则

| 优先级 | 类别 | 规则数量 | 影响程度 |
|----------|----------|-------|--------|
| 1 | 处理器设计 | 4 | 关键 |
| 2 | 设置与生命周期 | 3 | 关键 |
| 3 | 请求读取 | 2 | 高 |
| 4 | 响应构造 | 3 | 高 |
| 5 | 测试模式 | 4 | 高 |
| 6 | GraphQL | 2 | 中 |
| 7 | 工具函数 | 2 | 中 |

每个规则文件包含：
- 为什么重要
- 错误代码及解释
- 正确代码及解释
- 决策表和其他上下文

### 6 个深度参考文档

| 参考文档 | 涵盖内容 |
|-----------|--------|
| `handler-api.md` | `http.*` 和 `graphql.*` 方法、URL 谓词、路径参数、处理器选项 |
| `response-api.md` | `HttpResponse` 类、所有 7 个静态方法、Cookie 处理 |
| `server-api.md` | `setupServer`/`setupWorker`、生命周期事件、`boundary()`、`onUnhandledRequest` |
| `test-patterns.md` | Vitest/Jest 设置、每个测试的重写、并发隔离、缓存清除 |
| `migration-v1-to-v2.md` | 完整的 v1 到 v2 破坏性变更及迁移映射 |
| `anti-patterns.md` | 10 个常见错误及坏/好示例 |

## 结构

```
├── SKILL.md                          # AI 代理的入口点
├── AGENTS.md                         # 包含所有规则扩展的编译指南
├── rules/                            # 独立规则（错误/正确）
│   ├── handler-*                     # 处理器设计（关键）
│   ├── setup-*                       # 设置与生命周期（关键）
│   ├── request-*                     # 请求读取（高）
│   ├── response-*                    # 响应构造（高）
│   ├── test-*                        # 测试模式（高）
│   ├── graphql-*                     # GraphQL（中）
│   └── util-*                        # 工具函数（中）
└── references/                       # 深度参考文档
    ├── handler-api.md
    ├── response-api.md
    ├── server-api.md
    ├── test-patterns.md
    ├── migration-v1-to-v2.md
    └── anti-patterns.md
```

## 生态系统 — [Anivar Aravind](https://anivar.net) 的技能

### 测试技能
| 技能 | 涵盖内容 | 安装 |
|-------|---------------|---------|
| [jest-skill](https://github.com/anivar/jest-skill) | Jest 最佳实践 — 模拟设计、异步测试、匹配器、计时器、快照 | `npx skills add anivar/jest-skill -g` |
| [zod-testing](https://github.com/anivar/zod-testing) | Zod 模式测试 — safeParse、模拟数据、基于属性的测试 | `npx skills add anivar/zod-testing -g` |
| [redux-saga-testing](https://github.com/anivar/redux-saga-testing) | Redux-Saga 测试 — expectSaga、testSaga、提供者 | `npx skills add anivar/redux-saga-testing -g` |

### 库与框架技能
| 技能 | 涵盖内容 | 安装 |
|-------|---------------|---------|
| [zod-skill](https://github.com/anivar/zod-skill) | Zod v4 模式验证、解析、错误处理 | `npx skills add anivar/zod-skill -g` |
| [redux-saga-skill](https://github.com/anivar/redux-saga-skill) | Redux-Saga 效果、fork 模型、通道、RTK | `npx skills add anivar/redux-saga-skill -g` |

### 工程分析
| 技能 | 涵盖内容 | 安装 |
|-------|---------------|---------|
| [contributor-codebase-analyzer](https://github.com/anivar/contributor-codebase-analyzer) | 代码分析、年度评审、晋升准备度 | `npx skills add anivar/contributor-codebase-analyzer -g` |

## 作者

**[Anivar Aravind](https://anivar.net)** — 为现代 JavaScript/TypeScript 开发构建 AI 代理技能。

## 许可证

MIT
