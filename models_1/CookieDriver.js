/**
 * Created by admin on 24.01.2017.
 */
var CookieDriver = {
    getCookie: function (name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    setCookie: function (name, value, options) {
        options = options || {};

        var expires = options.expires;

        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + "=" + value;

        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }

        document.cookie = updatedCookie;
    },
    deleteCookie: function (name) {
        this.setCookie(name, "", {
            expires: -1
        })
    },
    hashCode: function (s) {
        return s.split("").reduce(function (a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a
        }, 0);
    },
    getUserID: function () {
        var userId = this.getCookie("MpVideoVisitorID");
//this.deleteCookie("MpVideoVisitorID")
        var self=this;
        if (!userId) {
            userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);

//           var s="client-id-"+navigator.userAgent+Math.random();
//           var userId=this.hashCode(s).toString(16);

            });
            self.setCookie("MpVideoVisitorID", userId,{expires:3600*24*10});

        }
        return userId;
    },
    saveObject: function (obj,ckey) {
        var serialized=btoa(encodeURIComponent(JSON.stringify(obj)));
        var key=ckey||this.hashCode(serialized).toString(16);

        this.setCookie(key,serialized,{expires:3600*24*10});
        return key;
    },
    getObject: function(key,flush){
        var rawdata=this.getCookie(key);
        var result=null;
        if(typeof rawdata!="undefined"&&rawdata){
            var serialized= decodeURIComponent(atob(rawdata));
            result=JSON.parse(serialized);
        }


        if(typeof flush!="undefined"&&flush){
            this.deleteCookie(key);
        }
        return result;

    }
};
module.exports=CookieDriver;