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
    // integer part forbids leading 0s (e.g. `01`)
    : '0'
    | [1-9] [0-9]*
    ;

fragment EXP
    // exponent number permits leading 0s (e.g. `1e01`)
    : [Ee] [+-]? [0-9]+
    ;

ws
    : WS*
    ;

WS
    : [ \t\n\r]+
    ;
