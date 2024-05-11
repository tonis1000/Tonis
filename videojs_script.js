const videoPlayer = document.getElementById('videoPlayer');
const playPauseButton = document.getElementById('playPauseButton');
const volumeRange = document.getElementById('volumeRange');
const seekBar = document.getElementById('seekBar');
const playbackRateSelect = document.getElementById('playbackRateSelect');
const qualitySelect = document.getElementById('qualitySelect');
const subtitleSelect = document.getElementById('subtitleSelect');
const subtitleContainer = document.getElementById('subtitleContainer');

let subtitles = []; // Array für Untertitel

// Automatisches Laden des Videos beim Klicken auf einen Sender in der Sidebar
document.getElementById('sidebar-list').addEventListener('click', function(event) {
    if (event.target.classList.contains('channel-info')) {
        const videoURL = event.target.getAttribute('data-video-url');
        videoPlayer.src = videoURL;
        videoPlayer.play();
    }
});

// Wiedergabe / Pause
playPauseButton.addEventListener('click', function() {
    if (videoPlayer.paused) {
        videoPlayer.play();
    } else {
        videoPlayer.pause();
    }
});

// Lautstärkeregelung
volumeRange.addEventListener('input', function() {
    videoPlayer.volume = volumeRange.value / 100;
});

// Seek
videoPlayer.addEventListener('timeupdate', function() {
    const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    seekBar.value = progress;

    // Untertitel synchronisieren
    syncSubtitles();
});

seekBar.addEventListener('input', function() {
    const seekTo = (seekBar.value * videoPlayer.duration) / 100;
    videoPlayer.currentTime = seekTo;
});

// Ändern der Wiedergabegeschwindigkeit
playbackRateSelect.addEventListener('change', function() {
    videoPlayer.playbackRate = parseFloat(playbackRateSelect.value);
});

// Ändern der Abspielqualität
qualitySelect.addEventListener('change', function() {
    const selectedQuality = qualitySelect.value;
    // Logik zum Laden der Videoquelle mit der ausgewählten Qualität
});

// Untertitel einfügen und synchronisieren
subtitleSelect.addEventListener('change', function() {
    const selectedSubtitle = subtitleSelect.value;
    loadSubtitles(selectedSubtitle);
});

// Funktion zum Laden der Untertiteldatei
function loadSubtitles(subtitleFile) {
    fetch(subtitleFile)
        .then(response => response.text())
        .then(data => {
            subtitles = parseSubtitles(data);
            syncSubtitles();
        })
        .catch(error => console.error('Fehler beim Laden der Untertitel:', error));
}

// Funktion zum Parsen der Untertiteldaten
function parseSubtitles(subtitleData) {
    // Implementierung abhängig vom Format der Untertiteldatei (SRT, VTT)
    // Hier wird angenommen, dass die Untertitel im SRT-Format vorliegen
    const subtitleLines = subtitleData.trim().split(/\r?\n/);
    let parsedSubtitles = [];
    let currentSubtitle = {};

    subtitleLines.forEach(line => {
        if (line.trim() === '') {
            if (currentSubtitle.startTime && currentSubtitle.endTime && currentSubtitle.text) {
                parsedSubtitles.push(currentSubtitle);
            }
            currentSubtitle = {};
        } else if (!currentSubtitle.startTime) {
            const [startTime, endTime] = line.split(' --> ');
            currentSubtitle.startTime = parseSubtitleTime(startTime);
            currentSubtitle.endTime = parseSubtitleTime(endTime);
        } else if (!currentSubtitle.text) {
            currentSubtitle.text = line;
        }
    });

    return parsedSubtitles;
}

// Funktion zum Parsen der Untertitelzeit
function parseSubtitleTime(timeString) {
    // Annahme: Zeitformat HH:MM:SS,mmm
    const [time, milliseconds] = timeString.split(',');
    const [hours, minutes, seconds] = time.split(':');
    const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
    return totalSeconds + parseInt(milliseconds) / 1000;
}

// Funktion zur Synchronisierung der Untertitel
function syncSubtitles() {
    const currentTime = videoPlayer.currentTime;
    const currentSubtitle = subtitles.find(subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime);

    if (currentSubtitle) {
        subtitleContainer.textContent = currentSubtitle.text;
    } else {
        subtitleContainer.textContent = '';
    }
}

// Weitere Funktionen für Untertitel, Qualitätswiedergabe, etc. hier hinzufügen
