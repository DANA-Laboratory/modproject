/**
 * Created by AliReza on 7/28/2016.
 */
exports.validateForInsert = function (tablename, data) {
    return new Promise((resolve, reject) => {
        if (data.hasOwnProperty('attribute')) {
            try {
                resolve(JSON.parse(data.attribute));
            } catch (err) {
                reject('validateForInsert failed with : ' + err);
            }
        } else {
            if (['tblActor', 'tblCourse', 'tblClass', 'tblStatement', 'tblObject'].indexOf(tablename) > -1) {
                reject('validateForInsert failed, ' + tablename + ' needs attribute');
            }
            else
                resolve(data);
        }
    });
};

exports.validateForDelete = function (tablename, data) {
    return new Promise((resolve, reject) => {
        resolve(data);
    })
};

exports.validateStatement = function (tablename, data) {
    return new Promise((resolve, reject) => {
        if (data.hasOwnProperty('time') &&  data.hasOwnProperty('object') && data.hasOwnProperty('actor') && data.hasOwnProperty('attribute')) {
            resolve(data);
        } else {
            reject('invalid statement data');
        }
    })
};