/**
 * Created by admin on 10.03.17.
 */
'use strict';
var  TextSearch={
    excludes: /(https?\:\/\/[^\s]+|лучш.{1,2}|выбира(ем|аю|ай)|[Кк]ак(ой|ая|ие)?|выбрать|выбор|что|[Чч]ем)(\.|\,|\:|\s|\Z)/ig
    , text: encodeURIComponent('Палатка')
    , tags: {}
    , tagSrc: {"h1": {searched: 0, result: ''}, "title": {searched: 0, result: ''}, "h2": {searched: 0, result: ''}}
    , models: {}
    , startSearch: function (tags) {
        if (tags) {
            var tmptags = {};
            var cnt = 0;
            tags = unescape(tags);
            var tmp = tags.split(",");
            for (var i = 0, j = tmp.length; i < j; i++) {
                var hh = tmp[i].replace(/^\s+|\s+$/, '');
                if (hh) {
                    cnt++;
                    if (typeof this.tags[hh] != 'undefined') {
                        tmptags[hh] = this.tags[hh];
                    }
                    else {
                        tmptags[hh] = {searched: 0, result: ''};
                    }
                }
            }
            if (cnt) {
                this.tags = tmptags;
            } else {
                this.tags = this.tagSrc;
            }
        } else {
            this.tags = this.tagSrc;
        }
        return this.parseMyTags();
    }, parseMyTags: function () {
        var results = {models: {}, texts: {}};
        var fstring = '';
        for (var x in this.tags) {
            if (!this.tags[x].searched) {
                this.parseTags(x);
                this.tags[x].searched = 1;
            }
            if (!this.tags[x].searched) {

                this.parseTags(x);
                this.tags[x].searched = 1;
            }
            if (this.tags[x].result) {
                results.texts[x] = this.tags[x].result;
                if (!fstring) {
                    fstring = this.tags[x].result;

                }
                if (typeof this.models[x] != 'undefined') {
                    results.models[x] = this.tags[x].result;
                }
            }
        }
        return results;
    }, parseTags: function (tag) {

        var arr = new Array();
        tag = tag.toLowerCase();
        switch (tag) {
            case "keywords":
                arr = this.documentMeta(tag);
                break;
            default:
                arr = document.querySelectorAll(tag);
                break;
        }
        if (arr && arr.length) {
            var newtext = this.parseStrings(arr, tag);
            if (newtext)
                this.tags[tag].result = newtext;
        }
    }, documentMeta: function (teg) {
        var twords = '';
        var metas = document.getElementsByTagName('meta');
        if (metas) {
            for (var x = 0, y = metas.length; x < y; x++) {
                if (metas[x].name.toLowerCase() == teg) {
                    twords += metas[x].content;
                }
            }
        }
        twords = twords.replace(/^\s+|\s+$/g, '');
        return (twords != '') ? [twords] : false;
    }, parseStrings: function (arr, tag) {
        var mytext = '';
        var mymodel = '';
        var k = 0;
        var kd = 0;
        for (var x = 0, y = arr.length; x < y; x++) {
            var str = '';
            switch (tag) {
                case "keywords":
                    str = arr[x];
                    break;
                default:
                    str = arr[x].innerHTML;

                    break;
            }
            str = str.replace(this.excludes, ' ');
            str = str.replace(/^\s+|\s+$/, '');
            if (str) {
                var res = this.Simplice(str);
                if (k < 2 && res.str) {
                    mytext = this.compairToStrings(mytext, res.str);
                    k++;
                }
                if (kd < 2 && res.model) {
                    mymodel = this.compairToStrings(mymodel, res.model);
                    kd++;
                }
            }
        }
        if (mymodel != '')
            this.models[tag] = 1;

        return (mymodel != '') ? mymodel : mytext;
    }, compairToStrings: function (m1, m2) {
        if (!m1) return m2
        var tmp1 = m1.split(/\s+/);
        var tmp2 = m2.split(/\s+/);
        if (tmp1.length == 1) return m2; //?

        if (tmp1.length < 5) {
            if (tmp2.length < 5) {
                return (tmp1.length > tmp2.length) ? m1 : m2;
            } else {
                return m1;
            }
        } else {
            if (tmp2.length < 5) {
                return m1;  //?
            } else {
                return (tmp1.length > tmp2.length) ? m2 : m1;
            }
        }
    }, Simplice: function (str) {
        var res = {str: '', model: ''};
        str = this.sanitize(str);
        if (str) {
            if (str.length > 100)
                str = str.substr(0, 100);
            res.str = str;
        }
        var models = this.formalize(str);
        if (models.length) {
            res.model = models[0];
        }
        return res;
    }, sanitize: function (str, repl) {
        var entities = [
            ['apos', '\''],
            ['amp', '&'],
            ['lt', '<'],
            ['nbsp', ' '],
            ['gt', '>']

        ];
        repl = repl || " ";
        for (var i = 0, max = entities.length; i < max; ++i)
            str = str.replace(new RegExp('&' + entities[i][0] + ';', 'g'), entities[i][1]);
        str = str.replace(/<\/?[^>]+(>|$)/g, repl);
        str = str.replace(/^[\s\t\r]+|[\s\t\r]+$/g, '');
        return str;
    }, formalize: function (str) {
        var models = new Array();
        if (!str) return false;
        var t = str.split(/\-\—\.\,\!\?\:]+[\s\t\r]+/);
        for (var i = 0, j = t.length; i < j; i++) {
            var name = t[i].replace(/^\s+|\s+$/g, '');
            if (name) {
                var model = this.guessModelsOr(name);
                if (model) {
                    models.push(model)
                }
            }
        }
        return models;
    }, guessModelsOr: function (str) {
        str = str.replace(/^([Лл][Уу][Чч][Шш][Ее]|[Ии][Лл][Ии]|[Ее][Сс][Лл][Ии]|[Оо][Нн]|[Нн][Аа]|[Вв][Сс][Ее])$/gi, '');
        str = str.replace(/^\s+|\s+$/gm, ''); //trim
        str = str.replace(/[\(\)\.\?]/gi, ' ');
        var arr = str.split(/[\s\,\:]+/);
        var scope = new Array();
        var res = new Array();
        var fres = new Array();
        var LastWord = '';
        var LastBook = '';
        for (var i = 0, j = arr.length; i < j; i++) {
            var dstr = arr[i].replace(/^\s+|\s+$/gm, '');
            if (dstr) {
                var flag = this.checkAlphabet(dstr, res.length);

                switch (flag) {
                    case 2:
                        if (!res.length && LastWord) {
                            res.push(LastWord);
                        }
                        res.push(dstr);
                        fres.push(dstr);
                        break;
                    case 3:
                        if (!res && LastWord) {
                            res.push(LastWord);
                        }
                        res.push(dstr);
                        fres.push(dstr);
                        break;
                    case 4:
                        if (!res.length && LastWord) {
                            res.push(LastWord);
                        }
                        res.push(dstr);
                        fres.push(dstr);
                        break;
                    case 5:
                        LastWord = dstr;
                        break;
                    default:
                        if (res.length) {
                            scope.push(res.join(" "));
                            scope.push(fres.join(" "));
                            fres = new Array();
                            res = new Array();
                        }
                        break;
                }
            }
        }

        if (fres.length) {
            scope.push(fres.join(" "));

        }
        if (res.length) {
            scope.push(res.join(" "));
        }
        var model = '';
        var cntz = 0;
        for (var i = 0, j = scope.length; i < j; i++) {
            if (cntz < scope[i].length) {
                model = scope[i];
                cntz = scope[i].length;
            }
        }
        return model;
    }, checkAlphabet: function (str, cnt) {
        var flag = 0;
        var myRe0 = /^[АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя]{4,20}$/ig;
        var myRe2 = /([\d]+)/ig;
        var myRe22 = /([A-Z]+)/i;
        var myArray0 = myRe0.exec(str);
        if (myArray0) {
            return 5;
        }
        var myRe1 = /^([a-z][\da-z\-]+)(\-.*)?$/ig;
        var myArray1 = myRe1.exec(str);
        if (myArray1) {
            //var myRe2 = /([\d]+)/ig;
            var myArray2 = myRe2.exec(str);
            if (myArray2)return 3;
            return 2;
        }
        var myArray2 = myRe2.exec(str);
        if (cnt && myArray2) return 4;
        var myArray22 = myRe22.exec(str);
        if (cnt && myArray22) return 4;
        return 1;
    }
};
module.exports = TextSearch;



