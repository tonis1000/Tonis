// scripts.js

function loadMyPlaylist() {
    fetch('/playlist.m3u') // Pfad zur Playlist-Datei anpassen
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
            const nameMatch = line.match(/tvg-name="([^"]+)"/); // Sender- oder Kanalname aus dem Attribut tvg-name extrahieren
            if (nameMatch && nameMatch.length > 1) {
                const name = nameMatch[1];
                const listItem = document.createElement('li');
                listItem.textContent = name;
                sidebarList.appendChild(listItem);
            }
        }
    });
}
