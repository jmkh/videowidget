'use strict'
var mydispatcher = require('./../models_1/dispatcher');
var Configurator = require('./../models_1/configurator');
var BridgeLib = require('./../models_1/iFrameBridge');
window.Bridge = BridgeLib.Bridge;
window.CallAction = BridgeLib.callAction;
function getClientDomain() {
    var fromUrl = (window.location != window.parent.location) ? document.referrer : document.location.href;
    var hostname = (new URL(fromUrl)).hostname;
    return hostname;
};
function defaultFunctionReplay(config) {
    console.log("MyVastEnded");
    CallAction('adEvent', {index: config.page_index, eventName: "MyVastEnded"}, window.parent);
    return;
}
function parseConfig() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
};
var c_data = parseConfig();
if (typeof c_data.index == 'undefined') {
    c_data.index = 'broadcast';
    //c_data={pid:"20",affiliate_id:"56015401b3da9",h1:"IPHONE 7"};
}
//c_data={pid:"20",affiliate_id:"56015401b3da9",h1:"IPHONE 7"};
if (c_data.hasOwnProperty("site") && c_data.site) {
    var clientDomain = c_data.site;
} else {
    var clientDomain = getClientDomain();
}
if (c_data.pid == 409) {
    clientDomain = "i-trailer.ru";
}
if (c_data.pid == 426) {
    clientDomain = "i-trailer.ru";
}
new Configurator({
    auth: {affiliate_id: c_data.affiliate_id, pid: c_data.pid, host: clientDomain}, successFn: function (config) {
        config.page_index = c_data.index;

        if (c_data.hasOwnProperty("site") && c_data.site) {
            config.site = c_data.site;
        }
        mydispatcher.prototype.timerToCloseFn = function () {
            if (this.timerToClose < 0) {
                this.playExit();
                return;
            }
            this.timerToClose--;
            var self = this;
            setTimeout(function () {
                self.timerToCloseFn();
            }, 1000);
        }

        window.colorPixels = new mydispatcher("mycontoller", "container", "placeholder");
        window.colorPixels.playType = 1;
        window.colorPixels.timerToClose = 80;
        window.colorPixels.timerToCloseFn();
        //window.colorPixels.setConfig(config,defaultFunctionReplay);
        var index = c_data.index;
        var bridge = new Bridge(index);

        console.log(index);
        bridge.addAction("playAd", function (data) {
            console.log("playAd!!!");
            window.colorPixels.setConfig(config, defaultFunctionReplay);
        });

        function player_delay(cnt,funct) {
            if (cnt <= 0) return;
            console.log(colorPixels.current_player);
            if (!colorPixels.current_player) {
                window.setTimeout(function () {

                    player_delay(cnt - 1, funct);
                }, 100);
            } else {
                funct(colorPixels.current_player);

            }

        }

        bridge.addAction("pauseAd", function (data) {
            console.log("pauseAd!!!");

            player_delay(40,function(){
                colorPixels.current_player.pauseAd();
            });

        });
        bridge.addAction("resumeAd", function (data) {
            console.log("resumeAd!!!");
            player_delay(40,function(){
                colorPixels.current_player.resumeAd();
            });

        });


        CallAction('AdLoaded', {index: config.page_index}, window.parent);


    }
});
	
	
	