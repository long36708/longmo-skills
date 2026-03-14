---
name: typescript-best-practices
description: 此技能应在使用 TypeScript 编写代码时使用。提供全面的 TypeScript 最佳实践，包括类型定义、泛型、工具类型、类型守卫、模块系统和配置。专注于提升代码质量、类型安全和开发体验。
---

# TypeScript 最佳实践

此技能提供了使用 TypeScript 编写高质量、可维护代码的全面最佳实践。这些实践基于真实项目的成功经验，专注于类型安全、代码可维护性和开发体验。

## 何时使用此技能

在以下情况下使用此技能：
- 使用 TypeScript 编写新功能
- 重构现有 TypeScript 代码
- 设计类型系统和 API
- 优化 TypeScript 配置
- 解决类型错误
- 提高 TypeScript 代码质量

## TypeScript 配置

### 项目配置

使用适合项目的 TypeScript 配置：

```json
{
  "include": ["./src/**/*"],
  "compilerOptions": {
    "target": "es2020",
    "lib": ["es2020", "DOM", "DOM.Iterable"],
    "module": "es2020",
    "moduleResolution": "bundler",
    "allowJs": true,
    "checkJs": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist/",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true
  }
}
```

**关键配置选项：**
- `target`: 指定编译目标
- `module`: 指定模块系统
- `allowJs`: 允许混合使用 JavaScript 文件
- `checkJs`: 检查 JavaScript 文件的类型
- `declaration`: 生成类型声明文件（`.d.ts`）
- `strict`: 启用严格模式（渐进式启用）

### 严格模式策略

渐进式启用严格模式：

```json
{
  "compilerOptions": {
    // 渐进式启用
    "strictNullChecks": false,      // 第一步：null/undefined 检查
    "strictFunctionTypes": false,     // 第二步：函数类型检查
    "noImplicitAny": false,          // 第三步：禁用隐式 any
    "strict": true                    // 最终：完全严格模式
  }
}
```

## 类型定义模式

### 基础常量类型定义

使用 `as const` 创建不可变的字面量类型：

```typescript
// 定义事件常量
export const ComponentEvents = {
  CLICK: 'click',
  CHANGE: 'change',
  SUBMIT: 'submit',
} as const;

// 推断为 'click' | 'change' | 'submit'
export type ComponentEventType = (typeof ComponentEvents)[keyof typeof ComponentEvents];

// 定义属性常量
export const ComponentProps = {
  VALUE: 'value',
  LABEL: 'label',
  DISABLED: 'disabled',
} as const;

export type ComponentPropsType = typeof ComponentProps;
```

**优势：**
- 自动推断联合类型
- 防止拼写错误
- 提供代码补全
- 编译时验证

### 复杂状态类型

使用映射类型定义复杂状态：

```typescript
// 定义状态所有者
export type StateOwner = Partial<HTMLVideoElement> &
  Pick<
    HTMLMediaElement,
    'play' | 'pause' | 'addEventListener'
  > & {
    customProperty?: string;
    additionalData?: Record<string, any>;
  };

// 定义状态类型
export type ComponentState = {
  [K in keyof StateOwner]: StateOwner[K];
};
```

### 联合类型与字面量类型

定义灵活的联合类型：

```typescript
// 定义角色类型
export type UserRole =
  | 'admin'
  | 'user'
  | 'guest'
  | 'moderator';

// 定义配置选项
export type ThemeMode = 'light' | 'dark' | 'auto';

// 带有条件的联合类型
export type Status = 'loading' | 'success' | 'error';

export type StatusResult<T, E = Error> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };
```

## 工具类型的使用

### 基础工具类型

使用 TypeScript 内置工具类型：

```typescript
// Partial - 使所有属性可选
export type PartialUser = Partial<User>;

// Required - 使所有属性必需
export type RequiredUser = Required<User>;

// Readonly - 使所有属性只读
export type ReadonlyUser = Readonly<User>;

// Pick - 选择特定属性
export type UserContact = Pick<User, 'email' | 'phone'>;

// Omit - 排除特定属性
export type UserWithoutPassword = Omit<User, 'password'>;

// Record - 创建对象类型
export type StringMap<T> = Record<string, T>;
```

### 高级映射类型

创建自定义映射类型：

```typescript
// 将所有键转换为小写
type LowercaseKeys<T extends Record<string, any>> = {
  [K in keyof T as Lowercase<K & string>]: T[K];
};

export type LowercaseProps = LowercaseKeys<{
  UserName: string;
  UserEmail: string;
}>; // { username: string; useremail: string; }

// 将所有值转换为大写字符串
type UppercaseValues<T extends Record<string, string>> = {
  [K in keyof T]: Uppercase<T[K]>;
};

// 移除只读修饰符
type Writeable<T> = {
  -readonly [P in keyof T]: T[P];
};

// 深度可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};
```

