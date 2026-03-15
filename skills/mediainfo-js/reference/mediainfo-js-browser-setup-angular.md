# mediainfo.js - Angular 浏览器配置

## 重要注意事项

⚠️ **Angular 特殊配置要求**

Angular 项目中使用 mediainfo.js 需要特殊处理，因为 Angular CLI 默认的构建配置可能会影响 WASM 文件的加载。

## 必需配置

### 1. 安装依赖

```bash
npm install mediainfo.js
```

### 2. Angular 组件实现

```typescript
import { Component } from '@angular/core'
import mediaInfoFactory from 'mediainfo.js'
import type { MediaInfo, ReadChunkFunc } from 'mediainfo.js'

// 读取文件块的辅助函数
function makeReadChunk(file: File): ReadChunkFunc {
  return async (chunkSize: number, offset: number) =>
    new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer())
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
})
export class AppComponent {
  mediaInfo: MediaInfo<'text'> | undefined = undefined
  result = ''
  disabled = true

  constructor() {
    mediaInfoFactory({ format: 'text' })
      .then((mediaInfo) => {
        this.mediaInfo = mediaInfo
        this.disabled = false
      })
      .catch((error: unknown) => {
        console.error(error)
      })
  }

  onChangeFile(event: Event) {
    if (this.mediaInfo && event.target) {
      const target = event.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        const file = target.files[0]
        this.mediaInfo
          .analyzeData(file.size, makeReadChunk(file))
          .then((result) => {
            this.result = result
          })
          .catch((error: unknown) => {
            console.error(error)
          })
      }
    }
  }

  // 在组件销毁时清理资源
  ngOnDestroy() {
    if (this.mediaInfo) {
      this.mediaInfo.close()
    }
  }
}
```

### 3. 模板文件 (app.component.html)

```html
<div>
  <input type="file" [disabled]="disabled" (change)="onChangeFile($event)" />
  <pre>{{ result }}</pre>
</div>
```

### 4. package.json 配置

```json
{
  "name": "mediainfojs-angular-example",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "lint": "eslint src/"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "^18.0.0",
    "@angular/common": "^18.0.0",
    "@angular/compiler": "^18.0.0",
    "@angular/core": "^18.0.0",
    "@angular/forms": "^18.0.0",
    "@angular/platform-browser": "^18.0.0",
    "@angular/platform-browser-dynamic": "^18.0.0",
    "@angular/router": "^18.0.0",
    "mediainfo.js": "latest",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.3"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^18.0.2",
    "@angular/cli": "^18.0.2",
    "@angular/compiler-cli": "^18.0.0",
    "typescript": "~5.4.2"
  }
}
```

## 关键注意事项

### 1. 资源生命周期管理

**必须在 ngOnDestroy 中关闭实例:**

```typescript
export class AppComponent implements OnDestroy {
  mediaInfo: MediaInfo | undefined = undefined

  ngOnDestroy() {
    if (this.mediaInfo) {
      this.mediaInfo.close()
    }
  }
}
```

**原因:** Angular 的组件会被销毁和重新创建，如果不关闭 MediaInfo 实例，会导致内存泄漏。

### 2. 异步初始化

**使用 Promise 方式初始化:**

```typescript
constructor() {
  mediaInfoFactory({ format: 'text' })
    .then((mediaInfo) => {
      this.mediaInfo = mediaInfo
      this.disabled = false  // 启用文件输入
    })
    .catch((error) => {
      console.error('初始化失败:', error)
    })
}
```

**为什么不用 Observable:**
虽然 Angular 习惯使用 RxJS，但 mediaInfoFactory 只返回 Promise，转换为 Observable 会增加不必要的复杂度。

### 3. 文件上传控制

**禁用输入直到初始化完成:**

```typescript
disabled = true  // 初始状态禁用

constructor() {
  mediaInfoFactory()
    .then((mediaInfo) => {
      this.mediaInfo = mediaInfo
      this.disabled = false  // 初始化完成后启用
    })
}
```

