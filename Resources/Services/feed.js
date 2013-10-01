/*
 * Functions to download, and parse the remote feed
 */

function Feed(){

    var self = this;

    self.remoteURL = 'http://skenkonst.se/newKvack.xml';

    self.fetchedXML = 'asdg,jhgadfliugasdf';

    // Fetch remote feed
    self.fetchRemoteFeed = function(){

        // Create Network Client
        var client = Ti.Network.createHTTPClient({

            // On success
            onload: function(e){
                self.fetchedXML = this.responseXML;
                if(null == self.fetchedXML){
                    Ti.API.error('fetched XML is null');
                } else {
                    Ti.App.fireEvent('fetchRemoteFeedFinished');
                    Ti.API.info('RemoteFeed fetched');
                }

                Ti.API.debug( self.fetchedXML);
                var feedTitle = self.fetchedXML.getElementsByTagName('title').item(0).textContent;
            },

            // On failure
            onerror: function(e){
                Ti.App.fireEvent('fetchRemoteFeedFailed', e);
                Ti.API.error(e.error);
            },

            // Set timeout for network request
            timeout: 5000
        });

        // Open request
        client.open("GET", self.remoteURL);
        Ti.API.debug('Opening HTTP CLient');

        // Send request
        client.send();
        Ti.API.debug('HTTP CLient request sent');
    };

    self.getFeedInfo = function(){

        var xml;

        if(null == self.fetchedXML){ 
            Ti.API.error("fetchedXML is empty");
            return false;
        } else {
            xml = self.fetchedXML;
        }

        var FeedInfo = {};

        // grab feed title for further parsing
        var titleText = xml.getElementsByTagName('title').item(0).textContent;

        // title and subtitle mostly single string separated by a 'ndash', unicode is '\u2013'
        var FeedTitles = titleText.split(/\u2013/);

        // Add title and subtitle to feedInfo object
        feedInfo.title = FeedTitles[0].trim;
        feedInfo.subtitle = FeedTitles[1].trim;

        feedInfo.lastBuildDate = new Date(xml.getElementsByTagName('lastBuildDate').item(0).textContent);

    };

    /*
     * Expects a timestamp
     * New episodes is published after the submitted timestamp
     * returns nre episodes as XML nodes in an array
     */
    self.getNewEpisodes = function(newerThen){

        // Make sure we have a timestamp to compare to
        if(null == newerThen || newerThen == ''){
            newerThen = 0;
        };

        var xml = self.fetchedXML;

        // Array for episodes
        var newEpisodes = [];

        if(null == xml){
            Ti.API.error('No fetchedXML accessible');
            return false;
        } else {
            Ti.API.debug('fetchedXML is not null');
        };

        var allItems = xml.getElementsByTagName('item');

        Ti.API.debug(allItems.length + ' episodes in feed');

        for(var i = 0, j = allItems.length; i < j; i++){

            // allItems is not an array, but a Ti.XML.Nodelist
            var item = allItems.item(i);

            // skip items without enclosures
            if(null == item.getElementsByTagName('enclosure')){
                Ti.API.debug('Skipping item ' + i);
                continue;
            }

            // Also skip items without Avsnitt eller Kvacksnack in the title
            var title = item.getElementsByTagName('title').item(0).textContent;
            if( title.match(/Avsnitt/) ){
                Ti.API.debug('Title contains Avsnitt');
            } else if( title.match(/Kvacksnack/) ){
                Ti.API.debug('Title contains Kvacksnack');
            } else {
                // Skip to next item
                Ti.API.debug('Skipping item titled ' + title);
                continue;				
            }

            var pubDate = item.getElementsByTagName('pubDate').item(0).textContent;
            pubDate = new Date(pubDate);
            if(pubDate > newerThen){
                newEpisodes.push(item);	
            } else {
                break;
            }
        }

        Ti.API.debug('Found ' + newEpisodes.length + ' new episodes');

        // Return episodes chronologically.
        // XMLFeed stores episodes newest -> oldest.
        // We want to go through them oldest -> newest
        newEpisodes.reverse();

        return newEpisodes;
    };

    // Returns an object with info from a submitted XMLnode
    self.getEpisodeDetails = function(xmlNode){

        var episode = {};

        // title and subtitle requires some extra parsing
        // stored in the same string separated by a ndash, unicode id '\u2013'
        var fullTitle = xmlNode.getElementsByTagName('title').item(0).textContent;
        var titles = fullTitle.split(/\u2013/);

        episode.title = titles[0].trim();
        episode.subtitle = titles[1].trim();

        // pubDate stored internally as a timestamp
        var dateString = xmlNode.getElementsByTagName('pubDate').item(0).textContent;
        episode.pubDate = Date.parse(dateString);

        episode.description = xmlNode.getElementsByTagName('itunes:subtitle').item(0).textContent;
        episode.notes = xmlNode.getElementsByTagName('content:encoded').item(0).textContent;
        // episode.mediaURL = xmlNode.getElementsByTagName('enclusure').item(0).getAttributeNode('url').value;
        episode.identifier = xmlNode.getElementsByTagName('guid').item(0).textContent;

        return episode;
    };

    return self;
};

module.exports = Feed;
