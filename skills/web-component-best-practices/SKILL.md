---
name: web-component-best-practices
description: 此技能应在创建、实现或重构 Web Components 时使用。提供 Web Component 开发的全面最佳实践，包括架构设计、TypeScript 集成、属性管理、生命周期处理、Shadow DOM 使用、事件处理和性能优化。专注于适用于任何 Web Component 实现的通用、可重用模式。
---

# Web Component 最佳实践

此技能提供了构建现代化、生产级 Web Components 的全面最佳实践。这些实践基于真实世界实现的经过验证的模式，专注于可维护性、类型安全、性能和开发体验。

## 何时使用此技能

在以下情况下使用此技能：
- 从零开始创建新的 Web Components
- 重构现有的 Web Components
- 设计 Web Component 架构
- 实现复杂的组件交互
- 优化 Web Component 性能
- 建立 Web Component 开发标准

## 架构设计

### 基类模式

始终使用基类为所有组件提供通用功能：

```typescript
// base-element.ts
export class BaseElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return [];
  }

  attributeChangedCallback(
    attrName: string,
    oldValue: string | null,
    newValue: string | null
  ): void {}

  connectedCallback(): void {}

  disconnectedCallback(): void {}
}
```

**优势：**
- 提供一致的继承模式
- 集中化通用生命周期钩子
- 启用共享工具方法
- 确保组件间统一的 API

### 组件层次结构

按逻辑层次组织组件：

```
BaseElement (抽象基类)
  ├── InteractiveElement (点击、键盘、焦点)
  │     ├── ButtonElement
  │     └── InputElement
  └── ContainerElement (布局、尺寸)
        ├── CardElement
        └── PanelElement
```

### 依赖注入

使用依赖注入来共享服务：

```typescript
class MyComponent extends BaseElement {
  #service: DataService;

  set service(value: DataService) {
    this.#service = value;
  }

  connectedCallback(): void {
    if (!this.#service) {
      this.#service = globalThis.dataService;
    }
  }
}
```

## TypeScript 集成

### 类型安全的常量

使用 TypeScript 类型定义常量：

```typescript
// constants.ts
export const ComponentProps = {
  VALUE: 'value',
  LABEL: 'label',
  DISABLED: 'disabled',
} as const;

export const ComponentAttributes = Object.entries(ComponentProps).reduce(
  (dictObj, [key, propName]) => {
    dictObj[key] = propName.toLowerCase();
    return dictObj;
  },
  {} as Record<keyof typeof ComponentProps, string>
);

export type ComponentAttributes = typeof ComponentAttributes;
export type ComponentProps = typeof ComponentProps;
```

### 类型安全的事件系统

定义强类型事件：

```typescript
export const ComponentEvents = {
  VALUE_CHANGE: 'valuechange',
  CLICK: 'click',
} as const;

export type ComponentEventType = {
  [K in keyof typeof ComponentEvents]: CustomEvent<{
    [key: string]: any;
  }>;
};
```

### 属性类型映射

创建类型安全的属性 getter/setter：

```typescript
// attribute-utils.ts
export function getBooleanAttr(el: HTMLElement, attrName: string): boolean {
  return el.hasAttribute(attrName);
}

export function setBooleanAttr(
  el: HTMLElement,
  attrName: string,
  value: boolean | null | undefined
): void {
  if (value == null) {
    if (el.hasAttribute(attrName)) {
      el.removeAttribute(attrName);
    }
    return;
  }
  if (getBooleanAttr(el, attrName) === value) return;
  el.toggleAttribute(attrName, value);
}

export function getNumericAttr(
  el: HTMLElement,
  attrName: string,
  defaultValue?: number
): number | undefined {
  const attrVal = el.getAttribute(attrName);
  return attrVal != null ? +attrVal : defaultValue;
}

export function setNumericAttr(
  el: HTMLElement,
  attrName: string,
  value: number | null | undefined
): void {
  if (value == null) {
    el.removeAttribute(attrName);
    return;
  }
  const current = getNumericAttr(el, attrName);
  if (current === value) return;
  el.setAttribute(attrName, String(value));
}

export function getStringAttr(
  el: HTMLElement,
  attrName: string,
  defaultValue?: string
): string | undefined {
  return el.getAttribute(attrName) ?? defaultValue;
}

export function setStringAttr(
  el: HTMLElement,
  attrName: string,
  value: string | null | undefined
): void {
  if (value == null) {
    el.removeAttribute(attrName);
    return;
  }
  const current = getStringAttr(el, attrName);
  if (current === value) return;
  el.setAttribute(attrName, value);
}
```

