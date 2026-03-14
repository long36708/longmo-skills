/**
 * Attribute Utilities for Web Components
 * Provides type-safe functions for working with HTML attributes
 */

/**
 * Get a boolean attribute value from an element
 * @param el - The element to read from
 * @param attrName - The attribute name
 * @returns True if the attribute is present, false otherwise
 */
export function getBooleanAttr(el, attrName) {
  return el.hasAttribute(attrName);
}

/**
 * Set a boolean attribute on an element
 * @param el - The element to modify
 * @param attrName - The attribute name
 * @param value - The boolean value (null removes the attribute)
 */
export function setBooleanAttr(el, attrName, value) {
  if (value == null) {
    if (el.hasAttribute(attrName)) {
      el.removeAttribute(attrName);
    }
    return;
  }

  if (getBooleanAttr(el, attrName) === value) return;

  el.toggleAttribute(attrName, value);
}

/**
 * Get a numeric attribute value from an element
 * @param el - The element to read from
 * @param attrName - The attribute name
 * @param defaultValue - The default value if attribute is missing
 * @returns The numeric value or undefined
 */
export function getNumericAttr(el, attrName, defaultValue) {
  const attrVal = el.getAttribute(attrName);
  return attrVal != null ? +attrVal : defaultValue;
}

/**
 * Set a numeric attribute on an element
 * @param el - The element to modify
 * @param attrName - The attribute name
 * @param value - The numeric value (null removes the attribute)
 */
export function setNumericAttr(el, attrName, value) {
  if (value == null) {
    el.removeAttribute(attrName);
    return;
  }

  if (!Number.isFinite(value)) {
    throw new Error(`Value for attribute "${attrName}" must be a finite number`);
  }

  const current = getNumericAttr(el, attrName);
  if (current === value) return;

  el.setAttribute(attrName, String(value));
}

/**
 * Get a string attribute value from an element
 * @param el - The element to read from
 * @param attrName - The attribute name
 * @param defaultValue - The default value if attribute is missing
 * @returns The string value or undefined
 */
export function getStringAttr(el, attrName, defaultValue) {
  return el.getAttribute(attrName) ?? defaultValue;
}

/**
 * Set a string attribute on an element
 * @param el - The element to modify
 * @param attrName - The attribute name
 * @param value - The string value (null removes the attribute)
 */
export function setStringAttr(el, attrName, value) {
  if (value == null) {
    el.removeAttribute(attrName);
    return;
  }

  const current = getStringAttr(el, attrName);
  if (current === value) return;

  el.setAttribute(attrName, value);
}
