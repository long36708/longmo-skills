# 精化和转换参考

## .refine(fn, opts)

自定义验证，返回布尔值。

```typescript
const EvenNumber = z.number().refine((n) => n % 2 === 0, {
  error: "必须是偶数",
})

// 异步精化 — 必须使用 parseAsync/safeParseAsync
const UniqueEmail = z.email().refine(
  async (email) => !(await db.exists(email)),
  { error: "邮箱已被占用" }
)
```

## .superRefine((val, ctx) => void)

高级验证，支持多个问题和路径定位。

```typescript
const Password = z.string().superRefine((val, ctx) => {
  if (val.length < 8) {
    ctx.addIssue({
      code: "custom",
      message: "必须至少8个字符",
    })
  }
  if (!/[A-Z]/.test(val)) {
    ctx.addIssue({
      code: "custom",
      message: "必须包含大写字母",
    })
  }
  if (!/[0-9]/.test(val)) {
    ctx.addIssue({
      code: "custom",
      message: "必须包含数字",
    })
  }
})
```

### 跨字段验证

```typescript
const Form = z
  .object({
    password: z.string().min(8),
    confirm: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirm) {
      ctx.addIssue({
        code: "custom",
        path: ["confirm"], // 定位到 confirm 字段
        message: "密码不匹配",
      })
    }
  })
```

## .check(...checks)

函数式检查（在完整 Zod 中也可用，在 Zod Mini 中必需）。

```typescript
// 完整 Zod
z.string().check(
  z.minLength(8, "太短"),
  z.maxLength(100, "太长"),
)

// Zod Mini
import { z } from "zod/v4/mini"
z.string().check(z.minLength(8), z.maxLength(100))
```

## .transform(fn)

将值转换为新类型（单向转换）。

```typescript
const StringToNumber = z.string().transform((s) => parseInt(s, 10))
// 输入: string, 输出: number

const Trimmed = z.string().transform((s) => s.trim())
// 输入: string, 输出: string (去除空格)
```

不要在转换函数内部抛出错误 — 先使用 `.refine()` 进行验证。

## .pipe(schema)

分阶段解析 — 当前模式的输出成为下一个模式的输入。

```typescript
const PortNumber = z
  .string()
  .pipe(z.coerce.number())
  .pipe(z.int().min(1).max(65535))

// 阶段1: 验证字符串
// 阶段2: 强制转换为数字
// 阶段3: 验证整数范围
```

## .preprocess(fn, schema)

在解析前转换输入。遗留方法 — 推荐使用 `.pipe()`。

```typescript
const TrimmedString = z.preprocess(
  (val) => (typeof val === "string" ? val.trim() : val),
  z.string().min(1)
)
```

## .overwrite(fn)

原地修改值而不改变类型。

```typescript
const NormalizedEmail = z.email().overwrite((email) => email.toLowerCase())
// 输入: string, 输出: string (小写)
```

## .default(value)

为 undefined 输入提供默认值。在验证后应用。

```typescript
const Port = z.number().default(3000)
Port.parse(undefined) // 3000
Port.parse(8080)      // 8080
```

输入类型变为可选：
```typescript
type Input = z.input<typeof Port>   // number | undefined
type Output = z.infer<typeof Port>  // number
```

## .prefault(value)

在验证前提供默认值。

```typescript
const Name = z.string().min(1).prefault("匿名")
Name.parse(undefined) // "匿名" (先验证 min(1))
```

## .catch(value)

任何错误时回退 — 永远不会失败。

```typescript
const SafeNumber = z.number().catch(0)
SafeNumber.parse("不是数字") // 0
SafeNumber.parse(42)         // 42
```

## .apply(fn)

应用返回模式的函数。

```typescript
const Clamped = z.number().apply((schema) =>
  schema.min(0).max(100)
)
```

## 异步精化和转换

当任何精化或转换是异步时，必须使用 `parseAsync()` 或 `safeParseAsync()`。

```typescript
const Schema = z.object({
  email: z.email().refine(
    async (email) => !(await db.exists(email)),
    { error: "已被占用" }
  ),
  avatar: z.url().transform(
    async (url) => await downloadImage(url)
  ),
})

// 必需: 异步解析
const result = await Schema.safeParseAsync(data)
```

## ctx.addIssue() 的问题代码

| 代码 | 使用时机 |
|------|----------|
| `"custom"` | 自定义验证逻辑 |
| `"invalid_type"` | 错误的输入类型 |
| `"too_small"` | 低于最小值（长度、值、大小） |
| `"too_big"` | 高于最大值 |
| `"invalid_string"` | 字符串格式验证 |
| `"invalid_enum_value"` | 值不在枚举中 |
| `"unrecognized_keys"` | 严格对象中的未知键 |
| `"invalid_union"` | 没有联合分支匹配 |
