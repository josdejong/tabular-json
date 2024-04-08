// ----- 1. Tabular-JSON Grammar -----

JSON_text
  = ws value:value ws { return value; }

// FIXME: add support for a table without block at the root

begin_array     = "["
end_array       = "]"
begin_object    = "{"
end_object      = "}"
begin_table     = "---"
end_table       = "---"
name_separator  = ":"
path_separator  = "."
value_separator = ","
field_separator = ","
row_separator   = "\r"? "\n"

ws "whitespace" = [ \t\n\r]*
wst "table-whitespace" = [ \t]*

// ----- 2. Values -----

value
  = false
  / null
  / true
  / object
  / array
  / table
  / date
  / number
  / string

false = "false" { return false; }
null  = "null"  { return null;  }
true  = "true"  { return true;  }

// ----- 3. Objects -----

object
  = begin_object ws
    members:(
      head:member
      tail:(ws value_separator ws m:member { return m; })*
      {
        var result = {};

        [head].concat(tail).forEach(function(element) {
          result[element.name] = element.value;
        });

        return result;
      }
    )?
    ws end_object
    { return members !== null ? members: {}; }

member
  = name:(string) ws name_separator ws value:value {
      return { name, value };
    }

// ----- 4. Arrays -----

array
  = begin_array ws
    values:(
      head:value
      tail:(!end_array ws value_separator ws v:value { return v; })*
      { return [head].concat(tail); }
    )?
    end_array
    { return values ?? []; }

// ----- 5. Tables -----

table
  = begin_table wst row_separator wst
    header:header wst row_separator wst
    rows:(!end_table row:row wst row_separator wst { return row; })+
    end_table
    {
      function setIn(object, path, value) {
        let current = object

        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i]
          if (!current[key]) {
            current[key] = {}
          }
          current = current[key]
        }

        const lastKey = path[path.length - 1]
        current[lastKey] = value
      }

      function createSetters(header) {
        return header.map((path) => {
          const first = path[0]

          return path.length === 1
            ? (record, value) => (record[first] = value)
            : (record, value) => setIn(record, path, value)
        })
      }

      const setters = createSetters(header)
      
      // FIXME: instead of first collecting all rows and then mapping them to objects afterwards, do that on the fly:
      //  - create the setters directly after parsing the header
      //  - then directly invoke the setter when parsing a value
      return rows.map(row => {
        const record = {}
        
        for (let i = 0; i < row.length; i++) {
          const value = row[i]
          const setter = setters[i]
          setter(record, value)
        }

        return record
      });
    }

header
  = head:path tail:(wst field_separator wst path:path { return path; })*
  { return [head].concat(tail); }

row
  = head:value tail:(wst field_separator wst value:value { return value; })*
  { return [head].concat(tail); }

path
  = head:string tail:(wst path_separator wst value:string { return value; })* 
    { return [head].concat(tail); }

// ----- 6. Numbers -----

number "number"
  = minus? int frac? exp? { return parseFloat(text()); }

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

// ------ 7. Dates -----

// FIXME: work out the ISO Date definition in detail, see https://en.wikipedia.org/wiki/ISO_8601

date "date"
  = date:$(year "-" month "-" day "T" hours ":" minutes ":" seconds ("." milliseconds)? "Z") { return new Date(date); }

year         = $(DIGIT DIGIT DIGIT DIGIT)
month        = $(DIGIT DIGIT)
day          = $(DIGIT DIGIT)
hours        = $(DIGIT DIGIT)
minutes      = $(DIGIT DIGIT)
seconds      = $(DIGIT DIGIT)
milliseconds = $(DIGIT DIGIT DIGIT)

// ----- 8. Strings -----

string = quoted_string / unquoted_string

unquoted_string "unquoted string"
  = chars:unquoted+ { return chars.join("").trim(); }

quoted_string "quoted string"
  = quotation_mark chars:char* quotation_mark { return chars.join(""); }

char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape
  = "\\"

quotation_mark
  = '"'

unescaped
  = [^\0-\x1F\x22\x5C]

unquoted
  = [^\0-\x1F,.:"\n\r\b\f\t\\\[\]{}] // FIME: refine the allowed characters in uquoted strings

// ----- Core ABNF Rules -----

// See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4234).
DIGIT  = [0-9]
HEXDIG = [0-9a-f]i