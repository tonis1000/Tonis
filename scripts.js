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
    fetch('/reload-epg') // Aufrufen der Flask-Route zum Neuladen der EPG-Daten
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Laden der EPG-Daten');
            }
            return response.text();
        })
        .then(data => {
            updateSidebarFromXML(data); // Aktualisieren der Sidebar mit den neuen EPG-Daten
        })
        .catch(error => {
            console.error('Fehler beim Laden der EPG-Daten:', error);
        });
}

// Aktualisieren der Sidebar mit Daten aus der Playlist.m3u
function updateSidebarFromM3U(data) {
    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.innerHTML = '';

    const lines = data.split('\n');
    lines.forEach(line => {
        if (line.startsWith('#EXTINF')) {
            const nameMatch = line.match(/,(.*)$/);
            if (nameMatch && nameMatch.length > 1) {
                const name = nameMatch[1].trim();
                const imgMatch = line.match(/tvg-logo="([^"]+)"/);
                let imgURL = '';
                if (imgMatch && imgMatch.length > 1) {
                    imgURL = imgMatch[1];
                }
                const listItem = document.createElement('li');

                // Erstellen des Image-Tags für das Logo
                const img = document.createElement('img');
                img.src = imgURL;
                img.alt = name + ' Logo';
                img.width = 30;
                img.height = 20;
                listItem.appendChild(img);

                // Hinzufügen des Sendernamens
                const nameNode = document.createElement('span');
                nameNode.textContent = name;
                listItem.appendChild(nameNode);

                // Hinzufügen der aktuellen EPG-Informationen
                fetchEPGInfo(name)
                    .then(epgInfo => {
                        const epgInfoNode = document.createElement('span');
                        epgInfoNode.textContent = epgInfo;
                        listItem.appendChild(epgInfoNode);
                    })
                    .catch(error => console.error('Fehler beim Laden der EPG-Informationen:', error));

                sidebarList.appendChild(listItem);
            }
        }
    });
}

function fetchEPGInfo(channelName) {
    return fetch('data/epg.xml') // Pfadeinstellung zur lokalen EPG-Datei
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Laden der EPG-Daten');
            }
            return response.text();
        })
        .then(data => {
            return getCurrentProgram(data, channelName); // Aktuelle Programminformationen für den Kanal abrufen
        })
        .catch(error => {
            console.error(error);
            return 'Keine EPG-Informationen verfügbar';
        });
}

function updateSidebarFromXML(data) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');
    const channels = xmlDoc.getElementsByTagName('channel');

    for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        const channelName = channel.getElementsByTagName('display-name')[0].textContent;

        const currentProgram = getCurrentProgram(data, channelName);
        const sidebarList = document.getElementById('sidebar-list');

        const listItem = document.createElement('li');
        listItem.textContent = `${channelName} - ${currentProgram}`;
        sidebarList.appendChild(listItem);
    }
}

function getCurrentProgram(xmlData, channelName) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
    const programs = xmlDoc.getElementsByTagName('programme');
    for (let i = 0; i < programs.length; i++) {
        const program = programs[i];
        const titleNode = program.getElementsByTagName('title')[0];
        if (titleNode && titleNode.textContent.includes(channelName)) {
            return titleNode.textContent;
        }
    }
    return 'Kein Programm gefunden';
}
