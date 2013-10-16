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
        top: '4dp',
        layout: 'horizontal'
        //height: '84dp'
    });

    // Create view to contain playback buttons
    var playbackButtonsView = Ti.UI.createView({
        layout: 'horizontal',
        top: '4dp',
        left: '136dp'
    });
    self.add(playbackButtonsView);

    // Play / Pause
    var playPauseButton = Ti.UI.createImageView({
        image: '/images/Play.png',
        height: '48dp',
        width: '48dp'
    });
    playbackButtonsView.add(playPauseButton);

    // Add progressbar
    //var progressBar = Ti.UI.createProgressBar({
    //    top: '4dp',
    //    width: '240dp',
    //    height: '2dp',
    //    min: 0,
    //    max: 100,
    //    value: 0,
    //    color: '#333',
    //    style: Ti.UI.iPhone.ProgressBarStyle.PLAIN
    //});
    //self.add(progressBar);
    //progressBar.show();
    
    //var pb=Titanium.UI.createProgressBar({
    //    top:10,
    //    width:250,
    //    height:'auto',
    //    min:0,
    //    max:10,
    //    value:0,
    //    color:'#fff',
    //    message:'Downloading 0 of 10',
    //    font:{fontSize:14, fontWeight:'bold'},
    //    style:Titanium.UI.iPhone.ProgressBarStyle.PLAIN
    //});
    //self.add(pb);
    //pb.show();

    // Add actions to playPauseButton
    playPauseButton.addEventListener('click', playMedia);

    function playMedia(){

        if(mediaPlayer.playing){
            // if playing pause
            mediaPlayer.pause();
            playPauseButton.image = '/images/Play.png';
            Ti.API.debug('[mediaPlayerView:51] Pressed pause');
        } else if(mediaPlayer.paused){
            // If paused, play
            mediaPlayer.play();
            playPauseButton.image = '/images/Pause.png';
            Ti.API.debug('[mediaPlayerView:56] Pressed play');

        } else {

            // Add current episode to nowPlaying
            Ti.App.Properties.setString(
                'nowPlayingEpisodeTitle',
                this.episodeTitle);
            alert('setting playing episode to ' + this.episodeTitle);

            // If neither playing, nor paused,
            // start playing, and add stop button
            mediaPlayer.play();
            playPauseButton.image = '/images/Pause.png';
            Ti.API.debug('[mediaPlayerView.js:44] | started playing media at: ' + 
                mediaPlayer.url);

            // And add the stop button
            var stopButton = Ti.UI.createImageView({
                image: '/images/Stop.png',
                height: '48dp',
                width: '48dp'
            });
            playbackButtonsView.add(stopButton);

            // Add action to stopButton
            stopButton.addEventListener('click', function(){

                // We can only stop if playing,
                // so remove the stopbutton
                playbackButtonsView.remove(stopButton);

                // We can not pause, but we can play
                playPauseButton.image = '/images/Play.png';

                // And stop playing
                mediaPlayer.stop();

                // If on android, audioPlayer needs to be released
                if( Ti.Platform.name == 'android' ){
                    mediaPlayer.release();
                }
            });

        }
    }

    // Set default media mode
    Ti.Media.defaultAudioSessionMode = Ti.Media.AUDIO_SESSION_MODE_PLAYBACK;

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

        // Also update the progressbar end value
    };


    // Add events to track progress
    mediaPlayer.addEventListener('progress', function(e){
        Ti.API.debug('[mediaPlayerView:118] Time played: ' + Math.round(e.progress) + ' ms');
    });

    return self;
};

module.exports = MediaPlayerView;

