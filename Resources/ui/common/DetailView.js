function DetailView() {

    /*
     * Views to be contained in DetailView
     * - Mediaplayer (Load as module)
     *   - Buttons
     *      - Play / Pause
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
     *   - heard / unheard
     *   - downloaded / not downloaded
     */

    // Create holder for episode object
    var episode;


    var self = Ti.UI.createView({
        layout: 'vertical'
    });

    // load Db module
    var EpisodesDb = require('Services/db');

    // load mediaplayer module
    var MediaPlayer = require('ui/common/mediaPlayer');

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

        // Clear out childviews
        self.removeAllChildren();

        // Make sure we have episode info
        if( null == episode ){
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
        };

        // Add subtitle to detailsView
        var subtitle = Ti.UI.createLabel({
            text: episode.subtitle,
            height:'auto',
            width:'auto',
            color:'#000',
            font:{
                fontFamily: 'HelveticaNeue-Condensed',
                fontSize: '24ps'
            }
        });
        self.add(subtitle);
        Ti.API.debug('Subtitle added');

        // Add media player to detailsView
        var mediaPlayer = new MediaPlayer(mediaLocation);
        self.add(mediaPlayer);
        Ti.API.debug('Mediaplayer added');

        // Add view for episode details
        var showNotes = Ti.UI.createWebView({
            html: episode.notes
        });
        self.add(showNotes);

        Ti.API.debug('DetailsView added with contents: ' + episode.notes);
    };


    return self;
};

module.exports = DetailView;
