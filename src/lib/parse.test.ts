import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { parse } from './parse.ts'

test('full JSON object', function () {
  const text = '{"a":2.3e100,"b":"str","c":null,"d":false,"e":[1,2,3]}'
  const expected = {
    a: 2.3e100,
    b: 'str',
    c: null,
    d: false,
    e: [1, 2, 3]
  }

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
  expect(parse('inf')).toEqual(Infinity)
  expect(parse('-inf')).toEqual(-Infinity)
  expect(parse('nan')).toBeNaN()
})

test('string', function () {
  expect(parse('"str"')).toEqual('str')
  expect(JSON.parse('"\\"\\\\\\/\\b\\f\\n\\r\\t"')).toEqual('"\\/\b\f\n\r\t')
  expect(parse('"\\"\\\\\\/\\b\\f\\n\\r\\t"')).toEqual('"\\/\b\f\n\r\t')
  expect(JSON.parse('"\\u260E"')).toEqual('\u260E')
  expect(parse('"\\u260E"')).toEqual('\u260E')
  expect(parse('"∛"')).toEqual('∛')
  expect(parse('"a \\" character"')).toEqual('a " character')
  expect(parse('"a \\n character"')).toEqual('a \n character')
  expect(parse('" start space"')).toEqual(' start space')
  expect(parse('"\\tstart space"')).toEqual('\tstart space')
  expect(parse(' "ignore start space"')).toEqual('ignore start space')
  expect(parse('"end space "')).toEqual('end space ')
  expect(parse('"end space\\t"')).toEqual('end space\t')
  expect(parse('"ignore end space" ')).toEqual('ignore end space')
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

test('parse tables with flat properties', () => {
  expect(parse('---\n"id","name"\n1,"joe"\n2,"sarah"\n---')).toEqual([
    { id: 1, name: 'joe' },
    { id: 2, name: 'sarah' }
  ])
})

test('parse tables with \\r\\n newlines', () => {
  expect(parse('---\r\n"id","name"\r\n1,"joe"\r\n2,"sarah"\r\n---')).toEqual([
    { id: 1, name: 'joe' },
    { id: 2, name: 'sarah' }
  ])
})

test('parse tables with nested properties', () => {
  expect(
    parse(`---
    "id","name","address"."city","address"."street"
    1,"Joe","New York","1st Ave"
    2,"Sarah","Washington","18th Street NW"
    ---`)
  ).toEqual([
    { id: 1, name: 'Joe', address: { city: 'New York', street: '1st Ave' } },
    { id: 2, name: 'Sarah', address: { city: 'Washington', street: '18th Street NW' } }
  ])
})

test('parse tables with whitespace', () => {
  expect(
    parse(`---
      "id" , "details" . "name" 
      1 , "joe" 
      2 , "sarah" 
      ---`)
  ).toEqual([
    { id: 1, details: { name: 'joe' } },
    { id: 2, details: { name: 'sarah' } }
  ])
})

test('parse tables with missing values (1)', () => {
  expect(
    parse(`---
      "id", "name"
      1 , 
      2 , "sarah" 
      ---`)
  ).toEqual([{ id: 1 }, { id: 2, name: 'sarah' }])
})

test('parse tables with missing values (2)', () => {
  expect(
    parse(`"id", "name" 
      1,"joe"
      ,"sarah"`)
  ).toEqual([{ id: 1, name: 'joe' }, { name: 'sarah' }])
})

test('parse tables with missing values (3)', () => {
  expect(
    parse(`---
      "id", "name" 
      1 , "joe" 
      , "sarah" 
      ---`)
  ).toEqual([{ id: 1, name: 'joe' }, { name: 'sarah' }])
})

test('parse tables with missing values (4)', () => {
  expect(
    parse(`---
      "id" 
      1 

      3
      ---`)
  ).toEqual([{ id: 1 }, { id: 3 }])
})

test('parse a nested table', () => {
  expect(
    parse(`{
    "data": ---
    "id","name"
    1,"Joe"
    2,"Sarah"
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
    parse(`"id","name"
    1,"Joe"
    2,"Sarah"
    `)
  ).toEqual([
    { id: 1, name: 'Joe' },
    { id: 2, name: 'Sarah' }
  ])
})

test('parse a root table starting with a blank line', () => {
  expect(
    parse(`
    "id","name"
    1,"Joe"
    2,"Sarah"
    `)
  ).toEqual([
    { id: 1, name: 'Joe' },
    { id: 2, name: 'Sarah' }
  ])
})

test('parse a root table ending with multiple blank lines', () => {
  expect(
    parse(`"id","name"
    1,"Joe"
    2,"Sarah"
    
    `)
  ).toEqual([
    { id: 1, name: 'Joe' },
    { id: 2, name: 'Sarah' }
  ])
})

test('parse a root table without newline at the end', () => {
  expect(
    parse(`"id","name"
    1,"Joe"
    2,"Sarah"`)
  ).toEqual([
    { id: 1, name: 'Joe' },
    { id: 2, name: 'Sarah' }
  ])
})

test('parse tables containing nested arrays', () => {
  expect(
    parse(`---
      "id", "name", "score"
      1, "joe", [5, 7]
      2, "sarah", [7, 7, 8]
      ---`)
  ).toEqual([
    { id: 1, name: 'joe', score: [5, 7] },
    { id: 2, name: 'sarah', score: [7, 7, 8] }
  ])
})

test('parse tables containing nested objects', () => {
  expect(
    parse(`---
      "id", "name", "address"
      1, "Joe", { "city": "New York", "street": "1st Ave" }
      2, "Sarah", { "city": "Washington", "street": "18th Street NW" }
      ---`)
  ).toEqual([
    { id: 1, name: 'Joe', address: { city: 'New York', street: '1st Ave' } },
    { id: 2, name: 'Sarah', address: { city: 'Washington', street: '18th Street NW' } }
  ])
})

test('parse a table with field names that are escaped', function () {
  const text = `"id", "first.name", "address"."current.city", "address"."main,street", "address"."with\\nreturn"
2, "joe", "New York", "1st Ave", true
3, "sarah", "Washington", "18th Street NW", false
`

  expect(parse(text)).toEqual([
    {
      id: 2,
      'first.name': 'joe',
      address: {
        'current.city': 'New York',
        'main,street': '1st Ave',
        'with\nreturn': true
      }
    },
    {
      id: 3,
      'first.name': 'sarah',
      address: {
        'current.city': 'Washington',
        'main,street': '18th Street NW',
        'with\nreturn': false
      }
    }
  ])
})

test('parse a line comment', () => {
  const expected = { key: 'value' }

  expect(
    parse(`{
    // comment
    "key": "value"
  }`)
  ).toEqual(expected)

  expect(
    parse(`{
    "key": "value"
    // comment
  }`)
  ).toEqual(expected)

  expect(
    parse(`// comment
  {
    "key": "value"
  }`)
  ).toEqual(expected)

  expect(
    parse(`// comment 1
  // comment 2
  {
    "key": "value"
  }`)
  ).toEqual(expected)
})

test('parse a line comment inside a table', () => {
  const expected = [
    { id: 2, name: 'joe' },
    { id: 3, name: 'sarah' }
  ]

  expect(
    parse(`"id","name"
  // comment
  2,"joe"
  3,"sarah"`)
  ).toEqual(expected)

  expect(
    parse(`"id","name"
  // comment 1
  // comment 2
  2,"joe"
  3,"sarah"`)
  ).toEqual(expected)

  expect(
    parse(`"id","name" // comment 1
  2,"joe" // comment 2
  3,"sarah"  // comment 3`)
  ).toEqual(expected)

  expect(
    parse(`// comment 1
      "id","name"
      2,"joe"
      3,"sarah"`)
  ).toEqual(expected)
})

test('parse a block comment', () => {
  const expected = { key: 'value' }

  expect(
    parse(`{
    /* multi
       line
       comment */ 
    "key": "value"
  }`)
  ).toEqual(expected)

  expect(
    parse(`/* multi
    line
    comment */ 
  {
    "key": "value"
  }`)
  ).toEqual(expected)

  expect(
    parse(`/* block comment 1 */
  /* block comment 2 */
  {
    "key": "value"
  }`)
  ).toEqual(expected)
})

test('parse a block comment inside a table', () => {
  const expected = [
    { id: 2, name: 'joe' },
    { id: 3, name: 'sarah' }
  ]

  expect(
    parse(`"id","name"
  /* multi
     line
     comment */
  2,"joe"
  3,"sarah"`)
  ).toEqual(expected)

  expect(
    parse(`"id","name"  /* multi
     line
     comment */
  2,"joe"
  3,"sarah"`)
  ).toEqual(expected)

  expect(
    parse(`/* multi
  line
  comment */
  "id","name"
  2,"joe"
  3,"sarah"`)
  ).toEqual(expected)

  expect(
    parse(`/* block comment 1 */
  /* block comment 2 */
  "id","name"
  2,"joe"
  3,"sarah"`)
  ).toEqual(expected)
})

test('parse trailing comma in an object', function () {
  expect(parse('{"a": 2,"b":3,}')).toEqual({ a: 2, b: 3 })
  expect(parse('{"a": 2,"b":3 , }')).toEqual({ a: 2, b: 3 })
})

test('parse trailing comma in an array', function () {
  expect(parse('[1,2,3,]')).toEqual([1, 2, 3])
  expect(parse('[1,2,3 , ]')).toEqual([1, 2, 3])
})

test('parse an empty array', () => {
  expect(parse('[]')).toEqual([])
})

test('throw an error in case of a trailing comma in an empty array', () => {
  expect(() => parse('[,]')).toThrow("Array item expected but got ','")
})

test('parse an empty object', () => {
  expect(parse('{}')).toEqual({})
})

test('throw an error in case of a trailing comma in an empty object', () => {
  expect(() => parse('{,}')).toThrow("Quoted object key expected but got ','")
})

/**
 * Usage:
 *
 *   getAbsolutePath(import.meta.url)
 *   getAbsolutePath(import.meta.url, '../package.json')
 *   getAbsolutePath(import.meta.url, '..' , 'package.json')
 *
 * Source: https://github.com/ivangabriele/esm-path
 */
export function getAbsolutePath(importMetaUrl: string, ...relativePaths: string[]): string {
  const importMetaPath = fileURLToPath(importMetaUrl)
  const importMetaDirectoryPath = dirname(importMetaPath)
  return join(importMetaDirectoryPath, ...relativePaths)
}
