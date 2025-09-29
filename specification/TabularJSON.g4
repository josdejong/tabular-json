grammar TabularJSON;

tabularjson
    : value EOF
    | contents EOF ;

value : ws
    ( object
    | array
    | table
    | STRING
    | NUMBER
    | BOOLEAN
    | NULL
    ) ws ;

object
    : '{' pair (',' pair)* trailing? '}'
    | '{' ws '}' ;

pair : key ':' value ;

key  : ws STRING ws ;

array
    : '[' value (',' value)* trailing? ']'
    | '[' ws ']' ;

table : '---' wst '\n'
    contents wst '\n'
    wst '---' ;

contents : header '\n' rows ;
header   : field (',' field)* ;
field    : key ('.' key)* ;
rows     : row ('\n' row)* ;
row      : value (',' value)* ;

STRING        : '"' (ESC | CHAR)* '"' ;

fragment ESC  : '\\' (["\\/bfnrt] | UNI) ;
fragment UNI  : 'u' HEX HEX HEX HEX ;
fragment HEX  : [0-9a-fA-F] ;
fragment CHAR : ~ ["\\\u0000-\u001F] ;

NUMBER
    : '-'? INT ('.' [0-9]+)? EXP?
    | '-'? 'inf'
    | 'nan'
    ;

fragment INT  : '0' | [1-9] [0-9]* ;
fragment EXP  : [Ee] [+-]? [0-9]+ ;

BOOLEAN       : 'true' | 'false' ;
NULL          : 'null' ;

trailing      : ',' ws ;
ws            : (WHITESPACE | NEWLINE)* ;
wst           : WHITESPACE* ;

WHITESPACE    : [ \t\r] -> skip;
NEWLINE       : '\n' ;

LINE_COMMENT  : '//' ~[\r\n]* -> skip ;
BLOCK_COMMENT : '/*' .*? '*/' -> skip ;
