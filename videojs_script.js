document.addEventListener('DOMContentLoaded', function () {
    const player = videojs('videojs-player', {
        controls: true,
        autoplay: false,
        preload: 'auto'
    });

    // Ereignishandler für die Wiedergabe- und Pausenschaltflächen
    player.on('play', function() {
        console.log('Video is playing');
    });

    player.on('pause', function() {
        console.log('Video is paused');
    });

    // Ereignishandler für das Ändern der Lautstärke
    player.on('volumechange', function() {
        console.log('Volume changed to ' + this.volume());
    });

    // Ereignishandler für das Ändern der Zeit
    player.on('timeupdate', function() {
        console.log('Current time: ' + this.currentTime());
    });

    // Ereignishandler für das Ändern der Medienqualität
    player.on('qualitychange', function() {
        console.log('Quality changed to ' + this.videoWidth() + 'x' + this.videoHeight());
    });

    // Funktion zum Anzeigen von Untertiteln
    player.addRemoteTextTrack({
        kind: 'subtitles',
        src: 'subtitles.vtt',
        srclang: 'en',
        label: 'English'
    });
});
