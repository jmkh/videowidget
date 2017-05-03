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

var hostname = (new URL(fromUrl)).hostname;

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
	  console.log(155);
	  cnt--;
	  self.span.innerHTML=getRemaining(cnt);
	  setTimeout(function (){
	  stopCounter(cnt);
	  },1000);
	}
	this.WrapperDiv=document.createElement('div');
	this.WrapperDiv.className = "mp-wrapper";
	this.WrapperDiv.style.position = "absolute";
	this.WrapperDiv.style.zIndex = 10000;
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
			this.frame.src = "//apptoday.ru/dev/android.html?index=" + this.index;
        } else {
            this.frame.style.display = "none";
			this.frame.src = "//apptoday.ru/dev/desctop.html?index=" + this.index;
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