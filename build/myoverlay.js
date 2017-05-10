(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
/**
 * Created by admin on 31.03.17.
 */
var CookieDriver = require('./CookieDriver');
function VideoSlot(slot) {

    this.slot = slot || document.querySelector('#videoslot');
    this.slot.style.position="absolute";
    this.slot.style.top="0";
    this.slot.style.left="0";
    this.slot.style.width="100%";
    this.slot.style.height="100%";
    this.slot.style.zIndex=-1;
    this.tick=function(){}; //
    this.player=null;

    var userid=CookieDriver.getUserID();
    var myPlayerSettings = CookieDriver.getObject(userid);
    if(!myPlayerSettings){
        myPlayerSettings={mute:false,tvo:0.2,vo:0.7};
    }
    this.plSettings=myPlayerSettings;
}
VideoSlot.prototype.clear = function () {
    this.slot.innerHTML = '';
    this.slot.style.display='none';
    this.slot.style.zIndex=-1;
};


VideoSlot.prototype.renderControl = function (type,args) {

    switch (type){
        case "timeoutEl":
            var ss=parseInt(args.dur)-parseInt(args.sec);
            ss=(ss>0)?ss:0;
            var txt="<span class='innerSpan'>Реклама: "+
                (ss);
            if(args.showControls&&(args.skipTime>0)) {
                txt+="  Пропустить через: "+	((args.skipTime>0)?args.skipTime:0);
            }
            txt+=" </span>";
            return txt;


            break;
        case "advLink":
            return "<span class='innerSpan' >"+args+ "</span>";

        case "skipAd":
            return "<span class='innerSpan'>Пропустить </span>";
        case "closeAd":
            return "<span class='innerSpan'> </span>";
        case "muteButton":
            return "<span class='innerSpan "+(args?"un":"")+"mute'> </span>";
        default:
            return "";
    }

};


VideoSlot.prototype.init = function (player) {

    var self=this;
    self.clear();
    self.slot.style.zIndex=999;
    self.player=player;
    self.player.adVolume= self.plSettings.mute?0:self.plSettings.vo;
   
    self.Extentions={
        linkTxt:"Перейти на сайт рекламодателя",
        isClickable:0,
        controls:0,
        skipTime:"00:10",
        skipTime2:"00:05",
        skipAd:[],
        addClick:[]


    };
    self.player.vast.map('ads[0].extensions', function(extension){

        if(extension.type=="linkTxt" && extension.value){
            self.Extentions.linkTxt=extension.value.replace(/^\s+|\s+$/,'');
        }
        if(extension.type=="isClickable" && extension.value){
            self.Extentions.isClickable=extension.value.replace(/^\s+|\s+$/,'');
        }
        if(extension.type=="controls" && extension.value){
            self.Extentions.controls=extension.value.replace(/^\s+|\s+$/,'');
        }
        if(extension.type=="skipTime" && extension.value){
            //   console.log(['двандва',extension]);
            self.Extentions.skipTime=extension.value.replace(/^\s+|\s+$/,'');
        }
        if(extension.type=="skipTime2" && extension.value){
            //console.log(['двантри',extension]);
            self.Extentions.skipTime2=extension.value.replace(/^\s+|\s+$/,'');
        }
        if(extension.type=="skipAd" && extension.value){
            self.Extentions.skipAd.push(extension.value.replace(/^\s+|\s+$/,''));
        }
        if(extension.type=="addClick" && extension.value){
            self.Extentions.addClick.push(extension.value.replace(/^\s+|\s+$/,''));
        }
    });
    self.drawControls();
    self.clickable.onclick=function(){
        self.ConrolePaused(self.Extentions.isClickable);

    };
    self.player.on('AdRemainingTimeChange',function(args) {
        self.ControllerAction(args);
    });
    this.slot.style.display='block';
};


VideoSlot.prototype.drawControls=function() {
    var self=this;

    //clickable
    self.clickable=document.createElement("DIV");
    self.clickable.setAttribute("id","clickable");
    //self.clickable.style.width=self.config.width+"px";
    //self.clickable.style.height=self.config.height+"px";
     self.clickable.style.width="100%";
    self.clickable.style.height="100%";
    self.clickable.style.border="1px solid #000000";
    self.clickable.style.position="absolute";
    self.clickable.style.top="0";
    self.clickable.style.left="0";
    self.clickable.style.cursor="pointer";
    self.clickable.style.zIndex=1000;
    self.slot.appendChild(self.clickable);
    //pause
    self.resumeButton=document.createElement("DIV");
    self.resumeButton.style.zIndex=1003;
    self.resumeButton.style.color="#FFFFFF";
    self.resumeButton.style.width="100%";
    self.resumeButton.style.height="100%";
    self.resumeButton.style.cursor="pointer";
    self.resumeButton.style.display="none";
    self.resumeButton.className="resume-play";
    self.clickable.appendChild(self.resumeButton);
    //timeoutDiv
    var timeoutDiv=document.createElement('div');
    timeoutDiv.id="timeoutDiv";
    self.player.timeoutDiv=timeoutDiv;
    self.slot.appendChild(timeoutDiv);

    //closeDiv
    var closeDiv=document.createElement('div');
    closeDiv.id="closeDiv";
    self.player.closeDiv=closeDiv;
    self.slot.appendChild(closeDiv);
    closeDiv.innerHTML=self.renderControl("closeAd");
    closeDiv.style.display='none';
    closeDiv.onclick=function(e){
        e.preventDefault();
        self.player.emit('close');

        //for(var i =0;i<skipAd.length;i++){
        //	new Image().src = skipAd[i];
        //}
        self.player.stopAd();


    };

    //skipDiv
    var skipDiv=document.createElement('div');
    self.player.skipDiv=skipDiv;
    skipDiv.id="skipDiv";
    self.slot.appendChild(skipDiv);
    skipDiv.innerHTML=self.renderControl("skipAd");
    skipDiv.style.display='none';
    skipDiv.onclick=function(e){
        e.preventDefault();
        self.player.emit('skip');

        for(var i =0;i<self.Extentions.skipAd.length;i++){
            new Image().src = self.Extentions.skipAd[i];
        }
        self.player.stopAd();


    };



    //advLink
    var advLink=document.createElement('div');
    advLink.id="advLink";
    self.player.advLink=advLink;
    self.slot.appendChild(advLink);
    advLink.innerHTML=self.renderControl("advLink",decodeURIComponent(self.Extentions.linkTxt));
    var clickThrough = self.player.vast.get('ads[0].creatives[0].videoClicks.clickThrough');
    if(!clickThrough){
        advLink.style.display='none';
    }

    advLink.onclick=function(e){
        e.preventDefault();
        for(var i =0;i<self.Extentions.addClick.length;i++){
            new Image().src = self.Extentions.addClick[i];
        }


        self.ConrolePaused(1);
    };
    //return;
    //muteButton
    var muteButton=document.createElement('div');
    muteButton.id="muteButton";
    muteButton.style.border="1px solid red";
    muteButton.style.zIndex=9999;
    muteButton.style.position='absolute';
    self.player.muteButton=muteButton;
    self.slot.appendChild(muteButton);
    muteButton.innerHTML=self.renderControl("muteButton",self.player.adVolume);
    muteButton.onclick=function(e){
        e.preventDefault();
        //e.preventBubble();
        //consoleLog([1234321,e.preventDefault])

        self.player.adVolume=self.player.adVolume?0:0.6;
        var userid=CookieDriver.getUserID();
        if(!self.player.adVolume)self.plSettings.mute = true;else{
            self.plSettings.mute=false;
        }
        CookieDriver.saveObject(self.plSettings,userid);


        self.player.muteButton.innerHTML=self.renderControl('muteButton',self.player.adVolume);
        return false;
    }



};


VideoSlot.prototype.ControllerAction=function(args){

    var self=this;
    if(typeof self.player.timeoutDiv=="undefined"){
        return;
    }
    var skipTimeInt=(parseInt(self.Extentions.skipTime.split(":")[0])*60+parseInt(self.Extentions.skipTime.split(":")[1]) )%parseInt(args.dur);
    var skipTimeInt2=(parseInt(self.Extentions.skipTime2.split(":")[0])*60+parseInt(self.Extentions.skipTime2.split(":")[1]))%parseInt(args.dur);
    if(skipTimeInt>skipTimeInt2){
        skipTimeInt=skipTimeInt2;
    }
    var showCLose=(skipTimeInt2<=parseInt(args.sec)&&skipTimeInt2>0);
    var showSkip=(skipTimeInt<=parseInt(args.sec)&&skipTimeInt>0);
    args.skipTime=skipTimeInt-parseInt(args.sec);
    args.showControls=(self.Extentions.controls=="1");
    var txt=self.renderControl("timeoutEl",args);
    self.player.timeoutDiv.innerHTML=txt;

    //показываем контролы, если надо

    if(self.Extentions.controls=="1"&&showCLose){
        //consoleLog([668,'Настало твоё время']);
        self.player.closeDiv.style.display='block';
    }
    if(self.Extentions.controls=="1"&&showSkip){
        //consoleLog([668,'Настало твоё время']);
        self.player.skipDiv.style.display='block';
    }


    //console.log([-2,args]);
};


VideoSlot.prototype.ConrolePaused = function ConrolePaused(isClickable)
{

    if(!this.player.isPaused){
        this.player.isPaused=1;
        this.player.pauseAd();
        if(typeof this.resumeButton)
            this.resumeButton.style.display="block";
        this.player.emit('clickThrough');
        var clickThrough = this.player.vast.get('ads[0].creatives[0].videoClicks.clickThrough');
        //alert(clickThrough);
        var playerHandles=isClickable;
        //if(!this.player.isClicked){
        //this.player.isClicked=1;
        if (playerHandles && clickThrough) {
            window.open(clickThrough);
        }
        //}

    }else{
        if(typeof this.resumeButton!='undefined')
            this.resumeButton.style.display="none";
        this.player.isPaused=0;
        this.player.resumeAd();
    }
};
module.exports = VideoSlot;
},{"./CookieDriver":1}],3:[function(require,module,exports){
'use strict';
/** 
 * Created by mambrin on 28.03.17.
 */
var VASTPlayer = require('vast-player');
var CookieDriver = require('./CookieDriver');
var VideoSlot = require('./VideoSlot');
var BridgeLib = require('./iFrameBridge');
window.Bridge=BridgeLib.Bridge;
window.CallAction=BridgeLib.callAction;
function dispatcher(controller_id, container_id, placeholder_id) {
    this.controller = document.getElementById(controller_id);
    this.container = document.getElementById(controller_id);
    this.placeholder = document.getElementById(placeholder_id);
    this.extraslot = document.createElement("DIV");
    this.extraslot.id = "videoslot";
    this.container.appendChild(this.extraslot);
    this.VideoSlot = new VideoSlot(this.extraslot);
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
	this.AllowedStart=0;
	this.timerToClose=80;
	this.collbackFunction=function(){};
	this.indexMassive={};
	this.indexDefault={};
	this.cacheStatisticIndexes={};
	this.cookieUserid=CookieDriver.getUserID();
	this.lastDriverId = 0;
	this.mytype="Autoplay";
	this.playedAllCnt={};
	this.playedJumpedTop={};
	this.popularTrailer=0;
	this.OverplayAuto=0;
	this.OverplayDescFirst=0;
    this.referer = 'http://apptoday.ru';
    var self = this;
    if (typeof this.GlobalMyGUITemp == 'undefined') {
        this.GlobalMyGUITemp = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        window.GlobalMyGUITemp = this.GlobalMyGUITemp;
    }
    this.fromUrl = (window.location != window.parent.location) ? document.referrer : document.location.href;
	this.fromDomain= (new URL(this.fromUrl)).hostname;

    window.addEventListener("resize", function () {
       
    self.calculateParameters();
    }, false);
    self.calculateParameters();
   
};
	
dispatcher.prototype.firstPlaySignal = function firstPlaySignal() {
   if(this.OverplayDescFirst) return;
   this.OverplayDescFirst=1;

};	
dispatcher.prototype.calculateParameters = function calculateParameters() {

    var width = screen.width; // ширина 
    var height = screen.height; // высота
    //console.log("Разрешение окна клиента: " + width + "| x |" + height);
};
dispatcher.prototype.setConfig = function setConfig(config, collbackFunction) {

   // console.log(JSON.stringify(config.ads));
    if(1==1 || config.hasOwnProperty("testframe")){
     config.ads=[{"id":18,"src":"http://ads.adfox.ru/233872/getCode?pp=g&ps=ckql&p2=fboi","priority":"3","title":"Webarama","created_at":"2017-04-11 14:57:23","updated_at":"2017-04-11 14:57:23","pivot":{"id_block":"21","id_source":"18","prioritet":"0"}},{"id":41,"src":"https://video.market-place.su/vast/flash.xml?r={rnd}","priority":"401","title":"тест swf линеар","created_at":"2017-05-03 10:10:56","updated_at":"2017-05-03 10:10:56","pivot":{"id_block":"21","id_source":"41","prioritet":"1"}}];
	}
	
	
	if (config.hasOwnProperty('site')){
	this.fromDomain=config.site;
	console.log(["domain родителя",this.fromDomain]);
	}
    if (!config.hasOwnProperty('adslimit'))
        config.adslimit = 2;
    this.config = config;
    if (config.hasOwnProperty('referer') && config.referer) {
        this.referer = config.referer;
    }
	this.collbackFunction=collbackFunction;
   	if(config.hasOwnProperty("type")){
	
	switch(config.type){
	     case "1":
            this.mytype="Autoplay";
            break;
        case "2":
            this.mytype="Context";
            break;
        case "3":
            this.mytype="Overlay";
            break;
        case "4":
            this.mytype="VAST-Link";
            break;
        default:
            this.mytype="Video";
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
dispatcher.prototype.timerToCloseFn= function timerToCloseFn() {

if(this.timerToClose<0){

    this.LastControllerPan=document.createElement("DIV");
    this.LastControllerPan.style.position="absolute";
    this.LastControllerPan.style.top="calc(50% - 50px)";
    this.LastControllerPan.style.left="calc(50% - 50px)";
    this.LastControllerPan.style.opacity="0.5";
    this.LastControllerPan.style.filter="alpha(Opacity=50)";
    this.LastControllerPan.style.color="#FFFFFF";
    this.LastControllerPan.style.zIndex="4500";
    this.LastControllerPan.className="lastController";

    this.LastcloseRemain=document.createElement("DIV");
    this.LastcloseRemain.style.display="block";
    this.LastcloseRemain.style.marginLeft="5px";
    this.LastcloseRemain.fontSize="12px";
    this.LastcloseDiv=document.createElement("DIV");

    this.LastcloseDiv.style.marginLeft="5px";
    this.LastcloseDiv.style.backgroundImage="url(https://apptoday.ru/ug/img/exit.png) ";
    this.LastcloseDiv.style.backgroundRepeat="no-repeat";
    this.LastcloseDiv.style.backgroundSize="contain";
    this.LastcloseDiv.style.content= '';
    this.LastcloseDiv.className="hover_button";
    this.LastcloseDiv.style.width="100px";
    this.LastcloseDiv.style.height="100px";
    this.LastcloseDiv.title="закрыть рекламу";
    this.LastcloseDiv.style.cursor="pointer";
    this.LastcloseDiv.style.display="block";
    var self=this;
    this.LastcloseDiv.onmouseout=function(){
        self.LastControllerPan.style.opacity="0.5";
        self.LastControllerPan.style.filter="alpha(Opacity=50)";
    };
    this.LastcloseDiv.onmouseover=function(){
        self.LastControllerPan.style.opacity="0.8";
        self.LastControllerPan.style.filter="alpha(Opacity=80)";
    };
    this.LastcloseDiv.onclick=function(){
        document.body.innerHTML="";
		if(self.config.hasOwnProperty("page_index")){
		window.parent.postMessage({name:"die",data:{index:self.config.page_index},bridgeAction:true},'*');
		}else{
        window.parent.postMessage({die:1},"*");
		}
		//window.parent.postMessage({name:"die",data:{},bridgeAction:true},'*');
        return true;
    };

    this.LastControllerPan.appendChild(this.LastcloseRemain);
    this.LastControllerPan.appendChild(this.LastcloseDiv);
    if(this.controller){
        this.controller.appendChild(this.LastControllerPan); 
    }


return;
  }
  this.timerToClose--;
  var self=this;
	    setTimeout(function(){
		self.timerToCloseFn();
		}, 1000);

};
dispatcher.prototype.restartQueue = function restartQueue(arrLinks) {
this.indexMassive={};
this.predLoadQueue=[];
this.queueToPlayExit=0; 
this.cachedFlagMy=0;
this.loadedCnt=0;
this.predLoadQueueCachedObjects={};
this.loadedStatuses={};
this.queueToPLay=[];
this.queueSemaphores={};
};
dispatcher.prototype.CheckOverplaySrc = function CheckOverplaySrc(id) {
if(id==31 || id == 32){
this.OverplayAuto=1;
return true;
}
return false;
};
dispatcher.prototype.calculatePlayed = function calculatePlayed() {
var cnt=0;
var x;
for (x in this.playedRoliks){
  cnt++;
}
return cnt;
};
dispatcher.prototype.prepareFrame = function prepareFrame(id) {
    var div = document.createElement('DIV');
    div.id = id;
    //div.style.background = "#000000 url('//apptoday.ru/autogit/autostop/img/yt-loader.gif') 50% 50% no-repeat";
	//div.style.textAlign = "center";
    //div.style.color = "#ffffff";
    div.style.display = "none";
    div.style.width = "100%";
    div.style.height = "100%";
    this.container.appendChild(div);
    return div;
};
dispatcher.prototype.checkSemaphores = function checkSemaphores() {
var exitA=0;
var x;
var i=0;
for(x in this.queueSemaphores){
i++;
if(this.queueSemaphores[x])
exitA=1;
}
if(exitA) return true;
return false;
};
dispatcher.prototype.deleteSemaphore = function deleteSemaphore(id) {
    this.queueSemaphores[id]=0;
};
dispatcher.prototype.setSemaphore = function setSemaphore(id) {
    this.queueSemaphores[id]=1;
};
dispatcher.prototype.dispatchQueue = function dispatchQueue(id,data) {
 console.log([1,data.message]);
if (this.queueToPlayExit) return;
 this.deleteSemaphore(id); //вытащить пластинку
 if(data.player){
 data.player.container.style.display="none";
 }
 var exitA=0;
 var x;
 var i=0;
 for (x in this.loadedStatuses){
 if(this.loadedStatuses[x]==0){ //не от всех пришёл ответ
 exitA|=1;
 }
 i++;
 }
 if(i<this.loadedCnt) // не все отправлены
 exitA|=2;

 if(this.queueToPLay.length) //в очереди на проигрыватель
 exitA|=4;

     if (this.checkSemaphores())  //все отыграли
	 exitA|=8;
	 if(!exitA)
     this.playExit();   

};
dispatcher.prototype.initQueue = function initQueue(arrLinks) {
if (this.queueToPlayExit) return;
this.cachedFlagMy=1;
	var self=this;
    for (var i = 0, j = arrLinks.length; i < j; i++) {
	if(i && (this.loadedCnt/i)<=2){
	     this.indexMassive[arrLinks[i].id]=2;
	     }
		     if(arrLinks[i].pivot.id_block==20 || arrLinks[i].pivot.id_block==28){
			 this.popularTrailer=6;
			 }
			this.CheckOverplaySrc(arrLinks[i].id);
         	this.predLoadQueue.push(arrLinks[i]);
         }
         this.formLoadQueue(0);
};
dispatcher.prototype.formLoadQueue = function formLoadQueue(f_id) {
//if(!this.cachedFlagMy) return;
if(this.predLoadQueueCachedObjects.hasOwnProperty(f_id)){
return;
}

if(this.queueToPlayExit) return;
var cntPlayed=this.calculatePlayed();
if(this.config.adslimit<=cntPlayed){
this.predLoadQueue=[];
this.loadedCnt=cntPlayed;
return;
}


    this.predLoadQueueCachedObjects[f_id]=1;
    var self=this; 
    var object = this.predLoadQueue.shift();
   
	if(!object){
	return;
	}
	            var film_id = "bycredit_" + object.id;
                var container = this.prepareFrame(film_id);
                var player = new VASTPlayer(container, {withCredentials: true,width:self.config.width,height:self.config.height,bidgeFn:function(id,type,arr){

				switch(type){
				case "firstQuartile":
				self.sendStatistic({id:id,eventName:'filterPlayMedia'}); 
				self.formLoadQueue(id);
				break;
				}
				self.sendStatistic({id:id,eventName:type}); 
				if(typeof self.config.page_index!= "undefined"){
				CallAction('adEvent',{index:self.config.page_index,eventName:type},window.parent);
				}
				}});
                player.id_local_source = object.id;
                player.local_title = object.title;
				player.local_src = object.src;
				//player.local_domain=this.fromDomain;
				 
                this.loadQueue(player);
				
};
dispatcher.prototype.loadQueue = function loadQueue(player) {

 if (this.queueToPlayExit) return;
	var self = this;
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
	//uri=uri.replace(/https\:\/\//,'//');
    this.loadedStatuses[player.id_local_source] = 0;
	this.sendStatistic({id:player.id_local_source,eventName:'srcRequest'});  
	
	player.load(uri).then(function startAd() {
	
	console.log(["loaded 1"]);
	
	self.sendStatistic({id:player.id_local_source,eventName:'startPlayMedia',mess:''}); 
	    player.once('AdError', function (reason) {
		//alert(22);
		self.sendStatistic({id:player.id_local_source,eventName:'errorPlayMedia',mess:''}); 
        self.formLoadQueue(player.id_local_source);
	         
		self.dispatchQueue(player.id_local_source,{player:player,message:'вернул '+player.local_title+JSON.stringify(reason)});
		});
		player.once('AdStopped', function () {
		self.dispatchQueue(player.id_local_source,{player:player,message:' остановлен '+player.local_title});
         });
	     self.loadedStatuses[player.id_local_source] = 1;
		 //alert(player.id_local_source);
		 //alert([player.pType,player.local_title]);
	     player.startAd().then(function (res) {
		 
	    if(!self.queueToPLay.length && player.id_local_source!=3 && player.id_local_source!=36 && player.id_local_source!=40 && player.pType!=2){
	   
		player.pau=0;
		}else{
		player.pau=1;
		player.pauseAd();
		}
        self.filterQueue(player); 
        }).catch(function (reason) {
		
		    self.sendStatistic({id:player.id_local_source,eventName:'errorPlayMedia',mess:''}); 

	        self.formLoadQueue(player.id_local_source);

		self.loadedStatuses[player.id_local_source] = 2;
		self.dispatchQueue(player.id_local_source,{player:player,message:'не играет '+player.local_title+JSON.stringify(reason)});
	    });
	}).catch(function(reason){
	
    self.sendStatistic({id:player.id_local_source,eventName:'errorPlayMedia',mess:''}); 

	self.formLoadQueue(player.id_local_source);

	self.loadedStatuses[player.id_local_source] = 2;
	self.dispatchQueue(player.id_local_source,{player:player,message:'ошибка '+player.local_title+JSON.stringify(reason)});
	});
	
};
dispatcher.prototype.filterQueue = function filterQueue(player) {
    if (this.queueToPlayExit) return;
    this.queueToPLay.push(player);   
    this.playQueue();
};
dispatcher.prototype.playQueue = function playQueue() {
    if (this.queueToPlayExit) return;
    var self = this;
    if (this.checkSemaphores()) {
        setTimeout(function () {
            self.playQueue();
        }, 500);
        return;

    }
    var player = this.queueToPLay.shift();
    this.setSemaphore(player.id_local_source); 
	
    var container = player.container;
    this.showController();
    this.showContainer();
    this.clearPlaceholder();
	container.style.display = "block";

	this.firstPlaySignal();
    this.VideoSlot.clear();
	if(player.pType==3 || player.pType==36){ 
    this.VideoSlot.init(player);
	}
	
	if(player.pType!=4 && !this.CheckOverplaySrc(player.id_local_source)){
	   player.container.style.opacity="1";
	   player.container.style.filter="alpha(Opacity=100)";
      
	   self.container.style.opacity="1";
	   self.container.style.filter="alpha(Opacity=100)";
	  	if(this.OverplayAut!=1 && player.pau==1){
        player.resumeAd();
        } 
	
	
	}else{
	   var took=1;
	   player.on('AdRemainingTimeChange',function(args) {
	   if(took){
	    took=0;
        self.clearPlaceholder();
		}
       });
	   this.VideoSlot.clear();
   
	   if(this.playType==2){
			player.once("AdPlaying", function onAdClickThru() {
			self.container.style.opacity="0";
			self.container.style.filter="alpha(Opacity=0)";
	     });
		}
	   if(this.CheckOverplaySrc(player.id_local_source)){
	   
		player.once("AdPlaying", function onAdClickThru() {
		self.OverplayAut=2;
	   player.container.style.opacity="1";
	   player.container.style.filter="alpha(Opacity=100)";
	   self.container.style.opacity="1";
	   self.container.style.filter="alpha(Opacity=100)";
	   self.formLoadQueue(player.id_local_source);
	   self.sendStatistic({id:player.id_local_source,eventName:'filterPlayMedia'}); 
	   
		 });
	   }
	   player.once("AdClickThru", function onAdClickThru(url, id, playerHandles) {
	   self.showPlaceholder();
	   player.__private__.player.video.play();
	   player.container.style.opacity="1";
	   player.container.style.filter="alpha(Opacity=100)";
	   self.container.style.opacity="1";
	   self.container.style.filter="alpha(Opacity=100)";
	   self.VideoSlot.init(player);
    });
	}
};
dispatcher.prototype.playExit = function playExit() {

    if (this.queueToPlayExit) return;
	this.queueToPlayExit = 1;
	this.VideoSlot.clear();
    this.controller.style.display = 'none';
	//alert(this.config);
    this.collbackFunction(this.config);

};
dispatcher.prototype.sendStatistic = function sendStatistic(data) 
{

  if(this.indexDefault.hasOwnProperty(data.id)){
   return;
  }

  var m='';
  if (typeof data.eventName=='undefined'){
  return;
  }
  if (typeof this.cacheStatisticIndexes[data.id]=='undefined'){
  this.cacheStatisticIndexes[data.id]={};
  }
  if (typeof data.mess!='undefined'){
  m=data.mess;
  }
 if (typeof this.cacheStatisticIndexes[data.id][data.eventName]!='undefined'){
  return;
 }
 switch(data.eventName){
 case "filterPlayMedia":
 this.playedRoliks[data.id] = "fd";
 break;
 }
 
  this.cacheStatisticIndexes[data.id][data.eventName]=1; 
  var preRemoteData={key:this.GlobalMyGUITemp,fromUrl:encodeURIComponent(this.fromUrl),pid:this.config.pid,affiliate_id:this.config.affiliate_id,cookie_id:this.cookieUserid,id_src:data.id,event:data.eventName,mess:m}; 
  var toURL="https://api.market-place.su/Product/video/l1stat.php?p="+Math.random()+'&data='+encodeURIComponent(JSON.stringify(preRemoteData));
    var img = new Image(1,1);
    img.src = toURL; 
   
};
////
dispatcher.prototype.playAds = function playAds(dopAds,f1){

    var volu=0.1;
    var self = this;
    var film_id = "bycredit_" + dopAds.id;
    var container = this.prepareFrame(film_id);
    var player = new VASTPlayer(container, {withCredentials: true,bidgeFn:function(id,type,arr){
        switch(type){
            case "firstQuartile":


                break;
        }

    }});
    player.id_local_source = dopAds.id;
    player.local_title = dopAds.title;
    player.local_src = dopAds.src;
    if(player.id_local_source==-5) //трейлер
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
            player.container.style.display="none";
            self.VideoSlot.clear();
            f1();
        });
        player.once('AdStopped', function () {
            player.container.style.display="none";
            self.VideoSlot.clear();
            f1();
        });
        if(player.id_local_source==-5){ //
            

            player.__private__.player.video.muted=true;
            player.__private__.player.video.controls=true;
        }

        player.startAd().then(function (res) {
            player.pauseAd();

            self.showController();
            self.showContainer();
            self.clearPlaceholder();
            container.style.display = "block";

            if(player.pType==3){
                if(player.id_local_source==-5){ //трейлер

                    player.__private__.player.video.controls=true;
                }else{
                    self.VideoSlot.init(player);
                }
            }
            if(player.pType!=4){
                player.container.style.opacity="1";
                player.container.style.filter="alpha(Opacity=100)";

                self.container.style.opacity="1";
                self.container.style.filter="alpha(Opacity=100)";
                player.resumeAd();

            }else{
                if(player.id_local_source==-4){ //твигл
                    player.container.style.display="none";
                    self.VideoSlot.clear();
                    f1();
                    return;
                }
                var took=1;
                player.on('AdRemainingTimeChange',function(args) {
                    if(took){
                        took=0;
                        self.clearPlaceholder();
                    }
                });
                self.VideoSlot.clear();
                if(self.playType==2){
                    self.container.style.opacity="0";
                    self.container.style.filter="alpha(Opacity=0)";
                }
                player.once("AdClickThru", function onAdClickThru(url, id, playerHandles) {
                    self.showPlaceholder();
                    player.__private__.player.video.play();
                    player.container.style.opacity="1";
                    player.container.style.filter="alpha(Opacity=100)";
                    self.container.style.opacity="1";
                    self.container.style.filter="alpha(Opacity=100)";
                    if(player.id_local_source==-5){ //
                        //alert(player.__private__.player.video.controls);
                        //player.__private__.player.video.controls=true;
                    }else{
                        self.VideoSlot.init(player);
                    }
                });

            }
        }).catch(function (reason) {
            player.container.style.display="none";
            self.VideoSlot.clear();
            f1();
        });

    }).catch(function(reason){
        player.container.style.display="none";
        self.VideoSlot.clear();
        f1();
    });

};
dispatcher.prototype.playDefault = function playDefault(f1){
    if((this.popularTrailer&1)){
        f1();
        return;
    }
    this.popularTrailer|=1;
    var self = this;
   // this.config.default="https://widget.market-place.su/testvast.xml";
   //this.config.default="https://video.market-place.su/vast/flash.xml";
    if(this.config.hasOwnProperty("default") && this.config.default){

        var dopAds={"id":-3,"src":this.config.default,"priority":"10","title":"Заглушка","created_at":"2017-03-22 16:29:45","updated_at":"2017-03-22 16:29:45","pivot":{"id_block":"-3","id_source":"-3","prioritet":"0"}};
        this.playAds(dopAds,f1);
    }else{
        f1();
    }
};
dispatcher.prototype.playTvigle = function playTvigle(f1){
    if((this.popularTrailer&2)){
        f1();
        return;
    }
	console.log("play tvigle 1");
    this.popularTrailer|=2;
    var isAndroid = /(android)/i.test(navigator.userAgent);
    if(isAndroid){
        f1();
        return
    }
    var self = this;
    var uri="https://video.market-place.su/vast/tvigle.xml?r={rnd}";
    var dopAds={"id":-4,"src":uri,"priority":"10","title":"Твигл","created_at":"2017-03-22 16:29:45","updated_at":"2017-03-22 16:29:45","pivot":{"id_block":"-4","id_source":"-4","prioritet":"0"}};
    this.playAds(dopAds,f1);

};
dispatcher.prototype.playTrailer = function playTrailer(f1){
    if((this.popularTrailer&4)){
        f1();
        return;
    }
    this.popularTrailer|=4;
    var self = this;
    var uri="https://video.market-place.su/proxy_trailer/";
    var dopAds={"id":-5,"src":uri,"priority":"10","title":"Трейлеры","created_at":"2017-03-22 16:29:45","updated_at":"2017-03-22 16:29:45","pivot":{"id_block":"-5","id_source":"-5","prioritet":"0"}};
    this.playAds(dopAds,f1);

};
module.exports = dispatcher; 
},{"./CookieDriver":1,"./VideoSlot":2,"./iFrameBridge":4,"vast-player":23}],4:[function(require,module,exports){
/**
 * Created by admin on 13.03.17.
 */
'use strict';
function makeBridge(index){
    var index=index||getUniqueIndex();
    if(typeof  window.MpFrameBridges=="undefined") {
        window.MpFrameBridges={};
    };
    if(typeof  window.MpFrameBridges[index]!="undefined") {
        return  window.MpFrameBridges[index];
    }else {
        window.MpFrameBridges[index]=new Bridge(index);
        return window.MpFrameBridges[index];
    }

}
function callAction(name,data,window) {
    // посылает сообщение для указанного window.

    // action содержит в себе имя события и данные для развертывания
	
    window.postMessage({name:name,data:data,bridgeAction:true},'*');
}
function getUniqueIndex(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}
function Bridge(index){

    this.index=index||getUniqueIndex();


    var self=this;

    var actions={
        "default":function(){
            // console.log(actions,this,self)
        }
    };

    this.execAction=function(name,data){
	
        var action=actions[name]||actions['default']||function(){};
		//alert(name+' / '+action);
        action.call(this,data);
    };

    this.addAction=function(name,dispatcher){
        actions[name]=dispatcher;
    };
    this.showActions=function(){console.log(actions)};



}
window.makeBridge=makeBridge;
window.mp_bridge_listener=function(event){

    if(typeof  event.data=="object") {
        if(typeof event.data.bridgeAction!="undefined"&& (event.data.bridgeAction==true)) {
            //broadcast
            if(event.data.data.index=="broadcast"&&typeof window.MpFrameBridges!="undefined") {


                for(var i in window.MpFrameBridges)
                {
                    if(window.MpFrameBridges.hasOwnProperty(i)){
                        window.MpFrameBridges[i].execAction(event.data.name,event.data.data);
                    }
                }
            }
            makeBridge(event.data.data.index).execAction(event.data.name,event.data.data);

        }
    }

};
if(typeof window.MpBridgeListenerAttached=="undefined"){
    if (window.addEventListener) {
        window.addEventListener("message",mp_bridge_listener);
    } else {
        // IE8
        window.attachEvent("onmessage",  mp_bridge_listener);
    }
    window.MpBridgeListenerAttached=true;
}

module.exports ={Bridge:makeBridge,callAction:callAction};
},{}],5:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],7:[function(require,module,exports){
(function (global){
'use strict';
var Mutation = global.MutationObserver || global.WebKitMutationObserver;

var scheduleDrain;

{
  if (Mutation) {
    var called = 0;
    var observer = new Mutation(nextTick);
    var element = global.document.createTextNode('');
    observer.observe(element, {
      characterData: true
    });
    scheduleDrain = function () {
      element.data = (called = ++called % 2);
    };
  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
    var channel = new global.MessageChannel();
    channel.port1.onmessage = nextTick;
    scheduleDrain = function () {
      channel.port2.postMessage(0);
    };
  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
    scheduleDrain = function () {

      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      var scriptEl = global.document.createElement('script');
      scriptEl.onreadystatechange = function () {
        nextTick();

        scriptEl.onreadystatechange = null;
        scriptEl.parentNode.removeChild(scriptEl);
        scriptEl = null;
      };
      global.document.documentElement.appendChild(scriptEl);
    };
  } else {
    scheduleDrain = function () {
      setTimeout(nextTick, 0);
    };
  }
}

var draining;
var queue = [];
//named nextTick for less confusing stack traces
function nextTick() {
  draining = true;
  var i, oldQueue;
  var len = queue.length;
  while (len) {
    oldQueue = queue;
    queue = [];
    i = -1;
    while (++i < len) {
      oldQueue[i]();
    }
    len = queue.length;
  }
  draining = false;
}

module.exports = immediate;
function immediate(task) {
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){
'use strict';
var immediate = require('immediate');

/* istanbul ignore next */
function INTERNAL() {}

var handlers = {};

var REJECTED = ['REJECTED'];
var FULFILLED = ['FULFILLED'];
var PENDING = ['PENDING'];

module.exports = Promise;

function Promise(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  this.outcome = void 0;
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}

Promise.prototype["catch"] = function (onRejected) {
  return this.then(null, onRejected);
};
Promise.prototype.then = function (onFulfilled, onRejected) {
  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
    typeof onRejected !== 'function' && this.state === REJECTED) {
    return this;
  }
  var promise = new this.constructor(INTERNAL);
  if (this.state !== PENDING) {
    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
    unwrap(promise, resolver, this.outcome);
  } else {
    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
  }

  return promise;
};
function QueueItem(promise, onFulfilled, onRejected) {
  this.promise = promise;
  if (typeof onFulfilled === 'function') {
    this.onFulfilled = onFulfilled;
    this.callFulfilled = this.otherCallFulfilled;
  }
  if (typeof onRejected === 'function') {
    this.onRejected = onRejected;
    this.callRejected = this.otherCallRejected;
  }
}
QueueItem.prototype.callFulfilled = function (value) {
  handlers.resolve(this.promise, value);
};
QueueItem.prototype.otherCallFulfilled = function (value) {
  unwrap(this.promise, this.onFulfilled, value);
};
QueueItem.prototype.callRejected = function (value) {
  handlers.reject(this.promise, value);
};
QueueItem.prototype.otherCallRejected = function (value) {
  unwrap(this.promise, this.onRejected, value);
};

function unwrap(promise, func, value) {
  immediate(function () {
    var returnValue;
    try {
      returnValue = func(value);
    } catch (e) {
      return handlers.reject(promise, e);
    }
    if (returnValue === promise) {
      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
    } else {
      handlers.resolve(promise, returnValue);
    }
  });
}

handlers.resolve = function (self, value) {
  var result = tryCatch(getThen, value);
  if (result.status === 'error') {
    return handlers.reject(self, result.value);
  }
  var thenable = result.value;

  if (thenable) {
    safelyResolveThenable(self, thenable);
  } else {
    self.state = FULFILLED;
    self.outcome = value;
    var i = -1;
    var len = self.queue.length;
    while (++i < len) {
      self.queue[i].callFulfilled(value);
    }
  }
  return self;
};
handlers.reject = function (self, error) {
  self.state = REJECTED;
  self.outcome = error;
  var i = -1;
  var len = self.queue.length;
  while (++i < len) {
    self.queue[i].callRejected(error);
  }
  return self;
};

function getThen(obj) {
  // Make sure we only access the accessor once as required by the spec
  var then = obj && obj.then;
  if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') {
    return function appyThen() {
      then.apply(obj, arguments);
    };
  }
}

function safelyResolveThenable(self, thenable) {
  // Either fulfill, reject or reject with error
  var called = false;
  function onError(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.reject(self, value);
  }

  function onSuccess(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.resolve(self, value);
  }

  function tryToUnwrap() {
    thenable(onSuccess, onError);
  }

  var result = tryCatch(tryToUnwrap);
  if (result.status === 'error') {
    onError(result.value);
  }
}

function tryCatch(func, value) {
  var out = {};
  try {
    out.value = func(value);
    out.status = 'success';
  } catch (e) {
    out.status = 'error';
    out.value = e;
  }
  return out;
}

Promise.resolve = resolve;
function resolve(value) {
  if (value instanceof this) {
    return value;
  }
  return handlers.resolve(new this(INTERNAL), value);
}

Promise.reject = reject;
function reject(reason) {
  var promise = new this(INTERNAL);
  return handlers.reject(promise, reason);
}

Promise.all = all;
function all(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var values = new Array(len);
  var resolved = 0;
  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    allResolver(iterable[i], i);
  }
  return promise;
  function allResolver(value, i) {
    self.resolve(value).then(resolveFromAll, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
    function resolveFromAll(outValue) {
      values[i] = outValue;
      if (++resolved === len && !called) {
        called = true;
        handlers.resolve(promise, values);
      }
    }
  }
}

Promise.race = race;
function race(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    resolver(iterable[i]);
  }
  return promise;
  function resolver(value) {
    self.resolve(value).then(function (response) {
      if (!called) {
        called = true;
        handlers.resolve(promise, response);
      }
    }, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
  }
}

},{"immediate":7}],9:[function(require,module,exports){
(function (root, factory){
  'use strict';

  /*istanbul ignore next:cant test*/
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else {
    // Browser globals
    root.objectPath = factory();
  }
})(this, function(){
  'use strict';

  var
    toStr = Object.prototype.toString,
    _hasOwnProperty = Object.prototype.hasOwnProperty;

  function isEmpty(value){
    if (!value) {
      return true;
    }
    if (isArray(value) && value.length === 0) {
      return true;
    } else {
      for (var i in value) {
        if (_hasOwnProperty.call(value, i)) {
          return false;
        }
      }
      return true;
    }
  }

  function toString(type){
    return toStr.call(type);
  }

  function isNumber(value){
    return typeof value === 'number' || toString(value) === "[object Number]";
  }

  function isString(obj){
    return typeof obj === 'string' || toString(obj) === "[object String]";
  }

  function isObject(obj){
    return typeof obj === 'object' && toString(obj) === "[object Object]";
  }

  function isArray(obj){
    return typeof obj === 'object' && typeof obj.length === 'number' && toString(obj) === '[object Array]';
  }

  function isBoolean(obj){
    return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
  }

  function getKey(key){
    var intKey = parseInt(key);
    if (intKey.toString() === key) {
      return intKey;
    }
    return key;
  }

  function set(obj, path, value, doNotReplace){
    if (isNumber(path)) {
      path = [path];
    }
    if (isEmpty(path)) {
      return obj;
    }
    if (isString(path)) {
      return set(obj, path.split('.'), value, doNotReplace);
    }
    var currentPath = getKey(path[0]);

    if (path.length === 1) {
      var oldVal = obj[currentPath];
      if (oldVal === void 0 || !doNotReplace) {
        obj[currentPath] = value;
      }
      return oldVal;
    }

    if (obj[currentPath] === void 0) {
      if (isNumber(currentPath)) {
        obj[currentPath] = [];
      } else {
        obj[currentPath] = {};
      }
    }

    return set(obj[currentPath], path.slice(1), value, doNotReplace);
  }

  function del(obj, path) {
    if (isNumber(path)) {
      path = [path];
    }

    if (isEmpty(obj)) {
      return void 0;
    }

    if (isEmpty(path)) {
      return obj;
    }
    if(isString(path)) {
      return del(obj, path.split('.'));
    }

    var currentPath = getKey(path[0]);
    var oldVal = obj[currentPath];

    if(path.length === 1) {
      if (oldVal !== void 0) {
        if (isArray(obj)) {
          obj.splice(currentPath, 1);
        } else {
          delete obj[currentPath];
        }
      }
    } else {
      if (obj[currentPath] !== void 0) {
        return del(obj[currentPath], path.slice(1));
      }
    }

    return obj;
  }

  var objectPath = {};

  objectPath.ensureExists = function (obj, path, value){
    return set(obj, path, value, true);
  };

  objectPath.set = function (obj, path, value, doNotReplace){
    return set(obj, path, value, doNotReplace);
  };

  objectPath.insert = function (obj, path, value, at){
    var arr = objectPath.get(obj, path);
    at = ~~at;
    if (!isArray(arr)) {
      arr = [];
      objectPath.set(obj, path, arr);
    }
    arr.splice(at, 0, value);
  };

  objectPath.empty = function(obj, path) {
    if (isEmpty(path)) {
      return obj;
    }
    if (isEmpty(obj)) {
      return void 0;
    }

    var value, i;
    if (!(value = objectPath.get(obj, path))) {
      return obj;
    }

    if (isString(value)) {
      return objectPath.set(obj, path, '');
    } else if (isBoolean(value)) {
      return objectPath.set(obj, path, false);
    } else if (isNumber(value)) {
      return objectPath.set(obj, path, 0);
    } else if (isArray(value)) {
      value.length = 0;
    } else if (isObject(value)) {
      for (i in value) {
        if (_hasOwnProperty.call(value, i)) {
          delete value[i];
        }
      }
    } else {
      return objectPath.set(obj, path, null);
    }
  };

  objectPath.push = function (obj, path /*, values */){
    var arr = objectPath.get(obj, path);
    if (!isArray(arr)) {
      arr = [];
      objectPath.set(obj, path, arr);
    }

    arr.push.apply(arr, Array.prototype.slice.call(arguments, 2));
  };

  objectPath.coalesce = function (obj, paths, defaultValue) {
    var value;

    for (var i = 0, len = paths.length; i < len; i++) {
      if ((value = objectPath.get(obj, paths[i])) !== void 0) {
        return value;
      }
    }

    return defaultValue;
  };

  objectPath.get = function (obj, path, defaultValue){
    if (isNumber(path)) {
      path = [path];
    }
    if (isEmpty(path)) {
      return obj;
    }
    if (isEmpty(obj)) {
      return defaultValue;
    }
    if (isString(path)) {
      return objectPath.get(obj, path.split('.'), defaultValue);
    }

    var currentPath = getKey(path[0]);

    if (path.length === 1) {
      if (obj[currentPath] === void 0) {
        return defaultValue;
      }
      return obj[currentPath];
    }

    return objectPath.get(obj[currentPath], path.slice(1), defaultValue);
  };

  objectPath.del = function(obj, path) {
    return del(obj, path);
  };

  return objectPath;
});
},{}],10:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],11:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],12:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],13:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":11,"./encode":12}],14:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],15:[function(require,module,exports){
var objectPath = require('object-path');
var sortBy;
var sort;
var type;

