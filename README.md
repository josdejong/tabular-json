# Tabular-JSON: JSON with tables

Tabular-JSON a superset of JSON and CSV which will look familiar to anyone that knows JSON and CSV. Tabular-JSON aims to be just as simple as JSON and CSV, combining the best of JSON, CSV, and NDJSON, but without the drawbacks.

Tabular-JSON is:

- a replacement for CSV without its ambiguities and limitation to tabular data structures
- a replacement for JSON without its verbosity
- a replacement for NDJSON without its verbosity

You get Tabular-JSON when you:

- take JSON
- make quotes around keys and strings optional
- add a table structure (wrapped in a `---` block, rows separated by a newline, values by a comma)
- add a new ISO date data-type.
