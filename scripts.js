// Funktion zum Laden der Playlist.m3u und Aktualisieren der Sidebar
function loadMyPlaylist() {
    fetch('playlist.m3u')
        .then(response => response.text())
        .then(data => updateSidebarFromM3U(data))
        .catch(error => console.error('Fehler beim Laden der Playlist:', error));
}

// Funktion zum Laden der externen Playlist und Aktualisieren der Sidebar
function loadExternalPlaylist() {
    fetch('https://raw.githubusercontent.com/gluk03/iptvgluk/dd9409c9f9029f6444633267e3031741efedc381/TV.m3u')
        .then(response => response.text())
        .then(data => updateSidebarFromM3U(data))
        .catch(error => console.error('Fehler beim Laden der externen Playlist:', error));
}

// Funktion zum Laden der Sport-Playlist und Aktualisieren der Sidebar
function loadSportPlaylist() {
    alert("Funktionalität für Sport-Playlist wird implementiert...");
}

// Globales Objekt für EPG-Daten
let epgData = {};

// Funktion zum Laden und Parsen der EPG-Daten
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
                const descElement = prog.getElementsByTagName('desc')[0];
                if (titleElement) {
                    const title = titleElement.textContent;
                    const desc = descElement ? descElement.textContent : 'Keine Beschreibung verfügbar';
                    if (!epgData[channelId]) {
                        epgData[channelId] = [];
                    }
                    epgData[channelId].push({
                        start: parseDateTime(start),
                        stop: parseDateTime(stop),
                        title: title,
                        desc: desc
                    });
                }
            });
        })
        .catch(error => console.error('Fehler beim Laden der EPG-Daten:', error));
}

// Hilfsfunktion zum Umwandeln der EPG-Zeitangaben in Date-Objekte
function parseDateTime(epgTime) {
    if (!epgTime || epgTime.length < 19) {
        console.error('Ungültige EPG-Zeitangabe:', epgTime);
        return null;
    }

    const year = parseInt(epgTime.substr(0, 4), 10);
    const month = parseInt(epgTime.substr(4, 2), 10) - 1;
    const day = parseInt(epgTime.substr(6, 2), 10);
    const hour = parseInt(epgTime.substr(8, 2), 10);
    const minute = parseInt(epgTime.substr(10, 2), 10);
    const second = parseInt(epgTime.substr(12, 2), 10);
    const tzHour = parseInt(epgTime.substr(15, 3), 10);
    const tzMin = parseInt(epgTime.substr(18, 2), 10) * (epgTime[14] === '+' ? 1 : -1);

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second) || isNaN(tzHour) || isNaN(tzMin)) {
        console.error('Ungültige EPG-Zeitangabe:', epgTime);
        return null;
    }

    if (year < 0 || month < 0 || month > 11 || day < 1 || day > 31) {
        console.error('Ungültige EPG-Zeitangabe:', epgTime);
        return null;
    }

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
            const description = currentProgram.desc || 'Keine Beschreibung verfügbar';
            const start = currentProgram.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const end = currentProgram.stop.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const title = currentProgram.title.replace(/\s*\[.*?\]\s*/g, '').replace(/[\[\]]/g, '');

            return {
                title: `${title} (${start} - ${end})`,
                description: description,
                pastPercentage: pastPercentage,
                futurePercentage: futurePercentage
            };
        } else {
            return { title: 'Keine aktuelle Sendung verfügbar', description: 'Keine Beschreibung verfügbar', pastPercentage: 0, futurePercentage: 0 };
        }
    }
    return { title: 'Keine EPG-Daten verfügbar', description: 'Keine Beschreibung verfügbar', pastPercentage: 0, futurePercentage: 0 };
}

// Funktion zum Aktualisieren des Players mit der Programmbeschreibung
function updatePlayerDescription(title, description) {
    document.getElementById('program-title').textContent = title;
    document.getElementById('program-desc').textContent = description;
}

// Funktion zum Extrahieren des Stream-URLs aus der M3U-Datei
function extractStreamURLs(data) {
    const lines = data.split('\n');
    const streamURLs = {};
    let currentChannelId = null;
    lines.forEach(line => {
        if (line.startsWith('#EXTINF')) {
            const idMatch = line.match(/tvg-id="([^"]+)"/);
            currentChannelId = idMatch && idMatch[1];
        } else if (currentChannelId && line.trim()) {
            streamURLs[currentChannelId] = streamURLs[currentChannelId] || [];
            streamURLs[currentChannelId].push(line.trim());
            currentChannelId = null;
        }
    });
    return streamURLs;
}

