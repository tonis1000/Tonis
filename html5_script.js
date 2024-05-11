document.addEventListener('DOMContentLoaded', function () {
    const player = document.getElementById('html5-player');

    // Ereignishandler für die Wiedergabe- und Pausenschaltflächen
    player.addEventListener('play', function() {
        console.log('Video is playing');
    });

    player.addEventListener('pause', function() {
        console.log('Video is paused');
    });

    // Ereignishandler für das Ändern der Lautstärke
    player.addEventListener('volumechange', function() {
        console.log('Volume changed to ' + this.volume);
    });

    // Ereignishandler für das Ändern der Zeit
    player.addEventListener('timeupdate', function() {
        console.log('Current time: ' + this.currentTime);
    });

    // Funktion zum Anzeigen von Untertiteln
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.src = 'subtitles.vtt';
    track.srclang = 'en';
    track.label = 'English';
    player.appendChild(track);
});
