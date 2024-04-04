import { test, expect } from 'vitest'
import {stringify} from "./stringify";

test('stringify', function () {
  expect(stringify(undefined)).toEqual("FOO")
})
