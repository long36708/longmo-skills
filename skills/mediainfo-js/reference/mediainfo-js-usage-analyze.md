# mediainfo.js - 数据分析方法

## analyzeData 方法概述

`analyzeData` 是 MediaInfo 的核心方法，用于分析媒体文件数据。

## 方法签名

```typescript
analyzeData(
  size: SizeArg,
  readChunk: ReadChunkFunc
): Promise<Result>

// 或使用回调方式
analyzeData(
  size: SizeArg,
  readChunk: ReadChunkFunc,
  callback: (result: Result, error?: unknown) => void
): void
```

## 参数说明

### size - 文件大小

```typescript
type SizeArg = (() => Promise<number> | number) | number
```

**三种使用方式:**

1. **直接指定数字:**
```typescript
await mediainfo.analyzeData(1024000, readChunk)
```

2. **同步函数:**
```typescript
await mediainfo.analyzeData(() => fileStats.size, readChunk)
```

3. **异步函数:**
```typescript
await mediainfo.analyzeData(
  async () => (await getFileStats()).size,
  readChunk
)
```

### readChunk - 读取文件块的函数

```typescript
type ReadChunkFunc = (chunkSize: number, offset: number) => Promise<Uint8Array> | Uint8Array
```

**参数:**
- `chunkSize`: 要读取的块大小（字节）
- `offset`: 文件中的偏移位置

**返回:**
- 同步返回 `Uint8Array`
- 或异步返回 `Promise<Uint8Array>`

## 使用场景

### 1. 浏览器 - File 对象

```typescript
const file = fileInput.files[0]

function makeReadChunk(file: File): ReadChunkFunc {
  return async (chunkSize: number, offset: number) =>
    new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer())
}

const result = await mediainfo.analyzeData(file.size, makeReadChunk(file))
```

**关键点:**
- 使用 `file.slice()` 切片
- 转换为 `arrayBuffer` 后包装为 `Uint8Array`

### 2. 浏览器 - Blob 对象

```typescript
async function analyzeBlob(blob: Blob) {
  const readChunk = async (chunkSize: number, offset: number) => {
    const slice = blob.slice(offset, offset + chunkSize)
    const buffer = await slice.arrayBuffer()
    return new Uint8Array(buffer)
  }

  return await mediainfo.analyzeData(blob.size, readChunk)
}
```

### 3. Node.js - 文件路径

```typescript
import { createReadStream, statSync } from 'fs'

async function analyzeFile(filePath: string) {
  const fileStats = statSync(filePath)

  const readChunk = (chunkSize: number, offset: number) => {
    return new Promise<Uint8Array>((resolve, reject) => {
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

  return await mediainfo.analyzeData(fileStats.size, readChunk)
}
```

### 4. Node.js - 文件描述符

```typescript
import { open, close, read } from 'fs/promises'

async function analyzeFileWithFd(filePath: string) {
  const fd = await open(filePath, 'r')
  const stats = await fd.stat()

  const readChunk = async (chunkSize: number, offset: number) => {
    const buffer = Buffer.allocUnsafe(chunkSize)
    const { bytesRead } = await fd.read(buffer, 0, chunkSize, offset)
    return new Uint8Array(buffer.buffer, 0, bytesRead)
  }

  try {
    return await mediainfo.analyzeData(stats.size, readChunk)
  } finally {
    await fd.close()
  }
}
```

### 5. 内存中的 Buffer

```typescript
async function analyzeBuffer(buffer: Buffer) {
  const readChunk = (chunkSize: number, offset: number) => {
    const end = Math.min(offset + chunkSize, buffer.length)
    return buffer.subarray(offset, end)
  }

  return await mediainfo.analyzeData(buffer.length, readChunk)
}
```

### 6. 网络流 (HTTP Range Requests)

```typescript
async function analyzeRemoteFile(url: string) {
  // 首先获取文件大小
  const headResponse = await fetch(url, { method: 'HEAD' })
  const contentLength = parseInt(headResponse.headers.get('Content-Length') || '0')

  const readChunk = async (chunkSize: number, offset: number) => {
    const rangeResponse = await fetch(url, {
      headers: { 'Range': `bytes=${offset}-${offset + chunkSize - 1}` }
    })
    const buffer = await rangeResponse.arrayBuffer()
    return new Uint8Array(buffer)
  }

  return await mediainfo.analyzeData(contentLength, readChunk)
}
```

## 进阶用法

