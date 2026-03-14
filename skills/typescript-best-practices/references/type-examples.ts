/**
 * TypeScript 类型示例
 * 展示各种 TypeScript 类型定义和使用模式
 */

// ===== 1. 基础类型定义 =====

// 使用 as const 创建字面量类型
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// 接口定义
export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  role: UserRoleType;
  createdAt: Date;
}

// 类型别名
export type UserId = User['id'];
export type UserName = User['name'];
export type UserEmail = User['email'];

// ===== 2. 联合类型和字面量类型 =====

export type Status = 'loading' | 'success' | 'error';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type ThemeMode = 'light' | 'dark' | 'auto';

// 带有条件的联合类型
export type ApiResponse<T, E = Error> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: E }
  | { status: 'loading' };

// ===== 3. 泛型类型 =====

// 基础泛型接口
export interface Repository<T> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
}

// 泛型函数
export function identity<T>(arg: T): T {
  return arg;
}

export function map<T, U>(array: T[], fn: (item: T) => U): U[] {
  return array.map(fn);
}

export function filter<T>(
  array: T[],
  predicate: (item: T) => boolean
): T[] {
  return array.filter(predicate);
}

export function reduce<T, U>(
  array: T[],
  fn: (acc: U, item: T) => U,
  initial: U
): U {
  return array.reduce(fn, initial);
}

// ===== 4. 工具类型 =====

// 内置工具类型示例
export type PartialUser = Partial<User>;
export type RequiredUser = Required<PartialUser>;
export type ReadonlyUser = Readonly<User>;
export type UserContact = Pick<User, 'name' | 'email'>;
export type UserWithoutPassword = Omit<User, 'password'>;

// 自定义工具类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type Nullable<T> = T | null | undefined;

// 映射类型
export type LowercaseKeys<T extends Record<string, any>> = {
  [K in keyof T as Lowercase<K & string>]: T[K];
};

export type UppercaseValues<T extends Record<string, string>> = {
  [K in keyof T]: Uppercase<T[K]>;
};

// 提取类型
export type ArrayElement<T> = T extends (infer U)[] ? U : never;
export type PromiseValue<T> = T extends Promise<infer U> ? U : never;
export type FunctionReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
export type FunctionParameters<T> = T extends (...args: infer P) => any ? P : never;

// ===== 5. 条件类型 =====

export type NonString<T> = T extends string ? never : T;
export type NonNumber<T> = T extends number ? never : T;

export type IsArray<T> = T extends any[] ? true : false;
export type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

// 条件类型嵌套
export type Flatten<T> = T extends any[]
  ? T
  : T extends (infer U)[][]
  ? U
  : T;

// ===== 6. 类型守卫 =====

