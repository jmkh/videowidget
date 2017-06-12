/**
 * Created by admin on 31.03.17.
 */
var CookieDriver = require('./CookieDriver');
function VideoSlot(slot,dispatcher) {

    this.slot = slot || document.querySelector('#videoslot');
    this.slot.style.position="absolute";
    this.slot.style.top="0";
    this.slot.style.left="0";
    this.slot.style.width="100%";
    this.slot.style.height="100%";
    this.slot.style.zIndex=-1;
    this.tick=function(){}; //
    this.player=null;
    //this.config=dispatcher.config;
    this.dispatcher=dispatcher;
    var userid=CookieDriver.getUserID();
    var myPlayerSettings = CookieDriver.getObject(userid);
    if(!myPlayerSettings){
        myPlayerSettings={mute:false,tvo:0.2,vo:0.7};
    }
    this.plSettings=myPlayerSettings;
}
VideoSlot.prototype.clear = function () {
    this.slot.innerHTML = '';
    this.slot.style.display='none';
    this.slot.style.zIndex=-1;
};


VideoSlot.prototype.renderControl = function (type,args) {

    switch (type){
        case "timeoutEl":
            var ss=parseInt(args.dur)-parseInt(args.sec);
            ss=(ss>0)?ss:0;
            var txt="<span class='innerSpan'>Реклама: "+
                (ss);
            if(args.showControls&&(args.skipTime>0)) {
                txt+="  Пропустить через: "+	((args.skipTime>0)?args.skipTime:0);
            }
            txt+=" </span>";
            return txt;


            break;
        case "advLink":
            return "<span class='innerSpan' >"+args+ "</span>";

        case "skipAd":
            return "<span class='innerSpan'>Пропустить </span>";
        case "closeAd":
            return "<span class='innerSpan'> </span>";
        case "muteButton":
            return "<span class='innerSpan "+(args?"un":"")+"mute'> </span>";
        default:
            return "";
    }

};


VideoSlot.prototype.init = function (player) {

    var self=this;
    self.clear();
    self.slot.style.zIndex=999;
    self.player=player;
    //self.player.adVolume=self.config.volume;

    self.player.adVolume= self.plSettings.mute?0.0:self.dispatcher.config.volume;
   console.log(self);
    self.Extentions={
        linkTxt:"Перейти на сайт рекламодателя",
        isClickable:1,
        controls:0,
        skipTime:"00:10",
        skipTime2:"00:05",
        skipAd:[],
        addClick:[]


    };
    self.player.vast.map('ads[0].extensions', function(extension){

        if(extension.type=="linkTxt" && extension.value){
            self.Extentions.linkTxt=extension.value.replace(/^\s+|\s+$/,'');
        }
        if(extension.type=="isClickable" && extension.value){
            self.Extentions.isClickable=extension.value.replace(/^\s+|\s+$/,'');
        }
        if(extension.type=="controls" && extension.value){
            self.Extentions.controls=extension.value.replace(/^\s+|\s+$/,'');
        }
        if(extension.type=="skipTime" && extension.value){
            //   console.log(['двандва',extension]);
            self.Extentions.skipTime=extension.value.replace(/^\s+|\s+$/,'');
        }
        if(extension.type=="skipTime2" && extension.value){
            //console.log(['двантри',extension]);
            self.Extentions.skipTime2=extension.value.replace(/^\s+|\s+$/,'');
        }
        if(extension.type=="skipAd" && extension.value){
            self.Extentions.skipAd.push(extension.value.replace(/^\s+|\s+$/,''));
        }
        if(extension.type=="addClick" && extension.value){
            self.Extentions.addClick.push(extension.value.replace(/^\s+|\s+$/,''));
        }
    });
    self.drawControls();
    self.clickable.onclick=function(){
        self.ConrolePaused(self.Extentions.isClickable);

    };
    self.player.on('AdRemainingTimeChange',function(args) {
        self.ControllerAction(args);
    });
    this.slot.style.display='block';
};


