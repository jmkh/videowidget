/**
 * Created by admin on 07.03.17.
 */
'use strict';
var ContextVideo = require('./../models/ContextVideo');
var Configurator = require('./../models/configurator');
var TextSearch = require('./../models/TextSearch');
var multiDispatcher = require('./../models/dispatcher');

function parseConfig() 
{
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) 
	{
      vars[key] = value;
    });
    return vars;
};

//console.log(videojs)
var searchResult=TextSearch.startSearch();
var text=null;
var model=null;

	var c_data=parseConfig();
	if(typeof c_data.pid=='undefined')
	{
		c_data={pid:"20",affiliate_id:"56015401b3da9",h1:"IPHONE 7"}; 
	}
	else
	{
		c_data.h1=unescape(c_data.h1);
	}

text=c_data.h1||"Sony";
var container=document.querySelector('#container2'); 
var config=new Configurator({auth:{affiliate_id:c_data.affiliate_id,pid:c_data.pid},successFn:function(config){
    var contextModule=new ContextVideo(config);

    contextModule.searchYouTube(text,function(res){
var links=JSON.parse(res);
    //var AdsPlayer = new multiDispatcher();
        window.colorPixels = new multiDispatcher("mycontoller","container","placeholder");
        var AdsPlayer= window.colorPixels;
contextModule.playAds=function(player){
    //alert(typeof self.execCallback);
    AdsPlayer.setConfig(config,function(){
        player.play();
        contextModule.container.style.display="block";
        console.log("exec play");

    });

    //window.setTimeout(,5000)
};


        for(var i=0;i<links.length;i++){
            contextModule.renderJsVideoPlayer(links[i],container);
        }});

}});
