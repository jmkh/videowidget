'use strict';
/**
 * Created by mambrin on 28.03.17.
 */
var mydispatcher= require('./../models/dispatcher');
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
	}
	 var bridge=new Bridge(c_data.index);
	 bridge.addAction("execute",function(data){
	
     if(typeof data.config !="undefined"){
	     data.config.page_index=c_data.index;
		  mydispatcher.prototype.firstPlaySignal = function () {
          if(this.OverplayDescFirst) return;
          this.OverplayDescFirst=1;
		  CallAction('startPlay',{index:c_data.index},window.parent);
          };
		  mydispatcher.prototype.timerToCloseFn= function () {
          if(this.timerToClose<0){
		   this.playExit();   
		   return;
             }
		  this.timerToClose--;
		  var self=this;
	       setTimeout(function(){
		   self.timerToCloseFn();
		   }, 1000);
          }
		 window.colorPixels = new mydispatcher("mycontoller","container","placeholder");
		 window.colorPixels.playType=1;
		 window.colorPixels.timerToClose=90; 
		 window.colorPixels.timerToCloseFn();
	 window.colorPixels.setConfig(data.config,defaultFunctionReplay);
     }else{
	 defaultFunctionReplay();
	 }
     });	
	 
	 CallAction('ready',{index:c_data.index},window.parent);
	