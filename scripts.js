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

                // Erstellen des Image-Tags für das Logo
                const img = document.createElement('img');
                img.src = imgURL;
                img.alt = name + ' Logo';
                img.width = 50;
                img.height = 50;
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
// Aktualisieren der aktuellen Datum- und Uhrzeitinformationen
        function updateDateTime() {
            const now = new Date();
            document.getElementById('tag').textContent = now.toLocaleDateString('de-DE', { weekday: 'long' });
            document.getElementById('datum').textContent = now.toLocaleDateString('de-DE');
            document.getElementById('uhrzeit').textContent = now.toLocaleTimeString('de-DE');
        }

        // Laden der aktuellen Temperatur in München von OpenWeatherMap API
        function loadTemperature() {
            fetch('https://api.openweathermap.org/data/2.5/weather?q=Munich,de&appid=YOUR_API_KEY&units=metric')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('temperatur').textContent = data.main.temp + '°C';
                })
                .catch(error => {
                    console.error('Fehler beim Laden der Temperatur:', error);
                    document.getElementById('temperatur').textContent = 'N/A';
                });
        }

        // Aktualisieren der Datum- und Uhrzeitinformationen beim Laden der Seite
        window.onload = function() {
            updateDateTime();
            loadTemperature();
            // Aktualisiere alle 10 Sekunden
            setInterval(updateDateTime, 10000);
        };
