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
        layout: 'horizontal',
        height: '64dp'
    });

    // Play / Pause
    var playPauseButton = Ti.UI.createImageView({
        image: '/images/Play.png'
    });
    self.add(playPauseButton);

    // Add actions to playPauseButton
    playPauseButton.addEventListener('click', function(){

        if(mediaPlayer.playing){
            // if playing pause
            mediaPlayer.pause();
            playPauseButton.image = '/images/Play.png';
            Ti.API.debug('Pressed pause');
        } else if(mediaPlayer.paused){
            // If paused, play
            mediaPlayer.play();
            playPauseButton.image = '/images/Pause.png';
            Ti.API.debug('Pressed play');

        } else {

            // If neither playing, nor paused,
            // start playing, and add stop button
            mediaPlayer.play();
            playPauseButton.image = '/images/Pause.png';
            Ti.API.debug('Pressed play');

            // And add the stop button
            var stopButton = Ti.UI.createImageView({
                image: '/images/Stop.png'
            });
            self.add(stopButton);

            // Add action to stopButton
            stopButton.addEventListener('click', function(){
                mediaPlayer.stop();
                playPauseButton.image = '/images/Play.png';

                // If on android, audioPlayer needs to be released
                if( Ti.Platform.name == 'android' ){
                    mediaPlayer.release();
                }

                // We can only stop if playing,
                // so remove the stopbutton
                self.remove(stopButton);
            });

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

