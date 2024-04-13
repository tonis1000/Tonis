// scripts.js

function loadMyPlaylist() {
    // Hier wird die My Playlist geladen
    fetch('/playlist.m3u')
        .then(response => response.text())
        .then(data => updateSidebar(data));
}

function loadExternalPlaylist() {
    // Hier wird die External Playlist geladen
    fetch('https://raw.githubusercontent.com/gluk03/iptvgluk/dd9409c9f9029f6444633267e3031741efedc381/TV.m3u')
        .then(response => response.text())
        .then(data => updateSidebar(data));
}

function loadSportPlaylist() {
    // Hier wird die Sport Playlist geladen
    // Beispiel: Wenn die Sport Playlist in einer separaten Datei gespeichert ist
    fetch('/sport_playlist.m3u')
        .then(response => response.text())
        .then(data => updateSidebar(data));
}

function updateSidebar(data) {
    const sidebar = document.getElementById('sidebar');
    // Hier kannst du den erhaltenen Daten verwenden, um die Sidebar zu aktualisieren
    sidebar.innerHTML = data; // Beispiel: Einfügen der erhaltenen Daten in die Sidebar
}