## 属性管理

### 观察属性

静态声明要观察的属性：

```typescript
export class MyComponent extends BaseElement {
  static get observedAttributes(): string[] {
    return [
      ComponentAttributes.VALUE,
      ComponentAttributes.LABEL,
      ComponentAttributes.DISABLED,
    ];
  }

  attributeChangedCallback(
    attrName: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) return;

    switch (attrName) {
      case ComponentAttributes.VALUE:
        this.handleValueChange(oldValue, newValue);
        break;
      case ComponentAttributes.LABEL:
        this.handleLabelChange(oldValue, newValue);
        break;
      case ComponentAttributes.DISABLED:
        this.handleDisabledChange(oldValue, newValue);
        break;
    }
  }

  private handleValueChange(oldValue: string | null, newValue: string | null): void {
    // 更新内部状态和 DOM
  }

  private handleLabelChange(oldValue: string | null, newValue: string | null): void {
    // 更新标签显示
  }

  private handleDisabledChange(oldValue: string | null, newValue: string | null): void {
    // 更新禁用状态
  }
}
```

### 属性-属性同步

使用 getter/setter 将属性与属性同步：

```typescript
export class MyComponent extends BaseElement {
  // 布尔属性
  get disabled(): boolean {
    return getBooleanAttr(this, ComponentAttributes.DISABLED);
  }

  set disabled(value: boolean) {
    setBooleanAttr(this, ComponentAttributes.DISABLED, value);
  }

  // 字符串属性
  get label(): string {
    return getStringAttr(this, ComponentAttributes.LABEL, '');
  }

  set label(value: string) {
    setStringAttr(this, ComponentAttributes.LABEL, value);
  }

  // 数字属性
  get value(): number {
    return getNumericAttr(this, ComponentAttributes.VALUE, 0) ?? 0;
  }

  set value(value: number) {
    setNumericAttr(this, ComponentAttributes.VALUE, value);
  }
}
```

### 自定义属性序列化器

为复杂类型创建序列化器：

```typescript
// serializers.ts
const AttributeSerializers: Record<string, (value: any) => string> = {
  'array': (arr: any[]) => JSON.stringify(arr),
  'object': (obj: object) => JSON.stringify(obj),
  'date': (date: Date) => date.toISOString(),
  'set': (set: Set<any>) => Array.from(set).join(' '),
};

const AttributeDeserializers: Record<string, (value: string) => any> = {
  'array': (str: string) => JSON.parse(str),
  'object': (str: string) => JSON.parse(str),
  'date': (str: string) => new Date(str),
  'set': (str: string) => new Set(str.split(/\s+/)),
};

export function serializeAttr(attrName: string, value: any): string {
  const serializer = AttributeSerializers[attrName];
  return serializer ? serializer(value) : String(value);
}

export function deserializeAttr(attrName: string, value: string): any {
  const deserializer = AttributeDeserializers[attrName];
  return deserializer ? deserializer(value) : value;
}
```

## 生命周期管理

### 连接钩子

使用 `connectedCallback` 进行初始化：

```typescript
export class MyComponent extends BaseElement {
  #cleanupFns: Array<() => void> = [];

  connectedCallback(): void {
    this.initShadowDOM();
    this.initEventListeners();
    this.initObservers();
    this.updateFromAttributes();
  }

  private initShadowDOM(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.render();
    }
  }

  private initEventListeners(): void {
    const clickHandler = this.handleClick.bind(this);
    this.addEventListener('click', clickHandler);

    this.#cleanupFns.push(() => {
      this.removeEventListener('click', clickHandler);
    });
  }

  private initObservers(): void {
    const observer = new ResizeObserver(this.handleResize.bind(this));
    observer.observe(this);

    this.#cleanupFns.push(() => {
      observer.disconnect();
    });
  }

  disconnectedCallback(): void {
    // 清理所有资源
    this.#cleanupFns.forEach(cleanup => cleanup());
    this.#cleanupFns = [];
  }
}
```

