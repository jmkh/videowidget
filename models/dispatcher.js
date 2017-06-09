'use strict';
/**
 * Created by mambrin on 28.03.17.
 */
var VASTPlayer = require('vast-player');
var CookieDriver = require('./CookieDriver');
var VideoSlot = require('./VideoSlot');
var BridgeLib = require('./iFrameBridge');
var paths = require('./_config');

window.Bridge = BridgeLib.Bridge;
window.CallAction = BridgeLib.callAction;
function dispatcher(controller_id, container_id, placeholder_id) {
    this.controller = document.getElementById(controller_id);
    this.container = document.getElementById(controller_id);
    this.placeholder = document.getElementById(placeholder_id);
    this.extraslot = document.createElement("DIV");
    this.extraslot.id = "videoslot";
    this.container.appendChild(this.extraslot);
    this.VideoSlot = new VideoSlot(this.extraslot, this);
    this.queueToPLay = [];
    this.queueToPlaySemaphore = 0;
    this.queueSemaphores = {};
    this.queueToPlayExit = 0;
    this.loadedStatuses = {};
    this.cachedConf = {};
    this.loadedCnt = 0;
    this.playedCnt = 0
    this.playedRoliks = {};
    this.config = {};
    this.links = [];
    this.AllowedStart = 0;
    this.timerToClose = 80;
    this.collbackFunction = function () {
    };
    this.indexMassive = {};
    this.indexDefault = {};
    this.cacheStatisticIndexes = {};
    this.cookieUserid = CookieDriver.getUserID();
    this.lastDriverId = 0;
    this.mytype = "Autoplay";
    this.playedAllCnt = {};
    this.playedJumpedTop = {};
    this.popularTrailer = 0;
    this.OverplayAuto = 0;
    this.OverplayDescFirst = 0;
    this.queueFlashes = [];
    this.referer = 'http://yandex.ru';
    this.current_player = null;
    var self = this;
    if (typeof this.GlobalMyGUITemp == 'undefined') {
        this.GlobalMyGUITemp = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        window.GlobalMyGUITemp = this.GlobalMyGUITemp;
    }
    this.fromUrl = (window.location != window.parent.location) ? document.referrer : document.location.href;
    window.myfromUrl = this.fromUrl;
    window.myRegSrc = {3: 0, 40: 2,55: 2,73: 2,82:2, 43: 2, 44: 2, 36: 2};
    window.myRegSrc = paths.myRegSrc_;
    var matches = this.fromUrl.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    this.fromDomain = matches && matches[1];  // domain will be null if no match is found
    //console.log(["мой домен",domain]);
    //alert(domain);
    //this.fromDomain= (new URL(this.fromUrl)).hostname;

    window.addEventListener("resize", function () {

        self.calculateParameters();
    }, false);
    self.calculateParameters();
    this.AdCounterDiv=self.createAdCounterDiv();
};
//----
dispatcher.prototype.createAdCounterDiv=function(){
    var self=this;

   var AdCounter=document.createElement('div');
    AdCounter.style.zIndex=9999;
    AdCounter.style.color='white';
    AdCounter.style.background="rgba(144,144,144,0.7)";
    //AdCounter.style.borderRadius="2px";

    AdCounter.style.position='absolute';
    AdCounter.style.padding='2px';
    AdCounter.style.top='70px';
    AdCounter.style.left='50px';
    AdCounter.style.fontWeight='800';
    AdCounter.style.opacity='0.7';
    //this.AdCounterDiv=AdCounter;
    this.container.appendChild(AdCounter);
    AdCounter.innerHTML="Привет лунатикам";

    var CounterObject=
    {
        __el:AdCounter,
        render:function() {
            var dontShow=(self.config.type!="3");
            //console.log(dontShow,self.config);
            if(dontShow){AdCounter.innerHTML=''; return;}
            var count = self.calculatePlayed();
            //console.log(count,self.config.adslimit);
            AdCounter.innerHTML="Реклама "+count+"-я из "+self.config.adslimit;
        },
        hide:function(){AdCounter.style.display='none';},
        show:function(){AdCounter.style.display='block';}
    };
CounterObject.hide();
    return CounterObject;
};

