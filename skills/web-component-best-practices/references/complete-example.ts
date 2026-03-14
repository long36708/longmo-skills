/**
 * Complete Web Component Example
 * This file demonstrates all the best practices in a single component
 */

import {
  getBooleanAttr,
  setBooleanAttr,
  getNumericAttr,
  setNumericAttr,
  getStringAttr,
  setStringAttr,
} from './attribute-utils';

// ===== Constants =====
export const CounterProps = {
  VALUE: 'value',
  MIN: 'min',
  MAX: 'max',
  LABEL: 'label',
  DISABLED: 'disabled',
} as const;

export const CounterAttributes = Object.entries(CounterProps).reduce(
  (dictObj, [key, propName]) => {
    dictObj[key] = propName.toLowerCase();
    return dictObj;
  },
  {} as Record<keyof typeof CounterProps, string>
);

export const CounterEvents = {
  VALUE_CHANGE: 'valuechange',
  MIN_REACHED: 'minreached',
  MAX_REACHED: 'maxreached',
} as const;

// ===== Base Element =====
export class BaseElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return [];
  }

  attributeChangedCallback(
    _attrName: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {}

  connectedCallback(): void {}

  disconnectedCallback(): void {}
}

// ===== Counter Component =====
export class CounterElement extends BaseElement {
  static shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    delegatesFocus: false,
  };

  static get observedAttributes(): string[] {
    return Object.values(CounterAttributes);
  }

  // Private fields
  #cleanupFns: Array<() => void> = [];
  #renderPending = false;
  #value = 0;

  // Getters and setters
  get value(): number {
    return getNumericAttr(this, CounterAttributes.VALUE, 0) ?? 0;
  }

  set value(newValue: number) {
    this.#value = newValue;
    setNumericAttr(this, CounterAttributes.VALUE, newValue);
  }

  get min(): number {
    return getNumericAttr(this, CounterAttributes.MIN, 0) ?? 0;
  }

  set min(newValue: number) {
    setNumericAttr(this, CounterAttributes.MIN, newValue);
  }

  get max(): number {
    return getNumericAttr(this, CounterAttributes.MAX, 100) ?? 100;
  }

  set max(newValue: number) {
    setNumericAttr(this, CounterAttributes.MAX, newValue);
  }

  get label(): string {
    return getStringAttr(this, CounterAttributes.LABEL, '') ?? '';
  }

  set label(newValue: string) {
    setStringAttr(this, CounterAttributes.LABEL, newValue);
  }

  get disabled(): boolean {
    return getBooleanAttr(this, CounterAttributes.DISABLED);
  }

  set disabled(newValue: boolean) {
    setBooleanAttr(this, CounterAttributes.DISABLED, newValue);
  }

  // Lifecycle
  connectedCallback(): void {
    super.connectedCallback();
    this.initShadowDOM();
    this.initEventListeners();
    this.updateFromAttributes();
  }

  disconnectedCallback(): void {
    this.cleanup();
    super.disconnectedCallback();
  }

  // Attribute changes
  attributeChangedCallback(
    attrName: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    super.attributeChangedCallback(attrName, oldValue, newValue);

    if (oldValue === newValue) return;

    switch (attrName) {
      case CounterAttributes.VALUE:
        this.handleValueChange();
        break;
      case CounterAttributes.LABEL:
        this.updateLabel();
        break;
      case CounterAttributes.DISABLED:
        this.updateDisabledState();
        break;
    }
  }

  // Initialization
  private initShadowDOM(): void {
    if (!this.shadowRoot) {
      this.attachShadow((this.constructor as typeof CounterElement).shadowRootOptions);
      this.render();
    }
  }

  private initEventListeners(): void {
    // Use delegation for all button clicks
    this.shadowRoot!.addEventListener('click', this.#handleDelegatedClick);
    this.shadowRoot!.addEventListener('keydown', this.#handleKeydown);

    this.#cleanupFns.push(() => {
      this.shadowRoot!.removeEventListener('click', this.#handleDelegatedClick);
      this.shadowRoot!.removeEventListener('keydown', this.#handleKeydown);
    });
  }

  private updateFromAttributes(): void {
    this.updateLabel();
    this.updateDisabledState();
    this.handleValueChange();
  }

  // Event handlers (arrow functions for bound `this`)
  #handleDelegatedClick = (event: Event): void => {
    const target = event.target as HTMLElement;
    const button = target.closest('button');

    if (!button) return;

    const action = button.dataset.action;

    if (this.disabled) return;

    switch (action) {
      case 'increment':
        this.increment();
        break;
      case 'decrement':
        this.decrement();
        break;
      case 'reset':
        this.reset();
        break;
    }
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.increment();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.decrement();
        break;
      case 'Home':
        event.preventDefault();
        this.value = this.min;
        break;
      case 'End':
        event.preventDefault();
        this.value = this.max;
        break;
      case 'r':
      case 'R':
        this.reset();
        break;
    }
  };

  // Actions
  increment(): void {
    const newValue = Math.min(this.value + 1, this.max);
    this.value = newValue;

    if (newValue === this.max) {
      this.dispatchEvent(new CustomEvent(CounterEvents.MAX_REACHED, {
        bubbles: true,
        composed: true,
      }));
    }
  }

  decrement(): void {
    const newValue = Math.max(this.value - 1, this.min);
    this.value = newValue;

    if (newValue === this.min) {
      this.dispatchEvent(new CustomEvent(CounterEvents.MIN_REACHED, {
        bubbles: true,
        composed: true,
      }));
    }
  }

  reset(): void {
    this.value = 0;
  }

  // Attribute change handlers
  private handleValueChange(): void {
    const value = this.value;
    const display = this.shadowRoot!.querySelector('.value-display') as HTMLElement;

    if (display) {
      display.textContent = String(value);
    }

    this.requestRender();
    this.dispatchValueChange(value);
  }

  private updateLabel(): void {
    const label = this.shadowRoot!.querySelector('.label') as HTMLElement;
    if (label) {
      label.textContent = this.label;
    }
  }

  private updateDisabledState(): void {
    const buttons = this.shadowRoot!.querySelectorAll('button');
    buttons.forEach(button => {
      (button as HTMLButtonElement).disabled = this.disabled;
    });

    if (this.disabled) {
      this.setAttribute('aria-disabled', 'true');
    } else {
      this.removeAttribute('aria-disabled');
    }
  }

  // Event dispatching
  private dispatchValueChange(value: number): void {
    this.dispatchEvent(new CustomEvent(CounterEvents.VALUE_CHANGE, {
      detail: { value },
      bubbles: true,
      composed: true,
    }));
  }

  // Rendering
  private render(): void {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          flex-direction: column;
          gap: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        button:hover:not(:disabled) {
          background: #f5f5f5;
          border-color: #ccc;
        }

        button:active:not(:disabled) {
          background: #e0e0e0;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .value-display {
          min-width: 40px;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }

        :host(:focus-visible) {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }
      </style>

      ${this.label ? '<span class="label"></span>' : ''}
      <div class="controls" role="group" aria-label="Counter controls">
        <button
          type="button"
          data-action="decrement"
          aria-label="Decrease value"
        >-</button>
        <span class="value-display" role="status" aria-live="polite"></span>
        <button
          type="button"
          data-action="increment"
          aria-label="Increase value"
        >+</button>
        <button
          type="button"
          data-action="reset"
          aria-label="Reset value"
        >R</button>
      </div>
    `;
  }

  private requestRender(): void {
    if (this.#renderPending) return;

    this.#renderPending = true;
    requestAnimationFrame(() => {
      this.updateStyles();
      this.#renderPending = false;
    });
  }

  private updateStyles(): void {
    // Update any dynamic styles based on current state
  }

  // Cleanup
  private cleanup(): void {
    this.#cleanupFns.forEach(cleanup => cleanup());
    this.#cleanupFns = [];
  }
}

// ===== Registration =====
export function registerCounterComponent(): void {
  const tagName = 'x-counter';

  if (!customElements.get(tagName)) {
    customElements.define(tagName, CounterElement);
  }
}

// Auto-register when loaded
if (typeof customElements !== 'undefined') {
  registerCounterComponent();
}
