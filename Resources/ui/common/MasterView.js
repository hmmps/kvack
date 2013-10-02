//Master View Component Constructor
function MasterView() {

    //create object instance, parasitic subclass of Observable
    var self = Ti.UI.createView({
        backgroundColor:'white'
    });

    // load Feed module
    var Feed = require('Services/feed');
    var episodesFeed = new Feed();

    // Load database module
    var EpisodesDb = require('Services/db');

    // Load episodeRow module
    var EpisodeRow = require('ui/common/episodeRow');

    // Load module for episodeRow
    var EpisodeRow = require('ui/common/episodeRow');

    // Create container for episodes
    var episodesList = [];

    // Create tableView for episodes
    var table = Ti.UI.createTableView({});
    self.add(table);

    // Update Feeds
    Ti.API.info('Fetching remote feed');
    episodesFeed.fetchRemoteFeed();

    Ti.App.addEventListener('fetchRemoteFeedFinished', function(e){

        // Get the date of the newest stored episode
        var episodes = new EpisodesDb();
        var latestUpdate = episodes.getLatestUpdate();

        // Make sure we have a latest episode
        if( null == latestUpdate ){
            Ti.API.error('latestUpdate is null!');
        };

        // get the new episodes
        Ti.API.info('Getting new episodes fom Feed');
        newEpisodes = episodesFeed.getNewEpisodes(latestUpdate);

        // Save new episodes to database
        for(var i = 0, j = newEpisodes.length; i < j; i++){
            // newEpisodes is an array with DOMElements
            var itemNode = newEpisodes[i];

            // Feed.getEpisodeDetails returns an objects
            var episode = episodesFeed.getEpisodeDetails(itemNode);

            episodes.saveEpisode(episode);
        }

        // Remember to close the DB
        episodes.close();

        Ti.App.fireEvent('episodesDbUpdated');
    });

    // When database is updated, refresh the episodesTable 
    Ti.App.addEventListener('episodesDbUpdated', addNewEpisodesToTable);

    // Method to add episodes to table
    function addEpisodesToTable(){

        Ti.API.info('Adding all episodes in DB to table');

        // Fetch episodes from db
        var episodes = new EpisodesDb();
        var episodesList = episodes.getEpisodesList();
        episodes.close();

        // Add episodes to table
        for(var i = 0, j = episodesList.length; i < j; i++){


            var episode = episodesList[i];
            var episodeRow = new EpisodeRow(episode);
            table.appendRow(episodeRow);

            // We need to remember which is the newest episode in the table,
            // and the newest episodes comes first, so save the time to
            // MasteView.newstEpisodeTimestamp
            if(i == 0){
                self.newestEpisodeTimestamp = episode.pubDate;
                Ti.API.debug('Setting masterView.newestEpisodeTimestamp to ' + self.newestEpisodeTimestamp);
            }
        };
    };

    function addNewEpisodesToTable(){

        Ti.API.info('Adding new eipsodes to table');

        // Db.getNewEpisodesList needs a timestamp to 
        // determine which are the new episodes.
        // If we have a value in masterView.newestEpisodeTimestamp
        // we have a useful time, otherwise set to 0 and load all episodes as new.
        var newerThen;
        if(null == self.newestEpisodeTimestamp){
            newerThen = 0;
        } else {
            newerThen = self.newestEpisodeTimestamp;
        }

        Ti.API.debug('newerThen set to ' + newerThen);


        // Fetch new episodes from db
        // Db.getEpisodesList returns an array with objects
        var episodes = new EpisodesDb();
        var newEpisodesList = episodes.getNewEpisodesList(newerThen);
        episodes.close();

        // Add each episode to tableView
        var episodes = newEpisodesList.length;

        Ti.API.debug('MasterView.js:123 | ' + episodes + ' episodes to add to tableView');

        // Add episodes
        for(var i = 0, j = episodes; i < j; i++){
            var episode = newEpisodesList[i];

            var episodeRow = new EpisodeRow(episode);

            // We can only insertBefore when there is episodes in list,
            // so if list is empty, use appendRow with the first episode.
            if(table.sections.length < 1){
                table.appendRow(episodeRow);
            } else {
                table.insertRowBefore(0,episodeRow);
            };
        };
    };

    // add behavior
    table.addEventListener('click', function(e) {
        self.fireEvent('itemSelected', {
            title: e.rowData.episodeTitle,
        episodeId: e.rowData.episodeId
        });
    });

    // Load all episode when opening app, to skip waiting for network
    addEpisodesToTable();

    return self;
};

module.exports = MasterView;
