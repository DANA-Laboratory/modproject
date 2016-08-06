/**
 * Created by AliReza on 7/28/2016.
 */
/**
 * Created by AliReza on 5/10/2016.
 */
[require('./fuzzy.js'), require('./insert.js'), require('./delete.js'), require('./statement.js'), require('./importCSV.js'), require('./util.js')].forEach(function(md){
    Object.keys(md).forEach (function(req_f) {
        exports[req_f] = md[req_f];
    });
});