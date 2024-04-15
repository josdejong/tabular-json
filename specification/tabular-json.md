## Tabular-JSON Grammer

The grammer uses [McKeeman Form](https://www.crockford.com/mckeeman.html).

```
tabular-json
   element

value
   object
   array
   table
   string
   number
   date
   "true"
   "false"
   "null"

object
    '{' ws '}'
    '{' members '}'

members
    member
    member ',' members

member
    ws string ws ':' element

array
    '[' ws ']'
    '[' elements ']'

elements
    element
    element ',' elements

element
    ws value ws

table
    '---' wst '\n' header '\n' rows '\n' wst '---'

header
    field
    field ',' header

rows
    row
    row '\n' rows

field
    wst string wst
    wst string wst '.' field

row
    wst value wst
    wst value wst ',' row

string
    quoted_string
    unquoted_string

quoted_string
    '"' characters '"'

characters
    ""
    character characters

character
    '0020' . '10FFFF' - '"' - '\'
    '\' escape

unquoted_string
    unquoted_start_characters unquoted_inner_character unquoted_end_characters

unquoted_start_characters
    ""
    unquoted_start_character
    unquoted_start_character unquoted_start_characters

unquoted_inner_character
    ""
    unquoted_character
    unquoted_character unquoted_inner_character

unquoted_end_characters
    ""
    unquoted_end_character
    unquoted_end_character unquoted_end_characters

unquoted_start_character
    unquoted_character - wst - digit - '-'

unquoted_end_character
    unquoted_character - wst

unquoted_character
    character - escape

escape
    '"'
    '\'
    '/'
    'b'
    'f'
    'n'
    'r'
    't'
    'u' hex hex hex hex

hex
    digit
    'A' . 'F'
    'a' . 'f'

number
    integer fraction exponent

integer
    digit
    onenine digits
    '-' digit
    '-' onenine digits

digits
    digit
    digit digits

digit
    '0'
    onenine

onenine
    '1' . '9'

fraction
    ""
    '.' digits

exponent
    ""
    'E' sign digits
    'e' sign digits

sign
    ""
    '+'
    '-'

date
    date 'T' time 'Z'
    date 'T' time '.' milliseconds 'Z'

date
    digit digit digit digit '-' digit digit '-' digit digit

time
    digit digit '-' digit digit '-' digit digit

milliseconds
    digit digit digit

ws
    ""
    '0020' ws
    '000A' ws
    '000D' ws
    '0009' ws

wst
    ""
    '0020' ws
    '000D' ws
```
