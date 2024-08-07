// The code of stringify is largely copied from:
// - https://github.com/josdejong/lossless-json
// - https://github.com/josdejong/csv42
import type { Field, GenericObject, ValueGetter } from './types'
import { collectNestedPaths, getIn, type Path } from 'csv42'

export interface StringifyOptions {
  indentation?: number | string
}

export function stringify(json: unknown, options?: StringifyOptions): string {
  const globalIndentation = resolveIndentation(options?.indentation)

  return stringifyValue(json, '', globalIndentation)

  function stringifyValue(value: unknown, indent: string, indentation: string | undefined): string {
    // boolean, null, number
    if (typeof value === 'boolean' || typeof value === 'number' || value === null) {
      return JSON.stringify(value)
    }

    // date
    if (value instanceof Date) {
      return value.toISOString()
    }

    // string
    if (typeof value === 'string') {
      return stringifyStringValue(value)
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
    indent: string,
    indentation: string | undefined
  ): string {
    if (array.length === 0) {
      return '[]'
    }

    const childIndent = indentation ? indent + indentation : indent
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
    indent: string,
    indentation: string | undefined
  ): string {
    const isRoot = array === json
    const childIndent = indentation && indent ? indent + indentation : indent
    const colSeparator = indentation ? ', ' : ','

    let str = ''

    const fields = collectFields(array)

    str += isRoot ? '' : '---\n'

    const header = fields.map((field) => field.name)
    const rows = array.map((item) =>
      fields.map((field) => stringifyValue(field.getValue(item), childIndent, undefined))
    )

    if (indentation) {
      const widths = calculateColumnWidths(header, rows)

      str += childIndent + formatRow(header, widths)
      rows.forEach((row) => (str += childIndent + formatRow(row, widths)))
    } else {
      str += childIndent + header.join(colSeparator) + '\n'
      rows.forEach((row) => (str += childIndent + row.join(colSeparator) + '\n'))
    }

    str += isRoot ? '' : indent + '---'

    return str
  }

  function formatRow(row: string[], widths: number[]) {
    return row
      .map((field, f) => (f < widths.length - 1 ? (field + ',').padEnd(widths[f]) : field + '\n'))
      .join('')
  }

  function stringifyObject(
    object: GenericObject<unknown>,
    indent: string,
    indentation: string | undefined
  ): string {
    if (typeof object.toJSON === 'function') {
      return stringify(object.toJSON(), options)
    }

    const keys: string[] = Object.keys(object)

    if (keys.length === 0) {
      return '{}'
    }

    const childIndent = indentation ? indent + indentation : indent
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

        const keyStr = stringifyStringValue(key)
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
    name: stringifyField(path),
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

function stringifyStringValue(value: string): string {
  return NEEDS_QUOTES_REGEX.test(value) ? JSON.stringify(value) : value
}

function stringifyField(path: Path): string {
  return path.map((key) => stringifyStringValue(String(key))).join('.')
}

function calculateColumnWidths(header: string[], rows: string[][]): number[] {
  return rows
    .reduce(
      (widths, row) => {
        return row.map((field, i) => Math.max(widths[i], field.length))
      },
      header.map((field) => field.length)
    )
    .map((width) => width + 2)
  // Note: we add 1 space to account for the comma,
  // and another to ensure there is at least 1 space between the columns
}

/**
 * We need quotes around a string when:
 * - contains characters outside the range \u0020 - \u10FFFF
 * - it contains a delimiter
 * - starts with whitespace (we would lose the whitespace when parsing)
 * - ends with whitespace (we would lose the whitespace when parsing)
 * - when it starts with a digit (else it would be parsed as a number)
 */
const NEEDS_QUOTES_REGEX = /[\x00-\x1F",.:\-[\]{}\n]|^\s|\s$|^\d/
