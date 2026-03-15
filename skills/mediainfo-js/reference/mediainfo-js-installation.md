# mediainfo.js - 安装与基本配置

## 安装

```bash
npm install mediainfo.js
```

## 基本配置选项

```typescript
import mediaInfoFactory from 'mediainfo.js'

const mediainfo = await mediaInfoFactory({
  format: 'object',      // 输出格式: 'object' | 'JSON' | 'XML' | 'HTML' | 'text'
  coverData: false,      // 是否包含封面数据(base64)
  chunkSize: 256 * 1024, // 读取块大小(字节)，默认 256KB
  full: false,           // 是否显示所有内部标签
  locateFile: (path, prefix) => {
    // 浏览器环境: 自定义 WASM 文件位置
    // Node.js 环境: 通常不需要配置
    return `${prefix}${path}`
  }
})
```

## 格式类型说明

- `object`: 返回结构化的 JavaScript 对象（推荐）
- `JSON`: 返回 JSON 字符串
- `XML`: 返回 XML 格式字符串
- `HTML`: 返回 HTML 格式字符串
- `text`: 返回格式化的文本字符串

## 实例化方式

### Promise 方式（推荐）

```typescript
const mediainfo = await mediaInfoFactory({ format: 'object' })
try {
  const result = await mediainfo.analyzeData(...)
  console.log(result)
} finally {
  mediainfo.close()
}
```

### 回调方式

```typescript
mediaInfoFactory(
  { format: 'object' },
  (mediainfo) => {
    mediainfo.analyzeData(...).then((result) => {
      console.log(result)
      mediainfo.close()
    })
  },
  (error) => {
    console.error('初始化失败:', error)
  }
)
```

## Node.js 环境完整示例

```typescript
import mediaInfoFactory from 'mediainfo.js'
import { createReadStream, statSync } from 'fs'

async function analyzeMediaFile(filePath: string) {
  const mediainfo = await mediaInfoFactory({ format: 'object' })
  const fileStats = statSync(filePath)

  try {
    const result = await mediainfo.analyzeData(
      fileStats.size,
      (chunkSize: number, offset: number) => {
        return new Promise((resolve, reject) => {
          const buffer = Buffer.allocUnsafe(chunkSize)
          const stream = createReadStream(filePath, {
            start: offset,
            end: offset + chunkSize - 1
          })
          stream.on('data', (chunk) => {
            chunk.copy(buffer)
            resolve(new Uint8Array(buffer.buffer, 0, chunk.length))
          })
          stream.on('error', reject)
        })
      }
    )
    return result
  } finally {
    mediainfo.close()
  }
}

// 使用
analyzeMediaFile('video.mp4').then(console.log)
```

## TypeScript 类型支持

```typescript
import type {
  MediaInfo,
  MediaInfoFactoryOptions,
  ReadChunkFunc,
  SizeArg,
  FormatType
} from 'mediainfo.js'

// 类型安全的使用
const mediainfo = await mediaInfoFactory<FormatType>({
  format: 'object'
})
```

## 版本兼容性

- Node.js: >= 18.0.0
- 浏览器: 支持 WebAssembly 的现代浏览器
- 支持的打包工具: Vite, Webpack, Rollup 等

## 常见问题

### 1. Node.js 环境中是否需要 locateFile？

不需要。Node.js 环境中，WASM 文件会自动从 `node_modules/mediainfo.js/dist/` 加载。

### 2. 如何更改 chunkSize？

```typescript
const mediainfo = await mediaInfoFactory({
  chunkSize: 512 * 1024 // 512KB
})
```

较大的 chunkSize 可以减少读取次数，但会占用更多内存。

### 3. coverData 选项的作用

设置为 `true` 时，如果媒体文件包含封面图（如 MP3 的专辑封面），会将封面数据以 base64 格式包含在结果中。

```typescript
const mediainfo = await mediaInfoFactory({
  coverData: true,
  format: 'object'
})
```

### 4. full 选项的影响

设置为 `true` 时，会显示所有内部标签和元数据，包括一些不常用的技术参数。默认 `false` 只显示常用信息。
