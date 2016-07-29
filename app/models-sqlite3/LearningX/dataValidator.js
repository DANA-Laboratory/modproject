/**
 * Created by AliReza on 7/28/2016.
 */
exports.validateForInsert = function (tablename, data) {
    return new Promise((resolve, reject) => {
        if (data.hasOwnProperty('attribute')) {
            try {
                JSON.parse(data.attribute);
                resolve(data);
            } catch (err) {
                reject('validateForInsert failed with : ' + err);
            }
        } else {
            if (['tblActor', 'tblCourse', 'tblClass', 'tblStatement', 'tblObject'].indexOf(tablename) > -1)
                reject('validateForInsert failed, ' + tablename + ' needs attribute');
            else
                resolve(data);
        }
    });
};