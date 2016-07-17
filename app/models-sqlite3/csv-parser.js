/**
 * Created by AliReza on 7/14/2016.
 */
'use strict';
var fs = require('fs');
var parse = require('csv-parse');
var transform = require('stream-transform');
module.exports = function (callback, transformFunction) {
    var parser = parse({delimiter: ',', columns: true});
    var transformer = transform((record) => {
        setTimeout(() => {
            transformFunction ? callback(null, transformFunction(record), parser.count) : callback(null, record, parser.count);
        }, 500);
    }, {parallel: 10});
    this.read = function(path) {
        var input = fs.createReadStream(path);
        input.pipe(parser).pipe(transformer);
    };
};