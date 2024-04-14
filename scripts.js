// scripts.js

function loadMyPlaylist() {
    fetch('playlist.m3u') // Pfad zur Playlist-Datei anpassen
        .then(response => response.text())
        .then(data => updateSidebar(data));
}

function loadExternalPlaylist() {
    fetch('https://raw.githubusercontent.com/gluk03/iptvgluk/dd9409c9f9029f6444633267e3031741efedc381/TV.m3u')
        .then(response => response.text())
        .then(data => updateSidebar(data));
}

function loadSportPlaylist() {
    // Implementiere hier die Funktionalität für die Sport-Playlist
    alert("Funktionalität für Sport-Playlist wird implementiert...");
}

function loadEPG() {
    // Führen Sie eine Fetch-Anfrage aus, um das EPG herunterzuladen
    fetch('https://github.com/GreekTVApp/epg-greece-cyprus/releases/download/EPG/epg.xml')
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Laden des EPG');
            }
            return response.text(); // Hier könnte auch response.json() verwendet werden, wenn die Datei im JSON-Format vorliegt
        })
        .then(data => {
            // Hier können Sie den heruntergeladenen Inhalt verarbeiten oder weitere Aktionen ausführen
            location.reload(); // Aktualisieren Sie die Seite, um das aktualisierte EPG anzuzeigen
        })
        .catch(error => {
            console.error(error);
        });
}


function updateSidebar(data) {
    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.innerHTML = ''; // Sidebar leeren, um sicherzustellen, dass alte Einträge entfernt werden

    const lines = data.split('\n');
    lines.forEach(line => {
        if (line.startsWith('#EXTINF')) {
            const nameMatch = line.match(/,(.*)$/); // Sendername aus dem Text nach dem letzten Komma extrahieren
            if (nameMatch && nameMatch.length > 1) {
                const name = nameMatch[1].trim();
                const imgMatch = line.match(/tvg-logo="([^"]+)"/); // URL des Senderlogos extrahieren
                if (imgMatch && imgMatch.length > 1) {
                    const imgURL = imgMatch[1];
                    const listItem = document.createElement('li');
                    const img = document.createElement('img');
                    img.src = imgURL;
                    img.alt = name + ' Logo';
                    img.width = 50; // Breite des Bildes
                    img.height = 50; // Höhe des Bildes
                    listItem.appendChild(img);
                    listItem.appendChild(document.createTextNode(name));
                    sidebarList.appendChild(listItem);
                } else {
                    const listItem = document.createElement('li');
                    listItem.textContent = name;
                    sidebarList.appendChild(listItem);
                }
            }
        }
    });
}

// Dieses Skript blockiert gemischte Inhalte, indem es die Ressourcen in einer sicheren Umgebung lädt
document.addEventListener('DOMContentLoaded', function() {
    var elements = document.querySelectorAll('img[src^="http://"], video[src^="http://"]');
    elements.forEach(function(element) {
        var secureSrc = 'https://' + element.src.split('//')[1]; // Ersetze http durch https
        var proxyURL = 'https://cors-anywhere.herokuapp.com/' + secureSrc; // Verwende einen CORS-Proxy für den Zugriff auf HTTP-Ressourcen von einer HTTPS-Seite
        element.src = proxyURL;
    });

    var playlists = document.querySelectorAll('source[src^="http://"]');
    playlists.forEach(function(playlist) {
        var secureSrc = 'https://' + playlist.src.split('//')[1]; // Ersetze http durch https
        var proxyURL = 'https://cors-anywhere.herokuapp.com/' + secureSrc; // Verwende einen CORS-Proxy für den Zugriff auf HTTP-Ressourcen von einer HTTPS-Seite
        playlist.src = proxyURL;
    });
});
