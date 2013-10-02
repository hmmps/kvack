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

    var lbl = Ti.UI.createLabel({
        text:'No mediaLocation',
        height:'auto',
        width:'auto',
        color:'#000'
    });
    self.add(lbl);

    // Tell me if I am streaming or playing downloaded episode
    var mediaLocationLabel = Ti.UI.createLabel({
        text: 'unknown'
    });
    self.add(mediaLocationLabel);

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
    });


    self.updateView = function(){

        // Make sure we have episode info
        if( null == episode ){
            Ti.API.error('No episode loaded');
            return;
        }

        Ti.API.debug(JSON.stringify(episode));

        // Check if we are playing local or remote media
        var mediaLocation;
        if( episode.mediaPath != undefined ){
            mediaLocation = episode.mediaPath;
            mediaLocationLabel.text = 'local media';
        } else if( episode.mediaURL != undefined ){
            mediaLocation = episode.mediaURL;
            mediaLocationLabel.text = 'remote media';
        } else {
            // We have an error!
            Ti.API.error('Recieved neither mediaPath nor mediaURL from Db');
        };

        // Add media player to view
        var mediaPlayer = new MediaPlayer(mediaLocation);
        self.add(mediaPlayer);

        // Set title label
        lbl.text = mediaLocation;
    };


    return self;
};

module.exports = DetailView;
