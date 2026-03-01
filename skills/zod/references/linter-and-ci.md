# Zod 的代码检查和 CI 规则

## 概述

机械执行在代码审查之前捕获错误。使用 ESLint 规则、CI 检查和静态分析工具自动强制执行 Zod 最佳实践。

## ESLint: `no-restricted-syntax` 规则

### 在应用程序代码中禁止 `parse()`

强制使用 `safeParse()`。`parse()` 会抛出异常，导致未处理的异常。

```jsonc
// .eslintrc.json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.property.name='parse'][callee.object.type!='ThisExpression']",
        "message": "使用 safeParse() 而不是 parse()。parse() 在无效输入时抛出异常。参见: rules/parse-use-safeParse.md"
      }
    ]
  }
}
```

要在特定文件中允许 `parse()`（例如，环境配置中在无效环境时崩溃是故意的），请使用 ESLint 覆盖：

```jsonc
{
  "overrides": [
    {
      "files": ["**/config/env.ts", "**/env.ts"],
      "rules": {
        "no-restricted-syntax": "off"
      }
    }
  ]
}
```

### 检测 `reportInput` 使用

`reportInput: true` 在生产环境中泄漏敏感数据。

```jsonc
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "Property[key.name='reportInput'][value.value=true]",
        "message": "reportInput: true 在生产环境中泄漏敏感数据。使用: reportInput: process.env.NODE_ENV === 'development'。参见: rules/error-input-security.md"
      }
    ]
  }
}
```

### 禁止 `z.nativeEnum()`（v4 中已移除）

```jsonc
{
  "selector": "CallExpression[callee.property.name='nativeEnum']",
  "message": "z.nativeEnum() 在 Zod v4 中已移除。请改用 z.enum(YourTSEnum)。参见: rules/migrate-native-enum.md"
}
```

### 禁止 `z.string().email()`（使用 `z.email()`）

```jsonc
{
  "selector": "CallExpression[callee.property.name='email'][callee.object.callee.property.name='string']",
  "message": "在 Zod v4 中使用 z.email() 而不是 z.string().email()。参见: rules/migrate-string-formats.md"
}
```

### 完整 ESLint 配置示例

```jsonc
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.property.name='parse'][callee.object.type!='ThisExpression']",
        "message": "使用 safeParse() 而不是 parse()。参见: rules/parse-use-safeParse.md"
      },
      {
        "selector": "Property[key.name='reportInput'][value.value=true]",
        "message": "reportInput: true 泄漏敏感数据。参见: rules/error-input-security.md"
      },
      {
        "selector": "CallExpression[callee.property.name='nativeEnum']",
        "message": "z.nativeEnum() 在 v4 中已移除。使用 z.enum()。参见: rules/migrate-native-enum.md"
      }
    ]
  },
  "overrides": [
    {
      "files": ["**/config/env.ts", "**/env.ts"],
      "rules": {
        "no-restricted-syntax": "off"
      }
    }
  ]
}
```

## CI: 模式快照回归

通过提交 JSON Schema 快照并在它们分离时使 CI 失败来检测意外的模式更改。

### 设置

```typescript
// scripts/export-schemas.ts
import { z } from "zod"
import { writeFileSync, mkdirSync } from "fs"
import { UserSchema, OrderSchema } from "../src/api/schemas"

const schemas = {
  User: UserSchema,
  Order: OrderSchema,
}

mkdirSync("snapshots", { recursive: true })

for (const [name, schema] of Object.entries(schemas)) {
  const jsonSchema = z.toJSONSchema(schema)
  writeFileSync(
    `snapshots/${name}.json`,
    JSON.stringify(jsonSchema, null, 2) + "\n"
  )
}
```

### CI 检查

```yaml
# .github/workflows/schema-check.yml
name: 模式快照检查
on: [pull_request]

jobs:
  schema-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx tsx scripts/export-schemas.ts
      - name: 检查模式分离
        run: |
          if git diff --exit-code snapshots/; then
            echo "模式未更改"
          else
            echo "::error::模式快照已更改。查看差异，如果是有意的，请更新快照。"
            git diff snapshots/
            exit 1
          fi
```

### 工作流程

1. 开发者更改模式
2. CI 运行 `export-schemas.ts` 并与提交的快照进行差异比较
3. 如果存在差异，CI 失败并显示确切的更改
4. 开发者查看差异，在本地运行 `npx tsx scripts/export-schemas.ts`，提交更新的快照

## 未使用模式检测

查找已定义但从未导入的模式。

### 使用 knip

```bash
npx knip --include exports
```

knip 检测未使用的导出，包括模式。在 `knip.json` 中配置：

```jsonc
{
  "entry": ["src/index.ts"],
  "project": ["src/**/*.ts"],
  "ignore": ["**/*.test.ts", "**/*.spec.ts"]
}
```

### 使用 ts-prune

```bash
npx ts-prune | grep -i schema
```

显示没有导入的导出符号。审查并移除死代码模式。

## 循环依赖检测

相互导入的模式创建循环依赖，导致运行时崩溃。

### 使用 madge

```bash
# 查找循环依赖
npx madge --circular --extensions ts src/

# 生成依赖图
npx madge --image graph.svg --extensions ts src/
```

### CI 集成

```yaml
- name: 检查循环依赖
  run: |
    npx madge --circular --extensions ts src/
    if [ $? -ne 0 ]; then
      echo "::error::检测到循环依赖"
      exit 1
    fi
```

## 自定义 ESLint 规则消息

在 ESLint 消息中包含修复说明，以便开发者确切知道该怎么做：

```jsonc
{
  "selector": "CallExpression[callee.property.name='parse']",
  "message": "使用 safeParse() 而不是 parse()。\n\nparse() 在无效输入时抛出 ZodError。\nsafeParse() 返回 { success, data | error }。\n\n替换：\n  schema.parse(data)\n为：\n  const result = schema.safeParse(data)\n  if (!result.success) { /* 处理错误 */ }\n\n参见: rules/parse-use-safeParse.md"
}
```

## 总结

| 工具 | 捕获什么 | 时机 |
|------|----------|------|
| ESLint `no-restricted-syntax` | 禁止的 API 使用（parse、reportInput、nativeEnum） | 保存时 / 预提交 |
| 模式快照 CI | 意外的模式更改 | 拉取请求时 |
| knip / ts-prune | 未使用的模式 | 拉取请求时 / 定期 |
| madge | 循环模式依赖 | 拉取请求时 |
