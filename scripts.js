<!-- Video-Container -->
<div id="player-container">
    <video id="player" playsinline controls></video>
</div>

<!-- Sidebar -->
<ul id="sidebar-list"></ul>

<!-- Skripte für HLS.js und Plyr -->
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script src="https://cdn.plyr.io/3.6.8/plyr.polyfilled.js"></script>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const videoElement = document.getElementById('player');
        const player = new Plyr(videoElement);

        function updatePlayer(streamURL) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(streamURL);
                hls.attachMedia(videoElement);
            } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                videoElement.src = streamURL;
            }
            player.restart();
        }

        function loadMyPlaylist() {
            fetch('playlist.m3u')
                .then(response => response.text())
                .then(data => updateSidebarFromM3U(data))
                .catch(error => console.error('Fehler beim Laden der Playlist:', error));
        }

        function loadExternalPlaylist() {
            fetch('https://raw.githubusercontent.com/gluk03/iptvgluk/dd9409c9f9029f6444633267e3031741efedc381/TV.m3u')
                .then(response => response.text())
                .then(data => updateSidebarFromM3U(data))
                .catch(error => console.error('Fehler beim Laden der externen Playlist:', error));
        }

        function loadSportPlaylist() {
            alert("Funktionalität für Sport-Playlist wird implementiert...");
        }

        function updateSidebarFromM3U(data) {
            const sidebarList = document.getElementById('sidebar-list');
            sidebarList.innerHTML = '';

            const lines = data.split('\n');
            let currentChannelName = '';
            lines.forEach(line => {
                if (line.startsWith('#EXTINF')) {
                    const nameMatch = line.match(/,(.*)$/);
                    if (nameMatch && nameMatch.length > 1) {
                        currentChannelName = nameMatch[1].trim();
                    }
                } else if (line.trim() !== '') {
                    const listItem = createSidebarListItem(currentChannelName, line.trim());
                    sidebarList.appendChild(listItem);
                }
            });
        }

        function createSidebarListItem(channelName, streamURL) {
            const listItem = document.createElement('li');

            const nameNode = document.createElement('span');
            nameNode.textContent = channelName;
            listItem.appendChild(nameNode);

            listItem.setAttribute('data-stream-url', streamURL);

            listItem.addEventListener('click', () => {
                const streamURL = listItem.getAttribute('data-stream-url');
                updatePlayer(streamURL);
            });

            fetchEPGInfo(channelName)
                .then(epgInfo => {
                    const epgInfoNode = document.createElement('span');
                    epgInfoNode.textContent = epgInfo;
                    listItem.appendChild(epgInfoNode);
                })
                .catch(error => console.error('Fehler beim Laden der EPG-Informationen:', error));

            return listItem;
        }

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
                            const startTime = program.getAttribute('start');
                            const endTime = program.getAttribute('stop');
                            const startTimeObj = new Date(startTime);
                            const endTimeObj = new Date(endTime);
                            const now = new Date();
                            if (now >= startTimeObj && now <= endTimeObj) {
                                return titleNode.textContent;
                            }
                        }
                    }
                    return 'Kein Programm gefunden';
                })
                .catch(error => console.error('Fehler beim Laden der EPG-Daten:', error));
        }

        function updateClock() {
            const now = new Date();
            const tag = now.toLocaleDateString('de-DE', { weekday: 'long' });
            const datum = now.toLocaleDateString('de-DE');
            const uhrzeit = now.toLocaleTimeString('de-DE', { hour12: false });
            document.getElementById('tag').textContent = tag;
            document.getElementById('datum').textContent = datum;
            document.getElementById('uhrzeit').textContent = uhrzeit;
        }

        updateClock();
        setInterval(updateClock, 1000);

        loadMyPlaylist();
    });
</script>
