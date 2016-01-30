/**
 *  * Created by Reza Afzalan.
 e   */
'use strict';

var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

function execute(command, callback) {
    exec(command, function (error, stdout) {callback(stdout); });
}

exports.writecommandexectex = function (tempname, texcommand, outputdirectory, texfile, callback) {
	fs.writeFileSync(tempname, texcommand);
	fs.appendFileSync(tempname, fs.readFileSync(path.join(outputdirectory, texfile)));
	execute('xelatex -interaction=batchmode -output-directory=' + outputdirectory + ' ' + tempname,
		function (out) {
			console.log(out);
			callback(tempname.slice(0, -3) + 'pdf');
		}
	);
}			