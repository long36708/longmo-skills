/**
 * Media Chrome 自定义组件模板
 *
 * 此模板展示了如何创建一个自定义的媒体控制组件
 * 可以复制此文件并根据需求进行修改
 */

import { MediaChromeButton } from './media-chrome-button.js';
import { globalThis } from './utils/server-safe-globals.js';
import { MediaUIEvents, MediaUIAttributes } from './constants.js';
import { t } from './utils/i18n.js';
import {
  getStringAttr,
  setStringAttr,
  getBooleanAttr,
  setBooleanAttr,
} from './utils/element-utils.js';

// ===== 1. 定义图标 SVG =====
const myIcon = `<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M13 2L2 12h3v9h6v-6h4v6h6v-9h3L13 2z"/>
</svg>`;

// ===== 2. 定义插槽模板 HTML =====
function getSlotTemplateHTML(_attrs: Record<string, string>) {
  return /*html*/ `
    <style>
      :host([${MediaUIAttributes.MEDIA_PLAYING}]) slot[name=icon] slot:not([name=pause]) {
        display: none !important;
      }

      :host(:not([${MediaUIAttributes.MEDIA_PLAYING}])) slot[name=icon] slot:not([name=play]) {
        display: none !important;
      }

      /* 自定义样式 */
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      /* 悬停效果 */
      :host(:hover) {
        background: rgba(255, 255, 255, 0.1);
      }
    </style>

    <slot name="icon">
      <slot name="play">${myIcon}</slot>
      <slot name="pause">${myIcon}</slot>
    </slot>
  `;
}

// ===== 3. 定义工具提示内容 HTML =====
function getTooltipContentHTML() {
  return /*html*/ `
    <slot name="tooltip-play">${t('Play')}</slot>
    <slot name="tooltip-pause">${t('Pause')}</slot>
  `;
}

// ===== 4. 定义辅助函数 =====
function updateAriaLabel(el: MyCustomButton): void {
  const label = el.mediaPlaying ? t('Pause') : t('Play');
  el.setAttribute('aria-label', label);
}

// ===== 5. 定义自定义组件类 =====
/**
 * @slot play - 播放状态的图标或内容
 * @slot pause - 暂停状态的图标或内容
 * @slot icon - 图标的插槽容器
 *
 * @attr {boolean} mediaplaying - (read-only) 媒体是否正在播放
 * @attr {boolean} mediapaused - (read-only) 媒体是否暂停
 *
 * @cssproperty [--my-custom-button-display = inline-flex] - 按钮的 display 属性
 * @cssproperty [--my-custom-button-width = 40px] - 按钮宽度
 * @cssproperty [--my-custom-button-height = 40px] - 按钮高度
 *
 * @event {CustomEvent} mediaplayrequest - 请求播放
 * @event {CustomEvent} mediapauserequest - 请求暂停
 */
class MyCustomButton extends MediaChromeButton {
  // 静态属性：插槽模板
  static getSlotTemplateHTML = getSlotTemplateHTML;

  // 静态属性：工具提示模板
  static getTooltipContentHTML = getTooltipContentHTML;

  // 静态属性：观察的属性列表
  static get observedAttributes(): string[] {
    return [
      ...super.observedAttributes,
      MediaUIAttributes.MEDIA_PLAYING,
      MediaUIAttributes.MEDIA_PAUSED,
    ];
  }

  // ===== 生命周期方法 =====

  /**
   * 元素连接到 DOM 时调用
   */
  connectedCallback(): void {
    super.connectedCallback();
    updateAriaLabel(this);
    console.log('MyCustomButton connected');
  }

  /**
   * 元素从 DOM 断开时调用
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    console.log('MyCustomButton disconnected');
  }

  /**
   * 观察的属性变化时调用
   */
  attributeChangedCallback(
    attrName: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    super.attributeChangedCallback(attrName, oldValue, newValue);

    if (attrName === MediaUIAttributes.MEDIA_PLAYING) {
      updateAriaLabel(this);
    }
  }

  // ===== 属性 getter/setter =====

