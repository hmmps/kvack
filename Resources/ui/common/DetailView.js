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

    // Add playbutton
    var playBtn = Ti.UI.createButton({
        title: 'Streama avsnitt'
    });
    self.add(playBtn);
    playBtn.addEventListener('click', playEpisode);

    function playEpisode(){
        Ti.App.Properties.setObject('nowPlaying', self.data);
        self.fireEvent('playEpisode');
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

        // Make sure we have episode info
        if( null === episode ){
            Ti.API.error('No episode loaded');
            return;
        }

        // Check if we are playing local or remote media
        var mediaLocation;
        if( episode.mediaPath != undefined ){
            mediaLocation = episode.mediaPath;
        } else if( episode.mediaURL != undefined ){
            mediaLocation = episode.mediaURL;
        } else {
            // We have an error!
            Ti.API.error('Recieved neither mediaPath nor mediaURL from Db');
        }

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
