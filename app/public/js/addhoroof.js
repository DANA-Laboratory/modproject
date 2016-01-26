var sVAVs = ' و ' ;
var sefr = 'صفر' ;
var farsi_a = [' تریلیون',' میلیارد',' میلیون',' هزار',''];
var farsi_b = ['','یكصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد','هفتصد','هشتصد','نهصد'];
var farsi_c = [ 'ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده','هفده', 'هجده', 'نوزده'];
var farsi_d = [ '','', 'بیست', 'سی', 'چهل', 'پنجاه' , 'شصت', 'هفتاد', 'هشتاد','نود'];
var farsi_e = [ '','یك', 'دو', 'سه', 'چهار', 'پنج' , 'شش', 'هفت', 'هشت', 'نه'];
function Adad(num) {
    if (num == 0) {
        return sefr;
    }
    var Flag;
    var S;
    //    var I;
    var L;
    var K = new Array(5);

    S = (num + '').trim();
    L = S.length;
    if (L > 15) {
        return 'بسیار بزرگ';
    }

    for (var i = 0; i < (  15 - L); i++) {
        S = '0' + S;
    }
    for (var i = 0; i < 5; i++) {
        K[i] = 0;
    }
    for (var i = 0; i < ((L / 3) + 0.99).toFixed(0); i++) {
        var xxx = 3 * ((5 - i) - 1);
        K[5 - i - 1] = Number(S.substring(xxx, xxx + 3));
    }
    Flag = false;
    S = '';

    for (var I = 0; I < 5; I++) {
        if (K[I] != 0) {
            switch (I) {
                case 0:
                    S = S + Three(K[I]) + farsi_a[0];
                    Flag = true;
                    break;
                case 1:
                    S = S + (Flag ? sVAVs : '');
                    S = S + Three(K[I]) + farsi_a[1];
                    Flag = true;
                    break;
                case 2:
                    S = S + (Flag ? sVAVs : '');
                    S = S + Three(K[I]) + farsi_a[2];
                    Flag = true;
                    break;
                case 3:
                    S = S + (Flag ? sVAVs : '');
                    S = S + Three(K[I]) + farsi_a[3];
                    Flag = true;
                    break;
                case 4:
                    S = S + (Flag ? sVAVs : '');
                    S = S + Three(K[I]) + farsi_a[4];
                    Flag = true;
            }
        }//end for
    }//end if
    //  alert(S);
    //    S = (L % 3 == 0 ? S : S.substring(0, S.length - 2));
    return S;
}//end function

function Three(num) {
    var S = '';
    var L;
    var h = new Array(3);
    L = (('' + num).trim()).length;
    if (num == 0) {
        return '';
    }

    if (num == 100) {
        return farsi_b[1];
    }
    if (L == 3) {
        h[0] = Number((('' + num).trim()).substring(0, 1));
        h[1] = Number((('' + num).trim()).substring(1, 2));
        h[2] = Number((('' + num).trim()).substring(2, 3));
    }
    if (L == 2) {
        h[0] = 0;
        h[1] = Number((('' + num).trim()).substring(0, 1));
        h[2] = Number((('' + num).trim()).substring(1, 2));
    }
    if (L == 1) {
        h[0] = 0;
        h[1] = 0;
        h[2] = Number((('' + num).trim()).substring(0, 1));
    }
    S = farsi_b[h[0]];
    switch (h[1]) {
        case 1:
            S = S + sVAVs + farsi_c[h[2]];
            break;
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            S = S + sVAVs + farsi_d[h[1]];
            break;
    }
    if (h[1] != 1 && h[2] != 0) {
        S = S + sVAVs + farsi_e[h[2]];

    }//end if
    S = (L < 3 ? S.substring(3, S.length) : S);
    return S;
}

