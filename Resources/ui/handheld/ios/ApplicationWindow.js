function ApplicationWindow() {

    //
    // ** Load modules *************************************
    //

    //declare module dependencies
    var MasterView = require('ui/common/MasterView'),
        DetailView = require('ui/common/DetailView');

    //create object instance
    var self = Ti.UI.createWindow({
        backgroundColor:'#ffffff'
    });

    // Container for mediaPlayer object
    var mediaPlayer;

    //
    // ** Windows ******************************************
    //

    //construct UI
    var masterView = new MasterView(),
        detailView = new DetailView();

    //create master view container
    var masterContainerWindow = Ti.UI.createWindow({
        title: 'Kvack You!'
    });
    masterContainerWindow.add(masterView);

    //create detail view container
    var detailContainerWindow = Ti.UI.createWindow({
        title:'Avsnitt'
    });
    detailContainerWindow.add(detailView);

    // nowPlaying window
    var nowPlayingWin = Ti.UI.createWindow({
        modal: true,
        url: 'ui/common/nowPlayingWindow.js'
    });

    // Now playing button
    var nowPlayingButton = Ti.UI.createButton({
        title: 'Spelas nu'
    });

    //create iOS specific NavGroup UI
    var navGroup = Ti.UI.iPhone.createNavigationGroup({
        window:masterContainerWindow
    });
    self.add(navGroup);

    //
    // ** Behavior *****************************************
    //
    
    // check for nowPlaying
    //detailContainerWindow.addEventListener('close', function(e){
    masterContainerWindow.addEventListener('focus', function(e){
        Ti.API.debug('master has focus');
        // If we have a mediaPlayer object, then show 'nowPlaying' button
        if( mediaPlayer ){
            masterContainerWindow.rightNavButton = nowPlayingButton;
        }
    });

    // Close detailView
    detailView.addEventListener('closeDetailView', function(){
        detailContainerWindow.close();
    });

    // Open episode details
    masterView.addEventListener('itemSelected', function(e) {
        detailView.fireEvent('itemSelected',e);
        // Set title in detailContainerWindow
        detailContainerWindow.setTitle(e.title);
        //detailContainerWindow.setTitle(e.subtitle);
        navGroup.open(detailContainerWindow);
    });

    // Open nowPlaying window
    nowPlayingButton.addEventListener('click', function(){
        nowPlayingWin.open();
    });

    // Stop Playing
    nowPlayingWin.addEventListener('stopEpisode', stopEpisode);
    function stopEpisode(){
        Ti.API.info('stop episode');
        mediaPlayer.stop();
        if( Ti.Platform.name == 'android'){
            mediaPlayer.release();
        }
    }

    // Pause playing episode
    detailView.addEventListener('pauseEpisode', pauseEpisode);
    nowPlayingWin.addEventListener('pauseEpisode', pauseEpisode);
    function pauseEpisode(){
        Ti.API.info('pause episode');
        if( mediaPlayer.playing ){
            mediaPlayer.pause();
        }
    }

    // Start playing and open nowPlayingWindow
    detailView.addEventListener('playEpisode', playEpisode);
    nowPlayingWin.addEventListener('playEpisode', playEpisode);
    function playEpisode(e){

        Ti.API.info('Play episode');

        // First get the nowPlaying episode
        var episode = Ti.App.Properties.getObject('nowPlaying');

        // Make sure we have an active mediaplayer, and 
        // that we are playing the correct episode
        if( mediaPlayer == undefined ){

            // Set audio mode. If not as playback, it mutes with the ringer/vibration switch on iPhone
            Ti.Media.audioSessionMode = Ti.Media.AUDIO_SESSION_MODE_PLAYBACK;

            mediaPlayer = Ti.Media.createAudioPlayer({
                url: episode.mediaURL,
                allowBackground: true
            });


            mediaPlayer.addEventListener('progress', function(e){
                var played = Math.round(e.progress/1000);
                e.minutes = pad(Math.floor(played/60));
                e.hours = pad(Math.floor(e.minutes/60));
                e.seconds = pad(played % 60);

                // Try to set the text in playCount
                nowPlayingWin.fireEvent('setPlayCount', e);

            });
        } else if( mediaPlayer.url != episode.mediaURL ){
            mediaPlayer.stop();
            mediaPlayer.setUrl(episode.mediaURL);
        }

        // helper method to pad time values
        function pad(number){
            var nstring = String(number);
            if(nstring.length <= 1){
                nstring = '0' + nstring;
            }
            return nstring;
        }



        // And start playing
        mediaPlayer.play();
        nowPlayingWin.open();
    }


    return self;
}

module.exports = ApplicationWindow;
