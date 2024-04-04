import { test, expect } from 'vitest'
import { stringify } from './stringify'

test('stringify', function () {
  expect(stringify(undefined)).toEqual('')
  expect(stringify(function () {})).toEqual('')
  expect(stringify(Symbol('test'))).toEqual('')

  expect(stringify(null)).toEqual('null')

  expect(stringify(true)).toEqual('true')
  expect(stringify(false)).toEqual('false')

  expect(stringify(2.3)).toEqual('2.3')
  expect(stringify(-2.3)).toEqual('-2.3')
  expect(stringify(Infinity)).toEqual('null')
  expect(stringify(NaN)).toEqual('null')

  expect(stringify('str')).toEqual('str')
  expect(stringify('"')).toEqual('"\\""')
  expect(stringify('\\')).toEqual('"\\\\"')
  expect(stringify('\b')).toEqual('"\\b"')
  expect(stringify('\f')).toEqual('"\\f"')
  expect(stringify('\n')).toEqual('"\\n"')
  expect(stringify('\r')).toEqual('"\\r"')
  expect(stringify('\t')).toEqual('"\\t"')
  expect(stringify('"\\/\b\f\n\r\t')).toEqual('"\\"\\\\/\\b\\f\\n\\r\\t"')

  // validate expected outcome against native JSON.stringify
  expect(JSON.stringify('"\\/\b\f\n\r\t')).toEqual('"\\"\\\\/\\b\\f\\n\\r\\t"')

  expect(stringify(new Date('2016-02-08T14:00:00Z'))).toEqual('"2016-02-08T14:00:00.000Z"')

  expect(
    stringify([
      2,
      'str',
      null,
      undefined,
      true,
      function () {
        console.log('test')
      }
    ])
  ).toEqual('[2,str,null,null,true,null]')

  expect(
    stringify({
      a: 2,
      b: 'str',
      c: null,
      d: undefined,
      e: function () {
        console.log('test')
      }
    })
  ).toEqual('{a:2,b:str,c:null}')

  expect(stringify({ '\\\\d': 1 })).toEqual('{"\\\\\\\\d":1}')

  // validate exepected outcome against native JSON.stringify
  expect(JSON.stringify({ '\\\\d': 1 })).toEqual('{"\\\\\\\\d":1}')

  expect(
    stringify({
      a: 2,
      toJSON: function () {
        return 'foo'
      }
    })
  ).toEqual('foo')

  // TODO: Symbol
  // TODO: ignore non-enumerable properties
})

test('stringify a full JSON object', function () {
  const expected = '{a:123,b:str,c:null,d:false,e:[1,2,3]}'
  const json = { a: 123, b: 'str', c: null, d: false, e: [1, 2, 3] }

  const stringified = stringify(json)

  expect(stringified).toEqual(expected)
})

test('stringify a table without indentation', function () {
  const json = [
    { id: 2, name: 'joe' },
    { id: 3, name: 'sarah' }
  ]

  expect(stringify(json)).toEqual('~id,name\n~2,joe\n~3,sarah')
})

test('stringify a table with indentation', function () {
  const json = [
    { id: 2, name: 'joe' },
    { id: 3, name: 'sarah' }
  ]

  expect(stringify(json, { indentation: 2 })).toEqual('~ id, name\n~ 2, joe\n~ 3, sarah')
})

test('stringify a nested table', function () {
  const json = {
    name: 'rob',
    hobbies: ['swimming', 'biking'],
    friends: [
      { id: 2, name: 'joe' },
      { id: 3, name: 'sarah' }
    ]
  }

  // FIXME: should not insert a space after friends:
  expect(stringify(json, { indentation: 2 })).toEqual(`{
  name: rob,
  hobbies: [
    swimming,
    biking
  ],
  friends: 
    ~ id, name
    ~ 2, joe
    ~ 3, sarah
}`)
})

test('stringify a nested table with nested objects', function () {
  const json = {
    name: 'rob',
    hobbies: ['swimming', 'biking'],
    friends: [
      { id: 2, name: 'joe', address: { city: 'New York', street: '1st Ave' } },
      { id: 3, name: 'sarah', address: { city: 'Washington', street: '18th Street NW' } }
    ]
  }

  expect(stringify(json, { indentation: 2 })).toEqual(`{
  name: rob,
  hobbies: [
    swimming,
    biking
  ],
  friends: 
    ~ id, name, address.city, address.street
    ~ 2, joe, New York, "1st Ave"
    ~ 3, sarah, Washington, "18th Street NW"
}`)
})

test('stringify a nested table with non-homogeneous content', function () {
  const json = {
    name: 'rob',
    friends: [
      { id: 2, name: 'joe', details: { city: 'New York' } },
      { id: 3, name: 'sarah', age: 32, details: {} }
    ]
  }

  expect(stringify(json, { indentation: 2 })).toEqual(`{
  name: rob,
  friends: 
    ~ id, name, details.city, age
    ~ 2, joe, New York, 
    ~ 3, sarah, , 32
}`)
})

test('stringify a nested table with nested arrays', function () {
  const json = {
    name: 'rob',
    friends: [
      { id: 2, name: 'joe', scores: [7.2, 6.1, 8.1] },
      { id: 3, name: 'sarah', scores: [7.7] }
    ]
  }

  expect(stringify(json, { indentation: 2 })).toEqual(`{
  name: rob,
  friends: 
    ~ id, name, scores
    ~ 2, joe, [7.2,6.1,8.1]
    ~ 3, sarah, [7.7]
}`)
})

test('stringify Date', function () {
  expect(stringify([new Date('2022-08-25T09:39:19.288Z')])).toEqual('["2022-08-25T09:39:19.288Z"]')
})

test('stringify with numeric space', function () {
  const json: unknown = { a: 1, b: [1, 2, null, undefined, { c: 3 }], d: null }

  const expected =
    '{\n' +
    '  a: 1,\n' +
    '  b: [\n' +
    '    1,\n' +
    '    2,\n' +
    '    null,\n' +
    '    null,\n' +
    '    {\n' +
    '      c: 3\n' +
    '    }\n' +
    '  ],\n' +
    '  d: null\n' +
    '}'

  expect(stringify(json, { indentation: 2 })).toEqual(expected)
})

test('stringify with string space', function () {
  const json: unknown = { a: 1, b: [1, 2, null, undefined, { c: 3 }], d: null }

  const expected =
    '{\n' +
    '~a: 1,\n' +
    '~b: [\n' +
    '~~1,\n' +
    '~~2,\n' +
    '~~null,\n' +
    '~~null,\n' +
    '~~{\n' +
    '~~~c: 3\n' +
    '~~}\n' +
    '~],\n' +
    '~d: null\n' +
    '}'

  expect(stringify(json, { indentation: '~' })).toEqual(expected)
})

test('stringify an empty array', function () {
  expect(stringify([], { indentation: 2 })).toEqual('[]')
  expect(stringify([], { indentation: '    ' })).toEqual('[]')
})

test('stringify an empty object', function () {
  expect(stringify({}, { indentation: 2 })).toEqual('{}')
  expect(stringify({}, { indentation: '    ' })).toEqual('{}')
})
