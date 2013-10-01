/*
 * Create the tableViewRow for the Episodes in the MasterView table
 */

function EpisodeRow(episode){

    // Create the row
    var self = Ti.UI.createTableViewRow({
        className: 'episodeRow',
        backgroundColor: '#FFFFFF',
        episodeId: episode.id,
        episodeTitle: episode.title,
        layout: 'vertical',
        hasChild: true
    });

    // Episode Title
    var episodeTitle = Ti.UI.createLabel({
        text: episode.title,
        color: '#787878',
        textAlign: 'left',
        top: '8dp',
        left: '12dp',
        font:{
            fontFamily: 'HelveticaNeue',
            fontSize: '12ps'
        }
    });
    self.add(episodeTitle);

    // Episodesubtitle
    var subtitle = Ti.UI.createLabel({
        text: episode.subtitle,
        color: '#000000',
        textAlign: 'left',
        left: '12dp',
        font: {
            fontFamily: 'HelveticaNeue-Light',
            fontSize: '16dp'
        },
        bottom: '8dp'
    });
    self.add(subtitle);

    // todo: add subtitle
    // todo: add heard/unheard indicator
    // todo: add 

    // And return the row
    return self;
};

module.exports = EpisodeRow;
