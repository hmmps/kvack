var win = Ti.UI.currentWindow;

var nowPlayingView = Ti.UI.createView({
    backgroundColor: '#FFF',
    layout: 'vertical'
});
win.add(nowPlayingView);

// Load nowPlaying episode data
var episode = Ti.App.Properties.getObject('nowPlaying');

// Fetch episodeDuration
var episodeDuration = episode.mediaDuration;
Ti.API.debug('mediaDuration is ' + episodeDuration);

// Add info
var episodeTitle = Ti.UI.createLabel({
    text: episode.title,
    color: '#777',
    top: '160dp',
    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
    font:{
        fontFamily: 'HelveticaNeue-CondensedBold',
        fontSize: '16sp'
    }
});
nowPlayingView.add(episodeTitle);

var episodeSubtitle = Ti.UI.createLabel({
    text: episode.subtitle,
    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
    font:{
        fontFamily: 'HelveticaNeue-Light',
        fontSize: '24sp'
    }
});
nowPlayingView.add(episodeSubtitle);

var closeWindowBtn = Ti.UI.createButton({
    title: 'Stäng',
    height: '44dp',
    top: '14dp',
    right: '8dp',
    color: '#F00',
    font: {
        fontSize: '12dp'
    }
});
win.add(closeWindowBtn);

var elapsedTime = Ti.UI.createLabel({
    text: '00:00:00/??:??:??',
    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
    top: '6dp',
    font: {
        fontFamily: 'HelveticaNeue-UltraLight',
        fontSize: '22dp'
    }
});
nowPlayingView.add(elapsedTime);

var playBtn = Ti.UI.createButton({
    title: 'Play',
    height: '44dp',
    enabled: false,
    top: '12dp'
});
nowPlayingView.add(playBtn);

var pauseBtn = Ti.UI.createButton({
    title: 'Pause',
    height: '44dp'
});
nowPlayingView.add(pauseBtn);

var stopBtn = Ti.UI.createButton({
    title: 'Stop',
    height: '44dp'
});
nowPlayingView.add(stopBtn);

//
// ** Behavior **
//

closeWindowBtn.addEventListener('click', closeWindow);

stopBtn.addEventListener('click', function(){
    stopBtn.enabled = false;
    playBtn.enabled = true;
    pauseBtn.enabled = false;
    win.fireEvent('stopEpisode');

    // And reset playCount
    elapsedTime.text = '00:00:00';
});


pauseBtn.addEventListener('click', function(){
    pauseBtn.enabled = false;
    stopBtn.enabled = true;
    playBtn.enabled = true;
    win.fireEvent('pauseEpisode');
});

playBtn.addEventListener('click', function(){
    playBtn.enabled = false;
    pauseBtn.enabled = true;
    stopBtn.enabled = true;
    win.fireEvent('playEpisode');
});

win.addEventListener('setPlayCount', function(e){
    elapsedTime.text = e.hours + ':' + e.minutes + ':' + e.seconds +
        '/' + episodeDuration;
});

//
// ** Methods **
//

function closeWindow(){
    win.close();
}
