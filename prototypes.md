# Prototypes

Idea: a lightweight data format combining the best of JSON, CSV, and NDJSON.

## Introduction

JSON is a great data format. Reason for that is that it is so simple, unambiguous, and ubiquitous. However, it is not ideal. It is relatively verbose for tabular data. For tabular data, CSV is really a great data format because it is so simple and compact. Both JSON and CSV have their limitations. Can we come up with a new data format that combines the best of both JSON and CSV?

JSON is typically used for two very different purposes: for data and for configuration. In this experiment we’ll focus on a solution for data, not for configuration files. The latter requires a separate investigation, and of course we can come up with a solution that works well for both data and config (like InternetObject), however, such an all-in-one solution is most likely more complex than needed for "just" data purposes. We want to explore first what the needs are for a minimal data format.

## Inspiration

- Data formats
  - https://docs.internetobject.org/
  - https://github.com/superminority/jsv
- Articles:
  - https://jsoneditoronline.org/indepth/compare/json-alternatives-for-data/
  - https://jsoneditoronline.org/indepth/compare/json-alternatives-for-configuration-files/
  - https://jsoneditoronline.org/indepth/compare/json-vs-csv/
- Standards:
  - JSON: https://www.json.org/
  - CSV: https://www.rfc-editor.org/rfc/rfc4180
  - NDJSON: https://github.com/ndjson/ndjson-spec
  - JSONPointer: https://www.rfc-editor.org/rfc/rfc6901

## Requirements

Upsides of JSON

- Simple
- Unambiguous
- Ubiquitous
- Flexible data structures

Downsides of JSON:

- Verbose
  - Verbose for tabular data due to repeating the keys for every record
  - Verbose due to the required quotes around keys and string values
- No data type for dates
- No support for streaming data like with logs, since an array must have a start and an end (NDJSON solves that)

Upsides of CSV:

- Simple
- Unambiguous
- Ubiquitous
- Compact

Downsides of CSV:

- No support for nested data structures
- No data types (string/number/boolean/etc.)
- Ambiguous:
  - No way to know whether the first line is a header
  - Different separators (comma, semicolon, tab, ...) and the used separator is not specified in the file itself
  - Different ways how whitespacing around values is interpreted.

Downsides of NDJSON:

- Verbose (like JSON)

What we want the new data type to have is:

- Human-readable (text based)
- Simple (like JSON and CSV)
- Unambiguous. One way to do something
- Compact data format (like CSV, unlike JSON)
- Supports streaming (like CSV and NDJSON)
- Supports any nested data structure (like JSON)
- Easy to parse/stringify
- Easy to edit manually
- White-spacing has no meaning
- Extra: being a superset of JSON or CSV would be very powerful

## Ideas

What we can do is create a superset of JSON which adds a new structure named "table", allowing us to embed CSV like data structures, both nested and at the root level. Given the following JSON data:

```
{
  "name": "Joe",
  "age": 23,
  "hobbies": ["swimming", "gaming", "biking"],
  "friends": [
    {
      "name": "Sarah",
      "age": 22,
      "address": {
        "city": "New York",
        "street": "1st Ave"
      },
      "hobbies": ["biking", "shopping"]
    },
    {
      "name": "Robert",
      "age": 24,
      "address": {
        "city": "Washington",
        "street": "18th Street NW"
      },
      "hobbies": ["biking"]
    }
  ]
}
```

Or, when putting the items of the "friends" array on a single line:

```
{
  "name": "Joe",
  "age": 23,
  "hobbies": ["swimming", "gaming", "biking"],
  "friends": [
    {"name": "Sarah",  "age": 22, "address": {"city": "New York",   "street": "1st Ave"},        "hobbies": ["biking", "shopping"]},
    {"name": "Robert", "age": 24, "address": {"city": "Washington", "street": "18th Street NW"}, "hobbies": ["biking"]}
  ]
}
```

It can look as follows:

