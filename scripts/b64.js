var Conv86 = (function () {
    var chars = (
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
            'abcdefghijklmnopqrstuvwxyz' +
            '0123456789+/'
        ),
        inver = {}, i;
    for (i = 0; i < chars.length; ++i) {
        inver[chars[i]] = i;
    }
    function base8To6(arr8) {
        var arr6 = [], i,
            e1, e2, e3,
            s1, s2, s3, s4,
            d1, d2, d3;
        for (i = 0; i < arr8.length; i += 3) {
            e1 = (d1 = arr8[i]    ) & 255;
            e2 = (d2 = arr8[i + 1]) & 255;
            e3 = (d3 = arr8[i + 2]) & 255;
            // wwwwwwxx xxxxyyyy yyzzzzzz
            s1 =                     e1 >>> 2 ;
            s2 = ((e1 &  3) << 4) + (e2 >>> 4);
            s3 = ((e2 & 15) << 2) + (e3 >>> 6);
            s4 =   e3 & 63                    ;
            arr6.push(s1, s2);
            if (d3 !== undefined)
                arr6.push(s3, s4);
            else if (d2 !== undefined)
                arr6.push(s3);
        }
        arr6.byteLength = arr8.length;
        return arr6;
    }
    function base6To8(arr6) {
        var arr8 = [], i,
            e1, e2, e3,
            s1, s2, s3, s4,
            d1, d2, d3, d4;
        for (i = 0; i < arr6.length; i += 4) {
            s1 = (d1 = arr6[i]    ) & 63;
            s2 = (d2 = arr6[i + 1]) & 63;
            s3 = (d3 = arr6[i + 2]) & 63;
            s4 = (d4 = arr6[i + 3]) & 63;
            // xxxxxx xxyyyy yyyyzz zzzzzz
            e1 = ( s1       << 2) + (s2 >>> 4);
            e2 = ((s2 & 15) << 4) + (s3 >>> 2);
            e3 = ((s3 &  3) << 6) +  s4       ;
            arr8.push(e1);
            if (d3 !== undefined)
                arr8.push(e2, e3);
            else if (d2 !== undefined )
                arr8.push(e2);
        }
        if (arr6.byteLength !== undefined)
            arr8.length = +arr6.byteLength;
        return arr8;
    }
    function base6To64(arr6) {
        var i, b64 = '';
        for (i = 0; i < arr6.length; ++i) b64 += chars.charAt(arr6[i]);
        /*if (arr6.bytesLength) {
            i = arr6.bytesLength % 3;
            if (i) ++i;
        } else */
        i = b64.length % 4;
        b64 += ['', '==', '==', '='][i];
        return b64;
    }
    function base8To64(arr8) {
        return base6To64(base8To6(arr8));
    }
    function base64To6(b64) {
        var arr6 = [],
            i = b64.length, lenMod = 0;
        while (b64.charAt(--i) === '=')
            ++lenMod;
        for (i = 0; i < b64.length - lenMod; ++i)
            arr6.push(inver[b64.charAt(i)]);
        i = b64.length & 3;
        if (i) i = 4 - i;
        i = i + b64.length;
        arr6.byteLength = 3 * i / 4 - lenMod;
        return arr6;
    }
    function base64To8(b64) {
        return base6To8(base64To6(b64));
    }
    // base16
    function base8To16(arr8) {
        var i, arr16 = [];
        for (i = 0; i < arr8.length; i = i + 2)
            arr16.push((arr8[i] << 8) + arr8[i + 1]);
        return arr16;
    }
    function base16To8(arr16) {
        var i, arr8 = [];
        for (i = 0; i < arr16.length; ++i)
            arr8.push(arr16[i] >>> 8, arr16[i] & 255);
        return arr8;
    }
    function base6To16(arr6) {
        return base8To16(base6To8(arr6));
    }
    function base16To6(arr16) {
        return base8To6(base16To8(arr16));
    }
    function base16To64(arr16) {
        return base8To64(base16To8(arr16));
    }
    function base64To16(b64) {
        return base8To16(base64To8(b64));
    }
    // from UTF8 to X
    function utf8To8(str) {
        var arr8 = [], i;
        for (i = 0; i < str.length; ++i)
            arr8.push(str.charCodeAt(i) & 255);
        return arr8;
    }
    function utf8To6(str) {
        return base8To6(utf8To8(str));
    }
    function utf8To16(str) {
        return base8To16(utf8To8(str));
    }
    function utf8To64(str) {
        return base8To64(utf8To8(str));
    }
    // from X to UTF8
    function utf8From8(arr8) {
        var utf8arr = [];
        for (i = 0; i < arr8.length; ++i)
            utf8arr.push(arr8[i]);
        return String.fromCharCode.apply(String, utf8arr);
    }
    function utf8From6(arr6) {
        return utf8From8(base6To8(arr6));
    }
    function utf8From16(arr16) {
        return utf8From8(base16To8(arr16));
    }
    function utf8From64(b64) {
        return utf8From8(base64To8(b64));
    }
    // from UTF16 to X
    function utf16To16(str) {
        var arr16 = [], i, c;
        for (i = 0; i < str.length; ++i) {
            c = str.charCodeAt(i) & 65535;
            arr16.push(((c & 255) << 8) + (c >>> 8));
        }
        return arr16;
    }
    function utf16To8(str) {
        return base16To8(utf16To16(str));
    }
    function utf16To6(str) {
        return base16To6(utf16To16(str));
    }
    function utf16To64(str) {
        return base16To64(utf16To16(str));
    }
    // from X to UTF16
    function utf16From16(arr16) {
        var utf16arr = [];
        for (i = 0; i < arr16.length; ++i)
            utf16arr.push(((arr16[i] & 255) << 8) + (arr16[i] >>> 8));
        return String.fromCharCode.apply(String, utf16arr);
    }
    function utf16From8(arr8) {
        return utf16From16(base8To16(arr8));
    }
    function utf16From6(arr6) {
        return utf16From16(base6To16(arr6));
    }
    function utf16From64(b64) {
        return utf16From16(base64To16(b64));
    }
    return {
        base6: {
            to8: base6To8,
            to16: base6To16,
            to64: base6To64,
        },
        base8: {
            to6: base8To6,
            to16: base8To16,
            to64: base8To64
        },
        base16: {
            to6: base16To6,
            to8: base16To8,
            to64: base16To64
        },
        base64: {
            to6: base64To6,
            to8: base64To8,
            to16: base64To16
        },
        utf8: {
            to8: utf8To8,
            to6: utf8To6,
            to16: utf8To16,
            to64: utf8To64,
            from8: utf8From8,
            from6: utf8From6,
            from16: utf8From16,
            from64: utf8From64
        },
        utf16: {
            to8: utf16To8,
            to6: utf16To6,
            to16: utf16To16,
            to64: utf16To64,
            from8: utf16From8,
            from6: utf16From6,
            from16: utf16From16,
            from64: utf16From64
        }
    };
}());