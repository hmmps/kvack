/*
 * Create the tableViewRow for the Episodes in the MasterView table
 */

function EpisodeRow(episode){

    Ti.API.debug('Creating tablerow for ' + episode.title);

    // Create the row
    var self = Ti.UI.createTableViewRow({
        className: 'episodeRow',
        backgroundColor: '#FFFFFF',
        episodeId: episode.id
    });

    // Episode Title
    var episodeTitle = Ti.UI.createLabel({
        text: episode.title,
        textAlign: 'left',
        top: '8dp',
        left: '12dp',
        font:{
            fontFamily: 'HelveticaNeue'
        }
    });
    self.add(episodeTitle);

    // todo: add subtitle
    // todo: add heard/unheard indicator
    // todo: add 

    // And return the row
    return self;
};

module.exports = EpisodeRow;
