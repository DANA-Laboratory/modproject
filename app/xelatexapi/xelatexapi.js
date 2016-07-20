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
exports.writeNewcommandexectex = function (tempname, texdef, textable, statementpath, header, footer, callback) {
	fs.writeFileSync(tempname, texdef);
	fs.appendFileSync(tempname, fs.readFileSync(path.join(statementpath, header)));
  fs.appendFileSync(tempname, textable);
	fs.appendFileSync(tempname, fs.readFileSync(path.join(statementpath, footer)));
	execute('xelatex -interaction=batchmode -output-directory=' + statementpath + ' ' + tempname,
		function (out) {
			console.log(out);
      console.log('send statement path: ', tempname.slice(0, -3) + 'pdf');
			callback(tempname.slice(0, -3) + 'pdf');
		}
	);
}