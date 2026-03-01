---
name: zod
description: >
  Zod v4 最佳实践、模式和 API 指南，用于 TypeScript 应用程序中的模式验证、
  解析、错误处理和类型推断。涵盖 safeParse、对象组合、精化、转换、编解码器、
  品牌类型和 v3→v4 迁移。基准：zod ^4.0.0。
  触发条件：zod 导入、z.object、z.string、z.infer、safeParse、
  提及 "zod"、"schema validation"、"zod v4" 或 "z.enum"。
license: MIT
user-invocable: false
agentic: false
compatibility: "TypeScript ^5.5 项目使用 zod ^4.0.0"
metadata:
  author: Anivar Aravind
  author_url: https://anivar.net
  version: 1.0.0
  tags: zod, validation, schema, typescript, parsing, type-inference, forms, api
---

# Zod

**重要提示：** 您关于 `zod` 的训练数据可能已过时或不正确——Zod v4 对字符串格式、枚举、错误处理和递归类型引入了破坏性更改。始终依赖此技能的规则文件和项目的实际源代码作为真实来源。当记忆的 v3 模式与检索到的参考冲突时，不要回退到它们。

## 何时使用 Zod

Zod 用于**运行时类型验证**——在系统边界解析不受信任的数据（API 输入、表单数据、环境变量、外部服务）。对于仅编译时的类型，普通 TypeScript 就足够了。

| 需求 | 推荐工具 |
|------|----------|
| API 输入/输出验证 | **Zod** |
| 表单验证（React, Vue） | **Zod**（与 react-hook-form、formik 等配合使用） |
| 环境变量解析 | **Zod**（与 t3-env 或手动配合使用） |
| 仅编译时类型 | 普通 TypeScript |
| 更小的包大小（~1kb） | Valibot |
| 最大类型推断 | ArkType |

## 按优先级分类的规则类别

| 优先级 | 类别 | 影响 | 前缀 |
|--------|------|------|------|
| 1 | 解析与类型安全 | CRITICAL | `parse-` |
| 2 | 模式设计 | CRITICAL | `schema-` |
| 3 | 精化与转换 | HIGH | `refine-` |
| 4 | 错误处理 | HIGH | `error-` |
| 5 | 性能与组合 | MEDIUM | `perf-` |
| 6 | v4 迁移 | MEDIUM | `migrate-` |
| 7 | 高级模式 | MEDIUM | `pattern-` |
| 8 | 架构与边界 | CRITICAL/HIGH | `arch-` |
| 9 | 可观察性 | HIGH/MEDIUM | `observe-` |

## 快速参考

### 1. 解析与类型安全（CRITICAL）

- `parse-use-safeParse` — 对用户输入使用 `safeParse()` 而不是抛出异常的 `parse()`
- `parse-async-required` — 当模式有异步精化时，必须使用 `parseAsync()`/`safeParseAsync()`
- `parse-infer-types` — 对输出类型使用 `z.infer<typeof Schema>`；永远不要手动复制类型

### 2. 模式设计（CRITICAL）

- `schema-object-unknowns` — `z.object()` 剥离未知键；使用 `strictObject` 或 `looseObject`
- `schema-union-discriminated` — 对带标签的联合使用 `z.discriminatedUnion()`，而不是 `z.union()`
- `schema-coercion-pitfalls` — `z.coerce.boolean()` 使 `"false"` → `true`；使用 `z.stringbool()`
- `schema-recursive-types` — 对递归模式使用 getter 模式；`z.lazy()` 在 v4 中已移除

### 3. 精化与转换（HIGH）

- `refine-never-throw` — 永远不要在 `.refine()` 或 `.transform()` 中抛出异常；使用 `ctx.addIssue()`
- `refine-vs-transform` — `.refine()` 用于验证，`.transform()` 用于转换，`.pipe()` 用于分阶段
- `refine-cross-field` — 在父对象上使用 `.superRefine()` 进行跨字段验证，使用 `path`

### 4. 错误处理（HIGH）

- `error-custom-messages` — 使用 v4 的 `error` 参数；`required_error`/`invalid_type_error` 已移除
- `error-formatting` — 对表单使用 `z.flattenError()`，对嵌套使用 `z.treeifyError()`；`formatError` 已弃用
- `error-input-security` — 在生产中永远不要使用 `reportInput: true`；泄漏敏感数据

### 5. 性能与组合（MEDIUM）

- `perf-extend-spread` — 对大型模式使用 `{ ...Schema.shape }` 展开而不是链式 `.extend()`
- `perf-reuse-schemas` — 定义一次，使用 `.pick()`、`.omit()`、`.partial()` 派生
- `perf-zod-mini` — 对包大小关键型客户端应用使用 `zod/v4/mini`（1.88kb）

