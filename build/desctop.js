(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.colorTrailer = true; 

(function() {

    function loadAssinc(){
		  if(typeof window.MyMpWidgetsVid=='undefined'){
		
		  }else{
		  return;
		  }
	window.MyMpWidgetsVid=1;
	try{
	
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
		//
	}
	
	//c_data={pid:"20",affiliate_id:"56015401b3da9",h1:"IPHONE 7",index:c_data.index}; 
	
	 if(typeof c_data.h1=='undefined')
	 c_data.h1=unescape(c_data.h1); 
     var bridge=new Bridge(c_data.index);
	 bridge.addAction("execute",function(data){
	 //alert('ios ini');
	
	// console.log(['config',data.index]);
   
	 if(typeof data.config !="undefined"){
	 data.config.page_index=c_data.index;
	 
	 if(c_data.hasOwnProperty("testframe")){
	 data.config.testframe=1;
	 console.log(["c_data --->",data.config]);
	 }
		 window.colorPixels = new mydispatcher("mycontoller","container","placeholder");
		 window.colorPixels.playType=1;
	 window.colorPixels.setConfig(data.config,defaultFunctionReplay);
	 
     }
	 
     });
    
    CallAction('ready',{index:c_data.index},window.parent);
	 
	 
	 /*
	 
	 var config=new Configurator({auth:{affiliate_id:c_data.affiliate_id,pid:c_data.pid},successFn:function(config){
	 window.colorPixels = new mydispatcher("mycontoller","container","placeholder");
	 window.colorPixels.playType=1;
	    setTimeout(function () {
            window.colorPixels.AllowedStart=1;
        }, 10000);
	 window.colorPixels.setConfig(config,function(){
	 return;
	 console.log(["������� ���� ����"]);
		 var container=document.querySelector('#container');
		 var controller=document.querySelector('#mycontoller');
		 var placeholder=document.querySelector('#placeholder');
		 placeholder.style.display='none';

		 container.style.opacity=1;
		 controller.style.display='block';
		 window.colorPixels.playTvigle({callback:function(){
		 console.log('����� � ���');
		 window.parent.postMessage({die:1},"*");
		 }});

	 }); 
     }});
	 */
	 }catch(e){
	 }
    }


	if (typeof window.attachEvent!='undefined')
        window.attachEvent('onload', function(){loadAssinc();});
     else
        window.addEventListener('load', function(){loadAssinc();}, false);
	 setTimeout( // ���� �������� �� �������������
     function(){
     loadAssinc();
     },
     101);
})(); 
},{}]},{},[1])