## Tabular-JSON: an extension of JSON adding a compact tabular data structure

Idea: a very minimal data format (not for configuration) combining the best of JSON and CSV.

## Introduction

JSON is a great data format. Reason for that is that it is so simple, unambiguous, and ubiquitous. However, it is not ideal. It is relatively verbose for tabular data. For tabular data, CSV is really a great data format because it is so simple and compact. Both JSON and CSV have their limitations. Can we come up with a new data format that combines the best of both JSON and CSV?

JSON is typically used for two very different purposes: for data and for configuration. In this experiment we’ll focus on a solution for data, not for configuration files. The latter requires a separate investigation, and of course we can come up with a solution that works well for both data and config (like InternetObject), however, such an all-in-one solution is most likely more complex than needed for "just" data purposes. We want to explore first what the needs are for a minimal data format.

Background articles:

- https://jsoneditoronline.org/indepth/compare/json-alternatives-for-data/
- https://jsoneditoronline.org/indepth/compare/json-alternatives-for-configuration-files/
- https://jsoneditoronline.org/indepth/compare/json-vs-csv/

Inspiration:

- https://docs.internetobject.org/
- https://github.com/superminority/jsv


## Requirements

Downsides of JSON:
- Verbose for tabular data
- No data type for dates
- The required quotes around strings and keys make it quite verbose
- No support for streaming data like with logs, since an array must have a start and an end

Downsides of CSV:
- No support for nested data structures
- No data types (no string/number/boolean/etc like JSON)
- No way to know whether the first line is a header

Downsides of both JSON and CSV:
- No built-in schema

What we want the new data type to have is:
- White-spacing has no meaning
- One way to do something. Unambiguous
- Human-readable (text based)
- Very minimal
- Compact data format (unlike JSON)
- Supports streaming like CSV and NDJSON
- Supports any nested data structure (like JSON)
- Easy to parse/stringify
- The parser must know upfront what’s coming, not after parsing a line or field or so
- Extra: being a superset of JSON or CSV would be very powerful


## Idea

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

### ~~Idea 1~~

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

### ~~Idea 2~~

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

### ~~Idea 3~~

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

### Idea 4

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

### Idea 5

optional quotes:

```
{
  name: Joe,
  age: 23,
  hobbies: [swimming, gaming, biking],
  friends: ~ name,   age, address.city, address.street,   hobbies
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


## Thoughts about these ideas

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
  - Whitespace around an unquoted string will not be part of the string, if you want that you have to quote the string.
- Data types
  - Can we add a notation for a date? How about the format of BSON? Using a constructor call like: `{ date: ISODate("...") }`. Allowing those function calls could be interesting too for additional data types? Maybe also for an explicit string like `{ text: String(123) }`.
  - Do we want an improved way to store numbers?
    - Allow a notation like `0.(142857)` and `0.(3)` to denote a repeating sequence?
    - Do we allow `Infinity` and `-Infinity`?
    - Do we allow `NaN`?
- Metadata
  - Comments are only useful for data formats used for configuration, not for data. When using comments in data, it makes the data format hard to use: when loading data into a data model, there is no place to keep the comments. So when parsing/stringifying, you’ll lose the comments, which makes them unreliable. So, for our data format, we will not support comments.
  - Other metadata like what InternetObject puts in the header is not strictly necessary to be part of the data format, since you can choose a data model where you include these metadata fields as regular data, like: `{"page": 2, "recordCount": 100, "data": [...]}`.

## Unsolved questions

- When having a data model in memory, how does the stringifying determine whether an array must be stringified into either a list or a table?
  - For example always when the array contains objects?
  - Do we disallow an array with nested objects and require a table there, or do we allow both traditional `[{...},{...}, …]` and a table side by side? The traditional way allows for non-homogeneous data and hence is more flexible, but I doubt if that is something you should want in the first place.

## Name

Ideas for names for the new data format:

- JSON+
- TabularJSON
- Tabular-JSON
- JSONT (“JSON with tables”)   
- JSV 
  - Is an existing data format: JSON Separated Values (also mixed JSON + CSV)
  - https://docs.servicestack.net/jsv-format
  - https://jsv.readthedocs.io/en/stable/

TODO: come up with a good name

## Tests

How much difference is there in data size between JSON (verbose) and CSV (compact)? How much does this differ really when gzipped? How much does it differ having a CSV with or without quoted strings?

Some experiments show the following (a rough test, take it with a grain of salt):

1. The difference in size between CSV and JSON depends strongly on how long the keys are
2. The difference in size between zipped and non-zipped depends strongly on how much repetition there is in the data. 
3. With or without quotes makes a difference of about 5%, or 2% when zipped.
4. Non-zipped CSV can be 200% to 1000% as small as non-zipped JSON.
5. Zipped CSV is about 10-30% smaller than zipped JSON.

Conclusion:

- Looking at the size of the data, an efficient tabular data format like CSV mostly matters when storing data in unzipped form.
- A compact tabular data format is easier for the human to read/edit in plain text since it has much less noise.
