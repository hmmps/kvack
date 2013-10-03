function DetailView() {

    /*
     * Views to be contained in DetailView
     * - Mediaplayer (Load as module)
     *   - Buttons
     *      - Play / Pause;
     *   - Time
     *      - Elapsed time
     *      - Timelinescrubber
     *      - Playing time
     * 
     * - Title
     * - Subtitle
     * - Description
     * 
     * - Status
     *   - played / unplayed
     *   - downloaded / not downloaded
     */

    // Create holder for episode object
    var episode;


    var self = Ti.UI.createView({
        layout: 'vertical'
    });

    // load Db module
    var EpisodesDb = require('Services/db');

    // Add subtitle to detailsView
    var subtitle = Ti.UI.createLabel({
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

    // load mediaplayer module
    var MediaPlayerView = require('ui/common/mediaPlayerView');

    // Add media player to detailsView
    var mediaPlayerView = new MediaPlayerView();
    self.add(mediaPlayerView);

    // Add view for episode details
    var showNotes = Ti.UI.createWebView({
        html: '<p>No show selected</p>'
    });
    self.add(showNotes);


    self.addEventListener('itemSelected', function(e) {

        // open DB
        var episodesDb = new EpisodesDb();

        // Fetch episode details
        episode = episodesDb.getEpisodeWithId(e.episodeId);

        // Close DB
        episodesDb.close();

        // Update detailview with info from db
        self.updateView();
        Ti.API.debug('Update detailView');
    });


    self.updateView = function(){

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
        mediaPlayerView.setMediaPath(mediaLocation);
        showNotes.setHtml(episode.notes);

    };


    return self;
}

module.exports = DetailView;
