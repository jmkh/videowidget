/**
 * Created by admin on 07.03.17.
 */
var ajax = require('./httpclient').ajax;
var videojs=require('video.js');
var videoYT=require('videojs-youtube');
var styles=[
    '//apptoday.ru/overlay/node_modules/video.js/dist/video-js.min.css',
    '//video2.market-place.su/video/css/mp-player.css'
];
function loadCss(link){
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('link');
    style.href=link;
    style.rel="stylesheet";
    head.appendChild(style);
}
for(var i=0;i<styles.length;i++){
    loadCss(styles[i]);
}

function VideoApi(config) {
    this.config = {
        cols: 1,
        rows: 1,
        width: 200,
        height: 200,
        block_size: {
            width: 200,
            height: 200
        },
        auth: {
            affiliate_id: '',
            pid: ''
        },
        container: "#container2",
        limit: 1,

    };
    var self=this;
    this.blocks=[];
    function parseConfig(conf){
        for(var i in conf){
            if(conf.hasOwnProperty(i)){
                self.config[i]=conf[i];
            }
        }
        self.config.limit = self.config.cols * self.config.rows;
        self.config.block_size.width = self.config.width / self.config.cols;
        self.config.block_size.height = ((self.config.height - 20) / self.config.rows);
        self.container.style.width = self.config.width + "px";
        self.container.style.height = self.config.height + "px";

    }

    this.container = document.querySelector(this.config.container);
    parseConfig(config);
    this.searchYouTube= function (text, callback) {
        var mp_widget_domain='video.market-place.su';
        mp_widget_domain='video2.market-place.su';
        var text = text || "nokia";
        var callback = callback || function () {
            };

        var config =self.config;
        var params = {q: text, count: config.limit, affiliate_id: config.affiliate_id, pid: config.pid};
        var src = "https://"+mp_widget_domain+"/videoapi/search";
        ajax(src,{method: "GET", data:params,successFn: function (result) {
            var data =result;
            callback(result)
        }});
    };
    this.onFirstPlay = function () {
        //console.log("track_First")
    };
    this.playAds=function(player){
        //alert(typeof self.execCallback);
        self.execCallback(function(){
            player.play();
            self.container.style.display="block";
            console.log("")

        });
        //window.setTimeout(,5000)
    };
    this.onPlay = function (player) {
        for (var i in self.blocks) {

            if (player.mp_player_id != self.blocks[i].mp_player_id)
                self.blocks[i].hide()
        }
        player.dimensions(self.config.width, self.config.height - 20);
        if(typeof  window.myppp=="undefined") {
            self.playAds(player);

            player.pause();
            //self.container.style.display="none";
            window.myppp=player;
        }


    };
    this.onPause = function (player) {
        return;
        for (var i in self.blocks) {

            if (player.mp_player_id != self.blocks[i].mp_player_id)
                self.blocks[i].show();
        }
        //player.dimensions(self.config.width, self.config.height - 20)
        player.dimensions(self.config.block_size.width, self.config.block_size.height);

    };
    this.onEnded = function (player) {
        player.dimensions(self.config.block_size.width, self.config.block_size.height);
        for (var i in self.blocks) {
            if (player.mp_player_id != self.blocks[i].mp_player_id)
                self.blocks[i].show();
        }
    };
    this.renderJsVideoPlayer=function (url, container, size) {
    container=container||self.container;
        size=size||self.config.block_size;
    var player_id = "mp_video_player" + Math.random().toString(36).substr(6);
    var v = document.createElement('video');
    v.id = player_id;
    v.className = "video-js vjs-default-skin mp-video-block";
    v.style.display = "inline-block";
    container.appendChild(v);
    //var YaWidget=self.getYandexWidget();
    var vid1 = videojs(v, {"techOrder": ["html5", "flash", "youtube"],
        },
        function () {
            var player = this;

            this.on('firstplay', function (e) {
                //console.log('firstplay');

                self.onFirstPlay(player);
            });
            this.on('play', function () {
                //console.log('firstplay');
                self.onPlay(player);
            });
            this.on('ended', function () {
                //console.log('firstplay');
                self.onEnded(player);
            });
            this.on('pause', function () {
                //console.log('firstplay');
                self.onPause(player);
            });
        });

    vid1.src([{src: url, type: 'video/youtube'}]);
    vid1.controls(true);
    vid1.preload(true);
    vid1.dimensions(size.width, size.height);
    vid1.mp_player_id = player_id;
        self.blocks[player_id]=vid1;
        return vid1;

}
    function copyright() {
        var copyright = document.createElement('div');
        copyright.className = "mp-widget-copyright";
        copyright.style.borderBottom = "1px solid #333";
        copyright.style.backgroundColor = "rgba(255,255,188,0.1)";
        copyright.style.textAlign = "right";
        copyright.style.paddingRight = "10px";

        self.container.className = 'mp-video-widget-container';
        self.container.appendChild(copyright);

        var youtubeSrc = "<a target='_blank' rel='nofollow' class='mp-widget-copyright mp-copy-src'  href='//youtube.com'  >видео предоставлено YouTube </a>";
        copyright.innerHTML = youtubeSrc + "<a target='_blank' class='mp-widget-copyright mp-own-src' rel='nofollow' href='//partner.market-place.su' >Market-Place рекомендует</a>";
        self.container.style.border = "3px solid #333";
        self.container.style.borderRadius = "5px";
    }
    copyright();

};
var ContextVideo={

};
module.exports=VideoApi;