# mediainfo.js - UMD/CMD 浏览器配置

## 重要注意事项

⚠️ **UMD/CMD 模式特殊要求**

使用 UMD (Universal Module Definition) 或 CMD (Common Module Definition) 方式引入 mediainfo.js 时，需要通过 CDN 加载，并且需要注意全局变量 `MediaInfo` 的使用。

## 基本使用方式

### 1. 通过 CDN 引入

```html
<!doctype html>
<html lang="en-us">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>mediainfo.js simple demo</title>
    <style>
      html, body {
        margin: 0;
        padding: 0;
      }
      body * {
        box-sizing: border-box;
      }
      #wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 8px;
        position: absolute;
        width: 100%;
      }
      #fileinput {
        padding-bottom: 8px;
      }
      #output {
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="wrapper">
      <input disabled type="file" id="fileinput" name="fileinput" />
      <textarea id="output"></textarea>
    </div>

    <!-- ⚠️ 必须先加载 mediainfo.js 库 -->
    <script type="text/javascript" src="https://unpkg.com/mediainfo.js"></script>
    <!-- 然后加载你的应用代码 -->
    <script type="text/javascript" src="./example.js"></script>
  </body>
</html>
```

### 2. 应用代码实现 (example.js)

```javascript
const fileinput = document.getElementById('fileinput')
const output = document.getElementById('output')

// ⚠️ 重要: 使用全局变量 MediaInfo.mediaInfoFactory
const onChangeFile = (mediainfo) => {
  const file = fileinput.files[0]
  if (file) {
    output.value = 'Working…'

    const readChunk = async (chunkSize, offset) =>
      new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer())

    mediainfo
      .analyzeData(file.size, readChunk)
      .then((result) => {
        output.value = result
      })
      .catch((error) => {
        output.value = `An error occurred:\n${error.stack}`
      })
  }
}

// ⚠️ 使用 MediaInfo.mediaInfoFactory（不是直接 import）
MediaInfo.mediaInfoFactory({ format: 'text' }, (mediainfo) => {
  // MediaInfo 实例准备完成后，启用文件输入
  fileinput.removeAttribute('disabled')
  fileinput.addEventListener('change', () => onChangeFile(mediainfo))
})
```

## 关键注意事项

### 1. CDN 加载顺序

**正确顺序:**
```html
<!-- 1. 先加载库 -->
<script type="text/javascript" src="https://unpkg.com/mediainfo.js"></script>

<!-- 2. 再加载应用代码 -->
<script type="text/javascript" src="./example.js"></script>
```

**错误顺序:**
```html
<!-- ❌ 这样会报错：MediaInfo is not defined -->
<script type="text/javascript" src="./example.js"></script>
<script type="text/javascript" src="https://unpkg.com/mediainfo.js"></script>
```

### 2. 使用全局变量

**UMD 模式下的 API:**

```javascript
// ✅ 正确: 使用全局 MediaInfo 对象
MediaInfo.mediaInfoFactory({ format: 'text' }, (mediainfo) => {
  // 使用 mediainfo 实例
})

// ❌ 错误: 试图使用 import
import mediaInfoFactory from 'mediainfo.js'  // UMD 环境不支持
```

### 3. 回调模式

**UMD 模式必须使用回调:**

```javascript
// ✅ UMD 模式: 使用回调
MediaInfo.mediaInfoFactory({ format: 'text' }, (mediainfo) => {
  // 使用 mediainfo
}, (error) => {
  console.error('初始化失败:', error)
})

// ❌ UMD 模式: Promise 模式可能不工作
const mediainfo = await MediaInfo.mediaInfoFactory({ format: 'text' })
```

虽然 UMD 版本支持 Promise，但为了最大兼容性，建议使用回调模式。

### 4. WASM 文件路径

**UMD 模式会自动处理 WASM 路径:**

```javascript
// 不需要配置 locateFile，库会自动从 CDN 加载 WASM
MediaInfo.mediaInfoFactory({ format: 'text' }, (mediainfo) => {
  // 直接使用
})
```

如果需要自定义 WASM 路径：