//----
dispatcher.prototype.firstPlaySignal = function firstPlaySignal() {
    if (this.OverplayDescFirst) return;
    this.OverplayDescFirst = 1;

};
dispatcher.prototype.calculateParameters = function calculateParameters() {

    var width = screen.width; // ширина 
    var height = screen.height; // высота
    //console.log("Разрешение окна клиента: " + width + "| x |" + height);
};
dispatcher.prototype.setConfig = function setConfig(config, collbackFunction) {

    //console.log(["уровень звука",config.volume]);
    if (0 == 1 && config.hasOwnProperty("testframe")) {
        /*
         config.ads=[{"id":33,"src":"https://instreamvideo.ru/core/vpaid/linear?pid=7&wtag=kinodrevo&&vr=1&rid={rnd}&puid7=1&puid8=7&puid10=1&puid11=1&puid12=16&dl=&duration=360&vn=nokia","priority":"3","title":"Webarama","created_at":"2017-04-11 14:57:23","updated_at":"2017-04-11 14:57:23","pivot":{"id_block":"21","id_source":"18","prioritet":"0"}},{"id":42,"src":"https://video.market-place.su/vast/flash.xml?r={rnd}","priority":"401","title":"тест swf линеар","created_at":"2017-05-03 10:10:56","updated_at":"2017-05-03 10:10:56","pivot":{"id_block":"21","id_source":"41","prioritet":"1"}},{"id":34,"src":"https://instreamvideo.ru/core/vpaid/linear?pid=7&wtag=kinodrevo&&vr=1&rid={rnd}&puid7=1&puid8=7&puid10=1&puid11=1&puid12=16&dl=&duration=360&vn=nokia","priority":"3","title":"Webarama","created_at":"2017-04-11 14:57:23","updated_at":"2017-04-11 14:57:23","pivot":{"id_block":"21","id_source":"18","prioritet":"0"}},{"id":41,"src":"https://video.market-place.su/vast/flash.xml?r={rnd}","priority":"401","title":"тест swf линеар второй (беспокойный)","created_at":"2017-05-03 10:10:56","updated_at":"2017-05-03 10:10:56","pivot":{"id_block":"21","id_source":"41","prioritet":"1"}}];
         */
    }


    if (config.hasOwnProperty('site')) {
        this.fromDomain = config.site;
        //console.log(["domain родителя",this.fromDomain]);
    }
    if (!config.hasOwnProperty('adslimit'))
        config.adslimit = 2;
    this.config = config;
    if (config.hasOwnProperty('referer') && config.referer) {
        this.referer = config.referer;
    }
    this.collbackFunction = collbackFunction;
    if (config.hasOwnProperty("type")) {

        switch (config.type) {
            case "1":
                this.mytype = "Autoplay";
                break;
            case "2":
                this.mytype = "Context";
                break;
            case "3":
                this.mytype = "Overlay";
                break;
            case "4":
                this.mytype = "VAST-Link";
                break;
            default:
                this.mytype = "Video";
                break;
        }

    }

    this.loadedCnt = config.ads.length;
    this.restartQueue();
    this.loadedCnt = config.ads.length;
    this.initQueue(config.ads);
    return;

};
dispatcher.prototype.clearController = function clearController() {
    this.controller.style.display = "none";
};
dispatcher.prototype.showController = function showController() {
    this.controller.style.display = "block";
};
dispatcher.prototype.clearContainer = function clearContainer() {
    this.container.style.display = "none";
};
dispatcher.prototype.showContainer = function showContainer() {
    this.container.style.display = "block";
};
dispatcher.prototype.clearPlaceholder = function clearPlaceholder() {
    this.placeholder.style.display = "none";
};
dispatcher.prototype.showPlaceholder = function showPlaceholder() {
    this.placeholder.style.display = "block";
};
dispatcher.prototype.timerToCloseFn = function timerToCloseFn() {

    if (this.timerToClose < 0) {

        this.LastControllerPan = document.createElement("DIV");
        this.LastControllerPan.style.position = "absolute";
        this.LastControllerPan.style.top = "calc(50% - 50px)";
        this.LastControllerPan.style.left = "calc(50% - 50px)";
        this.LastControllerPan.style.opacity = "0.5";
        this.LastControllerPan.style.filter = "alpha(Opacity=50)";
        this.LastControllerPan.style.color = "#FFFFFF";
        this.LastControllerPan.style.zIndex = "4500";
        this.LastControllerPan.className = "lastController";

        this.LastcloseRemain = document.createElement("DIV");
        this.LastcloseRemain.style.display = "block";
        this.LastcloseRemain.style.marginLeft = "5px";
        this.LastcloseRemain.fontSize = "12px";
        this.LastcloseDiv = document.createElement("DIV");

        this.LastcloseDiv.style.marginLeft = "5px";
        this.LastcloseDiv.style.backgroundImage = "url("+paths.base_path+"/img/exit.png) ";
        this.LastcloseDiv.style.backgroundRepeat = "no-repeat";
        this.LastcloseDiv.style.backgroundSize = "contain";
        this.LastcloseDiv.style.content = '';
        this.LastcloseDiv.className = "hover_button";
        this.LastcloseDiv.style.width = "100px";
        this.LastcloseDiv.style.height = "100px";
        this.LastcloseDiv.title = "закрыть рекламу";
        this.LastcloseDiv.style.cursor = "pointer";
        this.LastcloseDiv.style.display = "block";
        var self = this;
        this.LastcloseDiv.onmouseout = function () {
            self.LastControllerPan.style.opacity = "0.5";
            self.LastControllerPan.style.filter = "alpha(Opacity=50)";
        };
        this.LastcloseDiv.onmouseover = function () {
            self.LastControllerPan.style.opacity = "0.8";
            self.LastControllerPan.style.filter = "alpha(Opacity=80)";
        };
        this.LastcloseDiv.onclick = function () {
            document.body.innerHTML = "";
            if (self.config.hasOwnProperty("page_index")) {
                window.parent.postMessage({
                    name: "die",
                    data: {index: self.config.page_index},
                    bridgeAction: true
                }, '*');
            } else {
                window.parent.postMessage({die: 1}, "*");
            }
            //window.parent.postMessage({name:"die",data:{},bridgeAction:true},'*');
            return true;
        };

        this.LastControllerPan.appendChild(this.LastcloseRemain);
        this.LastControllerPan.appendChild(this.LastcloseDiv);
        if (this.controller) {
            this.controller.appendChild(this.LastControllerPan);
        }


        return;
    }
    this.timerToClose--;
    var self = this;
    setTimeout(function () {
        self.timerToCloseFn();
    }, 1000);

};
dispatcher.prototype.restartQueue = function restartQueue(arrLinks) {
    this.indexMassive = {};
    this.predLoadQueue = [];
    this.queueToPlayExit = 0;
    this.cachedFlagMy = 0;
    this.loadedCnt = 0;
    this.predLoadQueueCachedObjects = {};
    this.loadedStatuses = {};
    this.queueToPLay = [];
    this.queueSemaphores = {};
};
dispatcher.prototype.CheckOverplaySrc = function CheckOverplaySrc(id) {
    if (id == 31 || id == 32) {
        this.OverplayAuto = 1;
        return true;
    }
    return false;
};
dispatcher.prototype.calculatePlayed = function calculatePlayed() {
    var cnt = 0;
    var x;
    for (x in this.playedRoliks) {
        cnt++;
    }
    return cnt;
};
dispatcher.prototype.prepareFrame = function prepareFrame(id) {
    var div = document.createElement('DIV');
    div.id = id;

    //div.style.textAlign = "center";
    //div.style.color = "#ffffff";
    div.style.display = "none";
    div.style.width = "100%";
    div.style.height = "100%";
    this.container.appendChild(div);
    return div;
};
dispatcher.prototype.checkSemaphores = function checkSemaphores() {
    var exitA = 0;
    var x;
    var i = 0;
    for (x in this.queueSemaphores) {
//console.log(["семафоры",x,this.queueSemaphores[x]]);
        i++;
        if (this.queueSemaphores[x])
            exitA = 1;
    }

    if (exitA) return true;
    return false;
};
dispatcher.prototype.deleteSemaphore = function deleteSemaphore(id) {
    this.queueSemaphores[id] = 0;
};
dispatcher.prototype.setSemaphore = function setSemaphore(id) {
    this.queueSemaphores[id] = 1;
};
dispatcher.prototype.dispatchQueue = function dispatchQueue(id, data) {
    //console.log([7441000,id,data]);
    if (this.queueToPlayExit) return;
    this.deleteSemaphore(id); //вытащить пластинку
    if (data.player) {
	     try {
         data.player.container.style.display = "none";
		 }catch(err){
		 console.log(["catch error",err]);
		 }
    }

    var exitA = 0;
    var x;
    var i = 0;
    for (x in this.loadedStatuses) {
        if (this.loadedStatuses[x] == 0) { //не от всех пришёл ответ
            exitA |= 1;
        }
        i++;
    }
    if (i < this.loadedCnt) // не все отправлены
        exitA |= 2;

    if (this.queueToPLay.length) //в очереди на проигрыватель
        exitA |= 4;

    if (this.checkSemaphores())  //все отыграли
        exitA |= 8;

    if (!exitA)
        this.playExit();

};
dispatcher.prototype.initQueue = function initQueue(arrLinks) {
    if (this.queueToPlayExit) return;
    this.cachedFlagMy = 1;
    var self = this;
    var ads_limits=CookieDriver.getObject("mp_src_limits");

   //console.log('lim',ads_limits);
    if(!ads_limits){
        ads_limits={};
    }
    var xdate=new Date();
    var cday=xdate.getDay();
    var dtm=Date.now();
    for (var i = 0, j = arrLinks.length; i < j; i++) {

        if(typeof ads_limits[arrLinks[i].id]!="undefined") {
            var v_limit=parseInt(arrLinks[i].v_limit);
            var v_timeout=parseInt(arrLinks[i].v_timeout);
            if(ads_limits[arrLinks[i].id].day!=cday) {
                ads_limits[arrLinks[i].id].last_play=null;
                ads_limits[arrLinks[i].id].play_cnt=0;
                ads_limits[arrLinks[i].id].day=cday;
            }
            var time_limit=(v_timeout&&((dtm-ads_limits[arrLinks[i].id].last_play)*0.001<v_timeout));
            var count_limit=(v_limit&&(ads_limits[arrLinks[i].id].play_cnt>v_limit));
            if(time_limit||count_limit) {
               //console.log('out limit',arrLinks[i].id);
                self.loadedCnt--;
                continue;

            }
           //console.log(v_timeout,404);
           //console.log((dtm-ads_limits[arrLinks[i].id].last_play)*0.001,404);
           //console.log(404,time_limit,count_limit);

        } else {
            ads_limits[arrLinks[i].id]=
            {
                id:arrLinks[i].id,
                play_cnt:0,
                last_play:null,
                day:cday
            };
        }



//			

		
        if (i && (this.loadedCnt / i) <= 2) {

            this.indexMassive[arrLinks[i].id] = 2;
        }
        if (arrLinks[i].pivot.id_block == 20 || arrLinks[i].pivot.id_block == 28) {
            this.popularTrailer = 6;
        }
        this.CheckOverplaySrc(arrLinks[i].id);
        this.predLoadQueue.push(arrLinks[i]);
    }

    CookieDriver.saveObject(ads_limits,"mp_src_limits");

	if(!this.predLoadQueue){
		this.playExit();
		return;
	}
    this.formLoadQueue(0);
};
dispatcher.prototype.formLoadQueue = function formLoadQueue(f_id) {
//if(!this.cachedFlagMy) return;
    if (this.predLoadQueueCachedObjects.hasOwnProperty(f_id)) {
        return;
    }

    if (this.queueToPlayExit) return;
    var cntPlayed = this.calculatePlayed();
    this.AdCounterDiv.render();


    if (this.config.adslimit <= cntPlayed) {
        this.predLoadQueue = [];
        this.loadedCnt = cntPlayed;
        return;
    }


    this.predLoadQueueCachedObjects[f_id] = 1;
    var self = this;
    var object = this.predLoadQueue.shift();

    if (!object) {
        return;
    }
    var film_id = "bycredit_" + object.id;
    var container = this.prepareFrame(film_id);
    var player = new VASTPlayer(container, {
        withCredentials: true, width: self.config.width, height: self.config.height, bidgeFn: function (id, type, arr) {
            //console.log(["стата на игру",id,type]);
            switch (type) {
                case "firstQuartile":
                    self.sendStatistic({id: id, eventName: 'filterPlayMedia'});
                    self.formLoadQueue(id);
                    break;
            }
            self.sendStatistic({id: id, eventName: type});
            if (typeof self.config.page_index != "undefined") {
                CallAction('adEvent', {index: self.config.page_index, eventName: type}, window.parent);
            }
        }
    });
    player.id_local_source = object.id;
    player.ftime = object.ftime;
    player.local_title = object.title;
    player.local_src = object.src;
    //player.local_domain=this.fromDomain;

    this.loadQueue(player);

};
dispatcher.prototype.loadQueue = function loadQueue(player) {

    if (this.queueToPlayExit) return;
    var self = this;
      var uri = player.local_src.replace(/\{([a-zA-Z0-9]+)\}/g, function (match) {
        var fn = match.replace(/[\{\}]+/g, '');
        switch (fn) {
            case "rnd":
                return Math.random();
                break;
            case "ref":
                return encodeURIComponent(self.referer);
                break;
            case "tems":
                var cats=[

                    ['&puid5=4&puid6=2', 'Кино / Боевик;'],
                    ['&puid5=4&puid6=3', 'Кино / Военный;'],
                    ['&puid5=4&puid6=4', 'Кино / Детектив;'],
                    ['&puid5=4&puid6=5', 'Кино / Документальный;'],
                    ['&puid5=4&puid6=6', 'Кино / Драма;'],
                    ['&puid5=4&puid6=7', 'Кино / Исторический;'],
                    ['&puid5=4&puid6=8', 'Кино / Комедия;'],
                    ['&puid5=4&puid6=9', 'Кино / Криминал;'],
                    ['&puid5=4&puid6=10','Кино / Мелодрама;'],
                    ['&puid5=4&puid6=11', 'Кино / Мистика;'],
                    ['&puid5=4&puid6=12', 'Кино / Молодежный;'],
                    ['&puid5=4&puid6=13', 'Кино / Мюзикл;'],
                    ['&puid5=4&puid6=14', 'Кино / Приключения;'],
                    ['&puid5=4&puid6=15', 'Кино / Семейный;'],
                    ['&puid5=4&puid6=16', 'Кино / Триллер;'],
                    ['&puid5=4&puid6=17', 'Кино / Ужас;'],
                    ['&puid5=4&puid6=18', 'Кино / Фантастика;'],
                    ['&puid5=4&puid6=19', 'Кино / Юмор;'],
                    ['&puid5=4&puid6=20', 'Кино / Прочее'],
                    ['&puid5=16&puid6=21', 'Сериалы / Детектив;'],
                    ['&puid5=16&puid6=23', 'Сериалы / Драма;'],
                    ['&puid5=16&puid6=24', 'Сериалы / Комедия;'],
                    ['&puid5=16&puid6=25', 'Сериалы / Криминал;'],
                    ['&puid5=16&puid6=26', 'Сериалы / Триллер;'],
                    ['&puid5=16&puid6=27', 'Сериалы / Фантастика;'],
                    ['&puid5=16&puid6=28', 'Сериалы / Юмор;'],
                    ['&puid5=16&puid6=29', 'Сериалы / Прочее'],

                    ['&puid5=2&puid6=31', 'Дети и родители / Мультсериалы'],
                    ['&puid5=2&puid6=32', 'Дети и родители / мультфильм короткометражный;'],
                    ['&puid5=2&puid6=33', 'Дети и родители / мультфильм полнометражный']
                ];
                //var rand = Math.floor(Math.random() * cats.length);
            var Gauss=function () {
                var ready = false;
                var second = 0.0;

                this.next = function(mean, dev) {
                    mean = mean == undefined ? 0.0 : mean;
                    dev = dev == undefined ? 1.0 : dev;

                    if (this.ready) {
                        this.ready = false;
                        return this.second * dev + mean;
                    }
                    else {
                        var u, v, s;
                        do {
                            u = 2.0 * Math.random() - 1.0;
                            v = 2.0 * Math.random() - 1.0;
                            s = u * u + v * v;
                        } while (s > 1.0 || s == 0.0);

                        var r = Math.sqrt(-2.0 * Math.log(s) / s);
                        this.second = r * u;
                        this.ready = true;
                        return r * v * dev + mean;
                    }
                };
            };

                var x = new Gauss(); // создаём объект
                var rand=Math.floor(Math.abs(x.next(10,6)))% cats.length;
                //var rnd=Math.floor(Math.abs(x.next(10,6)))% cats.length;
                return cats[rand][0];
                break;
            case "instr1":
                var arr1=['2', '3', '4', '6', '8', '10', '14',
                        '15', '2', '3', '4', '6', '8', '10',
                        '14', '15', '16', '17', '18', '18'];
                var rand = Math.floor(Math.random() * arr1.length);
                return arr1[rand];
                break;
            case "instr2":
               var arr2= ['3', '4', '3', '4', '5'];
                var rand = Math.floor(Math.random() * arr2.length);
                return arr2[rand];
                break;
        }
        if(fn.indexOf('randInt')!=-1){
            var range = fn.replace("randInt",'');
            var r=Math.floor(Math.random() * (range - 1)) + 1;
            return r;
        }
        return match;
    });
    //uri=uri.replace(/https\:\/\//,'//');
    this.loadedStatuses[player.id_local_source] = 0;
    this.sendStatistic({id: player.id_local_source, eventName: 'srcRequest'});
   console.log([7441,player.id_local_source,"request",player.pType,player.local_title]);
    player.load(uri).then(function startAd() {


        self.sendStatistic({id: player.id_local_source, eventName: 'startPlayMedia', mess: ''});
         player.once('AdError', function (reason) {
            console.log([7441,player.id_local_source,"error",player.pType,player.local_title]);
            self.sendStatistic({id: player.id_local_source, eventName: 'errorPlayMedia', mess: ''});
            self.formLoadQueue(player.id_local_source);
            self.loadedStatuses[player.id_local_source] = 2;
            self.dispatchQueue(player.id_local_source, {
                player: player,
                message: 'вернул ' + player.local_title + JSON.stringify(reason)
            });
        });
        player.once('AdStopped', function () {
		console.log([7441,player.id_local_source,"stop",player.pType,player.local_title]);
            self.dispatchQueue(player.id_local_source, {player: player, message: ' остановлен ' + player.local_title});
        });
        self.loadedStatuses[player.id_local_source] = 1;

        player.startAd().then(function (res) {
		console.log([7441,player.id_local_source,"start",player.pType,player.local_title]);
            if (!self.queueToPLay.length && typeof window.myRegSrc[player.id_local_source] == "undefined" && !self.checkSemaphores() && player.pType != 2) {

                player.pau = 0;
                self.current_player=player
            } else {
                player.pau = 1;
                player.pauseAd();
            }

            self.filterQueue(player);
        }).catch(function (reason) {
         console.log([7441,player.id_local_source,"catch error 1",player,player.local_title]);
            self.sendStatistic({id: player.id_local_source, eventName: 'errorPlayMedia', mess: ''});

            self.formLoadQueue(player.id_local_source);

            self.loadedStatuses[player.id_local_source] = 2;
            self.dispatchQueue(player.id_local_source, {
                player: player,
                message: 'не играет ' + player.local_title + JSON.stringify(reason)
            });
        });
    }).catch(function (reason) {
	console.log([7441,player.id_local_source,"catch error 2",reason,player.local_title]);
        if (reason.hasOwnProperty("message") && reason.message == "SECONDFLASH") {

            self.queueFlashes.push(player);
        } else {
            self.sendStatistic({id: player.id_local_source, eventName: 'errorPlayMedia', mess: ''});
        }

        self.formLoadQueue(player.id_local_source);

        self.loadedStatuses[player.id_local_source] = 2;
        self.dispatchQueue(player.id_local_source, {
            player: player,
            message: 'ошибка ' + player.local_title + JSON.stringify(reason)
        });
    });

};
dispatcher.prototype.filterQueue = function filterQueue(player) {
    if (this.queueToPlayExit) return;
    this.queueToPLay.push(player);
    this.playQueue();
};
dispatcher.prototype.playQueue = function playQueue() {
    this.AdCounterDiv.render();
    if (this.queueToPlayExit) return;
    var self = this;
    //console.log([744112,"next  play",player]);
    if (this.checkSemaphores()) {
        setTimeout(function () {
            self.playQueue();

        }, 500);
        return;

    }
    var player = this.queueToPLay.shift();
    this.current_player=player
	console.log([744113,"next  play",player]);

    this.setSemaphore(player.id_local_source);
	if(this.loadedStatuses[player.id_local_source]!=1){
	//console.log([74411,"немогу сделать play - не тот статус",this.loadedStatuses[player.id_local_source],player.pType,player.local_title]);
	this.deleteSemaphore(player.id_local_source);
	//this.playQueue();
	return;
	}


    var container = player.container;
    this.showController();
    this.showContainer();
    this.clearPlaceholder();
    container.style.display = "block";

    this.firstPlaySignal();
    this.VideoSlot.clear();
    this.AdCounterDiv.render();
    this.AdCounterDiv.show();

	//console.log([74411,"play",this.loadedStatuses[player.id_local_source],player.pType,player.local_title]);

    if (player.pType == 3 || player.pType == 36) {
        this.VideoSlot.init(player);
    }

    if (player.pType != 4 && !this.CheckOverplaySrc(player.id_local_source)) {
        player.container.style.opacity = "1";
        player.container.style.filter = "alpha(Opacity=100)";

        self.container.style.opacity = "1";
        self.container.style.filter = "alpha(Opacity=100)";
         console.log(["loaded 1 stop",player.local_title]);
        if (this.OverplayAut != 1 && player.pau == 1) {
            player.resumeAd();


            //
            //console.log(["voume 111 set",self.config.volume]);
        }
        //player.adVolume=self.config.volume;
        //if(typeof player.__private__.player.adVolume=="function"){
        //
        // player.__private__.player.adVolume(self.config.volume);
        // console.log(["advol",player.local_title]);
        // console.log(["advol",typeof player.__private__.player.adVolume]);
        //}

    } else {
        var took = 1;
        player.on('AdRemainingTimeChange', function (args) {
            if (took) {
                took = 0;
                self.clearPlaceholder();
            }
        });
        this.VideoSlot.clear();

        if (this.playType == 2) {
            player.once("AdPlaying", function onAdClickThru() {

                self.container.style.opacity = "0";
                self.container.style.filter = "alpha(Opacity=0)";
            });
        }
        if (this.CheckOverplaySrc(player.id_local_source)) {

            player.once("AdPlaying", function onAdClickThru() {
                self.OverplayAut = 2;
                player.container.style.opacity = "1";
                player.container.style.filter = "alpha(Opacity=100)";
                self.container.style.opacity = "1";
                self.container.style.filter = "alpha(Opacity=100)";
                self.formLoadQueue(player.id_local_source);
                self.sendStatistic({id: player.id_local_source, eventName: 'filterPlayMedia'});

            });
        }
        player.once("AdClickThru", function onAdClickThru(url, id, playerHandles) {
            self.showPlaceholder();
            player.__private__.player.video.play();
            player.container.style.opacity = "1";
            player.container.style.filter = "alpha(Opacity=100)";
            self.container.style.opacity = "1";
            self.container.style.filter = "alpha(Opacity=100)";
            self.VideoSlot.init(player);
        });
    }
    //this.current_player=player;
    player.on('AdRemainingTimeChange', function (args) {
        if(typeof args!="undefined"&&typeof args.sec!="undefined"&&typeof player.ftime!="undefined"&&player.ftime) {
            // console.log( player.ftime,args.sec);
            if( player.ftime==args.sec){
                // console.log("засчитываем");
                self.sendStatistic({id: player.id_local_source, eventName: 'filterPlayMedia'});
            }

        }
    });
};
dispatcher.prototype.playExit = function playExit() {
    if (this.queueFlashes.length) {
        var newplayer = this.queueFlashes.pop();
        newplayer.secondflash = 1;
        //alert(newplayer.local_src);
        this.loadQueue(newplayer);
        return;
    }

    if (this.queueToPlayExit) return;
    this.queueToPlayExit = 1;
    this.VideoSlot.clear();
    this.controller.style.display = 'none';
    //alert(this.config);
    this.collbackFunction(this.config);

};
dispatcher.prototype.sendStatistic = function sendStatistic(data) {

    if (this.indexDefault.hasOwnProperty(data.id)) {
        return;
    }

    var m = '';
    if (typeof data.eventName == 'undefined') {
        return;
    }
    if (typeof this.cacheStatisticIndexes[data.id] == 'undefined') {
        this.cacheStatisticIndexes[data.id] = {};
    }
    if (typeof data.mess != 'undefined') {
        m = data.mess;
    }
    if (typeof this.cacheStatisticIndexes[data.id][data.eventName] != 'undefined') {
        return;
    }
    var dtm=Date.now();
    switch (data.eventName) {
        case "filterPlayMedia":
            var limits=CookieDriver.getObject("mp_src_limits");
            //console.log(433,limits);
            if(limits&&typeof  limits[data.id]!="undefined") {
                limits[data.id].play_cnt+=1;
                limits[data.id].last_play=dtm;

            }else {
                if(!limits){
                    limits={};
                }
                limits[data.id]= {
                    id:data.id,
                        play_cnt:1,
                    last_play:dtm
                };
            }
            if(limits) {
                CookieDriver.saveObject(limits,"mp_src_limits");
            }

            this.playedRoliks[data.id] = "fd";
            break;
    }

    this.cacheStatisticIndexes[data.id][data.eventName] = 1;
	

    //console.log(dtm)
    var preRemoteData = {
        key: this.GlobalMyGUITemp,
        fromUrl: encodeURIComponent(this.fromUrl),
        pid: this.config.pid,
        affiliate_id: this.config.affiliate_id,
        cookie_id: this.cookieUserid,
        id_src: data.id,
        event: data.eventName,
        dtm:dtm,
        mess: m
    };
    var toURL = paths.statistic_url+"?p=" + Math.random() + '&data=' + encodeURIComponent(JSON.stringify(preRemoteData));

    var img = new Image(1, 1);
    img.src = toURL;

};
////
dispatcher.prototype.playAds = function playAds(dopAds, f1) {

    var volu = 0.1;
    var self = this;
    var film_id = "bycredit_" + dopAds.id;
    var container = this.prepareFrame(film_id);
    var player = new VASTPlayer(container, {
        withCredentials: true, bidgeFn: function (id, type, arr) {
            switch (type) {
                case "firstQuartile":


                    break;
            }

        }
    });
    player.id_local_source = dopAds.id;
    player.local_title = dopAds.title;
    player.local_src = dopAds.src;
    if (player.id_local_source == -5) //трейлер
    {

    }
    var uri = player.local_src.replace(/\{([a-z]+)\}/g, function (match) {
        var fn = match.replace(/[\{\}]+/g, '');
        switch (fn) {
            case "rnd":
                return Math.random();
                break
            case "ref":
                return encodeURIComponent(self.referer);
                break;
        }
        return match;
    });

    player.load(uri).then(function startAd() {
        player.once('AdError', function (reason) {
            player.container.style.display = "none";
            self.VideoSlot.clear();
            f1();
        });
        player.once('AdStopped', function () {
            player.container.style.display = "none";
            self.VideoSlot.clear();
            f1();
        });
        if (player.id_local_source == -5) { //


            player.__private__.player.video.muted = true;
            player.__private__.player.video.controls = true;
        }

        player.startAd().then(function (res) {
            player.pauseAd();

            self.showController();
            self.showContainer();
            self.clearPlaceholder();
            container.style.display = "block";

            if (player.pType == 3) {
                if (player.id_local_source == -5) { //трейлер

                    player.__private__.player.video.controls = true;
                } else {
                    self.VideoSlot.init(player);
                }
            }
            if (player.pType != 4) {
                player.container.style.opacity = "1";
                player.container.style.filter = "alpha(Opacity=100)";

                self.container.style.opacity = "1";
                self.container.style.filter = "alpha(Opacity=100)";
                player.resumeAd();

            } else {
                if (player.id_local_source == -4) { //твигл
                    player.container.style.display = "none";
                    self.VideoSlot.clear();
                    f1();
                    return;
                }
                var took = 1;
                player.on('AdRemainingTimeChange', function (args) {
                    if (took) {
                        took = 0;
                        self.clearPlaceholder();
                    }
                });
                self.VideoSlot.clear();
                if (self.playType == 2) {
                    self.container.style.opacity = "0";
                    self.container.style.filter = "alpha(Opacity=0)";
                }
				//console.log([55555559,player.id_local_source,player.pType]);
                player.once("AdClickThru", function onAdClickThru(url, id, playerHandles) {
                    self.showPlaceholder();
                    player.__private__.player.video.play();
                    player.container.style.opacity = "1";
                    player.container.style.filter = "alpha(Opacity=100)";
                    self.container.style.opacity = "1";
                    self.container.style.filter = "alpha(Opacity=100)";
                    if (player.id_local_source == -5) { //
                        //alert(player.__private__.player.video.controls);
                        //player.__private__.player.video.controls=true;
                    } else {
                        self.VideoSlot.init(player);
                    }
                });

            }
        }).catch(function (reason) {
            player.container.style.display = "none";
            self.VideoSlot.clear();
            f1();
        });

    }).catch(function (reason) {
        player.container.style.display = "none";
        self.VideoSlot.clear();
        f1();
    });

};
dispatcher.prototype.playDefault = function playDefault(f1) {
    if ((this.popularTrailer & 1)) {
        f1();
        return;
    }
    this.popularTrailer |= 1;
    var self = this;
    // this.config.default="https://widget.market-place.su/testvast.xml";
    //this.config.default="https://video.market-place.su/vast/flash.xml";
    if (this.config.hasOwnProperty("default") && this.config.default) {

        var dopAds = {
            "id": -3,
            "src": this.config.default,
            "priority": "10",
            "title": "Заглушка",
            "created_at": "2017-03-22 16:29:45",
            "updated_at": "2017-03-22 16:29:45",
            "pivot": {"id_block": "-3", "id_source": "-3", "prioritet": "0"}
        };
        this.playAds(dopAds, f1);
    } else {
        f1();
    }
};
dispatcher.prototype.playTvigle = function playTvigle(f1) {
    if ((this.popularTrailer & 2)||1) {
        //console.log("сразу");
        f1();
        return;
    }
    //console.log("play tvigle 1");
    this.popularTrailer |= 2;
    var isAndroid = /(android)/i.test(navigator.userAgent);
    if (isAndroid) {
        f1();
        return
    }
    var self = this;
    var uri = paths.vast_xml_path+"/tvigle.xml?r={rnd}";
    var dopAds = {
        "id": -4,
        "src": uri,
        "priority": "10",
        "title": "Твигл",
        "created_at": "2017-03-22 16:29:45",
        "updated_at": "2017-03-22 16:29:45",
        "pivot": {"id_block": "-4", "id_source": "-4", "prioritet": "0"}
    };
    this.playAds(dopAds, f1);

};
dispatcher.prototype.playTrailer = function playTrailer(f1) {
    if ((this.popularTrailer & 4)) {
        f1();
        return;
    }
    this.popularTrailer |= 4;
    var self = this;

    var uri = paths.trailers_path;
    var dopAds = {
        "id": -5,
        "src": uri,
        "priority": "10",
        "title": "Трейлеры",
        "created_at": "2017-03-22 16:29:45",
        "updated_at": "2017-03-22 16:29:45",
        "pivot": {"id_block": "-5", "id_source": "-5", "prioritet": "0"}
    };
    this.playAds(dopAds, f1);

};
module.exports = dispatcher; 