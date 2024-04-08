import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, test, expect } from 'vitest'
import peggy from 'peggy'
import { parse } from './parse'

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
  const tabularJsonGrammer = String(
    readFileSync(getAbsolutePath(import.meta.url, './grammers/tabular-json.pegjs'))
  )
  const { parse } = peggy.generate(tabularJsonGrammer)

  test('parse JSON', () => {
    // FIXME: add extensive JSON unit tests

    expect(parse('"success"')).toEqual('success')
    expect(parse('23.4')).toEqual(23.4)
    expect(parse('true')).toEqual(true)
    expect(parse('false')).toEqual(false)
    expect(parse('null')).toEqual(null)

    const jsonStr = '{"a":123,"b":"str","c":null,"d":false,"e":[1,2,3]}'
    const json = { a: 123, b: 'str', c: null, d: false, e: [1, 2, 3] }

    expect(parse(jsonStr)).toEqual(json)
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

test.skip('parse a root table without return at the end', () => {
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

test('use the generated parser', () => {
  expect(parse('[1,2,3]')).toEqual([1, 2, 3])
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
