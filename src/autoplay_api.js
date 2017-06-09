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
