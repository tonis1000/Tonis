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

// Laden der EPG-Daten und Aktualisieren der Sidebar
function loadEPG() {
    fetch('/reload-epg')
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Laden des EPG');
            }
            return response.text();
        })
        .then(data => {
            console.log('EPG erfolgreich aktualisiert');
            updateSidebarFromXML(data);
        })
        .catch(error => {
            console.error('Fehler beim Laden der EPG-Daten:', error);
        });
}

function updateSidebarFromM3U(data) {
    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.innerHTML = '';  // Clear existing entries

    const lines = data.split('\n');
    lines.forEach(line => {
        if (line.startsWith('#EXTINF')) {
            const idMatch = line.match(/tvg-id="([^"]+)"/);
            const channelId = idMatch && idMatch[1];
            const nameMatch = line.match(/,(.*)$/);
            const imgMatch = line.match(/tvg-logo="([^"]+)"/);

            const name = nameMatch && nameMatch[1] ? nameMatch[1].trim() : 'Unbekannter Sender';
            const imgURL = imgMatch && imgMatch[1] ? imgMatch[1] : 'default_logo.png';

            // Extract current program title from epgData using channelId
            const currentProgram = epgData[channelId] ? epgData[channelId].title : 'Keine aktuelle Sendung verfügbar';

            // Create list item for each channel
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="channel-info">
                    <div class="logo-container">
                        <img src="${imgURL}" alt="${name} Logo">
                        <span class="sender-name">${name}</span>
                        <span class="epg-channel">${currentProgram}</span>
                    </div>
                </div>
            `;
            sidebarList.appendChild(listItem);
        }
    });
}

function loadEPGData() {
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const targetUrl = 'https://ext.greektv.app/epg/epg.xml';

    fetch(corsProxy + encodeURIComponent(targetUrl))
        .then(response => response.text())
        .then(xmlString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");
            const programmes = xmlDoc.getElementsByTagName("programme");
            const now = new Date();
            
            Array.from(programmes).forEach(prog => {
                const channelId = prog.getAttribute("channel");
                const start = prog.getAttribute("start");
                const stop = prog.getAttribute("stop");
                const title = prog.getElementsByTagName("title")[0]?.textContent;

                // Convert EPG times
                const startTime = parseEPGDate(start);
                const stopTime = parseEPGDate(stop);

                // Check if the current program is on air
                if (startTime <= now && stopTime > now) {
                    if (!epgData[channelId] || startTime > parseEPGDate(epgData[channelId].start)) {
                        epgData[channelId] = { title, start, stop };
                    }
                }
            });
        })
        .catch(error => {
            console.error('Fehler beim Laden der EPG-Daten:', error);
        });
}

function parseEPGDate(epgDateString) {
    // YYYYMMDDHHMMSS +0000
    return new Date(
        parseInt(epgDateString.substr(0, 4), 10),
        parseInt(epgDateString.substr(4, 2), 10) - 1,
        parseInt(epgDateString.substr(6, 2), 10),
        parseInt(epgDateString.substr(8, 2), 10),
        parseInt(epgDateString.substr(10, 2), 10),
        parseInt(epgDateString.substr(12, 2), 10)
    );
}


// Funktion zum Abrufen der aktuellen Uhrzeit
function updateClock() {
    const now = new Date();
    const tag = now.toLocaleDateString('de-DE', { weekday: 'long' });
    const datum = now.toLocaleDateString('de-DE');
    const uhrzeit = now.toLocaleTimeString('de-DE', { hour12: false });
    document.getElementById('tag').textContent = tag;
    document.getElementById('datum').textContent = datum;
    document.getElementById('uhrzeit').textContent = uhrzeit;
}

// Uhrzeit beim Laden der Seite aktualisieren
updateClock();

// Uhrzeit jede Sekunde aktualisieren
setInterval(updateClock, 1000);

// Event Listener für die Buttons hinzufügen
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('myPlaylist').addEventListener('click', loadMyPlaylist);
    document.getElementById('externalPlaylist').addEventListener('click', loadExternalPlaylist);
    document.getElementById('sportPlaylist').addEventListener('click', loadSportPlaylist);
});