**模板中:**
```html
<input type="file" [disabled]="disabled" (change)="onChangeFile($event)" />
```

这防止用户在 MediaInfo 实例准备好之前上传文件。

### 4. 类型安全

**导入完整类型:**

```typescript
import type { MediaInfo, ReadChunkFunc } from 'mediainfo.js'
```

明确指定类型参数：
```typescript
mediaInfo: MediaInfo<'text'> | undefined = undefined
```

### 5. 独立组件

使用 Angular 18+ 的独立组件特性：

```typescript
@Component({
  selector: 'app-root',
  standalone: true,  // 独立组件
  templateUrl: './app.component.html',
})
export class AppComponent {
  // 不需要在 declarations 数组中声明
}
```

## Angular CLI 配置

### angular.json 配置

通常不需要特殊配置，但如果遇到问题，可以调整：

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.css"
            ],
            "scripts": []
          }
        }
      }
    }
  }
}
```

### tsconfig.json 配置

确保支持 ESM 和现代 JavaScript：

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2022", "dom"],
    "useDefineForClassFields": true,
    "strict": true,
    "esModuleInterop": true
  },
  "files": ["src/main.ts"]
}
```

## 高级用法

### 1. 创建可复用的服务

```typescript
// media-info.service.ts
import { Injectable, OnDestroy } from '@angular/core'
import mediaInfoFactory, { type MediaInfo } from 'mediainfo.js'

@Injectable({
  providedIn: 'root'
})
export class MediaInfoService implements OnDestroy {
  private mediaInfo: MediaInfo | undefined = undefined

  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      this.mediaInfo = await mediaInfoFactory({ format: 'object' })
    } catch (error) {
      console.error('MediaInfo 初始化失败:', error)
    }
  }

  async analyzeFile(file: File) {
    if (!this.mediaInfo) {
      await this.initialize()
    }

    if (!this.mediaInfo) {
      throw new Error('MediaInfo 未初始化')
    }

    const readChunk = (chunkSize: number, offset: number) =>
      new Uint8Array(file.slice(offset, offset + chunkSize).arrayBuffer())

    return this.mediaInfo.analyzeData(file.size, readChunk)
  }

  ngOnDestroy() {
    if (this.mediaInfo) {
      this.mediaInfo.close()
    }
  }
}
```

**在组件中使用:**

```typescript
export class AppComponent {
  constructor(private mediaInfoService: MediaInfoService) {}

  async handleFileSelect(file: File) {
    try {
      const result = await this.mediaInfoService.analyzeFile(file)
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }
}
```

### 2. 使用 Signal (Angular 16+)

```typescript
import { Component, signal, effect } from '@angular/core'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
})
export class AppComponent {
  result = signal<string>('')
  isReady = signal<boolean>(false)
  private mediaInfo: MediaInfo | undefined = undefined

  constructor() {
    mediaInfoFactory()
      .then((mi) => {
        this.mediaInfo = mi
        this.isReady.set(true)
      })
      .catch(console.error)
  }

  onChangeFile(event: Event) {
    if (!this.isReady() || !this.mediaInfo) return

    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    const readChunk = (chunkSize: number, offset: number) =>
      new Uint8Array(file.slice(offset, offset + chunkSize).arrayBuffer())

    this.mediaInfo
      .analyzeData(file.size, readChunk)
      .then((result) => this.result.set(result))
      .catch(console.error)
  }

  ngOnDestroy() {
    this.mediaInfo?.close()
  }
}
```

### 3. 多文件处理

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
})
export class AppComponent {
  mediaInfo: MediaInfo | undefined = undefined
  results: Array<{ file: string; info: string }> = []
  isProcessing = false

  constructor() {
    mediaInfoFactory().then((mi) => this.mediaInfo = mi)
  }

