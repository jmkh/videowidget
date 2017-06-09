(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var Configurator = require('./configurator');
var BridgeLib = require('./iFrameBridge');
var Bridge = BridgeLib.Bridge;
var CallAction = BridgeLib.callAction;
function isMyAndroid() {
    var isAndroid = /(android)/i.test(navigator.userAgent);
    return isAndroid;
}
function getClientDomain(){
var fromUrl = (window.location != window.parent.location) ? document.referrer : document.location.href;

    var matches = fromUrl.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    var hostname = matches && matches[1];  // domain will be null if no match is found

return hostname;
};
function getRemaining(cnt){

switch(document.characterSet.toLowerCase()){
case 'utf-8':
return "Реклама... осталось "+cnt+" с";
break;
default:
return "Ad... remained "+cnt+" s";
break;
}


}
function getOffsetRect(elem) {
    // (1)
    var box = elem.getBoundingClientRect()

    // (2)
    var body = document.body;
    var docElem = document.documentElement;

    // (3)
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft

    // (4)
    var clientTop = docElem.clientTop || body.clientTop || 0
    var clientLeft = docElem.clientLeft || body.clientLeft || 0

    // (5)
    var top = box.top + scrollTop - clientTop
    var left = box.left + scrollLeft - clientLeft

    return {top: Math.round(top), left: Math.round(left)}
}
function getOffsetSum(elem) {
    var top = 0, left = 0
    while (elem) {
        top = top + parseFloat(elem.offsetTop)
        left = left + parseFloat(elem.offsetLeft)
        elem = elem.offsetParent
    }
    return {top: Math.round(top), left: Math.round(left)}
}
function getOffset(elem) {
    if (elem.getBoundingClientRect) {
        // "правильный" вариант
        return getOffsetRect(elem)
    } else {
        // пусть работает хоть как-то
        return getOffsetSum(elem)
    }
}

function Wrapper(container){
    var self = this;
    this.WrapperDiv = null;
    this.config = null;
	this.frame = null;
    this.container = container;
	this.index = null;
	this.clickedFlag=0;
	this.readyFlag = 0;
    this.desctopFlag = 0;
	this.desctopStartFlag=0;
    this.pos = getOffset(container);
	this.size = {width: container.offsetWidth, height: container.offsetHeight};
	this.destructor=function() {
        if (self.WrapperDiv) {
            document.body.removeChild(self.WrapperDiv);
            self.WrapperDiv = null;
        }
        self.callback();
    };
	function stopCounter(cnt){
	if(self.desctopStartFlag) return;
	if(cnt<=0) {
	self.destructor();
	return;
	  }
	  
	  cnt--;
	  self.span.innerHTML=getRemaining(cnt);
	  setTimeout(function (){
	  stopCounter(cnt);
	  },1000);
	}
	this.WrapperDiv=document.createElement('div');
	this.WrapperDiv.className = "mp-wrapper";
	this.WrapperDiv.style.position = "absolute";
	this.WrapperDiv.style.zIndex = 9999999;
    this.WrapperDiv.style.cursor = "pointer";
    this.WrapperDiv.style.opacity = 0;
	this.WrapperDiv.style.filter="alpha(Opacity=0)";
    this.WrapperDiv.style.cursor = "pointer";
	this.WrapperDiv.style.background = "#000000 url('//apptoday.ru/autogit/autostop/img/yt-loader.gif') 50% 50% no-repeat";
	this.WrapperDiv.style.textAlign = "center";
    this.WrapperDiv.style.color = "#ffffff";
		
		this.span = document.createElement('span');

        this.span.innerHTML="Реклама...";
        this.span.style.marginTop="10%";
        this.span.style.display="inline-block";
        this.WrapperDiv.appendChild(this.span);
		this.render();
		 //this.WrapperDiv.id = "mp-wrapper" + (self.bridge.index);
	document.body.appendChild(this.WrapperDiv);
	window.addEventListener('resize', function(){
	self.render();
	}, false);
	
	
	

    setTimeout(function func() {
    self.render();
    }, 1500);


    window.addEventListener('scroll', function(e) {
	self.render();
	}, false);
    this.WrapperDiv.onclick=function(){
	if(self.clickedFlag) return;
	self.clickedFlag=1;
	self.WrapperDiv.style.opacity = 1;
	self.WrapperDiv.style.filter="alpha(Opacity=100)";
	stopCounter(30);
	self.getReady();
	}
	this.bridge = new Bridge();
    this.index = this.bridge.index;
	this.bridge.addAction("die", function (data) {
       self.destructor();
    });
    this.bridge.addAction("ready", function (data) {
	if(self.readyFlag) return; 
		  self.readyFlag = 1;
		  if (isMyAndroid()) {
		  self.WrapperDiv.style.background="";
		  self.WrapperDiv.style.opacity = 1;
          self.WrapperDiv.style.filter="alpha(Opacity=100)";
		  self.span.style.display="none";
		
          CallAction('execute', {index: self.index, config: self.config}, self.frame.contentWindow); 
		  }else{
		   self.desctopFlag = 1;
		   self.getReady();
		  }
    });	
	
};
Wrapper.prototype.getReady = function () {
if(!this.config) return;
if(!this.index) return;
this.insertFrame();
if(!this.readyFlag) return;
if(!this.clickedFlag) return;
if(!this.desctopFlag) return;
 this.setDesctopExecute();
};
Wrapper.prototype.setDesctopExecute = function () {
  if(this.desctopFlag!=1) return;
  var self=this;
   this.desctopFlag = 2;
    this.bridge.addAction("startPlay", function (data) {
	if(self.desctopStartFlag) return; 
	self.desctopStartFlag=1;
	      self.WrapperDiv.style.background="";
		  self.WrapperDiv.style.opacity = 1;
		  self.WrapperDiv.style.display="block";
		  self.frame.style.display="block";
          self.WrapperDiv.style.filter="alpha(Opacity=100)";
		  self.span.style.display="none";
   });
  CallAction('execute', {index: this.index, config: this.config}, this.frame.contentWindow); 

};
Wrapper.prototype.setConfig = function (config) {
 this.config = config;
 this.getReady();
};
Wrapper.prototype.insertFrame=function() {
if(this.frame) return;
var size = {width: this.container.scrollWidth, height: this.container.scrollHeight};
        this.frame = document.createElement('iframe');
        this.frame.height = "100%";
        this.frame.width  = "100%";

        this.frame.scrolling = "no";
        this.frame.style.border = "0";
        this.frame.style.margin = "0";
		 if (isMyAndroid()) {
			//this.frame.src = "//apptoday.ru/dev/android.html?index=" + this.index;
			//this.frame.src = "//kinodrevo.ru/frames/android.html?index=" + this.index;
			this.frame.src = "//i-trailer.ru/player/html5/osipov/android.html?index=" + this.index;
        } else {
            this.frame.style.display = "none";
			//this.frame.src = "//apptoday.ru/dev/desctop.html?index=" + this.index;
			//this.frame.src = "//kinodrevo.ru/frames/desctop.html?index=" + this.index;

			this.frame.src = "//i-trailer.ru/player/html5/osipov/desctop.html?index=" + this.index;
        }
		this.WrapperDiv.appendChild(this.frame);
    };
Wrapper.prototype.render = function () {
    if(!this.WrapperDiv) return;
    var pos = getOffset(this.container);
	var size = {width:  this.container.offsetWidth, height: this.container.offsetHeight};
	this.WrapperDiv.style.width = size.width + "px" || "200px";
    this.WrapperDiv.style.height = size.height + "px" || "200px";
	this.WrapperDiv.style.backgroundSize ="50px";
    this.WrapperDiv.style.top = pos.top + "px";
    this.WrapperDiv.style.left = pos.left + "px";
};
function Overlay(config) {
    var self = this;
    this.containers = [];
    this.wrappers = [];
    this.selector = config.selector || "video";
    this.callback = config.callback || function () {
	}
	this.getContainers(this.selector);
	var clientDomain=getClientDomain();
		new Configurator({
        auth: {affiliate_id: config.affiliate_id, pid: config.pid,host:clientDomain}, successFn: function (config) {
		self.config = config;
		for(var i=0,j=self.wrappers.length;i<j;i++){
			self.wrappers[i].setConfig(config);
			}
        }
    });
};
Overlay.prototype.getContainers = function (selector) {
        selector = selector || this.selector;
		this.containers = document.querySelectorAll(selector)
		for(var i=0,j=this.containers.length;i<j;i++){
		    var wrapper = new Wrapper(this.containers[i]);
            wrapper.callback = this.callback;
            this.wrappers.push(wrapper);
		}

};		
module.exports = Overlay;
},{"./configurator":2,"./iFrameBridge":4}],2:[function(require,module,exports){
'use strict';
var httpclient = require('./httpclient');
function viOS() {

	var iDevices = [
		'iPad Simulator',
		'iPhone Simulator',
		'iPod Simulator',
		'iPad',
		'iPhone',
		'iPod'
	];
	if (!!navigator.platform) {
		while (iDevices.length) {
			if (navigator.platform === iDevices.pop()){ return true; }
		}
	}

	return false;
}
function Configurator(config)
{
	var defaults={
		size:{width:"350",height:"400"},
		container:"#mp-video-widget-container-56015401b3da9-20",
		auth:{affiliate_id:"56015401b3da9",pid:"20"},
		errorFn:function(){},
		successFn:function(config){
		}
	};
	var localConfig=defaults;
	for(var i in config){
		if(config.hasOwnProperty(i)){
			localConfig[i]=config[i];
		}
	}
	//config=config||defaults;
    var self=this;
    this.loaded=false;
    var host = localConfig.auth.host.replace(/^www\./,'');
	this.configUrl = "https://widget.market-place.su/videoopt/" + localConfig.auth.affiliate_id + "_" + localConfig.auth.pid + "_"+host+".json?p="+Math.random();
	var errorFn= config.errorFn  || function(){};
	var successFn= config.successFn || function(){};

	httpclient.ajax(this.configUrl,{errorFn:errorFn,successFn:function(res){
		try{
			var config=JSON.parse(res);
			if(typeof config.error!="undefined"){
				throw new Error("Виджет удалён.");
			}
			for(var i in config){
				if(config.hasOwnProperty(i)){
					self[i]=config[i];
				}
			}
			var isNotDesktop = /Android|Silk|Mobile|PlayBook/.test(window.navigator.userAgent);
			var isIos = viOS();
			self.isDesktop=!isNotDesktop;
			switch(true){
				case isIos:
					self.ads=config['ads-mobile'].iOS;
					break;
				case isNotDesktop:
					self.ads=config['ads-mobile'].Android;

					break;

			}
			httpclient.ajax("https://widget.market-place.su/proxy_referer/",{errorFn:function(){},successFn:function(res){
				try{
					var ref=JSON.parse(res);
					self.loaded=true;
					self.referer=ref;
					localConfig.successFn(self);
					window.parent.postMessage(config,'*');
				}catch(e){
					console.log('битая конфигурация',e);
				}
			}});
		}catch(e){
			console.log('битая конфигурация',e);
		}
	}});
	registerView(localConfig);
};
function registerView(config){

	var key = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	var preRemoteData = {
		key: key,
		fromUrl: encodeURIComponent(''),
		pid: config.auth.pid,
		affiliate_id: config.auth.affiliate_id,
		cookie_id: 0,
		id_src: 0,
		event: 'loadWidget',
		mess: ''
	};
	var toURL = "https://api.market-place.su/Product/video/l1stat.php?p=" + Math.random() + '&data=' + encodeURIComponent(JSON.stringify(preRemoteData));
	// console.log(["уйди со смыслом",data.eventName,toURL]);
	var img = new Image(1, 1);
	img.src = toURL;
}
module.exports = Configurator;
},{"./httpclient":3}],3:[function(require,module,exports){
'use strict';
var  Httpclient=
{
    ajax: function (src, config) 
	{
        var linksrc=src;
	    config = config ||{};
    	var errorFn= config.errorFn  || function(){};
		var successFn = config.successFn || function(){};
	
		var type= config.type || "GET";
		var data = config.data || {};
        var serialized_Data = JSON.stringify(data);

		type = type.toUpperCase();
        if (window.XMLHttpRequest) 
		{
            var xhttp = new XMLHttpRequest();
        }
        else 
		{
            var xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        if (type == "GET") 
		{
             serialized_Data = null;
			if(linksrc.indexOf('?')<0){
				linksrc+="?1=1";
			}
			for(var i in data)
			{
				if(data.hasOwnProperty(i)){
					linksrc+="&"+i+"="+data[i];
				}
			}
        }
		xhttp.open(type, linksrc, true);
		xhttp.onreadystatechange = function () 
		{
            if (xhttp.readyState == 4)
			{
              if (xhttp.status == 200) 
			    {
                  successFn({response:xhttp.responseText});
                }
			else
				{
				    errorFn({status:xhttp.status});
				}
            }
			else
			{
			 errorFn({status:xhttp.readyState});
			}
        };
	     xhttp.onreadystatechange = function () 
		 {
          if (xhttp.readyState == 4)
		  {
				if (xhttp.status == 200)
				{
                 successFn(xhttp.responseText);
                }
				else
				{
				 errorFn({status:xhttp.status});
		        }
		  }
         };
        try 
		{
            xhttp.withCredentials = config.withCredentials||false;
			xhttp.send(serialized_Data);
        } catch (err){} 
    }
};
module.exports = Httpclient;
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
'use strict'
var Overlay = require('./../models_1/Overlay');
if(typeof mPwConfig !="undefined" && mPwConfig.hasOwnProperty("affiliate_id")){
var tmp= new Overlay(mPwConfig);
}
window.CreateOverplayWidget=function(config){
var tmp= new Overlay(config);
}




},{"./../models_1/Overlay":1}]},{},[5])