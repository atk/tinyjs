/*
    tiny className plugin for tinyJS (c) 2010 by Alex Kloss <alexthkloss@web.de>
    - t(...).C('xy') => (has) true/false;
    - t(...).C(true|1, 'xy') => (set) Class;
    - t(...).C(false|0, 'xy') => (del) Class;
*/
t._.C=function(
    c, // className string for testing or true (set) / false (remove)
    C, // className for setting / removal
    r  // Placeholder for RegExp
) {
    // build regular expression to find className
    r=new RegExp('\\b'+C+'\\b', 'g');
    // either search for classname and return true/false
    return (''+c===c ? r.test(this[0].className) :
        // or set className
        c ? t.i(this, function(i,n) { n.className+=' '+C }, !0) :
        // or remove className
        t.i(this, function(i,n) { n.className=n.className.replace(r, '');} !0);
};
