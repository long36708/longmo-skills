# Zod 反模式

## 目录

- 使用 parse() 配合 try/catch 而不是 safeParse()
- 同步解析带有异步精化
- 手动类型定义与模式并存
- 已弃用的字符串格式链式调用（v4）
- 使用 z.nativeEnum()（v4）
- 使用 required_error/invalid_type_error（v4）
- 使用 z.formatError()（v4）
- 在精化或转换中抛出异常
- 对字符串布尔值使用 z.coerce.boolean()
- 假设 z.object() 保留未知键
- 对带标签的对象使用 z.union()
- 生产环境中使用 reportInput
- 对递归模式使用 z.lazy()（v4）
- 重复字段定义

## 使用 parse() 配合 try/catch 而不是 safeParse()

```typescript
// 不好: 冗长，捕获无关错误
try {
  const user = UserSchema.parse(data)
  return { success: true, data: user }
} catch (e) {
  if (e instanceof z.ZodError) {
    return { success: false, errors: e.issues }
  }
  throw e
}

// 正确: 判别式结果
const result = UserSchema.safeParse(data)
if (result.success) {
  return { success: true, data: result.data }
} else {
  return { success: false, errors: result.error.issues }
}
```

## 同步解析带有异步精化

```typescript
// 不好: 抛出异常，因为精化是异步的
const Schema = z.email().refine(async (e) => !(await db.exists(e)))
Schema.safeParse(data) // 抛出异常

// 正确: 使用 safeParseAsync
await Schema.safeParseAsync(data)
```

## 手动类型定义与模式并存

```typescript
// 不好: 类型与模式分离
interface User {
  name: string
  email: string
}

const UserSchema = z.object({
  name: z.string(),
  email: z.email(),
  age: z.number(), // 添加到模式，忘记接口
})

// 正确: 从模式推断
type User = z.infer<typeof UserSchema>
```

## 已弃用的字符串格式链式调用（v4）

```typescript
// 不好: v4 中已弃用
z.string().email()
z.string().url()
z.string().uuid()

// 正确: 顶级格式函数
z.email()
z.url()
z.uuid()
```

## 使用 z.nativeEnum()（v4）

```typescript
enum Status { Active = "active", Inactive = "inactive" }

// 不好: v4 中已移除
z.nativeEnum(Status)

// 正确: 统一的 z.enum()
z.enum(Status)
```

## 使用 required_error/invalid_type_error（v4）

```typescript
// 不好: v4 中已移除
z.string({ required_error: "Required", invalid_type_error: "Not a string" })
z.number().min(5, { message: "Too small" })

// 正确: 统一的错误参数
z.string({ error: "Required" })
z.number().min(5, { error: "Too small" })
z.number().min(5, "Too small") // 简写形式
```

## 使用 z.formatError()（v4）

```typescript
// 不好: 已弃用
z.formatError(error)

// 正确: 使用正确的格式化器
z.flattenError(error)   // 用于扁平表单
z.treeifyError(error)   // 用于嵌套结构
z.prettifyError(error)  // 用于日志记录
```

## 在精化或转换中抛出异常

```typescript
// 不好: 绕过 Zod 错误处理
z.number().refine((n) => {
  if (n <= 0) throw new Error("必须是正数")
  return true
})

z.string().transform((val) => {
  const n = parseInt(val)
  if (isNaN(n)) throw new Error("不是数字")
  return n
})

// 正确: 从 refine 返回布尔值
z.number().refine((n) => n > 0, { error: "必须是正数" })

// 正确: 先验证后转换
z.string()
  .refine((val) => !isNaN(parseInt(val)), { error: "不是数字" })
  .transform((val) => parseInt(val))

// 最好: 使用 pipe 进行分阶段解析
z.string().pipe(z.coerce.number()).pipe(z.number().positive())
```

## 对字符串布尔值使用 z.coerce.boolean()

```typescript
// 不好: Boolean("false") === true
z.coerce.boolean().parse("false") // true
z.coerce.boolean().parse("0")     // true

// 正确: z.stringbool() 正确处理字符串布尔值
z.stringbool().parse("false") // false
z.stringbool().parse("0")     // false
```

## 假设 z.object() 保留未知键

```typescript
// 不好: 未知键被静默剥离
const data = { name: "Alice", role: "admin", debug: true }
z.object({ name: z.string() }).parse(data)
// { name: "Alice" } — role 和 debug 消失了

// 正确: 明确选择
z.strictObject({ name: z.string() }) // 拒绝未知
z.looseObject({ name: z.string() })  // 保留未知
```

## 对带标签的对象使用 z.union()

```typescript
// 不好: 顺序匹配，错误消息差
z.union([
  z.object({ type: z.literal("a"), value: z.string() }),
  z.object({ type: z.literal("b"), count: z.number() }),
])

// 正确: 基于判别器的 O(1) 分发
z.discriminatedUnion("type", [
  z.object({ type: z.literal("a"), value: z.string() }),
  z.object({ type: z.literal("b"), count: z.number() }),
])
```

## 生产环境中使用 reportInput

```typescript
// 不好: 泄漏敏感数据到错误日志
app.post("/login", (req, res) => {
  const result = schema.safeParse(req.body, { reportInput: true })
  if (!result.success) {
    logger.error(result.error.issues) // 可能包含密码
  }
})

// 正确: 仅开发环境使用
schema.safeParse(req.body, {
  reportInput: process.env.NODE_ENV === "development",
})
```

## 对递归模式使用 z.lazy()（v4）

```typescript
// 不好: z.lazy() 在 v4 中已移除
const Tree = z.object({
  value: z.string(),
  children: z.lazy(() => z.array(Tree)),
})

// 正确: getter 模式
const Tree = z.object({
  value: z.string(),
  get children() {
    return z.array(Tree).optional()
  },
})
```

## 重复字段定义

```typescript
// 不好: 字段重复 — 会分离
const CreateUser = z.object({ name: z.string(), email: z.email() })
const UpdateUser = z.object({ name: z.string().optional(), email: z.email().optional() })

// 正确: 从基础派生
const User = z.object({ name: z.string(), email: z.email() })
const CreateUser = User
const UpdateUser = User.partial()
```
