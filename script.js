// script.js

document.addEventListener('DOMContentLoaded', function() {
    const myPlaylistBtn = document.getElementById('myPlaylistBtn');
    const externalPlaylistBtn = document.getElementById('externalPlaylistBtn');
    const sportBtn = document.getElementById('sportBtn');
    const sidebar = document.getElementById('sidebar');

    myPlaylistBtn.addEventListener('click', function() {
        // Hier kannst du deine eigene Playlist laden und die Kanäle zur Sidebar hinzufügen
        // Beispiel: sidebar.innerHTML = '<ul>...</ul>';
    });

    externalPlaylistBtn.addEventListener('click', function() {
        // Hier kannst du die externe Playlist laden und die Kanäle zur Sidebar hinzufügen
        // Beispiel: sidebar.innerHTML = '<ul>...</ul>';
    });

    sportBtn.addEventListener('click', function() {
        // Hier kannst du die Sportkanäle laden und zur Sidebar hinzufügen
        // Beispiel: sidebar.innerHTML = '<ul>...</ul>';
    });
});
