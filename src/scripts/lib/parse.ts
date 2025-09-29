/**
 * Parse a string containing Tabular-JSON.
 *
 * The parser is based on the lossless-json parser https://github.com/josdejong/lossless-json
 *
 * @param text
 * The string to parse as JSON. See the JSON object for a description of JSON syntax.
 *
 * @returns Returns the Object corresponding to the given Tabular-JSON text.
 *
 * @throws Throws a SyntaxError exception if the string to parse is not valid Tabular-JSON.
 */
export function parse(text: string): unknown {
  let i = 0
  const value = parseValue()
  expectValue(value)
  expectEndOfInput()

  return value

  function parseObject(): Record<string, unknown> | undefined {
    if (text.charCodeAt(i) === codeOpeningBrace) {
      i++
      skipWhitespace()

      const object: Record<string, unknown> = {}
      let initial = true
      while (i < text.length && text.charCodeAt(i) !== codeClosingBrace) {
        if (!initial) {
          eatComma()
          skipWhitespace()

          if (text.charCodeAt(i) === codeClosingBrace) {
            // trailing comma
            break
          }
        } else {
          initial = false
        }

        const start = i

        const key = parseString()
        if (key === undefined) {
          throwObjectKeyExpected()
          return // To make TS happy
        }

        skipWhitespace()
        eatColon()
        const value = parseValue()

        if (value === undefined) {
          throwObjectValueExpected()
          return // To make TS happy
        }

        // biome-ignore lint/suspicious/noPrototypeBuiltins: TODO: replace with hasOwn one day, when browser support is high enough
        if (Object.prototype.hasOwnProperty.call(object, key) && !isDeepEqual(value, object[key])) {
          // Note that we could also test `if(key in object) {...}`
          // or `if (object[key] !== 'undefined') {...}`, but that is slower.
          throwDuplicateKey(key, start + 1)
        }

        object[key] = value
      }

      if (text.charCodeAt(i) !== codeClosingBrace) {
        throwObjectKeyOrEndExpected()
      }
      i++

      return object
    }
  }

  function parseArray(): Array<unknown> | unknown {
    if (text.charCodeAt(i) === codeOpeningBracket) {
      i++
      skipWhitespace()

      const array = []
      let initial = true
      while (i < text.length && text.charCodeAt(i) !== codeClosingBracket) {
        if (!initial) {
          eatComma()
          skipWhitespace()

          if (text.charCodeAt(i) === codeClosingBracket) {
            // trailing comma
            break
          }
        } else {
          initial = false
        }

        const value = parseValue()
        expectArrayItem(value)
        array.push(value)
      }

      if (text.charCodeAt(i) !== codeClosingBracket) {
        throwArrayItemOrEndExpected()
      }
      i++

      return array
    }
  }

  function parseValue(): unknown {
    skipWhitespace()

    const value =
      parseString() ??
      parseNumber() ??
      parseObject() ??
      parseArray() ??
      parseKeyword('true', true) ??
      parseKeyword('false', false) ??
      parseKeyword('null', null)

    skipWhitespace()

    return value
  }

  function parseKeyword(name: string, value: unknown): unknown | undefined {
    if (text.slice(i, i + name.length) === name) {
      i += name.length
      return value
    }
  }

  function skipWhitespace() {
    while (skipWhitespaceChars() || skipLineComment() || skipBlockComment()) {
      // repeat until no more whitespace or
    }
  }

  function skipWhitespaceChars() {
    if (isWhitespace(text.charCodeAt(i))) {
      i++

      while (isWhitespace(text.charCodeAt(i))) {
        i++
      }

      return true
    }

    return false
  }

  function skipLineComment(): boolean {
    // skip a line comment like "// ..."
    if (text.charCodeAt(i) === codeSlash && text.charCodeAt(i + 1) === codeSlash) {
      i += 2

      while (text.charCodeAt(i) !== codeNewline) {
        i++
      }
      i++

      return true
    }

    return false
  }

  function skipBlockComment(): boolean {
    // skip a block comment like "/* ... */"
    if (text.charCodeAt(i) === codeSlash && text.charCodeAt(i + 1) === codeAsterisk) {
      i += 2

      while (text.charCodeAt(i) !== codeAsterisk || text.charCodeAt(i + 1) !== codeSlash) {
        i++
      }
      i += 2

      return true
    }

    return false
  }

  function parseString() {
    if (text.charCodeAt(i) === codeDoubleQuote) {
      i++
      let result = ''
      while (i < text.length && text.charCodeAt(i) !== codeDoubleQuote) {
        if (text.charCodeAt(i) === codeBackslash) {
          const char = text[i + 1]
          const escapeChar = escapeCharacters[char]
          if (escapeChar !== undefined) {
            result += escapeChar
            i++
          } else if (char === 'u') {
            if (
              isHex(text.charCodeAt(i + 2)) &&
              isHex(text.charCodeAt(i + 3)) &&
              isHex(text.charCodeAt(i + 4)) &&
              isHex(text.charCodeAt(i + 5))
            ) {
              result += String.fromCharCode(Number.parseInt(text.slice(i + 2, i + 6), 16))
              i += 5
            } else {
              throwInvalidUnicodeCharacter(i)
            }
          } else {
            throwInvalidEscapeCharacter(i)
          }
        } else {
          if (isValidStringCharacter(text.charCodeAt(i))) {
            result += text[i]
          } else {
            throwInvalidCharacter(text[i])
          }
        }
        i++
      }
      expectEndOfString()
      i++
      return result
    }
  }

  function parseNumber() {
    const start = i

    const special =
      parseKeyword('inf', Infinity) ?? parseKeyword('-inf', -Infinity) ?? parseKeyword('nan', NaN)
    if (special !== undefined) {
      return special
    }

    if (text.charCodeAt(i) === codeMinus) {
      i++
      expectDigit(start)
    }

    if (text.charCodeAt(i) === codeZero) {
      i++
    } else if (isNonZeroDigit(text.charCodeAt(i))) {
      i++
      while (isDigit(text.charCodeAt(i))) {
        i++
      }
    }

    if (text.charCodeAt(i) === codeDot) {
      i++
      expectDigit(start)
      while (isDigit(text.charCodeAt(i))) {
        i++
      }
    }

    if (text.charCodeAt(i) === codeLowercaseE || text.charCodeAt(i) === codeUppercaseE) {
      i++
      if (text.charCodeAt(i) === codeMinus || text.charCodeAt(i) === codePlus) {
        i++
      }
      expectDigit(start)
      while (isDigit(text.charCodeAt(i))) {
        i++
      }
    }

    if (i > start) {
      return parseFloat(text.slice(start, i))
    }
  }

  function eatComma() {
    if (text.charCodeAt(i) !== codeComma) {
      throw new SyntaxError(`Comma ',' expected after value ${gotAt()}`)
    }
    i++
  }

  function eatColon() {
    if (text.charCodeAt(i) !== codeColon) {
      throw new SyntaxError(`Colon ':' expected after property name ${gotAt()}`)
    }
    i++
  }

  function expectValue(value: unknown) {
    if (value === undefined) {
      throw new SyntaxError(`JSON value expected ${gotAt()}`)
    }
  }

  function expectArrayItem(value: unknown) {
    if (value === undefined) {
      throw new SyntaxError(`Array item expected ${gotAt()}`)
    }
  }

  function expectEndOfInput() {
    if (i < text.length) {
      throw new SyntaxError(`Expected end of input ${gotAt()}`)
    }
  }

  function expectDigit(start: number) {
    if (!isDigit(text.charCodeAt(i))) {
      const numSoFar = text.slice(start, i)
      throw new SyntaxError(`Invalid number '${numSoFar}', expecting a digit ${gotAt()}`)
    }
  }

  function expectEndOfString() {
    if (text.charCodeAt(i) !== codeDoubleQuote) {
      throw new SyntaxError(`End of string '"' expected ${gotAt()}`)
    }
  }

  function throwObjectKeyExpected() {
    throw new SyntaxError(`Quoted object key expected ${gotAt()}`)
  }

  function throwDuplicateKey(key: string, pos: number) {
    throw new SyntaxError(`Duplicate key '${key}' encountered at position ${pos}`)
  }

  function throwObjectKeyOrEndExpected() {
    throw new SyntaxError(`Quoted object key or end of object '}' expected ${gotAt()}`)
  }

  function throwArrayItemOrEndExpected() {
    throw new SyntaxError(`Array item or end of array ']' expected ${gotAt()}`)
  }

  function throwInvalidCharacter(char: string) {
    throw new SyntaxError(`Invalid character '${char}' ${pos()}`)
  }

  function throwInvalidEscapeCharacter(start: number) {
    const chars = text.slice(start, start + 2)
    throw new SyntaxError(`Invalid escape character '${chars}' ${pos()}`)
  }

  function throwObjectValueExpected() {
    throw new SyntaxError(`Object value expected after ':' ${pos()}`)
  }

  function throwInvalidUnicodeCharacter(start: number) {
    const chars = text.slice(start, start + 6)
    throw new SyntaxError(`Invalid unicode character '${chars}' ${pos()}`)
  }

  // zero based character position
  function pos(): string {
    return `at position ${i}`
  }

  function got(): string {
    return i < text.length ? `but got '${text[i]}'` : 'but reached end of input'
  }

  function gotAt(): string {
    return `${got()} ${pos()}`
  }
}

