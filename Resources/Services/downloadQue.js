function DownloadQue(e){
    
    // Make sure we can access current instance of the DownloadQue object
    var that = this;
    
    // Make container for downloadQue
    var Que = [];
}

DownloadQue.prototype.addToQue = function(episode){
    Ti.API.debug('Adding episode with id ' + episode.episodeId + ' to que');
}

module.exports = DownloadQue;