  async handleMultipleFiles(event: Event) {
    if (!this.mediaInfo) return

    const target = event.target as HTMLInputElement
    const files = Array.from(target.files || [])
    if (files.length === 0) return

    this.isProcessing = true
    this.results = []

    for (const file of files) {
      try {
        const readChunk = (chunkSize: number, offset: number) =>
          new Uint8Array(file.slice(offset, offset + chunkSize).arrayBuffer())

        const info = await this.mediaInfo.analyzeData(file.size, readChunk)
        this.results.push({ file: file.name, info })
      } catch (error) {
        console.error(`处理 ${file.name} 失败:`, error)
      }
    }

    this.isProcessing = false
  }

  ngOnDestroy() {
    this.mediaInfo?.close()
  }
}
```

## 常见错误排查

### 错误 1: "Can't resolve 'mediainfo.js'"

**原因:** Angular CLI 的优化配置

**解决:** 确保 `tsconfig.json` 的 `moduleResolution` 设置为 `"node"`

### 错误 2: "MediaInfo is not ready"

**原因:** 在初始化完成前尝试使用 MediaInfo

**解决:**
```typescript
// 使用 disabled 标志控制
disabled = true

constructor() {
  mediaInfoFactory().then(() => {
    this.disabled = false
  })
}
```

### 错误 3: 内存泄漏

**症状:** 长时间使用后浏览器变慢

**原因:** 没有在 ngOnDestroy 中关闭实例

**解决:**
```typescript
ngOnDestroy() {
  if (this.mediaInfo) {
    this.mediaInfo.close()
  }
}
```

### 错误 4: Angular Strict Mode 错误

**原因:** TypeScript 严格模式下的类型问题

**解决:**
```typescript
// 明确指定类型
mediaInfo: MediaInfo<'text'> | undefined = undefined

// 使用可选链
this.mediaInfo?.analyzeData(...)

// 使用类型断言
const target = event.target as HTMLInputElement
```

## 性能优化

### 1. 使用 ChangeDetection.OnPush

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  // 使用 signal 或手动触发变更检测
}
```

### 2. 懒加载 MediaInfo

```typescript
private async getMediaInfo() {
  if (!this.mediaInfo) {
    this.mediaInfo = await mediaInfoFactory()
  }
  return this.mediaInfo
}

async analyzeFile(file: File) {
  const mi = await this.getMediaInfo()
  // 使用 mi...
}
```

### 3. 使用 Web Worker

将分析任务放到 Web Worker 中：

```typescript
// worker.ts
import mediaInfoFactory from 'mediainfo.js'

self.onmessage = async (e) => {
  const { fileData, fileName } = e.data
  const mediainfo = await mediaInfoFactory()

  const readChunk = (chunkSize: number, offset: number) =>
    fileData.slice(offset, offset + chunkSize)

  const result = await mediainfo.analyzeData(fileData.byteLength, readChunk)
  self.postMessage({ fileName, result })

  mediainfo.close()
}
```

## 与 Angular 特性集成

### 1. 与 HttpClient 配合

先上传文件到服务器，再分析本地副本：

```typescript
async uploadAndAnalyze(file: File) {
  // 上传
  const uploadResult = await this.http.post('/api/upload', file).toPromise()

  // 分析本地文件
  const readChunk = (chunkSize: number, offset: number) =>
    new Uint8Array(file.slice(offset, offset + chunkSize).arrayBuffer())

  const analysis = await this.mediaInfo?.analyzeData(file.size, readChunk)

  return { uploadResult, analysis }
}
```

### 2. 与 Router 配合

在路由切换时清理资源：

```typescript
export class AppComponent implements OnDestroy {
  constructor(
    private router: Router,
    private mediaInfoService: MediaInfoService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // 路由切换时重新初始化
      }
    })
  }

  ngOnDestroy() {
    this.mediaInfoService.cleanup()
  }
}
```

## 单元测试

```typescript
import { TestBed } from '@angular/core/testing'
import { AppComponent } from './app.component'

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents()
  })

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.componentInstance
    expect(app).toBeTruthy()
  })

  it('should initialize MediaInfo', (done) => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.componentInstance

    setTimeout(() => {
      expect(app.mediaInfo).toBeDefined()
      expect(app.disabled).toBeFalse()
      done()
    }, 1000)
  })
})
```