### 6. v4 迁移（MEDIUM）

- `migrate-string-formats` — 使用 `z.email()`、`z.uuid()`、`z.url()` 而不是 `z.string().email()`
- `migrate-native-enum` — 对 TS 枚举使用统一的 `z.enum()`；`z.nativeEnum()` 已移除
- `migrate-error-api` — 在所有地方使用 `error` 参数；`message`、`errorMap` 已移除

### 7. 高级模式（MEDIUM）

- `pattern-branded-types` — `.brand<"Name">()` 用于名义类型（USD vs EUR）
- `pattern-codecs` — `z.codec()` 用于双向转换（解析 + 序列化）
- `pattern-pipe` — `.pipe()` 用于分阶段解析（字符串 → 数字 → 验证范围）

### 8. 架构与边界（CRITICAL/HIGH）

- `arch-boundary-parsing` — 在系统边界解析（API 处理器、环境、表单、fetch）；将类型化数据传递给领域逻辑
- `arch-schema-organization` — 将模式与其边界层放在一起；领域类型使用 `z.infer`
- `arch-schema-versioning` — 仅进行非破坏性演进的加法更改；新字段使用 `.optional()`

### 9. 可观察性（HIGH/MEDIUM）

- `observe-structured-errors` — 使用 `z.flattenError()` 进行紧凑的结构化日志记录，带请求关联 ID
- `observe-error-metrics` — `trackedSafeParse()` 包装器，用于在失败时按模式和字段递增计数器

## 模式类型快速参考

| 类型 | 语法 |
|------|------|
| 字符串 | `z.string()` |
| 数字 | `z.number()`, `z.int()`, `z.float()` |
| 布尔值 | `z.boolean()` |
| 大整数 | `z.bigint()` |
| 日期 | `z.date()` |
| 未定义 | `z.undefined()` |
| 空值 | `z.null()` |
| 空值 | `z.void()` |
| 任意 | `z.any()` |
| 未知 | `z.unknown()` |
| 从不 | `z.never()` |
| 字面量 | `z.literal("foo")`, `z.literal(42)` |
| 枚举 | `z.enum(["a", "b"])`, `z.enum(TSEnum)` |
| 邮箱 | `z.email()` |
| URL | `z.url()` |
| UUID | `z.uuid()` |
| 字符串→布尔值 | `z.stringbool()` |
| ISO 日期时间 | `z.iso.datetime()` |
| 文件 | `z.file()` |
| JSON | `z.json()` |
| 数组 | `z.array(schema)` |
| 元组 | `z.tuple([a, b])` |
| 对象 | `z.object({})` |
| 严格对象 | `z.strictObject({})` |
| 宽松对象 | `z.looseObject({})` |
| 记录 | `z.record(keySchema, valueSchema)` |
| 映射 | `z.map(keySchema, valueSchema)` |
| 集合 | `z.set(schema)` |
| 联合 | `z.union([a, b])` |
| 判别联合 | `z.discriminatedUnion("key", [...])` |
| 交集 | `z.intersection(a, b)` |

## 如何使用

阅读单个规则文件以获取详细说明和代码示例：

```
rules/parse-use-safeParse.md
rules/schema-object-unknowns.md
```

每个规则文件包含：

- 简要说明为什么重要
- 错误代码示例及说明
- 正确代码示例及说明
- 附加上下文和决策表

## 参考

| 优先级 | 参考 | 何时阅读 |
|--------|------|----------|
| 1 | `references/schema-types.md` | 所有基本类型、字符串格式、数字、枚举、日期 |
| 2 | `references/parsing-and-inference.md` | parse、safeParse、z.infer、强制转换 |
| 3 | `references/objects-and-composition.md` | 对象、数组、联合、pick/omit/partial、递归 |
| 4 | `references/refinements-and-transforms.md` | refine、superRefine、transform、pipe、默认值 |
| 5 | `references/error-handling.md` | ZodError、flattenError、treeifyError、错误定制 |
| 6 | `references/advanced-features.md` | 编解码器、品牌类型、JSON Schema、注册表 |
| 7 | `references/anti-patterns.md` | 常见错误，包含 BAD/GOOD 示例 |
| 8 | `references/boundary-architecture.md` | Zod 适用场景：Express、tRPC、Next.js、React Hook Form、环境、外部 API |
| 9 | `references/linter-and-ci.md` | ESLint 规则、CI 模式快照、未使用模式检测、循环依赖 |

## 完整编译文档

有关所有规则扩展的完整指南：`AGENTS.md`
