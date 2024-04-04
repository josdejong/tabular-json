import type { GenericObject } from './types'

export interface StringifyOptions {
  indentation?: number | string
}

export function stringify(json: unknown, options?: StringifyOptions): string {
  // Code largely copied from https://github.com/josdejong/lossless-json
  const indentation = resolveIndentation(options?.indentation)

  return stringifyValue(json, '')

  function stringifyValue(value: unknown, indent: string | undefined): string {
    // boolean, null, number, string, or date
    if (
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string' ||
      value === null ||
      value instanceof Date ||
      value instanceof Boolean ||
      value instanceof Number ||
      value instanceof String
    ) {
      return JSON.stringify(value)
    }

    // BigInt
    if (typeof value === 'bigint') {
      return value.toString()
    }

    // Array
    if (Array.isArray(value)) {
      return stringifyArray(value, indent)
    }

    // Object (test lastly!)
    if (value && typeof value === 'object') {
      return stringifyObject(value as GenericObject<unknown>, indent)
    }

    return ''
  }

  function stringifyArray(array: Array<unknown>, indent: string | undefined): string {
    if (array.length === 0) {
      return '[]'
    }

    const childIndent = indentation ? indent + indentation : undefined
    let str = indentation ? '[\n' : '['

    for (let i = 0; i < array.length; i++) {
      const item = array[i]

      if (indentation) {
        str += childIndent
      }

      if (typeof item !== 'undefined' && typeof item !== 'function') {
        str += stringifyValue(item, childIndent)
      } else {
        str += 'null'
      }

      if (i < array.length - 1) {
        str += indentation ? ',\n' : ','
      }
    }

    str += indentation ? '\n' + indent + ']' : ']'
    return str
  }

  function stringifyObject(object: GenericObject<unknown>, indent: string | undefined): string {
    if (typeof object.toJSON === 'function') {
      return stringify(object.toJSON(), options)
    }

    const keys: string[] = Object.keys(object)

    if (keys.length === 0) {
      return '{}'
    }

    const childIndent = indentation ? indent + indentation : undefined
    let first = true
    let str = indentation ? '{\n' : '{'

    keys.forEach((key) => {
      const value = object[key]

      if (includeProperty(value)) {
        if (first) {
          first = false
        } else {
          str += indentation ? ',\n' : ','
        }

        const keyStr = JSON.stringify(key)
        str += indentation ? childIndent + keyStr + ': ' : keyStr + ':'

        str += stringifyValue(value, childIndent)
      }
    })

    str += indentation ? '\n' + indent + '}' : '}'
    return str
  }

  /**
   * Test whether to include a property in a stringified object or not.
   */
  function includeProperty(value: unknown): boolean {
    return typeof value !== 'undefined' && typeof value !== 'function' && typeof value !== 'symbol'
  }
}

/**
 * Resolve a JSON stringify space:
 * replace a number with a string containing that number of spaces
 */
function resolveIndentation(indentation: number | string | undefined): string | undefined {
  if (typeof indentation === 'number') {
    return ' '.repeat(indentation)
  }

  if (typeof indentation === 'string' && indentation !== '') {
    return indentation
  }

  return undefined
}
