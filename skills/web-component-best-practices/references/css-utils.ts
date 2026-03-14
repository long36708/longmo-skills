/**
 * CSS Utilities for Web Components
 * Provides helper functions for working with CSS in Shadow DOM
 */

/**
 * Get or insert a CSS rule for a specific selector
 * @param styleParent - The style parent (element or shadow root)
 * @param selectorText - The CSS selector text
 * @returns The CSS style rule
 */
export function getOrInsertCSSRule(
  styleParent: Element | ShadowRoot,
  selectorText: string
): CSSStyleRule {
  const stylesheets = Array.from(styleParent.styleSheets) as CSSStyleSheet[];

  // Search for existing rule
  for (const stylesheet of stylesheets) {
    try {
      for (let i = 0; i < stylesheet.cssRules.length; i++) {
        const rule = stylesheet.cssRules[i];
        if (rule.type === CSSRule.STYLE_RULE) {
          const styleRule = rule as CSSStyleRule;
          if (styleRule.selectorText === selectorText) {
            return styleRule;
          }
        }
      }
    } catch (e) {
      // May fail due to CORS or other restrictions
      console.warn('Failed to access stylesheet rules:', e);
    }
  }

  // Insert new rule
  const stylesheet = stylesheets[0];
  if (!stylesheet) {
    throw new Error('No stylesheet found in the provided parent');
  }

  const index = stylesheet.insertRule(
    `${selectorText} {}`,
    stylesheet.cssRules.length
  );

  return stylesheet.cssRules[index] as CSSStyleRule;
}

/**
 * Find a CSS rule by selector
 * @param styleParent - The style parent (element or shadow root)
 * @param selector - The selector to match
 * @returns The CSS style rule or null
 */
