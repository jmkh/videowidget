/**
 * Created by admin on 10.03.17.
 */
'use strict';
var Configurator = require('./configurator');
var BridgeLib = require('./iFrameBridge');
var Bridge = BridgeLib.Bridge;
var CallAction = BridgeLib.callAction;
function isMyAndroid() {
    var isAndroid = /(android)/i.test(navigator.userAgent);
    return isAndroid;
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


function Wrapper(container) {
    var self = this;
    this.WrapperDiv = null;
    this.config = null;
    this.container = container;
    this.pos = getOffset(container);
    this.bridge = this.Bridge = new Bridge();
    this.index = this.bridge.index;
    this.readyFlag = 0;
    this.clickedFlag = 0;
    this.alstartedFlag = 0;
    this.destructor=function() {
        //alert('die');
        if (self.WrapperDiv) {
            document.body.removeChild(self.WrapperDiv);
            self.WrapperDiv = null;
        }

        self.callback();

    };
    this.bridge.addAction("ready", function (data) {
        self.readyFlag = 1;

        if (isMyAndroid()) {
            var conf = self.config;
            conf.width = self.size.width;
            conf.height = self.size.height;
            self.span.style.display="none";
            self.WrapperDiv.style.background="";
            self.WrapperDiv.style.opacity=1;
            CallAction('execute', {index: self.index, config: conf}, self.frame.contentWindow);
        } else {
            if (self.clickedFlag && !self.alstartedFlag) {
                self.span.style.display="none";
                self.WrapperDiv.style.background="";
                var conf = self.config;
                conf.width = self.size.width;
                conf.height = self.size.height;
                self.alstartedFlag = 1;
                self.frame.style.display = "block";
                CallAction('execute', {index: self.index, config: conf}, self.frame.contentWindow);
            }
        }
    });

    this.bridge.addAction("die", function (data) {
       self.destructor();

    });
    this.size = {width: container.scrollWidth, height: container.scrollHeight};
    this.render = function (size, pos) {
        //console.log(arguments);
        size = size || self.size;
        pos = pos || self.pos;

        var wrapper = document.createElement('div');
        wrapper.className = "mp-wrapper";
        wrapper.id = "mp-wrapper" + (self.bridge.index);
        wrapper.style.width = size.width + "px" || "200px";
        wrapper.style.height = size.height + "px" || "200px";
        wrapper.style.position = "absolute";
        wrapper.style.zIndex = 10000;
        wrapper.style.cursor = "pointer";
        wrapper.style.opacity = 0;
        wrapper.style.textAlign = "center";
        wrapper.style.color = "#ffffff";

        wrapper.style.background = "#000000 url('img/yt-loader.gif') 50% 50% no-repeat";
        wrapper.style.backgroundSize ="50px";
        wrapper.style.top = pos.top + "px";
        wrapper.style.left = pos.left + "px";

        var span = document.createElement('span');

        span.innerHTML="Реклама...";
        span.style.marginTop="10%";
        span.style.display="inline-block";
        wrapper.appendChild(span);
        self.span=span;
        self.WrapperDiv = wrapper;
        //console.log(self.container,wrapper);
        document.body.appendChild(wrapper);
        if (isMyAndroid()) {

            self.execute(self);
        } else {
            self.execute(self);
            wrapper.onclick = function (e) {
                wrapper.style.opacity = 1;
                if (self.clickedFlag)return;
                self.clickedFlag = 1;
                if (self.readyFlag && !self.alstartedFlag) {
                    self.span.style.display="none";
                    self.WrapperDiv.style.background="";
                    var conf = self.config;
                    conf.width = self.size.width;
                    conf.height = self.size.height;
                    self.alstartedFlag = 1;
                    self.frame.style.display = "block";
                    CallAction('execute', {index: self.index, config: conf}, self.frame.contentWindow);
                } else {

                }
                window.setTimeout(function(){
                    if(!self.readyFlag){
                        console.log('не дождался');
                        self.destructor();
                    }
                },3000)
            };
        }
        return wrapper;
    };


    function insertFrame() {
        //var myAndroid = isMyAndroid();
        //alert(myAndroid);
        //alert(11);
        self.frame = document.createElement('iframe');
        self.frame.height = self.size.height;
        self.frame.width = self.size.width;
        self.frame.scrolling = "no";
        self.frame.style.border = "0";
        self.frame.style.margin = "0";
        //self.frame.src="//apptoday.ru/autogit/multioverlay.html?index="+self.index;
        if (isMyAndroid()) {
            self.frame.src = "//video.apptoday.ru/autogit/android/android.html?index=" + self.index;
        } else {
            self.frame.style.display = "none";
            self.frame.src = "//video.apptoday.ru/autogit/android/desctop.html?index=" + self.index;
            //self.frame.src="//dev.apptoday.ru/autogit/android/multioverlay.html?index="+self.index;
            /*
             self.frame.onload=function(){
             var conf=self.config;
             conf.width=self.size.width;
             conf.height=self.size.height;
             //console.log(self.frame);
             CallAction('execute',{index:self.index,config:conf},self.frame.contentWindow);
             };
             */
        }
        self.WrapperDiv.appendChild(self.frame);
        return self.frame;
    }

    this.execute = function (self) {
        //alert()
        insertFrame();

    };
    this.render();
}
function OverlayLib(config) {
    var self = this;
    //alert(JSON.stringify(config));
    this.containers = [];
    this.wrappers = [];
    this.selector = config.selector || "video";
    this.callback = config.callback || function () {

        }
    new Configurator({
        auth: {affiliate_id: config.affiliate_id, pid: config.pid}, successFn: function (config) {
            self.config = config;
            if (self.selector == "video") {
                self.getStandartContainers();
            } else {
                self.getContainers();
            }


            self.makeWrappers();


        }
    });
    this.wrapperClick = function (r) {
    };
    this.getContainers = function (selector) {
        selector = selector || self.selector;
        //this.containers=document.querySelectorAll();
        var user_containers = Array.from(document.querySelectorAll(selector));
        //console.log(self.containers);
        self.containers = self.containers.concat(user_containers);
        //console.log(self.containers);

    };
    this.getStandartContainers = function () {
        var videos = Array.from(document.querySelectorAll('video'));
        var flash = Array.from(document.querySelectorAll('embed'));
        var youtubeAll = document.querySelectorAll('iframe');
        var youtube = [];
        for (var i = 0; i < youtubeAll.length; i++) {
            if (youtubeAll[i].src.indexOf('youtube') >= 0) {
                youtube.push(youtubeAll[i]);
            }

        }

        self.containers = self.containers.concat(videos, flash, youtube);

    };
    this.makeWrappers = function () {
        console.log(self.containers, "-------");
        //return;
        for (var i = 0; i < self.containers.length; i++) {
            var container = self.containers[i];
            var wrapper = new Wrapper(container);
            wrapper.config = self.config;
            wrapper.callback = self.callback;
            console.log(wrapper.config);
            self.wrappers.push(wrapper);

        }
    };

};
module.exports = OverlayLib;