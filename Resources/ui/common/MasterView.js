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
	var episodesDb = require('Services/db');
	
	// Create container for episodes
	var episodesList = [];
	
	
	// Update Feeds
	Ti.API.info('Fetching remote feed');
	episodesFeed.fetchRemoteFeed();
	
	Ti.App.addEventListener('fetchRemoteFeedFinished', function(e){
		
		// Get the date of the newest stored episode
		var episodes = new episodesDb();
		var latestUpdate = episodes.getLatestUpdate();
		
		// get the new episodes
		Ti.API.debug('getting the new episodes');
		newEpisodes = episodesFeed.getNewEpisodes(latestUpdate);
		
		Ti.API.debug(newEpisodes.length + ' new episodes to save');
		
		// Save new episodes to database
		for(var i = 0, j = newEpisodes.length; i < j; i++){
			// newEpisodes is an array with DOMElements
			var itemNode = newEpisodes[i];
			
			// Feed.getEpisodeDetails returns an objects
			var episode = episodesFeed.getEpisodeDetails(itemNode);
			
			Ti.API.debug(episode.title);
			
			episodes.saveEpisode(episode);
		}
		
		// Remember to close the DB
		episodes.close();
		
		Ti.App.fireEvent('episodesDbUpdated');
	});
        
        // When database is updated, refersh the episodesTable 
	Ti.App.addEventListener('episodesDbUpdated', reloadEpisodesTable);
	
	function reloadEpisodesTable(){
		
		Ti.API.info('Reloading episodes table');
		
		// Fetch episodes from db
		var episodes = new episodesDb();
		
		// Db.getEpisodesList returns an array with objects
		episodesList = episodes.getEpisodesList();
		episodes.close();
		
		Ti.API.debug(episodesList.length + ' episodes in list');

		// Add each episode to tableView
		var episodes = episodesList.length;

                // Load module for episodeRow
                var EpisodeRow = require('ui/common/episodeRow');

                // Add episodes
		for(var i = 0, j = episodes; i < j; i++){
			var episode = episodesList[i];

                        var episodeRow = new EpisodeRow(episode);
			table.appendRow(episodeRow);
		};
	}
	
	var table = Ti.UI.createTableView({});
	self.add(table);
	
	// add behavior
	table.addEventListener('click', function(e) {
		self.fireEvent('itemSelected', {
			episodeId: e.rowData.episodeId
		});
	});
	
	return self;
};

module.exports = MasterView;
