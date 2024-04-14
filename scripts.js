// Funktion zum Laden der eigenen Playlist
function loadMyPlaylist() {
    fetch('playlist.m3u')
        .then(response => response.text())
        .then(data => updateSidebarFromM3U(data)); // Verwende die Funktion für M3U/M3U8
}

// Funktion zum Laden einer externen Playlist
function loadExternalPlaylist() {
    fetch('https://raw.githubusercontent.com/gluk03/iptvgluk/dd9409c9f9029f6444633267e3031741efedc381/TV.m3u')
        .then(response => response.text())
        .then(data => updateSidebarFromM3U(data)); // Verwende die Funktion für M3U/M3U8
}

// Funktion zum Laden einer Sport-Playlist
function loadSportPlaylist() {
    alert("Funktionalität für Sport-Playlist wird implementiert...");
}

// Funktion zum manuellen Laden des EPG
function loadEPG() {
    fetch('https://github.com/GreekTVApp/epg-greece-cyprus/releases/download/EPG/epg.xml')
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Laden des EPG');
            }
            return response.text(); // Hier könnte auch response.json() verwendet werden, wenn die Datei im JSON-Format vorliegt
        })
        .then(data => {
            updateSidebarFromXML(data); // Verwende die Funktion für das EPG
        })
        .catch(error => {
            console.error(error);
        });
}

// Funktion zum Aktualisieren der Seitenleiste aus einer M3U/M3U8-Datei
function updateSidebarFromM3U(data) {
    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.innerHTML = '';

    const lines = data.split('\n');
    lines.forEach(line => {
        if (!line.startsWith('#')) { // Ignoriere Kommentare
            const listItem = document.createElement('li');
            listItem.textContent = line.trim(); // Füge den Sender direkt zur Liste hinzu
            sidebarList.appendChild(listItem);
        }
    });
}

// Funktion zum Aktualisieren der Seitenleiste aus einer XML-Datei für das EPG
function updateSidebarFromXML(data) {
    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.innerHTML = '';

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');
    const channels = xmlDoc.getElementsByTagName('channel');

    for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        const channelName = channel.getElementsByTagName('display-name')[0].textContent;

        const programs = channel.getElementsByTagName('programme');
        for (let j = 0; j < programs.length; j++) {
            const program = programs[j];
            const title = program.getElementsByTagName('title')[0].textContent;
            const listItem = document.createElement('li');
            listItem.textContent = channelName + ' - ' + title;
            sidebarList.appendChild(listItem);
        }
    }
}
