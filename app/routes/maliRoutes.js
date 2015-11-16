/**
 *  * Created by Reza Afzalan.
 e   */
'use strict';
var exec = require('child_process').exec;
function execute(command, callback){
  exec(command, function(error, stdout, stderr){ callback(stdout); });
};
module.exports = function (app, dbma) {
  app.post('/mali/sendstatement', function (req, res) {
    if (((req.connection.remoteAddress === '172.18.1.10') | (req.connection.remoteAddress === '172.18.1.234')) & (req.body.pass === '123')) {
      var callback = function (err) {
        if (err) 
          console.log('insert statements error=', err);
      };         
      var callbackdelete = function (err) {
        if (err) 
          console.log('delete statements error=', err);
      };         
      for (var id in req.body.datas){
        dbma.serialize(function () {
          var d=req.body.datas[id]
          if (req.body.overwrite=="True") {
            dbma.run('DELETE FROM statements WHERE (personel=? AND mah=?)', [d[0] ,d[1]], callbackdelete);
          }
          dbma.run('INSERT INTO statements (personel,mah,data) VALUES (?,?,?)', [d[0] ,d[1], d[2]], callback);
        });
      };
      res.sendStatus(200);
    } else { 
      res.sendStatus(400);
      console.log(req.connection.remoteAddress);
    }
  });
  app.get('/mali/show', function (req,res) {
    execute('xelatex -interaction=batchmode -output-directory=../xelatex  ../xelatex/statement.tex', 
      function(out){
        console.log(out);
        res.sendFile('/home/rfpc/modproject/xelatex/statement.pdf');
      }
    );
  });
}
