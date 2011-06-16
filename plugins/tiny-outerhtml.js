/* tiny outerHTML replacement (c) 2010-2011 by Alex Kloss <alexthkloss@web.de> */
(function(
    s, // single-tag regexp
    r, // attribute regexp
    a, // attribute filter
    d  // div node (for testing as well as innerHTML conversion)
){
// only if outerHTML is not available, set normalisation
if (!d.outerHTML) t._.nf.outerHTML = [
    // outerHTML getter
    function(
        n, // node
        e, // placeholder for nodeName
        o  // attribute object
    ) {
        // save node name in lower case in e and return false if e is falsy
        return (e=(n.nodeName || '').toLowerCase()) &&
            // otherwise, init attribute storage and find node's attributes (search for them in parent's innerHTML)
            (o={}, n.parentNode.innerHTML.replace(r, function(_, a) { if (n[a]) o[a] = n[a] }),
            // return outerHTML
            '<'+e+((o=t.p(o,'="','"',' ','',a,a)) ? o+'"' : '')+(s.test(e) ? '/>' : '>'+n.innerHTML+'</'+e+'>'));
    },
    // outerHTML setter
    function(
        n, // node
        v  // set outerHTML
    ) { 
        // create new nodes inside stored div
        d.innerHTML = v;
        // insert them in front of old node
        t(d).i(function(i, c) { n.parentNode.insertBefore(c, n); });
        // remove old node
        t(n).r();
    }]
})(
    /^(area|base|br|col|frame|hr|img|input|link|meta|param)$/, // single tag
    /([\w-]+)\=\"/g, // attribute name
    function(x){return x}, // "filter" function
    document.createElement('div') // anonymous div node
);
