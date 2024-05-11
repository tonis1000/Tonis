document.addEventListener('DOMContentLoaded', function () {
    const player = new Plyr('#plyr-player', {
        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen']
    });

    // Ereignishandler für das Ändern der Abspielgeschwindigkeit
    player.on('ratechange', function(event) {
        console.log('Playback rate changed to ' + event.detail.plyr.speed);
    });

    // Ereignishandler für das Ändern der Medienqualität
    player.on('qualitychange', function(event) {
        console.log('Quality changed to ' + event.detail.plyr.quality);
    });

    // Funktion zum Anzeigen von Untertiteln
    player.source({
        type: 'video',
        sources: [
            {
                src: 'video.mp4',
                type: 'video/mp4',
            },
        ],
        tracks: [
            {
                kind: 'captions',
                src: 'subtitles.vtt',
                srclang: 'en',
                label: 'English',
                default: true,
            },
        ],
    });
});
