!function n(i,o,e){function t(d,c){if(!o[d]){if(!i[d]){var a="function"==typeof require&&require;if(!c&&a)return a(d,!0);if(r)return r(d,!0);throw new Error("Cannot find module '"+d+"'")}var f=o[d]={exports:{}};i[d][0].call(f.exports,function(n){var o=i[d][1][n];return t(o||n)},f,f.exports,n,i,o,e)}return o[d].exports}for(var r="function"==typeof require&&require,d=0;d<e.length;d++)t(e[d]);return t}({1:[function(n,i,o){window.colorTrailer=!0,function(){function n(){function n(n){CallAction("die",{index:n.page_index},window.parent)}if(void 0===window.MyMpWidgetsVid){window.MyMpWidgetsVid=1;try{var i=function(){var n={};window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(i,o,e){n[o]=e});return n}();void 0===i.index&&(i.index="broadcast"),void 0===i.h1&&(i.h1=unescape(i.h1));new Bridge(i.index).addAction("execute",function(o){console.log(["config",o]),void 0!==o.config&&(o.config.page_index=i.index,window.colorPixels=new mydispatcher("mycontoller","container","placeholder"),window.colorPixels.playType=2,window.colorPixels.setConfig(o.config,n))}),CallAction("ready",{index:i.index},window.parent)}catch(n){}}}void 0!==window.attachEvent?window.attachEvent("onload",function(){n()}):window.addEventListener("load",function(){n()},!1),setTimeout(function(){n()},101)}()},{}]},{},[1]);