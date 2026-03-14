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
export function getBooleanAttr(el: HTMLElement, attrName: string): boolean {
  return el.hasAttribute(attrName);
}

/**
 * Set a boolean attribute on an element
 * @param el - The element to modify
 * @param attrName - The attribute name
 * @param value - The boolean value (null removes the attribute)
 */
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

/**
 * Get a numeric attribute value from an element
 * @param el - The element to read from
 * @param attrName - The attribute name
 * @param defaultValue - The default value if attribute is missing
 * @returns The numeric value or undefined
 */
export function getNumericAttr(
  el: HTMLElement,
  attrName: string,
  defaultValue?: number
): number | undefined {
  const attrVal = el.getAttribute(attrName);
  return attrVal != null ? +attrVal : defaultValue;
}

/**
 * Set a numeric attribute on an element
 * @param el - The element to modify
 * @param attrName - The attribute name
 * @param value - The numeric value (null removes the attribute)
 */
export function setNumericAttr(
  el: HTMLElement,
  attrName: string,
  value: number | null | undefined
): void {
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
export function getStringAttr(
  el: HTMLElement,
  attrName: string,
  defaultValue?: string
): string | undefined {
  return el.getAttribute(attrName) ?? defaultValue;
}

/**
 * Set a string attribute on an element
 * @param el - The element to modify
 * @param attrName - The attribute name
 * @param value - The string value (null removes the attribute)
 */
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

/**
 * Get a JSON-parsed attribute value from an element
 * @param el - The element to read from
 * @param attrName - The attribute name
 * @param defaultValue - The default value if attribute is missing
 * @returns The parsed value or undefined
 */
export function getJSONAttr<T = any>(
  el: HTMLElement,
  attrName: string,
  defaultValue?: T
): T | undefined {
  const attrVal = el.getAttribute(attrName);
  if (attrVal == null) return defaultValue;

  try {
    return JSON.parse(attrVal);
  } catch (error) {
    console.error(`Failed to parse JSON attribute "${attrName}":`, error);
    return defaultValue;
  }
}

/**
 * Set a JSON-serialized attribute on an element
 * @param el - The element to modify
 * @param attrName - The attribute name
 * @param value - The value to serialize (null removes the attribute)
 */
export function setJSONAttr(
  el: HTMLElement,
  attrName: string,
  value: any | null | undefined
): void {
  if (value == null) {
    el.removeAttribute(attrName);
    return;
  }

  try {
    const jsonString = JSON.stringify(value);
    const current = el.getAttribute(attrName);

    if (current === jsonString) return;

    el.setAttribute(attrName, jsonString);
  } catch (error) {
    console.error(`Failed to serialize value for attribute "${attrName}":`, error);
    throw error;
  }
}

/**
 * Get a token list attribute value from an element
 * @param el - The element to read from
 * @param attrName - The attribute name
 * @returns An array of tokens
 */
export function getTokenListAttr(
  el: HTMLElement,
  attrName: string
): string[] {
  const attrVal = el.getAttribute(attrName);
  if (!attrVal) return [];

  return attrVal.split(/\s+/).filter(Boolean);
}

/**
 * Set a token list attribute on an element
 * @param el - The element to modify
 * @param attrName - The attribute name
 * @param tokens - The tokens to set (null removes the attribute)
 */
export function setTokenListAttr(
  el: HTMLElement,
  attrName: string,
  tokens: string[] | null | undefined
): void {
  if (tokens == null) {
    el.removeAttribute(attrName);
    return;
  }

  const value = tokens.join(' ');
  el.setAttribute(attrName, value);
}

/**
 * Get a date attribute value from an element
 * @param el - The element to read from
 * @param attrName - The attribute name
 * @param defaultValue - The default value if attribute is missing
 * @returns The Date object or undefined
 */
export function getDateAttr(
  el: HTMLElement,
  attrName: string,
  defaultValue?: Date
): Date | undefined {
  const attrVal = el.getAttribute(attrName);
  if (attrVal == null) return defaultValue;

  const date = new Date(attrVal);
  return isNaN(date.getTime()) ? defaultValue : date;
}

/**
 * Set a date attribute on an element
 * @param el - The element to modify
 * @param attrName - The attribute name
 * @param value - The Date value (null removes the attribute)
 */
export function setDateAttr(
  el: HTMLElement,
  attrName: string,
  value: Date | null | undefined
): void {
  if (value == null) {
    el.removeAttribute(attrName);
    return;
  }

  if (!(value instanceof Date)) {
    throw new Error(`Value for attribute "${attrName}" must be a Date object`);
  }

  const isoString = value.toISOString();
  el.setAttribute(attrName, isoString);
}

/**
 * Custom attribute serializer type
 */
export type AttributeSerializer<T = any> = (value: T) => string;

/**
 * Custom attribute deserializer type
 */
export type AttributeDeserializer<T = any> = (value: string) => T;

/**
 * Registry for custom attribute serializers
 */
const AttributeSerializers: Record<string, AttributeSerializer> = {};

/**
 * Registry for custom attribute deserializers
 */
const AttributeDeserializers: Record<string, AttributeDeserializer> = {};

/**
 * Register a custom attribute serializer
 * @param attrName - The attribute name
 * @param serializer - The serializer function
 */
export function registerAttributeSerializer<T>(
  attrName: string,
  serializer: AttributeSerializer<T>
): void {
  AttributeSerializers[attrName] = serializer;
}

/**
 * Register a custom attribute deserializer
 * @param attrName - The attribute name
 * @param deserializer - The deserializer function
 */
export function registerAttributeDeserializer<T>(
  attrName: string,
  deserializer: AttributeDeserializer<T>
): void {
  AttributeDeserializers[attrName] = deserializer;
}

/**
 * Serialize a value to a string using registered serializer or default
 * @param attrName - The attribute name
 * @param value - The value to serialize
 * @returns The serialized string
 */
export function serializeAttr(attrName: string, value: any): string {
  const serializer = AttributeSerializers[attrName];

  if (serializer) {
    try {
      return serializer(value);
    } catch (error) {
      console.error(`Serializer failed for attribute "${attrName}":`, error);
      return String(value);
    }
  }

  // Default serialization
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.join(' ');
  }

  return String(value);
}