```javascript
MediaInfo.mediaInfoFactory({
  format: 'text',
  locateFile: (path) => {
    // 返回自定义的 WASM URL
    return 'https://your-cdn.com/MediaInfoModule.wasm'
  }
}, (mediainfo) => {
  // ...
})
```

## CDN 版本选择

### unpkg

```html
<script src="https://unpkg.com/mediainfo.js"></script>
```

获取最新版本：
```html
<script src="https://unpkg.com/mediainfo.js@latest"></script>
```

获取特定版本：
```html
<script src="https://unpkg.com/mediainfo.js@0.3.7"></script>
```

### jsDelivr

```html
<script src="https://cdn.jsdelivr.net/npm/mediainfo.js"></script>
```

获取特定版本：
```html
<script src="https://cdn.jsdelivr.net/npm/mediainfo.js@0.3.7/dist/umd/index.min.js"></script>
```

### cdnjs

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/mediainfo.js/0.3.7/mediainfo.min.js"></script>
```

## 完整示例

### 1. 基础示例

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>MediaInfo.js Demo</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .status {
      margin: 10px 0;
      padding: 10px;
      border-radius: 4px;
    }
    .status.loading {
      background: #fff3cd;
      color: #856404;
    }
    .status.error {
      background: #f8d7da;
      color: #721c24;
    }
    #output {
      width: 100%;
      height: 400px;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>MediaInfo.js Demo</h1>

  <div id="status"></div>

  <input type="file" id="fileinput" disabled />
  <button id="clear" disabled>清除结果</button>

  <pre id="output"></pre>

  <script src="https://unpkg.com/mediainfo.js"></script>
  <script>
    const fileInput = document.getElementById('fileinput')
    const output = document.getElementById('output')
    const clearBtn = document.getElementById('clear')
    const status = document.getElementById('status')
    let mediainfo = null

    function showStatus(message, type) {
      status.innerHTML = message
      status.className = `status ${type}`
    }

    function readChunk(file, chunkSize, offset) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(new Uint8Array(e.target.result))
        reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
      })
    }

    async function analyzeFile() {
      const file = fileInput.files[0]
      if (!file || !mediainfo) return

      showStatus('正在分析...', 'loading')
      output.textContent = ''

      try {
        const result = await mediainfo.analyzeData(
          file.size,
          (chunkSize, offset) => readChunk(file, chunkSize, offset)
        )
        output.textContent = result
        showStatus('分析完成', '')
      } catch (error) {
        output.textContent = `错误: ${error.message}\n${error.stack}`
        showStatus('分析失败', 'error')
      }
    }

    function clearOutput() {
      output.textContent = ''
      status.textContent = ''
    }

    // 初始化 MediaInfo
    MediaInfo.mediaInfoFactory({ format: 'text' }, (mi) => {
      mediainfo = mi
      fileInput.disabled = false
      clearBtn.disabled = false
      showStatus('MediaInfo 已就绪', '')
    }, (error) => {
      showStatus(`初始化失败: ${error.message}`, 'error')
    })

    // 事件监听
    fileInput.addEventListener('change', analyzeFile)
    clearBtn.addEventListener('click', clearOutput)
  </script>
</body>
</html>
```