### 条件类型

使用条件类型创建灵活的类型：

```typescript
// 根据条件选择类型
type NonNullable<T> = T extends null | undefined ? never : T;

// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

// 提取数组元素类型
type ArrayElement<T> = T extends (infer U)[] ? U : never;

// 提取 Promise 解包类型
type Unpacked<T> = T extends Promise<infer U> ? U : T;

// 检查类型是否包含特定属性
type HasProperty<T, K extends string> = K extends keyof T ? true : false;
```

### 模板字面量类型

使用模板字面量创建动态类型：

```typescript
// CSS 类名前缀类型
type CSSClass = `prefix-${string}`;

// 事件名称类型
type EventHandlerName = `on${Capitalize<string>}`;

// API 路径类型
type ApiPath = `/api/${'users' | 'posts'}/${number}`;

// 组合字面量
type Color = `rgb(${number}, ${number}, ${number})`;
type Size = `${number}px` | `${number}%` | `${number}rem`;
```

## 泛型的使用

### 基础泛型函数

定义可重用的泛型函数：

```typescript
// 身份函数
export function identity<T>(arg: T): T {
  return arg;
}

// 数组映射
export function map<T, U>(array: T[], fn: (item: T) => U): U[] {
  return array.map(fn);
}

// 数组过滤
export function filter<T>(
  array: T[],
  predicate: (item: T) => boolean
): T[] {
  return array.filter(predicate);
}

// 数组查找
export function find<T>(
  array: T[],
  predicate: (item: T) => boolean
): T | undefined {
  return array.find(predicate);
}
```

### 泛型约束

使用泛型约束确保类型安全：

```typescript
// 约束为特定类型
export function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

// 约束为构造函数
export function createInstance<T extends new (...args: any[]) => any>(
  ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new ctor(...args);
}

// 多重约束
export function merge<T extends object, U extends object>(
  obj1: T,
  obj2: U
): T & U {
  return { ...obj1, ...obj2 };
}
```

### 泛型默认值

为泛型参数提供默认类型：

```typescript
// 带有默认值的泛型
export function createStore<T = any>(initialState: T) {
  // 实现
}

// 条件默认值
export function pick<T, K extends keyof T = keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  // 实现
}
```

### 泛型工具函数

创建类型安全的工具函数：

```typescript
// 类型安全的属性访问
export function getProperty<T, K extends keyof T>(
  obj: T,
  key: K
): T[K] {
  return obj[key];
}

// 类型安全的属性设置
export function setProperty<T, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K]
): void {
  obj[key] = value;
}

// 深度获取
export function deepGet<T>(
  obj: any,
  path: string
): T | undefined {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}
```

## 类型守卫和类型断言

### 类型守卫函数

创建类型守卫来缩小类型范围：

```typescript
// 数字检查
export function isNumber(x: unknown): x is number {
  return typeof x === 'number' && !Number.isNaN(x) && Number.isFinite(x);
}

// 字符串检查
export function isString(x: unknown): x is string {
  return typeof x === 'string';
}

// 对象检查
export function isObject(x: unknown): x is Record<string, any> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

// 数组检查
export function isArray<T>(x: unknown, itemType?: (item: unknown) => item is T): x is T[] {
  if (!Array.isArray(x)) return false;
  if (!itemType) return true;
  return x.every(itemType);
}
```

### 自定义类型守卫

为自定义类型创建守卫：

```typescript
// 接口守卫
export function isHTMLElement(element: unknown): element is HTMLElement {
  return element instanceof HTMLElement;
}

// 字面量守卫
export function isStatus(value: string): value is Status {
  return ['loading', 'success', 'error'].includes(value as any);
}

// 联合类型守卫
export function isError(result: StatusResult<any>): result is { status: 'error'; error: Error } {
  return result.status === 'error';
}
```

### 类型断言使用

谨慎使用类型断言：

```typescript
// as 断言
const element = document.getElementById('my-element') as HTMLElement;

// 类型守卫优于断言
const element = document.getElementById('my-element');
if (element instanceof HTMLElement) {
  // TypeScript 知道 element 是 HTMLElement
}

// 非空断言
const value = getValue()!; // 确保 value 非空

// 可选链和空值合并
const value = object?.property ?? defaultValue;
```

### 类型谓词

使用类型谓词进行过滤：

