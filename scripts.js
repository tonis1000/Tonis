// ==============================
// Playlist Loading Functions
// ==============================

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

// ==============================
// EPG Data Handling
// ==============================

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
    if (!epgTime || epgTime.length < 19) {
        console.error('Ungültige EPG-Zeitangabe:', epgTime);
        return null;
    }
    const year = parseInt(epgTime.substr(0, 4), 10);
    const month = parseInt(epgTime.substr(4, 2), 10) - 1; // Monate sind 0-basiert in JavaScript
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

// ==============================
// Sidebar and Stream Handling
// ==============================

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
                const streamURL = extractStreamURL(data, channelId);

                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <div class="channel-info" data-stream="${streamURL}">
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
                        channel.querySelector('.sender-name').classList.remove('online');
                    }
                })
                .catch(error => {
                    console.error('Fehler beim Überprüfen des Stream-Status:', error);
                    channel.querySelector('.sender-name').classList.remove('online');
                });
        }
    });
}

// ==============================
// Event Handling and Stream Playback
// ==============================

// Ereignisbehandler für Klicks auf Sender
document.addEventListener('DOMContentLoaded', function () {
    loadEPGData();
    updateClock();
    setInterval(updateClock, 1000);
    document.getElementById('myPlaylist').addEventListener('click', loadMyPlaylist);
    document.getElementById('externalPlaylist').addEventListener('click', loadExternalPlaylist);
    document.get