VideoSlot.prototype.drawControls=function() {
    var self=this;

    //clickable
    self.clickable=document.createElement("DIV");
    self.clickable.setAttribute("id","clickable");
    //self.clickable.style.width=self.config.width+"px";
    //self.clickable.style.height=self.config.height+"px";
     self.clickable.style.width="100%";
    self.clickable.style.height="100%";
    self.clickable.style.border="1px solid #000000";
    self.clickable.style.position="absolute";
    self.clickable.style.top="0";
    self.clickable.style.left="0";
    self.clickable.style.cursor="pointer";
    self.clickable.style.zIndex=1000;
    self.slot.appendChild(self.clickable);
    //pause
    self.resumeButton=document.createElement("DIV");
    self.resumeButton.style.zIndex=1003;
    self.resumeButton.style.color="#FFFFFF";
    self.resumeButton.style.width="100%";
    self.resumeButton.style.height="100%";
    self.resumeButton.style.cursor="pointer";
    self.resumeButton.style.display="none";
    self.resumeButton.className="resume-play";
    self.clickable.appendChild(self.resumeButton);
    //timeoutDiv
    var timeoutDiv=document.createElement('div');
    timeoutDiv.id="timeoutDiv";
    self.player.timeoutDiv=timeoutDiv;
    self.slot.appendChild(timeoutDiv);

    //closeDiv
    var closeDiv=document.createElement('div');
    closeDiv.id="closeDiv";
    self.player.closeDiv=closeDiv;
    self.slot.appendChild(closeDiv);
    closeDiv.innerHTML=self.renderControl("closeAd");
    closeDiv.style.display='none';
    closeDiv.onclick=function(e){
        e.preventDefault();
        self.player.emit('close');

        //for(var i =0;i<skipAd.length;i++){
        //	new Image().src = skipAd[i];
        //}
        self.player.stopAd();


    };

    //skipDiv
    var skipDiv=document.createElement('div');
    self.player.skipDiv=skipDiv;
    skipDiv.id="skipDiv";
    self.slot.appendChild(skipDiv);
    skipDiv.innerHTML=self.renderControl("skipAd");
    skipDiv.style.display='none';
    skipDiv.onclick=function(e){
        e.preventDefault();
        self.player.emit('skip');

        for(var i =0;i<self.Extentions.skipAd.length;i++){
            new Image().src = self.Extentions.skipAd[i];
        }
        self.player.stopAd();


    };



    //advLink
    var advLink=document.createElement('div');
    advLink.id="advLink";
    self.player.advLink=advLink;
    self.slot.appendChild(advLink);
    advLink.innerHTML=self.renderControl("advLink",decodeURIComponent(self.Extentions.linkTxt));
    var clickThrough = self.player.vast.get('ads[0].creatives[0].videoClicks.clickThrough');
    if(!clickThrough){
        advLink.style.display='none';
    }

    advLink.onclick=function(e){
        e.preventDefault();
        for(var i =0;i<self.Extentions.addClick.length;i++){
            new Image().src = self.Extentions.addClick[i];
        }


        self.ConrolePaused(1);
    };
    //return;
    //muteButton
    var muteButton=document.createElement('div');
    muteButton.id="muteButton";
    muteButton.style.border="1px solid red";
    muteButton.style.zIndex=9999;
    muteButton.style.position='absolute';
    self.player.muteButton=muteButton;
    self.slot.appendChild(muteButton);
    muteButton.innerHTML=self.renderControl("muteButton",self.player.adVolume);
    muteButton.onclick=function(e){
        e.preventDefault();
        //e.preventBubble();
        //consoleLog([1234321,e.preventDefault])

        self.player.adVolume=self.player.adVolume?0.0:self.dispatcher.config.volume;
        var userid=CookieDriver.getUserID();
        if(!self.player.adVolume)self.plSettings.mute = true;else{
            self.plSettings.mute=false;
        }
        CookieDriver.saveObject(self.plSettings,userid);


        self.player.muteButton.innerHTML=self.renderControl('muteButton',self.player.adVolume);
        return false;
    }



};


VideoSlot.prototype.ControllerAction=function(args){

    var self=this;
    if(typeof self.player.timeoutDiv=="undefined"){
        return;
    }
    var skipTimeInt=(parseInt(self.Extentions.skipTime.split(":")[0])*60+parseInt(self.Extentions.skipTime.split(":")[1]) )%parseInt(args.dur);
    var skipTimeInt2=(parseInt(self.Extentions.skipTime2.split(":")[0])*60+parseInt(self.Extentions.skipTime2.split(":")[1]))%parseInt(args.dur);
    if(skipTimeInt>skipTimeInt2){
        skipTimeInt=skipTimeInt2;
    }
    var showCLose=(skipTimeInt2<=parseInt(args.sec)&&skipTimeInt2>0);
    var showSkip=(skipTimeInt<=parseInt(args.sec)&&skipTimeInt>0);
    args.skipTime=skipTimeInt-parseInt(args.sec);
    args.showControls=(self.Extentions.controls=="1");
    var txt=self.renderControl("timeoutEl",args);
    self.player.timeoutDiv.innerHTML=txt;

    //показываем контролы, если надо

    if(self.Extentions.controls=="1"&&showCLose){
        //consoleLog([668,'Настало твоё время']);
        self.player.closeDiv.style.display='block';
    }
    if(self.Extentions.controls=="1"&&showSkip){
        //consoleLog([668,'Настало твоё время']);
        self.player.skipDiv.style.display='block';
    }


    //console.log([-2,args]);
};


VideoSlot.prototype.ConrolePaused = function ConrolePaused(isClickable)
{
    //this.player.emit('AdClickThru',null, null, true);
    if(!this.player.isPaused){
        this.player.isPaused=1;
        this.player.pauseAd();
        if(typeof this.resumeButton)
         this.resumeButton.style.display="block";
		 var clickEventThrough = this.player.vast.get('ads[0].creatives[0].videoClicks.clickTrackings');
		 for (var i=0,j=clickEventThrough.length;i<j;i++){
		  var imgSrc=clickEventThrough[i].replace(/^\s+|\s+$/,'');
		  if(imgSrc){
		   new Image().src =imgSrc;
		  }
		  
		 }
		
		 
        this.player.emit('clickThrough');
        var clickThrough = this.player.vast.get('ads[0].creatives[0].videoClicks.clickThrough');
        //alert(clickThrough);
        var playerHandles=isClickable;
        //if(!this.player.isClicked){
        //this.player.isClicked=1;
        if (playerHandles && clickThrough) {
            window.open(clickThrough);
        }
        //}

    }else{
        if(typeof this.resumeButton!='undefined')
            this.resumeButton.style.display="none";
        this.player.isPaused=0;
        this.player.resumeAd();
    }
};
module.exports = VideoSlot;