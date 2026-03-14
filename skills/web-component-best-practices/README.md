# Web Component 最佳实践

这个技能提供了构建现代化、生产级 Web Component 的全面最佳实践。

## 内容

### SKILL.md
主要技能文档，包含：
- 架构设计模式
- TypeScript 集成指南
- 属性管理策略
- 生命周期管理最佳实践
- Shadow DOM 使用模式
- 事件处理技术
- 性能优化技巧
- 可访问性指南
- 测试策略
- 组件注册模式

### References

#### `references/complete-example.ts`
一个完整的、生产级的计数器组件，展示了所有最佳实践：
- 基类继承
- 属性-属性同步
- 事件委托处理
- 生命周期管理
- 可访问性功能
- 键盘导航
- Shadow DOM 封装
- CSS 自定义属性用于主题化

#### `references/attribute-utils.ts`
类型安全的属性操作工具函数：
- 布尔、数字、字符串、JSON 属性的 getter/setter
- 自定义属性序列化器/反序列化器
- 令牌列表和日期属性辅助函数
- 属性变化监听工具
- 批量属性操作

#### `references/css-utils.ts`
Shadow DOM 的 CSS 工具：
- CSS 规则管理（获取、插入、删除）
- CSS 自定义属性管理
- 作用域样式表
- 动画辅助函数
- 媒体查询监听器
- 焦点陷阱实现
- Resize/Intersection/Mutation 观察器

#### `references/testing-guide.ts`
使用 Vitest 的综合测试模式：
- 基础渲染测试
- 属性-属性同步测试
- 值更新测试
- 事件处理测试
- 事件分发测试
- 边界条件测试
- 可访问性测试
- 生命周期测试
- 边缘情况处理
- 集成测试

### Assets

#### `assets/examples.html`
实时的 HTML 示例，展示：
- 基本用法
- 属性配置
- JavaScript API
- 事件处理
- 使用 CSS 自定义属性进行样式设置
- 插槽使用
- 禁用状态
- 多实例
- 键盘导航

## 核心特性

### 1. 类型安全
- 强类型常量和事件
- 类型安全的属性工具
- 全面的 TypeScript 支持

### 2. 性能
- 使用 requestAnimationFrame 高效更新 DOM
- CSS 规则缓存
- 最小化属性变更
- 动态内容的事件委托

### 3. 可访问性
- ARIA 属性
- 键盘导航
- 焦点管理
- 屏幕阅读器支持

### 4. 开发体验
- 清晰的命名约定
- 全面的文档
- 可重用的工具函数
- 测试模式

### 5. 最佳实践
- 基类模式
- Shadow DOM 封装
- CSS 自定义属性用于主题化
- 事件组合
- 生命周期管理

## 使用方法

当创建或重构 Web Component 时，此技能提供：

1. **架构指导** - 如何构建组件
2. **TypeScript 模式** - 类型安全的实现
3. **属性管理** - 属性/属性的最佳实践
4. **事件处理** - 可靠的事件模式
5. **样式设置** - Shadow DOM 和 CSS 自定义属性
6. **测试** - 全面的测试策略
7. **可访问性** - A11y 最佳实践

## 示例

```typescript
import {
  getBooleanAttr,
  setBooleanAttr,
  getNumericAttr,
  setNumericAttr,
} from './attribute-utils';

export class MyComponent extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['value', 'disabled'];
  }

  // 带有类型安全 getter/setter 的属性
  get value(): number {
    return getNumericAttr(this, 'value', 0) ?? 0;
  }

  set value(newValue: number) {
    setNumericAttr(this, 'value', newValue);
  }

  get disabled(): boolean {
    return getBooleanAttr(this, 'disabled');
  }

  set disabled(newValue: boolean) {
    setBooleanAttr(this, 'disabled', newValue);
  }

  connectedCallback(): void {
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  private render(): void {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --primary-color: #007bff;
        }
        .button {
          background: var(--primary-color);
        }
      </style>
      <button class="button">
        <slot></slot>
      </button>
    `;
  }
}
```

## 测试

请参阅 `references/testing-guide.ts` 获取全面的测试示例，涵盖：
- 渲染
- 属性同步
- 事件处理
- 可访问性
- 边缘情况
- 集成场景

## 贡献

这个技能基于生产环境 Web Component 实现的真实最佳实践。它提供了通用的、可重用的模式，适用于任何 Web Component 项目。

## 许可证

此技能是 .codebuddy/skills 集合的一部分。
