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
                console.log('Start:', start, 'Stop:', stop); // Add this line
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
    // Split the epgTime string to separate date and time parts
    const dateTimeParts = epgTime.split(' ');
    const datePart = dateTimeParts[0]; // YYYYMMDD
    const timePart = dateTimeParts[1]; // HHMMSS

    // Extract date components
    const year = parseInt(datePart.substr(0, 4), 10);
    const month = parseInt(datePart.substr(4, 2), 10) - 1; // Month is zero-based in JavaScript
    const day = parseInt(datePart.substr(6, 2), 10);

    // Extract time components
    const hour = parseInt(timePart.substr(0, 2), 10);
    const minute = parseInt(timePart.substr(2, 2), 10);
    const second = parseInt(timePart.substr(4, 2), 10);

    // Create a new Date object with UTC date and time components
    const date = new Date(Date.UTC(year, month, day, hour, minute, second));
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