### 2. 多文件批量分析

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>MediaInfo.js - 批量分析</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 20px auto; padding: 20px; }
    .file-list { list-style: none; padding: 0; }
    .file-item {
      padding: 10px;
      margin: 5px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .file-item.success { border-left: 4px solid #28a745; }
    .file-item.error { border-left: 4px solid #dc3545; }
    .file-item.processing { border-left: 4px solid #ffc107; }
    pre {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <h1>MediaInfo.js - 批量文件分析</h1>

  <input type="file" id="fileinput" multiple disabled />
  <button id="analyze" disabled>开始分析</button>
  <button id="clear">清空结果</button>

  <ul id="fileList" class="file-list"></ul>

  <script src="https://unpkg.com/mediainfo.js"></script>
  <script>
    const fileInput = document.getElementById('fileinput')
    const analyzeBtn = document.getElementById('analyze')
    const clearBtn = document.getElementById('clear')
    const fileList = document.getElementById('fileList')
    let mediainfo = null

    function createFileItem(fileName, status = '') {
      const li = document.createElement('li')
      li.className = 'file-item'
      li.innerHTML = `
        <strong>${fileName}</strong>
        <span class="status">${status}</span>
        <pre class="result"></pre>
      `
      return li
    }

    function updateFileItem(li, status, className, result = '') {
      li.querySelector('.status').textContent = status
      li.className = `file-item ${className}`
      if (result) {
        li.querySelector('.result').textContent = result
      }
    }

    function readChunk(file, chunkSize, offset) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(new Uint8Array(e.target.result))
        reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
      })
    }

    async function analyzeFiles() {
      const files = Array.from(fileInput.files)
      if (files.length === 0) return

      analyzeBtn.disabled = true
      fileList.innerHTML = ''

      // 为每个文件创建 UI 元素
      const items = new Map()
      files.forEach(file => {
        const item = createFileItem(file.name, '等待中...')
        fileList.appendChild(item)
        items.set(file, item)
      })

      // 依次分析每个文件
      for (const file of files) {
        const item = items.get(file)
        updateFileItem(item, '分析中...', 'processing')

        try {
          const result = await mediainfo.analyzeData(
            file.size,
            (chunkSize, offset) => readChunk(file, chunkSize, offset)
          )
          updateFileItem(item, '完成', 'success', result)
        } catch (error) {
          updateFileItem(item, `失败: ${error.message}`, 'error')
        }
      }

      analyzeBtn.disabled = false
    }

    function clearResults() {
      fileList.innerHTML = ''
      fileInput.value = ''
    }

    // 初始化 MediaInfo
    MediaInfo.mediaInfoFactory({ format: 'text' }, (mi) => {
      mediainfo = mi
      fileInput.disabled = false
      analyzeBtn.disabled = false
    })

    // 事件监听
    analyzeBtn.addEventListener('click', analyzeFiles)
    clearBtn.addEventListener('click', clearResults)
  </script>
</body>
</html>
```

## 高级配置

### 1. 自定义 WASM 位置

```javascript
MediaInfo.mediaInfoFactory({
  format: 'text',
  locateFile: (path, prefix) => {
    // 返回你自己的 WASM 文件位置
    return 'https://your-domain.com/static/MediaInfoModule.wasm'
  }
}, (mediainfo) => {
  // ...
})
```

### 2. 使用不同输出格式

```javascript
// JSON 格式
MediaInfo.mediaInfoFactory({ format: 'JSON' }, (mediainfo) => {
  // 结果是 JSON 字符串
})

// XML 格式
MediaInfo.mediaInfoFactory({ format: 'XML' }, (mediainfo) => {
  // 结果是 XML 字符串
})

// HTML 格式
MediaInfo.mediaInfoFactory({ format: 'HTML' }, (mediainfo) => {
  // 结果是 HTML 字符串
})
```

### 3. 获取完整信息

```javascript
MediaInfo.mediaInfoFactory({
  format: 'text',
  full: true  // 显示所有技术标签
}, (mediainfo) => {
  // ...
})
```

## 常见错误排查

### 错误 1: "MediaInfo is not defined"

**原因:** 脚本加载顺序错误

**解决:**
```html
<!-- 确保 mediainfo.js 在你的代码之前加载 -->
<script src="https://unpkg.com/mediainfo.js"></script>
<script src="./your-code.js"></script>
```

### 错误 2: "MediaInfo.mediaInfoFactory is not a function"

**原因:** CDN 版本过旧或加载失败

**解决:**
```html
<!-- 使用完整路径加载特定版本 -->
<script src="https://unpkg.com/mediainfo.js@0.3.7/dist/umd/index.min.js"></script>
```

### 错误 3: "Failed to load WASM"

**原因:** WASM 文件加载失败

**解决:**
```javascript
MediaInfo.mediaInfoFactory({
  format: 'text',
  locateFile: (path) => {
    console.log('尝试加载:', path)
    return 'https://unpkg.com/mediainfo.js@0.3.7/dist/' + path
  }
}, (mediainfo) => {
  // ...
})
```

### 错误 4: CORS 错误

**原因:** 浏览器安全策略阻止了跨域资源加载

**解决:**
- 使用支持 CORS 的 CDN (unpkg 和 jsDelivr 都支持)
- 或者将 WASM 文件部署到同一域名下

### 错误 5: 文件读取失败

**原因:** 读取大文件时可能遇到内存限制

**解决:**
```javascript
// 增加读取块大小
MediaInfo.mediaInfoFactory({
  format: 'text',
  chunkSize: 1024 * 1024  // 1MB
}, (mediainfo) => {
  // ...
})
```

## 性能优化

### 1. 使用 FileReader 的 readAsArrayBuffer

```javascript
function readChunk(file, chunkSize, offset) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(new Uint8Array(e.target.result))
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
  })
}
```

### 2. 添加进度指示

```javascript
function analyzeWithProgress(file) {
  const totalSize = file.size
  let processedSize = 0

  const readChunk = (chunkSize, offset) => {
    processedSize = offset + chunkSize
    const progress = (processedSize / totalSize * 100).toFixed(2)
    console.log(`进度: ${progress}%`)
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(new Uint8Array(e.target.result))
      reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
    })
  }

  return mediainfo.analyzeData(file.size, readChunk)
}
```

## 与其他库集成

### 1. 与 jQuery 集成

```javascript
$(document).ready(function() {
  let mediainfo = null

  MediaInfo.mediaInfoFactory({ format: 'text' }, (mi) => {
    mediainfo = mi
    $('#fileinput').prop('disabled', false)
  })

  $('#fileinput').on('change', function() {
    const file = this.files[0]
    if (!file) return

    const readChunk = (chunkSize, offset) =>
      new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(new Uint8Array(e.target.result))
        reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
      })

    mediainfo
      .analyzeData(file.size, readChunk)
      .then((result) => {
        $('#output').text(result)
      })
      .catch((error) => {
        $('#output').text(`错误: ${error.message}`)
      })
  })
})
```

### 2. 与 Vue.js 集成

```html
<!DOCTYPE html>
<html>
<head>
  <title>MediaInfo + Vue</title>
  <script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.js"></script>
  <script src="https://unpkg.com/mediainfo.js"></script>
