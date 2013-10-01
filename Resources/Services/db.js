/*
 * Database contains a single table for episodes
 * the episodes table contains the following fields
 * 
 * id: integer
 * title: text
 * subtitle: text
 * description: text
 * notes: text (html formatted)
 * mediaURL: text (URL to audiofile)
 * mediaPath: text (path to locally stored audiofile if downloaded)
 * identifier: text (formatted as a URI, in XML stored in the items guid node)
 * unread: integer (1 or 0)
 * 
 */

function DB(){
	
	// This module is a Ti.Database.DB object
	// Must remember to close DB after use
	var self = Ti.Database.open('episodes');
	
	// Make sure we have the episodes table
	(function (){
		var query = 'CREATE TABLE IF NOT EXISTS episodes (';
		query += ' id integer primary key autoincrement';
		query += ', title text';
		query += ', pubDate integer';
		query += ', subtitle text';
		query += ', description text';
		query += ', notes text';
		query += ', mediaURL text';
		query += ', mediaPath text';
		query += ', identifier text unique';
		query += ', unheard integer';
		query += ')';
		
		Ti.API.debug('Creating table episodes if not exists');
		
		self.execute(query);
	})();
	
	// Expects an object with episode Details
	// Returns ID of inserted row
	self.saveEpisode = function(ep){
		var query = 'INSERT OR IGNORE INTO episodes (title, pubDate, subtitle, description, notes, mediaURL, identifier, unheard) VALUES (?,?,?,?,?,?,?,?)';

		// Do the actual insert	
		self.execute(query, ep.title, ep.pubDate, ep.subtitle, ep.description, ep.notes, ep.mediaURL, ep.identifier, ep.unheard);
		Ti.API.debug(ep.title + ' saved localy');
		
		return self.lastInsertRowId;
	};
	
	self.getLatestUpdate = function(){
		
		var query = 'SELECT MAX(pubDate) FROM episodes LIMIT 1';
		
		var result = self.execute(query);
		
		// container for latestUpdate;
		var latestUpdate;
		
		if(result.isValidRow() ){
			latestUpdate = 0;
		} else {
			latestUpdate = result.fieldByName('pubDate');
		}
		
		return latestUpdate;
	};

	// Method to get data for the main tableView
	self.getEpisodesList = function(){
		
		Ti.API.info('Getting episodesList');
		
		// Build query
		var query = 'SELECT title,subtitle,pubDate,unheard,mediaPath FROM episodes ORDER BY pubDate';
		
		var result = self.execute(query);
		
		var episodesList = [];
		
		while( result.isValidRow() ){
		
			var episode = {};
			
			episode.title = result.fieldByName('title');
			episode.subtitle = result.fieldByName('subtitle');
			episode.unheard = result.fieldByName('unheard');
			episode.mediaPath = result.fieldByName('mediaPath');
			
			// Date requires formatting
			var timestamp = new Date(result.fieldByName('pubDate'));
			var pubDate = timestamp.getDate();
			pubDate += '/' + timestamp.getMonth();
			pubDate += ' ' + timestamp.getFullYear();
			episode.pubDate = pubDate;
			
			episodesList.push(episode);
			
			// Don't forget to go to next episode...
			result.next();
		}
		
		return episodesList;
		 
	};

        // Method to grab infor for specific episode
        self.getEpisodeWithId = function(episodeId){

            Ti.API.info('Fetching episode with id: ' + episodeId);

            // Build query
            var query = 'SELECT * FROM episodes WHERE id = ? LIMIT 1';

            // Query db
            var result = self.execute(query, episodeId);

            // Placeholder for episode data
            var episode = {};

            // Retrive episode data
            while( result.isValidRow() ){
                episode.title = result.fieldByName('title');
                episode.subtitle = result.fieldByName('subtitle');
                episode.unheard = result.fieldByName('unheard');
                episode.mediaURL = result.fieldByName('mediaURL');
                episode.identifier = result.fieldByName('identifier');
                episode.description = result.fieldByName('description');
                episode.notes = result.fieldByName('notes');
                episode.pubDate = result.fieldByName('pubDate');
            };

            return episode;
        };

        // Return open DB connection as the module
	return self;
}

module.exports = DB;
