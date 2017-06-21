'use strict'
var mydispatcher= require('./../models/dispatcher');
var Configurator = require('./../models/configurator');
var BridgeLib = require('./../models/iFrameBridge');
window.Bridge=BridgeLib.Bridge;
window.CallAction=BridgeLib.callAction;
function getClientDomain(){
var fromUrl = (window.location != window.parent.location) ? document.referrer : document.location.href;
var matches = fromUrl.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    var hostname = matches && matches[1];  // domain will be null if no match is found
//var hostname = (new URL(fromUrl)).hostname;
return hostname;
};
	function defaultFunctionReplay(config){
	//alert("exit");
	//	console.log("почти конец");
		window.colorPixels.playDefault(function(){
			//console.log("еще немного");
			window.colorPixels.playTvigle(function(){
				//console.log("еще чуть-чуть");
				window.colorPixels.playTrailer(function(){
					console.log("всё.",config.page_index);

					CallAction('die',{index:config.page_index},window.parent);
					//CallAction('die',{index:"broadcast"},window.parent);
					//window.parent.postMessage({die:1},"*");
				});


			});
		});

    return;
	}
   function parseConfig() 
    {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) 
	{
      vars[key] = value;
    });
    return vars;
    };
	var c_data=parseConfig();
    if(typeof c_data.affiliate_id=='undefined')
	{
	c_data.index='broadcast';
		c_data={pid:"20",affiliate_id:"56015401b3da9",h1:"IPHONE 7"};
	}
	//c_data={pid:"20",affiliate_id:"56015401b3da9",h1:"IPHONE 7"};
	var clientDomain=getClientDomain();
	
		new Configurator({
        auth: {affiliate_id: c_data.affiliate_id, pid:c_data.pid,host:clientDomain}, successFn: function (config) {
				config.page_index=c_data.index;
				if(c_data.hasOwnProperty("site") && c_data.site){
				config.site=c_data.site;
				}
				CallAction('resize',{index:config.page_index,config:config},window.parent);
		 window.colorPixels = new mydispatcher("mycontoller","container","placeholder");
		 window.colorPixels.playType=1;
		 window.colorPixels.timerToClose=90; 
		 window.colorPixels.timerToCloseFn();
	     window.colorPixels.setConfig(config,defaultFunctionReplay);
        }
    });
	
	
	