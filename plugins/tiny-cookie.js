/* 
    tiny-cookie: cookie handling for tiny.js
    (c) 2010-2011 Alex Kloss
    
    t.c([name:String]) -> gets cookie with name "name"
    t.c({
        name:[name:String*], 
        value:[value:String*], 
        date:[date:Date|Int(ms)], 
        domain:[domain:String],
        path:[path:String],         
        extra:[extra:String, beginning with "; "]
    });
    * required, other instances are optional

*/
t.c=function(o, u) {
    // name given as string? get cookie via RegExp
    if (''+o===o) return (o=(new RegExp('(^|[ ;])'+escape(o)+'=([^;]+)')).exec(document.cookie) && unescape(o[2]));
    // otherwise Assemble Cookie
    if (o.name && o.value) { 
        // prepare expiry date
        o.expires=o.date?(o.date.getDay ? o.date : new Date(+new Date()+o.date)).toGMTString() : '';
        // use t.p and t.f to generate cookie string
        document.cookie=t.p(t.f(o,function(k,v){return /date|extra/.test(k) ? u : k}),'=',';')+o.extra 
    } 
};
