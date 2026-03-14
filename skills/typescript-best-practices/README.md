# TypeScript 最佳实践

这个技能提供了使用 TypeScript 编写高质量、可维护代码的全面最佳实践。

## 内容

### SKILL.md
主要技能文档，包含：
- TypeScript 配置
- 类型定义模式
- 工具类型的使用
- 泛型的使用
- 类型守卫和类型断言
- 模块系统和导入/导出
- 类型推断的使用
- 错误处理和类型安全
- 性能优化
- 测试和类型
- 常见模式和最佳实践

## 核心特性

### 1. 类型安全
- 严格的类型检查
- 类型守卫
- 类型推断
- 工具类型

### 2. 代码复用
- 泛型函数
- 映射类型
- 条件类型
- 模板字面量类型

### 3. 可维护性
- 类型别名
- JSDoc 注释
- 模块化组织
- 类型测试

### 4. 开发体验
- 代码补全
- 类型错误提示
- 重构支持
- IDE 集成

### 5. 最佳实践
- 避免使用 `any`
- 使用 `unknown` 代替 `any`
- 优先使用 `readonly`
- 类型守卫优于类型断言

## 使用方法

当使用 TypeScript 时，此技能提供：

1. **配置指导** - 如何配置 TypeScript 编译器
2. **类型定义** - 如何定义和使用类型
3. **泛型使用** - 如何创建可重用的泛型代码
4. **类型守卫** - 如何进行类型检查和断言
5. **工具类型** - 如何使用和创建工具类型
6. **模块系统** - 如何组织和导出类型
7. **错误处理** - 如何定义和处理错误类型
8. **性能优化** - 如何优化类型以提高编译速度

## 示例

### 基础类型定义

```typescript
// 使用 as const 创建字面量类型
export const ComponentEvents = {
  CLICK: 'click',
  CHANGE: 'change',
} as const;

export type ComponentEventType = (typeof ComponentEvents)[keyof typeof ComponentEvents];
```

### 泛型函数

```typescript
export function identity<T>(arg: T): T {
  return arg;
}

const result = identity<string>('hello'); // string
```

### 类型守卫

```typescript
export function isNumber(x: unknown): x is number {
  return typeof x === 'number' && !Number.isNaN(x);
}

if (isNumber(value)) {
  // TypeScript 知道 value 是 number
}
```

### 工具类型

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type PartialUser = DeepPartial<User>;
```

## 测试

请参阅 SKILL.md 获取全面的测试示例，涵盖：
- 类型测试
- 类型断言
- 类型守卫
- 错误处理

## 贡献

这个技能基于真实项目的 TypeScript 使用经验。它提供了通用的、可重用的模式，适用于任何 TypeScript 项目。
