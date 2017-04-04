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