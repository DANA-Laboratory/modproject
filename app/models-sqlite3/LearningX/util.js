/**
 * Created by AliReza on 7/28/2016.
 */
'use strict';

exports.getSearchStrForAttribute = function (attribute) {
    var str = JSON.stringify(attribute);
    return str.substr(1,str.length-2);
};
exports.getMaxCounter = function(db, table, field, patt) {
    var len = -1;
    var digi = '';
    var zero = '';
    while(! isNaN(patt.substr(len))) {
        len -= 1;
        digi += '_';
        zero += '0';
    }
    var pre = patt.substr(0, Math.abs(patt.length + len + 1));
    return new Promise((resolve, reject) => {
        db.get(`SELECT MAX(${field}) as max FROM ${table} WHERE ${field} LIKE '${pre}${digi}'`, [], function (err, row) {
            if (err) {
                reject(err);
            } else {
                row.max ? resolve(row.max) : resolve(pre + zero);
            }
        });
    });
};
exports.getNextCode = function (lastCode) {
    var len = -1;
    while(! isNaN(lastCode.substr(len)))
        len -= 1;
    var pre = lastCode.substr(0, Math.abs(lastCode.length + len + 1));
    var currentCounter =  lastCode.substr(len + 1);
    return pre + ("0".repeat(currentCounter.length) + (parseInt(currentCounter) + 1)).substr(-1 * currentCounter.length);
};
exports.but = function(a1, a2) {
    var a2Set = new Set(a2);
    return a1.filter(function(x) {
        return !a2Set.has(x);
    });
};
exports.and = function(a1, a2) {
    var a2Set = new Set(a2);
    return a1.filter(function(x) {
        return a2Set.has(x);
    });
};
exports.or = function(a1, a2) {
    return ([... new Set(a2.concat(a1))]);
};
exports.symmetricBut = function(a1, a2) {
    return exports.but(a1, a2).concat(exports.but(a2, a1));
};