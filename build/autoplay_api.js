(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
	//console.log([name,data,window]);
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
},{}],2:[function(require,module,exports){
'use strict'
//var Configurator = require('./../models_1/configurator');
var BridgeLib = require('./../models_1/iFrameBridge');
var Bridge = BridgeLib.Bridge;
var CallAction = BridgeLib.callAction;

var Autoplay = function (config) {
     function mydetectmob () {
        //return true;
        if (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)
        ) {
            return true;
        }
        else {
            return false;
        }
    }
    var ismobile= mydetectmob();

    this.config = {

        cols: 1,
        rows: 1,
        size: {
            width: "200px",
            height: "200px",
        },
        player: "JSVIDEO",
        block_size: {
            width: "200px",
            height: "200px"
        },
        auth: {
            affiliate_id: '',
            pid: ''
        },
        container: "#mp-video-widget-container",
    }
    for (var i in this.config) {
        if (typeof config[i] != "undefined")this.config[i] = config[i];
    }
    this.container = null;
    try {
        this.container = document.querySelector(this.config.container);
        if (!this.container) {
            console.log(["no container ! ", this.config.container]);
            return;
        }
    } catch (e) {
        console.log(["error ! ", e]);
        return;
    }
    this.frame = document.createElement('iframe');
    this.container.style.textAlign = "center";
    this.container.appendChild(this.frame);
    //this.frame.height=this.config.size.height;
    //this.frame.width=this.config.size.width;
    this.frame.height = 350;
    this.frame.width = 500;
    this.frame.scrolling = "no";
    this.frame.style.border = "0";
    this.frame.style.margin = "0";
    var self = this;
    var bridge=new Bridge();
    bridge.addAction("die",function(data){
        //console.log("сдох",self.container)
        self.container.innerHTML="";
        //window.document.body.removeChild( self.container);

    });
    bridge.addAction("resize",function(data){
        resize(data.config);

    });
    function resize(config){
        //console.log(self)
        //if(self.config.auth.pid!="195"){
        //self.frame.height=parseInt(config.height);
        //self.frame.width=parseInt(config.width);}
        //else{
        if(ismobile){
            self.frame.style.maxHeight=parseInt(config.height)+"px;";
            self.frame.width="100%";
        }else{
            self.frame.height=parseInt(config.height);
            self.frame.width=parseInt(config.width);
        }
        console.log(['resize',self.frame.width+'/'+self.frame.height]);
        //}
    }
    //this.frame.src = "//apptoday.ru/dev/auto.html?v=1&affiliate_id="
    //    + this.config.auth.affiliate_id
    //    + "&pid=" + this.config.auth.pid
    //    + "&index="+bridge.index
    //;
    //this.frame.src = "//kinodrevo.ru/frames/auto.html?v=1&affiliate_id="
    //    + this.config.auth.affiliate_id
    //    + "&pid=" + this.config.auth.pid
    //    + "&index="+bridge.index
    //;
    function exec() {
        self.frame.src = document.location.protocol+"//i-trailer.ru/player/html5/osipov/auto.html?v=1&affiliate_id=" + self.config.auth.affiliate_id
            + "&pid=" + self.config.auth.pid
            + "&index="+bridge.index
        ;
    }

    if(ismobile&&0){
        (function(){
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://video.market-place.su/test/autostop/build/advark.js?v=" + Math.random();
            script.charset = "UTF-8";
            document.getElementsByTagName("head")[0].appendChild(script);
            script.onload=function(){
                MpStartAdvark({pid:self.config.auth.pid,affiliate_id:self.config.auth.affiliate_id,callback:function(){
                    exec();
                }});
            }
        })();
    }else {
        exec();
    }


};
if (typeof mPwConfig != "undefined" && mPwConfig.hasOwnProperty("auth")) {
    var tmp = new Autoplay(mPwConfig);
}
window.VideoFrame = function (config) {
    var tmp = new Autoplay(config);
};

},{"./../models_1/iFrameBridge":1}]},{},[2])