```typescript
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// 使用示例
const items = [1, null, 2, undefined, 3].filter(isDefined);
// items: number[]
```

## 模块系统和导入/导出

### 命名导出

使用命名导出提高代码可读性：

```typescript
// constants.ts
export const API_URL = 'https://api.example.com';
export const TIMEOUT = 5000;

export type User = {
  id: number;
  name: string;
  email: string;
};

export function getUser(id: number): Promise<User> {
  // 实现
}
```

### 默认导出

使用默认导出作为主要接口：

```typescript
// userService.ts
class UserService {
  async getUser(id: number): Promise<User> {
    // 实现
  }

  async createUser(data: User): Promise<User> {
    // 实现
  }
}

export default UserService;
```

### 类型重导出

聚合和重导出类型：

```typescript
// types/index.ts
export * from './user';
export * from './product';
export * from './order';

// 或者重命名导出
export { User as UserType } from './user';
export type { User } from './user';
```

### 动态导入

使用动态导入实现代码分割：

```typescript
export async function loadComponent(name: string) {
  switch (name) {
    case 'button':
      return import('./components/button');
    case 'modal':
      return import('./components/modal');
    default:
      throw new Error(`Unknown component: ${name}`);
  }
}
```

## 类型推断的使用

### 函数返回值推断

让 TypeScript 自动推断返回类型：

```typescript
// 自动推断返回类型为 string
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 自动推断条件类型
export function getValue<T>(value: T, defaultValue: T) {
  return value ?? defaultValue;
}
```

### 泛型推断

使用泛型推断简化代码：

```typescript
// 自动推断泛型参数
export function createArray<T>(...items: T[]): T[] {
  return items;
}

const numbers = createArray(1, 2, 3); // number[]
const strings = createArray('a', 'b', 'c'); // string[]

// 从返回值推断
export function pipe<T, U>(fn1: (x: T) => U) {
  return (arg: T) => fn1(arg);
}
```

### 对象字面量推断

使用 const 断言精确推断：

```typescript
// 推断为 { x: number; y: number; }
const point = { x: 0, y: 0 } as const;

// 推断为只读元组
const coordinates = [100, 200] as const;
// readonly [100, 200]

// 准确的属性类型
const config = {
  timeout: 5000,
  retries: 3,
  enabled: true,
} as const;
// { readonly timeout: 5000; readonly retries: 3; readonly enabled: true; }
```

## 类型声明和 JSDoc

### JSDoc 类型注释

使用 JSDoc 补充类型信息：

```typescript
/**
 * 获取用户信息
 * @param {number} userId - 用户 ID
 * @param {boolean} includeProfile - 是否包含个人资料
 * @returns {Promise<User>} 用户信息
 */
export async function getUser(
  userId: number,
  includeProfile = false
): Promise<User> {
  // 实现
}

/**
 * 配置选项
 * @typedef {Object} ConfigOptions
 * @property {number} [timeout=5000] - 超时时间（毫秒）
 * @property {number} [retries=3] - 重试次数
 * @property {boolean} [enabled=true] - 是否启用
 */

/**
 * 初始化配置
 * @param {ConfigOptions} options - 配置选项
 */
export function init(options: ConfigOptions) {
  // 实现
}
```

### 泛型 JSDoc

为泛型添加文档：

```typescript
/**
 * 创建数组
 * @template T - 数组元素类型
 * @param {T} items - 数组元素
 * @returns {T[]} 新数组
 */
export function createArray<T>(...items: T[]): T[] {
  return items;
}

/**
 * 映射数组
 * @template T - 输入类型
 * @template U - 输出类型
 * @param {T[]} array - 输入数组
 * @param {(item: T) => U} mapper - 映射函数
 * @returns {U[]} 映射后的数组
 */
export function map<T, U>(array: T[], mapper: (item: T) => U): U[] {
  return array.map(mapper);
}
```

## 错误处理和类型安全

### 错误类型定义

定义详细的错误类型：

```typescript
// 基础错误类型
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// 网络错误
export interface NetworkError extends AppError {
  code: 'NETWORK_ERROR';
  statusCode?: number;
  url?: string;
}

// 验证错误
export interface ValidationError extends AppError {
  code: 'VALIDATION_ERROR';
  field: string;
  value: any;
}

// 联合错误类型
export type ErrorType = NetworkError | ValidationError;

// 创建错误的类型安全工厂
export function createError(code: string, message: string): AppError {
  return { code, message };
}
```

### Never 类型

使用 never 类型确保代码安全：

