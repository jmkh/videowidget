'use strict';
function VPAIDEvent(type, data){
        this.type = type;
        this.data = data;
}
	VPAIDEvent.convertToVAST = function(name) {
        return {
                AdLoaded:               VideoEvent.AD_READY,
                AdVolumeChange:         VideoEvent.AD_VOLUME_CHANGE,
                AdError:                VideoEvent.AD_ERROR,
                AdStarted:              VideoEvent.AD_START,
                AdImpression:           VideoEvent.AD_IMPRESSION,
                AdStopped:              VideoEvent.AD_STOP,
                AdPaused:               VideoEvent.AD_PAUSE,
                AdPlaying:              VideoEvent.AD_RESUME,
                AdVideoStart:           VideoEvent.VIDEO_START,
                AdVideoFirstQuartile:   VideoEvent.VIDEO_FIRST_QUARTILE,
                AdVideoMidpoint:        VideoEvent.VIDEO_MIDPOINT,
                AdVideoThirdQuartile:   VideoEvent.VIDEO_THIRD_QUARTILE,
                AdVideoComplete:        VideoEvent.VIDEO_COMPLETE,
                AdUserClose:            VideoEvent.USER_CLOSE,
                AdSkipped:              VideoEvent.USER_SKIP,
                AdUserAcceptInvitation: VideoEvent.USER_ACCEPT_INVENTATION,
                AdInteraction:          VideoEvent.USER_INTERACTION,
                AdClickThru:            VideoEvent.USER_CLICK
            }[name] || "";
    };
	VPAIDEvent.convertFromVAST = function(name) {
        return {
                ready:                  VPAIDEvent.AdLoaded,
                volumeChange:           VPAIDEvent.AdVolumeChange,
                error:                  VPAIDEvent.AdError,
                creativeView:           VPAIDEvent.AdStarted,
                impression:             VPAIDEvent.AdImpression,
                stop:                   VPAIDEvent.AdStopped,
                pause:                  VPAIDEvent.AdPaused,
                resume:                 VPAIDEvent.AdPlaying,
                start:                  VPAIDEvent.AdVideoStart,
                firstQuartile:          VPAIDEvent.AdVideoFirstQuartile,
                midpoint:               VPAIDEvent.AdVideoMidpoint,
                thirdQuartile:          VPAIDEvent.AdVideoThirdQuartile,
                complete:               VPAIDEvent.AdVideoComplete,
                closeLinear:            VPAIDEvent.AdUserClose,
                skip:                   VPAIDEvent.AdSkipped,
                acceptInvitation:       VPAIDEvent.AdUserAcceptInvitation,
                interaction:            VPAIDEvent.AdInteraction,
                click:                  VPAIDEvent.AdClickThru
            }[name] || "";
    };
    VPAIDEvent.AdLoaded = "AdLoaded";
    VPAIDEvent.AdStarted = "AdStarted";
    VPAIDEvent.AdStopped = "AdStopped";
    VPAIDEvent.AdSkipped = "AdSkipped";
    VPAIDEvent.AdLinearChange = "AdLinearChange";
    VPAIDEvent.AdSizeChange = "AdSizeChange";
    VPAIDEvent.AdExpandedChange = "AdExpandedChange";
    VPAIDEvent.AdSkippableStateChange = "AdSkippableStateChange";
    VPAIDEvent.AdRemainingTimeChange = "AdRemainingTimeChange";
    VPAIDEvent.AdDurationChange = "AdDurationChange";
    VPAIDEvent.AdVolumeChange = "AdVolumeChange";
    VPAIDEvent.AdImpression = "AdImpression";
    VPAIDEvent.AdVideoStart = "AdVideoStart";
    VPAIDEvent.AdVideoFirstQuartile = "AdVideoFirstQuartile";
    VPAIDEvent.AdVideoMidpoint = "AdVideoMidpoint";
    VPAIDEvent.AdVideoThirdQuartile = "AdVideoThirdQuartile";
    VPAIDEvent.AdVideoComplete = "AdVideoComplete";
    VPAIDEvent.AdClickThru = "AdClickThru";
    VPAIDEvent.AdInteraction = "AdInteraction";
    VPAIDEvent.AdUserAcceptInvitation = "AdUserAcceptInvitation";
    VPAIDEvent.AdUserMinimize = "AdUserMinimize";
    VPAIDEvent.AdUserClose = "AdUserClose";
    VPAIDEvent.AdPaused = "AdPaused";
    VPAIDEvent.AdPlaying = "AdPlaying";
    VPAIDEvent.AdLog = "AdLog";
    VPAIDEvent.AdError = "AdError";
module.exports = VPAIDEvent;