# 解析和类型推断参考

## 解析方法

### parse(data)

解析输入并返回验证后的数据。失败时抛出 `ZodError`。

```typescript
const result = UserSchema.parse(data) // 返回 User 或抛出错误
```

当无效数据确实是异常情况时使用（内部配置、常量）。

### safeParse(data)

返回一个判别式联合 — 从不抛出。

```typescript
const result = UserSchema.safeParse(data)
if (result.success) {
  result.data // 类型化为 User
} else {
  result.error // ZodError
}
```

对于所有用户输入、API 边界、表单数据优先使用。

### parseAsync(data)

当模式包含异步精化或转换时需要。失败时抛出。

```typescript
const result = await UserSchema.parseAsync(data)
```

### safeParseAsync(data)

safeParse 的异步版本。需要异步精化/转换时使用。

```typescript
const result = await UserSchema.safeParseAsync(data)
if (result.success) {
  result.data
} else {
  result.error
}
```

### When to Use Which

| Method | Throws | Async | Use When |
|--------|--------|-------|----------|
| `parse()` | Yes | No | Internal data, config — invalid = bug |
| `safeParse()` | No | No | User input, API — invalid = expected |
| `parseAsync()` | Yes | Yes | Async refinements, internal data |
| `safeParseAsync()` | No | Yes | Async refinements, user input |

## 类型推断

### z.infer<typeof Schema>

提取**输出**类型（转换后的类型）。

```typescript
const UserSchema = z.object({
  name: z.string(),
  createdAt: z.string().transform((s) => new Date(s)),
})

type User = z.infer<typeof UserSchema>
// { name: string; createdAt: Date }
```

### z.input<typeof Schema>

提取**输入**类型（转换前的类型）。

```typescript
type UserInput = z.input<typeof UserSchema>
// { name: string; createdAt: string }
```

对于表单状态、请求体或任何处理转换前数据的上下文非常有用。

### z.output<typeof Schema>

`z.infer` 的别名。提取输出类型。

```typescript
type User = z.output<typeof UserSchema>
// 与 z.infer<typeof UserSchema> 相同
```

### 输入与输出示例

```typescript
const FormSchema = z.object({
  age: z.string().pipe(z.coerce.number()),        // string → number
  active: z.stringbool(),                          // string → boolean
  date: z.string().transform((s) => new Date(s)), // string → Date
})

type FormInput = z.input<typeof FormSchema>
// { age: string; active: string; date: string }

type FormOutput = z.infer<typeof FormSchema>
// { age: number; active: boolean; date: Date }
```

## 强制转换命名空间

强制转换模式在验证前应用 JavaScript 构造函数。

```typescript
z.coerce.string()   // String(input) → 然后验证为字符串
z.coerce.number()   // Number(input) → 然后验证为数字
z.coerce.boolean()  // Boolean(input) → 然后验证为布尔值
z.coerce.bigint()   // BigInt(input) → 然后验证为大整数
z.coerce.date()     // new Date(input) → 然后验证为日期
```

### 强制转换陷阱：布尔值

```typescript
z.coerce.boolean().parse("false") // true — Boolean("false") 为 true
z.coerce.boolean().parse("")      // false — Boolean("") 为 false
z.coerce.boolean().parse("0")     // true — Boolean("0") 为 true

// 对于表单/环境变量的字符串→布尔值转换，使用 z.stringbool()
z.stringbool().parse("false") // false
z.stringbool().parse("0")     // false
```

## 解析选项

```typescript
// reportInput — 在错误问题中包含原始输入
schema.safeParse(data, { reportInput: true })
// error.issues[0].input 将包含原始值

// 仅在开发环境中使用 — 在生产环境中会泄露敏感数据
schema.safeParse(data, {
  reportInput: process.env.NODE_ENV === "development",
})
```
