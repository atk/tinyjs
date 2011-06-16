/* tiny element ready plugin (c) 2010-2011 Alex Kloss */
t.er = function(
    s, // selector
    c, // callback
    i  // interval placeholder
) {
    // check selection, if successful, call callback in its scope, otherwise set timeout to check again
    (i = function(e){ (e=t(s)).length ? c.call(e) : setTimeout(i, 45) })()
}
