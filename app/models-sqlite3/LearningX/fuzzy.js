/**
 * Created by Afzalan on 8/6/2016.
 */
var fuzzysearch = require('fuzzysearch');
var fuzzyDB = {};
exports.fuzzyBuild = function (/*basedb*/ db, tblName) {
    return new Promise(function (resolve, reject) {
        db.all(`SELECT attribute FROM ${tblName}`, function (err, rows) {
            if (err)
                reject(err);
            else {
                var keys = new Set();
                var vals = {};
                rows.forEach(function (row) {
                    let attribObject = JSON.parse(row.attribute);
                    Object.keys(attribObject).forEach( function (key) {
                        if(!keys.has(key)) {
                            keys.add(key);
                            vals[key] = new Set();
                        }
                        vals[key].add(attribObject[key]);
                    });
                });
                fuzzyDB[tblName] = vals;
                resolve(keys);
            }
        });
    })
};
exports.fuzzysearch = function (tblName, key, needle) {
    return new Promise(function (resolve, reject) {
        if (fuzzyDB.hasOwnProperty(tblName) && (fuzzyDB[tblName]).hasOwnProperty(key)) {
            var res = [];

            fuzzyDB[tblName][key].forEach(function (val) {
                if (fuzzysearch(needle, val))
                    res.push(val);
            });
            resolve(res);
        } else {
            reject('table of key not found');
        }
    })
};