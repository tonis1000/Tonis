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

function updateSidebar(data) {
    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.innerHTML = ''; // Sidebar leeren, um sicherzustellen, dass alte Einträge entfernt werden

    const lines = data.split('\n');
    lines.forEach(line => {
        if (line.startsWith('#EXTINF')) {
            const commaIndex = line.lastIndexOf(','); // Index des letzten Kommas in der Zeile finden
            if (commaIndex !== -1) {
                const displayName = line.substring(commaIndex + 1).trim(); // Anzeigenamen extrahieren
                const logoUrlMatch = line.match(/tvg-logo="([^"]+)"/); // Logo-URL aus der Zeile extrahieren
                if (logoUrlMatch && logoUrlMatch.length > 1) {
                    const logoUrl = logoUrlMatch[1]; // Logo-URL extrahieren
                    const listItem = document.createElement('li');
                    const img = document.createElement('img');
                    img.src = logoUrl;
                    img.alt = displayName;
                    img.style.width = '50px'; // Breite des Bildes anpassen
                    listItem.appendChild(img);
                    listItem.appendChild(document.createTextNode(displayName));
                    sidebarList.appendChild(listItem);
                }
            }
        }
    });
}


