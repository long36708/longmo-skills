# 错误处理参考

## ZodError

```typescript
const result = schema.safeParse(data)
if (!result.success) {
  result.error           // ZodError 实例
  result.error.issues    // ZodIssue 数组
  result.error.message   // 问题的 JSON 字符串
  result.error.toString() // 与 .message 相同
}
```

## 问题结构

```typescript
interface ZodIssue {
  code: string        // 问题类型代码
  message: string     // 人类可读的消息
  path: (string | number)[]  // 到字段的路径
  input?: unknown     // 原始输入（仅在 reportInput: true 时）
  // ... 根据代码的附加字段
}
```

## 问题代码

| 代码 | 何时 | 额外字段 |
|------|------|----------|
| `invalid_type` | 类型错误 | `expected`, `received` |
| `too_small` | 低于最小值 | `minimum`, `inclusive`, `type` |
| `too_big` | 高于最大值 | `maximum`, `inclusive`, `type` |
| `invalid_string` | 字符串格式失败 | `validation` |
| `custom` | 自定义精化 | — |
| `invalid_enum_value` | 不在枚举中 | `options`, `received` |
| `unrecognized_keys` | 未知键（严格） | `keys` |
| `invalid_union` | 没有分支匹配 | `unionErrors` |
| `invalid_arguments` | 函数参数无效 | `argumentsError` |
| `invalid_return_type` | 函数返回无效 | `returnTypeError` |

## 错误格式化函数

### z.flattenError(error)

用于简单表单的扁平结构。

```typescript
const flat = z.flattenError(result.error)
// {
//   formErrors: ["根级错误"],
//   fieldErrors: {
//     email: ["无效邮箱"],
//     age: ["必须是正数", "必须是整数"],
//   }
// }
```

### z.treeifyError(error)

与模式形状匹配的嵌套树。用于深度嵌套表单。

```typescript
const tree = z.treeifyError(result.error)
// {
//   errors: [],
//   properties: {
//     address: {
//       errors: [],
//       properties: {
//         zip: { errors: ["必填"] }
//       }
//     }
//   }
// }
```

### z.prettifyError(error)

用于日志记录/调试的人类可读字符串。

```typescript
const pretty = z.prettifyError(result.error)
// "✖ 无效邮箱 at «email»
//  ✖ 必填 at «address.zip»"
```

### z.formatError() — 已弃用

不要使用。在 v4 中已移除。请改用 `flattenError` 或 `treeifyError`。

## 错误自定义

### 模式级别

```typescript
// 字符串简写
z.string({ error: "必须是字符串" })
z.number().min(18, { error: "必须 18 岁以上" })
z.number().min(18, "必须 18 岁以上") // 简写

// 函数形式 — 动态消息
z.string({
  error: (issue) => {
    if (issue.input === undefined) return "必填"
    return "必须是字符串"
  },
})
```

### 解析级别

```typescript
schema.safeParse(data, {
  error: (issue) => {
    // 仅覆盖此解析调用的错误
    return `验证失败: ${issue.code}`
  },
})
```

### 全局级别

```typescript
z.config({
  customError: (issue) => {
    // 全局默认错误消息
    if (issue.code === "invalid_type") {
      return `期望 ${issue.expected}，得到 ${issue.received}`
    }
  },
})
```

## 错误优先级

1. **模式级别** `error` — 最高优先级
2. **解析级别** `error` — 中等优先级
3. **全局** `z.config({ customError })` — 最低优先级

如果模式有 `error` 参数，它总是优先于解析级别和全局设置。

## reportInput 选项

在错误问题中包含原始输入值。**永远不要在生产环境中使用。**

```typescript
// 仅开发环境
const result = schema.safeParse(data, { reportInput: true })
if (!result.success) {
  result.error.issues[0].input // 包含原始值
}
```

泄漏密码、令牌、PII 到日志和错误监控中。

## i18n / 本地化

使用错误函数形式进行本地化消息。

```typescript
const t = getTranslation(locale)

const NameSchema = z.string({
  error: (issue) => {
    if (issue.input === undefined) return t("field.required")
    return t("field.invalid_string")
  },
}).min(1, { error: t("field.too_short") })
```

或者使用全局配置进行应用程序范围的本地化：

```typescript
z.config({
  customError: (issue) => {
    const t = getTranslation(currentLocale)
    switch (issue.code) {
      case "invalid_type": return t("validation.invalid_type")
      case "too_small": return t("validation.too_small", { min: issue.minimum })
      default: return t("validation.invalid")
    }
  },
})
```
