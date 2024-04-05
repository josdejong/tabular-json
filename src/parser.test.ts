import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect } from 'vitest'
import peggy from 'peggy'

test('compile and use the JSON grammer', () => {
  // This test is just to verify that the JSON grammer and Peggy work as expected
  const jsonGrammer = String(
    readFileSync(getAbsolutePath(import.meta.url, './grammers/json.pegjs'))
  )
  const jsonParser = peggy.generate(jsonGrammer)

  const jsonStr = '{"a":123,"b":"str","c":null,"d":false,"e":[1,2,3]}'
  const json = { a: 123, b: 'str', c: null, d: false, e: [1, 2, 3] }

  expect(jsonParser.parse(jsonStr)).toEqual(json)
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
