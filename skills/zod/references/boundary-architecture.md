# 边界架构 — Zod 适用场景

## 概述

Zod 属于**系统边界**——应用程序接收不受控制的数据的地方。在边界解析一次，然后将类型化数据向内传递。领域逻辑永远不应该看到 `unknown`。

## Express / Fastify — 路由处理器 vs 中间件

### 在路由处理器中（推荐用于大多数情况）

```typescript
app.post("/api/users", (req, res) => {
  const result = CreateUserSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      errors: z.flattenError(result.error).fieldErrors,
    })
  }
  const user = await createUser(result.data)
  res.status(201).json(user)
})
```

### 作为中间件（用于共享验证逻辑）

```typescript
function validate<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        errors: z.flattenError(result.error).fieldErrors,
      })
    }
    req.body = result.data // 从这里开始类型化
    next()
  }
}

app.post("/api/users", validate(CreateUserSchema), (req, res) => {
  // req.body 已经验证和类型化
  const user = await createUser(req.body)
  res.status(201).json(user)
})
```

### 何时使用每种方式

| 方法 | 使用时机 |
|------|----------|
| 路由处理器 | 模式特定于一个路由，需要自定义错误响应 |
| 中间件 | 跨多个路由使用相同模式/错误格式 |

## tRPC — `.input()` 解析

tRPC 通过 `.input()` 为您处理边界解析：

```typescript
export const userRouter = router({
  create: publicProcedure
    .input(CreateUserSchema) // tRPC 内部调用 safeParse
    .mutation(async ({ input }) => {
      // input 完全类型化 — z.infer<typeof CreateUserSchema>
      return createUser(input)
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return getUser(input.id)
    }),
})
```

您不需要自己调用 `safeParse()` — tRPC 会自动执行并返回类型化的错误响应。

## Next.js Server Actions

```typescript
"use server"

const CreatePostSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(10),
})

export async function createPost(formData: FormData) {
  // 在操作顶部解析
  const result = CreatePostSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  })

  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors }
  }

  // 从这里开始类型化
  await db.posts.create({ data: result.data })
  revalidatePath("/posts")
}
```

### Next.js Route Handlers

```typescript
export async function POST(request: Request) {
  const body = await request.json()
  const result = CreateUserSchema.safeParse(body)

  if (!result.success) {
    return Response.json(
      { errors: z.flattenError(result.error).fieldErrors },
      { status: 400 }
    )
  }

  const user = await createUser(result.data)
  return Response.json(user, { status: 201 })
}
```

## React Hook Form — zodResolver

表单库处理边界：

```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const ProfileSchema = z.object({
  name: z.string().min(1),
  bio: z.string().max(500).optional(),
})

type ProfileForm = z.infer<typeof ProfileSchema>

function ProfileEditor() {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(ProfileSchema),
  })

  const onSubmit = (data: ProfileForm) => {
    // data 已经验证 — 不需要 safeParse
    updateProfile(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  )
}
```

## 环境变量 — 启动时解析

在应用程序启动时解析环境变量一次。如果环境配置错误，快速失败。

### 手动方法

```typescript
// config/env.ts — 导入时解析
const EnvSchema = z.object({
  DATABASE_URL: z.url(),
  API_KEY: z.string().min(1),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

export const env = EnvSchema.parse(process.env)
// 如果环境无效，应用程序在启动时崩溃 — 这是故意的
```

### 使用 t3-env

```typescript
import { createEnv } from "@t3-oss/env-nextjs"

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    API_KEY: process.env.API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
})
```

## 外部 API 响应

始终验证来自外部服务的数据——它们的模式可能会在无预警的情况下更改。

```typescript
const WeatherResponse = z.object({
  temperature: z.number(),
  humidity: z.number().min(0).max(100),
  conditions: z.string(),
})

async function getWeather(city: string) {
  const res = await fetch(`https://api.weather.example/v1/${city}`)
  const json = await res.json()

  // 在边界解析 — 不要信任外部数据
  const result = WeatherResponse.safeParse(json)
  if (!result.success) {
    logger.warn("weather_api_schema_mismatch", {
      schema: "WeatherResponse",
      fieldErrors: z.flattenError(result.error).fieldErrors,
    })
    throw new ExternalServiceError("天气 API 返回了意外的形状")
  }

  return result.data // 类型化的 Weather
}
```

## 数据库层

当模式可能与实际数据库形状分离时解析数据库结果（例如，迁移后、使用非类型化 ORM 或原始 SQL）。

```typescript
const UserRow = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  created_at: z.coerce.date(),
})

async function getUserById(id: string) {
  const row = await db.query("SELECT * FROM users WHERE id = $1", [id])
  // 如果使用原始 SQL 或非类型化 ORM，则进行验证
  return UserRow.parse(row)
}
```

如果您使用完全类型化的 ORM（如 Prisma 或 Drizzle），它会从您的模式生成类型，通常不需要对数据库结果进行额外的 Zod 解析。

## 总结：边界层检查清单

| 边界 | 谁解析 | 模式位置 |
|------|--------|----------|
| Express/Fastify 路由 | 您的中间件或处理器 | `api/[resource]/schemas.ts` |
| tRPC 过程 | tRPC 通过 `.input()` | 内联或放在一起 |
| Next.js Server Action | 操作函数顶部 | 与操作放在一起 |
| React Hook Form | zodResolver | `features/[name]/form-schema.ts` |
| 环境变量 | 启动时（parse，非 safeParse） | `config/env.ts` |
| 外部 API 响应 | 获取后，使用前 | 与 API 客户端放在一起 |
| 数据库结果 | 查询后（如果非类型化） | 与数据访问放在一起 |
| 消息队列 | 消费者处理器顶部 | 与消费者放在一起 |
