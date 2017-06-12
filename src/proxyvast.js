'use strict'
var mydispatcher = require('./../models/dispatcher');
var Configurator = require('./../models/configurator');
var BridgeLib = require('./../models/iFrameBridge');
window.Bridge = BridgeLib.Bridge;
window.CallAction = BridgeLib.callAction;
function getClientDomain() {
    var fromUrl = (window.location != window.parent.location) ? document.referrer : document.location.href;
    var hostname = (new URL(fromUrl)).hostname;
    return hostname;
};

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
var clientDomain = getClientDomain();
if (c_data.hasOwnProperty("site") && c_data.site) {
    clientDomain = c_data.site;
} else {

}
var config={};
        config.page_index = c_data.index;


        window.colorPixels = new mydispatcher("mycontoller", "container", "placeholder");
        window.colorPixels.playType = 1;
        window.colorPixels.timerToClose = 80;
        window.colorPixels.timerToCloseFn();
        window.colorPixels.config.page_index=config.page_index;

        //window.colorPixels.setConfig(config,defaultFunctionReplay);
        var index = c_data.index;
        var bridge = new Bridge(index);
            var link=null;
        bridge.addAction("initAd", function (data) {
            console.log("initAd!!!");
            console.log(data.link);
            link=data.link;
            //window.colorPixels.setConfig(config, defaultFunctionReplay);
        });
        bridge.addAction("playAd", function (data) {
            console.log("playAd!!!");
            var dopAds = {
                "id": -7,
                "src": link,
                "priority": "10",
                "title": "Заглушка",
                "created_at": "2017-03-22 16:29:45",
                "updated_at": "2017-03-22 16:29:45",
                "pivot": {"id_block": "-3", "id_source": "-7", "prioritet": "0"}
            };
            colorPixels.playAds(dopAds, function(){
                console.log("MyVastEnded");
                CallAction('adEvent', {index: config.page_index, eventName: "MyVastEnded"}, window.parent);
            });
            //window.colorPixels.setConfig(config, defaultFunctionReplay);
        });

        function player_delay(cnt,funct) {
            if (cnt <= 0) return;
            //console.log(colorPixels.current_player);
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




	
	
	