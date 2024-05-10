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



// Globale Definition von epgData
let epgData = {};



function fetchWithRetry(url, options = {}, retries = 3, backoff = 300) {
    return fetch(url, options).then(response => {
        if (response.ok) {
            return response.text();  // oder response.json() je nach Antwortformat
        }
        if (retries > 0) {
            console.log(`Warten auf ${backoff} ms, dann erneuter Versuch. Verbleibende Versuche: ${retries - 1}`);
            return new Promise(resolve => setTimeout(resolve, backoff))
                .then(() => fetchWithRetry(url, options, retries - 1, backoff * 2));
        }
        throw new Error(`HTTP error: ${response.statusText}`);
    }).catch(error => {
        if (retries > 0) {
            console.log(`Warten auf ${backoff} ms, dann erneuter Versuch. Verbleibende Versuche: ${retries - 1}`);
            return new Promise(resolve => setTimeout(resolve, backoff))
                .then(() => fetchWithRetry(url, options, retries - 1, backoff * 2));
        }
        throw error;
    });
}

function loadEPGData() {
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const targetUrl = corsProxy + encodeURIComponent('https://ext.greektv.app/epg/epg.xml');

    fetchWithRetry(targetUrl, {}, 3, 500)  // 3 Versuche mit einer anfänglichen Backoff-Zeit von 500ms
        .then(xmlString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");
            const programmes = xmlDoc.getElementsByTagName("programme");

            epgData = {};  // Löschen der alten EPG-Daten bevor neue Daten gespeichert werden

            Array.from(programmes).forEach(prog => {
                const channelId = prog.getAttribute("channel");
                const title = prog.getElementsByTagName("title")[0]?.textContent;
                const start = prog.getAttribute("start");
                const stop = prog.getAttribute("stop");

                // Prüfen, ob das Programm aktuell läuft und speichern
                const now = new Date();
                const startTime = parseEPGDate(start);
                const endTime = parseEPGDate(stop);

                if (startTime <= now && endTime > now) {  // Programm läuft gerade
                    epgData[channelId] = { title, startTime, endTime };
                }
            });
            console.log("EPG-Daten erfolgreich geladen und aktualisiert.");
        })
        .catch(error => {
            console.error('Fehler beim Laden der EPG-Daten nach mehreren Versuchen:', error);
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






function updateSidebarFromM3U(data) {
    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.innerHTML = '';

    const lines = data.split('\n');
    lines.forEach(line => {
        if (line.startsWith('#EXTINF')) {
            const idMatch = line.match(/tvg-id="([^"]+)"/);
            const channelId = idMatch && idMatch[1];
            const programmeInfo = epgData[channelId];

            const nameMatch = line.match(/,(.*)$/);
            if (nameMatch && nameMatch.length > 1) {
                const name = nameMatch[1].trim();
                const imgMatch = line.match(/tvg-logo="([^"]+)"/);
                let imgURL = imgMatch && imgMatch[1] || 'default_logo.png';

                const title = programmeInfo ? programmeInfo.title : 'Keine aktuelle Sendung verfügbar';
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <div class="channel-info">
                        <div class="logo-container">
                            <img src="${imgURL}" alt="${name} Logo">
                            <span class="sender-name">${name}</span>
                            <span class="epg-channel" id="epg-${channelId}">${title}</span>

                        </div>
                    </div>
                `;
                sidebarList.appendChild(listItem);
            }
        }
    });
}





// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
    loadEPGData(); // Laden der EPG-Daten beim Start
    updateClock(); // Uhrzeit beim Laden der Seite aktualisieren
    setInterval(updateClock, 1000); // Uhrzeit jede Sekunde aktualisieren
    document.getElementById('myPlaylist').addEventListener('click', loadMyPlaylist);
    document.getElementById('externalPlaylist').addEventListener('click', loadExternalPlaylist);
    document.getElementById('sportPlaylist').addEventListener('click', loadSportPlaylist);
});



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

