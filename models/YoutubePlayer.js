/**
 * Created by admin on 04.04.17.
 */

var EventEmitter = require('events').EventEmitter;
function defaults(obj,defaults){
    var res={};
    obj=obj||{};
    for(var i in defaults ){
        if(defaults.hasOwnProperty(i)){
            res[i]=obj[i]||defaults[i];
        }
    }
    return res;
}
function inherits(ctor,superCtor){

    if (typeof Object.create === 'function') {
        // implementation from standard node.js 'util' module

        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });

    } else {

        ctor.super_ = superCtor;
        var TempCtor = function () {};
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;

    }
}
function YoutubePlayer(config__) {
    var config=defaults(config__,{
        container:"player",
        width:"550",
        height:"350",
        videoId:'Ug3ucX2hGBc',
        autoplay:false
    });

console.log(config)

    var tag = document.createElement('script');
    var self=this;
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    this.ready=false;
    var player;
    window.onYouTubeIframeAPIReady= function onYouTubeIframeAPIReady() {
        self.ready=true;
        player = new YT.Player(config.container, {
            height: config.height,
            width: config.width,
            videoId: config.videoId,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    function onPlayerReady(event) {
        self.emit('ready',event);
        if(config.autoplay){
            self.play();
        }

    }

    function onPlayerStateChange(event) {
        window.YT=YT;
        self.emit('statechange',{event:event});
    }
    this.stop=function () {
        if(!self.ready||typeof player=="undefined"||!player){
            self.once('ready',function(){
                self.stop();
            })
        }else{
            player.stopVideo();
        }

    }
    this.play=function(){
        if(!self.ready||typeof player=="undefined"||!player){
            self.once('ready',function(){
                self.play();
            })
        }else{
            player.playVideo();
        }

    };
    this.pause=function(){

        if(!self.ready||typeof player=="undefined"||!player){
            self.once('ready',function(){
                self.pause();
            })
        }else{
            player.pauseVideo();
        }
    }
    this.setVolume=function(volume){
        if(!self.ready||typeof player=="undefined"||!player){
            self.once('ready',function(){
                self.setVolume(volume);
            })
        }else{
            player.setVolume(volume);
        }

    }
}
inherits(YoutubePlayer, EventEmitter);
module.exports={player:YoutubePlayer};