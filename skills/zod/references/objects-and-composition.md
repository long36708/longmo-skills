# 对象和组合参考

## 对象变体

### z.object() — 剥离未知键

```typescript
const User = z.object({
  name: z.string(),
  email: z.email(),
})

User.parse({ name: "Alice", email: "a@b.com", extra: true })
// { name: "Alice", email: "a@b.com" } — extra 被剥离
```

### z.strictObject() — 拒绝未知键

```typescript
const Config = z.strictObject({
  host: z.string(),
  port: z.number(),
})

Config.parse({ host: "localhost", port: 3000, debug: true })
// ZodError: 无法识别的键 "debug"
```

### z.looseObject() — 保留未知键

```typescript
const Proxy = z.looseObject({
  id: z.string(),
})

Proxy.parse({ id: "123", extra: true, nested: { a: 1 } })
// { id: "123", extra: true, nested: { a: 1 } }
```

## 对象方法

### .shape

访问原始形状对象以进行展开。

```typescript
const User = z.object({ name: z.string(), email: z.email() })
User.shape // { name: ZodString, email: ZodEmail }

// 用于展开
const Extended = z.object({ ...User.shape, age: z.number() })
```

### .keyof()

返回对象键的 `z.enum()`。

```typescript
const UserKey = User.keyof()
// z.enum(["name", "email"])

UserKey.parse("name")  // "name"
UserKey.parse("age")   // ZodError
```

### .extend()

向对象模式添加新字段。

```typescript
const WithAge = User.extend({ age: z.number() })
```

### .safeExtend()

在键冲突时进行编译时错误扩展。

```typescript
const WithAge = User.safeExtend({ age: z.number() })
// 如果 "age" 已存在于 User 中，则 TypeScript 错误
```

### .pick()

选择特定字段。

```typescript
const NameOnly = User.pick({ name: true })
// z.object({ name: z.string() })
```

### .omit()

移除特定字段。

```typescript
const NoPassword = User.omit({ password: true })
```

### .partial()

使所有字段变为可选。

```typescript
const PartialUser = User.partial()
// { name?: string; email?: string }

// 部分特定字段
const PartialName = User.partial({ name: true })
// { name?: string; email: string }
```

### .required()

使所有字段变为必需。

```typescript
const RequiredUser = PartialUser.required()
```

### .catchall(schema)

根据模式验证未知键。

```typescript
const Config = z.object({ host: z.string() }).catchall(z.string())
// 已知键由其模式验证，未知键必须是字符串
```

## 递归对象

使用 getter 模式（v4 — `z.lazy()` 已移除）。

```typescript
const Category = z.object({
  name: z.string(),
  get children() {
    return z.array(Category).optional()
  },
})

type Category = z.infer<typeof Category>
// { name: string; children?: Category[] | undefined }
```

## 数组

```typescript
z.array(z.string())           // string[]
z.array(z.string()).min(1)    // 至少 1 个元素
z.array(z.string()).max(10)   // 最多 10 个元素
z.array(z.string()).length(5) // 正好 5 个元素
z.array(z.string()).nonempty() // 至少 1 个，将类型缩小为 [string, ...string[]]
```

## 元组

```typescript
// 固定长度的类型化数组
z.tuple([z.string(), z.number(), z.boolean()])
// [string, number, boolean]

// 带剩余元素
z.tuple([z.string(), z.number()]).rest(z.boolean())
// [string, number, ...boolean[]]
```

## 记录

```typescript
// 带字符串键的字典
z.record(z.string(), z.number())
// Record<string, number>

// 枚举键
z.record(z.enum(["a", "b"]), z.number())
// { a: number; b: number }
```

### z.partialRecord()

值可以为 undefined。

```typescript
z.partialRecord(z.string(), z.number())
// Record<string, number | undefined>
```

### z.looseRecord()

保留额外键。

```typescript
z.looseRecord(z.string(), z.number())
```

## 映射和集合

```typescript
z.map(z.string(), z.number())       // Map<string, number>
z.set(z.string())                    // Set<string>
z.set(z.string()).min(1)             // 至少 1 个元素
z.set(z.string()).max(10)            // 最多 10 个元素
z.set(z.string()).nonempty()         // 非空集合
```

## 联合类型

### z.union()

顺序匹配 — 按顺序尝试每个分支。

```typescript
z.union([z.string(), z.number()])
// string | number
```

### z.discriminatedUnion()

基于共享判别器字段的 O(1) 分发。

```typescript
z.discriminatedUnion("type", [
  z.object({ type: z.literal("a"), value: z.string() }),
  z.object({ type: z.literal("b"), count: z.number() }),
])
```

### z.xor()

必须恰好匹配一个。

```typescript
z.xor(
  z.object({ email: z.email() }),
  z.object({ phone: z.string() }),
)
// 必须有 email 或 phone，不能同时有
```

## 交集

```typescript
z.intersection(
  z.object({ name: z.string() }),
  z.object({ age: z.number() }),
)
// { name: string; age: number }
```

对于对象合并，优先使用 `.extend()` 或展开而不是交集 — 交集在键重叠时有边缘情况。