  /**
   * 是否正在播放
   */
  get mediaPlaying(): boolean {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_PLAYING);
  }

  set mediaPlaying(value: boolean) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_PLAYING, value);
  }

  /**
   * 是否暂停
   */
  get mediaPaused(): boolean {
    return getBooleanAttr(this, MediaUIAttributes.MEDIA_PAUSED);
  }

  set mediaPaused(value: boolean) {
    setBooleanAttr(this, MediaUIAttributes.MEDIA_PAUSED, value);
  }

  // ===== 事件处理方法 =====

  /**
   * 处理点击事件
   */
  handleClick(): void {
    // 根据当前状态决定发送播放还是暂停请求
    const eventType = this.mediaPlaying
      ? MediaUIEvents.MEDIA_PAUSE_REQUEST
      : MediaUIEvents.MEDIA_PLAY_REQUEST;

    const evt = new globalThis.CustomEvent(eventType, {
      composed: true,
      bubbles: true,
    });

    this.dispatchEvent(evt);

    console.log(`MyCustomButton dispatched ${eventType}`);
  }

  // ===== 其他自定义方法 =====

  /**
   * 自定义方法示例：切换播放状态
   */
  togglePlay(): void {
    if (this.mediaPlaying) {
      const evt = new globalThis.CustomEvent(MediaUIEvents.MEDIA_PAUSE_REQUEST, {
        composed: true,
        bubbles: true,
      });
      this.dispatchEvent(evt);
    } else {
      const evt = new globalThis.CustomEvent(MediaUIEvents.MEDIA_PLAY_REQUEST, {
        composed: true,
        bubbles: true,
      });
      this.dispatchEvent(evt);
    }
  }

  /**
   * 自定义方法示例：更新按钮图标
   */
  updateIcon(state: 'play' | 'pause'): void {
    // 实现自定义图标更新逻辑
    console.log(`Updating icon to ${state}`);
  }
}

// ===== 6. 注册自定义元素 =====
if (!globalThis.customElements.get('my-custom-button')) {
  globalThis.customElements.define('my-custom-button', MyCustomButton);
}

// ===== 7. 导出组件 =====
export default MyCustomButton;

/**
 * 使用示例：
 *
 * 在 HTML 中：
 * ```html
 * <script type="module" src="./my-custom-button.js"></script>
 *
 * <media-controller>
 *   <video slot="media" src="video.mp4"></video>
 *   <media-control-bar>
 *     <my-custom-button></my-custom-button>
 *   </media-control-bar>
 * </media-controller>
 * ```
 *
 * 自定义图标：
 * ```html
 * <my-custom-button>
 *   <svg slot="play" viewBox="0 0 24 24">
 *     <path d="M8 5v14l11-7z"/>
 *   </svg>
 *   <svg slot="pause" viewBox="0 0 24 24">
 *     <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
 *   </svg>
 * </my-custom-button>
 * ```
 *
 * 自定义样式：
 * ```css
 * my-custom-button {
 *   --my-custom-button-width: 48px;
 *   --my-custom-button-height: 48px;
 *   background: #3b82f6;
 *   border-radius: 50%;
 * }
 * ```
 */

/**
 * 高级示例：创建一个带动画的自定义按钮
 */
class AnimatedCustomButton extends MediaChromeButton {
  connectedCallback(): void {
    super.connectedCallback();
    this.setupAnimation();
  }

  private setupAnimation(): void {
    // 添加动画效果
    const icon = this.shadowRoot?.querySelector('svg');
    if (icon) {
      icon.style.transition = 'transform 0.3s ease';
    }

    this.addEventListener('mouseenter', () => {
      if (icon) {
        icon.style.transform = 'scale(1.1)';
      }
    });

    this.addEventListener('mouseleave', () => {
      if (icon) {
        icon.style.transform = 'scale(1)';
      }
    });
  }

  handleClick(): void {
    // 添加点击动画
    this.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(0.9)' },
        { transform: 'scale(1)' },
      ],
      {
        duration: 150,
        easing: 'ease-out',
      }
    );

    super.handleClick();
  }
}

// 注册动画按钮
if (!globalThis.customElements.get('animated-custom-button')) {
  globalThis.customElements.define('animated-custom-button', AnimatedCustomButton);
}

/**
 * 高级示例：创建一个带状态计数的按钮
 */
class CountingButton extends MediaChromeButton {
  private clickCount = 0;

  handleClick(): void {
    this.clickCount++;
    console.log(`Button clicked ${this.clickCount} times`);
    super.handleClick();
  }

  getClickCount(): number {
    return this.clickCount;
  }

  resetCount(): void {
    this.clickCount = 0;
  }
}

// 注册计数按钮
if (!globalThis.customElements.get('counting-button')) {
  globalThis.customElements.define('counting-button', CountingButton);
}

/**
 * 最佳实践：
 *
 * 1. 始终继承适当的基类（MediaChromeButton、MediaChromeRange 等）
 * 2. 使用 MediaUIEvents 和 MediaUIAttributes 常量
 * 3. 实现 observedAttributes 静态方法
 * 4. 为属性实现 getter/setter
 * 5. 在 connectedCallback 中进行初始化
 * 6. 在 attributeChangedCallback 中响应属性变化
 * 7. 使用 CustomEvent 与其他组件通信
 * 8. 添加适当的 JSDoc 注释
 * 9. 考虑国际化（使用 t() 函数）
 * 10. 提供插槽（slot）以支持自定义
 */
