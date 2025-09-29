grammar JSON;

json
    : ws value ws EOF ;

value
    : object
    | array
    | STRING
    | NUMBER
    | BOOLEAN
    | NULL ;

object
    : '{' pair (',' pair)* '}'
    | '{' ws '}' ;

pair : ws STRING ws ':' ws value ws ;

array
    : '[' ws value ws (',' ws value ws)* ']'
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