/**
 * Deserialize a string value using registered deserializer or default
 * @param attrName - The attribute name
 * @param value - The string value to deserialize
 * @returns The deserialized value
 */
export function deserializeAttr(attrName: string, value: string): any {
  const deserializer = AttributeDeserializers[attrName];

  if (deserializer) {
    try {
      return deserializer(value);
    } catch (error) {
      console.error(`Deserializer failed for attribute "${attrName}":`, error);
      return value;
    }
  }

  // Default deserialization - return as-is
  return value;
}

/**
 * Set an attribute with automatic serialization
 * @param el - The element to modify
 * @param attrName - The attribute name
 * @param value - The value to set
 */
export function setAttr(
  el: HTMLElement,
  attrName: string,
  value: any
): void {
  if (value == null) {
    el.removeAttribute(attrName);
    return;
  }

  const serializedValue = serializeAttr(attrName, value);
  el.setAttribute(attrName, serializedValue);
}

/**
 * Get an attribute with automatic deserialization
 * @param el - The element to read from
 * @param attrName - The attribute name
 * @param defaultValue - The default value if attribute is missing
 * @returns The deserialized value
 */
export function getAttr<T = any>(
  el: HTMLElement,
  attrName: string,
  defaultValue?: T
): T | undefined {
  const attrVal = el.getAttribute(attrName);
  if (attrVal == null) return defaultValue;

  return deserializeAttr(attrName, attrVal);
}

/**
 * Watch for attribute changes on an element
 * @param el - The element to watch
 * @param attrName - The attribute name to watch
 * @param callback - Callback function when attribute changes
 * @returns Cleanup function
 */
export function watchAttribute(
  el: HTMLElement,
  attrName: string,
  callback: (newValue: string | null, oldValue: string | null) => void
): () => void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === attrName
      ) {
        const newValue = el.getAttribute(attrName);
        const oldValue = mutation.oldValue;
        callback(newValue, oldValue);
      }
    }
  });

  observer.observe(el, {
    attributes: true,
    attributeFilter: [attrName],
    attributeOldValue: true,
  });

  return () => observer.disconnect();
}

/**
 * Get all attributes as an object
 * @param el - The element to read from
 * @returns An object with all attributes
 */
export function getAttributesAsObject(el: HTMLElement): Record<string, string> {
  const result: Record<string, string> = {};

  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    result[attr.name] = attr.value;
  }

  return result;
}

/**
 * Set multiple attributes from an object
 * @param el - The element to modify
 * @param attrs - Object with attribute names and values
 */
export function setAttributesFromObject(
  el: HTMLElement,
  attrs: Record<string, any>
): void {
  Object.entries(attrs).forEach(([name, value]) => {
    if (value === null || value === undefined) {
      el.removeAttribute(name);
    } else if (typeof value === 'boolean') {
      setBooleanAttr(el, name, value);
    } else if (typeof value === 'number') {
      setNumericAttr(el, name, value);
    } else if (typeof value === 'string') {
      setStringAttr(el, name, value);
    } else {
      setAttr(el, name, value);
    }
  });
}
