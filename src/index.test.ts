import { test, expect } from 'vitest'
import { parse, stringify } from './index'

test('use parse', () => {
  expect(parse('[1,2,3]')).toEqual([1, 2, 3])
})

test('use stringify', () => {
  expect(stringify([1, 2, 3])).toEqual('[1,2,3]')
})
