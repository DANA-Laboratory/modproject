/**
 * Created by Afzalan on 8/6/2016.
 */
var fuzzysearch = require('fuzzysearch');
var fuzzyDB = {};
const maxCountOfFuzzyItems = 10;
const maxReachTxt = 'پاسخ های بیشتر ...';
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
            var setIter = (fuzzyDB[tblName][key])[Symbol.iterator]();
            var cnt = 0;
            while (true) {
                let current = setIter.next();
                if (current.done)
                    break;
                else {
                    if (fuzzysearch(needle, current.value)) {
                        res.push(current.value);
                        cnt++;
                        if (cnt >= maxCountOfFuzzyItems) {
                            res.push(maxReachTxt);
                            break;
                        }
                    }
                }
            }
            resolve(res);
        } else {
            reject('table or keys not found');
        }
    })
};