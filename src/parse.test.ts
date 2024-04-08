import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, test, expect } from 'vitest'
import peggy from 'peggy'

const tabularJsonGrammer = String(
  readFileSync(getAbsolutePath(import.meta.url, './grammers/tabular-json.pegjs'))
)

const { parse } = peggy.generate(tabularJsonGrammer)

test('compile and use the JSON grammer', () => {
  // This test is just to verify that the JSON grammer and Peggy work as expected
  const jsonGrammer = String(
    readFileSync(getAbsolutePath(import.meta.url, './grammers/json.pegjs'))
  )
  const { parse } = peggy.generate(jsonGrammer)

  const jsonStr = '{"a":123,"b":"str","c":null,"d":false,"e":[1,2,3]}'
  const json = { a: 123, b: 'str', c: null, d: false, e: [1, 2, 3] }

  expect(parse(jsonStr)).toEqual(json)
})

describe('compile and use the Tabular-JSON grammer', () => {

  test('full JSON object', function () {
    const text = '{"a":2.3e100,"b":"str","c":null,"d":false,"e":[1,2,3]}'
    const expected = {
      a: 2.3e100,
      b: 'str',
      c: null,
      d: false,
      e: [1, 2, 3]
    }
    const parsed = parse(text)

    expect(parse(text)).toEqual(expected)
  })

  test('object', function () {
    expect(parse('{}')).toEqual({})
    expect(parse('  { \n } \t ')).toEqual({})
    expect(parse('{"a": {}}')).toEqual({ a: {} })
    expect(parse('{"a": "b"}')).toEqual({ a: 'b' })
    expect(parse('{"a": 2}')).toEqual({ a: 2 })
  })

  test('array', function () {
    expect(parse('[]')).toEqual([])
    expect(parse('[{}]')).toEqual([{}])
    expect(parse('{"a":[]}')).toEqual({ a: [] })
    expect(parse('[1, "hi", true, false, null, {}, []]')).toEqual([
      1,
      'hi',
      true,
      false,
      null,
      {},
      []
    ])
  })

  test('number', function () {
    expect(parse('23')).toEqual(23)
    expect(parse('0')).toEqual(0)
    expect(parse('0e+2')).toEqual(0)
    expect(parse('0.0')).toEqual(0)
    expect(parse('-0')).toEqual(-0)
    expect(parse('2.3')).toEqual(2.3)
    expect(parse('2300e3')).toEqual(2300e3)
    expect(parse('2300e+3')).toEqual(2300e3)
    expect(parse('-2')).toEqual(-2)
    expect(parse('2e-3')).toEqual(2e-3)
    expect(parse('2.3e-3')).toEqual(2.3e-3)
  })

  test('string', function () {
    expect(parse('"str"')).toEqual('str')
    expect(JSON.parse('"\\"\\\\\\/\\b\\f\\n\\r\\t"')).toEqual('"\\/\b\f\n\r\t')
    expect(parse('"\\"\\\\\\/\\b\\f\\n\\r\\t"')).toEqual('"\\/\b\f\n\r\t')
    expect(JSON.parse('"\\u260E"')).toEqual('\u260E')
    expect(parse('"\\u260E"')).toEqual('\u260E')
  })

  test('keywords', function () {
    expect(parse('true')).toEqual(true)
    expect(parse('false')).toEqual(false)
    expect(parse('null')).toEqual(null)
  })

  test('correctly handle strings equaling a JSON delimiter', function () {
    expect(parse('""')).toEqual('')
    expect(parse('"["')).toEqual('[')
    expect(parse('"]"')).toEqual(']')
    expect(parse('"{"')).toEqual('{')
    expect(parse('"}"')).toEqual('}')
    expect(parse('":"')).toEqual(':')
    expect(parse('","')).toEqual(',')
  })

  test('supports unicode characters in a string', () => {
    expect(parse('"★"')).toBe('★')
    expect(parse('"😀"')).toBe('😀')
    expect(parse('"\ud83d\ude00"')).toBe('\ud83d\ude00')
    expect(parse('"йнформация"')).toBe('йнформация')
  })

  test('supports escaped unicode characters in a string', () => {
    expect(parse('"\\u2605"')).toBe('\u2605')
    expect(parse('"\\ud83d\\ude00"')).toBe('\ud83d\ude00')
    expect(parse('"\\u0439\\u043d\\u0444\\u043e\\u0440\\u043c\\u0430\\u0446\\u0438\\u044f"')).toBe(
      '\u0439\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f'
    )
  })

  test('supports unicode characters in a key', () => {
    expect(parse('{"★":true}')).toStrictEqual({ '★': true })
    expect(parse('{"\u2605":true}')).toStrictEqual({ '\u2605': true })
    expect(parse('{"😀":true}')).toStrictEqual({ '😀': true })
    expect(parse('{"\ud83d\ude00":true}')).toStrictEqual({ '\ud83d\ude00': true })
  })

  test('parse a formatted array', () => {
    expect(parse('[\n  1,\n  2,\n  3\n]')).toEqual([1, 2, 3])
  })

  test('parse unquoted strings', () => {
    expect(parse('hello')).toEqual('hello')
    expect(parse('[ hello, world]')).toEqual(['hello', 'world'])
    expect(parse('[ hello, world ]')).toEqual(['hello', 'world'])
    expect(parse('[ hello world ]')).toEqual(['hello world'])

    // FIXME: test all special characters and test error throwing
  })

  test('parse unquoted keys', () => {
    expect(parse('{id: 1, message: hello world}')).toEqual({ id: 1, message: 'hello world' })
  })

  test('parse dates', () => {
    expect(parse('2024-04-05T12:15:21Z')).toEqual(new Date('2024-04-05T12:15:21Z'))
    expect(parse('2024-04-05T12:15:21.262Z')).toEqual(new Date('2024-04-05T12:15:21.262Z'))
    expect(parse('{ updated: 2024-04-05T12:15:21.262Z }')).toEqual({
      updated: new Date('2024-04-05T12:15:21.262Z')
    })
    expect(parse('[2024-04-05T12:15:21Z, 2024-04-05T14:15:00Z]')).toEqual([
      new Date('2024-04-05T12:15:21Z'),
      new Date('2024-04-05T14:15:00Z')
    ])
  })

  test('parse tables with flat properties', () => {
    expect(parse('---\nid,name\n1,joe\n2,sarah\n---')).toEqual([
      { id: 1, name: 'joe' },
      { id: 2, name: 'sarah' }
    ])
  })

  test('parse tables with nested properties', () => {
    expect(
      parse(`---
      id,name,address.city,address.street
      1,Joe,New York,"1st Ave"
      2,Sarah,Washington,"18th Street NW"
      ---`)
    ).toEqual([
      { id: 1, name: 'Joe', address: { city: 'New York', street: '1st Ave' } },
      { id: 2, name: 'Sarah', address: { city: 'Washington', street: '18th Street NW' } }
    ])
  })
})

