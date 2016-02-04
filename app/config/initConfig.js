/**
 * Created by Reza Afzalan.
 */
'use strict';
var appConfig=
          {
              'tasks': [
                  {'name' : 'تعريف در دامنه شرکت', 'id' : 1}
                , {'name' : 'تعريف user کاربر', 'id' : 2}
                , {'name' : 'ليسانس آنتي ويروس', 'id' : 3}
                , {'name' : 'نصب پيرينتر', 'id' : 4}
                , {'name' : 'تعريف ويندوز', 'id' : 5}
                , {'name' : 'ويروس يابي', 'id' : 6}
                , {'name' : 'بروز رساني آنتي ويروس', 'id' : 7}
                , {'name' : 'نصب آنتي ويروس', 'id' : 8}
                , {'name' : 'آموزش', 'id' : 9}
                , {'name' : 'نصب نرم افزار', 'id' : 10}
                , {'name' : 'نصب ويندوز کامل به همراه نرم افزار', 'id' : 11}
                , {'name' : 'بازيابي اطلاعات', 'id' : 12}
                , {'name' : 'پشتيبان گيري اطلاعات', 'id' : 13}
                , {'name' : 'دسترسي به سرور', 'id' : 14}
                , {'name' : 'تنظيمات شبکه', 'id' : 15}
                , {'name' : 'دسترسي به آدرس خاص', 'id' : 16}
                , {'name' : 'اتصال به اينترنت', 'id' : 17}
                , {'name' : 'اختصاص IP', 'id' : 18}
                , {'name' : 'مانيتور', 'id' : 19}
                , {'name' : 'منبع تغذيه', 'id' : 20}
                , {'name' : 'کيبورد', 'id' : 21}
                , {'name' : 'موس', 'id' : 22}
                , {'name' : 'کارت واي فاي', 'id' : 23}
                , {'name' : 'DVD-RW', 'id' : 24}
                , {'name' : 'Duplicator', 'id' : 25}
                , {'name' : 'کابل شبکه', 'id' : 26}
                , {'name' : 'سوکت شبکه Rj45', 'id' : 27}
                , {'name' : 'کابل برق پاور', 'id' : 28}
                , {'name' : 'کارت گرافيک', 'id' : 29}
                , {'name' : 'کابل مانيتور', 'id' : 30}
                , {'name' : 'کابل پيرينتر', 'id' : 31}
                , {'name' : 'کيس کامپيوتر', 'id' : 32}
                , {'name' : 'سيستم يونيت', 'id' : 33}
                , {'name' : 'داکت', 'id' : 34}
                , {'name' : 'سوراخ گرد بُر', 'id' : 35}
                , {'name' : 'هدفون (گوشي)', 'id' : 36}
                , {'name' : 'برق اتصال شبکه', 'id' : 37}
                , {'name' : 'سيستم تلفن', 'id' : 38}
                , {'name' : 'سيار برق', 'id' : 39}
                , {'name' : 'بست کمربندي', 'id' : 40}
                , {'name' : 'هارد ديسک', 'id' : 41}
                , {'name' : 'سويچ شبکه', 'id' : 42}
                , {'name' : 'کارت شبکه', 'id' : 43}
                , {'name' : 'RAM', 'id' : 44}
                , {'name' : 'فن خنک کننده', 'id' : 45}
                , {'name' : 'خاک گيري', 'id' : 46}
                , {'name' : 'باتري مادربرد', 'id' : 47}
                , {'name' : 'فلاپي درايو', 'id' : 48}
              ],
              'useritems': [
                  'کابل کشي شبکه',
                  'کند بودن کامپيوتر',
                  'سيستم يونيت',
                  'تعاريف نرم افزار',
                  'تنظيمات سخت افزاري',
                  'تنظيمات نرم افزاري',
                  'رفع عيب سخت افزار',
                  'رفع عيب نرم افزار',
                  'نصب نرم افزار',
                  'روشن خاموش کامپيوتر'
              ],
              'users': [
                  { 'id': 1, 'username': 'hazizi', 'password': 'rfpc', 'email': 'hazizi@rfpc.ir', 'isOwner':1, 'name':'حسین', 'family':'عزیزی' },
                  { 'id': 2, 'username': 'rfpc', 'password': 'rfpc', 'email': 'rafzalan@rfpc.ir', 'name':'شرکت', 'family':'ره آوران' },
                  { 'id': 3, 'username': 'afzalan', 'password': 'rfpc', 'email': 'rafzalan@rfpc.ir', 'name':'رضا', 'family':'افضلان' }
              ]
          };
var file = '../database/Requests.sqlite';
var sqlite3 = null;
var fs = require('fs');
var exists = fs.existsSync(file);
var db = null;

if (!exists) {
    console.log('database not exists!');
    return;
} 
sqlite3 = require('sqlite3').verbose();
db = new sqlite3.Database(file);
db.run('DELETE FROM config');
for (var item in appConfig.tasks) {
    db.run('INSERT INTO config(itemName,itemType) VALUES(?,0)', appConfig.tasks[item].name);
}
for (var item in appConfig.useritems) {
    db.run('INSERT INTO config(itemName,itemType) VALUES(?,1)', appConfig.useritems[item]);
}
for (var item in appConfig.users) {
    db.run('INSERT INTO config(itemName,itemType) VALUES(?,2)', JSON.stringify(appConfig.users[item]));
}