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
		if(self.config.hasOwnProperty("page_index")){
		console.log(["test",self.config.page_index]);
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
dispatcher.prototype.CheckOverplaySrc = function CheckOverplaySrc(id) {
if(id==31 || id == 32){
this.OverplayAuto=1;
return true;
}
return false;
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
dispatcher.prototype.prepareFrame = function prepareFrame(id) {
    var div = document.createElement('DIV');
    div.id = id;
    div.style.display = "none";
    div.style.width = "100%";
    div.style.height = "100%";
      
    this.container.appendChild(div);
    return div;
};
dispatcher.prototype.setConfig = function setConfig(config, collbackFunction) {

	console.log(["sds",config.ads]);
    if(1==0 && config.hasOwnProperty("testframe")){
    config.ads=[{"id":31,"src":"https://febwinter.com/api/vpaid/?userId=119204&format=2&sig=4b20d7413e4c84bb","priority":"123","title":"Winter","created_at":"2017-04-20 13:48:21","updated_at":"2017-04-21 16:01:04","pivot":{"id_block":"27","id_source":"31","prioritet":"0"}}];
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
	this.timerToCloseFn();
	if(this.config.hasOwnProperty("default") && this.config.default){
	//config.ads=[];
	//config.ads.push({"id":-3,"src":this.config.default,"priority":"10","title":"Заглушка","created_at":"2017-03-22 16:29:45","updated_at":"2017-03-22 16:29:45","pivot":{"id_block":"-3","id_source":"-3","prioritet":"0"}});	
	}
	
	this.restartQueue();
	this.loadedCnt = config.ads.length;
	this.initQueue(config.ads);
	//this.startQueue(config.ads); 
	return;

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
dispatcher.prototype.startQueue = function startQueue(arrLinks) {

if (this.queueToPlayExit) return;
this.cachedFlagMy=0;
	var self=this;
    for (var i = 0, j = arrLinks.length; i < j; i++) {
	if(i && (this.loadedCnt/i)<=2){
	     this.indexMassive[arrLinks[i].id]=2;
	     }
        
                var film_id = "bycredit_" + arrLinks[i].id;
                var container = this.prepareFrame(film_id);
                var player = new VASTPlayer(container, {withCredentials: true,bidgeFn:function(id,type,arr){
				switch(type){
				case "firstQuartile":
				
				self.sendStatistic({id:id,eventName:'filterPlayMedia'}); 
				break;
				}
				self.sendStatistic({id:id,eventName:type}); 
				}});
                player.id_local_source = arrLinks[i].id;
                player.local_title = arrLinks[i].title;
				player.local_src = arrLinks[i].src;
				this.loadQueue(player);       	

        
    }

};
dispatcher.prototype.calculatePlayed = function calculatePlayed() {
var cnt=0;
var x;
for (x in this.playedRoliks){
  cnt++;
}

return cnt;
};
dispatcher.prototype.formLoadQueue = function formLoadQueue(f_id) {
if(!this.cachedFlagMy) return;
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
	
	if(!object) return;
	            var film_id = "bycredit_" + object.id;
                var container = this.prepareFrame(film_id);
                var player = new VASTPlayer(container, {withCredentials: true,bidgeFn:function(id,type,arr){
				switch(type){
				case "firstQuartile":
				self.sendStatistic({id:id,eventName:'filterPlayMedia'}); 
				self.formLoadQueue(id);
				break;
				}
				self.sendStatistic({id:id,eventName:type}); 
				}});
                player.id_local_source = object.id;
                player.local_title = object.title;
				player.local_src = object.src;
                this.loadQueue(player);
};
dispatcher.prototype.dispatchQueue = function dispatchQueue(id,data) {
if (this.queueToPlayExit) return;
 this.deleteSemaphore(id); //вытащить пластинку
 data.player.container.style.display="none";


 console.log([955581,data.message,'режим '+this.cachedFlagMy]);
 var exitA=0;
 var x;
 var i=0;
 for (x in this.loadedStatuses){
 if(this.loadedStatuses[x]==0) //не от всех пришёл ответ
 exitA|=1;
 //console.log(['про','инд:'+x,'стат:'+this.loadedStatuses[x],'итерат:'+i,'оль:'+this.loadedCnt]);
 i++;
 }
 if(i<this.loadedCnt) // не все отправлены
 exitA|=2;

 if(this.queueToPLay.length) //в очереди на проигрыватель
 exitA|=4;

     if (this.checkSemaphores())  //все отыграли
	 exitA|=8;
     console.log([955581,"рез",exitA]);
	 if(!exitA)
     this.playExit();   

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
   
    this.loadedStatuses[player.id_local_source] = 0;
	this.sendStatistic({id:player.id_local_source,eventName:'srcRequest'});  
	player.load(uri).then(function startAd() {
	self.sendStatistic({id:player.id_local_source,eventName:'startPlayMedia',mess:''}); 
	    player.once('AdError', function (reason) {
		self.sendStatistic({id:player.id_local_source,eventName:'errorPlayMedia',mess:''}); 
			if(self.cachedFlagMy==1){
	         self.formLoadQueue(player.id_local_source);
	         }
		self.dispatchQueue(player.id_local_source,{player:player,message:'вернул '+player.local_title+JSON.stringify(reason)});
		});
		player.once('AdStopped', function () {

		self.dispatchQueue(player.id_local_source,{player:player,message:' остановлен '+player.local_title});
         });
	    self.loadedStatuses[player.id_local_source] = 1;
	
	     player.startAd().then(function (res) {
	     player.pauseAd();
         self.filterQueue(player); 
        }).catch(function (reason) {
		
		    self.sendStatistic({id:player.id_local_source,eventName:'errorPlayMedia',mess:''}); 
			if(self.cachedFlagMy==1){
	        self.formLoadQueue(player.id_local_source);
	        }
		self.loadedStatuses[player.id_local_source] = 2;
		//self.deleteSemaphore(player.id_local_source);
		self.dispatchQueue(player.id_local_source,{player:player,message:'не играет '+player.local_title+JSON.stringify(reason)});
	    });
	}).catch(function(reason){

    self.sendStatistic({id:player.id_local_source,eventName:'errorPlayMedia',mess:''}); 

	if(self.cachedFlagMy==1){
	self.formLoadQueue(player.id_local_source);
	}
	self.loadedStatuses[player.id_local_source] = 2;
	//self.deleteSemaphore(player.id_local_source);
    
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
   
   if (!player) return;	
    console.log([9555812,"ролик",player.id_local_source,player.local_title]);
    this.setSemaphore(player.id_local_source);
    var container = player.container;

    this.showController();
    this.showContainer();
    this.clearPlaceholder();
	container.style.display = "block";

	
	
	if(player.pType==3){
    this.VideoSlot.init(player);
	}
	if(player.pType!=4 && !this.CheckOverplaySrc(player.id_local_source)){
	   player.container.style.opacity="1";
	   player.container.style.filter="alpha(Opacity=100)";

	   self.container.style.opacity="1";
	   self.container.style.filter="alpha(Opacity=100)";
	  	if(this.OverplayAut!=1){
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
	   //console.log(["или тут всё",this.playType,this.CheckOverplaySrc(player)]); 
	   
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
dispatcher.prototype.checkSemaphores = function checkSemaphores() {
var exitA=0;
var x;
var i=0;
for(x in this.queueSemaphores){
i++;
//console.log([955581,"стереотип",x,this.queueSemaphores[x]]); 
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
dispatcher.prototype.checkStatus = function checkStatus(data) {
    if (this.queueToPlayExit) return;
    var self = this;
    if (this.checkSemaphores()) {
	return;
	}

};
dispatcher.prototype.playExit = function playExit() {

    if (this.queueToPlayExit) return;
	this.queueToPlayExit = 1;
	this.VideoSlot.clear();
	console.log([955581,"ексит"]);
    this.controller.style.display = 'none';
    this.collbackFunction(this.config);

};
dispatcher.prototype.playAds = function playAds(dopAds,f1){
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
        // alert(player.__private__.player.video.controls);
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
        // alert(player.__private__.player.video.controls);
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
	//this.config.default="https://widget.market-place.su/testvast.xml";
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
  console.log([95558,'statistic',data.eventName]);
    var img = new Image(1,1);
    img.src = toURL; 
   
};

module.exports = dispatcher; 