### ~~Idea 1: use `~` as row separator and nest objects~~

```
{
  "name": "Joe",
  "age": 23,
  "hobbies": ["swimming", "gaming", "biking"],
  "friends": ~ "name",  "age", "address": {"city", "street"},               "hobbies"
             ~ "Sarah", 22,               {"New York",   "1st Ave"},        ["biking", "shopping"]
             ~ "Robert", 24,              {"Washington", "18th Street NW"}, ["biking"]
}
```

### ~~Idea 2: use `~` as row separator and every row is an object~~

```
{
"name": "Joe",
"age": 23,
"hobbies": ["swimming", "gaming", "biking"],
"friends": ~ {"name",  "age", "address": {"city", "street"},               "hobbies"}
           ~ {"Sarah", 22,               {"New York",   "1st Ave"},        ["biking", "shopping"]}
           ~ {"Robert", 24,              {"Washington", "18th Street NW"}, ["biking"]}
}
```

### ~~Idea 3: use `~` as row separator and flatten nested objects~~

```
{
  "name": "Joe",
  "age": 23,
  "hobbies": ["swimming", "gaming", "biking"],
  "friends":  ~~ "name",   "age", ["address", "city"], ["address", "street"], "hobbies"
              ~  "Sarah",  22,    "New York",          "1st Ave",             ["biking", "shopping"]
              ~  "Robert", 24,    "Washington",        "18th Street NW",      ["biking"]
}
```

### ~~Idea 4: use `~` as row separator, flatten nested objects, define types~~

Because of defining types, there is no need to quote strings, except when they contain a comma or newline.

```
{
  name:string: Joe,
  age:number: 23,
  hobbies: [swimming, gaming, biking],
  friends: ~ name:string, age:number, address.city:string, address.street:string, hobbies
           ~ Sarah,       22,         New York,            1st Ave,               ["biking", "shopping"]
           ~ Robert,      24,         Washington,          18th Street NW,        ["biking"]
}
```

### Idea 5: use `~` as row separator, flatten nested objects, optional quotes

optional quotes:

```
{
  name: Joe,
  age: 23,
  hobbies: [swimming, gaming, biking],
  friends:
    ~ name,   age, address.city, address.street,   hobbies
    ~ Sarah,  22,  New York,     "1st Ave",        [biking, shopping]
    ~ Robert, 24,  Washington,   "18th Street NW", [biking]
}
```

and at root level:

```
~ name,   age, address.city, address.street, hobbies
~ Sarah,  22,  New York,     "1st Ave",      [biking, shopping]
~ Robert, 24,  Washington,   18th Street NW, [biking]
```

### Idea 6: use `\n` as row separator, flatten nested objects, optional quotes

What if we _do_ use the newline for separation of rows in a table, like CSV? In practice, even when serializing data in a compact way, it is very valuable to have newlines anyway: it keeps the data readable.

We probably do need a start character like `~` or `#` to know that a table is starting, without it's a bit mor tricky to parse the document (have to try that out). Also, the white-spacing works different from with CSV. But having a superset of both JSON and CSV would be very valuable!

```
{
  name: Joe,
  age: 23,
  hobbies: [swimming, gaming, biking],
  friends:
    name,   age, address.city, address.street,   hobbies
    Sarah,  22,  New York,     "1st Ave",        [biking, shopping]
    Robert, 24,  Washington,   "18th Street NW", [biking],
  updated: 2024-04-05T07:49:41.501Z
}
```

and at root level:

```
name,   age, address.city, address.street, hobbies
Sarah,  22,  New York,     "1st Ave",      [biking, shopping]
Robert, 24,  Washington,   18th Street NW, [biking]
```

Problem here is how to detect the end of the table. The trailing comma looks odd

### Idea 7: table start and end with `---` (optional at root level), use `\n` to separate rows, flatten nested objects

