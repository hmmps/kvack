function DetailView() {

    var self = Ti.UI.createView({
        layout: 'vertical',
        backgroundColor: '#fff'
    });

    // Add subtitle to detailsView
    var subtitle = Ti.UI.createLabel({
        top: '8dp',
        text: 'Episode subtitle',
        height:'auto',
        width:'auto',
        color:'#000',
        font:{
            fontFamily: 'HelveticaNeue-Condensed',
            fontSize: '24sp'
        }
    });
    self.add(subtitle);

    // load Db module
    var EpisodesDb = require('Services/db');

    // load mediaplayer module
    //var MediaPlayerView = require('ui/common/mediaPlayerView');

    // Add media player to detailsView
    //var mediaPlayerView = new MediaPlayerView();
    //self.add(mediaPlayerView);

    // Add controls
    //var buttonView = Ti.UI.createView({
    //    layout: 'horizontal',
    //    height: '44dp'
    //});
    //self.add(buttonView);

    var downloadBtn = Ti.UI.createButton({
        title: 'Hämta avsnitt'
    });
    self.add(downloadBtn);
    downloadBtn.addEventListener('click', downloadEpisode);

    var playBtn = Ti.UI.createButton({
        title: 'Spela avsnitt'
    });
    self.add(playBtn);
    playBtn.addEventListener('click', function(e){
        Ti.App.Properties.setObject('nowPlaying', self.data);
        self.fireEvent('playEpisode');
    });


    function downloadEpisode(e){
        // Episodeinfo is stored in self.data
        e.episodeId = self.data.episodeId;
        e.episodeTitle = self.data.title;
        e.mediaURL = self.data.mediaURL;
        self.fireEvent('downloadEpisode', e);
    }

    // Add container for webView
    var descriptionContainer = Ti.UI.createView();
    self.add(descriptionContainer);
    //
    // Add view for episode description
    var description = Ti.UI.createWebView({
        html: 'No description of episode'
    });
    descriptionContainer.add(description);


    self.addEventListener('itemSelected', function(e) {

        // open DB
        var episodesDb = new EpisodesDb();

        // Fetch episode details
        var episode = episodesDb.getEpisodeWithId(e.episodeId);

        // Close DB
        episodesDb.close();

        // Update detailview with info from db
        self.updateView(episode);
    });


    self.updateView = function(episode){

        // We might be updating the current view, so if we have
        // not recieved episode as an argument, try using self.data
        if( arguments.length === 0  && null !== self.data ){
            episode = self.data;
        }

        // Reload episode from DB
        var DB = new EpisodesDb();
        episode = DB.getEpisodeWithId(episode.episodeId);
        DB.close();

        // Make sure we have episode info
        if( null === episode && null === self.data){
            Ti.API.error('No episode loaded');
        }

        // See if episode is downloaded or not
        if( null != episode.localPath &&
            Ti.Filesystem.getFile(episode.localPath).exists() ){
            // We have a localpath, so episode should be downloaded

            var file = Ti.Filesystem.getFile(episode.localPath);
            
            // Set button statuses
            playBtn.enabled = true;
            downloadBtn.enabled = false;


        } else { // Episode not downloaded
            // Set button enabledes
            playBtn.enabled = false;
            downloadBtn.enabled = true;

        }



        //// Check if we are playing local or remote media
        //var mediaLocation;
        //if( episode.localPath != undefined ){
        //    mediaLocation = episode.localPath;
        //} else if( episode.mediaURL != undefined ){
        //    mediaLocation = episode.mediaURL;
        //} else {
        //    // We have an error!
        //    Ti.API.error('Recieved neither mediaPath nor mediaURL from Db');
        //}

        // Update data in Childviews
        subtitle.text = episode.subtitle;
        //mediaPlayerView.setMediaPath(mediaLocation);
        //mediaPlayerView.episodeTitle = episode.title;
        //description.setHtml(episode.description);
        description.html = episode.description;

        // save episodeData in detailView context
        self.data = episode;
    };

    return self;
}

module.exports = DetailView;
