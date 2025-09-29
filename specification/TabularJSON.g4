grammar TabularJSON;

tabularjson
    : ws value ws EOF
    | ws contents ws EOF ;

value
    : object
    | array
    | table
    | STRING
    | NUMBER
    | BOOLEAN
    | NULL ;

object
    : '{' pair (',' pair)* trailing? '}'
    | '{' ws '}' ;

pair : ws STRING ws ':' ws value ws ;
trailing : ',' ws ;

array
    : '[' ws value ws (',' ws value ws)* trailing? ']'
    | '[' ws ']' ;

table : '---' wst '\n'
    contents '\n'
    wst '---' ;

contents : header '\n' ws rows ;
header   : field (',' field)* ;
field    : wst STRING wst ('.' wst STRING wst)* ;
rows     : row ('\n' ws row)* ;
row      : wst value wst (',' wst value wst)* ;

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

ws            : (WHITESPACE | NEWLINE)* ;
wst           : (WHITESPACE)* ;

WHITESPACE    : [ \t\r] -> skip;
NEWLINE       : '\n' ;

LINE_COMMENT  : '//' ~[\r\n]* -> skip ;
BLOCK_COMMENT : '/*' .*? '*/' -> skip ;