test('parse tables with whitespace', () => {
  expect(
    parse(`---
      id , details . name 
      1 , joe 
      2 , sarah 
      ---`)
  ).toEqual([
    { id: 1, details: { name: 'joe' } },
    { id: 2, details: { name: 'sarah' } }
  ])
})

test('parse a nested table', () => {
  expect(
    parse(`{
    data: ---
    id,name
    1,Joe
    2,Sarah
    ---
  }`)
  ).toEqual({
    data: [
      { id: 1, name: 'Joe' },
      { id: 2, name: 'Sarah' }
    ]
  })
})

test('parse a root table', () => {
  expect(
    parse(`id,name
    1,Joe
    2,Sarah
    `)
  ).toEqual([
    { id: 1, name: 'Joe' },
    { id: 2, name: 'Sarah' }
  ])
})

test('parse a root table without newline at the end', () => {
  expect(
    parse(`id,name
    1,Joe
    2,Sarah`)
  ).toEqual([
    { id: 1, name: 'Joe' },
    { id: 2, name: 'Sarah' }
  ])
})

test('parse tables containing nested arrays', () => {
  expect(
    parse(`---
      id, name, score
      1, joe, [5, 7]
      2, sarah, [7, 7, 8]
      ---`)
  ).toEqual([
    { id: 1, name: 'joe', score: [5, 7] },
    { id: 2, name: 'sarah', score: [7, 7, 8] }
  ])
})

test('parse tables containing nested objects', () => {
  expect(
    parse(`---
      id, name, address
      1, Joe, { city: "New York", street: "1st Ave" }
      2, Sarah, { city: "Washington", street: "18th Street NW" }
      ---`)
  ).toEqual([
    { id: 1, name: 'Joe', address: { city: 'New York', street: '1st Ave' } },
    { id: 2, name: 'Sarah', address: { city: 'Washington', street: '18th Street NW' } }
  ])
})

test('parse an empty array', () => {
  expect(parse('[]')).toEqual([])
})

test('parse an empty object', () => {
  expect(parse('{}')).toEqual({})
})

/**
 * Usage:
 *
 *   getAbsolutePath(import.meta.url)
 *   getAbsolutePath(import.meta.url, '../package.json')
 *   getAbsolutePath(import.meta.url, '..' , 'package.json')
 *
 * Source: https://github.com/ivangabriele/esm-path
 *
 * @param {string} importMetaUrl
 * @param {string} [relativePaths]
 * @returns {string}
 */
export function getAbsolutePath(importMetaUrl: string, ...relativePaths: string[]) {
  const importMetaPath = fileURLToPath(importMetaUrl)
  const importMetaDirectoryPath = dirname(importMetaPath)
  return join(importMetaDirectoryPath, ...relativePaths)
}
