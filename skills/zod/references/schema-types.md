# 模式类型参考

## 基本类型

```typescript
z.string()     // 字符串
z.number()     // 数字（整数或浮点数）
z.boolean()    // 布尔值
z.bigint()     // 大整数
z.date()       // Date 实例
z.symbol()     // 符号
z.undefined()  // undefined
z.null()       // null
z.void()       // void (undefined)
z.any()        // any — 绕过类型检查
z.unknown()    // unknown — 比 any 更安全
z.never()      // never — 总是失败
```

## 字符串

### 约束

```typescript
z.string().min(5)           // 最小长度
z.string().max(100)         // 最大长度
z.string().length(10)       // 精确长度
z.string().regex(/^[a-z]+$/) // 正则表达式模式
z.string().trim()           // 修剪空白（转换）
z.string().toLowerCase()    // 转换为小写（转换）
z.string().toUpperCase()    // 转换为大写（转换）
z.string().startsWith("https://")
z.string().endsWith(".com")
z.string().includes("@")
```

### 顶级字符串格式（v4）

```typescript
z.email()       // 邮箱地址
z.url()         // URL
z.uuid()        // UUID (v4)
z.cuid()        // CUID
z.cuid2()       // CUID2
z.ulid()        // ULID
z.emoji()       // 表情符号字符
z.nanoid()      // Nano ID
z.ipv4()        // IPv4 地址
z.ipv6()        // IPv6 地址
z.cidrv4()      // CIDR v4 表示法
z.cidrv6()      // CIDR v6 表示法
z.jwt()         // JSON Web Token
z.base64()      // Base64 字符串
z.base64url()   // Base64url 字符串
```

### ISO 日期/时间字符串

```typescript
z.iso.date()      // "2024-01-15"
z.iso.time()      // "13:45:30"
z.iso.datetime()  // "2024-01-15T13:45:30Z"
z.iso.duration()  // "P3Y6M4DT12H30M5S"
```

### 模板字面量

```typescript
// 验证与模板模式匹配的字符串
const UserID = z.templateLiteral([z.literal("user_"), z.string()])
// 匹配: "user_abc123", "user_xyz"
// 拒绝: "abc123", "admin_xyz"
```

## 数字

```typescript
z.number()                // 任何数字
z.int()                   // 仅整数
z.float()                 // 浮点数（number 的别名）

// 约束
z.number().min(0)         // >= 0
z.number().max(100)       // <= 100
z.number().positive()     // > 0
z.number().negative()     // < 0
z.number().nonnegative()  // >= 0
z.number().nonpositive()  // <= 0
z.number().multipleOf(5)  // 可被 5 整除
z.number().finite()       // 不是 Infinity
z.number().safe()         // 在 Number.MAX_SAFE_INTEGER 范围内
```

## 大整数

```typescript
z.bigint()
z.bigint().min(0n)
z.bigint().max(100n)
z.bigint().positive()
z.bigint().negative()
z.bigint().nonnegative()
z.bigint().nonpositive()
z.bigint().multipleOf(5n)
```

## 布尔值

```typescript
z.boolean()        // true 或 false
z.literal(true)    // 仅 true
z.literal(false)   // 仅 false
```

## 日期

```typescript
z.date()                           // Date 实例
z.date().min(new Date("2020-01-01")) // 在日期之后
z.date().max(new Date("2030-01-01")) // 在日期之前
```

## 枚举

```typescript
// 字符串字面量数组
z.enum(["active", "inactive", "pending"])

// TypeScript 枚举（v4 — 统一，不再有 nativeEnum）
enum Status {
  Active = "active",
  Inactive = "inactive",
}
z.enum(Status)

// 数字枚举
enum Priority {
  Low = 0,
  Medium = 1,
  High = 2,
}
z.enum(Priority)
```

## 字符串布尔值

将字符串布尔表示转换为实际布尔值。

```typescript
z.stringbool()
// 接受: "true"/"false", "1"/"0", "yes"/"no", "on"/"off"
// 返回: boolean

z.stringbool().parse("true")   // true
z.stringbool().parse("false")  // false
z.stringbool().parse("1")      // true
z.stringbool().parse("0")      // false
z.stringbool().parse("yes")    // true
z.stringbool().parse("no")     // false
```

## 字面量

```typescript
z.literal("hello")   // 正好是 "hello"
z.literal(42)        // 正好是 42
z.literal(true)      // 正好是 true
z.literal(null)      // 正好是 null
z.literal(undefined) // 正好是 undefined
z.literal(100n)      // 正好是 100n (bigint)
```

## 文件

```typescript
z.file()                         // File 实例
z.file().min(1024)               // 最小大小（字节）
z.file().max(5 * 1024 * 1024)    // 最大大小（5MB）
z.file().type("image/png")       // MIME 类型
z.file().type("image/*")         // MIME 类型通配符
```

## JSON

```typescript
// 验证输入是有效的 JSON 字符串，然后解析它
z.json()

z.json().parse('{"name":"Alice"}')  // { name: "Alice" }
z.json().parse("invalid json")     // ZodError
```

## 自定义类型

```typescript
// 带有验证函数的自定义类型
const NonEmptyString = z.custom<string>(
  (val) => typeof val === "string" && val.length > 0,
  { error: "必须是非空字符串" }
)
```

## 可选、可为空、可为空值

```typescript
z.string().optional()   // string | undefined
z.string().nullable()   // string | null
z.string().nullish()    // string | null | undefined
```

## 强制转换

```typescript
z.coerce.string()   // String(input)
z.coerce.number()   // Number(input)
z.coerce.boolean()  // Boolean(input) — 注意: Boolean("false") === true
z.coerce.bigint()   // BigInt(input)
z.coerce.date()     // new Date(input)
```
