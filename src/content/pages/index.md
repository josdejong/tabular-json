---
title: 'Tabular-JSON: JSON with tables'
description: 'The data format Tabular-JSON is a superset of JSON, adding CSV-like tables'
---

## What is Tabular-JSON?

Tabular-JSON is a data format. It is a superset of JSON, adding CSV-like tables. It is:

- A replacement for CSV without its ambiguities and limitation of tabular data structures
- A replacement for JSON without its verbosity with tabular data

Real world JSON data often consists of an array with nested objects like a list of products, a list of messages, or a list of clients. This is verbose to write in JSON because all field names are repeated for every item in the array. This common data structure can be written much more compact in a tabular way, like CSV. Adding support for tables in a superset of JSON gives the best of both worlds.

Tabular-JSON aims to be just as simple as JSON and CSV. It combines the best of JSON and CSV, but without their drawbacks. It is human-readable, compact, and supports rich data structures and streaming. The aim of Tabular-JSON is to be a data format, not a configuration format.

Read ["Tabular-JSON: Combining the best of JSON and CSV"](https://jsoneditoronline.org/indepth/specification/tabular-json/) to learn more about the background of Tabular-JSON.

## Playground

Play around with Tabular-JSON in the interactive playground:

<p>
  <a href="/playground" class="action-button">
    Try Tabular-JSON Online
  </a>
</p>

## Example

Here is an example of Tabular-JSON data:

<pre><code>{
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
</code></pre>

And here a table at root level (the rows are streamable):

<pre><code>"id", "name",  "address"."city", "address"."street"
2,    "joe",   "New York",       "1st Ave"
3,    "sarah", "Washington",     "18th Street NW"
</code></pre>

## Ingredients

So what are the ingredients of Tabular-JSON?

- Take JSON.
- Add support for CSV-like tables. Nested tables are wrapped in a `---` block. Tables supports nested fields.
- Add support for trailing commas to make it more streaming-friendly.
- Add support for positive infinity (`inf`), negative infinity (`-inf`), and `nan`.
- Add support for line comments (`// ...`) and block comments (`/* ... */`).

And that's it. The complexity of the Tabular-JSON data format is equal to that of JSON plus CSV.

The grammer of `Tabular-JSON` can be found on the [`Specification`](/specification) page, alongside the grammer of JSON for comparison.

## Features

- Human-readable (text based)
- Simple (like JSON and CSV)
- Unambiguous (unlike CSV)
- Rich nested data structures (like JSON)
- Compact (like CSV, unlike JSON which is quite verbose)
- Streaming (like CSV and NDJSON)
- Easy to parse and stringify
- Easy to edit manually
- A superset of JSON
- Beautifiable

## Data types

Tabular-JSON supports the following data types:

| Data type  | Example                                                                     | Detection                                                                                                        |
| ---------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| object     | `{ "name": "Joe", "age": 24 }`                                              | Starts with `{`                                                                                                  |
| array      | `[7.4, 5.2, 8.1]`                                                           | Starts with `[`                                                                                                  |
| table      | <pre>---<br>`"id","name"`<br/>`1018,"Joe"`<br/>`1078,"Sarah"`<br/>---</pre> | Starts with `---`                                                                                                |
| root table | <pre>`"id","name"`<br/>`1018,"Joe"`<br/>`1078,"Sarah"`</pre>                | Starts with a string followed by a comma and another string, or a string followed by a newline and another value |
| boolean    | `true`                                                                      | Equals `true` or `false`                                                                                         |
| null       | `null`                                                                      | Equals `null`                                                                                                    |
| number     | `-2.3e5`                                                                    | Starts with a digit or a minus                                                                                   |
| string     | `"hello world"`                                                             | Starts with `"`                                                                                                  |

## Differences between JSON and Tabular-JSON

- JSON supports the following data types: object, array, string, number, boolean, null. Tabular-JSON supports an addition data type: table.
- Unlike JSON, Tabular-JSON supports the numeric values positive infinity (`inf`), negative infinity (`-inf`), and `nan`.
- Unlike JSON, Tabular-JSON supports trailing commas in objects and arrays.

Remarks:

- All JSON is valid Tabular-JSON.
- Tabular-JSON is valid JSON when tables are disabled.

## Differences between CSV and Tabular-JSON

| Feature                                  | CSV                                                                        | Tabular-JSON                                        |
| ---------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------- |
| Table header                             | Optional                                                                   | Required                                            |
| Nested header fields                     | Not officially supported                                                   | Multiple names separated by a dot                   |
| Double quotes                            | Precede by an extra double quote `""`                                      | Escape with a backslash `\"`                        |
| Delimiter                                | Comma (officially). In practice, it can sometimes be a semicolon or tab    | Comma                                               |
| White space around values                | Part of the value, not allowed when the value is enclosed in double quotes | Not part of the value                               |
| Data types                               | No data types                                                              | object, array, table, string, number, boolean, null |
| Text value                               | Optionally enclosed in double quotes                                       | Must be escaped enclosed by double quotes           |
| Control character                        | No need to escape                                                          | Escape with a backslash                             |
| Unicode characters                       | Not officially supported (only ASCII characters are supported officially)  | Supported                                           |
| Escaped unicode characters like `\u263A` | Not supported                                                              | Supported                                           |

Remarks:

- There are quite some different CSV variants, and these variants can be incompatible with each other. All these ambiguities are the main reason making it difficult to work with CSV: it is simple but not well standardized.
- The control characters are: `\"`, `\\`, `\/`, `\b`, `\f`, `\n`, `\r`, `\t`.
- It can a Tabular-JSON file containing tabular data may look the same as a CSV file with the same data. Still, they are _not_ compatible because of the differences in escaping.

## Differences between NDJSON and Tabular-JSON

Tabular-JSON can be used to stream data, but in general it isn't a suitable replacement for NDJSON. NDJSON is often used to write log files. The reason NDJSON is popular is that allows to write structured data line by line, without the need to maintain a fixed data structure or write header data or whatever. Each line is a standalone JSON document. This makes it very robust and flexible. Writing Tabular-JSON in a streaming way requires a fixed data structure and requires writing a header line on top of the file. Using Tabular-JSON will result in smaller files, since the field names are not repeated every line. So if the data size is important and you have a fixed data structure, Tabular-JSON can be a good alternative to NDJSON.

## Best practices

1. You can safely use a Tabular-JSON parser to read both JSON and Tabular-JSON data. When writing data, the output will all become Tabular-JSON though, except when the parser supports disabling tables. Typically, you can use this feature to smoothly migrate from JSON to Tabular-JSON.
2. Always use a CSV parser to parse CSV data. Do not use a Tabular-JSON parser to parse CSV data, even when the data looks like valid Tabular-JSON or the other way around. There are tricky edge cases around escaping (see the differences section).

## Status

The data format has to be implemented in a couple of languages (like JavaScript, Python, and Kotlin) and published so people can actually use the format. Plugins has to be written for IDE's like VS Code and Intellij to get syntax highlighting.

## References

- Standards:
  - JSON: <https://www.json.org/>
  - CSV: <https://www.rfc-editor.org/rfc/rfc4180>
  - NDJSON: <https://github.com/ndjson/ndjson-spec>
- Alternatives:
  - <https://jsoneditoronline.org/indepth/compare/json-alternatives-for-data/>
  - <https://jsoneditoronline.org/indepth/compare/json-alternatives-for-configuration-files/>
