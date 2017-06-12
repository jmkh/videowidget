'use strict';
var FrameVPAIDInterface = require('./../models/FrameVPAIDInterface');
window.getVPAIDAd = function(){
return new FrameVPAIDInterface();
}
