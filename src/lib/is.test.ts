import { expect, test } from 'vitest'
import { isObject } from './is.ts'

class CustomClass {
  name: string

  constructor(name: string) {
    this.name = name
  }
}
const customClass = new CustomClass('foo')

test('isObject', () => {
  expect(isObject({})).toBe(true)
  expect(isObject(null)).toBe(false)
  expect(isObject('text')).toBe(false)
  expect(isObject(42)).toBe(false)
  expect(isObject([])).toBe(false)
  expect(isObject(new Date())).toBe(false)
  expect(isObject(customClass)).toBe(false)
})
