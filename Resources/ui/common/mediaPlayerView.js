/*
 * Returns a view containing a Ti.UI.mediaPlayer
 * and matching control views.
 *
 * mediaplayer expects a url, either to remote
 * media or locally downloaded media.
 */

var MediaPlayerView = function(){


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
            Ti.API.debug('mediaPlayerView:44 | started playing media at: ' + mediaPlayer.url);

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
        allowBackground: true
    });

    // Function to update mediaPath for audioPlayer
    self.setMediaPath = function(mediaURL){
        if(mediaPlayer == undefined){
            Ti.API.error('No media player defined');
        }
        mediaPlayer.setUrl(mediaURL);
    };


    // Add events to track progress
    mediaPlayer.addEventListener('progress', function(e){
        Ti.API.debug('Time played: ' + Math.round(e.progress) + ' ms');
    });

    return self;
};

module.exports = MediaPlayerView;

