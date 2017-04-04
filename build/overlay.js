(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by admin on 10.03.17.
 */
'use strict';
var Configurator = require('./configurator');
var BridgeLib = require('./iFrameBridge');
var Bridge=BridgeLib.Bridge;
var CallAction=BridgeLib.callAction;
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
    var top  = box.top +  scrollTop - clientTop
    var left = box.left + scrollLeft - clientLeft

    return { top: Math.round(top), left: Math.round(left) }
}
function getOffsetSum(elem) {
    var top=0, left=0
    while(elem) {
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
    var self=this;
    this.WrapperDiv=null;
    this.config=null;
    this.container=container;
    this.pos=getOffset(container);
    this.bridge= this.Bridge=new Bridge();
    this.index=this.bridge.index;
    this.bridge.addAction("die",function(data){
        //alert('die');
        if(self.WrapperDiv) {
            document.body.removeChild(self.WrapperDiv);
            self.WrapperDiv=null;
        }

        self.callback();



    });
    this.size={width:container.scrollWidth,height:container.scrollHeight};
    this.render= function (size,pos) {
        //console.log(arguments);
        size=size||self.size;
        pos=pos||self.pos;

        var wrapper=document.createElement('div');
        wrapper.className="mp-wrapper";
        wrapper.id="mp-wrapper"+(self.bridge.index);
        wrapper.style.width=size.width+"px"||"200px";
        wrapper.style.height=size.height+"px"||"200px";
        wrapper.style.position="absolute";
        wrapper.style.zIndex=10000;
        wrapper.style.cursor="pointer";
        wrapper.style.top=pos.top+"px";
        wrapper.style.left=pos.left+"px";
        wrapper.onclick=function(e){

            self.execute(self);
        };
        self.WrapperDiv=wrapper;
        //console.log(self.container,wrapper);
        document.body.appendChild(wrapper);
        return wrapper;
    };
    function insertFrame(){
        self.frame=document.createElement('iframe');
        self.frame.height=self.size.height;
        self.frame.width=self.size.width;
        self.frame.scrolling="no";
        self.frame.style.border="0";
        self.frame.style.margin="0";
        //self.frame.src="//apptoday.ru/autogit/multioverlay.html?index="+self.index;
        self.frame.src="//apptoday.ru/autogit/autostop/multioverlay.html?index="+self.index;
        self.frame.onload=function(){
            var conf=self.config;
            conf.width=self.size.width;
            conf.height=self.size.height;
            //console.log(self.frame);
            CallAction('execute',{index:self.index,config:conf},self.frame.contentWindow);
        };
        self.WrapperDiv.appendChild(self.frame);
        return self.frame;
    }
    this.execute=function(self){
        //alert()
        insertFrame();

    };
    this.render();
}
function OverlayLib(config){
    var self=this;
    //alert(JSON.stringify(config));
    this.containers=[];
    this.wrappers=[];
    this.selector=config.selector||"video";
    this.callback=config.callback||function () {

        }
    new Configurator({auth:{affiliate_id:config.affiliate_id,pid:config.pid},successFn:function(config){
        self.config=config;
        //console.log(config);
        if(self.selector=="video"){
            self.getStandartContainers();
        }else
        {
            self.getContainers();
        }


        self.makeWrappers();


    }});
    this.wrapperClick=function(r){};
    this.getContainers=function(selector){
        selector=selector||self.selector;
        //this.containers=document.querySelectorAll();
        var user_containers=Array.from(document.querySelectorAll(selector));
        //console.log(self.containers);
        self.containers=self.containers.concat(user_containers);
        //console.log(self.containers);

    };
    this.getStandartContainers=function(){
        var videos=Array.from(document.querySelectorAll('video'));
        var flash=Array.from(document.querySelectorAll('embed'));
        var youtubeAll=document.querySelectorAll('iframe');
        var youtube=[];
        for(var i =0;i<youtubeAll.length;i++) {
            if( youtubeAll[i].src.indexOf('youtube')>=0) {
                youtube.push(youtubeAll[i]);
            }

        }

        self.containers=self.containers.concat(videos,flash,youtube);

    };
    this.makeWrappers=function(){
        //console.log(self.containers,"-------");

        for(var i=0;i<self.containers.length;i++){
            var container=self.containers[i];
            var wrapper=new Wrapper(container);
            wrapper.config=self.config;
            wrapper.callback=self.callback;
            //console.log(wrapper.config);
            self.wrappers.push(wrapper);

        }
    };

};
module.exports=OverlayLib;
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
			console.log(config);

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

	this.configUrl = "https://widget.market-place.su/videooptions/" + localConfig.auth.affiliate_id + "_" + localConfig.auth.pid + ".json?p="+Math.random();
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
			//console.log(self,isIos,isNotDesktop);
			//alert("--"+isIos+"--"+isNotDesktop)
			//window.cnf=config;
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

			//localConfig.successFn(self);
			//window.parent.postMessage(config,'*');
		}catch(e){
			console.log('битая конфигурация',e);
		}
	}});
};
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
             //console.log(event.data.name,event.data.data.index);
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
 * Created by admin on 10.03.17.
 */
var OverlayLib = require('./../models/OverlayLib');
window.MpOverPlayLib=OverlayLib;


},{"./../models/OverlayLib":1}]},{},[5])