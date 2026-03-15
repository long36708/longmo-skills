# mediainfo.js - Webpack 浏览器配置

## 重要注意事项

⚠️ **Webpack 特殊配置要求**

Webpack 项目中使用 mediainfo.js 需要正确配置 WASM 文件的加载路径，避免文件名被哈希化和路径解析错误。

## 必需配置

### 1. 安装依赖

```bash
npm install mediainfo.js webpack webpack-cli webpack-dev-server
npm install --save-dev html-webpack-plugin ts-loader typescript
```

### 2. 创建 webpack.config.js

```javascript
import path from 'node:path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const isDev = process.env.NODE_ENV === 'development'

// ⚠️ 重要: 帮助 Webpack 找到 WASM 文件
const wasmFilePath = path.resolve(
  import.meta.dirname,
  'node_modules',
  'mediainfo.js',
  'dist',
  'MediaInfoModule.wasm'
)

export default {
  mode: process.env.NODE_ENV,
  entry: './src/main.tsx',

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: { transpileOnly: true },
        },
      },
    ],
  },

  output: {
    path: path.resolve(import.meta.dirname, 'dist'),
    filename: isDev ? '[name].js' : '[name].[contenthash].js',
    // ⚠️ 重要: 确保 WASM 文件名不被 Webpack 篡改
    assetModuleFilename: '[name][ext]',
    clean: !isDev,
  },

  resolve: {
    // ⚠️ 重要: 帮助 Webpack 解析 WASM 文件
    alias: { 'MediaInfoModule.wasm': wasmFilePath },
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
  },

  devtool: isDev ? 'cheap-module-source-map' : 'source-map',

  devServer: isDev ? { open: true } : undefined,

  plugins: [
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
  ],
}
```

**关键点说明:**
- `assetModuleFilename: '[name][ext]'` - 防止 WASM 文件名被哈希化
- `alias: { 'MediaInfoModule.wasm': wasmFilePath }` - 创建 WASM 文件的别名
- `wasmFilePath` - 明确指定 WASM 文件的绝对路径

### 3. React 组件实现

```typescript
import React, { type ChangeEvent, useState, useEffect, useRef } from 'react'
import mediaInfoFactory from 'mediainfo.js'
import type { MediaInfo, ReadChunkFunc } from 'mediainfo.js'

// 读取文件块的辅助函数
function makeReadChunk(file: File): ReadChunkFunc {
  return async (chunkSize: number, offset: number) =>
    new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer())
}

function App() {
  const mediaInfoRef = useRef<MediaInfo<'text'> | null>(null)
  const [result, setResult] = useState('')

  useEffect(() => {
    mediaInfoFactory({
      format: 'text',
      // ⚠️ 重要: 从同一目录加载 WASM 文件
      locateFile: (filename) => filename,
    })
      .then((mi) => {
        mediaInfoRef.current = mi
      })
      .catch((error: unknown) => {
        console.error(error)
      })

    // 清理函数: 组件卸载时关闭 MediaInfo 实例
    return () => {
      if (mediaInfoRef.current) {
        mediaInfoRef.current.close()
      }
    }
  }, [])

  const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0]
    if (file && mediaInfoRef.current) {
      mediaInfoRef.current
        .analyzeData(file.size, makeReadChunk(file))
        .then(setResult)
        .catch((error: unknown) => {
          console.error(error)
        })
    }
  }

  return (
    <>
      <input type="file" placeholder="Select file..." onChange={handleChange} />
      <pre>{result}</pre>
    </>
  )
}

export default App
```

**关键点说明:**
- `locateFile: (filename) => filename` - 让 Webpack 使用别名解析 WASM 文件
- 不需要像 Vite 那样使用 `?url` 导入

### 4. HTML 模板 (src/index.html)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>MediaInfo.js Webpack Example</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### 5. package.json 配置

```json
{
  "name": "mediainfojs-webpack-react-example",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "cross-env NODE_ENV=development webpack serve",
    "build": "cross-env NODE_ENV=production webpack",
    "serve": "cross-env NODE_ENV=production webpack && cross-env serve dist/"
  },
  "dependencies": {
    "mediainfo.js": "latest",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.1",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@types/webpack-env": "^1.18.8",
    "cross-env": "^7.0.3",
    "html-webpack-plugin": "^5.6.3",
    "serve": "^14.2.4",
    "ts-loader": "9.5.2",
    "typescript": "^5.8.3",
    "webpack": "^5.99.5",
    "webpack-cli": "^6.0.1",
    "webpack-dev-server": "^5.2.1"
  }
}
```

## 关键注意事项

### 1. assetModuleFilename 配置

