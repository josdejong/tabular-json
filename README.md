# Tabular-JSON: JSON with tables

Tabular-JSON a superset of JSON and CSV which will look familiar to anyone that knows JSON and CSV. Tabular-JSON aims to be just as simple as JSON and CSV, combining the best of JSON, CSV, and NDJSON, but without the drawbacks.

Tabular-JSON is:

- a replacement for CSV without its ambiguities
- a replacement for JSON which is more compact and less noisy
- a replacement for NDJSON

You get Tabular-JSON when you:

- take JSON
- make quotes around keys and strings optional
- add a table structure (wrapped in a `---` block, rows separated by a newline, values by a comma)
- add a new ISO date data-type.
