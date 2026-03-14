/**
 * Counter Component
 * A complete Web Component example demonstrating best practices
 *
 * This file exports the CounterElement and registerCounterComponent
 * for use in HTML examples and applications.
 */

import {
  getBooleanAttr,
  setBooleanAttr,
  getNumericAttr,
  setNumericAttr,
  getStringAttr,
  setStringAttr,
} from './attribute-utils.js';

// ===== Constants =====
export const CounterProps = {
  VALUE: 'value',
  MIN: 'min',
  MAX: 'max',
  LABEL: 'label',
  DISABLED: 'disabled',
};

export const CounterAttributes = Object.entries(CounterProps).reduce(
  (dictObj, [key, propName]) => {
    dictObj[key] = propName.toLowerCase();
    return dictObj;
  },
  {}
);

export const CounterEvents = {
  VALUE_CHANGE: 'valuechange',
  MIN_REACHED: 'minreached',
  MAX_REACHED: 'maxreached',
};

// ===== Base Element =====
export class BaseElement extends HTMLElement {
  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(_attrName, _oldValue, _newValue) {
    // Override in subclass
  }

  connectedCallback() {
    // Override in subclass
  }

  disconnectedCallback() {
    // Override in subclass
  }
}

// ===== Counter Component =====
export class CounterElement extends BaseElement {
  static shadowRootOptions = {
    mode: 'open',
    delegatesFocus: false,
  };

  static get observedAttributes() {
    return Object.values(CounterAttributes);
  }

  // Private fields
  #cleanupFns = [];
  #renderPending = false;
  #value = 0;

  // Getters and setters
  get value() {
    return getNumericAttr(this, CounterAttributes.VALUE, 0) ?? 0;
  }

  set value(newValue) {
    this.#value = newValue;
    setNumericAttr(this, CounterAttributes.VALUE, newValue);
  }

  get min() {
    return getNumericAttr(this, CounterAttributes.MIN, 0) ?? 0;
  }

  set min(newValue) {
    setNumericAttr(this, CounterAttributes.MIN, newValue);
  }

  get max() {
    return getNumericAttr(this, CounterAttributes.MAX, 100) ?? 100;
  }

  set max(newValue) {
    setNumericAttr(this, CounterAttributes.MAX, newValue);
  }

  get label() {
    return getStringAttr(this, CounterAttributes.LABEL, '') ?? '';
  }

  set label(newValue) {
    setStringAttr(this, CounterAttributes.LABEL, newValue);
  }

  get disabled() {
    return getBooleanAttr(this, CounterAttributes.DISABLED);
  }

  set disabled(newValue) {
    setBooleanAttr(this, CounterAttributes.DISABLED, newValue);
  }

  // Lifecycle
  connectedCallback() {
    super.connectedCallback();
    this.initShadowDOM();
    this.initEventListeners();
    this.updateFromAttributes();
  }

  disconnectedCallback() {
    this.cleanup();
    super.disconnectedCallback();
  }

  // Attribute changes
  attributeChangedCallback(attrName, oldValue, newValue) {
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
  initShadowDOM() {
    if (!this.shadowRoot) {
      this.attachShadow(this.constructor.shadowRootOptions);
      this.render();
    }
  }

  initEventListeners() {
    // Use delegation for all button clicks
    this.shadowRoot.addEventListener('click', this.#handleDelegatedClick);
    this.shadowRoot.addEventListener('keydown', this.#handleKeydown);

    this.#cleanupFns.push(() => {
      this.shadowRoot.removeEventListener('click', this.#handleDelegatedClick);
      this.shadowRoot.removeEventListener('keydown', this.#handleKeydown);
    });
  }

  updateFromAttributes() {
    this.updateLabel();
    this.updateDisabledState();
    this.handleValueChange();
  }

  // Event handlers (arrow functions for bound `this`)
  #handleDelegatedClick = (event) => {
    const target = event.target;
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

  #handleKeydown = (event) => {
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
  increment() {
    const newValue = Math.min(this.value + 1, this.max);
    this.value = newValue;

    if (newValue === this.max) {
      this.dispatchEvent(new CustomEvent(CounterEvents.MAX_REACHED, {
        bubbles: true,
        composed: true,
      }));
    }
  }

  decrement() {
    const newValue = Math.max(this.value - 1, this.min);
    this.value = newValue;

    if (newValue === this.min) {
      this.dispatchEvent(new CustomEvent(CounterEvents.MIN_REACHED, {
        bubbles: true,
        composed: true,
      }));
    }
  }

  reset() {
    this.value = 0;
  }

  // Attribute change handlers
  handleValueChange() {
    const value = this.value;
    const display = this.shadowRoot.querySelector('.value-display');

    if (display) {
      display.textContent = String(value);
    }

    this.requestRender();
    this.dispatchValueChange(value);
  }

  updateLabel() {
    const label = this.shadowRoot.querySelector('.label');
    if (label) {
      label.textContent = this.label;
    }
  }

  updateDisabledState() {
    const buttons = this.shadowRoot.querySelectorAll('button');
    buttons.forEach(button => {
      button.disabled = this.disabled;
    });

    if (this.disabled) {
      this.setAttribute('aria-disabled', 'true');
    } else {
      this.removeAttribute('aria-disabled');
    }
  }

  // Event dispatching
  dispatchValueChange(value) {
    this.dispatchEvent(new CustomEvent(CounterEvents.VALUE_CHANGE, {
      detail: { value },
      bubbles: true,
      composed: true,
    }));
  }

  // Rendering
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          flex-direction: column;
          gap: var(--gap, 8px);
          font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        }

        .label {
          font-size: var(--label-font-size, 14px);
          font-weight: var(--label-font-weight, 500);
          color: var(--label-color, #333);
        }

        .controls {
          display: flex;
          align-items: center;
          gap: var(--button-gap, 8px);
        }

        button {
          padding: var(--button-padding, 8px 16px);
          border: var(--button-border, 1px solid #ddd);
          border-radius: var(--button-border-radius, 4px);
          background: var(--button-background, white);
          cursor: pointer;
          font-size: var(--button-font-size, 14px);
          transition: all 0.2s;
          color: var(--button-color, #333);
        }

        button:hover:not(:disabled) {
          background: var(--button-hover-background, #f5f5f5);
          border-color: var(--button-hover-border-color, #ccc);
        }

        button:active:not(:disabled) {
          background: var(--button-active-background, #e0e0e0);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .value-display {
          min-width: 40px;
          text-align: center;
          font-size: var(--value-font-size, 18px);
          font-weight: var(--value-font-weight, bold);
          color: var(--value-color, #333);
        }

        :host(:focus-visible) {
          outline: 2px solid var(--focus-outline-color, #007bff);
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

  requestRender() {
    if (this.#renderPending) return;

    this.#renderPending = true;
    requestAnimationFrame(() => {
      this.updateStyles();
      this.#renderPending = false;
    });
  }

  updateStyles() {
    // Update any dynamic styles based on current state
  }

  // Cleanup
  cleanup() {
    this.#cleanupFns.forEach(cleanup => cleanup());
    this.#cleanupFns = [];
  }
}

// ===== Registration =====
export function registerCounterComponent() {
  const tagName = 'x-counter';

  if (!customElements.get(tagName)) {
    customElements.define(tagName, CounterElement);
  }
}

// Auto-register when loaded
if (typeof customElements !== 'undefined') {
  registerCounterComponent();
}
