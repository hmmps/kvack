function DetailView() {
	var self = Ti.UI.createView();
	
	var lbl = Ti.UI.createLabel({
		text:'Please select an item',
		height:'auto',
		width:'auto',
		color:'#000'
	});
	self.add(lbl);
	

        // load Db module
        var EpisodesDb = require('Services/db');

	self.addEventListener('itemSelected', function(e) {
            
            // open DB
            var episodesDb = new EpisodesDb();

            // Fetch episode details
            var episode = episodesDb.getEpisodeWithId(e.episodeId);

            // Close DB
            episodesDb.close();

            // Display episode details
            lbl.text = 'title: ' + episode.title;
	});
	
	return self;
};

module.exports = DetailView;
