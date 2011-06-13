/* tiny JS toolkit - minimalistic little helpers - (c) 2010 by Alex Kloss <alexthkloss@web.de> */
/* Thanks to Andre Bogus and Hajo Pflueger for their invaluable help! */
/* Thanks to the nice people on the SelfHTML Forum, too! */
/* Thanks to @jed and @Kambfhase for their tips on 140byt.es! */
/* Released under LGPL2 */
(function( // see @end of closure:
    ss, // simple selector regexp -> TagName, Id, className, Name selectors
    cp, // css parser regexp -> CSS2.1 + some irregular enhancements
    al, // ie opacity filter parser
    co, rr, // color parsers
    vf, // RegExp Replacer
    cn, // getElementsByClassName normalisation
    es, // easy selectors (uses simple selector regexp)
    u   // undefined (speed up things)
) {
/*
    DOM Selection:
    t([selector:String], [base:Node, optional], [zero methods:Boolean, optional]);
    selector: #id, .class, ...

    TODO: some more Optimizations (if possible) for speed and/or size
    Should usually return an t object or array (if parameter z is true or 1)
    of the selected DOM Nodes (if in the right mood), along with some nice
    methods in the prototype
*/
t=function(
    s, // selector string, node, array (of nodes)
    b, // selection base (or document)
    z, // zero methods if truthish
    I, n, e, E, S // placeholders
) {
    // Empty call is to get the prototype; do not rewrap a selection
    if (s === u || s instanceof t) return s;
    // Normalize input arguments
    s = s || [];
    b = b || document;
    // Start simple wrappers: is s already a node?
    if (!(n = s.nodeName ? [s] :
        // is it an array of nodes?
        s[0].nodeName ? s :
        // or a simple selection?
        (e=ss.exec(s)) ? es(e, b) :
        // start undefined
        0) && 
        // only use complicated selection if s is a string
        ''+s===s
    ) {
        // if n not already done and s is in string format, use a complicated selection
        // initialize expression start and -Array.
        // we need to reset this RegExp twice to avoid errors in IE!
        n=[];
        cp.lastIndex=0;
        e=cp.exec(s)[2]||'*';
        E=e=e===' '?'*':e;
        S=[b];
        cp.lastIndex=0;
        // next we need to parse each selector - here the magic happens
        // since we parse and execute at the same time, we get there pretty fast.
        s.replace(cp, function(f,y,j,k,l,m,o,p,z,q,x) {
            // Find out which values are important:
            // j=[ >~*+,<<?], o=[.:#], p=[Tag/Class/ID/pseudo], q=[pseudo arg], k=[attr key], m=[attr val]
            // Each subselector is run over the Selection Array, except '*',
            // which is saved for optimization later - here be dragons!
            // Multiple selections
            if (j===',') { if (e==='*') { S=t(e, S, 1); }; n=t.f(t.x([], n, S)); e=E; S=[b]; return; }
            // If our result is empty, we do not need to filter further
            if (!S.length) { return; }
            // Try for optimization: use simple selector, if possible, otherwise run last '*'
            if (e==='*') { if (z=ss.exec(f)) { console.log(S); S=es(z, S); console.log(S); e=f; return; } else { S=t.cf[e](S); } }
            // try to extract wisdom from the subselector
            x=(j?(j===' '?'*':[j]):(p?(o===':'?[p, q]:[(o||''), p, q]):(k?[l||'=', k, m]:u)));
            // if there is no simple selection possible, run complex filter
            if (x!==u&&x!=='*'&&t.cf[x[0]]) { S=t.cf[x[0]](S, x[1], x[2]); }
            // save last selector for optimizer
            e=x;
	console.log(arguments, n, S);
        });
        // get the last leftover '*' if necessary
        if (e==='*') { S=t(e, S, 1); }
        // put our selection back into the main array
        n=t.x([], n, S);
        console.log(n);
    }
    // filter our selection to contain unique nodes with nodeName only
    n=t.f(t.f(n, function(_, x) { return x&&x.nodeName?x:u; }, !0));
    // Extend Result Methods if "zero methods" not true
    return (z?n:(function() { z=new t; t.i(n, function(i, x) { z[i]=x; }, !0); z.length=n.length; return z; })());
};
// CSS Filter for query - an own object to be easily changeable
t.cf={
    // Node, Class, ID
    '': function(n, i) { return t.f(n, function(_, x) { return x.nodeName.toLowerCase()===i?x:u; }, !0); },
    '.': function(n, i, r) { r=new RegExp('\\b'+i+'\\b'); return t.f(n, function(_, x) { return r.test(x.className)?x:u; }, !0); },
    '#': function(n, i) { return t.f(n, function(_, x) { return x.id===i?x:u; }, !0); },
    // Pseudoattributes
    'odd': function(n) { return t.f(n, function(i, x) { return i&1===1?u:x; }, !0); },
    'even': function(n) { return t.f(n, function(i, x) { return i&1===1?x:u; }, !0); },
    'empty': function(n) { return t.f(n, function(i, x) { return (!x||x.childNodes||[]).length?u:x; }, !0); },
    'first-child': function(n) { return t.f(n, function(_, x, f) { for (f=x;(f=f.previousSibling)&&f.nodeType!==1;); return f?u:x; }, !0); },
    'last-child': function(n) { return t.f(n, function(_, x, l) { for (l=x;(l=l.nextSibling)&&l.nodeType!==1;); return l?u:x; }, !0); },
    'only-child': function(n) { return t.f(n, function(_, x) { return x.parentNode.getElementsByTagName('*')[1]?u:x; }, !0); },
    'nth-child': function(n, i) { return t.f(n, function(_, x, I) { return x.parentNode.getElementsByTagName('*')[i]===x?x:u; }, !0); },
    'not': function(n, i) { return t.f(n, function(_, x) { return t.w(x, t.x([], t(i, document, !0)))===-1?x:u; }, !0); },
    'has': function(n, i) { return t.f(n, function(_, x) { return t(i, x, !0).length?x:u; }, !0); },
    'contains': function(n, i) { return t.f(n, function(_, x) { return ~x.innerHTML.replace(/<[\>]*>/g,'').indexOf(i)?x:u; }, !0); },
    'lang': function(n, i) {return t.f(n, function(_, x) { return t('<<[lang|='+i+']', x, !0).length?x:u; },!0)},
    // Attributes
    '=': function(n, k, v) { return t.f(n, function(_, x) { var r=(t(x).a(k)); return r!==u&&r!==null&&r===(v||r)?x:u; }, !0); },
    '!=': function(n, k, v) { return t.f(n, function(_, x) { var r=(t(x).a(k)); return (r!==u&&r!==null&&r!==v)?x:u; }, !0); } ,
    '^=': function(n, k, v, r) { r=new RegExp('^'+vf(v)); return t.f(n, function(_, x) { return r.test(t(x).a(k))?x:u; }, !0); },
    '$=': function(n, k, v, r) { r=new RegExp(vf(v)+'$'); return t.f(n, function(_, x) { return r.test(t(x).a(k))?x:u; }, !0); },
    '*=': function(n, k, v) { return t.f(n, function(_, x) { return ~(t(x).a(k)||'').indexOf(v)?x:u; }, !0); },
    '~=': function(n, k, v, r) { r=new RegExp('\\b'+vf(v)+'\\b'); return t.f(n, function(_, x) { return r.test(t(x).a(k))?x:u; }, !0); },
    '|=': function(n, k, v, r) { r=new RegExp('^'+vf(v)+'($|\\-)'); return t.f(n, function(_, x) { return r.test(t(x).a(k))?x:u; }, !0); },
    // Traversing
    '>': function(n, c) { c=[]; t.i(n, function(_, x) { t.x(c, t.f(x.childNodes, function(_, z) { return z.nodeType===1?z:u; }, !0)); }, !0); return t.f(c); },
    '~': function(n, c) { c=[]; t.i(n, function(_, x) { for (;x=x.nextSibling;(x.nodeType===1) && (c.push(x))); }, !0); return t.f(c); },
    '+': function(n, c) { c=[]; t.i(n, function(_, x) { for (;x&&(x=x.nextSibling)&&x.nodeType!==1;); x && (c.push(x)); }, !0); return t.f(c); },
    '*': function(n) { return t.f(t('*', n, false)); },
    // Irregular traversing: parent/parents
    '<': function(n) { return t.f(t.i(!0, n, function(i, x) { this[i]=x.parentNode||u; }, !0)); },
    '<<': function(n, c) { c=[]; t.i(n, function(_, x) { var p=x; while((p=p.parentNode)&&p&&c.push(p)); }, !0); return t.f(c); }
};
// Version and license informations
t.version='0.0.2';
t.license='(c) 2010-2011 Alex Kloss <alexthkloss@web.de>, LGPL2';
// Prototypical Selector Result Methods - can be easily changed and extended
t.prototype=t._={
    // Iterate
    i: function(c) { return t.i(this, c, !0); },
    // Filter
    f: function(c) { return t(t.f(this, c, !0)); },
    // get/set Attribute
    a: function(k, v) {
        if (v===u) {
            if (typeof k==='object') { var n=this; t.i(k, function(k, v) { n.a(k, v); }); return this; }
            var n=this[0]; return this.length?(this.nf[k]?this.nf[k][0](n):n[k]||null):u;
        }
        this.i(function(_, n) { this.nf[k]?this.nf[k][1](n, v):n[k]=v; }, !0);
        return this;
    },
    // index -> node with index i in selection or index of node in selection or subselection
    g: function(i) { if (i===u||i===null) { return this; }; if (i.nodeName) { return t.w(i, this) }; if (''+i===i) { return t(i, this); }; return t(this[i]); },
    // html getter/setter
    h: function(h) { if (h===u) { return this.a('innerHTML'); }; this.a('innerHTML', h); return this; },
    // value getter/setter (value, all=parameterizer, e.g. t.p)
    v: function(v) { if (v===u) { return (this[0]||{}).value||''; }; if (typeof v==='function') { var r={}, x; this.i(function(i, n) { if (!/^(checkbox|radio|option)$/.test(n.type||'')||n.checked||n.selected) { x=t(n).v(); if (n.name&&x) { r[n.name]=(r[n.name]?r[n.name]+',':'')+x; } } }); return v(r); }; this.a('value', v);  return this; },
    // remove nodes
    r: function() { this.i(function(_, v) { if (v) { v.parentNode.removeChild(v); } }); },
    // get/set CSS Attributes, normalized
    c: function(k, v) {
        if (v===u) {
            if (typeof k==='object') { var n=this; t.i(k, function(k, v) { n.c(k, v); }); return this; }
            // get current style of first selected node, normalize rgb(...) to #rgb
            var n=this[0]; return this.length?this.nf.rgb2hex(this.nf[k]?this.nf[k][0](n):n.style[k]||window.getComputedStyle?(n.ownerDocument.defaultView.getComputedStyle(n,null)||{})[k]:(n.currentStyle||{})[k]||null):u;
        }
        this.i(function(_, n) { if (n.style) { if (this.nf[k]) { this.nf[k][1](n, v); } else { n.style[k]=v; } } }, !0);
        return this;
    },
    // Common ()Attribute/CSS) Normalizer: parameter: [ getter, setter ]
    // rgb2hex normalization
    // Using feature detection for opacity and float CSS attributes
    nf: (function() {
            // Basic filters: rgb2hex, class, value (normalisation for select boxes)
            var f={
                'rgb2hex': function(r) { var z; return ((z=rr.exec(r))?['#',z[1],z[1],z[2],z[2],z[3],z[3]].join(''):(z=co.exec(r))?'#'+t.i([1,2,3],function(i, v){this[i]=('0'+(z[v]|0).toString(16)).substr(-2);}).join(''):r); },
                'class': [function(n) { return n.className; }, function (n, v) { n.className=v; }],
                'value': [function(n) { return n.options?n.options[n.selectedIndex]:n.value; }, function(n, v) { if (/select/i.test(n.nodeName)) { n.selectedIndex=t.w(v, t.i(!0, n.options, function(i, o) { this[i]=o.value||o.innerHTML; }, !0)); }; n.value=v; }]
            }, d=document.createElement('div'); d.style.display='none';
            d.innerHTML='<i style="float:left;opacity:0.5">x</i>';
            // Feature detection: float vs. stylefloat, opacity vs. alpha filter
            var s=d.getElementsByTagName('i')[0].style;
            if (s.opacity!=='0.5') { f.opacity=[function(n) { al.exec(t(n).c('filter')); return (parseFloat(RegExp.$1)/100); },function(n, v) { /* if you want to enforce hasLayout yourself, put a space between the next star and slash: */n.style.zoom=t(n).c('zoom')||1;/**/ n.style.filter=(v>0&&v<1?'alpha(opacity='+(v*100)+')':n.style.filter.replace(al,'')+''); } ]; }
            if (s.styleFloat) { f['float']=[function(n) { return t(n).c('styleFloat'); }, function(n, v) { n.style.styleFloat=v; }] }
            return f;
        })(),
    // Events
    e: function(e, c, r) { return t.e(this, e, c, r); }
};
/*
    iterate
    t.i([object:Array|Object], [callback:Function, this=object, arguments=[key, value]], [array-Iteration]);
    returns the iterated object
*/
t.i=function(o, c, a, z) {
    // If not an Array or Object (which would both be object - or function, because Safari's node Collections are!),
    // if we haven't got anything to iterate, return
    if (!o) { return o; }
    // first value===true -> run on a copy of the object
    if (o===!0) { return t.i(t.x((z||c instanceof Array)?[]:{},c), a, z); }
    // Get length of an Array, type of the object
    var l=(o||[]).length, a=a||o instanceof Array;
    // We use call to set this to the object we iterate over, thus we can manipulate it within the callback
    // Iterate Array over a counter
    if (a) { for (var i=0;i<l;i++) { c.call(o, i, o[i]); } }
    // Iterate Object over its Instances (hasOwnProperty to avoid the prototype)
    else { for (var k in o) { if (t.i.p||o.hasOwnProperty(k)) { c.call(o, k, o[k]); } } }
    // return iterated Object
    return o;
};
/*
    eXtend objects (Arrays will be concatenated), if an Object is used to extend an array, the keys will be omittedocument.
    t.x([object:Object], [object2:Object], [object3:Object, optional], ...);
*/
t.x=function() {
    // Preparation: base object, arguments iterator, object or array, internal function
    var b=arguments[0]||{}, o, i=0, y=b instanceof Array;
    // return if nothing extendable present
    if (!b.hasOwnProperty) { return b; }
    // each argument is used as object to extend the first one; we use our iterator to save space
    while (o=arguments[++i]) { t.i(o, y?function(k, v) { b.push(v); }:function(k, v) { b[k]=v; }, y); }
    return b;
};
/*
    filter objects/arrays
    t.f([object:Object|Array], [callback:function, this=object, arguments=key, value, optional: otherwise array-unique function], [parse as array:Boolean true, optional]);
    // returns filtered object
    if the callback returns undefined, the instance is filtered, otherwise the return value is taken
*/
t.f=function(o, c, y) {
    if (!o) { return o; }
    // find whether we have an array or an object and a callback function or comparative object, instanciate result Object/Array
    // if no callback or comparable object is defined, we predefine a unique function
    var y=y||c===u||o instanceof Array, r=y?[]:{}, c=c||function(i, v) { var l=i; while (--l>=0) { if (this[l]===v) { return u; }}; return v; };
    // Iterate over the original Object, if return value is not undefined, add instance to result
    t.i(o, function(k, v) { ((c.call(o, k, v))!==u)&&(y?r.push(v):r[k]=v); }, y)
    return r;
}
/*
    where in the array is...?
    t.w([object], [array:Array]) // -> -1 if not found, 0-n if found.
    Optimization: use native method if available
*/
t.w=[].indexOf ? function(x, a) { return a.indexOf(x); } : function(x, a) { var l=a.length; while (l>-1&&a[--l]!==x); return l; }
/*
    parametrize
    t.p([object:Object], [middle:String, optional], [connector:String, optional], [prefix:String, optional], [suffix:String, optional], [filter1:Function, optional], [filter2:Function, optional]);
    // Defaults (without anything but "o" results in URL parameterisation
*/
t.p=function(o, m, c, p, s, f1, f2, r) {
    // instance => prefix+filtered key+middle+filtered value+suffix; instance + connector + instance => result
    r=[];
    t.i(o, function(k, v) { r.push((p===u?'':p)+(f1||escape)(k)+(m===u?'=':m)+(f2||escape)(v)+(s===u?'':s)); });
    return r.join(c===u?'&':c);
};
/*
    basic yet powerful event system
    t.e([node(s):DOM Node|Array], [eventname:String, optional], [callback:Function, this=node, arguments=[event object], optional], [remove:Boolean=true, optional]);
    // even if no callback is given, the event array is returned
    // if no eventname is given, the whole event object is returned

    // Basic event handler
    t.e.h([event:Event Object, this=node])
    // To trigger an event object, use "t.e.h.call(node, event)"
*/
t.e=function(n, e, c, r) {
    // Handle Node Collections / Node arrays
    if (!n.nodeName && n.length) { return t.i(n, function(_, o) { t.e(o, e, c, r); }, !0); }
    // Handle multiple Eventes
    var E=e.split(/\s+/); if (E.length>1) { t.i(E, function(_, x) { t.e(n, x, c, r); }); }
    // Define Events Object, if not present
    if (!n.ev) { n.ev={}; }
    // return full object if event name is omitted
    if (e===u) { return n.ev; }
    // create Event array / handler if not present (and fill it with the current event)
    if (!n.ev[e]) { n.ev[e]=[]; if (typeof(n['on'+e])==='function') { n.ev[e].push(n['on'+e]); }; }
    if (n['on'+e]!==t.e.h) { n['on'+e]=t.e.h; }
    // add callback if present or delete if r is set
    if (c!==u) {
        if (r) { n.ev[e]=t.f(n.ev[e], function(_, x) { return c===x?u:x; }, !0); }
        else { n.ev[e].push(c); }
    }
    return n.ev[e];
}
// Event Handler
t.e.h = function(o) {
    // normalize event;
    var e=(o||window.event), D=document.documentElement, n=this, r;
    t.x(e, {key: (e.which||e.keyCode||e.charCode), ts: (new Date())*1, mouseX: (e.clientX||0)+(window.pageXOffset||D.scrollLeft||0), mouseY: (e.clientY||0)+(window.pageYOffset||D.scrollTop||0)});
    if (!e.target) { e.target=e.srcElement||n; }
    // iterate over event array, allow for event abortion (if function returns false)
    t.i((n.ev||{})[e.type], function(i, c) { if (typeof c==='function') { r=r||c.call(n, e)===false; }});
    if (r) { return; }
};
// very simple DOM Ready Event
if (!document.readyState) {
    // Set readyState manually if neccessary
    var r=function() { document.readyState='complete'; }, a=document.attachEvent, e=document.addEventListener;
    // use window.onload as fallback
    (a||e||function(_, r){ t.e(window, 'load', r); })(a?'onreadystatechange':'DOMContentLoaded',r,false);
}
// Ready Event trigger
ready=setInterval(function() {
    // if not ready, set timeout and return, otherwise call Event Handler
    if (document.body && document.readyState==='complete') {
        t.e.h.call(document, { cancelable: false, type: 'ready', target: document, view: window });
        clearInterval(ready);
    }
}, 45);
/*
    JS/JSONp: load additional JavaScript / loads informations via JSONp
    unnamed functions will be temporarily named; name will be deleted for security reasons after 1 s (past timeout)
    t.j([url:String], [callback:String(Function name), Function], [timeout,Integer(ms, optional)]);
*/
t.j=function(u,c,T,f,s){
    f=typeof c==='function';
    // Name function if unnamed, Remove formerly unnamed function's name
    if (f) {
        window[(f='fn'+(Math.random()*1E8|0)+(new Date()*1))]=[c,c=f][0];
        setTimeout(function() { window[c] = u; }, (+T)+5000);
    }
    // Create Script-Element with url and add it to body
    document.body.appendChild(s=t.x(document.createElement('script'), {type: 'text/javascript', src: u+(c||'')}));
    // Timeout handling
    T && (setTimeout(function() { document.body.removeChild(s); }, T));
};
/*
    ajax:
    t.a({
        url:[url:String],
        method:[method:String,(GET|POST), optional],
        data:[postdata:String|Object, optional],
        type:[response Object:String(Text, Xml, ...), optional - if true, the request object is returned],
        async:[callback:Function, optional]
    }, xhr:[reusable request, optional]);
*/
t.a=function(o, x) {
    // create XMLHttpRequest or leave
    if (!(x=x||(window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP")))) { return false; }
    // Open Request and send data
    x.open(o.method||'GET', o.url, !!o.async, o.user, o.pass) && x.send(o.data?(typeof o.data==='object'?t.p(o.data):o.data):null);
    // if not async, return result
    if (!o.async) { return o.type===!0?x:x['response'+(o.type||'Text')]; }
    // if async, set result handler function
    x.onreadystatechange=function(e) { if (x.readyState===4) { o.async.call(x,x['response'+o.type||'Text']); } }
    // return Request object
    return x;
};
})(
    // ss: simple selector regexp -> TagName, Id, className, Name selectors
    /(^|^#|^\.|\[name=)([^#.\s+~<>\[\:=,]+?|\*)\]?$/,    
    // cp: css parser regexp -> CSS2.1 + some irregular enhancements
    /(\s*([>~* +,]|<<?)\s*|\[([^!\^$*~|=]+)([!\^$*~|]?=?)([^\]]*)\]|([#.:]?)([^#.:,\s +~<>\[^\(]+)(\(([^\)]+)\)|))/g,
    // al: ie opacity filter parser
    /alpha\(opacity=([\d\.]*)\)/gi,
    // co, rr: color parsers
    /rgb\((\d+),\s*(\d+),\s*(\d+)\)/i,
    /^#([\da-f])([\da-f])([\da-f])/,
    // vf: RegExp Replacer
    function(v){return v.replace(/([.+*\[\]\(\)])/g, '\\$1');},
    // cn: getElementsByClassName normalisation
    document.getElementsByClassName ?
        function(s, b) { return b.getElementsByClassName(s); } :
        function(s, b) { return t.cf['.'](es([,,'*'],b), s); },
    // es: easy selectors (uses simple selector regexp)
    function es(
        e, // result of ss.exec([selector])
        b, // selector base (e.g. document)
        E // result placeholder
    ){
        // initialize result array
        E=[];
        return (b ?
            // multiple instances?
            b.length ? t.i(b, function(i, S) { E = t.x(E, es(e, S, 0)); }, 1) && E :
            // id selector: since node.getElementById fails, we need to check whether b is document or selected node is child of b
            e[1] == '#' ? (E = document.getElementById(e[2])) && ~(b === document || t.w(t.cf['<<']([E]), b)) && [E] || [] :
            // className selector
            e[1] == '.' ? cn(e[2], b) :
            // name selector (the last one that returns something
            e[1] ? t.x([], b.getElementsByName(e[2])) :
            // tagName selector
            (E = t.x(E, b.getElementsByTagName(e[2])) && E[0] ? E : []) :
            // no base => no selection
            E);
    }
    // u: undefined (speed up things)
);  
