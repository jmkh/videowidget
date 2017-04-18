'use strict';
var VPAIDEvent = require('./VPAIDEvent');
var VideoEvent = require('./VideoEvent');

var BridgeLib = require('./iFrameBridge');
window.Bridge=BridgeLib.Bridge;
window.CallAction=BridgeLib.callAction;
function $notifyObservers(event) {
        (this.subscribers[event.type] || []).forEach(function (item) {
		       item.fn.call(item.ctx, event.data);
        });
}
function $mediaEventHandler(event) {
        //console.log(['все события',event]); 
        event.data = event.data || {};
        var params = {};
        if(event.type == VideoEvent.AD_ERROR) {
        params.ERRORCODE = event.data.code;
        }
		 //event.data.loadedEvent = loadEvents(this.xmlLoader, event.type, params); 
		
        if(event.type !== VideoEvent.AD_STOP) {
		    $notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.convertFromVAST(event.type), event.data));
        }
		else{
		
		
		this.parameters.slot.parentNode.removeChild(this.parameters.slot);
		    $notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.convertFromVAST(event.type), null));
		}
		
}
var VideoPlayer = function VideoPlayer() {
        this.playedCnt=0;
        this.flags = {
            canSendEvent: true,
            middleEvent: [false, false, false, false, false]
        };
		var self = this;
		this.bridge=new Bridge(); 
		this.index=this.bridge.index;
		this.bridge.addAction("adEvent",function(data){
		if(data.hasOwnProperty("eventName")){
		console.log([955581,'твигл + ',data.eventName])
		switch (data.eventName){
		case "firstQuartile":
		self.playedCnt++;
		console.log(["первый квартал",data.eventName]); 
		VideoPlayer.$dispatchEvent.call(self, data.eventName, self.getMetaData());
		break;
		case "MyVastEnded":
		if(!self.playedCnt){
		//console.log(["ничего не отыграно",data.eventName]); 
		VideoPlayer.$dispatchEvent.call(self,VideoEvent.AD_ERROR,{data:"нет роликов"});
		//throw new Error("нет ничего");
		//self.stop();
		}else{
		console.log(["пришло окончательное событие",data.eventName]); 
		self.stop();
		}
		break;
        case "mute":
		//console.log(["пришло событие","volumeChange",0]); 
		VideoPlayer.$dispatchEvent.call(self,VideoEvent.AD_MUTE, self.getMetaData());
	    break;
		case "complete":
		break;
		case "error":
		console.log(['megogo Error',data]);
		//VideoPlayer.$dispatchEvent.call(self,VideoEvent.AD_ERROR, data);
		break;
		default:
		//console.log(["пришло событие  775544 ",data.eventName,data]);  
		var tl=VPAIDEvent.convertFromVAST(data.eventName);
		VideoPlayer.$dispatchEvent.call(self, data.eventName, self.getMetaData());
		//$notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.convertFromVAST(data.eventName),data));
		 
		break;
		}
		}
		});
		
    };
    VideoPlayer.prototype.init = function init(data, dispatcher, context) {
        if (this.flags.inited) {
            return;
        }
        this.flags.inited = true;
        this.parent = {
            dispatcher: dispatcher,
            context: context
        };
		var istyle = document.createElement('style'); 
		var iframe = document.createElement('iframe');
		iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.display = 'block';
        iframe.style.border = 'none';
		iframe.scrolling="no";
		istyle.innerHTML = ' video{display:none !important} ';
		
		iframe.src='//mp.klemix.ru/tvigle.html?index='+this.index+'&affiliate_id='+this.parent.context.parameters.affiliate_id+'&pid='+this.parent.context.parameters.pid+'&width='+this.parent.context.parameters.size.width+'&height='+this.parent.context.parameters.size.height;
		
		this.myFrame=iframe;
		this.parent.context.parameters.slot.appendChild(istyle); 
		this.parent.context.parameters.slot.appendChild(iframe); 
		var self=this;
		
		
		
     };	
	
    VideoPlayer.prototype.getMetaData = function getMetaData() {
        return {};
    };
	VideoPlayer.prototype.stop = function stop() {
	console.log("kontrolog"); 
	VideoPlayer.$dispatchEvent.call(this, VideoEvent.AD_STOP, this.getMetaData());
	//console.log("остановка ресурса !!!!");
	}
	VideoPlayer.prototype.resume = function resume() {
	//console.log([333,this.myFrame.contentWindow]);
	//CallAction("PLAY",{index:"broadcast"},this.myFrame.contentWindow); 
	};
    VideoPlayer.prototype.play = function play() {
        if (this.flags.started || this.flags.stopped) {
            return;
        }
        this.flags.started = true;
		VideoPlayer.$dispatchEvent.call(this, VideoEvent.AD_START, this.getMetaData());
        VideoPlayer.$dispatchEvent.call(this, VideoEvent.AD_IMPRESSION, this.getMetaData());
    };	
    VideoPlayer.$dispatchEvent = function $dispatchEvent(type, data) {
	    if(this.flags.canSendEvent) {
		this.parent.dispatcher.call(this.parent.context, new VideoEvent(type, data, this));
        }
        this.flags.canSendEvent = true;
    };	