export function getCSSRule(
  styleParent: Element | ShadowRoot,
  selector: string
): CSSStyleRule | null {
  const stylesheets = Array.from(styleParent.styleSheets) as CSSStyleSheet[];

  for (const stylesheet of stylesheets) {
    try {
      for (let i = 0; i < stylesheet.cssRules.length; i++) {
        const rule = stylesheet.cssRules[i];
        if (rule.type === CSSRule.STYLE_RULE) {
          const styleRule = rule as CSSStyleRule;
          if (styleRule.selectorText === selector) {
            return styleRule;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to access stylesheet rules:', e);
    }
  }

  return null;
}

/**
 * Insert a CSS rule
 * @param styleParent - The style parent (element or shadow root)
 * @param selectorText - The CSS selector text
 * @returns The CSS style rule
 */
export function insertCSSRule(
  styleParent: Element | ShadowRoot,
  selectorText: string
): CSSStyleRule {
  const stylesheets = Array.from(styleParent.styleSheets) as CSSStyleSheet[];
  const stylesheet = stylesheets[0];

  if (!stylesheet) {
    throw new Error('No stylesheet found in the provided parent');
  }

  const index = stylesheet.insertRule(
    `${selectorText} {}`,
    stylesheet.cssRules.length
  );

  return stylesheet.cssRules[index] as CSSStyleRule;
}

/**
 * Remove a CSS rule by selector
 * @param styleParent - The style parent (element or shadow root)
 * @param selectorText - The CSS selector text
 * @returns True if rule was removed, false otherwise
 */
export function removeCSSRule(
  styleParent: Element | ShadowRoot,
  selectorText: string
): boolean {
  const stylesheets = Array.from(styleParent.styleSheets) as CSSStyleSheet[];

  for (const stylesheet of stylesheets) {
    try {
      for (let i = stylesheet.cssRules.length - 1; i >= 0; i--) {
        const rule = stylesheet.cssRules[i];
        if (rule.type === CSSRule.STYLE_RULE) {
          const styleRule = rule as CSSStyleRule;
          if (styleRule.selectorText === selectorText) {
            stylesheet.deleteRule(i);
            return true;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to access stylesheet rules:', e);
    }
  }

  return false;
}

/**
 * Create a stylesheet element and append it to shadow root
 * @param shadowRoot - The shadow root
 * @param css - The CSS content
 * @returns The created style element
 */
export function createStylesheet(
  shadowRoot: ShadowRoot,
  css: string
): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = css;
  shadowRoot.appendChild(style);
  return style;
}

/**
 * Set a CSS custom property on the host element
 * @param shadowRoot - The shadow root
 * @param propertyName - The property name (without --)
 * @param value - The property value
 */
export function setCSSVariable(
  shadowRoot: ShadowRoot,
  propertyName: string,
  value: string
): void {
  const host = shadowRoot.host;
  const style = getOrInsertCSSRule(shadowRoot, ':host');
  style.style.setProperty(`--${propertyName}`, value);
}

/**
 * Get a CSS custom property value
 * @param shadowRoot - The shadow root
 * @param propertyName - The property name (without --)
 * @returns The property value
 */
export function getCSSVariable(
  shadowRoot: ShadowRoot,
  propertyName: string
): string {
  const host = shadowRoot.host;
  return getComputedStyle(host).getPropertyValue(`--${propertyName}`).trim();
}

/**
 * Remove a CSS custom property
 * @param shadowRoot - The shadow root
 * @param propertyName - The property name (without --)
 */
export function removeCSSVariable(
  shadowRoot: ShadowRoot,
  propertyName: string
): void {
  const host = shadowRoot.host;
  const style = getOrInsertCSSRule(shadowRoot, ':host');
  style.style.removeProperty(`--${propertyName}`);
}

/**
 * Apply multiple CSS custom properties
 * @param shadowRoot - The shadow root
 * @param properties - Object with property names and values
 */
export function applyCSSVariables(
  shadowRoot: ShadowRoot,
  properties: Record<string, string>
): void {
  const style = getOrInsertCSSRule(shadowRoot, ':host');
  Object.entries(properties).forEach(([name, value]) => {
    style.style.setProperty(`--${name}`, value);
  });
}

/**
 * Remove multiple CSS custom properties
 * @param shadowRoot - The shadow root
 * @param propertyNames - Array of property names
 */
export function removeCSSVariables(
  shadowRoot: ShadowRoot,
  propertyNames: string[]
): void {
  const style = getOrInsertCSSRule(shadowRoot, ':host');
  propertyNames.forEach(name => {
    style.style.removeProperty(`--${name}`);
  });
}

/**
 * Inject CSS into the shadow root
 * @param shadowRoot - The shadow root
 * @param css - The CSS content
 * @returns The created style element
 */
export function injectCSS(shadowRoot: ShadowRoot, css: string): HTMLStyleElement {
  return createStylesheet(shadowRoot, css);
}

/**
 * Create a scoped stylesheet with a specific prefix
 * @param shadowRoot - The shadow root
 * @param prefix - The prefix to add to selectors
 * @param css - The CSS content
 */
export function createScopedStylesheet(
  shadowRoot: ShadowRoot,
  prefix: string,
  css: string
): void {
  // Add prefix to all selectors
  const prefixedCSS = css.replace(/([^{]+)\{/g, (_, selector) => {
    if (selector.trim().startsWith('@')) {
      return selector + '{';
    }
    return `${prefix} ${selector.trim()}{`;
  });

  createStylesheet(shadowRoot, prefixedCSS);
}

/**
 * Get computed style of an element
 * @param element - The element
 * @param property - The CSS property name
 * @returns The computed style value
 */
export function getComputedStyleValue(
  element: Element,
  property: string
): string {
  return getComputedStyle(element).getPropertyValue(property).trim();
}

/**
 * Check if an element has a specific class
 * @param element - The element
 * @param className - The class name
 * @returns True if element has the class
 */
export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

/**
 * Add a class to an element
 * @param element - The element
 * @param className - The class name
 */
export function addClass(element: Element, className: string): void {
  element.classList.add(className);
}

/**
 * Remove a class from an element
 * @param element - The element
 * @param className - The class name
 */
export function removeClass(element: Element, className: string): void {
  element.classList.remove(className);
}

/**
 * Toggle a class on an element
 * @param element - The element
 * @param className - The class name
 * @param force - Optional force flag
 */
export function toggleClass(
  element: Element,
  className: string,
  force?: boolean
): void {
  element.classList.toggle(className, force);
}

/**
 * Set multiple styles on an element
 * @param element - The element
 * @param styles - Object with style properties and values
 */
export function setStyles(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration>
): void {
  Object.assign(element.style, styles);
}

/**
 * Animate an element using Web Animations API
 * @param element - The element to animate
 * @param keyframes - The animation keyframes
 * @param options - The animation options
 * @returns The animation object
 */
export function animate(
  element: Element,
  keyframes: Keyframe[],
  options?: KeyframeAnimationOptions
): Animation {
  return element.animate(keyframes, options);
}

/**
 * Create a media query listener
 * @param query - The media query string
 * @param callback - The callback function
 * @returns Cleanup function
 */
export function createMediaQueryListener(
  query: string,
  callback: (matches: boolean) => void
): () => void {
  const mediaQuery = window.matchMedia(query);
  const handler = (e: MediaQueryListEvent | MediaQueryList) => callback(e.matches);

  mediaQuery.addEventListener('change', handler);
  handler(mediaQuery); // Initial call

  return () => {
    mediaQuery.removeEventListener('change', handler);
  };
}

/**
 * Check if the current environment prefers reduced motion
 * @returns True if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if the current environment prefers dark mode
 * @returns True if dark mode is preferred
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Check if the current environment is in high contrast mode
 * @returns True if high contrast mode is active
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Apply theme based on color scheme preference
 * @param shadowRoot - The shadow root
 * @param lightTheme - Light theme properties
 * @param darkTheme - Dark theme properties
 * @returns Cleanup function
 */
export function applyColorScheme(
  shadowRoot: ShadowRoot,
  lightTheme: Record<string, string>,
  darkTheme: Record<string, string>
): () => void {
  const applyTheme = (isDark: boolean) => {
    const theme = isDark ? darkTheme : lightTheme;
    applyCSSVariables(shadowRoot, theme);
  };

  // Initial application
  applyTheme(prefersDarkMode());

  // Listen for changes
  return createMediaQueryListener('(prefers-color-scheme: dark)', (matches) => {
    applyTheme(matches);
  });
}

/**
 * Create a focus trap within an element
 * @param element - The element to trap focus in
 * @returns Cleanup function
 */
export function createFocusTrap(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeydown);

  return () => {
    element.removeEventListener('keydown', handleKeydown);
  };
}

/**
 * Create a resize observer
 * @param element - The element to observe
 * @param callback - The callback function
 * @returns Cleanup function
 */
export function observeResize(
  element: Element,
  callback: (entries: ResizeObserverEntry[]) => void
): () => void {
  const observer = new ResizeObserver(callback);
  observer.observe(element);

  return () => {
    observer.disconnect();
  };
}

/**
 * Create an intersection observer
 * @param element - The element to observe
 * @param callback - The callback function
 * @param options - Intersection observer options
 * @returns Cleanup function
 */
export function observeIntersection(
  element: Element,
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver(callback, options);
  observer.observe(element);

  return () => {
    observer.disconnect();
  };
}

/**
 * Create a mutation observer
 * @param element - The element to observe
 * @param callback - The callback function
 * @param options - Mutation observer options
 * @returns Cleanup function
 */
export function observeMutation(
  element: Node,
  callback: MutationCallback,
  options?: MutationObserverInit
): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(element, options);

  return () => {
    observer.disconnect();
  };
}