### 私有字段模式

使用箭头函数的私有字段：

```typescript
export class MyComponent extends BaseElement {
  #value = 0;
  #listeners: Map<string, EventListener> = new Map();

  // 带有绑定 `this` 的私有事件处理程序
  #handleClick = (event: MouseEvent): void => {
    this.value = this.value + 1;
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  };

  private handleClick = (event: MouseEvent): void => { // 私有方法
    // 实现
  };
}
```

## Shadow DOM 使用

### Shadow DOM 封装

始终使用 Shadow DOM 进行样式封装：

```typescript
export class MyComponent extends BaseElement {
  static shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    delegatesFocus: false,
  };

  connectedCallback(): void {
    if (!this.shadowRoot) {
      this.attachShadow((this.constructor as typeof MyComponent).shadowRootOptions);
      this.render();
    }
  }

  private render(): void {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }

        .content {
          color: var(--text-color, #333);
        }
      </style>
      <div class="content">
        <slot></slot>
      </div>
    `;
  }
}
```

### CSS 自定义属性

定义并使用 CSS 自定义属性进行主题化：

```typescript
export class MyComponent extends BaseElement {
  private render(): void {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          /* 默认主题值 */
          --primary-color: #007bff;
          --secondary-color: #6c757d;
          --text-color: #333;
          --background-color: #fff;
          --border-radius: 4px;
          --padding: 8px 16px;
          --font-size: 14px;
        }

        .button {
          background-color: var(--primary-color);
          color: white;
          padding: var(--padding);
          border-radius: var(--border-radius);
          font-size: var(--font-size);
        }