/**
 * Filters args based on their type
 * @param  {String} type Type of property to filter by
 * @return {Function}
 */
type = function(type) {
    return function(arg) {
        return typeof arg === type;
    };
};

/**
 * Return a comparator function
 * @param  {String} property The key to sort by
 * @param  {Function} map Function to apply to each property
 * @return {Function}        Returns the comparator function
 */
sort = function sort(property, map) {
    var sortOrder = 1;
    var apply = map || function(_, value) { return value };

    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function fn(a,b) {
        var result;
        var am = apply(property, objectPath.get(a, property));
        var bm = apply(property, objectPath.get(b, property));
        if (am < bm) result = -1;
        if (am > bm) result = 1;
        if (am === bm) result = 0;
        return result * sortOrder;
    }
};

/**
 * Return a comparator function that sorts by multiple keys
 * @return {Function} Returns the comparator function
 */
sortBy = function sortBy() {

    var args = Array.prototype.slice.call(arguments);
    var properties = args.filter(type('string'));
    var map = args.filter(type('function'))[0];

    return function fn(obj1, obj2) {
        var numberOfProperties = properties.length,
            result = 0,
            i = 0;

        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
        while(result === 0 && i < numberOfProperties) {
            result = sort(properties[i], map)(obj1, obj2);
            i++;
        }
        return result;
    };
};