```typescript
// 类型检查后使用 never
export function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}

// 在 switch 语句中使用
switch (status) {
  case 'loading':
    // 处理加载
    break;
  case 'success':
    // 处理成功
    break;
  case 'error':
    // 处理错误
    break;
  default:
    return assertNever(status); // 如果添加新状态，编译器会报错
}
```

## 性能优化

### 类型优化

优化类型以提高编译速度：

```typescript
// 使用 interface 而不是 type（当需要扩展时）
interface User {
  name: string;
  age: number;
}

// 使用 type 而不是 interface（当使用联合或工具类型时）
type StatusResult<T, E = Error> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

// 避免复杂的类型计算
// 不好：每次都计算
type Complex<T> = Pick<Partial<Omit<T, 'id'>>, 'name' | 'email'>;

// 好：预先定义
type BaseUserInfo = Pick<User, 'name' | 'email'>;
type Complex<T> = Partial<BaseUserInfo>;
```

### 类型推断缓存

使用类型别名缓存复杂类型：

```typescript
// 缓存重复使用的类型
type UserMap = Map<number, User>;
type UserCache = Record<number, User>;

// 避免重复定义相同的类型
export function getUser(id: number, cache?: UserCache): User {
  // 使用缓存类型
}
```

## 测试和类型

### 类型测试

使用类型测试确保类型正确：

```typescript
// 类型断言
type Assert<T extends true> = T;

// 测试类型
type Test1 = Assert<keyof User extends 'name' | 'age' ? true : false>;

// 使用条件类型进行验证
type Extracted = Extract<User['role'], 'admin' | 'user'>;

// 测试联合类型
type AllKeys = keyof User;
type RequiredKeys = Required<User>;
```

### Mock 类型

为测试创建类型安全的 Mock：

```typescript
// 创建 Mock 类型
export type Mock<T> = {
  [P in keyof T]?: jest.Mock<T[P]>;
};

// 使用 Mock
const mockUser: Mock<User> = {
  name: jest.fn(),
  age: jest.fn(),
  email: jest.fn(),
};
```

## 常见模式和最佳实践

### 1. 类型优于 any

避免使用 `any`，使用具体类型：

```typescript
// 不好：使用 any
function processData(data: any) {
  return data.value;
}

// 好：使用具体类型
function processData(data: { value: number }) {
  return data.value;
}

// 更好：使用泛型
function processData<T extends { value: number }>(data: T): number {
  return data.value;
}
```

### 2. 使用 unknown 而不是 any

`unknown` 比 `any` 更安全：

```typescript
// 不好：any 不提供类型检查
function parseJSON(json: any): any {
  return JSON.parse(json);
}

// 好：unknown 强制类型检查
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}

// 使用：必须在使用前检查类型
const data = parseJSON(jsonString);
if (typeof data === 'object' && data !== null) {
  // TypeScript 现在知道 data 是 object
}
```

### 3. 优先使用 readonly

使用 readonly 防止意外修改：

```typescript
// 定义只读配置
export const CONFIG: Readonly<Config> = {
  timeout: 5000,
  retries: 3,
};

// 函数参数使用 readonly
export function processItems(items: readonly string[]): void {
  // items 不能被修改
}
```

### 4. 使用 keyof 和操作符

利用 TypeScript 的类型操作符：

```typescript
// keyof 获取所有键
type UserKeys = keyof User;

// typeof 获取值的类型
type UserRoles = User['role'];

// in 遍历键
type UserGetters = {
  [K in keyof User]: () => User[K];
};

// extends 约束类型
type HasId = T extends { id: number } ? T : never;
```

### 5. 类型守卫优于类型断言

优先使用类型守卫而不是断言：

```typescript
// 不好：类型断言
const element = document.getElementById('id') as HTMLInputElement;

// 好：类型守卫
const element = document.getElementById('id');
if (element instanceof HTMLInputElement) {
  // 安全地使用 element
}
```

## 总结清单

使用 TypeScript 时，确保：

- ✅ 使用 `as const` 创建字面量类型
- ✅ 利用工具类型减少重复代码
- ✅ 创建泛型函数提高代码复用
- ✅ 使用类型守卫确保类型安全
- ✅ 优先使用 `unknown` 而不是 `any`
- ✅ 使用 `readonly` 防止意外修改
- ✅ 为公共 API 添加 JSDoc 注释
- ✅ 使用映射类型定义派生类型
- ✅ 渐进式启用严格模式
- ✅ 创建类型测试验证正确性
- ✅ 优化复杂类型提高性能
- ✅ 使用条件类型处理复杂逻辑
- ✅ 利用模板字面量类型
- ✅ 组织类型定义提高可维护性
- ✅ 使用类型别名提高可读性