**错误配置:**
```javascript
// ❌ 这会导致 WASM 文件被哈希化
output: {
  assetModuleFilename: '[name].[contenthash][ext]'
}
```

**正确配置:**
```javascript
// ✅ 保持 WASM 文件名不变
output: {
  assetModuleFilename: '[name][ext]'
}
```

**原因:** MediaInfo.js 内部硬编码了 WASM 文件名为 `MediaInfoModule.wasm`，如果文件名被哈希化（如 `MediaInfoModule.abc123.wasm`），会导致找不到文件。

### 2. alias 配置

**必须创建别名:**
```javascript
resolve: {
  alias: { 'MediaInfoModule.wasm': wasmFilePath }
}
```

这个别名让 Webpack 能够正确解析 `MediaInfoModule.wasm` 引用，并将其指向实际的 WASM 文件。

### 3. locateFile 配置

**Webpack 与 Vite 的区别:**

Webpack 配置（简单）:
```typescript
// ✅ Webpack: 使用别名自动解析
locateFile: (filename) => filename
```

Vite 配置（需要额外步骤）:
```typescript
// Vite: 需要使用 ?url 导入
import mediaInfoWasmUrl from 'mediainfo.js/MediaInfoModule.wasm?url'
locateFile: (path, prefix) =>
  path === 'MediaInfoModule.wasm' ? mediaInfoWasmUrl : `${prefix}${path}`
```

### 4. wasmFilePath 路径

**确保路径正确:**
```javascript
const wasmFilePath = path.resolve(
  import.meta.dirname,  // 当前文件所在目录
  'node_modules',
  'mediainfo.js',
  'dist',
  'MediaInfoModule.wasm'
)
```

如果使用 pnpm workspace link，路径仍然指向 `node_modules`，因为 WASM 文件在链接包的 node_modules 中。

### 5. 开发服务器配置

使用 `webpack-dev-server` 时，不需要像 Vite 那样配置 `fs.allow`，因为 Webpack 会自动处理模块解析。

## 常见错误排查

### 错误 1: "MediaInfoModule.wasm 404"

**原因:**
- `assetModuleFilename` 配置不正确，文件名被哈希化
- `alias` 配置缺失或路径错误

**解决:**
```javascript
output: {
  assetModuleFilename: '[name][ext]'  // 不添加 contenthash
},
resolve: {
  alias: { 'MediaInfoModule.wasm': wasmFilePath }
}
```

### 错误 2: "Failed to resolve MediaInfoModule.wasm"

**原因:** `wasmFilePath` 路径错误

**解决:**
检查 `wasmFilePath` 是否正确指向 `node_modules/mediainfo.js/dist/MediaInfoModule.wasm`

### 错误 3: 构建后的 WASM 文件名不对

**症状:** 构建后文件名变成 `MediaInfoModule.123456.wasm`

**原因:** `assetModuleFilename` 配置错误

**解决:**
```javascript
output: {
  assetModuleFilename: '[name][ext]'  // 移除 [contenthash]
}
```

### 错误 4: 开发环境正常，生产环境失败

**原因:** 开发和生产环境的 `assetModuleFilename` 配置不一致

**解决:**
确保两个环境使用相同的配置：
```javascript
output: {
  filename: isDev ? '[name].js' : '[name].[contenthash].js',
  assetModuleFilename: '[name][ext]',  // 始终不哈希化
}
```

## 生产环境优化

### 1. 分离 WASM 文件

Webpack 5 默认将 WASM 作为异步模块加载，这已经是最佳实践。如果需要手动配置：

```javascript
output: {
  // 将 WASM 文件放在特定目录
  assetModuleFilename: 'wasm/[name][ext]'
}
```

### 2. CDN 部署

如果使用 CDN 部署，需要调整 `locateFile`:

```typescript
mediaInfoFactory({
  format: 'text',
  locateFile: (filename) => {
    if (filename === 'MediaInfoModule.wasm') {
      return 'https://cdn.example.com/mediainfo/MediaInfoModule.wasm'
    }
    return filename
  }
})
```

### 3. 预加载 WASM

在 HTML 中预加载 WASM 文件：

```html
<link rel="preload" href="/wasm/MediaInfoModule.wasm" as="fetch" crossorigin>
```

## TypeScript 配置

确保 `tsconfig.json` 包含 Webpack 的类型：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "types": ["webpack-env"]
  }
}
```

## Webpack 4 迁移

如果使用 Webpack 4，需要额外配置：

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'webassembly/async'
      }
    ]
  },
  experiments: {
    asyncWebAssembly: true
  }
}
```

但建议升级到 Webpack 5，因为它对 WASM 的支持更完善。