</head>
<body>
  <div id="app">
    <input type="file" @change="handleFileChange" :disabled="!ready" />
    <div v-if="loading">正在分析...</div>
    <pre v-if="result">{{ result }}</pre>
    <div v-if="error" class="error">{{ error }}</div>
  </div>

  <script>
    const { createApp, ref } = Vue

    createApp({
      setup() {
        const ready = ref(false)
        const loading = ref(false)
        const result = ref('')
        const error = ref('')
        let mediainfo = null

        MediaInfo.mediaInfoFactory({ format: 'text' }, (mi) => {
          mediainfo = mi
          ready.value = true
        })

        const handleFileChange = async (event) => {
          const file = event.target.files[0]
          if (!file) return

          loading.value = true
          error.value = ''
          result.value = ''

          try {
            const readChunk = (chunkSize, offset) =>
              new Promise((resolve) => {
                const reader = new FileReader()
                reader.onload = (e) => resolve(new Uint8Array(e.target.result))
                reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
              })

            result.value = await mediainfo.analyzeData(file.size, readChunk)
          } catch (err) {
            error.value = err.message
          } finally {
            loading.value = false
          }
        }

        return { ready, loading, result, error, handleFileChange }
      }
    }).mount('#app')
  </script>
</body>
</html>
```

## 浏览器兼容性

- Chrome 57+
- Firefox 52+
- Safari 11+
- Edge 16+

**注意:** 必须启用 WebAssembly 支持

## 下载本地使用

如果不想使用 CDN，可以下载文件到本地：

```bash
npm install mediainfo.js
```

然后将以下文件复制到你的项目：
- `node_modules/mediainfo.js/dist/umd/index.min.js`
- `node_modules/mediainfo.js/dist/MediaInfoModule.wasm`

```html
<script src="./mediainfo.min.js"></script>
```

并配置 WASM 路径：

```javascript
MediaInfo.mediaInfoFactory({
  format: 'text',
  locateFile: (path) => './' + path
}, (mediainfo) => {
  // ...
})
```