To make the data format easy to parse, we should have a start and end character for tables. Otherwise, how can you distinguish the last item from the array, and the start of a new property in the parent object, or the end of the item when the table is inside an array?

We can for example use `---` to have a clear block (characters like `~` or `|` would also be an option, but I like that less: it's less clear and harder to type).

```
{
  name: Joe,
  age: 23,
  hobbies: [swimming, gaming, biking],
  friends: ---
    name,   age, address.city, address.street,   hobbies
    Sarah,  22,  New York,     "1st Ave",        [biking, shopping]
    Robert, 24,  Washington,   "18th Street NW", [biking]
  ---,
  address: {
    city: New York,
    street: "1st Ave"
  }
}
```

We can make the table start and end optional when at root level:

```
name,   age, address.city, address.street, hobbies
Sarah,  22,  New York,     "1st Ave",      [biking, shopping]
Robert, 24,  Washington,   18th Street NW, [biking]
```

This way we still have CSV compatibility

### ~~Idea 8: optional commas, optional start/end of table and array and object at root~~

This way, we make the standard compatible with JSON, CSV, _and_ NDJSON. This will make the standard more friendly for configuration files too (only support for comments will be missing, then).

Commas in tables and inline can be replaced with a space (so strings containing a space must be enclosed in quotes).

```
name: Joe
age: 23
hobbies: [swimming gaming biking]
friends: ---
  name   age address.city address.street   hobbies
  Sarah  22  "New York"   "1st Ave"        [biking, shopping]
  Robert 24  Washington   "18th Street NW" [biking]
---
updated: 2024-04-05T07:49:41.501Z
```

Table at root level:

```
name   age address.city address.street hobbies
Sarah  22  "New York"     "1st Ave"    [biking, shopping]
Robert 24  Washington   18th Street NW [biking]
```

Array at root level:

```
biking
shopping
```

Or (NDJSON):

```
{"name": "Chris"   , "age": 23, "city": "New York"   }
{"name": "Emily"   , "age": 19, "city": "Atlanta"    }
{"name": "Joe"     , "age": 32, "city": "New York"   }
{"name": "Kevin"   , "age": 19, "city": "Atlanta"    }
```

I think though that this would be very confusing: optional `,` vs `\n` and spaces ` ` inside objects and arrays but not tables, "sometimes" optional quotes around objects `{ }` and arrays `[ ]`. It does not feel solid, and it is easy to make mistakes by forgetting to quote a string after having inserted a space in a value. There are then also multiple ways to write the same data: parsing data and then stringifying it can yield different results. It will also not look familiar to anyone, unlike when the standard is just the same as JSON except for optional quotes.

### Idea 9: built-in support for ISO date strings

For example:

```
{
  name: Joe,
  age: 23,
  hobbies: [swimming, gaming, biking],
  updated: 2024-04-05T07:49:41.501Z
}
```

### Idea 10: same as Idea 7, but with a CSV compatible way to encode paths

When we have an array with objects and serialize it, this results in a CSV table. However, if we encode a path like `"address"."city"` and put that in a single field, this means that CSV parsers cannot read the field. Therefore, I think it's better to encode it like `"address.city"`, even though that is a bit harder to parse/stringify because the dot needs to be escaped.

```
name,   age, "details.description with a comma , in it"
Sarah,  22,  Sarah Church
Robert, 24,  Robert Langdon
```

We only need to add quotes though when the string contains a comma or newline, so I think that hardly ever happens to need to put the column name in quotes.

### Idea 11: same as Idea 7, but without `---` blocks at all

If we do not need `---` blocks around a table at root level, we probably also don't need it for nested tables. This may be more tricky to parse, I'm not sure.

Requirement for a nested table is that it must start after a newline I think.

Also, we should not allow nested tables in a table or array, since we cannot distinguish it and get a lot of recursive tables rather than a list with items or rows.

```
{
  name: Joe,
  age: 23,
  hobbies: [swimming, gaming, biking],
  friends:
    name,   age, address.city, address.street,   hobbies
    Sarah,  22,  New York,     "1st Ave",        [biking, shopping]
    Robert, 24,  Washington,   "18th Street NW", [biking],
  address: {
    city: New York,
    street: "1st Ave"
  }
}
```

At root level:

```
name,   age, address.city, address.street, hobbies
Sarah,  22,  New York,     "1st Ave",      [biking, shopping]
Robert, 24,  Washington,   18th Street NW, [biking]
```

After trying out this idea:

- It is necessary to disallow nested tables in arrays, since you cannot distinguish a nested table having only one column from an array.
- It is necessary to disallow nested tables in tables, since you cannot distinguish the nested table.
- When serializing, we need to make sure that we only output a table when the parent is not an array or table, like with `[[{"id":1},{"id":2}]]`.
- This is technically possible, and the grammer is actually a bit simpler:
  - not two different table cases, just one
  - we need the rule that you can only use a table at root and as object value
  - we need the rule that a table requires a header and at least one row
- BUT: the parser has to do more work because it has to lookahead with every property value to see whether it is a string or an array. This makes it considerably slower (runs in say 2.4s instead of 1.8s).
- So, the performance is not good out of the box, and requires expertise. The performance is most likely solvable but requires some smartness.

Conclusion: I think it is best to keep the explicit table blocks `---`. It's better readable and looks more explicit, and it is easier to parse.

### Idea 12: simplify the rules of idea 7

In the ideas 7, there are two rules that make the format relatively complex:

1. Optional table block `---` at root level. The idea for this was to make the format compatible with CSV. But that is not possible due to differences in escaping, so it may actually be a downside if the data looks like CSV.
2. Optional double quotes around keys and strings:
   - pro: less bytes, better readable
   - con: a relatively complex rule

## Thoughts

- Syntax
  - I do not like Idea 1 and Idea 2 that much, the notation is a bit vague.
  - Idea 4 would be compatible with JSON, and almost compatible with CSV (only the `~` characters are a difference)!
  - How about using a `#` instead of `~` for a table row? Problem with that is that in some languages the `#` is used for comments. The nice thing about it though is that it reflects a table. In the end, I think it's best not to use `#` to prevent confusion.
- Headers
  - We can also use a different way to specify nested objects, like `"address.city"`. But I do like this explicit form and not making a "special" version of a string.
  - Problem with the table headers in Idea 3 is that the array suggests that you can fully use JSON in the header, but that is not the case. Maybe better to use a dot instead -> see Idea 4
  - Maybe we should use a different character for a table header? Like a double `~~`. If the header is required though, it is not really needed.
  - If we have an explicit header character, we can allow putting the header repeatedly in the data, like with every chunk of data. But would that be actually useful? It would make the data format ambiguous.
  - How to handle writing to a log file, if the first line is required to be a header? Hm, actually not that hard to program that when opening a next log file after rotation, directly write a header before outputting more records.
- Schema
  - If we add a schema, I would love it to be inline and not separately from the data itself. Most value to me is to know whether a value is a string, number, or other data type. Describing this in a schema and enforcing that is a different thing to me, and can be kept separately (Like JSON Schema).
  - It will keep the data format much simpler if we do not add a header with (optional) schema like InternetObject.
  - It may be interesting to ensure that JSON Schema can be used to validate our data type! I think it can, when the data type is a superset of JSON and the table structure parses into a regular array.
- Strings
  - Do we require quotes around text? It is required in JSON, which gives quite some noise compared to CSV. But if we omit them, we lose the ability to distinguish data types (one of the problems with CSV). With optional quotes, when stringifying data, we need to check whether the contents of a string contains a number or boolean, null, or nested object/array, or control characters like a comma, and if so, write it with quotes.
  - Optional quotes are really nice on the eye, and makes the data more compact! Requiring quotes makes stringifying simpler and the data look more consistent.
  - Whitespace around an unquoted string will not be part of the string. If you want that, you have to quote the string.
- Data types
  - Can we add a notation for a date? How about the format of BSON? Using a constructor call like: `{ date: ISODate("...") }`. Allowing those function calls could be interesting too for additional data types? Maybe also for an explicit string like `{ text: String(123) }`.
  - Do we want an improved way to store numbers?
    - Allow a notation like `0.(142857)` and `0.(3)` to denote a repeating sequence?
    - Do we allow `Infinity` and `-Infinity`?
    - Do we allow `NaN`?
- Metadata
  - Comments are only useful for data formats used for configuration, not for data. When using comments in data, it makes the data format hard to use: when loading data into a data model, there is no place to keep the comments. So when parsing/stringifying, you’ll lose the comments, which makes them unreliable. So, for our data format, we will not support comments.
  - Other metadata like what InternetObject puts in the header is not strictly necessary to be part of the data format, since you can choose a data model where you include these metadata fields as regular data, like: `{"page": 2, "recordCount": 100, "data": [...]}`.
- What would be the best separator for a path like `address.city`? A dot `.`? Or a colon `:`, so you get `address:city`? That would be sort of consistent with the `:` that is a separator between keys and values in an object.

## Paths

How to serialize nested paths in the table headers?

Requirements:

- Must be compatible with CSV parsers. So, no `"address"."city"` but rather something like `"address.city"`.
- Must be human-readable, with as little escaping as needed.
- Ideally, must use the same rules and logic as regular fields.
- Ideally, it does not require a 2 stage serialization and deserialization.

Ideas:

1. Multiple strings `"address"."full,name"` where each part is serialized according to a regular `JSON.stringify`. But this is a no-go, because this is not parseable by a regular CSV parser. It would be the easiest way though.
2. compile as a JSONPointer, like `/address/city`, and add logic to escape comma's and newlines. This is not that human-readable though, and requires two different types of escaping (that of JSONPointer and the extra comma and newline escaping).
3. Most natural would be a JSON-like escaping solution. So: put the whole path in a single string
   - This string must be escaped with quotes when needed: at least when it contains a comma or newline.
   - To keep things consistent, we have to use `\` as escape character.
   - We can escape the same characters as regular JSON values.
   - Additionally, we have to escape the dot `.` somehow, _before_ the path parts are concatenated with a dot.
4. In CSV, double quotes need to be escaped with an extra double quote. We can use that?

## Name

Ideas for names for the new data format:

- JSON+
- TabularJSON
- **Tabular-JSON**
- TJS "Tabular JSON". Is not associated with a data format
- TJSON "Tabular JSON"
- JSONT "JSON with tables"
- JSV
  - Is an existing data format: JSON Separated Values (also mixed JSON + CSV)
  - https://docs.servicestack.net/jsv-format
  - https://jsv.readthedocs.io/en/stable/

TODO: come up with a good name, including a file extension name and a domain for a website.

What I like most so far:

- name "Tabular-JSON"
- file extension `.tjson`
- domain https://tabular-json.org

## Tests

How much difference is there in data size between JSON (verbose) and CSV (compact)? How much does this differ really when gzipped? How much does it differ having a CSV with or without quoted strings?

Some experiments (see `/benchmark`) show the following (a rough test, take it with a grain of salt):

1. The difference in size between CSV and JSON depends strongly on how long the keys are
2. The difference in size between zipped and non-zipped depends strongly on how much repetition there is in the data.
3. With or without quotes makes a difference of about 5%, or 2% when zipped.
4. Non-zipped CSV can be 2 to 10 times as small as non-zipped JSON.
5. Zipped CSV is about 10-30% smaller than zipped JSON, which is not that much.

Conclusion:

- Looking at the size of the data, an efficient tabular data format like CSV mostly matters when storing data in unzipped form.
- A compact tabular data format is easier for the human to read/edit in plain text since it has much less noise.
