grammar JSON;

json
    : value EOF ;

value : ws
    ( object
    | array
    | STRING
    | NUMBER
    | BOOLEAN
    | NULL
    ) ws ;

object
    : '{' pair (',' pair)* '}'
    | '{' ws '}' ;

pair : key ':' value ;

key  : ws STRING ws ;

array
    : '[' value (',' value)* ']'
    | '[' ws ']' ;

STRING        : '"' (ESC | CHAR)* '"' ;

fragment ESC  : '\\' (["\\/bfnrt] | UNI) ;
fragment UNI  : 'u' HEX HEX HEX HEX ;
fragment HEX  : [0-9a-fA-F] ;
fragment CHAR : ~ ["\\\u0000-\u001F] ;

NUMBER
    : '-'? INT ('.' [0-9]+)? EXP?
    ;

fragment INT  : '0' | [1-9] [0-9]* ;
fragment EXP  : [Ee] [+-]? [0-9]+ ;

BOOLEAN       : 'true' | 'false' ;
NULL          : 'null' ;

ws            : (WHITESPACE | NEWLINE)* ;

WHITESPACE    : [ \t\r] -> skip;
NEWLINE       : '\n' ;
