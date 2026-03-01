# 高级功能参考

## 编解码器

双向转换——解码（解析）和编码（序列化）。

```typescript
const DateCodec = z.codec(z.iso.datetime(), z.date(), {
  decode: (s) => new Date(s),           // string → Date
  encode: (d) => d.toISOString(),       // Date → string
})

const parsed = DateCodec.parse("2024-01-01T00:00:00Z") // Date
const serialized = DateCodec.encode(parsed)              // "2024-01-01T00:00:00.000Z"
```

### 内置编解码器

```typescript
// ISO 日期时间编解码器（string ↔ Date）
z.iso.datetime()

// 使用 codec 进行自定义解码/编码
z.codec(z.iso.datetime(), z.date(), {
  decode: (s) => new Date(s),
  encode: (d) => d.toISOString(),
})
```

### 何时使用编解码器 vs 转换器

| | `.transform()` | `z.codec()` |
|---|---|---|
| 方向 | 单向（输入 → 输出） | 双向 |
| 使用时机 | 仅解析 | 往返（解析 + 序列化） |
| 编码 | 不支持 | `schema.encode(value)` |

## 品牌类型

名义类型——防止混合结构相同的类型。

```typescript
const USD = z.number().brand<"USD">()
const EUR = z.number().brand<"EUR">()

type USD = z.infer<typeof USD> // number & { __brand: "USD" }
type EUR = z.infer<typeof EUR> // number & { __brand: "EUR" }

// TypeScript 防止混合
function pay(amount: USD) { /* ... */ }
const euros = EUR.parse(100)
pay(euros) // TypeScript 错误！
```

### 常见用例

```typescript
// 防止 ID 混合
const UserId = z.string().brand<"UserId">()
const PostId = z.string().brand<"PostId">()

// 类型安全的单位
const Meters = z.number().brand<"Meters">()
const Feet = z.number().brand<"Feet">()

// 验证过的字符串
const Email = z.email().brand<"Email">()
const Slug = z.string().regex(/^[a-z0-9-]+$/).brand<"Slug">()
```

## .readonly()

输出类型变为 `Readonly<T>`。

```typescript
const Config = z.object({
  host: z.string(),
  port: z.number(),
}).readonly()

type Config = z.infer<typeof Config>
// Readonly<{ host: string; port: number }>
```

## 元数据和注册表

### .meta()

向模式附加任意元数据。

```typescript
const UserSchema = z.object({
  name: z.string().meta({ label: "全名", placeholder: "输入姓名" }),
  email: z.email().meta({ label: "邮箱地址" }),
})
```

### 注册表

```typescript
// 全局注册表
z.globalRegistry.register(UserSchema, {
  id: "User",
  description: "用户账户模式",
})

// 自定义类型化注册表
const uiRegistry = z.registry<{ label: string; widget: string }>()
uiRegistry.register(UserSchema.shape.name, {
  label: "姓名",
  widget: "文本输入",
})
```

## JSON Schema

### z.toJSONSchema(schema)

将 Zod 模式转换为 JSON Schema。

```typescript
const jsonSchema = z.toJSONSchema(UserSchema)
// {
//   type: "object",
//   properties: {
//     name: { type: "string" },
//     email: { type: "string", format: "email" },
//   },
//   required: ["name", "email"]
// }
```

### z.fromJSONSchema(jsonSchema)

将 JSON Schema 转换为 Zod 模式。

```typescript
const zodSchema = z.fromJSONSchema({
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "integer", minimum: 0 },
  },
  required: ["name"],
})
```

## z.function()

验证函数参数和返回类型。

```typescript
const MyFunc = z.function(
  z.tuple([z.string(), z.number()]), // 参数
  z.boolean()                         // 返回类型
)

type MyFunc = z.infer<typeof MyFunc>
// (arg0: string, arg1: number) => boolean
```

## z.instanceof()

检查值是否是类的实例。

```typescript
const ErrorSchema = z.instanceof(Error)
ErrorSchema.parse(new Error("test")) // 通过
ErrorSchema.parse("not an error")    // 失败
```

## 模板字面量

```typescript
const UserId = z.templateLiteral([z.literal("user_"), z.string()])
// 匹配："user_abc", "user_123"
// 拒绝："abc", "admin_123"

const Route = z.templateLiteral([
  z.literal("/api/"),
  z.enum(["users", "posts"]),
  z.literal("/"),
  z.string(),
])
// 匹配："/api/users/123", "/api/posts/abc"
```

## 标准模式

Zod 模式实现了标准模式接口，使它们与任何支持该接口的库兼容。

```typescript
import type { StandardSchema } from "@standard-schema/spec"

function validate(schema: StandardSchema, data: unknown) {
  return schema["~standard"].validate(data)
}

// 与 Zod 模式配合使用
validate(UserSchema, data)
```
