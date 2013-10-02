/*
 * Returns a view containing a Ti.UI.mediaPlayer
 * and matching control views.
 *
 * mediaplayer expects a url, either to remote
 * media or locally downloaded media.
 */

var MediaPlayerView = function(url){

    // Make sure mediaplayer recieved a url
    if( url == undefined ){
        Ti.API.error('Mediaplayer recieved no url');
    }


    // Create the containing mediaPlayer view
    var self = Ti.UI.createView({
        layout: 'vertical'
    });

    // Play / Pause
    var playPauseButton = Ti.UI.createButton({
        title: 'play / Pause'
    });
    self.add(playPauseButton);

    // Add actions to playPauseButton
    playPauseButton.addEventListener('click', function(){

        // if playing pause, else play
        if(mediaPlayer.playing){
            mediaPlayer.pause();
            Ti.API.debug('Pressed pause');
        } else {
            mediaPlayer.play();
            Ti.API.debug('Pressed play');
        }
    });

    // Create the player
    var mediaPlayer = Ti.Media.createAudioPlayer({
        allowBackground: true,
        url: url
    });

    // Add events to track progress
    mediaPlayer.addEventListener('progress', function(e){
        Ti.API.info('Time played: ' + Math.round(e.progress) + ' ms');
    });

    Ti.API.info('Media at ' + url);

    return self;
};

module.exports = MediaPlayerView;

