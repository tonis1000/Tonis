// Laden der Playlist.m3u und Aktualisieren der Sidebar
function loadMyPlaylist() {
    fetch('playlist.m3u')
        .then(response => response.text())
        .then(data => updateSidebarFromM3U(data))
        .catch(error => console.error('Fehler beim Laden der Playlist:', error));
}

// Laden der externen Playlist und Aktualisieren der Sidebar
function loadExternalPlaylist() {
    fetch('https://raw.githubusercontent.com/gluk03/iptvgluk/dd9409c9f9029f6444633267e3031741efedc381/TV.m3u')
        .then(response => response.text())
        .then(data => updateSidebarFromM3U(data))
        .catch(error => console.error('Fehler beim Laden der externen Playlist:', error));
}

// Laden der Sport-Playlist und Aktualisieren der Sidebar
function loadSportPlaylist() {
    alert("Funktionalität für Sport-Playlist wird implementiert...");
}

// Globales Objekt für EPG-Daten
let epgData = {};

// Laden und Parsen der EPG-Daten mit Zeitabgleich
function loadEPGData() {
    fetch('https://ext.greektv.app/epg/epg.xml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "application/xml");
            const programmes = xmlDoc.getElementsByTagName('programme');
            Array.from(programmes).forEach(prog => {
                const channelId = prog.getAttribute('channel');
                const start = prog.getAttribute('start');
                const stop = prog.getAttribute('stop');
                const titleElement = prog.getElementsByTagName('title')[0];
                if (titleElement) {
                    const title = titleElement.textContent;
                    if (!epgData[channelId]) {
                        epgData[channelId] = [];
                    }
                    epgData[channelId].push({
                        start: parseDateTime(start),
                        stop: parseDateTime(stop),
                        title: title
                    });
                }
            });
        })
        .catch(error => console.error('Fehler beim Laden der EPG-Daten:', error));
}

// Hilfsfunktion zum Umwandeln der EPG-Zeitangaben in Date-Objekte
function parseDateTime(epgTime) {
    // Format: YYYYMMDDHHMMSS ±ZZZZ
    const year = parseInt(epgTime.substr(0, 4), 10);
    const month = parseInt(epgTime.substr(4, 2), 10) - 1; // Monate sind 0-basiert in JavaScript
    const day = parseInt(epgTime.substr(6, 2), 10);
    const hour = parseInt(epgTime.substr(8, 2), 10);
    const minute = parseInt(epgTime.substr(10, 2), 10);
    const second = parseInt(epgTime.substr(12, 2), 10);
    const tzHour = parseInt(epgTime.substr(15, 3), 10);
    const tzMin = parseInt(epgTime.substr(18, 2), 10) * (epgTime[14] === '+' ? 1 : -1);

    const date = new Date(Date.UTC(year, month, day, hour - tzHour, minute - tzMin, second));
    return date;
}

// Funktion zum Finden des aktuellen Programms basierend auf der Uhrzeit
function getCurrentProgram(channelId) {
    const now = new Date();
    if (epgData[channelId]) {
        const currentProgram = epgData[channelId].find(prog => now >= prog.start && now < prog.stop);
        if (currentProgram) {
            const pastTime = now - currentProgram.start;
            const futureTime = currentProgram.stop - now;
            const totalTime = currentProgram.stop - currentProgram.start;
            const pastPercentage = (pastTime / totalTime) * 100;
            const futurePercentage = (futureTime / totalTime) * 100;
            return {
                title: currentProgram.title,
                pastPercentage: pastPercentage,
                futurePercentage: futurePercentage
            };
        } else {
            return { title: 'Keine aktuelle Sendung verfügbar', pastPercentage: 0, futurePercentage: 0 };
        }
    }
    return { title: 'Keine EPG-Daten verfügbar', pastPercentage: 0, futurePercentage: 0 };
}