### 1. 添加进度回调

```typescript
async function analyzeWithProgress(
  file: File,
  onProgress: (progress: number) => void
) {
  const totalSize = file.size
  let processedSize = 0

  const readChunk = async (chunkSize: number, offset: number) => {
    processedSize = offset + chunkSize
    const progress = (processedSize / totalSize * 100)
    onProgress(progress)

    const slice = file.slice(offset, offset + chunkSize)
    const buffer = await slice.arrayBuffer()
    return new Uint8Array(buffer)
  }

  return await mediainfo.analyzeData(file.size, readChunk)
}

// 使用
analyzeWithProgress(file, (progress) => {
  console.log(`进度: ${progress.toFixed(2)}%`)
})
```

### 2. 添加超时控制

```typescript
async function analyzeWithTimeout(
  file: File,
  timeout: number = 30000
) {
  const readChunk = async (chunkSize: number, offset: number) => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('读取超时')), timeout)
    )

    const readPromise = file
      .slice(offset, offset + chunkSize)
      .arrayBuffer()
      .then(buffer => new Uint8Array(buffer))

    return Promise.race([readPromise, timeoutPromise])
  }

  return await mediainfo.analyzeData(file.size, readChunk)
}
```

### 3. 重试机制

```typescript
async function analyzeWithRetry(
  file: File,
  maxRetries: number = 3
) {
  let retryCount = 0

  const readChunk = async (chunkSize: number, offset: number) => {
    try {
      const slice = file.slice(offset, offset + chunkSize)
      const buffer = await slice.arrayBuffer()
      return new Uint8Array(buffer)
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++
        console.log(`重试 ${retryCount}/${maxRetries}`)
        return readChunk(chunkSize, offset)
      }
      throw error
    }
  }

  return await mediainfo.analyzeData(file.size, readChunk)
}
```

### 4. 并发控制

```typescript
async function analyzeMultipleFiles(
  files: File[],
  concurrency: number = 3
) {
  const results = []
  let index = 0

  const analyzeNext = async (): Promise<void> => {
    if (index >= files.length) return

    const file = files[index++]
    const readChunk = (chunkSize: number, offset: number) =>
      file.slice(offset, offset + chunkSize).arrayBuffer()
        .then(buffer => new Uint8Array(buffer))

    try {
      const result = await mediainfo.analyzeData(file.size, readChunk)
      results.push({ file: file.name, result })
    } catch (error) {
      results.push({ file: file.name, error })
    }
  }

  const workers = []
  for (let i = 0; i < Math.min(concurrency, files.length); i++) {
    workers.push(analyzeNext())
  }

  await Promise.all(workers)
  return results
}
```

## 错误处理

### 1. 基本错误处理

```typescript
try {
  const result = await mediainfo.analyzeData(file.size, readChunk)
  console.log(result)
} catch (error) {
  console.error('分析失败:', error)
}
```

### 2. 回调方式错误处理

```typescript
mediainfo.analyzeData(
  file.size,
  readChunk,
  (result, error) => {
    if (error) {
      console.error('分析失败:', error)
      return
    }
    console.log(result)
  }
)
```

### 3. 特定错误类型

```typescript
try {
  const result = await mediainfo.analyzeData(file.size, readChunk)
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('network')) {
      console.error('网络错误')
    } else if (error.message.includes('timeout')) {
      console.error('超时错误')
    } else {
      console.error('未知错误:', error.message)
    }
  }
}
```

## 性能优化

### 1. 调整 chunkSize

```typescript
// 小文件: 使用较小的 chunkSize
const smallFileMediainfo = await mediaInfoFactory({
  chunkSize: 64 * 1024  // 64KB
})

// 大文件: 使用较大的 chunkSize
const largeFileMediainfo = await mediaInfoFactory({
  chunkSize: 1024 * 1024  // 1MB
})
```

**权衡:**
- 较小的 chunkSize: 内存占用低，但读取次数多
- 较大的 chunkSize: 读取次数少，但内存占用高

### 2. 预分配 Buffer

```typescript
function makeOptimizedReadChunk(file: File) {
  const buffer = new Uint8Array(1024 * 1024)  // 预分配 1MB

  return async (chunkSize: number, offset: number) => {
    const slice = file.slice(offset, offset + chunkSize)
    const arrayBuffer = await slice.arrayBuffer()
    buffer.set(new Uint8Array(arrayBuffer))
    return buffer.slice(0, chunkSize)
  }
}
```

