// The code of stringify is largely copied from:
// - https://github.com/josdejong/lossless-json
// - https://github.com/josdejong/csv42
import { Field, GenericObject, ValueGetter } from './types'
import { collectNestedPaths, getIn, Path } from 'csv42'

export interface StringifyOptions {
  indentation?: number | string
}

export function stringify(json: unknown, options?: StringifyOptions): string {
  const globalIndentation = resolveIndentation(options?.indentation)

  return stringifyValue(json, '', globalIndentation)

  function stringifyValue(
    value: unknown,
    indent: string | undefined,
    indentation: string | undefined
  ): string {
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

    // Table
    if (isTabular(value)) {
      return stringifyTable(value, indent, indentation)
    }

    // Array (test after Table!)
    if (Array.isArray(value)) {
      return stringifyArray(value, indent, indentation)
    }

    // Object
    if (isObject(value)) {
      return stringifyObject(value as GenericObject<unknown>, indent, indentation)
    }

    return ''
  }

  function stringifyArray(
    array: Array<unknown>,
    indent: string | undefined,
    indentation: string | undefined
  ): string {
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
        str += stringifyValue(item, childIndent, indentation)
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

  function stringifyTable(
    array: Array<unknown>,
    indent: string | undefined,
    indentation: string | undefined
  ): string {
    const childIndent = indentation && indent ? indent + indentation : ''
    const rowIndent = indentation ? childIndent + '~ ' : '~'
    const colSeparator = indentation ? ', ' : ','

    let str = ''

    const fields = collectFields(array)

    str += (indent ? '\n' : '') + rowIndent + fields.map((field) => field.name).join(colSeparator)

    for (let i = 0; i < array.length; i++) {
      const item = array[i] as GenericObject<unknown>

      str +=
        '\n' +
        rowIndent +
        fields
          .map((field) => stringifyValue(field.getValue(item), childIndent, undefined))
          .join(colSeparator)
    }

    return str
  }

  function stringifyObject(
    object: GenericObject<unknown>,
    indent: string | undefined,
    indentation: string | undefined
  ): string {
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

        str += stringifyValue(value, childIndent, indentation)
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

function isTabular(value: unknown): value is Array<GenericObject<unknown>> {
  return Array.isArray(value) && value.length > 0 && value.every(isObject)
}

function isObject(value: unknown): value is GenericObject<unknown> {
  return typeof value === 'object' && value !== null && value.constructor === Object // do not match on classes or Array
}

function collectFields(records: Array<unknown>): Field<unknown>[] {
  return collectNestedPaths(records, isObject).map((path) => ({
    name: path.map((key) => JSON.stringify(key)).join('.'),
    getValue: createGetValue(path)
  }))
}

function createGetValue<T>(path: Path): ValueGetter<T> {
  if (path.length === 1) {
    const key = path[0]
    return (item) => (item as GenericObject<unknown>)[key]
  }

  return (item) => getIn(item as GenericObject<unknown>, path)
}