// Funktion zum Aktualisieren der Sidebar basierend auf der M3U-Datei
function updateSidebarFromM3U(data) {
    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.innerHTML = '';

    const lines = data.split('\n');
    lines.forEach(line => {
        if (line.startsWith('#EXTINF')) {
            const idMatch = line.match(/tvg-id="([^"]+)"/);
            const channelId = idMatch && idMatch[1];
            const programInfo = getCurrentProgram(channelId);

            const nameMatch = line.match(/,(.*)$/);
            if (nameMatch && nameMatch.length > 1) {
                const name = nameMatch[1].trim();
                const imgMatch = line.match(/tvg-logo="([^"]+)"/);
                let imgURL = imgMatch && imgMatch[1] || 'default_logo.png';

                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <div class="channel-info">
                        <div class="logo-container">
                            <img src="${imgURL}" alt="${name} Logo">
                        </div>
                        <span class="sender-name">${name}</span>
                        <span class="epg-channel">
                            <span>${programInfo.title}</span>
                            <div class="epg-timeline">
                                <div class="epg-past" style="width: ${programInfo.pastPercentage}%"></div>
                                <div class="epg-future" style="width: ${programInfo.futurePercentage}%"></div>
                            </div>
                        </span>
                    </div>
                `;
                sidebarList.appendChild(listItem);
            }
        }
    });
}

// Ereignisbehandler
document.addEventListener('DOMContentLoaded', function () {
    loadEPGData();
    updateClock();
    setInterval(updateClock, 1000);
    document.getElementById('myPlaylist').addEventListener('click', loadMyPlaylist);
    document.getElementById('externalPlaylist').addEventListener('click', loadExternalPlaylist);
    document.getElementById('sportPlaylist').addEventListener('click', loadSportPlaylist);
});

// Aktualisierung der Uhrzeit
function updateClock() {
    const now = new Date();
    const tag = now.toLocaleDateString('de-DE', { weekday: 'long' });
    const datum = now.toLocaleDateString('de-DE');
    const uhrzeit = now.toLocaleTimeString('de-DE', { hour12: false });
    document.getElementById('tag').textContent = tag;
    document.getElementById('datum').textContent = datum;
    document.getElementById('uhrzeit').textContent = uhrzeit;
}


const videoPlayer = document.getElementById('videoPlayer');
const playPauseButton = document.getElementById('playPauseButton');
const volumeRange = document.getElementById('volumeRange');
const seekBar = document.getElementById('seekBar');
const playbackRateSelect = document.getElementById('playbackRateSelect');
const qualitySelect = document.getElementById('qualitySelect');
const subtitleSelect = document.getElementById('subtitleSelect');
const subtitlesContainer = document.getElementById('subtitlesContainer');

let subtitles = []; // Array zur Speicherung der Untertitelzeilen
let currentSubtitleIndex = 0; // Index des aktuellen Untertitels
let isSubtitleLoaded = false; // Überprüft, ob Untertitel geladen wurden

// Automatisches Laden des Videos beim Klicken auf einen Sender in der Sidebar
document.getElementById('sidebar-list').addEventListener('click', function(event) {
    if (event.target.classList.contains('channel-info')) {
        const videoURL = event.target.getAttribute('data-video-url');
        const subtitleURL = event.target.getAttribute('data-subtitle-url');

        loadVideo(videoURL);
        if (subtitleURL) {
            loadSubtitles(subtitleURL);
        }
    }
});

// Laden des Videos
function loadVideo(videoURL) {
    videoPlayer.src = videoURL;
    videoPlayer.play();
}

// Laden der Untertitel
function loadSubtitles(subtitleURL) {
    fetch(subtitleURL)
        .then(response => response.text())
        .then(data => {
            parseSubtitles(data);
            isSubtitleLoaded = true;
        })
        .catch(error => console.error('Fehler beim Laden der Untertitel:', error));
}

// Parsen der Untertitel
function parseSubtitles(subtitleText) {
    subtitles = [];
    const subtitleLines = subtitleText.split('\n\n');
    subtitleLines.forEach(line => {
        const parts = line.split('\n');
        const startTime = parseTime(parts[1].split(' --> ')[0]);
        const endTime = parseTime(parts[1].split(' --> ')[1]);
        const text = parts.slice(2).join('\n');
        subtitles.push({ startTime, endTime, text });
    });
}

// Funktion zum Parsen der Zeitangaben in Sekunden
function parseTime(timeString) {
    const timeParts = timeString.split(':').map(parseFloat);
    return timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
}

// Automatische Synchronisation der Untertitel
videoPlayer.addEventListener('timeupdate', function() {
    if (isSubtitleLoaded) {
        const currentTime = videoPlayer.currentTime;
        while (
            currentSubtitleIndex < subtitles.length - 1 &&
            currentTime >= subtitles[currentSubtitleIndex + 1].startTime
        ) {
            currentSubtitleIndex++;
        }
        subtitlesContainer.textContent = subtitles[currentSubtitleIndex].text;
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

// Ändern der Untertitelspur
subtitleSelect.addEventListener('change', function() {
    const selectedSubtitle = subtitleSelect.value;
    // Logik zum Laden und Anzeigen der ausgewählten Untertitel
});

// Weitere Funktionen für Untertitel, Qualitätswiedergabe, etc. hier hinzufügen



// Automatisches Laden des Videos beim Klicken auf einen Sender in der Sidebar
document.getElementById('sidebar-list').addEventListener('click', function(event) {
    if (event.target.classList.contains('channel-info')) {
        const videoURL = event.target.getAttribute('data-video-url');
        const subtitleURL = event.target.getAttribute('data-subtitle-url');

        loadVideo(videoURL);
        if (subtitleURL) {
            loadSubtitles(subtitleURL);
        }
    }
});

// Laden des Videos
function loadVideo(videoURL) {
    videoPlayer.src = videoURL;
    videoPlayer.play();
}


