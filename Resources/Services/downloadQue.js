function DownloadQue(e){
    
    var theQue = new Array();
    
    var downloading = false;

    
    function downloadFirstEpisodeInQue(){
        
        var downloadItem;

        if( theQue.length <= 0){
            Ti.API.error('[downloadQue.js] ' +
                'trying to download episode from empty que');
        } else {
            
            downloadItem = theQue[0];
            
            // Create new HTTPCLient
            var http = Ti.Network.createHTTPClient({
                
                // Success
                onload: function(e){
                    Ti.API.info('Saved episodeId: ' +
                        downloadItem.episodeId +
                        ' to ' + downloadItem.localPath);
                    self.fireEvent('episodeSaved');
                },
                
                // Fail
                onerror: function(e){
                  Ti.API.error(e.error);
                },
                
                // Set timeout
                timeout: 8000
            });
            
            http.open('GET', downloadItem.mediaURL);
            http.file = downloadItem.localPath;
            
            http.send();
            Ti.API.info('Starting download of episode with id ' +
                    downloadItem.episodeId);
        }
    }
}
    
DownloadQue.prototype.addToQue = function(episode){
    
    // short handle for filesystem specific separator
    var sep = Ti.Filesystem.separator;
        
    // define local root path
    var localRoot;
    if( Ti.Platform.name == 'android'){
        // On android we save to external storage
        // Todo: handle lack of external storage
        localRoot = Ti.Filesystem.externalStorageDirectory +
            sep + 'Podcasts';
    } else {
        // On iOS we save to applicationCache, since it is not
        // supposed to be backed up, and also isn't user created
        localRoot = Ti.Filesystem.applicationCacheDirectory;
    }

    
    // Create local path (localRoot/epXX)
    var localPath = localRoot + sep + 'ep' + episode.episodeId;
    
    var downloadObject = {
        remoteURL: episode.mediaURL,
        localPath: localPath
    };
    
    // And add episode to Que
    this.theQue.push(downloadObject);

    Ti.App.fireEvent('episodeAddedToDownloadQue');
}

module.exports = DownloadQue;