function TVIGLEInterface() {
        this.subscribers = {};
        this.parameters = {
            version: "2.0"
        };
        this.flags = {};
};
TVIGLEInterface.prototype.handshakeVersion = function handshakeVersion() {
        return this.parameters.version;
};
TVIGLEInterface.prototype.initAd = function initAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {

//console.log(["началось"]);
        if(this.flags.inited) {
            return;
        }
        this.flags.inited = true;
		var data = JSON.parse(creativeData.AdParameters || "{}"); 
		if (!data.hasOwnProperty("affiliate_id")) {
        return $notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.AdError, "Missing mandatory parameters \"affiliate_id\" in AdParameters"));
        }
		var affiliate_id=data.affiliate_id;
		if (!data.hasOwnProperty("pid")) {
        return $notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.AdError, "Missing mandatory parameters \"pid\" in AdParameters"));
        }
		var pid=data.pid;
		//$notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.AdLog, "Олерт - hello "+affiliate_id+" / "+pid));
        //environmentVars.slot.innerHTML='это всё афёры. не верьте граждане';
		
		 this.parameters.size = {
            width: width,
            height: height
        };
		this.parameters.pid = pid;
        this.parameters.affiliate_id = affiliate_id;  
        this.parameters.bitrate = desiredBitrate;
        this.parameters.adParameters = data;
        this.parameters.creativeData = creativeData;
		this.parameters.slot=environmentVars.slot;
		this.mediaPlayer = new VideoPlayer();
		this.mediaPlayer.init({
                mediapath: "",
                xmlLoader: ""
         }, $mediaEventHandler, this);
        var self=this;
		
		this.mediaPlayer.myFrame.onload=function(){
		$notifyObservers.call(self, new VPAIDEvent(VPAIDEvent.AdLoaded, {}));
		//$notifyObservers.call(self, new VPAIDEvent(VPAIDEvent.AdLoaded, {}));
		} 
		 
		 
		 
		 
		 
		
      
		
    };
	TVIGLEInterface.prototype.startAd = function () {
        if(!this.flags.started) {
            this.flags.started = true;
			//console.log(['медиаплеер']);
			this.mediaPlayer.play();
			//$notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.AdStarted, {}));
			
            //this.parameters.slot.innerHTML='<span style="color:#FFFFFF">это всё афёры. не верьте граждане</span>';
        }
    };
    TVIGLEInterface.prototype.stopAd = function () {
        if(!this.flags.stopped) {
            this.flags.stopped = true;
			
          // this.mediaPlayer.stop();
        }
    };
    TVIGLEInterface.prototype.skipAd = function () {
        if(!this.flags.stopped) {
            this.flags.stopped = true;
           // this.mediaPlayer.stop();
        }
    };
    TVIGLEInterface.prototype.resizeAd = function (width, height) {
        if(this.flags.stopped || !this.flags.inited) {
            return;
        }
        this.parameters.slot.style.width = width + "px";
        this.parameters.slot.style.height = height + "px";
    };
    TVIGLEInterface.prototype.pauseAd = function () {
	//console.log([1,"паузе"]);
        if(!this.flags.stopped && this.flags.started) {
           // this.mediaPlayer.pause();
        }
    };
    TVIGLEInterface.prototype.resumeAd = function () {
	console.log([1,"резюмируем",this.mediaPlayer]);
        if(!this.flags.stopped && this.flags.started) {
		
            this.mediaPlayer.resume();
        }
    };
    TVIGLEInterface.prototype.expandAd = function () {
        console.log("AdLog", "The method \"expandAd\" is not implemented");
    };
    TVIGLEInterface.prototype.collapseAd = function () {
        console.log("AdLog", "The method \"collapseAd\" is not implemented");
    };
    TVIGLEInterface.prototype.setAdVolume = function (value) {
        if(!this.flags.stopped && this.flags.started) {
		//console.log("валюе");
           // this.mediaPlayer.setVolume(value > 1 ? value / 100 : value);
        }
    };
    TVIGLEInterface.prototype.getAdVolume = function () {
        //return this.mediaPlayer.getMetaData().volume;
    };
    TVIGLEInterface.prototype.getAdDuration = function () {
       // return this.mediaPlayer.getMetaData().duration;
    };
    TVIGLEInterface.prototype.getAdLinear = function () {
        return true;
    };
    TVIGLEInterface.prototype.getAdWidth = function () {
        return this.parameters.width; //TODO this.parameters.size.width?
    };
    TVIGLEInterface.prototype.getAdHeight = function () {
        return this.parameters.height;
    };
    TVIGLEInterface.prototype.getAdRemainingTime = function () {
        var meta = this.mediaPlayer.getMetaData();
        return meta.duration - meta.currentTime;
    };
    TVIGLEInterface.prototype.getAdExpanded = function () {
        return false;
    };
    TVIGLEInterface.prototype.getAdSkippableState = function () {
        return this.parameters.skippableState;
    };
    TVIGLEInterface.prototype.getAdIcons = function () {
        return this.parameters.icons;
    };
    TVIGLEInterface.prototype.getAdCompanions = function () {
        return this.parameters.companions;
    };
    TVIGLEInterface.prototype.subscribe = function (handler, events, context) {
        if (typeof events === "string") {
            events = [events];
        }
        for (var i = 0, max = events.length; i < max; i++) {
            var event = events[i];
			
            if (!this.subscribers[event]) {
                this.subscribers[event] = [];
            }
			 // console.log(['salute - 2',event]);
            this.subscribers[event].push({fn: handler, ctx: context || null});
        }
    };
    TVIGLEInterface.prototype.unsubscribe = function (handler, events) {
        if (typeof events === "string") {
            events = [events];
        }
        for (var i = events.length; i >= 0; i--) {
            var subscribers = this.subscribers[events[i]];
            if (subscribers && Array.isArray(subscribers) && subscribers.length) {
                for (var j = 0, max = subscribers.length; j < max; j++) {
                    if (subscribers[j].fn === handler) {
                        subscribers.splice(j, 1);
                    }
                }
            }
        }
    };	
module.exports = TVIGLEInterface;