/**
 * Expose `sortBy`
 * @type {Function}
 */
module.exports = sortBy;
},{"object-path":9}],16:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');
var requestBase = require('./request-base');
var isObject = require('./is-object');

/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  root = this;
}

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Expose `request`.
 */

var request = module.exports = require('./request').bind(null, Request);

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pushEncodedKeyValuePair(pairs, key, obj[key]);
        }
      }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (Array.isArray(val)) {
    return val.forEach(function(v) {
      pushEncodedKeyValuePair(pairs, key, v);
    });
  }
  pairs.push(encodeURIComponent(key)
    + '=' + encodeURIComponent(val));
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }

  var type = status / 100 | 0;

  // status / class
  this.status = this.statusCode = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case
  this._header = {}; // coerces header names to lowercase
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
      // issue #876: return the http status code if the response parsing fails
      err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
      return self.callback(err);
    }

    self.emit('response', res);

    if (err) {
      return self.callback(err, res);
    }

    if (res.status >= 200 && res.status < 300) {
      return self.callback(err, res);
    }

    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
    new_err.original = err;
    new_err.response = res;
    new_err.status = res.status;

    self.callback(new_err, res);
  });
}

/**
 * Mixin `Emitter` and `requestBase`.
 */

Emitter(Request.prototype);
for (var key in requestBase) {
  Request.prototype[key] = requestBase[key];
}

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr && this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set responseType to `val`. Presently valid responseTypes are 'blob' and 
 * 'arraybuffer'.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.responseType = function(val){
  this._responseType = val;
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass, options){
  if (!options) {
    options = {
      type: 'basic'
    }
  }

  switch (options.type) {
    case 'basic':
      var str = btoa(user + ':' + pass);
      this.set('Authorization', 'Basic ' + str);
    break;

    case 'auto':
      this.username = user;
      this.password = pass;
    break;
  }
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  this._getFormData().append(field, file, filename || file.name);
  return this;
};

Request.prototype._getFormData = function(){
  if (!this._formData) {
    this._formData = new root.FormData();
  }
  return this._formData;
};

/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this._header['content-type'];

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this._header['content-type'];
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || isHost(data)) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * @deprecated
 */
Response.prototype.parse = function serialize(fn){
  if (root.console) {
    console.warn("Client-side parse() method has been renamed to serialize(). This method is not compatible with superagent v2.0");
  }
  this.serialize(fn);
  return this;
};

Response.prototype.serialize = function serialize(fn){
  this._parser = fn;
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var query = this._query.join('&');
  this._timeout=15000;

 

  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self.timeoutError();
      if (self.aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(e){
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = 'download';
    self.emit('progress', e);
  };
  if (this.hasListeners('progress')) {
    xhr.onprogress = handleProgress;
  }
  try {
    if (xhr.upload && this.hasListeners('progress')) {
      xhr.upload.onprogress = handleProgress;
    }
  } catch(e) {
    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
    // Reported here:
    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  if (this.username && this.password) {
    xhr.open(this.method, this.url, true, this.username, this.password);
  } else {
    xhr.open(this.method, this.url, true);
  }
  // CORS
  if (this._withCredentials) xhr.withCredentials = true;
  xhr.withCredentials = true;
  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];
    var serialize = this._parser || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }
 
  if (this._responseType) {
    xhr.responseType = this._responseType;
  }
 
  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
 // alert(this.url);
 // try{
  xhr.send(typeof data !== 'undefined' ? data : null);
  //}catch(e){
  //console.log(["catch",e]);
  //}
  return this;
};


/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