function isWhitespace(code: number): boolean {
  return code === codeSpace || code === codeNewline || code === codeTab || code === codeReturn
}

function isHex(code: number): boolean {
  return (
    (code >= codeZero && code <= codeNine) ||
    (code >= codeUppercaseA && code <= codeUppercaseF) ||
    (code >= codeLowercaseA && code <= codeLowercaseF)
  )
}

function isDigit(code: number): boolean {
  return code >= codeZero && code <= codeNine
}

function isNonZeroDigit(code: number): boolean {
  return code >= codeOne && code <= codeNine
}

export function isValidStringCharacter(code: number): boolean {
  return code >= 0x20 && code <= 0x10ffff
}

export function isDeepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => isDeepEqual(item, b[index]))
  }

  if (isObject(a) && isObject(b)) {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])]
    return keys.every((key) => isDeepEqual(a[key], b[key]))
  }

  return false
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// map with all escape characters
const escapeCharacters: Record<string, string> = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t'
  // note that \u is handled separately in parseString()
}

const codeBackslash = 0x5c // "\"
const codeSlash = 0x2f // "/"
const codeAsterisk = 0x2a // "*"
const codeOpeningBrace = 0x7b // "{"
const codeClosingBrace = 0x7d // "}"
const codeOpeningBracket = 0x5b // "["
const codeClosingBracket = 0x5d // "]"
const codeSpace = 0x20 // " "
const codeNewline = 0xa // "\n"
const codeTab = 0x9 // "\t"
const codeReturn = 0xd // "\r"
const codeDoubleQuote = 0x0022 // "
const codePlus = 0x2b // "+"
const codeMinus = 0x2d // "-"
const codeZero = 0x30
const codeOne = 0x31
const codeNine = 0x39
const codeComma = 0x2c // ","
const codeDot = 0x2e // "." (dot, period)
const codeColon = 0x3a // ":"
export const codeUppercaseA = 0x41 // "A"
export const codeLowercaseA = 0x61 // "a"
export const codeUppercaseE = 0x45 // "E"
export const codeLowercaseE = 0x65 // "e"
export const codeUppercaseF = 0x46 // "F"
export const codeLowercaseF = 0x66 // "f"
