function ApplicationWindow() {

    //
    // ** Load modules *************************************
    //

    //declare module dependencies
    var MasterView = require('ui/common/MasterView'),
        DetailView = require('ui/common/DetailView');

    var DB = require('Services/db');

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
        title: "Spelas nu",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        font: {
            fontSize: '8sp'
        }

    });

    //create iOS specific NavGroup UI
    var navGroup = Ti.UI.iPhone.createNavigationGroup({
        window:masterContainerWindow
    });
    self.add(navGroup);

    /*****************************************************
     ** Behavior *****************************************
     *****************************************************/
    
    // check for nowPlaying
    //detailContainerWindow.addEventListener('close', function(e){
    masterContainerWindow.addEventListener('focus', function(e){
        // If we have a mediaPlayer object, then show 'nowPlaying' button
        if( mediaPlayer != undefined ){
            masterContainerWindow.rightNavButton = nowPlayingButton;
        } else {
            masterContainerWindow.rightNavButton = undefined;
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

        // Unset mediaPlayer
        mediaPlayer = undefined;

        // And close nowPlaying window
        nowPlayingWin.close();
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

        // First get the nowPlaying episode
        var episode = Ti.App.Properties.getObject('nowPlaying');

        // Make sure we have an active mediaplayer, and 
        // that we are playing the correct episode
        if( mediaPlayer == undefined ){

            // Set audio mode. If not as playback, it mutes with
            // the ringer/vibration switch on iPhone
            Ti.Media.audioSessionMode =
                Ti.Media.AUDIO_SESSION_MODE_PLAYBACK;

            mediaPlayer = Ti.Media.createAudioPlayer({
                url: episode.localPath,
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
        } else if( mediaPlayer.url != episode.localPath ){
            mediaPlayer.stop();
            mediaPlayer.setUrl(episode.localPath);
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

    // Background network process interupts after c:a 10 min,
    // so to play an entire episode in the background,
    // network streaming can't be used. We need to download
    // an entire episode to play all of it in background.
    
    // Create methods for saving episode(s)
    var downloadQue = [];
    var downloadingEpisode = false;
    
    function addEpisodeToDownloadQue(e){

       var rootPath = Ti.Filesystem.applicationCacheDirectory;
       var filename = 'episode' + e.episodeId;

       var queItem = {
           remoteURL: e.mediaURL,
           localPath: rootPath + filename,
           episodeId: e.episodeId,
           title: e.episodeTitle
       };

       downloadQue.push(queItem);
       self.fireEvent('episodeAddedToDownloadQue');
    }

    function fetchFirstQueItem(){

        // Only try to download items when we have items
        if(downloadQue.length >= 1){

            // Set download to active;
            downloadingEpisode = true;

            var fileRequest = Ti.Network.createHTTPClient({

                // Success
                onload: function(){

                    var rootPath = Ti.Filesystem.applicationCacheDirectory;

                    // We need to do some parsing to find the filename
                    var remoteUrl = this.location;
                    var filename = this.location.match(/[\w\d.]+$/);

                    var fileHandle = Ti.Filesystem.getFile(rootPath + filename);
                    fileHandle.write(this.responseData);
                    Ti.App.fireEvent('episodeFinishedDownloading');
                },

                // Fail
                onerror: function(e){
                    Ti.API.error(e.error);
                },

                timeout: 10000
            });

            fileRequest.open('GET', downloadQue[0].remoteURL);
            fileRequest.send();
        }
    }

    Ti.App.addEventListener('episodeFinishedDownloading', episodeDownloadFinished);

    function episodeDownloadFinished(){

        // download is finished, toggle downloadingEpisode to false
        downloadingEpisode = false;

        // And since first episode is downloaded, remove it from que
        var savedEpisode = downloadQue.shift();

        // find the filePath
        var rootPath = Ti.Filesystem.applicationCacheDirectory;
        var filename = savedEpisode.remoteURL.match(/[\w\d.]+$/);

        // And update db to indicate episode is saved.
        var db = new DB();
        db.updateEpisode(savedEpisode.episodeId, {
            localPath: rootPath + filename
        });

        // When we finished downloading an episode, see if we have remaining
        // episodes in que
        if( downloadQue.length >= 1 ){
            // If we have items in que, start downloading next episode
            fetchFirstQueItem();
        }

        // And refresh detailsView
        detailView.updateView();
    }

    // Listen for event to save en episode
    detailView.addEventListener('downloadEpisode', addEpisodeToDownloadQue);

    self.addEventListener('episodeAddedToDownloadQue', fetchFirstQueItem);
    
    self.addEventListener('episodeSaved', function(e){
      // Continue with next if not already downloading
      if(downloads.downloading === false){
        downloads.downloadFirstEpisodeInQue();
      }

    // We also need to update the tableView
    detailView.updateView();

    });
    
    
    return self;
}

module.exports = ApplicationWindow;