// Funktion zum Aktualisieren der Sidebar von einer M3U-Datei
function updateSidebarFromM3U(data) {
    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.innerHTML = '';

    const streamURLs = extractStreamURLs(data);
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
                const streamURL = streamURLs[channelId] && streamURLs[channelId].shift(); // Nächste URL für den Channel

                if (streamURL) {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <div class="channel-info" data-stream="${streamURL}" data-channel-id="${channelId}">
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
        }
    });

    checkStreamStatus();
}

// Funktion zum Überprüfen des Status der Streams
function checkStreamStatus() {
    const sidebarChannels = document.querySelectorAll('.channel-info');
    sidebarChannels.forEach(channel => {
        const streamURL = channel.dataset.stream;
        if (streamURL) {
            fetch(streamURL)
                .then(response => {
                    if (response.ok) {
                        channel.querySelector('.sender-name').classList.add('online');
                    } else {
                        channel.querySelector('.sender-name').classList.add('offline');
                    }
                })
                .catch(error => {
                    channel.querySelector('.sender-name').classList.add('offline');
                });
        }
    });
}

// Hauptfunktion zum Initialisieren des Players
function initializePlayer() {
    const videoPlayer = document.getElementById('video-player');
    const playButton = document.getElementById('play-button');

    // Event-Listener für Play-Button
    playButton.addEventListener('click', () => {
        const streamURL = document.getElementById('stream-url').value.trim();
        if (streamURL) {
            playStream(streamURL);
        }
    });

    // Event-Listener für Auswahl eines Kanals aus der Sidebar
    document.getElementById('sidebar-list').addEventListener('click', event => {
        const channelInfo = event.target.closest('.channel-info');
        if (channelInfo) {
            const streamURL = channelInfo.dataset.stream;
            const channelId = channelInfo.dataset.channelId;
            const programInfo = getCurrentProgram(channelId);
            updatePlayerDescription(programInfo.title, programInfo.description);
            playStream(streamURL);
        }
    });

    // Event-Listener für Auswahl einer Untertiteldatei
    document.getElementById('subtitle-file').addEventListener('change', event => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const subtitleTrack = document.getElementById('subtitle-track');
                subtitleTrack.src = 'data:text/vtt;charset=utf-8,' + convertSrtToVtt(e.target.result);
                videoPlayer.textTracks[0].mode = 'showing';
            };
            reader.readAsText(file);
        }
    });

    // Uhrzeit- und Datumsanzeige aktualisieren
    setInterval(() => {
        const now = new Date();
        document.getElementById('uhrzeit').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById('datum').textContent = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }, 1000);

    // Funktionen zum Laden der Playlists
    document.getElementById('myPlaylist').addEventListener('click', loadMyPlaylist);
    document.getElementById('externalPlaylist').addEventListener('click', loadExternalPlaylist);
    document.getElementById('sportPlaylist').addEventListener('click', loadSportPlaylist);

    // EPG-Daten laden
    loadEPGData();
}

// Funktion zum Abspielen des Streams
function playStream(streamURL) {
    const videoPlayer = document.getElementById('video-player');
    if (Hls.isSupported() && streamURL.endsWith('.m3u8')) {
        const hls = new Hls();
        hls.loadSource(streamURL);
        hls.attachMedia(videoPlayer);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoPlayer.play();
        });
    } else if (dashjs.MediaPlayer().isSupported() && streamURL.endsWith('.mpd')) {
        const player = dashjs.MediaPlayer().create();
        player.initialize(videoPlayer, streamURL, true);
    } else {
        videoPlayer.src = streamURL;
        videoPlayer.addEventListener('loadedmetadata', () => {
            videoPlayer.play();
        });
    }
}

// Funktion zum Konvertieren von SRT zu VTT
function convertSrtToVtt(srt) {
    const vtt = srt.replace(/(\d+)\n(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/g, (match, p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
        return `${p1}\n${p2}:${p3}:${p4}.${p5} --> ${p6}:${p7}:${p8}.${p9}`;
    });
    return 'WEBVTT\n\n' + vtt;
}

// Initialisierung des Players beim Laden der Seite
document.addEventListener('DOMContentLoaded', initializePlayer);
