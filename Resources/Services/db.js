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
    // Remember to close DB after use
    var self = Ti.Database.open('episodes');

    // Make sure we have the episodes table
    (function (){
        var query = 'CREATE TABLE IF NOT EXISTS episodes (' +
            ' id integer primary key autoincrement' +
            ', title text' +
            ', pubDate text' +
            ', subtitle text' +
            ', description text' +
            ', notes text' +
            ', mediaURL text' +
            ', localPath text' +
            ', mediaDuration text' +
            ', identifier text unique' +
            ', playStatus integer' +
            ')';

            self.execute(query);
            })();

        // Expects an object with episode Details
        // Returns ID of inserted row
        self.saveEpisode = function(ep){

            // Build query
            var query = 'INSERT OR IGNORE INTO episodes (' +
                    'title'  +
                    ', pubDate' +
                    ', subtitle' +
                    ', description' +
                    ', notes' +
                    ', mediaURL' +
                    ', localPath' +
                    ', mediaDuration' +
                    ', identifier' +
                    ', playStatus' +
                    ') VALUES (?,?,?,?,?,?,?,?,?,?)';

            // Do the actual insert	
            self.execute( query,
                    ep.title,
                    ep.pubDate,
                    ep.subtitle,
                    ep.description,
                    ep.notes,
                    ep.mediaURL,
                    ep.localPath,
                    ep.mediaDuration,
                    ep.identifier,
                    ep.playStatus );

            return self.lastInsertRowId;
        };

        self.getLatestUpdate = function(){

            var query = 'SELECT MAX(pubDate) AS latest FROM episodes LIMIT 1';

            var result = self.execute(query);

            // container for latestUpdate;
            var latestUpdate = 0;

            if(result.isValidRow() ){
                latestUpdate = result.fieldByName('latest');
            } else {
                Ti.API.error('Found no latest episodes');
            }

            // If we have no saved episodes, query returns a valid result
            // but the result is set to null, so set to 0
            if( null === latestUpdate ){
                latestUpdate = 0;
            }

            return latestUpdate;
        };

        // Method to get data for the main tableView
        // Returns an array with episodeObjects
        self.getEpisodesList = function(){

            // Build query
            var query = 'SELECT * FROM episodes ORDER BY pubDate DESC';

            var result = self.execute(query);

            var episodesList = [];

            while( result.isValidRow() ){

                var episode = {};

                episode.id = result.fieldByName('id');
                episode.title = result.fieldByName('title');
                episode.subtitle = result.fieldByName('subtitle');
                episode.playStatus = result.fieldByName('playStatus');
                episode.localPath = result.fieldByName('localPath');
                episode.pubDate = result.fieldByName('pubDate');

                // Add episode to episodesList
                episodesList.push(episode);

                // Don't forget to go to next episode...
                result.next();
            }

            // close resultset
            result.close();

            // Return an array of episodes as objects
            return episodesList;
        };

        self.getNewEpisodesList = function(newerThen){

            Ti.API.debug('[db.js:135] Gettings episodes newer then ' +
                    newerThen);

            // Find episodes newer then submitted timestamp
            var query = 'SELECT * FROM episodes WHERE pubDate > ?';
            var result = self.execute(query, newerThen);

            // Create a placeholder for new episodes
            var newEpisodesList = [];

            while( result.isValidRow() ){
                var episode = {};

                episode.id = result.fieldByName('id');
                episode.title = result.fieldByName('title');
                episode.subtitle = result.fieldByName('subtitle');
                episode.playStatus = result.fieldByName('playStatus');
                episode.localPath = result.fieldByName('localPath');
                episode.mediaURL = result.fieldByName('mediaURL');
                episode.pubDate = result.fieldByName('pubDate');

                // Add episode to newEpisodesList
                newEpisodesList.push(episode);

                // Skip to next result (row...)
                result.next();
            }

            // Close resultset
            result.close();

            // Return an array of new Episodes as objects
            return newEpisodesList;
        };

        // Method to grab specific episode
        self.getEpisodeWithId = function(episodeId){

            // Build query
            var query = 'SELECT * FROM episodes WHERE id = ? LIMIT 1';

            // Query db
            var result = self.execute(query, episodeId);

            // Placeholder for episode data
            var episode = {};

            // Retrive episode data
            if( result.isValidRow() ){

                // Add result to episode object
                episode.episodeId = result.fieldByName('id');
                episode.title = result.fieldByName('title');
                episode.subtitle = result.fieldByName('subtitle');
                episode.playStatus = result.fieldByName('playStatus');
                episode.mediaURL = result.fieldByName('mediaURL');
                episode.localPath = result.fieldByName('localPath');
                episode.mediaDuration = result.fieldByName('mediaDuration');
                episode.identifier = result.fieldByName('identifier');
                episode.description = result.fieldByName('description');
                episode.notes = result.fieldByName('notes');
                episode.pubDate = result.fieldByName('pubDate');
                episode.mediaDuration = result.fieldByName('mediaDuration');
            }

            // Return episode as an object
            return episode;
        };

        // Method to get details for the most recent episode
        self.getNewestEpisode = function(){

            //Build query
            var query = 'SELECT * FROM episodes ORDER BY pubDate DESC LIMIT 1';

            // Execute Query
            var result = self.execute(query);


            // Placeholder for episode data
            var episode = {};

            // Retrive episode data
            if( result.isValidRow() ){

                // Add result to episode object
                episode.episodeId = result.fieldByName('id');
                episode.title = result.fieldByName('title');
                episode.subtitle = result.fieldByName('subtitle');
                episode.playStatus = result.fieldByName('playStatus');
                episode.mediaURL = result.fieldByName('mediaURL');
                episode.localPath = result.fieldByName('localPath');
                episode.identifier = result.fieldByName('identifier');
                episode.description = result.fieldByName('description');
                episode.notes = result.fieldByName('notes');
                episode.pubDate = result.fieldByName('pubDate');
                episode.mediaDuration = result.fieldByName('mediaDuration');
            } else {
                // If there is no episode, return false
                episode = false;
            }

            // Return episode as an object
            return episode;
        };

        // Return open DB connection as the module
        return self;
}

module.exports = DB;
