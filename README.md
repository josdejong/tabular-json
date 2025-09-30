# Tabular-JSON: JSON with tables

Tabular-JSON is:

- a replacement for CSV without its ambiguities and limitation to tabular data structures
- a replacement for JSON without its verbosity with tabular data

Learn more:

- Website: <https://tabular-json.org/>
- Playground: <https://tabular-json.org/playground>
- Background article: <https://jsoneditoronline.org/indepth/specification/tabular-json/>

Here is an example of Tabular-JSON:

```
{
  "name": "rob",
  "hobbies": [
    "swimming",
    "biking",
  ],
  "friends": ---
    "id", "name",  "address"."city", "address"."street"
    2,    "joe",   "New York",       "1st Ave"
    3,    "sarah", "Washington",     "18th Street NW"
  ---,
  "address": {
    "city": "New York",
    "street": "1st Ave",
  }
}
```

## JavaScript API

Install using npm:

```
npm install @josdejong/tabular-json
```

Usage:

```js
import { parse, stringify } from '@tabular-json/tabular-json'

const text = `{
  "id": 1,
  "name": "Brandon",
  "friends": ---
    "id", "name"
    2,    "Joe"
    3,    "Sarah"
  ---
}`

const data = parse(text)

data.friends.push({ id: 4, name: 'Alan' })

const updatedText = stringify(data, {
  indentation: 2,
  trailingCommas: false
})
// {
//   "id": 1,
//   "name": "Brandon",
//   "friends": ---
//     "id", "name"
//     2,    "Joe"
//     3,    "Sarah"
//     4,    "Alan"
//   ---
// }
```

API:

```ts
type parse = (text: string) => unknown

type stringify = (json: unknown, options?: StringifyOptions) => string

interface StringifyOptions {
  indentation?: number | string
  trailingCommas?: boolean
}
```
