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
    fetch('data/epg.xml')
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Laden des EPG');
            }
            return response.text();
        })
        .then(data => {
            updateSidebar(data);
        })
        .catch(error => {
            console.error(error);
        });
}

function updateSidebar(data) {
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
