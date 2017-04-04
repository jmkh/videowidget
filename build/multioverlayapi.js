(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.colorTrailer = true; 
(function() {
    function async_load(z,args){

	      if(typeof window.MyMpWidgetsV=='undefined'){
		
		  }else{
		  return;
		  }
		  
    window.MyMpWidgetsV=1; 

    function myOnError(msg, url, lno) {
    //return true;
    }
	
	//window.colorPixels.start();
	try{
	
	function defaultFunctionReplay(config){
	//console.log([400,config]);
		//console.log("--------как бы умер-------");
	CallAction('die',{index:config.page_index},window.parent);
    return;
	
	//window.colorPixels.overTvigle(); 

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
	 
	 console.log(['config',data]);
   
	 if(typeof data.config !="undefined"){
	 data.config.page_index=c_data.index;
	 //window.colorPixels = new multiDispatcher();
		 window.colorPixels = new multiDispatcher("mycontoller","container","placeholder");
		 window.colorPixels.playType=1;
	 window.colorPixels.setConfig(data.config,defaultFunctionReplay);
     }
   
   

     });

	}catch(e){
	console.log(e.message);
	}finally {
	} 
    }
    var id="test";
	var myArgs={};
	 if (typeof window.attachEvent!='undefined')
        window.attachEvent('onload', function(){async_load(id,myArgs);});
     else
        window.addEventListener('load', function(){async_load(id,myArgs);}, false);
	 setTimeout( // если страница не заканчивается
     function(){
     async_load(id,myArgs);
     },
     5);

})(); 

},{}]},{},[1])