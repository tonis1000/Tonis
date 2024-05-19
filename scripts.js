// Funktion, um die Playlist-Datei zu laden
function makeProxyRequest(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // Hier kannst du die Playlist-Datei parsen und verarbeiten
            // Zum Beispiel: updateSidebarFromM3U(data);
            console.log('Playlist loaded successfully:', data);
        })
        .catch(error => {
            console.error('Error fetching playlist:', error);
        });
}

// Funktion zum Laden der Playlist.m3u und Aktualisieren der Sidebar
function loadMyPlaylist() {
    makeProxyRequest('playlist.m3u')
        .then(data => updateSidebarFromM3U(data))
        .catch(error => console.error('Fehler beim Laden der Playlist:', error));
}

// Funktion zum Laden der externen Playlist und Aktualisieren der Sidebar
function loadExternalPlaylist() {
    makeProxyRequest('https://raw.githubusercontent.com/gluk03/iptvgluk/dd9409c9f9029f6444633267e3031741efedc381/TV.m3u')
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
    // Überprüfen, ob epgTime vorhanden und nicht leer ist
    if (!epgTime || epgTime.length < 19) {
        console.error('Ungültige EPG-Zeitangabe:', epgTime);
        return null;
    }

    // Format: YYYYMMDDHHMMSS ±ZZZZ
    const year = parseInt(epgTime.substr(0, 4), 10);
    const month = parseInt(epgTime.substr(4, 2), 10) - 1; // Monate sind 0-basiert in JavaScript
    const day = parseInt(epgTime.substr(6, 2), 10);
    const hour = parseInt(epgTime.substr(8, 2), 10);
    const minute = parseInt(epgTime.substr(10, 2), 10);
    const second = parseInt(epgTime.substr(12, 2), 10);
    const tzHour = parseInt(epgTime.substr(15, 3), 10);
    const tzMin = parseInt(epgTime.substr(18, 2), 10) * (epgTime[14] === '+' ? 1 : -1);

    // Überprüfen, ob die geparsten Werte gültig sind
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second) || isNaN(tzHour) || isNaN(tzMin)) {
        console.error('Ungültige EPG-Zeitangabe:', epgTime);
        return null;
    }

    // Überprüfen, ob das Jahr, der Monat und der Tag im gültigen Bereich liegen
    if (year < 0 || month < 0 || month > 11 || day < 1 || day > 31) {
        console.error('Ungültige EPG-Zeitangabe:', epgTime);
        return null;
    }

    // Erstellen und zurückgeben des Date-Objekts
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

            // Extrahiere auch die Beschreibung des laufenden Programms
            const description = currentProgram.desc || 'Keine Beschreibung verfügbar';

            return {
                title: currentProgram.title,
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
function extractStreamURL(data, channelId) {
    const lines = data.split('\n');
    let streamURL = null;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF')) {
            const idMatch = lines[i].match(/tvg-id="([^"]+)"/);
            const currentChannelId = idMatch && idMatch[1];
            if (currentChannelId === channelId) {
                const urlLine = lines[i + 1];
                streamURL = urlLine.trim();
                break;
            }
        }
    }
    return streamURL;
}

// Funktion zum Aktualisieren der Sidebar von einer M3U-Datei
function updateSidebarFromM3U(data) {
    const sidebarList = document.getElementById('sidebar-list');
    console.log('Updating sidebar with playlist data:', data);
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
                const streamURL = extractStreamURL(data, channelId); // Extrahieren des Stream-URLs

                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <div class="channel-info" data-stream="${streamURL}" data-channel-id="${channelId}"> <!-- Datenattribute für den Stream-URL und die Channel-ID -->
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

    // Nachdem die Sidebar aktualisiert wurde, den Status der Streams überprüfen
    checkStreamStatus();
}





// Funktion zum Überprüfen des Status der Streams
function checkStreamStatus() {
    const sidebarChannels = document.querySelectorAll('.channel-info');
    sidebarChannels.forEach(channel => {
        const streamURL = channel.dataset.stream; // Stream-URL aus dem Datenattribut erhalten
        if (streamURL) {
            // Status der Stream-Verfügbarkeit überprüfen
            fetch(streamURL)
                .then(response => {
                    if (response.ok) {
                        // Stream ist verfügbar
                        channel.querySelector('.sender-name').classList.add('online'); // Sendername markieren
                    } else {
                        // Stream ist nicht verfügbar
                        channel.querySelector('.sender-name').classList.remove('online'); // Sendername zurücksetzen
                    }
                })
                .catch(error => {
                    // Fehler beim Überprüfen des Stream-Status
                    console.error('Fehler beim Überprüfen des Stream-Status:', error);
                    channel.querySelector('.sender-name').classList.remove('online'); // Sendername zurücksetzen
                });
        }
    });
}

// Ereignisbehandler für Klicks auf Sender
document.addEventListener('DOMContentLoaded', function () {
    loadEPGData();
    updateClock();
    setInterval(updateClock, 1000);
    document.getElementById('myPlaylist').addEventListener('click', loadMyPlaylist);
    document.getElementById('externalPlaylist').addEventListener('click', loadExternalPlaylist);
    document.getElementById('sportPlaylist').addEventListener('click', loadSportPlaylist);

    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.addEventListener('click', function (event) {
        const channelInfo = event.target.closest('.channel-info');
        if (channelInfo) {
            const streamURL = channelInfo.dataset.stream;
            const channelId = channelInfo.dataset.channelId;
            const programInfo = getCurrentProgram(channelId);

            setCurrentChannel(channelInfo.querySelector('.sender-name').textContent, streamURL);
            playStream(streamURL);

            // Aktualisieren der Programmbeschreibung
            updatePlayerDescription(programInfo.title, programInfo.description);
        }
    });

    setInterval(checkStreamStatus, 60000);

    const playButton = document.getElementById('play-button');
    const streamUrlInput = document.getElementById('stream-url');

    const playStreamFromInput = () => {
        const streamUrl = streamUrlInput.value;
        if (streamUrl) {
            playStream(streamUrl);
        }
    };

    playButton.addEventListener('click', playStreamFromInput);

    streamUrlInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            playStreamFromInput();
        }
    });
});

// Funktion zum Abspielen eines HLS-Streams im Video-Player
function playStream(streamURL) {
    const videoPlayer = document.getElementById('video-player');
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streamURL);
        hls.attachMedia(videoPlayer);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            videoPlayer.play();
        });
    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayer.src = streamURL;
        videoPlayer.addEventListener('loadedmetadata', function () {
            videoPlayer.play();
        });
    } else {
        console.error('HLS wird vom aktuellen Browser nicht unterstützt.');
    }
}

// Funktion zum Setzen des aktuellen Sendernamens und der URL
function setCurrentChannel(channelName, streamUrl) {
    const currentChannelName = document.getElementById('current-channel-name');
    const streamUrlInput = document.getElementById('stream-url');
    currentChannelName.textContent = channelName; // Nur der Sendername
    streamUrlInput.value = streamUrl;
}

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
