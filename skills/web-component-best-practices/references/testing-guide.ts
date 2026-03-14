/**
 * Testing Guide for Web Components
 * This file demonstrates comprehensive testing patterns for Web Components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CounterElement } from './complete-example';

// ===== Setup =====
describe('CounterElement', () => {
  let element: CounterElement;

  beforeEach(() => {
    // Create and append element to DOM
    element = document.createElement('x-counter') as CounterElement;
    document.body.appendChild(element);
  });

  afterEach(() => {
    // Clean up
    element.remove();
  });

  // ===== Basic Rendering =====
  describe('Rendering', () => {
    it('should render shadow DOM', () => {
      expect(element.shadowRoot).not.toBeNull();
    });

    it('should render default structure', () => {
      const controls = element.shadowRoot!.querySelector('.controls');
      const valueDisplay = element.shadowRoot!.querySelector('.value-display');

      expect(controls).not.toBeNull();
      expect(valueDisplay).not.toBeNull();
    });

    it('should render with default values', () => {
      expect(element.value).toBe(0);
      expect(element.min).toBe(0);
      expect(element.max).toBe(100);
      expect(element.disabled).toBe(false);
    });
  });

  // ===== Attribute-Property Synchronization =====
  describe('Attribute-Property Synchronization', () => {
    it('should sync value property to attribute', () => {
      element.value = 42;

      expect(element.getAttribute('value')).toBe('42');
    });

    it('should sync value attribute to property', () => {
      element.setAttribute('value', '99');

      expect(element.value).toBe(99);
    });

    it('should sync disabled property to attribute', () => {
      element.disabled = true;

      expect(element.hasAttribute('disabled')).toBe(true);
    });

    it('should sync disabled attribute to property', () => {
      element.setAttribute('disabled', '');

      expect(element.disabled).toBe(true);
    });

    it('should sync label property to attribute', () => {
      element.label = 'Test Label';

      expect(element.getAttribute('label')).toBe('Test Label');
    });
  });

  // ===== Value Updates =====
  describe('Value Updates', () => {
    it('should update value display when value changes', () => {
      const valueDisplay = element.shadowRoot!.querySelector('.value-display') as HTMLElement;

      element.value = 42;

      expect(valueDisplay.textContent).toBe('42');
    });

    it('should not render when value is unchanged', () => {
      const renderSpy = vi.spyOn(element as any, 'render');

      element.value = 0; // Same as default

      expect(renderSpy).not.toHaveBeenCalled();
    });

    it('should update attribute and property together', () => {
      element.value = 50;

      expect(element.value).toBe(50);
      expect(element.getAttribute('value')).toBe('50');
    });
  });

  // ===== Event Handling =====
  describe('Event Handling', () => {
    it('should increment value when increment button is clicked', () => {
      const incrementButton = element.shadowRoot!.querySelector(
        'button[data-action="increment"]'
      ) as HTMLButtonElement;

      incrementButton.click();

      expect(element.value).toBe(1);
    });

    it('should decrement value when decrement button is clicked', () => {
      element.value = 5;
      const decrementButton = element.shadowRoot!.querySelector(
        'button[data-action="decrement"]'
      ) as HTMLButtonElement;

      decrementButton.click();

      expect(element.value).toBe(4);
    });

    it('should reset value when reset button is clicked', () => {
      element.value = 42;
      const resetButton = element.shadowRoot!.querySelector(
        'button[data-action="reset"]'
      ) as HTMLButtonElement;

      resetButton.click();

      expect(element.value).toBe(0);
    });

    it('should not change value when disabled', () => {
      element.disabled = true;
      const incrementButton = element.shadowRoot!.querySelector(
        'button[data-action="increment"]'
      ) as HTMLButtonElement;

      incrementButton.click();

      expect(element.value).toBe(0);
    });

    it('should handle keyboard events', () => {
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));

      expect(element.value).toBe(1);
    });

    it('should not handle keyboard events when disabled', () => {
      element.disabled = true;
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));

      expect(element.value).toBe(0);
    });
  });

  // ===== Event Dispatching =====
  describe('Event Dispatching', () => {
    it('should dispatch valuechange event', () => {
      const handler = vi.fn();
      element.addEventListener('valuechange', handler);

      element.value = 10;

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { value: 10 },
          bubbles: true,
          composed: true,
        })
      );
    });

    it('should dispatch maxreached event when max is reached', () => {
      element.max = 5;
      element.value = 4;
      const handler = vi.fn();
      element.addEventListener('maxreached', handler);

      element.increment();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should dispatch minreached event when min is reached', () => {
      element.min = 5;
      element.value = 6;
      const handler = vi.fn();
      element.addEventListener('minreached', handler);

      element.decrement();

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  // ===== Boundaries =====
  describe('Boundaries', () => {
    it('should not increment beyond max', () => {
      element.max = 5;
      element.value = 5;
      const incrementButton = element.shadowRoot!.querySelector(
        'button[data-action="increment"]'
      ) as HTMLButtonElement;

      incrementButton.click();

      expect(element.value).toBe(5);
    });

    it('should not decrement below min', () => {
      element.min = 2;
      element.value = 2;
      const decrementButton = element.shadowRoot!.querySelector(
        'button[data-action="decrement"]'
      ) as HTMLButtonElement;

      decrementButton.click();

      expect(element.value).toBe(2);
    });

    it('should update value when min changes', () => {
      element.value = 5;
      element.min = 10;

      expect(element.value).toBe(10);
    });

    it('should update value when max changes', () => {
      element.value = 50;
      element.max = 40;

      expect(element.value).toBe(40);
    });
  });

  // ===== Accessibility =====
  describe('Accessibility', () => {
    it('should have correct ARIA attributes when disabled', () => {
      element.disabled = true;

      expect(element.getAttribute('aria-disabled')).toBe('true');
    });

    it('should remove ARIA disabled when enabled', () => {
      element.disabled = true;
      element.disabled = false;

      expect(element.getAttribute('aria-disabled')).toBeNull();
    });

    it('should have role group on controls', () => {
      const controls = element.shadowRoot!.querySelector('.controls');

      expect(controls).toHaveAttribute('role', 'group');
    });

    it('should have aria-label on buttons', () => {
      const incrementButton = element.shadowRoot!.querySelector(
        'button[data-action="increment"]'
      );

      expect(incrementButton).toHaveAttribute('aria-label');
    });

    it('should have live region on value display', () => {
      const valueDisplay = element.shadowRoot!.querySelector('.value-display');

      expect(valueDisplay).toHaveAttribute('role', 'status');
      expect(valueDisplay).toHaveAttribute('aria-live', 'polite');
    });
  });

  // ===== Lifecycle =====
  describe('Lifecycle', () => {
    it('should initialize on connectedCallback', () => {
      const newElement = document.createElement('x-counter') as CounterElement;
      expect(newElement.shadowRoot).toBeNull();

      document.body.appendChild(newElement);

      expect(newElement.shadowRoot).not.toBeNull();
      newElement.remove();
    });

    it('should clean up on disconnectedCallback', () => {
      // Disconnect element
      element.remove();

      // Try to interact - should not crash
      element.value = 100;
      expect(element.value).toBe(100);
    });
  });

  // ===== Edge Cases =====
  describe('Edge Cases', () => {
    it('should handle rapid value changes', () => {
      for (let i = 0; i < 100; i++) {
        element.value = i;
      }

      expect(element.value).toBe(99);
    });

    it('should handle string number values', () => {
      element.setAttribute('value', '42');

      expect(element.value).toBe(42);
    });

    it('should handle invalid string values', () => {
      element.setAttribute('value', 'invalid');

      expect(element.value).toBeNaN();
    });

    it('should handle null values', () => {
      element.value = 10;
      element.setAttribute('value', null);

      expect(element.value).toBe(0); // Default value
    });

    it('should handle negative values when min allows', () => {
      element.min = -10;
      element.value = -5;

      expect(element.value).toBe(-5);
    });

    it('should handle zero values', () => {
      element.value = 0;

      expect(element.getAttribute('value')).toBe('0');
    });

    it('should handle very large values', () => {
      element.max = Number.MAX_SAFE_INTEGER;
      element.value = Number.MAX_SAFE_INTEGER;

      expect(element.value).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  // ===== Integration =====
  describe('Integration', () => {
    it('should work with multiple instances', () => {
      const element2 = document.createElement('x-counter') as CounterElement;
      const element3 = document.createElement('x-counter') as CounterElement;

      document.body.appendChild(element2);
      document.body.appendChild(element3);

      element2.value = 10;
      element3.value = 20;

      expect(element.value).toBe(0);
      expect(element2.value).toBe(10);
      expect(element3.value).toBe(20);

      element2.remove();
      element3.remove();
    });

    it('should maintain state across DOM moves', () => {
      element.value = 42;

      const container = document.createElement('div');
      container.appendChild(element);
      document.body.appendChild(container);

      expect(element.value).toBe(42);
    });

    it('should work with slots', () => {
      const slotContent = document.createElement('span');
      slotContent.textContent = 'Custom Content';

      element.appendChild(slotContent);
      const slot = element.shadowRoot!.querySelector('slot');

      expect(slot).not.toBeNull();
      expect(slot?.assignedElements()).toContain(slotContent);
    });
  });
});

// ===== Setup File for Vitest =====
/**
 * Use this as your test setup file (vitest setupFiles)
 *
 * // test/setup.ts
 *
 * import { cleanup } from '@testing-library/dom';
 *
 * afterEach(() => {
 *   cleanup();
 * });
 */
