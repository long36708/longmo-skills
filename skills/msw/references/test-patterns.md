# 测试模式参考

## 目录

- [Vitest 设置](#vitest-设置)
- [Jest 设置](#jest-设置)
- [每个测试的重写](#每个测试的重写)
- [并发测试隔离](#并发测试隔离)
- [处理器组织](#处理器组织)
- [高阶解析器](#高阶解析器)
- [动态模拟场景](#动态模拟场景)
- [React Query / SWR / Apollo 的缓存清除](#缓存清除)
- [条件性浏览器模拟](#条件性浏览器模拟)

## Vitest 设置

```typescript
// vitest.setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './src/mocks/node'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

## Jest 设置

```typescript
// jest.setup.ts
import { server } from './src/mocks/node'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

```javascript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['./jest.setup.ts'],
}
```

## 每个测试的重写

使用 `server.use()` 添加仅在 `afterEach` 中的 `resetHandlers()` 运行之前存在的处理器。

### 错误状态的重写

```typescript
test('API 失败时显示错误', async () => {
  server.use(
    http.get('/api/user', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )

  render(<UserProfile />)
  await waitFor(() => {
    expect(screen.getByText('出现错误')).toBeInTheDocument()
  })
})
```

### 空状态的重写

```typescript
test('显示空状态', async () => {
  server.use(
    http.get('/api/posts', () => HttpResponse.json([]))
  )

  render(<PostList />)
  await waitFor(() => {
    expect(screen.getByText('暂无帖子')).toBeInTheDocument()
  })
})
```

### 慢响应的重写（加载状态）

```typescript
import { delay, http, HttpResponse } from 'msw'

test('显示加载状态', async () => {
  server.use(
    http.get('/api/user', async () => {
      await delay('infinite')
      return HttpResponse.json({ name: 'John' })
    })
  )

  render(<UserProfile />)
  expect(screen.getByText('加载中...')).toBeInTheDocument()
})
```

### 一次性重写用于重试测试

```typescript
test('失败后重试', async () => {
  server.use(
    // 第一次请求失败，然后处理器被消耗
    http.get('/api/data', () => {
      return new HttpResponse(null, { status: 500 })
    }, { once: true })
  )
  // 一次性处理器消耗后，默认处理器响应成功

  render(<DataLoader />)
  await waitFor(() => {
    expect(screen.getByText('数据已加载')).toBeInTheDocument()
  })
})
```

## 并发测试隔离

使用 `server.boundary()` 防止并发测试间的处理器泄漏：

```typescript
it.concurrent('admin flow', server.boundary(async () => {
  server.use(
    http.get('/api/me', () => HttpResponse.json({ role: 'admin' }))
  )
  // 仅此测试看到 admin 重写
}))

it.concurrent('guest flow', server.boundary(async () => {
  server.use(
    http.get('/api/me', () => HttpResponse.json({ role: 'guest' }))
  )
  // 仅此测试看到 guest 重写
}))
```

## 处理器组织

推荐的目录结构：

```
src/mocks/
├── handlers.ts          # 聚合并导出所有处理器
├── handlers/
│   ├── user.ts          # 用户相关处理器
│   ├── posts.ts         # 帖子相关处理器
│   └── auth.ts          # 认证相关处理器
├── node.ts              # setupServer(...handlers)
└── browser.ts           # setupWorker(...handlers)
```

### handlers/user.ts

```typescript
import { http, HttpResponse } from 'msw'

export const userHandlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' },
    ])
  }),

  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, name: 'John' })
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(body, { status: 201 })
  }),
]
```

### handlers.ts

```typescript
import { userHandlers } from './handlers/user'
import { postHandlers } from './handlers/posts'
import { authHandlers } from './handlers/auth'

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...postHandlers,
]
```

## 高阶解析器

用于可重用响应模式的工厂函数：

### 认证包装器

```typescript
import { http, HttpResponse } from 'msw'

function withAuth(resolver) {
  return async (info) => {
    const token = info.request.headers.get('Authorization')
    if (!token) {
      return new HttpResponse(null, { status: 401 })
    }
    return resolver(info)
  }
}

// 用法
http.get('/api/profile', withAuth(({ request }) => {
  return HttpResponse.json({ name: 'John' })
}))
```

### 分页响应包装器

```typescript
function withPagination(items) {
  return ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const limit = Number(url.searchParams.get('limit') ?? '10')
    const start = (page - 1) * limit
    const paginatedItems = items.slice(start, start + limit)

    return HttpResponse.json({
      data: paginatedItems,
      total: items.length,
      page,
      totalPages: Math.ceil(items.length / limit),
    })
  }
}

http.get('/api/posts', withPagination(allPosts))
```

## 动态模拟场景

创建特定场景的处理器集，以便在测试中重用：

```typescript
function createUserHandlers(scenario: 'happy' | 'error' | 'empty') {
  switch (scenario) {
    case 'happy':
      return http.get('/api/user', () =>
        HttpResponse.json({ name: 'John', email: 'john@example.com' }))
    case 'error':
      return http.get('/api/user', () =>
        new HttpResponse(null, { status: 500 }))
    case 'empty':
      return http.get('/api/user', () =>
        new HttpResponse(null, { status: 404 }))
  }
}

test('错误场景', async () => {
  server.use(createUserHandlers('error'))
  // ...
})
```

### 多端点场景

```typescript
function createScenario(scenario: 'authenticated' | 'anonymous') {
  if (scenario === 'authenticated') {
    return [
      http.get('/api/me', () => HttpResponse.json({ id: '1', name: 'John' })),
      http.get('/api/settings', () => HttpResponse.json({ theme: 'dark' })),
    ]
  }
  return [
    http.get('/api/me', () => new HttpResponse(null, { status: 401 })),
  ]
}

test('认证仪表板', async () => {
  server.use(...createScenario('authenticated'))
  // ...
})
```

## 缓存清除

### React Query

每个测试创建新的 `QueryClient` 以避免陈旧缓存：

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}
```

### SWR

每个测试使用带有新缓存的 `SWRConfig`：

```typescript
import { SWRConfig } from 'swr'

function renderWithSWR(ui: React.ReactElement) {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {ui}
    </SWRConfig>
  )
}
```

### Apollo Client

每个测试创建新的 `InMemoryCache`：

```typescript
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'

function renderWithApollo(ui: React.ReactElement) {
  const client = new ApolloClient({
    uri: '/graphql',
    cache: new InMemoryCache(),
  })
  return render(
    <ApolloProvider client={client}>{ui}</ApolloProvider>
  )
}
```

## 条件性浏览器模拟

仅在开发环境中启用模拟：

```typescript
// src/main.tsx
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }
  const { worker } = await import('./mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
})
```

### 在 Storybook 中

```typescript
// .storybook/preview.ts
import { initialize, mswLoader } from 'msw-storybook-addon'
import { handlers } from '../src/mocks/handlers'

initialize({ onUnhandledRequest: 'bypass' })

export const parameters = {
  msw: { handlers },
}

export const loaders = [mswLoader]
```
