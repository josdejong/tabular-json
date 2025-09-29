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
