'use strict';
/**
 * Created by mambrin on 28.03.17.
 */
var mydispatcher= require('./../models/dispatcher');
var Configurator = require('./../models/configurator');
var BridgeLib = require('./../models/iFrameBridge');
window.Bridge=BridgeLib.Bridge;
window.CallAction=BridgeLib.callAction;
	function defaultFunctionReplay(config){
	CallAction('die',{index:config.page_index},window.parent);
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
    if(typeof c_data.index=='undefined')
	{
	c_data.index='broadcast';
		//c_data={pid:"20",affiliate_id:"56015401b3da9",h1:"IPHONE 7"}; 
	}
	 var bridge=new Bridge(c_data.index);
	 bridge.addAction("execute",function(data){
	 console.log(['config --',data]);
     if(typeof data.config !="undefined"){
	     data.config.page_index=c_data.index;
		 window.colorPixels = new mydispatcher("mycontoller","container","placeholder");
		 window.colorPixels.playType=1;
		 window.colorPixels.timerToClose=10;
		 //this.timerToCloseFn();
	 window.colorPixels.setConfig(data.config,defaultFunctionReplay);
     }else{
	 defaultFunctionReplay();
	 }
     });	
	 
	 CallAction('ready',{index:c_data.index},window.parent);
	 console.log([222,bridge]);