### 3. 使用 Web Worker (浏览器)

```typescript
// main.js
const worker = new Worker('media-info-worker.js')

function analyzeInWorker(file: File) {
  return new Promise((resolve, reject) => {
    worker.postMessage({ type: 'analyze', file })

    worker.onmessage = (e) => {
      if (e.data.error) {
        reject(e.data.error)
      } else {
        resolve(e.data.result)
      }
    }
  })
}

// media-info-worker.js
let mediainfo = null

MediaInfo.mediaInfoFactory({ format: 'text' }, (mi) => {
  mediainfo = mi
})

self.onmessage = async (e) => {
  if (e.data.type === 'analyze') {
    const { file } = e.data

    const readChunk = (chunkSize: number, offset: number) =>
      file.slice(offset, offset + chunkSize).arrayBuffer()
        .then(buffer => new Uint8Array(buffer))

    try {
      const result = await mediainfo.analyzeData(file.size, readChunk)
      self.postMessage({ result })
    } catch (error) {
      self.postMessage({ error: error.message })
    }
  }
}
```

## 常见问题

### 1. 读取不完整

**问题:** 分析结果不完整或部分信息缺失

**原因:** `readChunk` 返回的数据长度小于 `chunkSize`

**解决:**
```typescript
const readChunk = async (chunkSize: number, offset: number) => {
  const end = Math.min(offset + chunkSize, file.size)
  const slice = file.slice(offset, end)  // 确保不超出文件大小
  const buffer = await slice.arrayBuffer()
  return new Uint8Array(buffer)
}
```

### 2. 内存占用过高

**问题:** 处理大文件时浏览器崩溃或变慢

**解决:**
```typescript
// 减小 chunkSize
const mediainfo = await mediaInfoFactory({
  chunkSize: 128 * 1024  // 128KB
})

// 或使用流式处理（需要手动实现）
```

### 3. 异步错误未被捕获

**问题:** `readChunk` 中的 Promise reject 导致未捕获的异常

**解决:**
```typescript
// 在 analyzeData 外部捕获
try {
  await mediainfo.analyzeData(file.size, async (chunkSize, offset) => {
    // 这里抛出的错误会被 analyzeData 捕获
    const slice = file.slice(offset, offset + chunkSize)
    return new Uint8Array(await slice.arrayBuffer())
  })
} catch (error) {
  console.error('捕获到错误:', error)
}
```

### 4. 文件被占用 (Node.js)

**问题:** 分析文件后文件无法删除

**原因:** 文件描述符未关闭

**解决:**
```typescript
async function analyzeAndCleanup(filePath: string) {
  const fd = await open(filePath, 'r')

  try {
    const readChunk = async (chunkSize: number, offset: number) => {
      const buffer = Buffer.allocUnsafe(chunkSize)
      const { bytesRead } = await fd.read(buffer, 0, chunkSize, offset)
      return new Uint8Array(buffer.buffer, 0, bytesRead)
    }

    return await mediainfo.analyzeData((await fd.stat()).size, readChunk)
  } finally {
    await fd.close()  // 确保关闭文件描述符
  }
}
```

## 完整示例

### 浏览器文件分析器

```typescript
class MediaAnalyzer {
  private mediainfo: MediaInfo | null = null

  async initialize() {
    this.mediainfo = await mediaInfoFactory({ format: 'object' })
  }

  async analyzeFile(
    file: File,
    onProgress?: (progress: number) => void
  ) {
    if (!this.mediainfo) {
      await this.initialize()
    }

    let processedSize = 0

    const readChunk = async (chunkSize: number, offset: number) => {
      const slice = file.slice(offset, offset + chunkSize)
      const buffer = await slice.arrayBuffer()

      processedSize = offset + chunkSize
      if (onProgress) {
        onProgress((processedSize / file.size) * 100)
      }

      return new Uint8Array(buffer)
    }

    return await this.mediainfo!.analyzeData(file.size, readChunk)
  }

  destroy() {
    if (this.mediainfo) {
      this.mediainfo.close()
      this.mediainfo = null
    }
  }
}

// 使用
const analyzer = new MediaAnalyzer()
analyzer.initialize()

const progressBar = document.getElementById('progress')
const fileInput = document.getElementById('file')

fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0]
  const result = await analyzer.analyzeFile(file, (progress) => {
    progressBar.style.width = `${progress}%`
  })
  console.log(result)
})
```
