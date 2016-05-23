/**
 * Created by Afzalan on 5/23/2016.
 */
var moment = require('moment-jalaali');
module.exports = function(/*sqlite3.Database*/ db, callback) {
    var data=[];
    db.all('SELECT * FROM requests', function (err, rows) {
        if (!err) {
            rows.forEach(function (row, i) {
                var militimes = [row.initdate + ' ' + row.inittime, row.startdate + ' ' + row.starttime, row.enddate + ' ' + row.endtime, row.canceldate + ' ' + row.canceltime].map(function (jd) {
                    return moment(jd, 'jYYYY/jM/jD h:mm').unix()
                }).map(function (unixtime) {
                    return unixtime > 0 ? unixtime * 1000 : null
                });
                var actionUsers = [row.user, row.startuser, row.enduser, row.canceluser];
                var action = ['Create', 'Start', 'End', 'Cancel'];
                var actionComment = [row.description, '', row.actiondescription, row.cancelwhy];

                var requestItems = [row.useritems, row.owneritems];
                var itemOwners = [row.user, row.owner];
                var privileges = [220, 200];
                var createTime = [militimes[0], militimes[1]];

                var requestType  = row.requesttype;
                data.push({militimes: militimes, actionUsers: actionUsers, action: action, actionComment: actionComment, requestItems: requestItems, itemOwners: itemOwners, privileges: privileges, createTime: createTime, requestType: requestType});
            });
            callback(null, data);
        } else {
           callback(err);
        }
    });
};