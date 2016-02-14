/**
 * Created by Reza Afzalan.
 */
'use strict';

module.exports = function (app, db) {
    app.get('/map/irancities', function (req, res) {
        console.log('/map/irancities');
        var callback = function (err, rows) {
            res.json(rows);
        };
        db().all('SELECT * from mapdetails where type=1', callback);
    });
};
