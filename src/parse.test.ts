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
    const jsonStr = '{"a":123,"b":"str","c":null,"d":false,"e":[1,2,3]}'
    const json = { a: 123, b: 'str', c: null, d: false, e: [1, 2, 3] }

    expect(parse(jsonStr)).toEqual(json)
  })

  test('parse unquoted strings', () => {
    expect(parse('hello')).toEqual('hello')
    expect(parse('[ hello, world]')).toEqual(['hello', 'world'])
    expect(parse('[ hello, world ]')).toEqual(['hello', 'world'])
    expect(parse('[ hello world ]')).toEqual(['hello world'])

    // FIXME: test all special characters
  })

  test('parse unquoted keys', () => {
    expect(parse('{id: 1, message: hello world}')).toEqual({ id: 1, message: 'hello world' })
  })
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
