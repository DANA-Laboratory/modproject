'use strict';
function gregorianToJalali(date, mod/*''*/) {
    var gY = date.getUTCFullYear();
    var gM = date.getUTCMonth() + 1;
    var gD = date.getUTCDate();

    if (typeof mod === 'undefined') {
        mod = '';
    }

    var d4 = gY % 4;
    var gA = {0 : 0, 1 : 0, 2 : 31, 3 : 59, 4 : 90, 5 : 120, 6 : 151, 7 : 181, 8 : 212, 9 : 243, 10 : 273, 11 : 304, 12 : 334};
    var doyG = gA[parseInt(gM, 10)] + gD;
    if (d4 === 0 && gM > 2) {
        doyG++;
    }
    var d33 = parseInt((((gY - 16) % 132) * 0.0305), 10);
    var a = (d33 === 3 || d33 < (d4 - 1) || d4 === 0) ? 286
      : 287;
    var b = ((d33 === 1 || d33 === 2) && (d33 === d4 || d4 === 1)) ? 78
      : ((d33 === 3 && d4 === 0) ? 80
          : 79);
    if (parseInt((gY - 10) / 63, 10) === 30) {
        a--;
        b++;
    }
    var jy = 0;
    var doyJ = 0;
    if (doyG > b) {
        jy = gY - 621;
        doyJ = doyG - b;
    } else {
        jy = gY - 622;
        doyJ = doyG + a;
    }
    var jm = 0;
    var jd = 0;
    if (doyJ < 187) {
        jm = parseInt((doyJ - 1) / 31, 10);
        jd = doyJ - (31 * jm++);
    } else {
        jm = parseInt((doyJ - 187) / 30, 10);
        jd = doyJ - 186 - (jm * 30);
        jm += 7;
    }
    var jms = (jm<10) ? ('0'+jm) : (jm);
    var jds = (jd<10) ? ('0'+jd) : (jd);
    var result = (mod === '') ? {0 : jy, 1 : jm, 2 : jd} : (jy + '' + mod + '' + jms + '' + mod + '' + jds);
    return result;
}

function jalaliToGregorian(jY, jM, jD, mod/*''*/) {
    if (typeof mod === 'undefined') {
        mod = '';
    }

    var d4 = (jY + 1) % 4;
    var doyJ = (jM < 7) ? ((jM - 1) * 31) + jD
        : ((jM - 7) * 30) + jD + 186;
    var d33 = parseInt(((jY - 55) % 132) * 0.0305, 10);
    var a = (d33 !== 3 && d4 <= d33) ? 287
        : 286;
    var bT = ((d33 === 3 && d4 === 0)) ? 80
        : 79;
    var b = ((d33 === 1 || d33 === 2) && (d33 === d4 || d4 === 1)) ? 78
        : bT;
    if (parseInt((jY - 19) / 63, 10) === 20) {
        a--;
        b++;
    }
    var gy = 0;
    var gd = 0;
    if (doyJ <= a) {
        gy = jY + 621;
        gd = doyJ + b;
    } else {
        gy = jY + 622;
        gd = doyJ - a;
    }
    var gyT = (gy % 4 === 0) ? 29
        : 28;
    var gyArray = [0, 31, gyT, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var gm = 0;
    for (gm in gyArray) {
        var v = gyArray[gm];
        if (gd <= v) {
            break;
        }
        gd -= v;
    }
    var result = (mod === '') ? {0 : gy, 1 : gm, 2 : gd} : gy + '' + mod + '' + gm + '' + mod + '' + gd;
    return result;
}

function shamsiNow() {
    var date = new Date();
    return gregorianToJalali(date, '/') + '-----'  + jalaliToGregorian(1394, 3, 26, '/');
}
