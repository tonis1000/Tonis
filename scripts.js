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

function loadEPGData() {
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const targetUrl = 'https://ext.greektv.app/epg/epg.xml';

    fetch(corsProxy + encodeURIComponent(targetUrl))
        .then(response => response.text())
        .then(xmlString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");
            const programmes = xmlDoc.getElementsByTagName("programme");

            Array.from(programmes).forEach(prog => {
                const channelId = prog.getAttribute("channel");
                const title = prog.getElementsByTagName("title")[0]?.textContent;
                const start = prog.getAttribute("start");
                const stop = prog.getAttribute("stop");

                // Prüfen, ob das Programm zum aktuellen Zeitpunkt läuft
                const now = new Date();
                const startTime = parseEPGDate(start);
                const endTime = parseEPGDate(stop);

                if (!epgData[channelId] || startTime <= now && endTime > now) {
                    epgData[channelId] = { title, start, stop };
                }
            });
        })
        .catch(error => {
            console.error('Fehler beim Laden der EPG-Daten:', error);
        });
}

function parseEPGDate(epgDateString) {
    // EPG-Daten formatieren: YYYYMMDDHHMMSS +TZ
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
                            <span class="epg-channel" id="{channelId}">${title}</span>
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

