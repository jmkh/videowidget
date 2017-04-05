'use strict';
/**
 * Created by mambrin on 28.03.17.
 */
var VASTPlayer = require('vast-player');
var CookieDriver = require('./CookieDriver');
var VideoSlot = require('./VideoSlot');

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
    this.playedCnt = 0;
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
    window.addEventListener("resize", function () {
       
        self.calculateParameters();
    }, false);
    self.calculateParameters();
    this.clearAll();
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
//this.LastcloseDiv.style.paddingLeft="37px";
//this.LastcloseDiv.innerHTML="Закрыть рекламу";
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

        window.parent.postMessage({die:1},"*");
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
dispatcher.prototype.calculateParameters = function calculateParameters() {

    var width = screen.width; // ширина 
    var height = screen.height; // высота
    console.log("Разрешение окна клиента: " + width + "| x |" + height);

};
dispatcher.prototype.clearAll = function clearAll() {
    this.clearController();
    this.clearContainer();
    //this.clearPlaceholder();
    this.clearExtraSlot();
};
dispatcher.prototype.clearController = function clearController() {
    this.controller.style.display = "none";

//this.controller.style.height="250px";
};
dispatcher.prototype.showController = function showController() {
    this.controller.style.display = "block";
};
dispatcher.prototype.clearPlayerContainer = function clearPlayerContainer(obj) {
   obj.parentNode.removeChild(obj);
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
dispatcher.prototype.clearExtraSlot = function clearExtraSlot() {
    this.extraslot.style.display = "none";
};
dispatcher.prototype.showExtraSlot = function showExtraSlot() {
    this.extraslot.style.display = "block";
};
dispatcher.prototype.setConfig = function setConfig(config, collbackFunction) {
    if (!config.hasOwnProperty('adslimit'))
        config.adslimit = 3;
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
	this.timerToCloseFn();
	var dopAds=[];
    this.loadedCnt = config.ads.length;
	if(this.config.hasOwnProperty("default") && this.config.default){
	this.loadedCnt++;
	this.indexDefault[-3]={};
	var dopAds=[{"id":-3,"src":this.config.default,"priority":"10","title":"Заглушка","created_at":"2017-03-22 16:29:45","updated_at":"2017-03-22 16:29:45","pivot":{"id_block":"-3","id_source":"-3","prioritet":"0"}}];
	}
	this.initQueue(config.ads);
	
	
	if(dopAds.length>0){
    this.initQueue(dopAds);
	}
};
dispatcher.prototype.initQueue = function initQueue(arrLinks) {
    this.indexMassive={};
	
	var self=this;
    for (var i = 0, j = arrLinks.length; i < j; i++) {
	if(i && (this.loadedCnt/i)<=2){
	     this.indexMassive[arrLinks[i].id]=2;
	     }
        this.cachedConf[arrLinks[i].id] = {title: arrLinks[i].title};
        switch (arrLinks[i].id) {


            default:
                var film_id = "bycredit_" + arrLinks[i].id;
                var container = this.prepareFrame(film_id);
                var player = new VASTPlayer(container, {withCredentials: true,bidgeFn:function(id,type,arr){
				switch(type){
				case "firstQuartile":
				self.sendStatistic({id:id,eventName:'filterPlayMedia'}); 
				break;
				}
				self.sendStatistic({id:id,eventName:type}); 
				console.log(["111-",self.timerToClose,self.cachedConf[id].title,type]); 
				}});
                player.id_local_source = arrLinks[i].id;
                player.local_title = arrLinks[i].title;
                this.loadQueue(arrLinks[i], player);
                break;
        }
    }
};

dispatcher.prototype.prepareFrame = function prepareFrame(id) {
    var div = document.createElement('DIV');
    div.id = id;
    div.style.display = "none";
    div.style.width = "100%";
    div.style.height = "100%";

    this.container.appendChild(div);
    return div;
};
dispatcher.prototype.loadQueue = function loadQueue(object, player) {
    if (this.queueToPlayExit) return;
	var self = this;
    var uri = object.src.replace(/\{([a-z]+)\}/g, function (match) {
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
    this.loadedStatuses[ player.id_local_source] = 0;
    this.sendStatistic({id:player.id_local_source,eventName:'srcRequest'});  
	
    player.once('AdStopped', function () {
        self.deleteSemaphore(player.id_local_source);
        console.log([95558, 'Плеер закончился!', player.id_local_source, player.local_title]);
        self.checkStatus({id: player.id_local_source, event: 'ended'});
		self.clearPlayerContainer(player.container);
		//player.container.style.display="none";
    });
    player.once('AdError', function (reason) {
		self.deleteSemaphore(player.id_local_source);
	    self.sendTmp({id: player.id_local_source, event: 'on error :'+player.local_title});	
        
		var mess = '';
  	                if(typeof reason != 'undefined' && typeof reason.message != 'undefined'){
	                mess=reason.message;
	                }
	                else{
	                if(typeof reason != 'undefined') 
                    mess=JSON.stringify(reason);
	                }
	    self.sendStatistic({id:player.id_local_source,eventName:'errorPlayMedia',mess:mess}); 
        console.log([95558, 'Ошибка плеера лог!', player.local_title, reason]);
        self.loadedStatuses[player.id_local_source] = 2;
        self.checkStatus({id: player.id_local_source, event: 'error : '+player.local_title});
		self.clearPlayerContainer(player.container);
		//this.container.style.display="none";
    });
    player.on('AdRemainingTimeChange',function(args) {
	if(args.hasOwnProperty("sec") && args.sec && args.sec>3){
	 self.sendStatistic({id:player.id_local_source,eventName:'filterPlayMedia'}); 
	}
    });
    
    self.sendTmp({id: player.id_local_source, event: 'try load :'+player.local_title});	
    player.load(uri).then(function startAd() {
    self.sendTmp({id: player.id_local_source, event: 'loaded ok :'+player.local_title});	
        console.log([95558, 'Плеер заргузился', player.pType, player.id_local_source, player.local_title]);
		
        player.startAd().then(function (res) {
            player.pauseAd();
            console.log([95558, 'Плеер готов', player.id_local_source, player.local_title]); 
         
            self.loadedStatuses[player.id_local_source] = 1;
            self.filterQueue(player); 
        }).catch(function (reason) {
			self.deleteSemaphore(player.id_local_source);
            self.sendTmp({id: player.id_local_source, event: 'on noready :'+player.local_title});	
            self.loadedStatuses[player.id_local_source] = 2;
            console.log([95558, 'Плеер не готов', player.id_local_source, reason]);
			
            self.checkStatus({id: player.id_local_source, event: 'error1'});
			self.clearPlayerContainer(player.container);
			//player.container.style.display="none";
        });
    }).catch(function (reason) {
	    
	    //self.queueToPlaySemaphore = 0; 
		self.deleteSemaphore(player.id_local_source);
        self.loadedStatuses[player.id_local_source] = 2;
		
        console.log([95558, 'Плеер не загрузился', player.local_title, reason]);
        self.checkStatus({id: player.id_local_source, event: 'noload :'+player.local_title});
		self.sendTmp({id: player.id_local_source, event: 'on noload :'+player.local_title});
        self.clearPlayerContainer(player.container);		
		//player.container.style.display="none";
		
    });


};
dispatcher.prototype.secondQueue = function secondQueue(player) {
    console.log(['id_player отложен', this.cachedConf[player.id_local_source].title]);
    var x;
    var i = 0;
    var yesReady = 0;
	var fin = 0;
    for (x in this.loadedStatuses) {
        if (x != player.id_local_source && this.loadedStatuses[x]==1) {
		  yesReady=1;
        }
        i++;
        
    }
	 yesReady=0;
	if(!yesReady){
	this.queueToPLay.push(player);
    this.playQueue();
	}
};
dispatcher.prototype.filterQueue = function filterQueue(player) {
   
     if(this.indexDefault.hasOwnProperty(player.id_local_source)){
	   this.indexDefault[player.id_local_source]=player;
	   this.checkStatus({id: player.id_local_source, event: 'def 1 :'+player.local_title});
	   return;
	  }

    if(1==1 && this.indexMassive.hasOwnProperty(player.id_local_source)){ 
	var self=this;
	    setTimeout(function(){
		self.secondQueue(player);
		}, 1000);
		return;
	}
    this.queueToPLay.push(player);   
    this.playQueue();
};
dispatcher.prototype.setSemaphore = function setSemaphore(id) {
	var data={id:id,event:"set"+'|'+id};
	data.fin="";
    data.matrix = [];
    data.status = [];
	this.sendPixel(data);
    this.queueSemaphores[id]=1;
};
dispatcher.prototype.deleteSemaphore = function deleteSemaphore(id) {

if(this.queueSemaphores.hasOwnProperty(id)){
	var data={id:id,event:"delete|"+id+'|'+this.queueSemaphores.hasOwnProperty(id)+'|'+JSON.stringify(this.queueSemaphores)};
	data.fin="";
    data.matrix = [];
    data.status = [];
	this.sendPixel(data);
	var data={id:id,event:"delete"};
	data.fin="";
    data.matrix = [];
    data.status = [];
	this.sendPixel(data);
delete this.queueSemaphores[id];
	var data={id:id,event:"delete|"+id+'|'+this.queueSemaphores.hasOwnProperty(id)+'|'+JSON.stringify(this.queueSemaphores)};
	data.fin="";
    data.matrix = [];
    data.status = [];
	this.sendPixel(data);
}

};
dispatcher.prototype.checkSemaphores = function checkSemaphores() {
this.queueToPlaySemaphore=0;
var x;
for(x in this.queueSemaphores){
this.queueToPlaySemaphore=1;
return;
}

};
dispatcher.prototype.playQueue = function playQueue(queueCnt) {
    queueCnt=typeof queueCnt=="undefined"?20:queueCnt;
	if(queueCnt<=0) return;
    if (this.queueToPlayExit) return;
	this.checkSemaphores();
    var self = this;
    if (this.queueToPlaySemaphore) {
        setTimeout(function () {
            self.playQueue();
        }, 500);
        return;

    }
	
	if(1==0 && this.AllowedStart==0){
		var self=this;
	    setTimeout(function(){
		self.playQueue((queueCnt-1));
		}, 500);
		return;
	}
	
    var player = this.queueToPLay.shift();

    if (!player) return;
   
    this.setSemaphore(player.id_local_source);
    this.playedCnt++;
	
   console.log([95558,'cont',player]);
	
	
    var container = player.container;
    console.log([95558, 'Плеер на паузе', player.pType, player.local_title]);
    this.showController();
    this.showContainer();
    this.clearPlaceholder();

    this.VideoSlot.init(player);

    container.style.display = "block";
	this.sendStatistic({id:player.id_local_source,eventName:'startPlayMedia'}); 
    player.resumeAd();
    this.clearPlaceholder();
};
dispatcher.prototype.checkStatus = function checkStatus(data) {
    var cnt5=0;
    if (this.queueToPlayExit) return true;
	
	switch(this.mytype){
	//case "Autoplay":
	case "Overlay":
	var ztn;
	
	for (ztn in this.playedAllCnt){
	cnt5++;
	//console.log(["плейед",ztn,this.cachedConf[ztn].title,this.cachedConf[data.id].title]);
	}
	if(cnt5 && cnt5>this.config.adslimit){
			var z;
			for (z in this.indexDefault){
			if(this.indexDefault[z]){
			this.queueToPLay.push(this.indexDefault[z]);   
			this.playQueue();
			this.indexDefault[z] = null;
			return true;
			}
			}
	    this.lastDriverId = data.id;
	    this.playExit();
        return true;
	}
	break;
	}
	
	this.checkSemaphores();
    var x;
    var i = 0;
    var noReady = 0;
	var fin = 0;
    for (x in this.loadedStatuses) {
        if (!this.loadedStatuses[x]) {
            noReady = 1;

        }
        i++;
    }
	data.fin="";
    data.matrix = this.loadedStatuses;
    data.status = [i, this.loadedCnt, this.queueToPlaySemaphore, this.queueToPLay.length, noReady];
	if (i == this.loadedCnt &&  !noReady && !this.queueToPlaySemaphore && !this.queueToPLay.length) {
	fin = 1;
	data.fin="finish self "+cnt5+"<>"+this.config.adslimit;
	
	}
	
    this.sendPixel(data);
    console.log([i, this.loadedCnt, this.queueToPlaySemaphore, this.queueToPLay.length, noReady]);
    if (noReady) fin=0;
	
    if (fin) {
	if(cnt5 && cnt5>this.config.adslimit){
	var old=data.event;
	data.event="cntall";
	this.sendPixel(data);
	data.event=old;
	}
	var z;
	for (z in this.indexDefault){
	
	if(this.indexDefault[z]){
	this.queueToPLay.push(this.indexDefault[z]);   
    this.playQueue();
	this.indexDefault[z] = null;
	return true;
	}
	}
	
	
	    this.lastDriverId = data.id;
	    this.playExit();
        return true;
    }

    return false;
};
dispatcher.prototype.playExit = function playExit() {

    if (this.queueToPlayExit) return;
	this.queueToPlayExit = 1;
	this.VideoSlot.clear();
	
    var data={id:this.lastDriverId,event:"playExit"};
	data.fin="";
    data.matrix = [];
    data.status = [];
	this.sendPixel(data);
	
    
    this.controller.style.display = 'none';
    this.collbackFunction(this.config);

};
dispatcher.prototype.sendTmp = function sendTmp(data) {
 
    data.fin="";
    data.matrix = [];
    data.status=[];
	this.sendPixel(data);
};
dispatcher.prototype.sendPixel = function sendPixel(data) {
	if(this.config.isDesktop){ 
	//return; 
	}else{
    		
	}
	if(data.event == "cntall"){
	}else{
	return;
	}
	
   //return;
    var preRemoteData = {
        key: this.GlobalMyGUITemp,
        fromUrl: encodeURIComponent(this.fromUrl),
        pid: this.config.pid,
        affiliate_id: this.config.affiliate_id,
        id_src: data.id,
        matrix: data.matrix,
        event: data.event,
        status: data.status,
        desc: this.config.isDesktop,
		fin: data.fin
    };
    var preToURL = "https://api.market-place.su/Product/video/l2quest.php?p=" + Math.random() + '&data=' + encodeURIComponent(JSON.stringify(preRemoteData));
    //var preToURL="http://widget2.market-place.su/admin/statistic/video/put?p="+Math.random()+'&data='+encodeURIComponent(JSON.stringify(preRemoteData));
    var img = new Image(1, 1);
    img.src = preToURL;
    return;
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
   if(data.eventName =="filterPlayMedia"){
    this.playedAllCnt[data.id]=1;  
  }
  this.cacheStatisticIndexes[data.id][data.eventName]=1;
  
  var preRemoteData={key:this.GlobalMyGUITemp,fromUrl:encodeURIComponent(this.fromUrl),pid:this.config.pid,affiliate_id:this.config.affiliate_id,cookie_id:this.cookieUserid,id_src:data.id,event:data.eventName,mess:m}; 
  var toURL="https://api.market-place.su/Product/video/l1stat.php?p="+Math.random()+'&data='+encodeURIComponent(JSON.stringify(preRemoteData));
    var img = new Image(1,1);
    img.src = toURL; 
   
};
module.exports = dispatcher; 