// 基础类型守卫
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T>(value: unknown, guard?: (item: unknown) => item is T): value is T[] {
  if (!Array.isArray(value)) return false;
  if (!guard) return true;
  return value.every(guard);
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// 自定义类型守卫
export function isUser(value: unknown): value is User {
  return isObject(value) &&
    isNumber(value.id) &&
    isString(value.name) &&
    isString(value.email);
}

export function hasRole(value: unknown, role: UserRoleType): value is User & { role: UserRoleType } {
  return isUser(value) && value.role === role;
}

// ===== 7. 工厂模式和类型 =====

// 类型安全的工厂函数
export function createApiResponse<T>(data: T): ApiResponse<T> {
  return {
    status: 'success',
    data,
  };
}

export function createErrorResponse(error: Error): ApiResponse<never> {
  return {
    status: 'error',
    error,
  };
}

// 类型安全的存储工厂
export function createStore<T>(initialState: T): {
  getState: () => T;
  setState: (state: Partial<T>) => void;
} {
  let state = initialState;

  return {
    getState: () => state,
    setState: (newState) => {
      state = { ...state, ...newState };
    },
  };
}

// ===== 8. 函数类型 =====

// 函数类型定义
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;
export type Middleware<T = any, U = any> = (input: T) => U;
export type AsyncMiddleware<T = any, U = any> = (input: T) => Promise<U>;

// 高级函数类型
export type CurriedFunction<T extends (...args: any[]) => any> =
  T extends (a: infer A, ...args: infer P) => infer R
    ? (a: A) => CurriedFunction<(...args: P) => R>
    : T;

export type DebouncedFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

export type ThrottledFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

// ===== 9. 错误类型 =====

// 基础错误类型
export interface BaseError {
  code: string;
  message: string;
  stack?: string;
  timestamp?: Date;
}

// 网络错误
export interface NetworkError extends BaseError {
  code: 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'SERVER_ERROR';
  statusCode?: number;
  url?: string;
}

// 验证错误
export interface ValidationError extends BaseError {
  code: 'VALIDATION_ERROR';
  field: string;
  value: any;
  constraints?: Record<string, any>;
}

// 业务错误
export interface BusinessError extends BaseError {
  code: 'PERMISSION_DENIED' | 'NOT_FOUND' | 'DUPLICATE_ENTRY';
  context?: Record<string, any>;
}

// 联合错误类型
export type AppError = NetworkError | ValidationError | BusinessError;

// 错误类型守卫
export function isNetworkError(error: AppError): error is NetworkError {
  return error.code === 'NETWORK_ERROR' ||
         error.code === 'TIMEOUT_ERROR' ||
         error.code === 'SERVER_ERROR';
}

export function isValidationError(error: AppError): error is ValidationError {
  return error.code === 'VALIDATION_ERROR';
}

export function isBusinessError(error: AppError): error is BusinessError {
  return error.code === 'PERMISSION_DENIED' ||
         error.code === 'NOT_FOUND' ||
         error.code === 'DUPLICATE_ENTRY';
}

// ===== 10. 配置类型 =====

// 配置对象
export interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
  debug?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

// 配置类型工厂
export function createConfig<T extends Config>(config: T): Readonly<T> {
  return Object.freeze(config);
}

// 配置验证
export function validateConfig(config: Partial<Config>): Config {
  return {
    apiUrl: config.apiUrl ?? 'https://api.example.com',
    timeout: config.timeout ?? 5000,
    retries: config.retries ?? 3,
    debug: config.debug ?? false,
    logLevel: config.logLevel ?? 'info',
  };
}

// ===== 11. 状态管理类型 =====

// 状态类型
export interface AppState {
  user: User | null;
  isLoading: boolean;
  error: AppError | null;
  theme: ThemeMode;
}

// 状态更新函数
export type StateUpdater<T> = (state: T) => T | Partial<T>;

// 状态订阅器
export type StateSubscriber<T> = (state: T) => void;

// 状态存储
export interface StateStore<T> {
  getState: () => T;
  setState: (updater: StateUpdater<T> | Partial<T>) => void;
  subscribe: (subscriber: StateSubscriber<T>) => () => void;
}

// 创建状态存储
export function createStateStore<T>(initialState: T): StateStore<T> {
  let state = initialState;
  const subscribers = new Set<StateSubscriber<T>>();

  return {
    getState: () => state,

    setState: (updater) => {
      const newState = typeof updater === 'function'
        ? (updater as StateUpdater<T>)(state)
        : { ...state, ...updater };

      state = { ...state, ...newState };
      subscribers.forEach(sub => sub(state));
    },

    subscribe: (subscriber) => {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
  };
}

// ===== 12. 类型测试 =====

// 类型断言
type Assert<T extends true> = T;

// 测试类型
type Test1 = Assert<keyof User extends 'id' | 'name' | 'email' | 'age' | 'role' | 'createdAt' ? true : false>;
type Test2 = Assert<UserRoleType extends 'admin' | 'user' | 'guest' ? true : false>;
type Test3 = Assert<Status extends 'loading' | 'success' | 'error' ? true : false>;

// 条件类型测试
type ExtractedRoles = Extract<UserRoleType, 'admin' | 'user'>;
type NonEmptyUser = Required<User>;
type PartialUserKeys = keyof Partial<User>;
