/**
 * Created by AliReza on 7/14/2016.
 */
'use strict';
var fs = require('fs');
var parse = require('csv-parse');
var transform = require('stream-transform');
module.exports = function (callback) {
    var parser = parse({delimiter: ',', columns: true});
    this.callback = callback;
    this.read = function(path) {
        var input = fs.createReadStream(path);
        input.pipe(parser).pipe(this.transformer);
    };
    this.transformer = transform((record) => {
        setTimeout(() => {
            this.callback(null, record, parser.count);
        }, 500);
    }, {parallel: 10});
};