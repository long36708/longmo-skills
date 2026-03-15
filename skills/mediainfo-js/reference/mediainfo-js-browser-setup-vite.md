# mediainfo.js - Vite 浏览器配置

## 重要注意事项

⚠️ **Vite 特殊配置要求**

Vite 项目中使用 mediainfo.js 需要特别注意 WASM 文件的加载路径问题。库内部使用 `new URL('MediaInfoModule.wasm', import.meta.url)`，但这个路径在 Vite 构建后可能不正确。

## 必需配置

### 1. 安装依赖

```bash
npm install mediainfo.js @vitejs/plugin-react
```

### 2. 创建 vite.config.ts

```typescript
import react from '@vitejs/plugin-react'
import { defineConfig, searchForWorkspaceRoot, type Plugin } from 'vite'

// 修复 mediainfo.js 的 WASM 导入路径问题
function fixMediainfoWasmImportMetaUrl(): Plugin {
  return {
    name: 'fix-mediainfo-wasm-import-meta-url',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.split('?')[0].replace(/\\/g, '/')

      const isMediaInfoWasmFallback =
        normalizedId.endsWith('/dist/esm/MediaInfoModule.js') ||
        normalizedId.endsWith('/dist/esm-bundle/index.js')

      if (!isMediaInfoWasmFallback) {
        return
      }

      // 将 MediaInfoModule.wasm 的相对路径修正为正确的父级目录
      const fixedCode = code.replace(
        /new URL\((['"])MediaInfoModule\.wasm\1,\s*import\.meta\.url\)\.href/g,
        "new URL('../MediaInfoModule.wasm', import.meta.url).href"
      )

      if (fixedCode === code) {
        return
      }

      return {
        code: fixedCode,
        map: null,
      }
    },
  }
}

export default defineConfig({
  plugins: [fixMediainfoWasmImportMetaUrl(), react()],
  server: {
    fs: {
      // 允许在 monorepo 中访问链接包的文件
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },
})
```

**关键点说明:**
- `fixMediainfoWasmImportMetaUrl` 插件必须添加，并放在 `react()` 插件之前
- `enforce: 'pre'` 确保在 Vite 其他转换之前执行
- 插件会自动修正 WASM 文件的引用路径
- `server.fs.allow` 配置在 monorepo 开发中是必需的

### 3. React 组件实现

```typescript
import { useState, useEffect, useRef } from 'react'
import mediaInfoFactory from 'mediainfo.js'
import type { MediaInfo, ReadChunkFunc } from 'mediainfo.js'
import mediaInfoWasmUrl from 'mediainfo.js/MediaInfoModule.wasm?url'

// 读取文件块的辅助函数
function makeReadChunk(file: File): ReadChunkFunc {
  return async (chunkSize: number, offset: number) =>
    new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer())
}

function MediaInfoViewer() {
  const mediaInfoRef = useRef<MediaInfo<'text'> | null>(null)
  const [result, setResult] = useState('')

  useEffect(() => {
    mediaInfoFactory({
      format: 'text',
      // 使用 Vite 的 ?url 后缀导入 WASM 文件
      locateFile: (path, prefix) =>
        path === 'MediaInfoModule.wasm' ? mediaInfoWasmUrl : `${prefix}${path}`,
    })
      .then((mi) => {
        mediaInfoRef.current = mi
      })
      .catch(console.error)

    // 清理函数: 组件卸载时关闭 MediaInfo 实例
    return () => {
      if (mediaInfoRef.current) {
        mediaInfoRef.current.close()
      }
    }
  }, [])

  const handleFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0]
    if (file && mediaInfoRef.current) {
      try {
        const info = await mediaInfoRef.current.analyzeData(
          file.size,
          makeReadChunk(file)
        )
        setResult(info)
      } catch (error) {
        console.error(error)
      }
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <pre>{result}</pre>
    </div>
  )
}

export default MediaInfoViewer
```

## 关键注意事项

### 1. WASM 文件导入

**错误做法:**
```typescript
// ❌ 这在 Vite 中会失败
const mediaInfoWasmUrl = 'mediainfo.js/MediaInfoModule.wasm'
```

**正确做法:**
```typescript
// ✅ 使用 Vite 的 ?url 后缀
import mediaInfoWasmUrl from 'mediainfo.js/MediaInfoModule.wasm?url'
```

### 2. locateFile 配置

**必须明确指定 WASM 文件:**
```typescript
locateFile: (path, prefix) =>
  path === 'MediaInfoModule.wasm' ? mediaInfoWasmUrl : `${prefix}${path}`
```

不要使用：
```typescript
// ❌ 不要这样，可能导致路径错误
locateFile: (filename) => filename
```

### 3. 插件顺序

**必须正确配置插件顺序:**
```typescript
// ✅ 正确
plugins: [
  fixMediainfoWasmImportMetaUrl(),  // 必须在前
  react()                           // 在后
]
```

### 4. 开发服务器配置

在 monorepo 或使用 pnpm workspace link 时，必须添加：
```typescript
server: {
  fs: {
    allow: [searchForWorkspaceRoot(process.cwd())],
  },
}
```

否则会报错：
```
Error: ENOENT: no such file or directory, lstat '...'
```

## TypeScript 配置

确保 `tsconfig.json` 包含 Vite 的类型：
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["vite/client"]
  }
}
```

## package.json 完整配置

```json
{
  "name": "mediainfojs-vite-react-example",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "mediainfo.js": "latest",
    "react": "^19.2.3",
    "react-dom": "^19.2.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.8",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.2",
    "typescript": "^5.9.3",
    "vite": "^7.3.1"
  }
}
```

## 常见错误排查

### 错误 1: "Failed to resolve module specifier"

**原因:** 没有添加 `fixMediainfoWasmImportMetaUrl` 插件

**解决:** 按照 "必需配置" 第 2 步添加插件

### 错误 2: "ENOENT: no such file or directory"

**原因:** monorepo 中没有配置 `server.fs.allow`

**解决:** 添加 `server.fs.allow: [searchForWorkspaceRoot(process.cwd())]`

### 错误 3: "MediaInfoModule.wasm 404"

**原因:** `locateFile` 配置错误

**解决:** 确保 `locateFile` 正确返回 WASM URL，使用 `?url` 导入

### 错误 4: 分析时无响应

**原因:** 文件太大或 chunkSize 不合适

**解决:** 调整 chunkSize
```typescript
const mediainfo = await mediaInfoFactory({
  chunkSize: 1024 * 1024 // 增加到 1MB
})
```

## 性能优化

### 1. 增加chunkSize

对于大文件，可以增加读取块大小：
```typescript
const mediainfo = await mediaInfoFactory({
  chunkSize: 1024 * 1024 // 1MB
})
```

### 2. 延迟初始化

在用户真正需要时才初始化 MediaInfo 实例：
```typescript
const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null)

const initMediaInfo = async () => {
  const mi = await mediaInfoFactory({...})
  setMediaInfo(mi)
}

// 在用户选择文件时初始化
const handleFileSelect = async (file: File) => {
  if (!mediaInfo) {
    await initMediaInfo()
  }
  if (mediaInfo) {
    const result = await mediaInfo.analyzeData(...)
  }
}
```

### 3. 使用 Web Worker

将分析任务放到 Web Worker 中，避免阻塞主线程：
```typescript
// worker.ts
import mediaInfoFactory from 'mediainfo.js'
self.onmessage = async (e) => {
  const { file, chunkSize, offset } = e.data
  const mediainfo = await mediaInfoFactory()
  const result = await mediainfo.analyzeData(...)
  self.postMessage(result)
  mediainfo.close()
}
```
