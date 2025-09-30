import { describe, expect, test } from 'vitest'
import { collectNestedPaths } from './fields.ts'

describe('collectNestedPaths', () => {
  test('should collect all nested paths', () => {
    expect(collectNestedPaths([{}])).toEqual([])
    expect(collectNestedPaths([{ '': 1 }])).toEqual([['']])
    expect(collectNestedPaths([{ a: 1 }, { b: 2 }])).toEqual([['a'], ['b']])
    expect(collectNestedPaths([{ a: 1 }, { nested: { b: 2 } }])).toEqual([['a'], ['nested', 'b']])
    expect(collectNestedPaths([{ a: 1 }, { a: { nested: 2 } }])).toEqual([['a']])
    expect(collectNestedPaths([{ a: { nested: 2 } }, { a: 1 }])).toEqual([['a']])
    expect(collectNestedPaths([{ a: [1, 2, 3] }])).toEqual([['a']])
    expect(collectNestedPaths([{ a: [{ b: 2 }] }])).toEqual([['a']])
  })
})
