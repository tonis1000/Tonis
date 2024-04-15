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
                listItem.classList.add('channel-item');

                // Erstellen des Image-Tags für das Logo, wenn ein Logo vorhanden ist
                if (imgURL) {
                    const img = document.createElement('img');
                    img.src = imgURL;
                    img.alt = name + ' Logo';
                    img.width = 30;
                    img.height = 20;
                    listItem.appendChild(img);
                }

                // Hinzufügen des Sendernamens
                const nameNode = document.createElement('span');
                nameNode.textContent = name;
                if (/* Bedingung für Stream-Verfügbarkeit */) {
                    nameNode.style.fontWeight = 'bold';
                    nameNode.style.color = 'green';
                }
                listItem.appendChild(nameNode);

                sidebarList.appendChild(listItem);
            }
        }
    });
}


// Funktion zum Abrufen der EPG-Informationen für einen bestimmten Sender
function fetchEPGInfo(channelName) {
    return fetch('data/epg.xml') // Pfad zur lokalen EPG-Datei
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Laden der EPG-Daten');
            }
            return response.text();
        })
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            const programs = xmlDoc.getElementsByTagName('programme');
            for (let i = 0; i < programs.length; i++) {
                const program = programs[i];
                const titleNode = program.getElementsByTagName('title')[0];
                if (titleNode && titleNode.textContent.includes(channelName)) {
                    return titleNode.textContent;
                }
            }
            return 'Kein Programm gefunden';
        })
        .catch(error => console.error('Fehler beim Laden der EPG-Daten:', error));
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

        // Uhrzeit alle Sekunde aktualisieren
        setInterval(updateClock, 1000);
