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
        this.iframe=null;
		this.bridge=new Bridge(); 
		this.index=this.bridge.index;

        this.bridge.addAction("AdLoaded",function(data){
            //получаем сигнал о готовности от фрейма
            console.log(window.parent.colorPixels);
            CallAction('initAd',{index:self.index,AdVolume:window.parent.colorPixels.config.volume,link:self.parent.context.parameters.link},self.iframe.contentWindow);
            $notifyObservers.call(self.parent.context, new VPAIDEvent(VPAIDEvent.AdLoaded, {}));
        });
		this.bridge.addAction("adEvent",function(data){
            //console.log("event",data)
		if(data.hasOwnProperty("eventName")){

		switch (data.eventName) {
		
		case "firstQuartile":
			self.playedCnt++;
			VideoPlayer.$dispatchEvent.call(self, data.eventName, self.getMetaData());
		break;
		case "MyVastEnded":
		if(!self.playedCnt){

			VideoPlayer.$dispatchEvent.call(self,VideoEvent.AD_ERROR,{data:"нет роликов"});

		}else{

			self.stop();
		}
		break;
        case "mute":
		VideoPlayer.$dispatchEvent.call(self,VideoEvent.AD_MUTE, self.getMetaData());
	    break;
		case "complete":
		
		
		break;
		case "error":
		break;
		default:
		var tl=VPAIDEvent.convertFromVAST(data.eventName);
		VideoPlayer.$dispatchEvent.call(self, data.eventName, self.getMetaData());
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
        //--
        //this.flags.started = true;
        var istyle = document.createElement('style');
        var iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.display = 'block';
        iframe.style.border = 'none';
        iframe.scrolling="no";
        istyle.innerHTML = ' video{display:none !important} ';
        //console.log(window.location, window.parent.location,document.referrer, document.location.href);
        var fromUrl = (window.location != window.parent.location) ? document.referrer : document.location.href;
        var matches = fromUrl.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
        var fromDomain = matches && matches[1];  // domain will be null if no match is found
        //var fromUrl=window.parent.document.referrer;
        //var fromDomain= (new URL(fromUrl)).hostname;


        //iframe.src='//apptoday.ru/dev/vast.html?index='+this.index+'&affiliate_id='+this.parent.context.parameters.affiliate_id+'&pid='+this.parent.context.parameters.pid+'&width='+this.parent.context.parameters.size.width+'&height='+this.parent.context.parameters.size.height+'&site='+fromDomain;
        iframe.src=window.location.protocol+'//'+this.parent.context.parameters.iframe+'/proxyvast.html?index='+this.index+'&width='+this.parent.context.parameters.size.width+'&height='+this.parent.context.parameters.size.height+'&site='+fromDomain;


        this.iframe=iframe;


        this.parent.context.parameters.slot.appendChild(istyle);
        this.parent.context.parameters.slot.appendChild(iframe);

    };	
	
    VideoPlayer.prototype.getMetaData = function getMetaData() {
        return {};
    };
	VideoPlayer.prototype.stop = function stop() {
	VideoPlayer.$dispatchEvent.call(this, VideoEvent.AD_STOP, this.getMetaData());
	}
    VideoPlayer.prototype.play = function play() {
        if (this.flags.started || this.flags.stopped) {
            return;
        }
        console.log('play_')
        CallAction('playAd',{index:this.index},this.iframe.contentWindow);
		 //--------------- old
       // this.flags.started = true;
		//var istyle = document.createElement('style');
		//var iframe = document.createElement('iframe');
		//iframe.style.width = '100%';
       // iframe.style.height = '100%';
       // iframe.style.display = 'block';
       // iframe.style.border = 'none';
		//iframe.scrolling="no";
		//istyle.innerHTML = ' video{display:none !important} ';
       // //console.log(window.location, window.parent.location,document.referrer, document.location.href);
       //var fromUrl = (window.location != window.parent.location) ? document.referrer : document.location.href;
       // var matches = fromUrl.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
       // var fromDomain = matches && matches[1];  // domain will be null if no match is found
		//  //var fromUrl=window.parent.document.referrer;
       //   //var fromDomain= (new URL(fromUrl)).hostname;
       //
       //
		////iframe.src='//apptoday.ru/dev/vast.html?index='+this.index+'&affiliate_id='+this.parent.context.parameters.affiliate_id+'&pid='+this.parent.context.parameters.pid+'&width='+this.parent.context.parameters.size.width+'&height='+this.parent.context.parameters.size.height+'&site='+fromDomain;
		//iframe.src='//kinodrevo.ru/frames/vast.html?index='+this.index+'&affiliate_id='+this.parent.context.parameters.affiliate_id+'&pid='+this.parent.context.parameters.pid+'&width='+this.parent.context.parameters.size.width+'&height='+this.parent.context.parameters.size.height+'&site='+fromDomain;
       //
       //
       // this.iframe=iframe;
		//VideoPlayer.$dispatchEvent.call(this, VideoEvent.AD_START, this.getMetaData());
       // VideoPlayer.$dispatchEvent.call(this, VideoEvent.AD_IMPRESSION, this.getMetaData());
		//
		//this.parent.context.parameters.slot.appendChild(istyle);
		//this.parent.context.parameters.slot.appendChild(iframe);
        //-------old

        this.flags.started = true;

        VideoPlayer.$dispatchEvent.call(this, VideoEvent.AD_START, this.getMetaData());
        VideoPlayer.$dispatchEvent.call(this, VideoEvent.AD_IMPRESSION, this.getMetaData());


    };
    VideoPlayer.prototype.pause=function pause() {
        console.log("pause");
        CallAction('pauseAd',{index:this.index},this.iframe.contentWindow);
    };

    VideoPlayer.prototype.resume=function resume() {
        console.log("resume");
        CallAction('resumeAd',{index:this.index},this.iframe.contentWindow);
    };
    VideoPlayer.$dispatchEvent = function $dispatchEvent(type, data) {
	    if(this.flags.canSendEvent) {
		this.parent.dispatcher.call(this.parent.context, new VideoEvent(type, data, this));
        }
        this.flags.canSendEvent = true;
    };	
function FrameVPAIDInterface() {
        this.subscribers = {};
        this.parameters = {
            version: "2.0"
        };
        this.flags = {};
};
FrameVPAIDInterface.prototype.handshakeVersion = function handshakeVersion() {
        return this.parameters.version;
};
FrameVPAIDInterface.prototype.initAd = function initAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {

        if(this.flags.inited) {
            return;
        }
    
        this.flags.inited = true;
		var data = JSON.parse(creativeData.AdParameters || "{}"); 
        if (!data.hasOwnProperty("iframe")) {
        return $notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.AdError, "Missing mandatory parameters \"affiliate_id\" in AdParameters"));
        }
		var iframe=data.iframe;
    if (!data.hasOwnProperty("link")) {
        return $notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.AdError, "Missing mandatory parameters \"affiliate_id\" in AdParameters"));
        }
		var link=data.link;

		 this.parameters.size = {
            width: width,
            height: height
        };
		this.parameters.iframe = iframe;
		this.parameters.link = link;
        this.parameters.bitrate = desiredBitrate;
        this.parameters.adParameters = data;
        this.parameters.creativeData = creativeData;
		this.parameters.slot=environmentVars.slot;
		this.mediaPlayer = new VideoPlayer();
		
		this.mediaPlayer.init({
                mediapath: "",
                xmlLoader: ""
         }, $mediaEventHandler, this);
	
		//$notifyObservers.call(this, new VPAIDEvent(VPAIDEvent.AdLoaded, {}));
      
		
    };
	FrameVPAIDInterface.prototype.startAd = function () {
	
	
        if(!this.flags.started) {
            this.flags.started = true;
			
			this.mediaPlayer.play();
        }
    };
    FrameVPAIDInterface.prototype.stopAd = function () {
        if(!this.flags.stopped) {
            this.flags.stopped = true;
			
          // this.mediaPlayer.stop();
        }
    };
    FrameVPAIDInterface.prototype.skipAd = function () {
        if(!this.flags.stopped) {
            this.flags.stopped = true;
           // this.mediaPlayer.stop();
        }
    };
    FrameVPAIDInterface.prototype.resizeAd = function (width, height) {
        if(this.flags.stopped || !this.flags.inited) {
            return;
        }
        this.parameters.slot.style.width = width + "px";
        this.parameters.slot.style.height = height + "px";
    };
    FrameVPAIDInterface.prototype.pauseAd = function () {
        //console.log("pauseAd",this.flags);
        if(!this.flags.stopped && this.flags.started) {
            //console.log("pauseAd",this.flags);
            this.mediaPlayer.pause();
        }
    };
    FrameVPAIDInterface.prototype.resumeAd = function () {
        if(!this.flags.stopped && this.flags.started) {
            this.mediaPlayer.resume();
        }
    };
    FrameVPAIDInterface.prototype.expandAd = function () {
        console.log("AdLog", "The method \"expandAd\" is not implemented");
    };
    FrameVPAIDInterface.prototype.collapseAd = function () {
        console.log("AdLog", "The method \"collapseAd\" is not implemented");
    };
    FrameVPAIDInterface.prototype.setAdVolume = function (value) {
        if(!this.flags.stopped && this.flags.started) {
        }
    };
    FrameVPAIDInterface.prototype.getAdVolume = function () {
    };
    FrameVPAIDInterface.prototype.getAdDuration = function () {
    };
    FrameVPAIDInterface.prototype.getAdLinear = function () {
        return true;
    };
    FrameVPAIDInterface.prototype.getAdWidth = function () {
        return this.parameters.width; //TODO this.parameters.size.width?
    };
    FrameVPAIDInterface.prototype.getAdHeight = function () {
        return this.parameters.height;
    };
    FrameVPAIDInterface.prototype.getAdRemainingTime = function () {
        var meta = this.mediaPlayer.getMetaData();
        return meta.duration - meta.currentTime;
    };
    FrameVPAIDInterface.prototype.getAdExpanded = function () {
        return false;
    };
    FrameVPAIDInterface.prototype.getAdSkippableState = function () {
        return this.parameters.skippableState;
    };
    FrameVPAIDInterface.prototype.getAdIcons = function () {
        return this.parameters.icons;
    };
    FrameVPAIDInterface.prototype.getAdCompanions = function () {
        return this.parameters.companions;
    };
    FrameVPAIDInterface.prototype.subscribe = function (handler, events, context) {
        if (typeof events === "string") {
            events = [events];
        }
        for (var i = 0, max = events.length; i < max; i++) {
            var event = events[i];
			
            if (!this.subscribers[event]) {
                this.subscribers[event] = [];
            }
            this.subscribers[event].push({fn: handler, ctx: context || null});
        }
    };
    FrameVPAIDInterface.prototype.unsubscribe = function (handler, events) {
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
module.exports = FrameVPAIDInterface;