        .button:hover {
          background-color: var(--secondary-color);
        }
      </style>
      <button class="button">
        <slot>默认标签</slot>
      </button>
    `;
  }
}
```

### 动态样式更新

使用 CSS 规则进行动态更新：

```typescript
// utils/css.ts
export function getOrInsertCSSRule(
  styleParent: Element | ShadowRoot,
  selectorText: string
): CSSStyleRule {
  const stylesheets = Array.from(styleParent.styleSheets) as CSSStyleSheet[];
  for (const stylesheet of stylesheets) {
    for (let i = 0; i < stylesheet.cssRules.length; i++) {
      const rule = stylesheet.cssRules[i];
      if (rule.type === CSSRule.STYLE_RULE) {
        const styleRule = rule as CSSStyleRule;
        if (styleRule.selectorText === selectorText) {
          return styleRule;
        }
      }
    }
  }

  // 插入新规则
  const stylesheet = stylesheets[0];
  const index = stylesheet.insertRule(`${selectorText} {}`, stylesheet.cssRules.length);
  return stylesheet.cssRules[index] as CSSStyleRule;
}

// 在组件中使用
export class MyComponent extends BaseElement {
  #hostRule: CSSStyleRule | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.#hostRule = getOrInsertCSSRule(this.shadowRoot!, ':host');
    this.updateStyles();
  }

  private updateStyles(): void {
    if (this.#hostRule) {
      this.#hostRule.style.setProperty('--progress', `${this.progress}%`);
    }
  }
}
```

## 事件处理

### 箭头函数模式

使用箭头函数作为事件处理程序以保持 `this` 绑定：

```typescript
export class MyComponent extends BaseElement {
  #clickHandler = (event: MouseEvent): void => {
    // `this` 绑定正确
    this.handleClick(event);
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.#clickHandler);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#clickHandler);
  }

  private handleClick(event: MouseEvent): void {
    // 实现
  }
}
```

### 事件组合

使用 `composed: true` 让事件穿越 Shadow DOM 边界：

```typescript
export class MyComponent extends BaseElement {
  private dispatchValueChange(newValue: number): void {
    const event = new CustomEvent('valuechange', {
      detail: { value: newValue },
      bubbles: true,
      composed: true, // 允许事件逃逸 Shadow DOM
    });
    this.dispatchEvent(event);
  }
}
```

### 事件委托

使用事件委托处理动态内容：

```typescript
export class MyComponent extends BaseElement {
  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot!.addEventListener('click', this.handleDelegatedClick);
  }

  #handleDelegatedClick = (event: Event): void => {
    const target = event.target as HTMLElement;
    const button = target.closest('.action-button');

    if (button) {
      const action = button.dataset.action;
      this.handleAction(action);
    }
  };

  private handleAction(action: string | undefined): void {
    // 处理操作
  }
}
```

## 性能优化

### DOM 更新

最小化 DOM 操作：

```typescript
export class MyComponent extends BaseElement {
  #renderPending = false;

  requestRender(): void {
    if (this.#renderPending) return;

    this.#renderPending = true;
    requestAnimationFrame(() => {
      this.render();
      this.#renderPending = false;
    });
  }

  private render(): void {
    // 在此处批量更新 DOM
  }
}
```

### 属性变化优化

避免冗余更新：

```typescript
export class MyComponent extends BaseElement {
  get value(): number {
    return getNumericAttr(this, 'value', 0) ?? 0;
  }

  set value(newValue: number) {
    const current = this.value;
    if (current === newValue) return; // 如果未更改则跳过
    setNumericAttr(this, 'value', newValue);
  }
}
```

### 虚拟滚动（高级）

对于包含许多项目的列表，实现虚拟滚动：

```typescript
export class VirtualList extends BaseElement {
  #visibleStart = 0;
  #visibleEnd = 0;
  #itemHeight = 40;

  updateVisibleRange(): void {
    const containerHeight = this.clientHeight;
    const scrollTop = this.scrollTop;

    this.#visibleStart = Math.floor(scrollTop / this.#itemHeight);
    this.#visibleEnd = Math.ceil((scrollTop + containerHeight) / this.#itemHeight);

    this.renderVisibleItems();
  }

  private renderVisibleItems(): void {
    // 仅渲染可见项目
  }
}
```

## 可访问性

### ARIA 属性

始终包含适当的 ARIA 属性：

```typescript
export class ButtonComponent extends BaseElement {
  static get observedAttributes(): string[] {
    return ['label', 'disabled'];
  }

  private render(): void {
    this.shadowRoot.innerHTML = `
      <button
        part="button"
        aria-label="${this.label}"
        aria-disabled="${this.disabled}"
        ?disabled="${this.disabled}"
      >
        <slot></slot>
      </button>
    `;
  }
}
```

### 键盘导航

为交互式组件实现键盘导航：

```typescript
export class InteractiveComponent extends BaseElement {
  #handleKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activate();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.navigate(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.navigate(1);
        break;
    }
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
    this.addEventListener('keydown', this.#handleKeyDown);
  }

  private activate(): void {
    // 激活组件
  }

  private navigate(direction: number): void {
    // 导航到下一个/上一个项目
  }
}
```

### 焦点管理

正确管理焦点：

```typescript
export class ModalComponent extends BaseElement {
  #previousFocus: HTMLElement | null = null;

  open(): void {
    this.#previousFocus = document.activeElement as HTMLElement;
    const focusable = this.shadowRoot!.querySelector('[autofocus]') as HTMLElement;
    focusable?.focus();
  }

  close(): void {
    this.#previousFocus?.focus();
  }
}
```

## 测试

### 单元测试模式

隔离测试组件：

```typescript
// my-component.test.ts
import { describe, it, expect, vi } from 'vitest';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('应该使用默认值渲染', () => {
    const element = document.createElement('my-component') as MyComponent;
    document.body.appendChild(element);

    expect(element.value).toBe(0);
    expect(element.disabled).toBe(false);
  });

  it('应该更新 value 属性', () => {
    const element = document.createElement('my-component') as MyComponent;
    document.body.appendChild(element);

    element.value = 42;
    expect(element.getAttribute('value')).toBe('42');
  });

  it('应该分发 valuechange 事件', () => {
    const element = document.createElement('my-component') as MyComponent;
    document.body.appendChild(element);

    const handler = vi.fn();
    element.addEventListener('valuechange', handler);

    element.value = 100;

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { value: 100 } })
    );
  });
});
```

## 组件注册

### 安全注册模式

仅注册一次组件：

```typescript
export function registerCustomElement(
  tagName: string,
  componentClass: CustomElementConstructor
): void {
  if (!globalThis.customElements.get(tagName)) {
    globalThis.customElements.define(tagName, componentClass);
  }
}

// 使用
registerCustomElement('my-component', MyComponent);
```

### 延迟注册

按需注册组件：

```typescript
export function lazyRegister(
  tagName: string,
  importer: () => Promise<{ default: CustomElementConstructor }>
): void {
  if (customElements.get(tagName)) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (
          node instanceof HTMLElement &&
          node.tagName.toLowerCase() === tagName
        ) {
          observer.disconnect();
          importer().then(({ default: componentClass }) => {
            customElements.define(tagName, componentClass);
          });
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

// 使用
lazyRegister('my-component', () => import('./my-component'));
```

## 错误处理

### 优雅降级

优雅地处理错误：

```typescript
export class MyComponent extends BaseElement {
  connectedCallback(): void {
    try {
      this.init();
    } catch (error) {
      console.error('Failed to initialize MyComponent:', error);
      this.renderFallback();
    }
  }

  private renderFallback(): void {
    this.shadowRoot!.innerHTML = `
      <style>
        .error {
          color: #dc3545;
          padding: 1rem;
          border: 1px solid #dc3545;
          border-radius: 4px;
        }
      </style>
      <div class="error">
        Failed to load component
      </div>
    `;
  }
}
```

### 验证

验证输入和属性：

```typescript
export class InputComponent extends BaseElement {
  set value(newValue: number) {
    if (!Number.isFinite(newValue)) {
      throw new Error('Value must be a finite number');
    }
    if (newValue < this.min || newValue > this.max) {
      throw new Error(`Value must be between ${this.min} and ${this.max}`);
    }
    setNumericAttr(this, 'value', newValue);
  }
}
```

## 文档

### Web Component 清单

为文档工具包含清单：

```typescript
// my-component.manifest.ts
export default {
  tagName: 'my-component',
  description: 'A description of what this component does',
  attributes: [
    {
      name: 'value',
      type: 'number',
      description: 'The current value',
      default: 0,
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Whether the component is disabled',
      default: false,
    },
  ],
  events: [
    {
      name: 'valuechange',
      description: 'Fired when the value changes',
      detail: { value: 'number' },
    },
  ],
  slots: [
    {
      name: '',
      description: 'Default slot for content',
    },
  ],
  cssParts: [
    {
      name: 'button',
      description: 'Internal button element',
    },
  ],
};
```

## 迁移指南

### 升级组件

升级组件时，保持向后兼容：

```typescript
export class MyComponent extends BaseElement {
  static get observedAttributes(): string[] {
    return [
      'value', // 新属性
      'old-value', // 已弃用属性
    ];
  }

  attributeChangedCallback(
    attrName: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    super.attributeChangedCallback(attrName, oldValue, newValue);

    if (attrName === 'old-value') {
      // 迁移到新属性
      console.warn(
        'old-value is deprecated. Use value instead.',
        this
      );
      this.setAttribute('value', newValue || '0');
    }
  }
}
```

## 总结清单

创建 Web Components 时，确保：

- ✅ 使用基类提供通用功能
- ✅ 使用类型安全常量实现 TypeScript
- ✅ 使用工具函数进行属性操作
- ✅ 正确管理生命周期钩子
- ✅ 使用 Shadow DOM 封装样式
- ✅ 使用 CSS 自定义属性进行主题化
- ✅ 使用箭头函数处理事件
- ✅ 优化 DOM 操作
- ✅ 包含可访问性的 ARIA 属性
- ✅ 实现键盘导航
- ✅ 编写全面的测试
- ✅ 安全注册组件
- ✅ 优雅地处理错误
- ✅ 记录组件 API
- ✅ 保持向后兼容
