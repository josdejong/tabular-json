import type { GenericObject } from './types.js'

export function isTabular(value: unknown): value is Array<GenericObject<unknown>> {
  return Array.isArray(value) && value.length > 0 && value.every(isObject)
}

export function isObject(value: unknown): value is GenericObject<unknown> {
  return typeof value === 'object' && value !== null && value.constructor === Object // do not match on classes or Array
}
