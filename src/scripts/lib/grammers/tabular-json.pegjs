// Tabular-JSON
//
// An extension of the JSON grammar as provided by Peggy [1].
//
// [1] https://github.com/peggyjs/peggy/blob/main/examples/json.pegjs

// ----- 1. JavaScript functions -----

{{
  // helper function to set a value in a nested object
  function setIn(object, path, value) {
    const iLast = path.length - 1
    let child = object

    for (let i = 0; i < iLast; i++) {
      child = child[path[i]] ??= {}
    }

    child[path[iLast]] = value
  }
}}

// ----- 2. Tabular-JSON Grammar -----

JSON_text
  = ws value:value ws { return value }

begin_array     = "["
end_array       = "]"
begin_object    = "{"
end_object      = "}"
begin_table     = "---"
end_table       = "---"
name_separator  = ":"
path_separator  = "."
value_separator = ","
row_separator   = "\r"? "\n"

ws "whitespace" = [ \t\n\r]*
wst "table-whitespace" = [ \t]*

// ----- 3. Values -----

value
  = false
  / true
  / null
  / object
  / array
  / table
  / date
  / number
  / string

false = "false" { return false }
null  = "null"  { return null  }
true  = "true"  { return true  }

// ----- 4. Objects -----

object
  = begin_object ws
    members:(
      head:member
      tail:(ws value_separator ws m:member { return m })*
      {
        const result = {
          [head.name]: head.value
        }

        tail.forEach(({ name, value}) => result[name] = value)

        return result
      }
    )?
    ws end_object
    { return members !== null ? members: {} }

member
  = name:(string) ws name_separator ws value:value {
      return { name, value }
    }

// ----- 5. Arrays -----

array
  = begin_array ws
    values:(
      head:value
      tail:(ws value_separator ws v:value { return v })*
      { return [head].concat(tail) }
    )?
    ws end_array
    { return values ?? [] }

// ----- 6. Tables -----

table
  = begin_table wst row_separator
    wst header:header wst row_separator
    rows:(wst !end_table row:row wst row_separator { return row })+
    wst end_table
    {
      return rows.map(row => {
        const record = {}

        row.forEach((value, index) => setIn(record, header[index], value))

        return record
      })
    }

header
  = head:field tail:(wst value_separator wst field:field { return field })*
  { return [head].concat(tail) }

row
  = head:value tail:(wst value_separator wst value:value { return value })*
  { return [head].concat(tail) }

field
  = head:string tail:(wst path_separator wst value:string { return value })*
  { return [head].concat(tail) }

// ----- 7. Numbers -----

number "number"
  = minus? int frac? exp? { return parseFloat(text()) }

decimal_point
  = "."

digit1_9
  = [1-9]

e
  = [eE]

exp
  = e (minus / plus)? DIGIT+

frac
  = decimal_point DIGIT+

int
  = zero / (digit1_9 DIGIT*)

minus
  = "-"

plus
  = "+"

zero
  = "0"

// ------ 8. Dates -----

date "date"
  = date:$(date_part "T" time_part ("." milliseconds_part)? "Z") { return new Date(date) }

date_part         = $(DIGIT DIGIT DIGIT DIGIT "-" DIGIT DIGIT "-" DIGIT DIGIT)
time_part         = $(DIGIT DIGIT ":" DIGIT DIGIT ":" DIGIT DIGIT)
milliseconds_part = $(DIGIT DIGIT DIGIT)

// ----- 9. Strings -----

string = quoted_string / unquoted_string

unquoted_string "unquoted string"
  = chars:unquoted+ { return chars.join("").trim() }

quoted_string "quoted string"
  = quotation_mark chars:char* quotation_mark { return chars.join("") }

char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b" }
      / "f" { return "\f" }
      / "n" { return "\n" }
      / "r" { return "\r" }
      / "t" { return "\t" }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16))
        }
    )
    { return sequence }

escape
  = "\\"

quotation_mark
  = '"'

unescaped
  = [^\0-\x1F\x22\x5C]

unquoted
  = [^\0-\x1F",.:\-[\]{}\n\r\b\f\t]

// ----- Core ABNF Rules -----

// See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4234).
DIGIT  = [0-9]
HEXDIG = [0-9a-f]i
