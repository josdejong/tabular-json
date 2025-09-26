grammar TabularJSON;

tabularjson
    : table_contents EOF
    | element EOF
    ;

element
    : ws value ws
    ;

value
    : STRING
    | NUMBER
    | object
    | array
    | table
    | 'true'
    | 'false'
    | 'null'
    ;

object
    : '{' pair (',' pair)* ws '}'
    | '{' ws '}'
    ;

pair
    : ws STRING ws ':' element
    ;

array
    : '[' element (',' element)* ']'
    | '[' ws ']'
    ;

table
    : '---' wst '\n' table_contents wst NEWLINE wst '---'
    ;

table_contents
    : header NEWLINE rows
    ;

header
    : field (',' field)*
    ;

rows
    : row (NEWLINE row)*
    ;

field
    : wst STRING wst ('.' wst STRING wst)*
    ;

row
    : wst value wst (',' wst value wst)*
    ;

STRING
    : '"' (ESC | SAFECODEPOINT)* '"'
    ;

fragment ESC
    : '\\' (["\\/bfnrt] | UNICODE)
    ;

fragment UNICODE
    : 'u' HEX HEX HEX HEX
    ;

fragment HEX
    : [0-9a-fA-F]
    ;

fragment SAFECODEPOINT
    : ~ ["\\\u0000-\u001F]
    ;

NUMBER
    : '-'? INT ('.' [0-9]+)? EXP?
    | '-'? 'inf'
    | 'nan'
    ;

fragment INT
    : '0'
    | [1-9] [0-9]*
    ;

fragment EXP
    : [Ee] [+-]? [0-9]+
    ;

ws
    : (SPACE_OR_TAB | CARRIAGE_RETURN | NEWLINE)*
    ;

wst
    : SPACE_OR_TAB*
    ;

SPACE_OR_TAB
    : ' ' | '\t'
    ;

CARRIAGE_RETURN
    : '\r'
    ;

NEWLINE
    : '\n'
    ;

LINE_COMMENT
    : '//' ~[\r\n]* -> skip
    ;

BLOCK_COMMENT
    : '/*' .*? '*/' -> skip
    ;
