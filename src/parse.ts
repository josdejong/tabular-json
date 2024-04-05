import { parse as _parse } from './grammers/generated/tabular-json-parser.js'

export function parse(text: string): unknown {
  return _parse(text)
}
