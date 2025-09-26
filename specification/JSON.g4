grammar JSON;

json
    : element EOF
    ;

element
    : ws value ws
    ;

value
    : STRING
    | NUMBER
    | object
    | array
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

SPACE_OR_TAB
    : ' ' | '\t'
    ;

CARRIAGE_RETURN
    : '\r'
    ;

NEWLINE
    : '\n'
    ;