function del(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

},{"./is-object":17,"./request":19,"./request-base":18,"emitter":5,"reduce":14}],17:[function(require,module,exports){
/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null != obj && 'object' == typeof obj;
}

module.exports = isObject;

},{}],18:[function(require,module,exports){
/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = require('./is-object');

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

exports.clearTimeout = function _clearTimeout(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Force given parser
 *
 * Sets the body parser no matter type.
 *
 * @param {Function}
 * @api public
 */

exports.parse = function parse(fn){
  this._parser = fn;
  return this;
};

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

exports.timeout = function timeout(ms){
  this._timeout = ms;
  return this;
};

/**
 * Faux promise support
 *
 * @param {Function} fulfill
 * @param {Function} reject
 * @return {Request}
 */

exports.then = function then(fulfill, reject) {
  return this.end(function(err, res) {
    err ? reject(err) : fulfill(res);
  });
}

/**
 * Allow for extension
 */

exports.use = function use(fn) {
  fn(this);
  return this;
}


/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

exports.get = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */

exports.getHeader = exports.get;

/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

exports.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 */
exports.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File|Buffer|fs.ReadStream} val
 * @return {Request} for chaining
 * @api public
 */
exports.field = function(name, val) {
  this._getFormData().append(name, val);
  return this;
};

},{"./is-object":17}],19:[function(require,module,exports){
// The node and browser modules expose versions of this with the
// appropriate constructor function bound as first argument
/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(RequestConstructor, method, url) {
  // callback
  if ('function' == typeof url) {
    return new RequestConstructor('GET', method).end(url);
  }

  // url first
  if (2 == arguments.length) {
    return new RequestConstructor('GET', method);
  }

  return new RequestConstructor(method, url);
}

module.exports = request;

},{}],20:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],21:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],22:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":21,"inherits":20,"pBGvAp":10}],23:[function(require,module,exports){
module.exports = require('./lib/VASTPlayer');

},{"./lib/VASTPlayer":27}],24:[function(require,module,exports){
'use strict';

function proxy(event, source, target) {
    source.on(event, function emit(/*...args*/) {
        var args = [], length = arguments.length;
        while (length--) { args[length] = arguments[length]; }

        target.emit.apply(target, [event].concat(args));
    });
}

function init(source, target, events) {
    events.forEach(function(event) {
        if (target.listeners(event).length > 0) {
            proxy(event, source, target);
        }
    });

    target.on('newListener', function handleNewListener(type) {
        if (events.indexOf(type) > -1 && target.listeners(type).length < 1) {
            proxy(type, source, target);
        }
    });
}

function EventProxy(events) {
    this.events = events.slice();

    this.__private__ = {
        target: null,
        source: null
    };
}

EventProxy.prototype.from = function from(source) {
    this.__private__.source = source;

    if (this.__private__.target) {
        init(source, this.__private__.target, this.events);
    }

    return this;
};

EventProxy.prototype.to = function to(target) {
    this.__private__.target = target;

    if (this.__private__.source) {
        init(this.__private__.source, target, this.events);
    }

    return this;
};

module.exports = EventProxy;

},{}],25:[function(require,module,exports){
'use strict';

var VideoTracker = require('./VideoTracker');
var inherits = require('util').inherits;
var EVENTS = require('./enums/HTML_MEDIA_EVENTS');

function HTMLVideoTracker(video) {
    var self = this;

    VideoTracker.call(this, Math.floor(video.duration || 0)); // call super()

    this.video = video;

    [
        EVENTS.PLAYING,
        EVENTS.PAUSE,
        EVENTS.TIMEUPDATE
    ].forEach(function(event) {
        return video.addEventListener(event, function onevent() {
            return self.tick();
        }, false);
    });
}
inherits(HTMLVideoTracker, VideoTracker);

HTMLVideoTracker.prototype._getState = function _getState() {
    return {
        playing: !this.video.paused,
        currentTime: this.video.currentTime
    };
};

module.exports = HTMLVideoTracker;

},{"./VideoTracker":29,"./enums/HTML_MEDIA_EVENTS":30,"util":22}],26:[function(require,module,exports){
'use strict';

var EVENTS = require('./enums/VPAID_EVENTS');

function identity(value) {
    return value;
}

function fire(pixels, mapper) {
    (pixels || []).forEach(function(src) {
        new Image().src = mapper(src);
    });
}

function PixelReporter(pixels, mapper) {
this.pauseFlag=1;
this.resumeFlag=1;
    this.pixels = pixels.reduce(function(pixels, item) {
        (pixels[item.event] || (pixels[item.event] = [])).push(item.uri);
        return pixels;
    }, {});

    this.__private__ = {
        mapper: mapper || identity
    };
}

PixelReporter.prototype.track = function track(vpaid) {

    var pixels = this.pixels;
	var self=this;

    var customMapper = this.__private__.mapper;
	
    var lastVolume = vpaid.adVolume;
    console.log("зару");
	return;	
    function fireType(type, mapper, predicate) {
        function pixelMapper(url) {
            return customMapper((mapper || identity)(url));
        }

        return function firePixels() {
            if (!predicate || predicate()) {
			    var flag=self.PlayToBridge(type,pixels[type]); 
				switch(type){
				case "pause":
				if(!self.pauseFlag){
				self.pauseFlag=1; 
				return;
				}
				break;
				case "resume":
				
			    if(!self.resumeFlag){
				self.resumeFlag=1; 
				return;
				}
				break;
				}
				//console.log(["flag",flag,type]);
				if(flag){
                fire(pixels[type], pixelMapper);
				}
            }
        };
    }

    vpaid.on(EVENTS.AdSkipped, fireType('skip'));
    vpaid.on(EVENTS.AdStarted, fireType('creativeView'));
    vpaid.on(EVENTS.AdVolumeChange, fireType('unmute', null, function() {
        return lastVolume === 0 && vpaid.adVolume > 0;
    }));
    vpaid.on(EVENTS.AdVolumeChange, fireType('mute', null, function() {
        return lastVolume > 0 && vpaid.adVolume === 0;
    }));
    vpaid.on(EVENTS.AdImpression, fireType('impression'));
    vpaid.on(EVENTS.AdVideoStart, fireType('start'));
    vpaid.on(EVENTS.AdVideoFirstQuartile, fireType('firstQuartile'));
    vpaid.on(EVENTS.AdVideoMidpoint, fireType('midpoint'));
    vpaid.on(EVENTS.AdVideoThirdQuartile, fireType('thirdQuartile'));
    vpaid.on(EVENTS.AdVideoComplete, fireType('complete'));
    vpaid.on(EVENTS.AdClickThru, fireType('clickThrough'));
    vpaid.on(EVENTS.AdUserAcceptInvitation, fireType('acceptInvitationLinear'));
    vpaid.on(EVENTS.AdUserMinimize, fireType('collapse'));
    vpaid.on(EVENTS.AdUserClose, fireType('closeLinear'));
    vpaid.on(EVENTS.AdPaused, fireType('pause'));
    vpaid.on(EVENTS.AdPlaying, fireType('resume'));
    vpaid.on(EVENTS.AdError, fireType('error', function(pixel) {
        return pixel.replace(/\[ERRORCODE\]/g, 901);
    }));

    vpaid.on(EVENTS.AdVolumeChange, function updateLastVolume() {
        lastVolume = vpaid.adVolume;
    });
};

module.exports = PixelReporter;

},{"./enums/VPAID_EVENTS":32}],27:[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var VAST = require('vastacular').VAST;
var JavaScriptVPAIDPlayer = require('./players/JavaScriptVPAID');
var FlashVPAIDPlayer = require('./players/FlashVPAID');
var HTMLVideoPlayer = require('./players/HTMLVideo');
var ANDROIDVideoPlayer = require('./players/ANDROIDVideo');
var IOSVideoPlayer = require('./players/IOSVideo');
var MIME = require('./enums/MIME');
var EVENTS = require('./enums/VPAID_EVENTS');
var EventProxy = require('./EventProxy');
var LiePromise = require('lie');
var PixelReporter = require('./PixelReporter');
function iOS() {

  var iDevices = [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ];
//return true;
  if (!!navigator.platform) {
    while (iDevices.length) {
      if (navigator.platform === iDevices.pop()){ return true; }
    }
  }

  //return isAndr();
  return false;
}
function checkIfFlashEnabled() {
    var isFlashEnabled = false;
    if (typeof(navigator.plugins) != "undefined" && typeof(navigator.plugins["Shockwave Flash"]) == "object") isFlashEnabled = true;
    else if (typeof  window.ActiveXObject != "undefined") {
        // Проверка для IE
        try {
            if (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) isFlashEnabled = true;
        } catch (e) {
        }
    }
     return isFlashEnabled;
}
function defaults(/*...objects*/) {
    var result = {};
    var length = arguments.length;
    var index, object;
    var prop, value;

    for (index = 0; index < length; index++) {
        object = arguments[index] || {};

        for (prop in object) {
            value = object[prop];

            if (result[prop] === undefined) {
                result[prop] = value;
            }

            if (typeof value === 'object') {
                result[prop] = defaults(result[prop], value);
            }
        }
    }

    return result;
}

function identity(value) {
    return value;
}

function getNotReadyError() {
    return new Error('VASTPlayer not ready.');
}

function proxy(method) {
    return function callMethod() {
        var self = this;
        var player = this.__private__.player;

        if (!this.ready) {
            return LiePromise.reject(getNotReadyError());
        }

        return player[method].apply(player, arguments).then(function() {
            return self;
        });
    };
}

function proxyProp(property) {
    return {
        get: function get() {
            if (!this.ready) { throw getNotReadyError(); }

            return this.__private__.player[property];
        },

        set: function set(value) {
            if (!this.ready) { throw getNotReadyError(); }

            return (this.__private__.player[property] = value);
        }
    };
}

function VASTPlayer(container, config) {
    var self = this;

    EventEmitter.call(this); // call super()

    this.__private__ = {
        container: container,
        config: defaults(config, {
            vast: {
			    withCredentials : true,
                resolveWrappers: true,
                maxRedirects: 7
            },
            tracking: {
                mapper: identity
            }
        }),

        vast: null,
        ready: false,
        player: null,
		pType : 0
    };
    
    this.on(EVENTS.AdClickThru, function onAdClickThru(url, id, playerHandles) {
	  
        if(this.chekcClicked()) return true;
		
	    var clickThrough = url || self.vast.get('ads[0].creatives[0].videoClicks.clickThrough');
        if(playerHandles && clickThrough){
            window.open(clickThrough);
        }
    });
}
inherits(VASTPlayer, EventEmitter);
Object.defineProperties(VASTPlayer.prototype, {
    container: {
        get: function getContainer() {
            return this.__private__.container;
        }
    },

    config: {
        get: function getConfig() {
            return this.__private__.config;
        }
    },

    vast: {
        get: function getVast() {
            return this.__private__.vast;
        }
    },

    ready: {
        get: function getReady() {
            return this.__private__.ready;
        }
    },

    adRemainingTime: proxyProp('adRemainingTime'),
    adDuration: proxyProp('adDuration'),
    adVolume: proxyProp('adVolume')
});
VASTPlayer.prototype.chekcClicked = function chekcClicked() {

if(this.pType == 4){
    if(!this.__private__.player.privateStarted) {
	this.__private__.player.privateStarted=1;
	return 1;
	
	}else{
	}
}

return 0;
};
VASTPlayer.prototype.load = function load(uri) {
    var self = this;
    var config = this.config.vast;

    return VAST.fetch(uri, config).then(function loadPlayer(vast) {
        var myIos=iOS();
		var isAndroid = /(android)/i.test(navigator.userAgent);
		
        var config = (function() {
            var jsVPAIDFiles = vast.filter('ads[0].creatives[0].mediaFiles', function(mediaFile) {
                return (
                    mediaFile.type === MIME.JAVASCRIPT ||
                    mediaFile.type === 'application/x-javascript'
                ) && mediaFile.apiFramework === 'VPAID';
            });
			
            var swfVPAIDFiles = vast.filter('ads[0].creatives[0].mediaFiles', function(mediaFile) {
			    //return mediaFile.type === MIME.FLASH
			    return mediaFile.type === MIME.FLASH && mediaFile.apiFramework === 'VPAID' ;
                //return mediaFile.type === MIME.FLASH && mediaFile.apiFramework === 'VPAID' && checkIfFlashEnabled();
            });
			 
            var files = vast.filter('ads[0].creatives[0].mediaFiles', function() { return true; });

            if (jsVPAIDFiles.length > 0) {
			self.pType=1;
                return {
                    player: new JavaScriptVPAIDPlayer(self.container),
                    mediaFiles: jsVPAIDFiles
                };
            } else if (swfVPAIDFiles.length > 0) {
			self.pType=2;
			
                return {
                    player: new FlashVPAIDPlayer(self.container, VASTPlayer.vpaidSWFLocation,self.config),
                    mediaFiles: swfVPAIDFiles
					
                };
            }
			
            self.pType=3;
			if(myIos){
			 return {
			    player: new IOSVideoPlayer(self.container),
                mediaFiles: files
                };
			}else{
			if(isAndroid){ 
			self.pType=4;
			return {
			
			    player: new ANDROIDVideoPlayer(self.container),
                mediaFiles: files
                };		
			reject("it is not Adroid player");
			}
			 return {
			    player: new HTMLVideoPlayer(self.container),
                mediaFiles: files
                };				
			}
        }());
		
		
        var parameters = vast.get('ads[0].creatives[0].parameters');
        var pixels = [].concat(
            vast.map('ads[0].impressions', function(impression) {
                return { event: 'impression', uri: impression.uri };
            }),
            vast.map('ads[0].errors', function(uri) {
                return { event: 'error', uri: uri };
            }),
            vast.get('ads[0].creatives[0].trackingEvents'),
            vast.map('ads[0].creatives[0].videoClicks.clickTrackings', function(uri) {
                return { event: 'clickThrough', uri: uri };
            })
        );
 
       var player = config.player;
	  
       var mediaFiles = config.mediaFiles;
       var proxy = new EventProxy(EVENTS);
       var reporter = new PixelReporter(pixels, self.config.tracking.mapper);
	   reporter.PlayToBridge = function(type,arr){
	   return 1;
       };
       if(typeof self.config.bidgeFn=='function'){
	   reporter.PlayToBridge = function(type,arr){
	   self.config.bidgeFn(self.id_local_source,type,arr);
	   return 1;
        };
		}
		
        proxy.from(player).to(self);
       
        self.__private__.vast = vast;
        self.__private__.player = player;
        player.id1=self.id_local_source;
		
        return player.load(mediaFiles, parameters).then(function setupPixels() {
		 
		      reporter.track(player);
        });
    }).then(function setReady() {
	   
        self.__private__.ready = true;

        self.emit('ready');

        return self;
    }).catch(function emitError(reason) {
	    self.emit('error', reason);
        throw reason;
    });
};

VASTPlayer.prototype.startAd = proxy('startAd');

VASTPlayer.prototype.stopAd = proxy('stopAd');

VASTPlayer.prototype.pauseAd = proxy('pauseAd');

VASTPlayer.prototype.resumeAd = proxy('resumeAd');

VASTPlayer.vpaidSWFLocation = 'https://apptoday.ru/dev/vast-player-vpaid.swf';

module.exports = VASTPlayer;

},{"./EventProxy":24,"./PixelReporter":26,"./enums/MIME":31,"./enums/VPAID_EVENTS":32,"./players/ANDROIDVideo":34,"./players/FlashVPAID":35,"./players/HTMLVideo":36,"./players/IOSVideo":37,"./players/JavaScriptVPAID":39,"events":6,"lie":8,"util":22,"vastacular":50}],28:[function(require,module,exports){
'use strict';

function VPAIDVersion(versionString) {
    var parts = versionString.split('.').map(parseFloat);

    this.string = versionString;

    this.major = parts[0];
    this.minor = parts[1];
    this.patch = parts[2];

    Object.freeze(this);
}

VPAIDVersion.prototype.toString = function toString() {
    return this.string;
};

module.exports = VPAIDVersion;

},{}],29:[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var EVENTS = require('./enums/VPAID_EVENTS');

function fire(event, tracker) {
    if (tracker.fired[event]) { return; }

    tracker.emit(event);
    tracker.fired[event] = true;
}

function VideoTracker(duration) {
    EventEmitter.apply(this, arguments); // call super()

    this.duration = duration;
    this.seconds = Array.apply([], new Array(duration)).map(function() { return false; });

    this.fired = [
        EVENTS.AdVideoStart,
        EVENTS.AdVideoFirstQuartile,
        EVENTS.AdVideoMidpoint,
        EVENTS.AdVideoThirdQuartile,
        EVENTS.AdVideoComplete
    ].reduce(function(fired, event) {
        fired[event] = false;
        return fired;
    }, {});
}
inherits(VideoTracker, EventEmitter);

VideoTracker.prototype.tick = function tick() {
    var seconds = this.seconds;
    var state = this._getState();
    var index = Math.round(state.currentTime) - 1;
	 if(index>-1)
	 this.emit(EVENTS.AdRemainingTimeChange,{sec:index,dur:this.duration});
	
	
    var quartileIndices = [1, 2, 3, 4].map(function(quartile) {
        return Math.floor(this.duration / 4  * quartile);
    }, this);

    function quartileViewed(quartile) {
        var end = quartileIndices[quartile - 1];

        return seconds.slice(0, end).every(function(second) {
            return second === true;
        });
    }

    if (state.playing) {
        fire(EVENTS.AdVideoStart, this);

        if (index > -1) {
            this.seconds[index] = true;
        }
    }

    if (quartileViewed(1)) {
        fire(EVENTS.AdVideoFirstQuartile, this);
    }

    if (quartileViewed(2)) {
        fire(EVENTS.AdVideoMidpoint, this);
    }

    if (quartileViewed(3)) {
        fire(EVENTS.AdVideoThirdQuartile, this);
    }

    if (quartileViewed(4)) {
        fire(EVENTS.AdVideoComplete, this);
    }
};

module.exports = VideoTracker;

},{"./enums/VPAID_EVENTS":32,"events":6,"util":22}],30:[function(require,module,exports){
'use strict';

var HTML_MEDIA_EVENTS = [
    'abort',
    'canplay',
    'canplaythrough',
    'durationchange',
    'emptied',
    'encrypted',
    'ended',
    'error',
    'interruptbegin',
    'interruptend',
    'loadeddata',
    'loadedmetadata',
    'loadstart',
    'mozaudioavailable',
    'pause',
    'play',
    'playing',
    'progress',
    'ratechange',
    'seeked',
    'seeking',
    'stalled',
    'suspend',
    'timeupdate',
    'volumechange',
    'waiting'
];

HTML_MEDIA_EVENTS.forEach(function(event) {
    this[event.toUpperCase()] = event;
}, HTML_MEDIA_EVENTS);

Object.freeze(HTML_MEDIA_EVENTS);

module.exports = HTML_MEDIA_EVENTS;

},{}],31:[function(require,module,exports){
var MIME = {
    JAVASCRIPT: 'application/javascript',
    FLASH: 'application/x-shockwave-flash'
};

Object.freeze(MIME);

module.exports = MIME;

},{}],32:[function(require,module,exports){
'use strict';

var VPAID_EVENTS = [
    'AdLoaded',
    'AdStarted',
    'AdStopped',
    'AdSkipped',
    'AdSkippableStateChange',
    'AdSizeChange',
    'AdLinearChange',
    'AdDurationChange',
    'AdExpandedChange',
    'AdRemainingTimeChange',
    'AdVolumeChange',
    'AdImpression',
    'AdVideoStart',
    'AdVideoFirstQuartile',
    'AdVideoMidpoint',
    'AdVideoThirdQuartile',
    'AdVideoComplete',
    'AdClickThru',
    'AdInteraction',
    'AdUserAcceptInvitation',
    'AdUserMinimize',
    'AdUserClose',
    'AdPaused',
    'AdPlaying',
    'AdLog',
    'AdError'
	
];

VPAID_EVENTS.forEach(function(event) {
    VPAID_EVENTS[event] = event;
});

Object.freeze(VPAID_EVENTS);

module.exports = VPAID_EVENTS;

},{}],33:[function(require,module,exports){
'use strict';

var win = require('./window');
var video = document.createElement('video');
var MIME = require('./enums/MIME');

exports.isDesktop = !/Android|Silk|Mobile|PlayBook/.test(win.navigator.userAgent);

exports.canPlay = function canPlay(type) {
    var mimeTypes = win.navigator.mimeTypes;
    var ActiveXObject = win.ActiveXObject;

    switch (type) {
    case MIME.FLASH:
        try {
            return new ActiveXObject('ShockwaveFlash.ShockwaveFlash') ? 2 : 0;
        } catch (e) {
            return !!(mimeTypes && mimeTypes[MIME.FLASH]) ? 2 : 0;
        }
        return 0;
    case MIME.JAVASCRIPT:
    case 'application/x-javascript':
        return 2;
    default:
        if (video.canPlayType) {
            switch (video.canPlayType(type)) {
            case 'probably':
                return 2;
            case 'maybe':
                return 1;
            default:
                return 0;
            }
        }
    }

    return 0;
};

Object.freeze(exports);

},{"./enums/MIME":31,"./window":49}],34:[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var LiePromise = require('lie');
var canPlay = require('../environment').canPlay;
var sortBy = require('sort-by');
var VPAID_EVENTS = require('../enums/VPAID_EVENTS');
var HTML_MEDIA_EVENTS = require('../enums/HTML_MEDIA_EVENTS');
var HTMLVideoTracker = require('../HTMLVideoTracker');
var EventProxy = require('../EventProxy');

function on(video, event, handler) {
    return video.addEventListener(event, handler, false);
}

function off(video, event, handler) {
    return video.removeEventListener(event, handler, false);
}

function once(video, event, handler) {
    return on(video, event, function onevent() {
        off(video, event, onevent);
        return handler.apply(this, arguments);
    });
}

function method(implementation, promiseify) {
    function getError() {
        return new Error('The <video> has not been loaded.');
    }

    return function callImplementation(/*...args*/) {
        if (!this.video) {
            if (promiseify) { return LiePromise.reject(getError()); } else { throw getError(); }
        }

        return implementation.apply(this, arguments);
    };
}

function pickMediaFile(mediaFiles, dimensions) {
    var width = dimensions.width;
    var items = mediaFiles.map(function(mediaFile) {
	//document.getElementById("ilias_id").innerHTML+='<br> uri  type: '+mediaFile.type;
	//document.getElementById("ilias_id").innerHTML+='<br> uri can play: '+canPlay(mediaFile.type);
	
	
        return {
            mediaFile: mediaFile,
            playability: canPlay(mediaFile.type)
        };
    }).filter(function(config) {
        return config.playability > 0;
    }).sort(sortBy('-playability', '-mediaFile.bitrate'));
    var distances = items.map(function(item) {
	  if(!item.mediaFile.hasOwnProperty("width") || !item.mediaFile.width)
		 item.mediaFile.width = 1000;
        return Math.abs(width - item.mediaFile.width);
    });
    var item = items[distances.indexOf(Math.min.apply(Math, distances))];

    return (!item || item.playability < 1) ? null : item.mediaFile;
}

function ANDROIDVideo(container) {
    this.container = container;
    this.video = null;
    this.privateStarted=0;
    this.__private__ = {
        hasPlayed: false
    };
}
inherits(ANDROIDVideo, EventEmitter);
Object.defineProperties(ANDROIDVideo.prototype, {
    adRemainingTime: { get: method(function getAdRemainingTime() {
        return this.video.duration - this.video.currentTime;
    }) },
    adDuration: { get: method(function getAdDuration() { return this.video.duration; }) },
    adVolume: {
        get: method(function getAdVolume() { return this.video.volume; }),
        set: method(function setAdVolume(volume) { this.video.volume = volume; })
    }
});

ANDROIDVideo.prototype.load = function load(mediaFiles) {
    var self = this;
	

    return new LiePromise(function loadCreative(resolve, reject) {
	
	
        var video = document.createElement('video');
		var mediaFile = pickMediaFile(mediaFiles, self.container.getBoundingClientRect());

        if (!mediaFile) {
            return reject(new Error('There are no playable <MediaFile>s.'));
        }
        //video.setAttribute('muted',true);
		//video.setAttribute('autoplay',true);
		video.setAttribute('playsinline',true);
	  
	   
        video.setAttribute('webkit-playsinline', true);
        video.src = mediaFile.uri;
        video.preload = 'auto';

        video.style.display = 'block';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';

        once(video, HTML_MEDIA_EVENTS.LOADEDMETADATA, function onloadedmetadata() {
            var tracker = new HTMLVideoTracker(video);
            var proxy = new EventProxy(VPAID_EVENTS);

            proxy.from(tracker).to(self);

            self.video = video;
            resolve(self);

            self.emit(VPAID_EVENTS.AdLoaded);

            on(video, HTML_MEDIA_EVENTS.DURATIONCHANGE, function ondurationchange() {
                self.emit(VPAID_EVENTS.AdDurationChange);
            });
            on(video, HTML_MEDIA_EVENTS.VOLUMECHANGE, function onvolumechange() {
                self.emit(VPAID_EVENTS.AdVolumeChange);
            });
        });

        once(video, HTML_MEDIA_EVENTS.ERROR, function onerror() {
            var error = video.error;

            self.emit(VPAID_EVENTS.AdError, error.message);
            reject(error);
        });

        once(video, HTML_MEDIA_EVENTS.PLAYING, function onplaying() {
		    self.__private__.hasPlayed = true;
            self.emit(VPAID_EVENTS.AdImpression);
        });

        once(video, HTML_MEDIA_EVENTS.ENDED, function onended() {
            self.stopAd();
        });

        on(video, 'click', function onclick() {
            if(!self.privateStarted){
			//alert('плиз уэйт');
			
			}else{
			}
            self.emit(VPAID_EVENTS.AdClickThru, null, null, true);
        });

        self.container.appendChild(video);
    });
};

ANDROIDVideo.prototype.startAd = method(function startAd() {
    var self = this;
    var video = this.video;
    //video.volume = 0.1;
	
    if (this.__private__.hasPlayed) {
        return LiePromise.reject(new Error('The ad has already been started.'));
    }
	

    return new LiePromise(function callPlay(resolve) {
		resolve(self);
		return true;
        //return video.play();
		
    });
}, true);

ANDROIDVideo.prototype.stopAd = method(function stopAd() {
    this.container.removeChild(this.video);
    this.emit(VPAID_EVENTS.AdStopped);

    return LiePromise.resolve(this);
}, true);

ANDROIDVideo.prototype.pauseAd = method(function pauseAd() {

    var self = this;
    var video = this.video;
   
    if (this.video.paused) {
        return LiePromise.resolve(this);
    }

    return new LiePromise(function callPause(resolve) {
	
        once(video, HTML_MEDIA_EVENTS.PAUSE, function onpause() {
            resolve(self);
            self.emit(VPAID_EVENTS.AdPaused);
        });
        resolve(self);
        return video.pause();
    });
}, true);

ANDROIDVideo.prototype.resumeAd = method(function resumeAd() {

    var self = this;
    var video = this.video;

    if (!this.__private__.hasPlayed) {
        return LiePromise.reject(new Error('The ad has not been started yet.'));
    }

    if (!this.video.paused) {
        return LiePromise.resolve(this);
    }

    return new LiePromise(function callPlay(resolve) { 
        once(video, HTML_MEDIA_EVENTS.PLAY, function onplay() {
            resolve(self);
            self.emit(VPAID_EVENTS.AdPlaying);
        });

        return video.play();
    });
}, true);

module.exports = ANDROIDVideo;
},{"../EventProxy":24,"../HTMLVideoTracker":25,"../enums/HTML_MEDIA_EVENTS":30,"../enums/VPAID_EVENTS":32,"../environment":33,"events":6,"lie":8,"sort-by":15,"util":22}],35:[function(require,module,exports){
'use strict';
var VPAIDFLASHClient = require('./VPAIDFLASHClient');
var VPAID = require('./VPAID');
var inherits = require('util').inherits;
var LiePromise = require('lie');
var uuid = require('../uuid');
var querystring = require('querystring');
var EVENTS = require('../enums/VPAID_EVENTS');
var VPAIDVersion = require('../VPAIDVersion');

function FlashVPAID(container, swfURI,config) {

    VPAID.apply(this, arguments); // call super()
    this.container=container;
	
    this.width = config.width;
    this.height = config.height;
    this.swfURI = swfURI;
    this.object = null;
}
inherits(FlashVPAID, VPAID);

FlashVPAID.prototype.load = function load(mediaFiles, parameters) {
    var self = this;
    var uri = mediaFiles[0].uri;
    var bitrate = mediaFiles[0].bitrate;
	this.playDelay=1;
	
    var d1="https://apptoday.ru/dev/VPAIDFlash.swf";
   // alert(uri);
     return new LiePromise(function loadCreative(resolve, reject) {
	 var  params = { wmode: 'transparent', salign: 'tl', align: 'left', allowScriptAccess: 'always', scale: 'noScale', allowFullScreen: 'true', quality: 'high'};
	 //alert(self.container);
	 var flashVPaid = new VPAIDFLASHClient(self.container, flashVPAIDWrapperLoaded,{width:self.width,height:self.height,data:d1},params,{ debug: false, timeout: 10000 });
     function flashVPAIDWrapperLoaded(err) {
	  
	    if(err){
	       self.playDelay=1;
		   reject(err);
		   return;
		}
		
		var adURL = 'http://cdn-sys.brainient.com/flash/v6/select846.swf?video_id=a3f30b8e-2ad8-4123-bc58-42fccb3e48cd&user_id=1228&tzone=&settings=json&settingsPath=http://cdn-tags.brainient.com/1228/a3f30b8e-2ad8-4123-bc58-42fccb3e48cd/config.json';
		   
		
		flashVPaid.loadAdUnit(adURL,function (error, adUnit){
		self.api = adUnit;
		
		if(error){
		   self.playDelay=0;
		   reject(err);
		   return;
		}
		adUnit.handshakeVersion('2.0', initAd);
        adUnit.on('AdLoaded', startAd);
         function initAd(err, result) {
                        console.log('handShake', err, result);
                        adUnit.initAd(self.width,self.height, 'normal', -1, '', '', function (err) {
								if(error){
		                        self.playDelay=0;
		                        reject(err);
		                        return;
		                       }
                        });
        }
	    function startAd(err, result) {
								if(error){
		                        self.playDelay=0;
		                        reject(err);
		                        return;
		                       }
							    adUnit.setAdVolume(0.1);
							   //alert("готов играть потом");
		 self.playDelay=0;
	     resolve(self);
		}
		
			//console.log("уже готов играть");
			//self.playDelay=0;
			//resolve(self);
			 //  adUnit.handshakeVersion('2.0', initAd);
			   
	    });
		
		
     }
	 function setCheckLoadedTime(cnt){
		if(!self.playDelay) return;
		//console.log(["таймер ",cnt]);
		if(cnt>0){
		setTimeout(function(){
		setCheckLoadedTime((cnt-1))
		}, 1000);
		return;
		}
        self.playDelay=1;
		reject("flash 10 сек");
		//cleanup(new Error("vpaid не загрузился в течении 18 сек"));  
		}
		
		setCheckLoadedTime(11110);
    // reject (new Error("временно не работает"));
	    /*
	    
	 
	 
        var vpaid = document.createElement('object');
        var eventFnName = 'vast_player__' + uuid(20);
		self.sendStatistic({vpaidURI: uri,eventCallback: eventFnName}); 
        var flashvars = querystring.stringify({
            vpaidURI: uri,
            eventCallback: eventFnName
        });
       
        function cleanup(reason) {
		console.log("init --- ad");
		    try{
            self.container.removeChild(vpaid);
			}catch(e){
			}
            self.api = null;
            self.object = null;
            delete window[eventFnName];

            if (reason) {
                reject(reason);
            }
        }

        vpaid.type = 'application/x-shockwave-flash';
        vpaid.data = self.swfURI + '?' + flashvars;
        vpaid.style.display = 'block';
        vpaid.style.width = '100%';
        vpaid.style.height = '100%';
        vpaid.style.border = 'none';
        vpaid.style.opacity = '0';
        vpaid.innerHTML = [
            '<param name="movie" value="' + self.swfURI + '">',
            '<param name="flashvars" value="' + flashvars + '">',
            '<param name="quality" value="high">',
            '<param name="play" value="false">',
            '<param name="loop" value="false">',
            '<param name="wmode" value="opaque">',
            '<param name="scale" value="noscale">',
            '<param name="salign" value="lt">',
            '<param name="allowScriptAccess" value="always">'
        ].join('\n');

        self.object = vpaid;
      
        window[eventFnName] = function handleVPAIDEvent(event) {
		 //console.log(["init --->",event]);
		 self.sendStatistic({event:event.type}); 
            switch (event.type) {
            case EVENTS.AdClickThru:
                return self.emit(event.type, event.url, event.Id, event.playerHandles);
            case EVENTS.AdInteraction:
            case EVENTS.AdLog:
                return self.emit(event.type, event.Id);
            case EVENTS.AdError:
                return self.emit(event.type, event.message);
            default:
                return self.emit(event.type);
            }
        };

         self.once('VPAIDInterfaceReady', function initAd() {
		// console.log("init --- ready");
            var position = vpaid.getBoundingClientRect();
            var version = self.vpaidVersion = new VPAIDVersion(vpaid.handshakeVersion('2.0'));

            if (version.major > 2) {
                return reject(new Error('VPAID version ' + version + ' is not supported.'));
            }

            self.on('VPAIDInterfaceResize', function resizeAd() {
                var position = vpaid.getBoundingClientRect();

                self.resizeAd(position.width, position.height, 'normal');
            });
           
            vpaid.initAd(position.width, position.height, 'normal', bitrate, parameters, null);
			
		

		
			
        });
		self.once(EVENTS.AdPlaying, function handleAdLoaded() {
		//setCheckLoadedTime(50);
        });
		
        self.once(EVENTS.AdLoaded, function handleAdLoaded() {
		console.log(['loaded',self]);
            self.api = vpaid;
            vpaid.style.opacity = '1';

            resolve(self);
        });

        self.once(EVENTS.AdError, function handleAdError(reason) {
            cleanup(new Error(reason));
        });

        self.once(EVENTS.AdStopped, cleanup);
        console.log("init --- ad");
        self.container.appendChild(vpaid);
		*/
    });
};
FlashVPAID.prototype.startAd=function(){
var self =this;
  return new LiePromise(function startCreative(resolve, reject) {
  //alert(111);
  resolve(self);
  //reject(" не из за этого");
  });
};
FlashVPAID.prototype.resumeAd=function(){
alert("да это они");
};
FlashVPAID.prototype.pauseAd=function(){
alert(this.pau);

};
FlashVPAID.prototype.sendStatistic = function sendStatistic(RemoteData) {
   var toURL="https://api.market-place.su/Product/video/swfstat.php?p="+Math.random()+'&data='+encodeURIComponent(JSON.stringify(RemoteData));
   console.log(["to url",toURL]); 
	return;
    var img = new Image(1,1);
    img.src = toURL; 
};

 

module.exports = FlashVPAID;

},{"../VPAIDVersion":28,"../enums/VPAID_EVENTS":32,"../uuid":48,"./VPAID":40,"./VPAIDFLASHClient":42,"lie":8,"querystring":13,"util":22}],36:[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var LiePromise = require('lie');
var canPlay = require('../environment').canPlay;
var sortBy = require('sort-by');
var VPAID_EVENTS = require('../enums/VPAID_EVENTS');
var HTML_MEDIA_EVENTS = require('../enums/HTML_MEDIA_EVENTS');
var HTMLVideoTracker = require('../HTMLVideoTracker');
var EventProxy = require('../EventProxy');

function on(video, event, handler) {
    return video.addEventListener(event, handler, false);
}

function off(video, event, handler) {
    return video.removeEventListener(event, handler, false);
}

function once(video, event, handler) {
    return on(video, event, function onevent() {
        off(video, event, onevent);
        return handler.apply(this, arguments);
    });
}

function method(implementation, promiseify) {
    function getError() {
        return new Error('The <video> has not been loaded.');
    }

    return function callImplementation(/*...args*/) {
        if (!this.video) {
            if (promiseify) { return LiePromise.reject(getError()); } else { throw getError(); }
        }

        return implementation.apply(this, arguments);
    };
}

function pickMediaFile(mediaFiles, dimensions) {
    var width = dimensions.width;
    var items = mediaFiles.map(function(mediaFile) {

	
	    
        return {
            mediaFile: mediaFile,
            playability: canPlay(mediaFile.type)
        };
    }).filter(function(config) {
	    
        return config.playability > 0;
    }).sort(sortBy('-playability', '-mediaFile.bitrate'));
    var distances = items.map(function(item) {
	     if(!item.mediaFile.hasOwnProperty("width") || !item.mediaFile.width)
		 item.mediaFile.width = 1000;
         return Math.abs(width - item.mediaFile.width);
    });
    var item = items[distances.indexOf(Math.min.apply(Math, distances))];

    return (!item || item.playability < 1) ? null : item.mediaFile;
}

function HTMLVideo(container) {
    this.container = container;
    this.video = null;

    this.__private__ = {
        hasPlayed: false
    };
}
inherits(HTMLVideo, EventEmitter);
Object.defineProperties(HTMLVideo.prototype, {
    adRemainingTime: { get: method(function getAdRemainingTime() {
        return this.video.duration - this.video.currentTime;
    }) },
    adDuration: { get: method(function getAdDuration() { return this.video.duration; }) },
    adVolume: {
        get: method(function getAdVolume() { return this.video.volume; }),
        set: method(function setAdVolume(volume) { this.video.volume = volume; })
    }
});

HTMLVideo.prototype.load = function load(mediaFiles) {
    var self = this;
    return new LiePromise(function loadCreative(resolve, reject) {
	
	
        var video = document.createElement('video');
		
        var mediaFile = pickMediaFile(mediaFiles, self.container.getBoundingClientRect());
            if (!mediaFile) {
            return reject(new Error('There are no playable <MediaFile>s.'));
        }
       
        video.setAttribute('webkit-playsinline', true);
        video.src = mediaFile.uri;
        video.preload = 'auto';

        video.style.display = 'block';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';

		
        once(video, HTML_MEDIA_EVENTS.LOADEDMETADATA, function onloadedmetadata() {
            var tracker = new HTMLVideoTracker(video);
            var proxy = new EventProxy(VPAID_EVENTS);

            proxy.from(tracker).to(self);

            self.video = video;
            resolve(self);

            self.emit(VPAID_EVENTS.AdLoaded);

            on(video, HTML_MEDIA_EVENTS.DURATIONCHANGE, function ondurationchange() {
                self.emit(VPAID_EVENTS.AdDurationChange);
            });
            on(video, HTML_MEDIA_EVENTS.VOLUMECHANGE, function onvolumechange() {
                self.emit(VPAID_EVENTS.AdVolumeChange);
            });
        });

        once(video, HTML_MEDIA_EVENTS.ERROR, function onerror() {
            var error = video.error;

            self.emit(VPAID_EVENTS.AdError, error.message);
            reject(error);
        });

        once(video, HTML_MEDIA_EVENTS.PLAYING, function onplaying() {
            self.__private__.hasPlayed = true;
            self.emit(VPAID_EVENTS.AdImpression);
        });

        once(video, HTML_MEDIA_EVENTS.ENDED, function onended() {
            self.stopAd();
        });

        on(video, 'click', function onclick() {
            self.emit(VPAID_EVENTS.AdClickThru, null, null, true);
        });

        self.container.appendChild(video);
    });
};

HTMLVideo.prototype.startAd = method(function startAd() {
    var self = this;
    var video = this.video;
    video.volume = 0.1;
    if (this.__private__.hasPlayed) {
        return LiePromise.reject(new Error('The ad has already been started.'));
    }

    return new LiePromise(function callPlay(resolve) {
        once(video, HTML_MEDIA_EVENTS.PLAYING, function onplaying() {
            resolve(self);
            self.emit(VPAID_EVENTS.AdStarted);
        });

        return video.play();
		
    });
}, true);

HTMLVideo.prototype.stopAd = method(function stopAd() {
    this.container.removeChild(this.video);
    this.emit(VPAID_EVENTS.AdStopped);

    return LiePromise.resolve(this);
}, true);

HTMLVideo.prototype.pauseAd = method(function pauseAd() {
    var self = this;
    var video = this.video;

    if (this.video.paused) {
        return LiePromise.resolve(this);
    }

    return new LiePromise(function callPause(resolve) {
        once(video, HTML_MEDIA_EVENTS.PAUSE, function onpause() {
            resolve(self);
            self.emit(VPAID_EVENTS.AdPaused);
        });

        return video.pause();
    });
}, true);

HTMLVideo.prototype.resumeAd = method(function resumeAd() {
    var self = this;
    var video = this.video;

    if (!this.__private__.hasPlayed) {
        return LiePromise.reject(new Error('The ad has not been started yet.'));
    }

    if (!this.video.paused) {
        return LiePromise.resolve(this);
    }

    return new LiePromise(function callPlay(resolve) {
        once(video, HTML_MEDIA_EVENTS.PLAY, function onplay() {
            resolve(self);
            self.emit(VPAID_EVENTS.AdPlaying);
        });

        return video.play();
    });
}, true);

module.exports = HTMLVideo;

},{"../EventProxy":24,"../HTMLVideoTracker":25,"../enums/HTML_MEDIA_EVENTS":30,"../enums/VPAID_EVENTS":32,"../environment":33,"events":6,"lie":8,"sort-by":15,"util":22}],37:[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var LiePromise = require('lie');
var canPlay = require('../environment').canPlay;
var sortBy = require('sort-by');
var VPAID_EVENTS = require('../enums/VPAID_EVENTS');
var HTML_MEDIA_EVENTS = require('../enums/HTML_MEDIA_EVENTS');
var HTMLVideoTracker = require('../HTMLVideoTracker');
var EventProxy = require('../EventProxy');

function on(video, event, handler) {
    return video.addEventListener(event, handler, false);
}

function off(video, event, handler) {
    return video.removeEventListener(event, handler, false);
}

function once(video, event, handler) {
    return on(video, event, function onevent() {
        off(video, event, onevent);
        return handler.apply(this, arguments);
    });
}

function method(implementation, promiseify) {
    function getError() {
        return new Error('The <video> has not been loaded.');
    }

    return function callImplementation(/*...args*/) {
        if (!this.video) {
            if (promiseify) { return LiePromise.reject(getError()); } else { throw getError(); }
        }

        return implementation.apply(this, arguments);
    };
}

function pickMediaFile(mediaFiles, dimensions) {
    var width = dimensions.width;
    var items = mediaFiles.map(function(mediaFile) {
        return {
            mediaFile: mediaFile,
            playability: canPlay(mediaFile.type)
        };
    }).filter(function(config) {
        return config.playability > 0;
    }).sort(sortBy('-playability', '-mediaFile.bitrate'));
    var distances = items.map(function(item) {
	     if(!item.mediaFile.hasOwnProperty("width") || !item.mediaFile.width)
		 item.mediaFile.width = 1000;
        return Math.abs(width - item.mediaFile.width);
    });
    var item = items[distances.indexOf(Math.min.apply(Math, distances))];

    return (!item || item.playability < 1) ? null : item.mediaFile;
}

function IOSVideo(container) {
    this.container = container;
    this.video = null;

    this.__private__ = {
        hasPlayed: false
    };
};
inherits(IOSVideo, EventEmitter);
Object.defineProperties(IOSVideo.prototype, {
    adRemainingTime: { get: method(function getAdRemainingTime() {
        return this.video.duration - this.video.currentTime;
    }) },
    adDuration: { get: method(function getAdDuration() { return this.video.duration; }) },
    adVolume: {
        get: method(function getAdVolume() { return this.video.volume; }),
        set: method(function setAdVolume(volume) { this.video.volume = volume; })
    }
});

IOSVideo.prototype.load = function load(mediaFiles) {
    var self = this;

    return new LiePromise(function loadCreative(resolve, reject) {
        var video = document.createElement('video');
		
        var mediaFile = pickMediaFile(mediaFiles, self.container.getBoundingClientRect());

        if (!mediaFile) {
            return reject(new Error('There are no playable <MediaFile>s.'));
        }
 
		video.setAttribute('muted',true);
		//video.setAttribute('autoplay',true);
		video.setAttribute('playsinline',true);
		
		
        video.setAttribute('webkit-playsinline', true);
        video.src = mediaFile.uri;
        video.preload = 'auto';

        video.style.display = 'block';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';

        once(video, HTML_MEDIA_EVENTS.LOADEDMETADATA, function onloadedmetadata() {
		
            var tracker = new HTMLVideoTracker(video);
            var proxy = new EventProxy(VPAID_EVENTS);

            proxy.from(tracker).to(self);

            self.video = video;
            resolve(self);

            self.emit(VPAID_EVENTS.AdLoaded);

            on(video, HTML_MEDIA_EVENTS.DURATIONCHANGE, function ondurationchange() {

                self.emit(VPAID_EVENTS.AdDurationChange);
            });
            on(video, HTML_MEDIA_EVENTS.VOLUMECHANGE, function onvolumechange() {

                self.emit(VPAID_EVENTS.AdVolumeChange);
            });
        });

        once(video, HTML_MEDIA_EVENTS.ERROR, function onerror() {

            var error = video.error;

            self.emit(VPAID_EVENTS.AdError, error.message);
            reject(error);
        });

        once(video, HTML_MEDIA_EVENTS.PLAYING, function onplaying() {
		    //alert('play');
            self.__private__.hasPlayed = true;
			//console.log(2231231774);
            self.emit(VPAID_EVENTS.AdImpression);
			//console.log(2231231774);
        });

        once(video, HTML_MEDIA_EVENTS.ENDED, function onended() {
		//alert('stop');
            self.stopAd();
        });

        on(video, 'click', function onclick() {
            self.emit(VPAID_EVENTS.AdClickThru, null, null, true);
        });

        self.container.appendChild(video);
    });
};

IOSVideo.prototype.startAd = method(function startAd() {

    var self = this;
    var video = this.video;
	/*
	function debugEvents(video) {
	[
		'loadstart',
		'progress',
		'suspend',
		'abort',
		'error',
		'emptied',
		'stalled',
		'loadedmetadata',
		'loadeddata',
		'canplay',
		'canplaythrough',
		'playing', // fake event
		'waiting',
		'seeking',
		'seeked',
		'ended',
	//  'durationchange',
		'timeupdate',
		'play', // fake event
		'pause', // fake event
	// 'ratechange',
	// 'resize',
	// 'volumechange',
		'webkitbeginfullscreen',
		'webkitendfullscreen',
	].forEach(function (event) {
		//video.addEventListener(event, function () {
			//console.info('@', event);
		//});
	});
}
*/
   // video.addEventListener('ended', function () {
	
	
	//		 self.stopAd();
	//});
    //video.addEventListener('playing', function () {
	        //resolve(self);
			//self.__private__.hasPlayed = false;
			//self.emit(VPAID_EVENTS.AdStarted);
	//});
	
	//window.enableInlineVideo(video, {everywhere: true});
	//alert('entry');
	
	//return null;
    //return video.play();
	//alert(this.__private__.hasPlayed);
    if (this.__private__.hasPlayed) {
	    //alert("играл почём зря"); 
        return LiePromise.reject(new Error('The ad has already been started.'));
    }
	
    return new LiePromise(function callPlay(resolve) {

	
        once(video, HTML_MEDIA_EVENTS.PLAYING, function onplaying() {
           // alert('once');
            resolve(self);
            self.emit(VPAID_EVENTS.AdStarted);
        });
		
		window.enableInlineVideo(video, {everywhere: true});
        return video.play();
    });
	
}, true);

IOSVideo.prototype.stopAd = method(function stopAd() {
    
   //this.container.removeChild(this.video); 
   //alert(this.container.innerHTML);
  
   this.emit(VPAID_EVENTS.AdStopped);
    //alert('переход');
    //this.__private__.hasPlayed = false; 
    return LiePromise.resolve(this);
}, true);

IOSVideo.prototype.pauseAd = method(function pauseAd() {
    var self = this;
    var video = this.video;

    if (this.video.paused) {
        return LiePromise.resolve(this);
    }
    
	video.className="";
    return new LiePromise(function callPause(resolve) {
        once(video, HTML_MEDIA_EVENTS.PAUSE, function onpause() {
            resolve(self);
            self.emit(VPAID_EVENTS.AdPaused);
        });

        return video.pause();
    });
}, true);

IOSVideo.prototype.resumeAd = method(function resumeAd() {
    var self = this;
    var video = this.video;

    if (!this.__private__.hasPlayed) {
        return LiePromise.reject(new Error('The ad has not been started yet.'));
    }
    video.className="IIV";
    if (!this.video.paused) {
        return LiePromise.resolve(this);
    }

    return new LiePromise(function callPlay(resolve) {
        once(video, HTML_MEDIA_EVENTS.PLAY, function onplay() {
            resolve(self);
            self.emit(VPAID_EVENTS.AdPlaying);
        });

        return video.play();
    });
}, true);

module.exports = IOSVideo;

},{"../EventProxy":24,"../HTMLVideoTracker":25,"../enums/HTML_MEDIA_EVENTS":30,"../enums/VPAID_EVENTS":32,"../environment":33,"events":6,"lie":8,"sort-by":15,"util":22}],38:[function(require,module,exports){
'use strict';

var  IVPAIDAdUnit = function() {

    //all methods below
    //are async methods
    this.handshakeVersion=function(playerVPAIDVersion , callback ) {};

    //creativeData is an object to be consistent with VPAIDHTML
    this.initAd=function(width, height, viewMode, desiredBitrate, creativeData, callback) {};
    this.resizeAd=function(width, height, viewMode, callback ) {};

    this.startAd=function(callback) {};
    this.stopAd=function(callback) {};
    this.pauseAd=function(callback ) {};
    this.resumeAd=function(callback) {};
    this.expandAd=function(callback) {};
    this.collapseAd=function(callback) {};
    this.skipAd=function(callback) {};

    //properties that will be treat as async methods
    this.getAdLinear=function(callback) {};
    this.etAdWidth=function(callback) {};
    this.getAdHeight=function(callback) {};
    this.getAdExpanded=function(callback) {};
    this.getAdSkippableState=function(callback) {};
    this.getAdRemainingTime=function(callback) {};
    this.getAdDuration=function(callback) {};
    this.setAdVolume=function(soundVolume, callback) {};
    this.getAdVolume=function(callback) {};
    this.getAdCompanions=function(callback) {};
    this.getAdIcons=function(callback) {};
	
}

Object.defineProperty(IVPAIDAdUnit, 'EVENTS', {
    writable: false,
    configurable: false,
    value: [
        'AdLoaded',
        'AdStarted',
        'AdStopped',
        'AdSkipped',
        'AdSkippableStateChange', // VPAID 2.0 new event
        'AdSizeChange', // VPAID 2.0 new event
        'AdLinearChange',
        'AdDurationChange', // VPAID 2.0 new event
        'AdExpandedChange',
        'AdRemainingTimeChange', // [Deprecated in 2.0] but will be still fired for backwards compatibility
        'AdVolumeChange',
        'AdImpression',
        'AdVideoStart',
        'AdVideoFirstQuartile',
        'AdVideoMidpoint',
        'AdVideoThirdQuartile',
        'AdVideoComplete',
        'AdClickThru',
        'AdInteraction', // VPAID 2.0 new event
        'AdUserAcceptInvitation',
        'AdUserMinimize',
        'AdUserClose',
        'AdPaused',
        'AdPlaying',
        'AdLog',
        'AdError'
    ]
});

module.exports.IVPAIDAdUnit=IVPAIDAdUnit;

},{}],39:[function(require,module,exports){
'use strict';

var inherits = require('util').inherits;
var VPAID = require('./VPAID');
var LiePromise = require('lie');
var EVENTS = require('../enums/VPAID_EVENTS');
var isDesktop = require('../environment').isDesktop;
var VPAIDVersion = require('../VPAIDVersion');

function JavaScriptVPAID() {
    VPAID.apply(this, arguments); // call super()
    this.playDelay=1;
	this.playClean=0;
	this.mypaused=1;
    this.frame = null;
}
inherits(JavaScriptVPAID, VPAID);

JavaScriptVPAID.prototype.load = function load(mediaFiles, parameters) {
    var self = this;
    var uri = mediaFiles[0].uri;
    var bitrate = mediaFiles[0].bitrate;

    return new LiePromise(function loadCreative(resolve, reject) {
        var iframe = document.createElement('iframe');
		iframe.scrolling="no";
        var script = document.createElement('script');
        var video = document.createElement('video');
        function checkMyOPaused(api){
		} 
        function cleanup(reason) {
		    self.playClean=1;
		    try{
            self.container.removeChild(iframe);
			}catch(e){
			
			}
            self.frame = null;
            self.api = null;
           
            if (reason) {

                reject(reason);
            }
			
        }
		function setCheckPlayedTime(cntS){
		if(self.playClean) return;
		//console.log(["222+ ",cntS]);   
		checkMyOPaused(self.vpaApi);
		
		if(cntS>0){
		setTimeout(function(){
		setCheckPlayedTime((cntS-1))
		}, 5000);
		return;
		}
		
		
		self.stopAd();
		}
        function setCheckLoadedTime(cnt){
		if(self.playClean) return;
		if(!self.playDelay) return;
			//console.log("vpaid "+cnt);  
		if(cnt>0){
		setTimeout(function(){
		setCheckLoadedTime((cnt-1))
		}, 1000);
		return;
		}
		cleanup(new Error("vpaid не загрузился в течении 18 сек"));  
		}
		
		setCheckLoadedTime(14);
		
		
        iframe.src = 'about:blank';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.display = 'block';
        iframe.style.opacity = '0';
        iframe.style.border = 'none';

        video.setAttribute('webkit-playsinline', 'true');
        video.style.display = 'block';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        
        self.container.appendChild(iframe);
        // Opening the iframe document for writing causes it to inherit its parent's location
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.close();

        iframe.contentWindow.document.body.style.margin = '0';
        self.frame = iframe;
         script.src = uri;
		if(self.id1==-4){
		//script.src=uri.replace(/https\:\/\//,'//');
        //console.log(["третья урна",self.id1,uri]);
		}
		//console.log(["третья тема",self.id1,script.src]); 
		
		console.log(["третья стадия",self.id1,script.src]); 
        script.onload = function onload() {
		
            var vpaid = iframe.contentWindow.getVPAIDAd();
			if(self.id1==33 || self.id1 == 34){
					video.style.display="none"; 
		            }	
		    var position = iframe.getBoundingClientRect();
            var slot = iframe.contentWindow.document.body;
            var version = self.vpaidVersion = new VPAIDVersion(vpaid.handshakeVersion('2.0'));
            
            function resizeAd() {
                var position = iframe.getBoundingClientRect();
                self.resizeAd(position.width, position.height, 'normal');
            }

            if (version.major > 2) {
                return reject(new Error('VPAID version ' + version + ' is not supported.'));
            }

            iframe.contentWindow.addEventListener('resize', resizeAd, false);
            
            EVENTS.forEach(function subscribe(event) {
                return vpaid.subscribe(function handle(/*...args*/) {
                    var args = new Array(arguments.length);
                    var length = arguments.length;
					
                    while (length--) { args[length] = arguments[length]; }
					
                    return self.emit.apply(self, [event].concat(args));
                }, event);
            });
            
				    
            self.once(EVENTS.AdLoaded, function onAdLoaded() {
              
			    self.playDelay=0;
                iframe.style.opacity = '1';
                self.api = vpaid;
				if(self.id1==31 || self.id1 == 32){
				
				}else{
				//setCheckPlayedTime(20);
				}
                resolve(self);
            });

            self.once(EVENTS.AdError, function onAdError(reason) {
			
		        cleanup(new Error(reason));
            });

            self.once(EVENTS.AdStopped, function (){
			cleanup();
			});
			self.vpaApi=vpaid;
			if(self.id1==31 || self.id1 == 32){
			self.once(EVENTS.AdPlaying, function onAdStart() {
			setCheckPlayedTime(12);
			});
			}
			
            vpaid.initAd(
                position.width,
                position.height,
                'normal',
                bitrate,
                { AdParameters: parameters },
                { slot: slot, videoSlot: video, videoSlotCanAutoPlay: isDesktop }
            );
        };
        script.onerror = function onerror() {
        cleanup(new Error('Failed to load MediaFile [' + uri + '].'));
        };

        iframe.contentWindow.document.body.appendChild(video);
        iframe.contentWindow.document.head.appendChild(script);
    });
};

module.exports = JavaScriptVPAID;

},{"../VPAIDVersion":28,"../enums/VPAID_EVENTS":32,"../environment":33,"./VPAID":40,"lie":8,"util":22}],40:[function(require,module,exports){
'use strict';

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var LiePromise = require('lie');
var EVENTS = require('../enums/VPAID_EVENTS');

function proxy(method, event) {
    return function callMethod(/*..args*/) {

        var args = arguments;

        var api = this.api;
        var self = this;
        console.log(method,api,event)
        function getError() {
            return new Error('Ad has not been loaded.');
        }

        function call() {
		

		    console.log(["called method:",method,api[method],args]);
            return api[method].apply(api, args);
        }
 //alert(["called method:",event]);
        if (!event) {
            console.log(method,api,event)
            if (!api) {
                throw getError();
            }

            return call();
        }

        return new LiePromise(function(resolve, reject) {
            if (!api) {
                return reject(getError());
            }

            self.once(event, function done() {
                resolve(self);
            });

            return call();
        });
    };
}

function VPAID(container) {
    this.container = container;
    this.api = null;
    this.vpaidVersion = null;
}
inherits(VPAID, EventEmitter);
Object.defineProperties(VPAID.prototype, {
    adLinear: { get: proxy('getAdLinear') },
    adWidth: { get: proxy('getAdWidth') },
    adHeight: { get: proxy('getAdHeight') },
    adExpanded: { get: proxy('getAdExpanded') },
    adSkippableState: { get: proxy('getAdSkippableState') },
    adRemainingTime: { get: proxy('getAdRemainingTime') },
    adDuration: { get: proxy('getAdDuration') },
    adVolume: { get: proxy('getAdVolume'), set: proxy('setAdVolume') },
    adCompanions: { get: proxy('getAdCompanions') },
    adIcons: { get: proxy('getAdIcons') }
});

VPAID.prototype.load = function load() {
    throw new Error('VPAID subclass must implement load() method.');
};

VPAID.prototype.resizeAd = proxy('resizeAd', EVENTS.AdSizeChange);

VPAID.prototype.startAd = proxy('startAd', EVENTS.AdStarted);

VPAID.prototype.stopAd = proxy('stopAd', EVENTS.AdStopped);

VPAID.prototype.pauseAd = proxy('pauseAd', EVENTS.AdPaused);

VPAID.prototype.resumeAd = proxy('resumeAd', EVENTS.AdPlaying);

VPAID.prototype.expandAd = proxy('expandAd', EVENTS.AdExpandedChange);

VPAID.prototype.collapseAd = proxy('collapseAd', EVENTS.AdExpandedChange);

VPAID.prototype.skipAd = proxy('skipAd', EVENTS.AdSkipped);

module.exports = VPAID;

},{"../enums/VPAID_EVENTS":32,"events":6,"lie":8,"util":22}],41:[function(require,module,exports){
'use strict';
var inherits = require('util').inherits;

var IVPAIDAdUnit = require('./IVPAIDAdUnit').IVPAIDAdUnit;
/*
 var ALL_VPAID_METHODS = Object.getOwnPropertyNames(IVPAIDAdUnit.prototype).filter(function (property) {
 return ['constructor'].indexOf(property) === -1;});
 */
function VPAIDAdUnit(flash) {
    //super();
    this._destroyed = false;
    this._flash = flash;

    this.handshakeVersion = function (playerVPAIDVersion, callback) {
        this._flash.callFlashMethod('handshakeVersion', [playerVPAIDVersion], callback);
    };
    this.initAd = function (width, height, viewMode, desiredBitrate, creativeData, environmentVars, callback) {
        creativeData = creativeData || {AdParameters: ''};
        environmentVars = environmentVars || {flashVars: ''};
        ////resize element that has the flash object
        this._flash.setSize(width, height);
        creativeData = creativeData || {AdParameters: ''};
        environmentVars = environmentVars || {flashVars: ''};
        this._flash.callFlashMethod('initAd', [this._flash.getWidth(), this._flash.getHeight(), viewMode, desiredBitrate, creativeData.AdParameters || '', environmentVars.flashVars || ''], callback);

    };
    this.setAdVolume = function (volume, callback) {
        this._flash.callFlashMethod('setAdVolume', [volume], callback);
    }
    this.getAdVolume = function (callback) {
        this._flash.callFlashMethod('getAdVolume', [], callback);
    }
    this.startAd = function (callback) {
        this._flash.callFlashMethod('startAd', [], callback);
    };
    this.on = function (eventName, callback) {

        this._flash.on(eventName, callback);
    };
//properties that will be treat as async methods
    this.getAdLinear = function (callback) {
        this._flash.callFlashMethod('getAdLinear', [], callback);
    }
    this.getAdWidth = function (callback) {
        this._flash.callFlashMethod('getAdWidth', [], callback);
    }
    this.getAdHeight = function (callback) {
        this._flash.callFlashMethod('getAdHeight', [], callback);
    }
    this.getAdExpanded = function (callback) {
        this._flash.callFlashMethod('getAdExpanded', [], callback);
    }
    this.getAdSkippableState = function (callback) {
        this._flash.callFlashMethod('getAdSkippableState', [], callback);
    }
    this.getAdRemainingTime = function (callback) {
        this._flash.callFlashMethod('getAdRemainingTime', [], callback);
    }
    this.getAdDuration = function (callback) {
        this._flash.callFlashMethod('getAdDuration', [], callback);
    }
    this.getAdCompanions = function (callback) {
        this._flash.callFlashMethod('getAdCompanions', [], callback);
    }
    this.getAdIcons = function (callback) {
        this._flash.callFlashMethod('getAdIcons', [], callback);
    };
};
//
//VPAIDAdUnit.prototype.handshakeVersion = function(playerVPAIDVersion , callback) {
//        this._flash.callFlashMethod('handshakeVersion', [playerVPAIDVersion], callback);
// };
//VPAIDAdUnit.prototype.initAd =function(width, height, viewMode, desiredBitrate, creativeData, environmentVars , callback ) {
//creativeData = creativeData  || {AdParameters: ''};
//environmentVars = environmentVars || {flashVars: ''};
//        ////resize element that has the flash object
//        this._flash.setSize(width, height);
//		creativeData = creativeData || {AdParameters: ''};
//		environmentVars = environmentVars || {flashVars: ''};
//		this._flash.callFlashMethod('initAd', [this._flash.getWidth(), this._flash.getHeight(), viewMode, desiredBitrate, creativeData.AdParameters || '', environmentVars.flashVars || ''], callback);
//
//    };
//VPAIDAdUnit.prototype.setAdVolume = function(volume, callback) {
//        this._flash.callFlashMethod('setAdVolume', [volume], callback);
//    }
//VPAIDAdUnit.prototype.getAdVolume = function(callback) {
//        this._flash.callFlashMethod('getAdVolume', [], callback);
//    }
//VPAIDAdUnit.prototype.startAd=function(callback) {
//    this._flash.callFlashMethod('startAd', [], callback);
//};
//VPAIDAdUnit.prototype.on=function(eventName, callback) {
//
//        this._flash.on(eventName, callback);
//    };
////properties that will be treat as async methods
//VPAIDAdUnit.prototype.getAdLinear=function(callback) {
//    this._flash.callFlashMethod('getAdLinear', [], callback);
//}
//VPAIDAdUnit.prototype.getAdWidth=function(callback) {
//    this._flash.callFlashMethod('getAdWidth', [], callback);
//}
//VPAIDAdUnit.prototype.getAdHeight=function(callback) {
//    this._flash.callFlashMethod('getAdHeight', [], callback);
//}
//VPAIDAdUnit.prototype.getAdExpanded=function(callback) {
//    this._flash.callFlashMethod('getAdExpanded', [], callback);
//}
//VPAIDAdUnit.prototype.getAdSkippableState=function(callback) {
//    this._flash.callFlashMethod('getAdSkippableState', [], callback);
//}
//VPAIDAdUnit.prototype.getAdRemainingTime=function(callback) {
//    this._flash.callFlashMethod('getAdRemainingTime', [], callback);
//}
//VPAIDAdUnit.prototype.getAdDuration=function(callback) {
//    this._flash.callFlashMethod('getAdDuration', [], callback);
//}
//VPAIDAdUnit.prototype.getAdCompanions=function(callback) {
//    this._flash.callFlashMethod('getAdCompanions', [], callback);
//}
//VPAIDAdUnit.prototype.getAdIcons=function(callback) {
//    this._flash.callFlashMethod('getAdIcons', [], callback);
//};
inherits(VPAIDAdUnit, IVPAIDAdUnit);
module.exports.VPAIDAdUnit = VPAIDAdUnit;
/*
 class VPAIDAdUnit extends IVPAIDAdUnit {
 constructor (flash) {
 super();
 this._destroyed = false;
 this._flash = flash;
 }

 _destroy() {
 this._destroyed = true;
 ALL_VPAID_METHODS.forEach((methodName) => {
 this._flash.removeCallbackByMethodName(methodName);
 });
 IVPAIDAdUnit.EVENTS.forEach((event) => {
 this._flash.offEvent(event);
 });

 this._flash = null;
 }

 isDestroyed () {
 return this._destroyed;
 }



 off(eventName, callback) {
 this._flash.off(eventName, callback);
 }

 //VPAID interface
 handshakeVersion(playerVPAIDVersion = '2.0', callback = undefined) {
 this._flash.callFlashMethod('handshakeVersion', [playerVPAIDVersion], callback);
 }
 initAd (width, height, viewMode, desiredBitrate, creativeData = {AdParameters: ''}, environmentVars = {flashVars: ''}, callback = undefined) {
 //resize element that has the flash object
 this._flash.setSize(width, height);
 creativeData = creativeData || {AdParameters: ''};
 environmentVars = environmentVars || {flashVars: ''};

 this._flash.callFlashMethod('initAd', [this._flash.getWidth(), this._flash.getHeight(), viewMode, desiredBitrate, creativeData.AdParameters || '', environmentVars.flashVars || ''], callback);
 }
 resizeAd(width, height, viewMode, callback = undefined) {
 //resize element that has the flash object
 this._flash.setSize(width, height);

 //resize ad inside the flash
 this._flash.callFlashMethod('resizeAd', [this._flash.getWidth(), this._flash.getHeight(), viewMode], callback);
 }
 startAd(callback = undefined) {
 this._flash.callFlashMethod('startAd', [], callback);
 }
 stopAd(callback = undefined) {
 this._flash.callFlashMethod('stopAd', [], callback);
 }
 pauseAd(callback = undefined) {
 this._flash.callFlashMethod('pauseAd', [], callback);
 }
 resumeAd(callback = undefined) {
 this._flash.callFlashMethod('resumeAd', [], callback);
 }
 expandAd(callback = undefined) {
 this._flash.callFlashMethod('expandAd', [], callback);
 }
 collapseAd(callback = undefined) {
 this._flash.callFlashMethod('collapseAd', [], callback);
 }
 skipAd(callback = undefined) {
 this._flash.callFlashMethod('skipAd', [], callback);
 }

 //properties that will be treat as async methods
 getAdLinear(callback) {
 this._flash.callFlashMethod('getAdLinear', [], callback);
 }
 getAdWidth(callback) {
 this._flash.callFlashMethod('getAdWidth', [], callback);
 }
 getAdHeight(callback) {
 this._flash.callFlashMethod('getAdHeight', [], callback);
 }
 getAdExpanded(callback) {
 this._flash.callFlashMethod('getAdExpanded', [], callback);
 }
 getAdSkippableState(callback) {
 this._flash.callFlashMethod('getAdSkippableState', [], callback);
 }
 getAdRemainingTime(callback) {
 this._flash.callFlashMethod('getAdRemainingTime', [], callback);
 }
 getAdDuration(callback) {
 this._flash.callFlashMethod('getAdDuration', [], callback);
 }
 setAdVolume(volume, callback = undefined) {
 this._flash.callFlashMethod('setAdVolume', [volume], callback);
 }
 getAdVolume(callback) {
 this._flash.callFlashMethod('getAdVolume', [], callback);
 }
 getAdCompanions(callback) {
 this._flash.callFlashMethod('getAdCompanions', [], callback);
 }
 getAdIcons(callback) {
 this._flash.callFlashMethod('getAdIcons', [], callback);
 }
 }
 */

},{"./IVPAIDAdUnit":38,"util":22}],42:[function(require,module,exports){
'use strict';
 	    
var FLASH_TEST_EL = 'vpaid_video_flash_tester_el';
var swfobject = require('./myswf');
var noop = require('./utils').noop;
var isPositiveInt = require('./utils').isPositiveInt;
var uniqueVPAID = require('./utils').unique('vpaid');
var callbackTimeout = require('./utils').callbackTimeout;
var createElementWithID = require('./utils').createElementWithID;
var JSFlashBridge = require('./jsFlashBridge').JSFlashBridge;
var VPAIDAdUnit = require('./VPAIDAdUnit').VPAIDAdUnit;
//var createFlashTester = require('./flashTester').createFlashTester;
var ERROR = 'error';
var FLASH_VERSION = '10.1.0';
var flashTester=true;
 	   
function VPAIDFLASHClient(elementP, callback, swfConfig, params , vpaidOptions) {
 	    var me = this;
        this._vpaidParentEl = vpaidParentEl;
		this._flashID = uniqueVPAID();
		this._destroyed = false;
		this._playerLoading = 0;
	
        callback = callback || noop;
	   
		swfConfig.width = isPositiveInt(swfConfig.width, 500);
        swfConfig.height = isPositiveInt(swfConfig.height, 350);

	    if(!VPAIDFLASHClient.isSupported()) {
	    
         return onError('user don\'t support flash or doesn\'t have the minimum required version of flash ' + FLASH_VERSION);
        }
		
        params.movie = swfConfig.data;
		var vpaidParentEl=document.createElement("DIV"); 
		document.body.appendChild(vpaidParentEl);
        vpaidParentEl.style.display='block!important';
		var parentEl = createElementWithID(vpaidParentEl, FLASH_TEST_EL); // some browsers create global variables
		var self = this;
	    params.FlashVars = 'flashid='+FLASH_TEST_EL+'&handler='+JSFlashBridge.VPAID_FLASH_HANDLER+'&debug='+vpaidOptions.debug+'salign='+params.salign; 
		params.FlashVars = 'flashid='+FLASH_TEST_EL+'&handler='+JSFlashBridge.VPAID_FLASH_HANDLER+'&debug=false'; 
		params.allowScriptAccess = 'always';
		//console.log(11112);
	    this.el = swfobject.createSWF(swfConfig, params, FLASH_TEST_EL);
		//console.log(11112);
		if(!this.el){
		 document.body.removeChild(vpaidParentEl);
		 return onError('user don\'t support flash or doesn\'t have the minimum required version of flash ' + FLASH_VERSION);
		}
					this._flash = new JSFlashBridge(this.el, swfConfig.data, FLASH_TEST_EL, swfConfig.width, swfConfig.width, function(){
					self._playerLoading = 1;
			        callback();
		            });
					
					
					
	    function setCheckLoadedTime(cnt){
		if(self._playerLoading) return;
		if(self._destroyed) return;
		console.log(["таймер load",cnt]);
		if(cnt>0){
		setTimeout(function(){
		setCheckLoadedTime((cnt-1))
		}, 1000);
		return;
		}
         self.destroy();
	     document.body.removeChild(vpaidParentEl);
		 return onError("flash 10 сек");
		 //reject("flash 10 сек");
		//cleanup(new Error("vpaid не загрузился в течении 18 сек"));  
		}
		
		setCheckLoadedTime(10);			
		
		return;
		
		console.log(11115);
			this._flash = new JSFlashBridge(this.el, swfConfig.data, FLASH_TEST_EL, swfConfig.width, swfConfig.width, function(){
			console.log(11116);
                // var adURL = 'http://cdn.innovid.com/2.62.8110/platform/vpaid/VPAIDIRollPackage.swf?configURL=http%3A%2F%2Fstatic.innovid.com%2Firoll%2Fconfig%2F1hl7lc.xml%3Fcb%3D787766d7-ebab-3656-c24f-0ddebab645e9&secure=false';
                // var adURL = 'VPAIDIRollPackage.swf?configURL=http%3A%2F%2Fstatic.innovid.com%2Firoll%2Fconfig%2F1hl7lc.xml%3Fcb%3D787766d7-ebab-3656-c24f-0ddebab645e9&secure=false';
                // var adURL = 'TestAd.swf';
                var adURL = 'http://cdn-sys.brainient.com/flash/v6/select846.swf?video_id=a3f30b8e-2ad8-4123-bc58-42fccb3e48cd&user_id=1228&tzone=&settings=json&settingsPath=http://cdn-tags.brainient.com/1228/a3f30b8e-2ad8-4123-bc58-42fccb3e48cd/config.json';
                // var adURL = 'http://shim.btrll.com/shim/20150715.85603_master/Scout.swf?asset_64=aHR0cDovL2NhY2hlLmJ0cmxsLmNvbS9wcm9kdWN0L3Rlc3QvdmFzdF93cmFwcGVyL2JyLXZhc3Rfd3JhcHBlci54bWw&vid_click_url=&h_64=YnJ4c2Vydi0yMi5idHJsbC5jb20&e=p&config_url_64=&type=VAST_TAG&vh_64=bWhleHQtMjIuYnRybGwuY29t&p=6834995&s=3863356&l=28043&ic=51223&ii=6594&x=TbBvLqwwDICcRVsPZkAABtiwAAyBcAOvM8AAAAAABhtJT2o-vMJQ&cx=&dn=&hidefb=true&iq=t&adc=false&si=&t=33&apep=0.03&hbp=0.01&epx=&ps=0.0&view=vast2&woid=____________________________________';
//var adURL = "https://cdn.webturn.ru/-/OtherVAST/LamodaVASTFeb17_1.swf?"+Math.random();
//var adURL="https://imasdk.googleapis.com/flash/sdkloader/vpaid2video.swf?adTagUrl=embedded&embedAdsResponse=1";
               self.loadAdUnit(adURL,function (error, adUnit){
			   adUnit.handshakeVersion('2.0', initAd);
               adUnit.on('AdLoaded', startAd);
                function initAd(err, result) {
                        console.log('handShake', err, result);
                        adUnit.initAd(swfConfig.width, swfConfig.height, 'normal', -1, '', '', function (err) {
                        });
                }
				function startAd(err, result) {
				       // elementP.style.display='block';
						document.getElementById("mycontoller").style.display="none";
						//elementP.innerHTML="df;gk;d rwwerwerwrwreflkg;dflgk;dflgk;dflgkdf;glkgdf;lgk";
						//elementP.style.color='#FFFFFF';
					//vpaidParentEl.style.position = 'relative';
                    //self._flash.setSize(400, 200); 
                    //vpaidParentEl.style.width = '100px';
                    //vpaidParentEl.style.height = '100px';
					//elementP.appendChild(vpaidParentEl);
					//elementP.style.zIndex=99999;
					//alert(elementP.id);
						document.getElementById("mycontoller").style.display="none";
				        adUnit.setAdVolume(0.1);
                        console.log('event:Start', err, result);
                        adUnit.startAd(function (err, result) {
                        console.log('startAd call', err, result);
                        });
               }
			});
			
            });


   console.log("принцип справедливости 1"); 
    if (!VPAIDFLASHClient.isSupported()) {
	    
         return onError('user don\'t support flash or doesn\'t have the minimum required version of flash ' + FLASH_VERSION);
    }
		

	    //this.el = swfobject.createSWF(swfConfig, params, this._flashID);

        if (!this.el) {
		    console.log("принцип справедливости 0"); 
            return onError( 'swfobject failed to create object in element' );
        }	
		

		
		
		 console.log("принцип справедливости 2 "); 
        function onError(error) {
            setTimeout(function(){
			    callback(new Error(error));
            }, 0);
            return me;
        }		
};
VPAIDFLASHClient.prototype._destroyAdUnit=function() {
         delete this._loadLater;

        if (this._adUnitLoad) {
            this._adUnitLoad = null;
            this._flash.removeCallback(this._adUnitLoad);
        }

        if (this._adUnit) {
            this._adUnit._destroy();
            this._adUnit = null;
        }
    }
VPAIDFLASHClient.prototype.destroy =function() {
        this._destroyAdUnit();

        if (this._flash) {
            this._flash.destroy();
            this._flash = null;
        }
        this.el = null;
        this._destroyed = true;
    }
VPAIDFLASHClient.prototype.loadAdUnit= function(adURL, callback) {

        if (this._flash.isReady()) {
		var self=this;
            this._adUnitLoad = function(err, message){
               if (!err) {
                   self._adUnit = new VPAIDAdUnit(self._flash);
                }
                self._adUnitLoad = null;
                callback(err, self._adUnit);
            };

         this._flash.callFlashMethod('loadAdUnit', [adURL], this._adUnitLoad);
        }else{

		 this._loadLater = {url: adURL, callback:callback};
		}

};


	function setStaticProperty(propertyName, value, writable) {
	    writable = writable || false;
        Object.defineProperty(VPAIDFLASHClient, propertyName, {
            writable: writable,
            configurable: false,
            value: value
        });
    }


	
	
setStaticProperty('isSupported', function(){
  
       //return true;
	   return swfobject.hasFlashPlayerVersion(FLASH_VERSION);
    }, true);
function hideFlashEl (el) {
    // can't use display none or visibility none because will block flash in some browsers
    el.style.position = 'absolute';
    el.style.left = '-1px';
    el.style.top = '-1px';
    el.style.width = '1px';
    el.style.height = '1px';
}

VPAIDFLASHClient.swfobject = swfobject;
module.exports =  VPAIDFLASHClient;
	 
/*






let flashTester = {isSupported: ()=> true}; // if the runFlashTest is not run the flashTester will always return true

class VPAIDFLASHClient {
    constructor (vpaidParentEl, callback, swfConfig = {data: 'VPAIDFlash.swf', width: 800, height: 400}, params = { wmode: 'transparent', salign: 'tl', align: 'left', allowScriptAccess: 'always', scale: 'noScale', allowFullScreen: 'true', quality: 'high'}, vpaidOptions = { debug: false, timeout: 10000 }) {

        var me = this;

        this._vpaidParentEl = vpaidParentEl;
        this._flashID = uniqueVPAID();
        this._destroyed = false;
        callback = callback || noop;

        swfConfig.width = isPositiveInt(swfConfig.width, 800);
        swfConfig.height = isPositiveInt(swfConfig.height, 400);

        createElementWithID(vpaidParentEl, this._flashID, true);

        params.movie = swfConfig.data;
        params.FlashVars = `flashid=${this._flashID}&handler=${JSFlashBridge.VPAID_FLASH_HANDLER}&debug=${vpaidOptions.debug}&salign=${params.salign}`;

        if (!VPAIDFLASHClient.isSupported()) {
            return onError('user don\'t support flash or doesn\'t have the minimum required version of flash ' + FLASH_VERSION);
        }

        this.el = swfobject.createSWF(swfConfig, params, this._flashID);

        if (!this.el) {
            return onError( 'swfobject failed to create object in element' );
        }

        var handler = callbackTimeout(vpaidOptions.timeout,
            (err, data) => {
                $loadPendedAdUnit.call(this);
                callback(err, data);
            }, () => {
                callback('vpaid flash load timeout ' + vpaidOptions.timeout);
            }
        );

        this._flash = new JSFlashBridge(this.el, swfConfig.data, this._flashID, swfConfig.width, swfConfig.height, handler);

        function onError(error) {
            setTimeout(() => {
                callback(new Error(error));
            }, 0);
            return me;
        }

    }

    destroy () {
        this._destroyAdUnit();

        if (this._flash) {
            this._flash.destroy();
            this._flash = null;
        }
        this.el = null;
        this._destroyed = true;
    }

    isDestroyed () {
        return this._destroyed;
    }

    _destroyAdUnit() {
        delete this._loadLater;

        if (this._adUnitLoad) {
            this._adUnitLoad = null;
            this._flash.removeCallback(this._adUnitLoad);
        }

        if (this._adUnit) {
            this._adUnit._destroy();
            this._adUnit = null;
        }
    }

    loadAdUnit(adURL, callback) {
        $throwIfDestroyed.call(this);

        if (this._adUnit) {
            this._destroyAdUnit();
        }

        if (this._flash.isReady()) {
            this._adUnitLoad = (err, message) => {
                if (!err) {
                    this._adUnit = new VPAIDAdUnit(this._flash);
                }
                this._adUnitLoad = null;
                callback(err, this._adUnit);
            };

            this._flash.callFlashMethod('loadAdUnit', [adURL], this._adUnitLoad);
        }else {
            this._loadLater = {url: adURL, callback};
        }
    }

    unloadAdUnit(callback = undefined) {
        $throwIfDestroyed.call(this);

        this._destroyAdUnit();
        this._flash.callFlashMethod('unloadAdUnit', [], callback);
    }
    getFlashID() {
        $throwIfDestroyed.call(this);
        return this._flash.getFlashID();
    }
    getFlashURL() {
        $throwIfDestroyed.call(this);
        return this._flash.getFlashURL();
    }
	
}

setStaticProperty('isSupported', () => {
    return swfobject.hasFlashPlayerVersion(FLASH_VERSION) && flashTester.isSupported();
}, true);

setStaticProperty('runFlashTest', (swfConfig) => {
    flashTester = createFlashTester(document.body, swfConfig);
});

function $throwIfDestroyed() {
    if(this._destroyed) {
        throw new Error('VPAIDFlashToJS is destroyed!');
    }
}

function $loadPendedAdUnit() {
    if (this._loadLater) {
        this.loadAdUnit(this._loadLater.url, this._loadLater.callback);
        delete this._loadLater;
    }
}

function setStaticProperty(propertyName, value, writable = false) {
    Object.defineProperty(VPAIDFLASHClient, propertyName, {
        writable: writable,
        configurable: false,
        value: value
    });
}


*/



},{"./VPAIDAdUnit":41,"./jsFlashBridge":43,"./myswf":45,"./utils":47}],43:[function(require,module,exports){
'use strict';

var unique = require('./utils').unique;
var isPositiveInt = require('./utils').isPositiveInt;
var stringEndsWith = require('./utils').stringEndsWith;
var SingleValueRegistry = require('./registry').SingleValueRegistry; 
var MultipleValuesRegistry = require('./registry').MultipleValuesRegistry;
var registry = require('./jsFlashBridgeRegistry');
var VPAID_FLASH_HANDLER = 'vpaid_video_flash_handler';
var ERROR = 'AdError';
/**/
function JSFlashBridge(el, flashURL, flashID, width, height, loadHandShake) {
        
        this._el = el;
        this._flashID = flashID;
        this._flashURL = flashURL;
        this._width = width;
        this._height = height;
        this._handlers = new MultipleValuesRegistry();
        this._callbacks = new SingleValueRegistry();
        this._uniqueMethodIdentifier = unique(this._flashID);
        this._ready = false;
        this._handShakeHandler = loadHandShake;
		
        registry.addInstance(this._flashID, this);
	  
        	
};
JSFlashBridge.prototype._handShake=function(err, data) {
            this._ready = true;
            if (this._handShakeHandler) {
                this._handShakeHandler(err, data);
                delete this._handShakeHandler;
            }
        }	
JSFlashBridge.prototype.on=function(eventName, callback) {
        console.log(["on event 1",this._handlers]);
        this._handlers.add(eventName, callback);
		console.log(["on event 2",this._handlers]);
}		
JSFlashBridge.prototype.setSize=function(newWidth, newHeight) {
        this._width = isPositiveInt(newWidth, this._width);
        this._height = isPositiveInt(newHeight, this._height);
        this._el.setAttribute('width', this._width);
        this._el.setAttribute('height', this._height);
    }		
JSFlashBridge.prototype.getWidth=function() {
        return this._width;
    }	
JSFlashBridge.prototype.getHeight=function() {
        return this._height;
    }	
JSFlashBridge.prototype.isReady=function() {
    return this._ready;
}
JSFlashBridge.prototype.callFlashMethod =function(methodName, args, callback) {
        var callbackID = '';
        // if no callback, some methods the return is void so they don't need callback
        if (callback) {
            callbackID = this._uniqueMethodIdentifier()+' / '+ methodName;
            this._callbacks.add(callbackID, callback);
        }
	   console.log(this._el);


        try {
            //methods are created by ExternalInterface.addCallback in as3 code, if for some reason it failed
            //this code will throw an error
            this._el[methodName]([callbackID].concat(args));

        } catch (e) {
		
		console.log(e);
		
            if (callback) {
                $asyncCallback.call(this, callbackID, e);
            } else {

                //if there isn't any callback to return error use error event handler
                this._trigger(ERROR, e);
            }
			
        }
		
};
JSFlashBridge.prototype.offAll = function() {
        return this._handlers.removeAll();
};
JSFlashBridge.prototype.removeCallback=function(callback) {
        return this._callbacks.removeByValue(callback);
    }
JSFlashBridge.prototype.removeAllCallbacks =function() {
        return this._callbacks.removeAll();
};
JSFlashBridge.prototype.destroy = function() {
        this.offAll();
        this.removeAllCallbacks();
        registry.removeInstanceByID(this._flashID);
        if (this._el.parentElement) {
            this._el.parentElement.removeChild(this._el);
        }
    };
JSFlashBridge.prototype._trigger=function(eventName, event) {
var self=this;
        this._handlers.get(eventName).forEach(function(callback){
            //clickThru has to be sync, if not will be block by the popupblocker
            if (eventName === 'AdClickThru') {
                callback(event);
            } else {
                setTimeout(function (){
                    if (self._handlers.get(eventName).length > 0) {
                        callback(event);
                    }
                }, 0);
            }
        });
    };

JSFlashBridge.prototype._callCallback = function(methodName, callbackID, err, result) {

        var callback = this._callbacks.get(callbackID);
       
        //not all methods callback's are mandatory
        //but if there exist an error, fire the error event
        if (!callback) {
            if (err && callbackID === '') {
                this.trigger(ERROR, err);
            }
            return;
        }

        $asyncCallback.call(this, callbackID, err, result);

    }
var $asyncCallback = function(callbackID, err, result) {
//alert(this);
var self=this;
    setTimeout(function (){
        var callback = self._callbacks.get(callbackID);
        if (callback) {
            self._callbacks.remove(callbackID);
            callback(err, result);
        }
    }, 0);
}
Object.defineProperty(JSFlashBridge, 'VPAID_FLASH_HANDLER', {
    writable: false,
    configurable: false,
    value: VPAID_FLASH_HANDLER
});
window[VPAID_FLASH_HANDLER] = function (flashID, typeID, typeName, callbackID, error, data){
 console.log([typeID,callbackID,typeName,error,data]); 
    var instance = registry.getInstanceByID(flashID);
	
    if (!instance) return;
    if (typeName === 'handShake') {
        instance._handShake(error, data);
    } else {
        if (typeID !== 'event') {
            instance._callCallback(typeName, callbackID, error, data);
        } else {
		
            instance._trigger(typeName, data);
        }
    }
};


module.exports.JSFlashBridge = JSFlashBridge;

},{"./jsFlashBridgeRegistry":44,"./registry":46,"./utils":47}],44:[function(require,module,exports){
'use strict';

var SingleValueRegistry = require('./registry').SingleValueRegistry;

var instances = new SingleValueRegistry();

var JSFlashBridgeRegistry = {};
Object.defineProperty(JSFlashBridgeRegistry, 'addInstance', {
    writable: false,
    configurable: false,
    value: function (id, instance) {
	    instances.add(id, instance);
    }
});

Object.defineProperty(JSFlashBridgeRegistry, 'getInstanceByID', {
    writable: false,
    configurable: false,
    value: function (id) {
        return instances.get(id);
    }
});

Object.defineProperty(JSFlashBridgeRegistry, 'removeInstanceByID', {
    writable: false,
    configurable: false,
    value: function (id) {
        return instances.remove(id);
    }
});

module.exports = JSFlashBridgeRegistry;
},{"./registry":46}],45:[function(require,module,exports){
'use strict';
        var win = window;
        var doc = document;
        var nav = navigator;
		var UNDEF = "undefined";
        var OBJECT = "object";
        var SHOCKWAVE_FLASH = "Shockwave Flash";
        var SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash";
        var FLASH_MIME_TYPE  = "application/x-shockwave-flash";
        var EXPRESS_INSTALL_ID = "SWFObjectExprInst";
        var ON_READY_STATE_CHANGE = "onreadystatechange";
		var plugin = false;
        var domLoadFnArr = [];
        var regObjArr = [];
        var objIdArr = [];
        var listenersArr = [];
function ua() {
        var w3cdom = typeof doc.getElementById !== UNDEF && typeof doc.getElementsByTagName !== UNDEF && typeof doc.createElement !== UNDEF,
            u = nav.userAgent.toLowerCase(),
            p = nav.platform.toLowerCase(),
            windows = p ? /win/.test(p) : /win/.test(u),
            mac = p ? /mac/.test(p) : /mac/.test(u),
            webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
            ie = nav.appName === "Microsoft Internet Explorer",
            playerVersion = [0, 0, 0],
            d = null;
        if (typeof nav.plugins !== UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] === OBJECT) {
            d = nav.plugins[SHOCKWAVE_FLASH].description;
            // nav.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
            if (d && (typeof nav.mimeTypes !== UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) {
                plugin = true;
                ie = false; // cascaded feature detection for Internet Explorer
                d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                playerVersion[0] = toInt(d.replace(/^(.*)\..*$/, "$1"));
                playerVersion[1] = toInt(d.replace(/^.*\.(.*)\s.*$/, "$1"));
                playerVersion[2] = /[a-zA-Z]/.test(d) ? toInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1")) : 0;
            }
        }
        else if (typeof win.ActiveXObject !== UNDEF) {
            try {
                var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
                if (a) { // a will return null when ActiveX is disabled
                    d = a.GetVariable("$version");
                    if (d) {
                        ie = true; // cascaded feature detection for Internet Explorer
                        d = d.split(" ")[1].split(",");
                        playerVersion = [toInt(d[0]), toInt(d[1]), toInt(d[2])];
                    }
                }
            }
            catch (e) {}
        }
        return {w3: w3cdom, pv: playerVersion, wk: webkit, ie: ie, win: windows, mac: mac};
}
function hasPlayerVersion(rv) {
        rv += ""; //Coerce number to string, if needed.
		
        var pv = myswf.ua.pv, v = rv.split(".");
        v[0] = toInt(v[0]);
        v[1] = toInt(v[1]) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
        v[2] = toInt(v[2]) || 0;
        return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
}

var myswf={
        hasFlashPlayerVersion: hasPlayerVersion,
		ua:ua(),
		createSWF:function (attObj, parObj, id) {
		
        var r, el = getElementById(id);
        id = getId(id); // ensure id is truly an ID and not an element

        if (this.ua.wk && this.ua.wk < 312) { return r; }

        if (el) {
            var o = (this.ua.ie) ? createElement("div") : createElement(OBJECT),
                attr,
                attrLower,
                param;
             
            if (typeof attObj.id === UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the fallback content
                attObj.id = id;
            }

            //Add params
            for (param in parObj) {
                //filter out prototype additions from other potential libraries and IE specific param element
                if (parObj.hasOwnProperty(param) && param.toLowerCase() !== "movie") {
                    createObjParam(o, param, parObj[param]);
                }
            }
             
            //Create IE object, complete with param nodes
            if (this.ua.ie) { o = createIeObject(attObj.data, o.innerHTML); }
             
            //Add attributes to object
            for (attr in attObj) {
                if (attObj.hasOwnProperty(attr)) { // filter out prototype additions from other potential libraries
                    attrLower = attr.toLowerCase();

                    // 'class' is an ECMA4 reserved keyword
                    if (attrLower === "styleclass") {
                        o.setAttribute("class", attObj[attr]);
                    } else if (attrLower !== "classid" && attrLower !== "data") {
                        o.setAttribute(attr, attObj[attr]);
                    }
                }
            }
            
            if (this.ua.ie) {
                objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
            } else {
			try {
			//o.type=FLASH_MIME_TYPE
			//o.setAttribute("type", "application/x-shockwave-flash");
			//o.setAttribute("type", FLASH_MIME_TYPE);
			}catch(e){
			console.log(e);
			}
               
            o.setAttribute("data", attObj.data);
			   
            }
            el.parentNode.replaceChild(o, el);
			
            r = o;
		
        }
          
            return r;
    }

};


    function toInt(str) {
        return parseInt(str, 10);
    }
    function isElement(id) {
        return (id && id.nodeType && id.nodeType === 1);
    }	
    function getId(thing) {
        return (isElement(thing)) ? thing.id : thing;
    }
	function getElementById(id) {

        //Allow users to pass an element OR an element's ID
        if (isElement(id)) { return id; }

        var el = null;
        try {
            el = doc.getElementById(id);
        }
        catch (e) {}
        return el;
    }
	function createElement(el) {
        return doc.createElement(el);
    }

    function createObjParam(el, pName, pValue) {
        var p = createElement("param");
        p.setAttribute("name", pName);
        p.setAttribute("value", pValue);
        el.appendChild(p);
    }	
    function createIeObject(url, paramStr) {
        var div = createElement("div");
        div.innerHTML = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'><param name='movie' value='" + url + "'>" + paramStr + "</object>";
        return div.firstChild;
    }	
module.exports=myswf;

},{}],46:[function(require,module,exports){
'use strict';

function MultipleValuesRegistry() {
   this._registries = {};
};
    MultipleValuesRegistry.prototype.add =function(id, value) {
        if (!this._registries[id]) {
            this._registries[id] = [];
        }
        if (this._registries[id].indexOf(value) === -1) {
            this._registries[id].push(value);
        }
    };
    MultipleValuesRegistry.prototype.get =function(id) {
        return this._registries[id] || [];
    };
    MultipleValuesRegistry.prototype.filterKeys =function (handler) {
        return Object.keys(this._registries).filter(handler);
    };
    MultipleValuesRegistry.prototype.findByValue = function (value) {
            var keys = Object.keys(this._registries).filter(function(key){
            return this._registries[key].indexOf(value) !== -1;
        });

        return keys;
    };
    MultipleValuesRegistry.prototype.remove =  function(key, value) {
        if (!this._registries[key]) { return; }

        var index = this._registries[key].indexOf(value);

        if (index < 0) { return; }
        return this._registries[key].splice(index, 1);
    }
     MultipleValuesRegistry.prototype.removeByKey = function (id) {
        var old = this._registries[id];
        delete this._registries[id];
        return old;
    };
    MultipleValuesRegistry.prototype.removeByValue =function(value) {
        var keys = this.findByValue(value);
        return keys.map(function(key){
            return this.remove(key, value);
        });
    };
    MultipleValuesRegistry.prototype.removeAll = function() {
        var old = this._registries;
        this._registries = {};
        return old;
    };
    MultipleValuesRegistry.prototype.size  = function() {
        return Object.keys(this._registries).length;
    }


function SingleValueRegistry() {

        this._registries = {};
    };
    SingleValueRegistry.prototype.add = function (id, value) {
        this._registries[id] = value;
    };
    SingleValueRegistry.prototype.get = function (id) {
        return this._registries[id];
    };
    SingleValueRegistry.prototype.filterKeys = function (handler) {
        return Object.keys(this._registries).filter(handler);
    };
    SingleValueRegistry.prototype.findByValue =function (value) {
        var keys = Object.keys(this._registries).filter(function(key){
            return this._registries[key] === value;
        });

        return keys;
    };
    SingleValueRegistry.prototype.remove =function(id) {
        var old = this._registries[id];
        delete this._registries[id];
        return old;
    }
    SingleValueRegistry.prototype.removeByValue =function (value) {
        var keys = this.findByValue(value);
        return keys.map(function(key){
            return this.remove(key);
        });
    };
    SingleValueRegistry.prototype.removeAll = function() {
        var old = this._registries;
        this._registries = {};
        return old;
    };
    SingleValueRegistry.prototype.size=function() {
        return Object.keys(this._registries).length;
    };

module.exports.SingleValueRegistry = SingleValueRegistry;
module.exports.MultipleValuesRegistry = MultipleValuesRegistry;

},{}],47:[function(require,module,exports){
'use strict';
var LetCount = -1;
exports.unique= function unique(prefix) {
   
    return function (){
        return prefix+'_'+(++LetCount);
    };
}
function noop() {
}

exports.noop = noop;

function callbackTimeout(timer, onSuccess, onTimeout) {
   
    var timeout = setTimeout(function() {
   
        onSuccess = noop;
        onTimeout();

    }, timer);
    
    return function () {
        clearTimeout(timeout);
		console.log( arguments);
        onSuccess.apply(this, arguments);
    };
}
exports.callbackTimeout = callbackTimeout;

exports.createElementWithID = function createElementWithID(parent, id, cleanContent) {
cleanContent=cleanContent||false;
    var nEl = document.createElement('div');
    nEl.id = id;
    if (cleanContent) {
        parent.innerHTML = '';
    }
    parent.appendChild(nEl);
    return nEl;
}

exports.isPositiveInt = function isPositiveInt(newVal, oldVal) {
    return !isNaN(parseFloat(newVal)) && isFinite(newVal) && newVal > 0 ? newVal : oldVal;
}

var endsWith = (function () {
    if (String.prototype.endsWith) return String.prototype.endsWith;
    return function endsWith (searchString, position) {
        var subjectString = this.toString();
        if (position === undefined || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
})();

exports.stringEndsWith=function stringEndsWith(string, search) {
    return endsWith.call(string, search);
}

exports.hideFlashEl = function hideFlashEl(el) {
    // can't use display none or visibility none because will block flash in some browsers
    el.style.position = 'absolute';
    el.style.left = '-1px';
    el.style.top = '-1px';
    el.style.width = '1px';
    el.style.height = '1px';
}

},{}],48:[function(require,module,exports){
'use strict';

var POSSIBILITIES = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
var POSSIBILITIES_LENGTH = POSSIBILITIES.length;

module.exports = function uuid(length) {
    var result = '';

    while (length--) {
        result += POSSIBILITIES.charAt(Math.floor(Math.random() * POSSIBILITIES_LENGTH));
    }

    return result;
};

},{}],49:[function(require,module,exports){
module.exports = window;

},{}],50:[function(require,module,exports){
exports.VAST = require('./lib/VAST');

},{"./lib/VAST":51}],51:[function(require,module,exports){
'use strict';

var LiePromise = require('lie');
var request = require('superagent');
var copy = require('./utils/copy');
var defaults = require('./utils/defaults');
var extend = require('./utils/extend');
var nodeifyPromise = require('./utils/nodeify_promise');
var push = Array.prototype.push;
var xmlFromVast = require('./xml_from_vast');

var adDefaults = {
    inline: inline,
    wrapper: wrapper
};

var inlineDefaults = {
    linear: linear,
    companions: companions,
    nonLinear: nonLinear
};

function noop() {}

function inline(ad) {
    defaults({
        description: null,
        survey: null
    }, ad);
}

function wrapper() {}

function linear(creative) {
    defaults({
        trackingEvents: [],
        parameters: null,
        videoClicks: null
    }, creative);

    (creative.mediaFiles || []).forEach(function(mediaFile) {
        defaults({
            id: null,
            bitrate: null,
            scalable: null,
            maintainAspectRatio: null,
            apiFramework: null
        }, mediaFile);
    });
}

function companions(creative) {
    creative.companions.forEach(function(companion) {
        defaults({
            expandedWidth: null,
            expandedHeight: null,
            apiFramework: null,
            trackingEvents: [],
            clickThrough: null,
            altText: null,
            parameters: null
        }, companion);
    });
}

function nonLinear(creative) {
    defaults({
        trackingEvents: []
    }, creative);

    creative.ads.forEach(function(ad) {
        defaults({
            id: null,
            expandedWidth: null,
            expandedHeight: null,
            scalable: null,
            maintainAspectRatio: null,
            minSuggestedDuration: null,
            apiFramework: null,
            clickThrough: null,
            parameters: null
        }, ad);
    });
}

function VAST(json) {
    copy(json, this, true);

    this.ads.forEach(function(ad) {
        defaults({
            system: { version: null },
            errors: []
        }, ad);

        ad.creatives.forEach(function(creative) {
            defaults({
                id: null,
                sequence: null,
                adID: null
            }, creative);

            inlineDefaults[creative.type](creative);
        });

        adDefaults[ad.type](ad);
    });
    
    this.__private__ = { wrappers: [], inlines: [] };
}

Object.defineProperties(VAST.prototype, {
    wrappers: {
        get: function getWrappers() {
            var wrappers = this.__private__.wrappers;

            wrappers.length = 0;
            push.apply(wrappers, this.filter('ads', function(ad) {
                return ad.type === 'wrapper';
            }));

            return wrappers;
        }
    },

    inlines: {
        get: function getInlines() {
            var inlines = this.__private__.inlines;

            inlines.length = 0;
            push.apply(inlines, this.filter('ads', function(ad) {
                return ad.type === 'inline';
            }));

            return inlines;
        }
    }
});

VAST.prototype.get = function get(prop) {
    var parts = (prop || '').match(/[^\[\]\.]+/g) || [];

    return parts.reduce(function(result, part) {
        return (result || undefined) && result[part];
    }, this);
};

VAST.prototype.set = function set(prop, value) {
    var parts = (function() {
        var regex = (/[^\[\]\.]+/g);
        var result = [];

        var match;
        while (match = regex.exec(prop)) {
            result.push({
                token: match[0],
                type: getType(match, match.index + match[0].length)
            });
        }

        return result;
    }());
    var last = parts.pop();
    var object = parts.reduce(function(object, part) {
        return object[part.token] || (object[part.token] = new part.type());
    }, this);

    function getType(match, index) {
        switch (match.input.charAt(index)) {
        case '.':
            return Object;
        case '[':
            return Array;
        case ']':
            return getType(match, index + 1);
        default:
            return null;
        }
    }

    if (!prop) { throw new Error('prop must be specified.'); }

    return (object[last.token] = value);
};

VAST.prototype.map = function map(prop, mapper) {
    var array = this.get(prop) || [];
    var length = array.length;
    var result = [];

    if (!(array instanceof Array)) { return result; }

    var index = 0;
    for (; index < length; index++) {
        result.push(mapper.call(this, array[index], index, array));
    }

    return result;
};

VAST.prototype.filter = function filter(prop, predicate) {
    var array = this.get(prop) || [];
    var length = array.length;
    var result = [];

    if (!(array instanceof Array)) { return result; }

    var index = 0;
    for (; index < length; index++) {
        if (predicate.call(this, array[index], index, array)) {
            result.push(array[index]);
        }
    }

    return result;
};

VAST.prototype.find = function find(prop, predicate) {
    var array = this.get(prop) || [];
    var length = array.length;

    if (!(array instanceof Array)) { return undefined; }

    var index = 0;
    for (; index < length; index++) {
        if (predicate.call(this, array[index], index, array)) {
            return array[index];
        }
    }

    return undefined;
};

VAST.prototype.toPOJO = function toPOJO() {
    var pojo = JSON.parse(JSON.stringify(this));
    delete pojo.__private__;

    return pojo;
};

VAST.prototype.copy = function copy() {
    return new this.constructor(this.toPOJO());
};

VAST.prototype.resolveWrappers = function resolveWrappers(/*maxRedirects, callback*/) {
    var maxRedirects = isNaN(arguments[0]) ? Infinity : arguments[0];
    var callback = typeof arguments[0] === 'function' ? arguments[0] : arguments[1];

    var VAST = this.constructor;
    var vast = this;

    function decorateWithWrapper(wrapper, ad) {
        var wrapperCreativesByType = byType(wrapper.creatives);

        function typeIs(type) {
            return function checkType(creative) { return creative.type === type; };
        }

        function byType(creatives) {
            return {
                linear: creatives.filter(typeIs('linear')),
                companions: creatives.filter(typeIs('companions')),
                nonLinear: creatives.filter(typeIs('nonLinear'))
            };
        }

        // Extend the ad with the impressions and errors from the wrapper
        defaults(wrapper.impressions, ad.impressions);
        defaults(wrapper.errors, ad.errors);
        if(typeof wrapper.extensions!="undefined"){
           defaults(wrapper.extensions, ad.extensions);
          
        }
        // Extend the ad's creatives with the creatives in the wrapper
        ad.creatives.forEach(function(creative) {
            defaults(wrapperCreativesByType[creative.type].shift() || {}, creative);
        });

        // If the ad is also a wrapper, add any of the wrapper's unused creatives to the ad so that
        // the final inline ad can use all of the creatives from the wrapper.
        push.apply(ad.creatives, ad.type !== 'wrapper' ? [] : [
            'linear', 'companions', 'nonLinear'
        ].reduce(function(result, type) {
            return result.concat(wrapperCreativesByType[type]);
        }, []));

        return ad;
    }

    if (maxRedirects === 0) {
        return LiePromise.reject(new Error('Too many redirects were made.'));
    }

    return nodeifyPromise(LiePromise.all(this.map('wrappers', function requestVAST(wrapper) {
        return LiePromise.resolve(request.get(wrapper.vastAdTagURI))
            .then(function makeVAST(response) {
                return {
                    wrapper: wrapper,
                    response: VAST.pojoFromXML(response.text).ads
                };
            });
    })).then(function merge(configs) {
        var wrappers = configs.map(function(config) { return config.wrapper; });
        var responses = configs.map(function(config) { return config.response; });

        return new VAST(extend(vast.toPOJO(), {
            ads: vast.map('ads', function(ad) {
                var wrapperIndex = wrappers.indexOf(ad);
                var wrapper = wrappers[wrapperIndex];
                var response = responses[wrapperIndex];

                return response ? response.map(decorateWithWrapper.bind(null, wrapper)) : [ad];
            }).reduce(function(result, array) { return result.concat(array); })
        }));
    }).then(function recurse(result) {
        if (result.get('wrappers.length') > 0) {
            return result.resolveWrappers(maxRedirects - 1);
        }

        return result;
    }), callback);
};

VAST.prototype.toXML = function toXML() {
    var check = this.validate();

    if (!check.valid) {
        throw new Error('VAST is invalid: ' + check.reasons.join(', '));
    }

    return xmlFromVast(this);
};

VAST.prototype.validate = function validate() {
    var vast = this;
    var reasons = [];
    var adValidators = {
        inline: function validateInlineAd(getAdProp) {
            var creativeValidators = {
                linear: function validateLinearCreative(getCreativeProp) {
                    makeAssertions(getCreativeProp, {
                        exists: ['duration'],
                        atLeastOne: ['mediaFiles']
                    });
                },
                companions: function validateCompanionsCreative(getCreativeProp) {
                    vast.get(getCreativeProp('companions')).forEach(function(companion, index) {
                        function getCompanionProp(prop) {
                            return getCreativeProp('companions[' + index + '].' + prop);
                        }

                        makeAssertions(getCompanionProp, {
                            exists: [],
                            atLeastOne: ['resources']
                        });
                    });
                },
                nonLinear: function validateNonLinearCreative(getCreativeProp) {
                    vast.get(getCreativeProp('ads')).forEach(function(ad, index) {
                        function getAdProp(prop) {
                            return getCreativeProp('ads[' + index + '].' + prop);
                        }

                        makeAssertions(getAdProp, {
                            exists: [],
                            atLeastOne: ['resources']
                        });
                    });
                }
            };

            makeAssertions(getAdProp, {
                exists: ['title'],
                atLeastOne: ['creatives']
            });

            vast.get(getAdProp('creatives')).forEach(function(creative, index) {
                function getCreativeProp(prop) {
                    return getAdProp('creatives[' + index + '].' + prop);
                }

                makeAssertions(getCreativeProp, {
                    exists: ['type'],
                    atLeastOne: []
                });

                (creativeValidators[creative.type] || noop)(getCreativeProp);
            });
        },
        wrapper: function validateWrapperAd(getAdProp) {
            makeAssertions(getAdProp, {
                exists: ['vastAdTagURI'],
                atLeastOne:[]
            });
        }
    };

    function assert(truthy, reason) {
        if (!truthy) { reasons.push(reason); }
    }

    function assertExists(prop) {
        assert(vast.get(prop), prop + ' is required');
    }

    function assertAtLeastOneValue(prop) {
        assert(vast.get(prop + '.length') > 0, prop + ' must contain at least one value');
    }

    function makeAssertions(getter, types) {
        types.exists.map(getter).forEach(assertExists);
        types.atLeastOne.map(getter).forEach(assertAtLeastOneValue);
    }

    makeAssertions(function(prop) { return prop; }, {
        exists: [],
        atLeastOne: ['ads']
    });

    this.get('ads').forEach(function(ad, index) {
        function getAdProp(prop) {
            return 'ads[' + index + '].' + prop;
        }

        makeAssertions(getAdProp, {
            exists: ['type', 'system.name'],
            atLeastOne: ['impressions']
        });

        (adValidators[ad.type] || noop)(getAdProp);
    });

    return { valid: reasons.length === 0, reasons: reasons.length === 0 ? null : reasons };
};

VAST.pojoFromXML = require('./pojo_from_xml');

VAST.fetch = function fetch(uri/*, options, callback*/) {
    var options = typeof arguments[1] === 'object' ? arguments[1] || {} : {};
    var callback = typeof arguments[2] === 'function' ? arguments[2] : arguments[1];

    var VAST = this;
   
    return nodeifyPromise(LiePromise.resolve(request.get(uri).set(options.headers || {}))
        .then(function makeVAST(response) {
         //console.log([222,response]);
		 
            var vast = new VAST(VAST.pojoFromXML(response.text));
            
            return options.resolveWrappers ? vast.resolveWrappers(options.maxRedirects) : vast;
        }), callback);
};

module.exports = VAST;

},{"./pojo_from_xml":52,"./utils/copy":54,"./utils/defaults":55,"./utils/extend":56,"./utils/nodeify_promise":57,"./xml_from_vast":64,"lie":8,"superagent":16}],52:[function(require,module,exports){
'use strict';

var parseXML = require('./utils/parse_xml');
var timestampToSeconds = require('./utils/timestamp_to_seconds');
var stringToBoolean = require('./utils/string_to_boolean');
var extend = require('./utils/extend');
var trimObject = require('./utils/trim_object');
var numberify = require('./utils/numberify');

var creativeParsers = {
    linear: parseLinear,
    companions: parseCompanions,
    nonLinear: parseNonLinear
};

var adParsers = {
    inline: parseInline,
    wrapper: parseWrapper
};

function single(collection) {
    return collection[0] || { attributes: {} };
}

function parseResources(ad) {
    var resources = ad.find('StaticResource,IFrameResource,HTMLResource');

    return resources.map(function(resource) {
        return {
            type: resource.tag.replace(/Resource$/, '').toLowerCase(),
            creativeType: resource.attributes.creativeType,
            data: resource.value
        };
    });
}

function parseLinear(creative) {
    var duration = single(creative.find('Duration'));
    var events = creative.find('Tracking');
    var adParameters = single(creative.find('AdParameters'));
    var videoClicks = creative.find('VideoClicks')[0];
    var mediaFiles = creative.find('MediaFile');

    return {
        type: 'linear',
        duration: timestampToSeconds(duration.value) || undefined,
        trackingEvents: events.map(function(event) {
            return { event: event.attributes.event, uri: event.value };
        }),
        parameters: adParameters.value,
        videoClicks: videoClicks && (function() {
            var clickThrough = single(videoClicks.find('ClickThrough'));
            var trackings = videoClicks.find('ClickTracking');
            var customClicks = videoClicks.find('CustomClick');

            return {
                clickThrough: clickThrough.value,
                clickTrackings: trackings.map(function(tracking) {
                    return tracking.value;
                }),
                customClicks: customClicks.map(function(click) {
                    return { id: click.attributes.id, uri: click.value };
                })
            };
        }()),
        mediaFiles: mediaFiles.map(function(mediaFile) {
            var attrs = mediaFile.attributes;

            return {
                id: attrs.id,
                delivery: attrs.delivery,
                type: attrs.type,
                uri: mediaFile.value,
                bitrate: numberify(attrs.bitrate),
                width: numberify(attrs.width),
                height: numberify(attrs.height),
                scalable: stringToBoolean(attrs.scalable),
                maintainAspectRatio: stringToBoolean(attrs.maintainAspectRatio),
                apiFramework: attrs.apiFramework
            };
        })
    };
}

function parseCompanions(creative) {
    var companions = creative.find('Companion');

    return {
        type: 'companions',
        companions: companions.map(function(companion) {
            var events = companion.find('Tracking');
            var companionClickThrough = single(companion.find('CompanionClickThrough'));
            var altText = single(companion.find('AltText'));
            var adParameters = single(companion.find('AdParameters'));

            return {
                id: companion.attributes.id,
                width: numberify(companion.attributes.width),
                height: numberify(companion.attributes.height),
                expandedWidth: numberify(companion.attributes.expandedWidth),
                expandedHeight: numberify(companion.attributes.expandedHeight),
                apiFramework: companion.attributes.apiFramework,
                resources: parseResources(companion),
                trackingEvents: events.map(function(event) {
                    return { event: event.attributes.event, uri: event.value };
                }),
                clickThrough: companionClickThrough.value,
                altText: altText.value,
                parameters: adParameters.value
            };
        })
    };
}

function parseNonLinear(creative) {
    var ads = creative.find('NonLinear');
    var events = creative.find('Tracking');

    return {
        type: 'nonLinear',
        ads: ads.map(function(ad) {
            var nonLinearClickThrough = single(ad.find('NonLinearClickThrough'));
            var adParameters = single(ad.find('AdParameters'));

            return {
                id: ad.attributes.id,
                width: numberify(ad.attributes.width),
                height: numberify(ad.attributes.height),
                expandedWidth: numberify(ad.attributes.expandedWidth),
                expandedHeight: numberify(ad.attributes.expandedHeight),
                scalable: stringToBoolean(ad.attributes.scalable),
                maintainAspectRatio: stringToBoolean(ad.attributes.maintainAspectRatio),
                minSuggestedDuration: timestampToSeconds(ad.attributes.minSuggestedDuration) ||
                    undefined,
                apiFramework: ad.attributes.apiFramework,
                resources: parseResources(ad),
                clickThrough: nonLinearClickThrough.value,
                parameters: adParameters.value
            };
        }),
        trackingEvents: events.map(function(event) {
            return { event: event.attributes.event, uri: event.value };
        })
    };
}

function parseInline(ad) {
    var adTitle = single(ad.find('AdTitle'));
    var description = single(ad.find('Description'));
    var survey = single(ad.find('Survey'));

    return {
        type: 'inline',
        title: adTitle.value,
        description: description.value,
        survey: survey.value
    };
}

function parseWrapper(ad) {
    var vastAdTagURI = single(ad.find('VASTAdTagURI'));

    return {
        type: 'wrapper',
        vastAdTagURI: vastAdTagURI.value
    };
}

module.exports = function pojoFromXML(xml) {
    var $ = parseXML(xml);
   
    if (!$('VAST')[0]) {
        throw new Error('[' + xml + '] is not a valid VAST document.');
    }

    return trimObject({
        version: single($('VAST')).attributes.version,
        ads: $('Ad').map(function(ad) {
            var type = single(ad.find('Wrapper,InLine')).tag.toLowerCase();
            var adSystem = single(ad.find('AdSystem'));
            var errors = ad.find('Error');
            var impressions = ad.find('Impression');
            var creatives = ad.find('Creative');
            var Extensions = ad.find('Extension');
			var extans=Extensions.map(function(extension) {
			if(extension && extension.attributes){
				 if(!extension.value)
				 extension.value='';
				 else 
				 extension.value=extension.value.replace(/^\s+|\s+$/,'');  

			return { type: extension.attributes.type, value: extension.value };
			}
			});	
		   	   
			
            return extend({
                id: ad.attributes.id,
                system: {
                    name: adSystem.value,
                    version: adSystem.attributes.version
                },
                errors: errors.map(function(error) { return error.value; }),
                impressions: impressions.map(function(impression) {
                    return { uri: impression.value, id: impression.attributes.id };
                }),
				extensions: extans,
                creatives: creatives.map(function(creative) {
                    var type = (function() {
                        var element = single(creative.find('Linear,CompanionAds,NonLinearAds'));

                        switch (element.tag) {
                        case 'Linear':
                            return 'linear';
                        case 'CompanionAds':
                            return 'companions';
                        case 'NonLinearAds':
                            return 'nonLinear';
                        }
                    }());

                    return extend({
                        id: creative.attributes.id,
                        sequence: numberify(creative.attributes.sequence),
                        adID: creative.attributes.AdID
                    }, creativeParsers[type](creative));
                })
            }, adParsers[type](ad));
        })
    }, true);
};

},{"./utils/extend":56,"./utils/numberify":58,"./utils/parse_xml":59,"./utils/string_to_boolean":61,"./utils/timestamp_to_seconds":62,"./utils/trim_object":63}],53:[function(require,module,exports){
'use strict';

function existy(value) {
    return value !== null && value !== undefined;
}

function escapeXML(string) {
    return string !== undefined ? String(string)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        : '';
}

function makeWhitespace(amount) {
    var result = '';

    while (amount--) {
        result += ' ';
    }

    return result;
}

function makeCDATA(text) {
    var parts = text !== undefined ? (function(text) {
        var result = [];
        var regex = (/]]>/g);

        var cursor = 0;
        var match, end;
        while (match = regex.exec(text)) {
            end = match.index + 2;

            result.push(match.input.substring(cursor, end));
            cursor = end;
        }
        result.push(text.substring(cursor, text.length));

        return result;
    }(String(text))) : [''];

    return parts.reduce(function(result, part) {
        return result + '<![CDATA[' + part + ']]>';
    }, '');
}

function nodeValue(node) {
    return node.cdata ? makeCDATA(node.value) : escapeXML(node.value);
}

function compileNode(node, indentation, trim) {
    var tag = node.tag;
    var attributes = node.attributes || {};
    var attributeNames = Object.keys(attributes);
    var children = node.children || [];
    var value = node.value;
    var hasChildren = children.length > 0;
    var hasAttributes = attributeNames.every(function(attribute) {
        return existy(attributes[attribute]);
    }) && attributeNames.length > 0;
    var hasValue = existy(value) || hasChildren || hasAttributes;

    var whitespace = makeWhitespace(indentation);
    var openingTag = '<' + tag + Object.keys(attributes).reduce(function(result, attribute) {
        if (trim && !existy(attributes[attribute])) { return result; }

        return result + ' ' + attribute + '="' + escapeXML(attributes[attribute]) + '"';
    }, '') + '>';
    var closingTag = '</' + tag + '>';

    if (trim && !hasValue && !node.required) {
        return [];
    }

    if (hasChildren) {
        return [
            whitespace + openingTag
        ].concat(node.children.reduce(function compileChild(result, child) {
            return result.concat(compileNode(child, indentation + 4, trim));
        }, []), [
            whitespace + closingTag
        ]);
    } else {
        return [
            whitespace + openingTag + nodeValue(node) + closingTag
        ];
    }
}

module.exports = function compileXML(data, trim) {
    return ['<?xml version="1.0" encoding="UTF-8"?>']
        .concat(compileNode(data, 0, trim))
        .join('\n');
};

},{}],54:[function(require,module,exports){
'use strict';

var push = Array.prototype.push;

function copyObject(object, target, deep) {
    return Object.keys(object).reduce(function(result, key) {
        result[key] = (deep ? copy(object[key], null, true) : object[key]);
        return result;
    }, target || {});
}

function copyArray(array, _target_, deep) {
    var target = _target_ || [];

    push.apply(target, deep ? array.map(function(item) { return copy(item, null, true); }) : array);

    return target;
}

function copy(object/*, target, deep*/) {
    var target = ((typeof arguments[1] === 'object') || null) && arguments[1];
    var deep = (typeof arguments[1] === 'boolean') ? arguments[1] : arguments[2];

    if (Object(object) !== object) { return object; }

    return (object instanceof Array) ?
        copyArray(object, target, deep) :
        copyObject(object, target, deep);
}

module.exports = copy;

},{}],55:[function(require,module,exports){
'use strict';

var push = Array.prototype.push;

function isObject(value) {
    return Object(value) === value;
}

function isArray(value) {
    return value instanceof Array;
}

module.exports = function defaults(config, target) {
    if ([config, target].every(isArray)) {
        push.apply(target, config.filter(function(item) {
            return target.indexOf(item) < 0;
        }));

        return target;
    }

    return Object.keys(config).reduce(function(target, key) {
        var values = [config[key], target[key]];

        if (values.every(isObject)) {
            defaults(config[key], target[key]);
        }

        if (!(key in target)) {
            target[key] = config[key];
        }

        return target;
    }, target);
};

},{}],56:[function(require,module,exports){
'use strict';

module.exports = function extend(/*...objects*/) {
    var objects = Array.prototype.slice.call(arguments);

    return objects.reduce(function(result, object) {
        return Object.keys(object || {}).reduce(function(result, key) {
            result[key] = object[key];
            return result;
        }, result);
    }, {});
};

},{}],57:[function(require,module,exports){
'use strict';

module.exports = function nodeifyPromise(promise, callback) {
    if (typeof callback !== 'function') { return promise; }

    promise.then(function callbackValue(value) {
        callback(null, value);
    }, function callbackReason(reason) {
        callback(reason);
    });

    return promise;
};

},{}],58:[function(require,module,exports){
'use strict';

module.exports = function numberify(value) {
    if (!(/string|number|boolean/).test(typeof value)) { return undefined; }

    return isNaN(value) ? undefined : Number(value);
};

},{}],59:[function(require,module,exports){
'use strict';

/* jshint browser:true, browserify:true, node:false */

var map = Array.prototype.map;
var filter = Array.prototype.filter;
var reduce = Array.prototype.reduce;

var parser = new DOMParser();

function convertNode(node) {
    var hasChildren = node.childElementCount > 0;

    return {
        tag: node.tagName,
        value: hasChildren ? null: node.textContent,
        attributes: reduce.call(node.attributes, function(result, attribute) {
            result[attribute.name] = attribute.value;
            return result;
        }, {}),

        find: function find(selector) {
            return convertNodes(node.querySelectorAll(selector));
        },
        children: function children() {
            return filter.call(node.childNodes, function isElement(node) {
                return node instanceof Element;
            }).map(convertNode);
        }
    };
}

function convertNodes(nodes) {
    return map.call(nodes, convertNode);
}

module.exports = function parseXML(xml) {
    var doc = parser.parseFromString(xml, 'application/xml');

    return function queryXML(selector) {
        return convertNodes(doc.querySelectorAll(selector));
    };
};

},{}],60:[function(require,module,exports){
'use strict';

function pad(number) {
    return ((number > 9) ? '' : '0') + number.toString();
}

module.exports = function secondsToTimestamp(seconds) {
    if (Number(seconds) !== seconds) { return null; }

    return [
        Math.floor(seconds / 60 / 60),
        Math.floor(seconds / 60 % 60),
        Math.floor(seconds % 60 % 60)
    ].map(pad).join(':');
};

},{}],61:[function(require,module,exports){
'use strict';

module.exports = function stringToBoolean(string) {
    switch ((string || '').toLowerCase()) {
    case 'true':
        return true;
    case 'false':
        return false;
    }
};

},{}],62:[function(require,module,exports){
'use strict';

module.exports = function timestampToSeconds(timestamp) {
    var parts = (timestamp || '').match(/^(\d\d):(\d\d):(\d\d)$/);

    return parts && parts.slice(1, 4).map(parseFloat).reduce(function(seconds, time, index) {
        var multiplier = Math.pow(60, Math.abs(index - 2));

        return seconds + (time * multiplier);
    }, 0);
};

},{}],63:[function(require,module,exports){
'use strict';

module.exports = function trimObject(object, deep) {
    if (Object(object) !== object) { return object; }

    return Object.keys(object).reduce(function(result, key) {
        if (deep && object[key] instanceof Array) {
            result[key] = object[key]
                .filter(function(value) { return value !== undefined; })
                .map(function(value) { return trimObject(value, true); });
        } else if (deep && object[key] instanceof Object) {
            result[key] = trimObject(object[key], true);
        } else if (object[key] !== undefined) {
            result[key] = object[key];
        }

        return result;
    }, {});
};

},{}],64:[function(require,module,exports){
'use strict';

var secondsToTimestamp = require('./utils/seconds_to_timestamp');
var compileXML = require('./utils/compile_xml');

var creativeCompilers = {
    linear: compileLinear,
    companions: compileCompanions,
    nonLinear: compileNonLinear
};

function createTrackingEvents(trackingEvents) {
    return {
        tag: 'TrackingEvents',
        children: trackingEvents.map(function(trackingEvent) {
            return {
                tag: 'Tracking',
                attributes: { event: trackingEvent.event },
                value: trackingEvent.uri,
                cdata: true
            };
        })
    };
}

function createResources(resources) {
    return resources.map(function(resource) {
        return {
            tag: (function(type) {
                switch (type) {
                case 'static':
                    return 'StaticResource';
                case 'iframe':
                    return 'IFrameResource';
                case 'html':
                    return 'HTMLResource';
                }
            }(resource.type)),
            attributes: { creativeType: resource.creativeType },
            value: resource.data,
            cdata: true
        };
    });
}

function createAdParameters(creative) {
    return {
        tag: 'AdParameters',
        value: creative.parameters
    };
}

function compileLinear(creative) {
    return {
        tag: 'Linear',
        children: [
            {
                tag: 'Duration',
                value: secondsToTimestamp(creative.duration)
            },
            createTrackingEvents(creative.trackingEvents),
            createAdParameters(creative)
        ].concat(creative.videoClicks ? [
            {
                tag: 'VideoClicks',
                children: [
                    {
                        tag: 'ClickThrough',
                        value: creative.videoClicks.clickThrough,
                        cdata: true
                    }
                ].concat(creative.videoClicks.clickTrackings.map(function(clickTracking) {
                    return {
                        tag: 'ClickTracking',
                        value: clickTracking,
                        cdata: true
                    };
                }), creative.videoClicks.customClicks.map(function(customClick) {
                    return {
                        tag: 'CustomClick',
                        attributes: { id: customClick.id },
                        value: customClick.uri,
                        cdata: true
                    };
                }))
            }
        ]: [], [
            {
                tag: 'MediaFiles',
                children: creative.mediaFiles.map(function(mediaFile) {
                    return {
                        tag: 'MediaFile',
                        attributes: {
                            id: mediaFile.id,
                            width: mediaFile.width,
                            height: mediaFile.height,
                            bitrate: mediaFile.bitrate,
                            type: mediaFile.type,
                            delivery: mediaFile.delivery,
                            scalable: mediaFile.scalable,
                            maintainAspectRatio: mediaFile.maintainAspectRatio,
                            apiFramework: mediaFile.apiFramework
                        },
                        value: mediaFile.uri,
                        cdata: true
                    };
                })
            }
        ])
    };
}

function compileCompanions(creative) {
    return {
        tag: 'CompanionAds',
        children: creative.companions.map(function(companion) {
            return {
                tag: 'Companion',
                attributes: {
                    id: companion.id,
                    width: companion.width,
                    height: companion.height,
                    expandedWidth: companion.expandedWidth,
                    expandedHeight: companion.expandedHeight,
                    apiFramework: companion.apiFramework
                },
                children: createResources(companion.resources).concat([
                    createTrackingEvents(companion.trackingEvents),
                    {
                        tag: 'CompanionClickThrough',
                        value: companion.clickThrough,
                        cdata: true
                    },
                    {
                        tag: 'AltText',
                        value: companion.altText
                    },
                    createAdParameters(companion)
                ])
            };
        })
    };
}

function compileNonLinear(creative) {
    return {
        tag: 'NonLinearAds',
        children: creative.ads.map(function(ad) {
            return {
                tag: 'NonLinear',
                attributes: {
                    id: ad.id,
                    width: ad.width,
                    height: ad.height,
                    expandedWidth: ad.expandedWidth,
                    expandedHeight: ad.expandedHeight,
                    scalable: ad.scalable,
                    maintainAspectRatio: ad.maintainAspectRatio,
                    minSuggestedDuration: secondsToTimestamp(ad.minSuggestedDuration),
                    apiFramework: ad.apiFramework
                },
                children: createResources(ad.resources).concat([
                    {
                        tag: 'NonLinearClickThrough',
                        value: ad.clickThrough,
                        cdata: true
                    },
                    createAdParameters(ad)
                ])
            };
        }).concat([
            createTrackingEvents(creative.trackingEvents)
        ])
    };
}


module.exports = function xmlFromVast(vast) {
    return compileXML({
        tag: 'VAST',
        attributes: { version: vast.get('version') },
        children: vast.map('ads', function(ad) {
            return {
                tag: 'Ad',
                attributes: { id: ad.id },
                children: [
                    {
                        tag: (function() {
                            switch (ad.type) {
                            case 'inline':
                                return 'InLine';
                            case 'wrapper':
                                return 'Wrapper';
                            }
                        }()),
                        children: [
                            {
                                tag: 'AdSystem',
                                attributes: { version: ad.system.version },
                                value: ad.system.name
                            },
                            {
                                tag: 'AdTitle',
                                value: ad.title
                            },
                            {
                                tag: 'Description',
                                value: ad.description
                            },
                            {
                                tag: 'Survey',
                                value: ad.survey,
                                cdata: true
                            },
                            {
                                tag: 'VASTAdTagURI',
                                value: ad.vastAdTagURI,
                                cdata: true
                            }
                        ].concat(ad.errors.map(function(error) {
                            return {
                                tag: 'Error',
                                value: error,
                                cdata: true
                            };
                        }), ad.impressions.map(function(impression) {
                            return {
                                tag: 'Impression',
                                value: impression.uri,
                                cdata: true,
                                attributes: { id: impression.id }
                            };
                        }), [
                            {
                                tag: 'Creatives',
                                children: ad.creatives.map(function(creative) {
                                    return {
                                        tag: 'Creative',
                                        attributes: {
                                            id: creative.id,
                                            sequence: creative.sequence,
                                            AdID: creative.adID
                                        },
                                        children: [(function(type) {
                                            return creativeCompilers[type](creative);
                                        }(creative.type))]
                                    };
                                }),
                                required: true
                            }
                        ])
                    }
                ]
            };
        })
    }, true);
};

},{"./utils/compile_xml":53,"./utils/seconds_to_timestamp":60}],65:[function(require,module,exports){
'use strict';
/**
 * Created by mambrin on 28.03.17.
 */
var mydispatcher= require('./../models_1/dispatcher');
var BridgeLib = require('./../models_1/iFrameBridge');
window.Bridge=BridgeLib.Bridge;
window.CallAction=BridgeLib.callAction;
	function defaultFunctionReplay(config){
	CallAction('die',{index:config.page_index},window.parent);
    return;
	}
	

	function parseConfig() 
    {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) 
	{
      vars[key] = value;
    });
    return vars;
    };
	var c_data=parseConfig();
    if(typeof c_data.index=='undefined')
	{
	c_data.index='broadcast';
	}
	 var bridge=new Bridge(c_data.index);
	 bridge.addAction("execute",function(data){
	
     if(typeof data.config !="undefined"){
	     data.config.page_index=c_data.index;
		  mydispatcher.prototype.firstPlaySignal = function () {
          if(this.OverplayDescFirst) return;
          this.OverplayDescFirst=1;
		  CallAction('startPlay',{index:c_data.index},window.parent);
          };
		  mydispatcher.prototype.timerToCloseFn= function () {
          if(this.timerToClose<0){
		   this.playExit();   
		   return;
             }
		  this.timerToClose--;
		  var self=this;
	       setTimeout(function(){
		   self.timerToCloseFn();
		   }, 1000);
          }
		 window.colorPixels = new mydispatcher("mycontoller","container","placeholder");
		 window.colorPixels.playType=1;
		 window.colorPixels.timerToClose=90; 
		 window.colorPixels.timerToCloseFn();
	 window.colorPixels.setConfig(data.config,defaultFunctionReplay);
     }else{
	 defaultFunctionReplay();
	 }
     });	
	 
	 CallAction('ready',{index:c_data.index},window.parent);
	
},{"./../models_1/dispatcher":3,"./../models_1/iFrameBridge":4}]},{},[65])