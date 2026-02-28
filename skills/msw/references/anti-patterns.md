# MSW 反模式

## 目录

1. [使用 v1 `rest` 命名空间](#1-使用-v1-rest-命名空间)
2. [在 URL 谓词中使用查询参数](#2-在-url-谓词中使用查询参数)
3. [从错误路径导入 setupServer](#3-从错误路径导入-setupserver)
4. [缺少 afterEach(resetHandlers)](#4-缺少-aftereachresethandlers)
5. [断言 fetch 调用](#5-断言-fetch-调用)
6. [未等待 request.json()](#6-未等待-requestjson)
7. [使用原生 Response 处理 cookies](#7-使用原生-response-处理-cookies)
8. [并发测试中未使用 server.boundary()](#8-并发测试中未使用-serverboundary)
9. [未设置 onUnhandledRequest: 'error'](#9-未设置-onunhandledrequest-error)
10. [在解析器中抛出错误](#10-在解析器中抛出错误)

## 1. 使用 v1 `rest` 命名空间

```typescript
// 错误
import { rest } from 'msw'
rest.get('/api/user', (req, res, ctx) => res(ctx.json({ name: 'John' })))

// 正确
import { http, HttpResponse } from 'msw'
http.get('/api/user', () => HttpResponse.json({ name: 'John' }))
```

## 2. 在 URL 谓词中使用查询参数

```typescript
// 错误：静默不匹配任何内容
http.get('/post?id=1', resolver)

// 正确：在解析器内部读取查询参数
http.get('/post', ({ request }) => {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  return HttpResponse.json({ id })
})
```

## 3. 从错误路径导入 setupServer

```typescript
// 错误
import { setupServer } from 'msw'

// 正确
import { setupServer } from 'msw/node'
```

## 4. 缺少 afterEach(resetHandlers)

```typescript
// 错误：处理器在测试间泄漏
beforeAll(() => server.listen())
afterAll(() => server.close())

// 正确：每个测试后重置
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## 5. 断言 fetch 调用

```typescript
// 错误：测试实现而非行为
expect(fetch).toHaveBeenCalledWith('/api/login', expect.objectContaining({
  method: 'POST',
}))

// 正确：测试用户看到的内容
await waitFor(() => {
  expect(screen.getByText('Welcome!')).toBeInTheDocument()
})
```

## 6. 未等待 request.json()

```typescript
// 错误：body 是 ReadableStream，不是解析后的数据
http.post('/api/user', ({ request }) => {
  const body = request.body
  return HttpResponse.json({ received: body })
})

// 正确：等待异步方法
http.post('/api/user', async ({ request }) => {
  const body = await request.json()
  return HttpResponse.json({ received: body })
})
```

## 7. 使用原生 Response 处理 cookies

```typescript
// 错误：Set-Cookie 静默丢失
new Response(null, {
  headers: { 'Set-Cookie': 'token=abc' },
})

// 正确：HttpResponse 支持 Set-Cookie
new HttpResponse(null, {
  headers: { 'Set-Cookie': 'token=abc' },
})
```

## 8. 并发测试中未使用 server.boundary()

```typescript
// 错误：重写在并发测试间泄漏
it.concurrent('test A', async () => {
  server.use(http.get('/api/user', () => HttpResponse.json({ role: 'admin' })))
})

// 正确：boundary 隔离重写
it.concurrent('test A', server.boundary(async () => {
  server.use(http.get('/api/user', () => HttpResponse.json({ role: 'admin' })))
}))
```

## 9. 未设置 onUnhandledRequest: 'error'

```typescript
// 错误：未处理的请求静默通过
server.listen()

// 正确：缺少处理器时测试失败
server.listen({ onUnhandledRequest: 'error' })
```

## 10. 在解析器中抛出错误

```typescript
// 错误：崩溃处理器内部
http.get('/api/data', () => {
  throw new Error('Network failure')
})

// 正确：模拟实际的网络错误
http.get('/api/data', () => {
  return HttpResponse.error()
})
```
