window.colorTrailer = true; 
(function() {

    function loadAssinc(){
		  if(typeof window.MyMpWidgetsVid=='undefined'){
		
		  }else{
		  return;
		  }
	window.MyMpWidgetsVid=1;
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
	if(typeof c_data.pid=='undefined')
	{
	    c_data={pid:"20",affiliate_id:"56015401b3da9",h1:"IPHONE 7"}; 
	}
	else
	{
		c_data.h1=unescape(c_data.h1); 
	} 
	 var config=new Configurator({auth:{affiliate_id:c_data.affiliate_id,pid:c_data.pid},successFn:function(config){
	 window.colorPixels = new mydispatcher("mycontoller","container","placeholder");
	 window.colorPixels.playType=1;
	    setTimeout(function () {
            window.colorPixels.AllowedStart=1;
        }, 10000);
	 window.colorPixels.setConfig(config,function(){
	 return;
	 console.log(["кольбэк если надо"]);
		 var container=document.querySelector('#container');
		 var controller=document.querySelector('#mycontoller');
		 var placeholder=document.querySelector('#placeholder');
		 placeholder.style.display='none';

		 container.style.opacity=1;
		 controller.style.display='block';
		 window.colorPixels.playTvigle({callback:function(){
		 console.log('вышел в лес');
		 window.parent.postMessage({die:1},"*");
		 }});
         /*
		 var yplayer= new YouTubePlayer({height:"100%",width:"100%",autoplay:true,container:"container"});
		 //alert('This is CallBack!!!');
		 //alert(yplayer);
		 yplayer.setVolume(0);
		 var done = false;
		 yplayer.on('statechange',function(event){
			 		console.log(event);
				 if (event.data == YT.PlayerState.ENDED && !done) {
					 console.log(event);
					 window.parent.postMessage({die:1},"*");
					 done = true;
				 }


		 });
         */
	 }); 
     }});
    }


	if (typeof window.attachEvent!='undefined')
        window.attachEvent('onload', function(){loadAssinc();});
     else
        window.addEventListener('load', function(){loadAssinc();}, false);
	 setTimeout( // если страница не заканчивается
     function(){
     loadAssinc();
     },
     101);
})(); 