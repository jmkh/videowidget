
(function () {
    function async_load(config) {
        if (typeof window.MyMpOverlayWidgetsV == 'undefined') {

        } else {
            return;
        }

        window.MyMpOverlayWidgetsV = 1;

        function myOnError(msg, url, lno) {
            //return true;
        }
        try {
            var psrc="//www.apptoday.ru/autogit/autostop/build/overlay.js";
            var s=document.createElement("script");
            s.src=psrc;
            document.body.appendChild(s);
            s.onload=function(){
                var overplay=new  MpOverPlayLib(config);
            };

        } catch (e) {
            console.log(e.message);
        } finally {
        }
    }
    function CreateOverplayWidget(config){
    if (typeof window.attachEvent != 'undefined')
        window.attachEvent('onload', function () {
            async_load(config);
        });
    else
        window.addEventListener('load', function () {
            async_load(config);
        }, false);
    setTimeout( // если страница не заканчивается
        function () {
            async_load(config);
        },
        5);
    }
    window.CreateOverplayWidget=CreateOverplayWidget;

})(); 
