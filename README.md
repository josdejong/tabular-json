# Tabular-JSON: JSON with tables

Tabular-JSON a superset of JSON, adding support for CSV-like tables. It will look familiar to anyone that knows JSON and CSV. Tabular-JSON aims to be just as simple as JSON and CSV, combining the best of JSON, CSV, and NDJSON, but without the drawbacks. Note that JSON is used both for data and for configuration files. The aim of Tabular-JSON though is to be used as a data format, not a configuration format.

Tabular-JSON is:

- a replacement for CSV without its ambiguities and limitation to tabular data structures
- a replacement for JSON without its verbosity
- a replacement for NDJSON without its verbosity

Here an example of Tabular-JSON:

```
{
  name: rob,
  hobbies: [
    swimming,
    biking
  ],
  friends: ---
    id, name, address.city, address.street
    2, joe, New York, "1st Ave"
    3, sarah, Washington, "18th Street NW"
  ---,
  address: {
    city: New York,
    street: "1st Ave"
  }
}
```

So what are the ingredients of Tabular-JSON?

- Take JSON
- Make quotes around keys and strings optional
- Add support for CSV-like tables wrapped in a `---` block
- Add support for ISO dates

And that's it. The complexity of the Tabular-JSON data format is equal to that of JSON plus CSV.

The grammer of `Tabular-JSON` can be found in the folder [`./specification`](/specification), alongside the grammer of JSON for comparison.

## Data types

Tabular-JSON supports the following data types:

| Data type | Example                                                                    | Detection                                                                           |
| --------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| object    | `{ name: Joe, age: 24 }`                                                   | Starts with `{`                                                                     |
| array     | `[7.4, 5.2, 8.1]`                                                          | Starts with `[`                                                                     |
| table     | <pre><code>---<br>id,name<br/>1018,Joe<br/>1078,Sarah<br/>---</code></pre> | Starts with `---`                                                                   |
| boolean   | `true`                                                                     | Equals `true` or `false`                                                            |
| null      | `null`                                                                     | Equals `null`                                                                       |
| date      | `2024-04-05T07:49:41.501Z`                                                 | Matches the regex pattern `\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z`          |
| number    | `-2.3e5`                                                                   | Starts with a digit or a minus followed by a digit                                  |
| string    | `hello world`<br>`"hello world"`                                           | Not matching any of the other data types. Can be either a quoted or unquoted string |

## Differences between JSON and Tabular-JSON

| Feature                               | JSON                                         | Tabular-JSON                                              |
| ------------------------------------- | -------------------------------------------- | --------------------------------------------------------- |
| Double quotes around keys and strings | Required                                     | Optional                                                  |
| Table structure                       | Not supported                                | Supported                                                 |
| Data types                            | object, array, string, number, boolean, null | object, array, table, string, number, date, boolean, null |

Remarks:

- All JSON is valid Tabular-JSON.
- Tabular-JSON is valid JSON when tables and optional double quotes are disabled.
- In Tabular-JSON, double quotes around keys and strings are required when the string:
  - contains a dot comma, or control character (`\"`, `\\`, `\/`, `\b`, `\f`, `\n`, `\r`, `\t`).
  - starts or ends with whitespace.
  - starts with a digit or minus.

## Differences between CSV and Tabular-JSON

| Feature                                 | CSV                                                                        | Tabular-JSON                                              |
| --------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------- |
| Table header                            | Optional                                                                   | Required                                                  |
| Nested header fields                    | Not officially supported                                                   | Multiple names separated by a dot                         |
| Double quotes                           | Preceed by an extra double quote `""`                                      | Escape with a backslash `\"`                              |
| Delimiter                               | Comma (officially). In practice, it can sometimes be a semicolon or tab    | Comma                                                     |
| White space around values               | Part of the value, not allowed when the value is enclosed in double quotes | Not part of the value                                     |
| Data types                              | No data types                                                              | object, array, table, string, number, date, boolean, null |
| Control character                       | No need to escape                                                          | Escape with a backslash                                   |
| Unicode characters                      | Not officially supported (only ASCII characters are supported officially)  | Supported                                                 |
| Escaped unicode characters like `\u...` | Not supported                                                              | Supported                                                 |

Remarks:

- There are quite some different CSV variants, and these variants can be incompatible with each other. All these ambiguities are the main reason making it difficult to work with CSV: it is simple but not well standardized.
- The control characters are: `\"`, `\\`, `\/`, `\b`, `\f`, `\n`, `\r`, `\t`.
- It can a Tabular-JSON file containing tabular data may look the same as a CSV file with the same data. Still, they are _not_ compatible because of the differences in escaping.

## Best practices

1. You can safely use a Tabular-JSON parser to read both JSON and Tabular-JSON data. When writing data, the output will all become Tabular-JSON though, except when the parser supports disabling optional quotes and tables. Typically, you can use this feature to smoothly migrate from JSON to Tabular-JSON.
2. Always use a CSV parser to parse CSV data. Do not use a Tabular-JSON parser to parse CSV data, even when the data looks like valid Tabular-JSON or the other way around. There are tricky edge cases around escaping (see the differences section).

## References

- Standards:
  - JSON: https://www.json.org/
  - CSV: https://www.rfc-editor.org/rfc/rfc4180
  - NDJSON: https://github.com/ndjson/ndjson-spec
  - JSONPointer: https://www.rfc-editor.org/rfc/rfc6901
