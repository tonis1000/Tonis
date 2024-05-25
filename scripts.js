// Aktualisierter Code
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('de-DE', options);
}

function formatTime(time) {
    const options = { hour: 'numeric', minute: 'numeric', hour12: false };
    return new Date(time).toLocaleTimeString('de-DE', options);
}

function goToNextDate() {
    const currentDate = new Date();
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    console.log("Navigiere zum nächsten Datum:", formatDate(nextDate));
}

function eventFiltered(channelId) {
    if (epgData[channelId]) {
        return epgData[channelId];
    } else {
        return [];
    }
}

function showModal(event) {
    if (event && event.title && event.desc) {
        console.log("Modal anzeigen für Ereignis:", event.title, event.desc);
    } else {
        console.error("Ungültiges Ereignis für Modalanzeige:", event);
    }
}

function calculateWidth(actualTime, endTime, index) {
    const startTime = new Date(actualTime);
    const endTimeDate = new Date(endTime);
    const duration = endTimeDate - startTime;
    const width = duration / (index + 1);
    return `${width}px`;
}

function calculateActiveWidth(actualTime, endTime, index) {
    const currentTime = new Date();
    const startTime = new Date(actualTime);
    const endTimeDate = new Date(endTime);
    let activeWidth = 0;

    if (currentTime > startTime && currentTime < endTimeDate) {
        const pastTime = currentTime - startTime;
        const totalTime = endTimeDate - startTime;
        activeWidth = (pastTime / totalTime) * 100;
    } else if (currentTime >= endTimeDate) {
        activeWidth = 100;
    }

    return `${activeWidth}%`;
}
new Vue({
  el: '#app',
  data: {
    displayDate: '', // Datum, das angezeigt werden soll
    hours: '', // Stunde
    minutes: '', // Minute
    hoursArray: [], // Array von Stunden für die Zeitleiste
    channelsFiltered: [], // Gefilterte Liste von Kanälen
    epgData: {}, // Globales Objekt für EPG-Daten
    showModal: function(event) {
      if (event && event.title && event.desc) {
          console.log("Modal anzeigen für Ereignis:", event.title, event.desc);
          // Hier kannst du die Logik für die Anzeige des Modals implementieren
      } else {
          console.error("Ungültiges Ereignis für Modalanzeige:", event);
      }
    }
    // Weitere Daten, die du benötigst...
  },
  methods: {
    goToPrevDate: function() {
      // Logik für das Navigieren zum vorherigen Datum
      // ...
    },
    goToNextDate: function() {
      // Logik für das Navigieren zum nächsten Datum
      const currentDate = new Date();
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);
      console.log("Navigiere zum nächsten Datum:", formatDate(nextDate));
    },
    eventFiltered: function(channelId) {
      // Logik für die Filterung von Ereignissen basierend auf dem Kanal
      if (this.epgData[channelId]) {
          return this.epgData[channelId];
      } else {
          return [];
      }
    },
    calculateWidth: function(actualTime, endTime, index) {
      // Berechnung der Breite eines Programmbalkens
      const startTime = new Date(actualTime);
      const endTimeDate = new Date(endTime);
      const duration = endTimeDate - startTime;
      const width = duration / (index + 1);
      return `${width}px`;
    },
    calculateActiveWidth: function(actualTime, endTime, index) {
      // Berechnung der aktiven Breite eines Programmbalkens
      const currentTime = new Date();
      const startTime = new Date(actualTime);
      const endTimeDate = new Date(endTime);
      let activeWidth = 0;

      if (currentTime > startTime && currentTime < endTimeDate) {
          const pastTime = currentTime - startTime;
          const totalTime = endTimeDate - startTime;
          activeWidth = (pastTime / totalTime) * 100;
      } else if (currentTime >= endTimeDate) {
          activeWidth = 100;
      }

      return `${activeWidth}%`;
    }
    // Weitere Methoden, die du benötigst...
  },
  mounted() {
    // Initialisierungsfunktionen hier aufrufen
    loadEPGData(); // Laden und Parsen der EPG-Daten
    updateClock(); // Uhrzeit aktualisieren
    setInterval(updateClock, 1000); // Uhrzeit regelmäßig aktualisieren
    setInterval(checkStreamStatus, 60000); // Stream-Status regelmäßig überprüfen
  }
});
// Funktion zum Laden der Playlist.m3u und Aktualisieren der Sidebar
function loadMyPlaylist() {
    fetch('playlist.m3u')
        .then(response => response.text())
        .then(data => updateSidebarFromM3U(data))
        .catch(error => console.error('Fehler beim Laden der Playlist:', error));
}

// Funktion zum Laden der externen Playlist und Aktualisieren der Sidebar
function loadExternalPlaylist() {
    fetch('https://raw.githubusercontent.com/gluk03/iptvgluk/dd9409c9f9029f6444633267e3031741efedc381/TV.m3u')
        .then(response => response.text())
        .then(data => updateSidebarFromM3U(data))
        .catch(error => console.error('Fehler beim Laden der externen Playlist:', error));
}

// Funktion zum Laden der Sport-Playlist und Aktualisieren der Sidebar
function loadSportPlaylist() {
    alert("Funktionalität für Sport-Playlist wird implementiert...");
}

// Globales Objekt für EPG-Daten
let epgData = {};

// Funktion zum Laden und Parsen der EPG-Daten
function loadEPGData() {
    fetch('https://ext.greektv.app/epg/epg.xml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "application/xml");
            const programmes = xmlDoc.getElementsByTagName('programme');
            Array.from(programmes).forEach(prog => {
                const channelId = prog.getAttribute('channel');
                const start = prog.getAttribute('start');
                const stop = prog.getAttribute('stop');
                const titleElement = prog.getElementsByTagName('title')[0];
                const descElement = prog.getElementsByTagName('desc')[0];
                if (titleElement) {
                    const title = titleElement.textContent;
                    const desc = descElement ? descElement.textContent : 'Keine Beschreibung verfügbar';
                    if (!epgData[channelId]) {
                        epgData[channelId] = [];
                    }
                    epgData[channelId].push({
                        start: parseDateTime(start),
                        stop: parseDateTime(stop),
                        title: title,
                        desc: desc
                    });
                }
            });
        })
        .catch(error => console.error('Fehler beim Laden der EPG-Daten:', error));
}

// Hilfsfunktion zum Umwandeln der EPG-Zeitangaben in Date-Objekte
function parseDateTime(epgTime) {
    if (!epgTime || epgTime.length < 19) {
        console.error('Ungültige EPG-Zeitangabe:', epgTime);
        return null;
    }

    const year = parseInt(epgTime.substr(0, 4), 10);
    const month = parseInt(epgTime.substr(4, 2), 10) - 1;
    const day = parseInt(epgTime.substr(6, 2), 10);
    const hour = parseInt(epgTime.substr(8, 2), 10);
    const minute = parseInt(epgTime.substr(10, 2), 10);
    const second = parseInt(epgTime.substr(12, 2), 10);
    const tzHour = parseInt(epgTime.substr(15, 3), 10);
    const tzMin = parseInt(epgTime.substr(18, 2), 10) * (epgTime[14] === '+' ? 1 : -1);

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second) || isNaN(tzHour) || isNaN(tzMin)) {
        console.error('Ungültige EPG-Zeitangabe:', epgTime);
        return null;
    }

    if (year < 0 || month < 0 || month > 11 || day < 1 || day > 31) {
        console.error('Ungültige EPG-Zeitangabe:', epgTime);
        return null;
    }

    const date = new Date(Date.UTC(year, month, day, hour - tzHour, minute - tzMin, second));
    return date;
}

// Funktion zum Finden des aktuellen Programms basierend auf der Uhrzeit
function getCurrentProgram(channelId) {
    const now = new Date();
    if (epgData[channelId]) {
        const currentProgram = epgData[channelId].find(prog => now >= prog.start && now < prog.stop);
        if (currentProgram) {
            const pastTime = now - currentProgram.start;
            const futureTime = currentProgram.stop - now;
            const totalTime = currentProgram.stop - currentProgram.start;
            const pastPercentage = (pastTime / totalTime) * 100;
            const futurePercentage = (futureTime / totalTime) * 100;
            const description = currentProgram.desc || 'Keine Beschreibung verfügbar';

            return {
                title: currentProgram.title,
                description: description,
                pastPercentage: pastPercentage,
                futurePercentage: futurePercentage
            };
        } else {
            return { title: 'Keine aktuelle Sendung verfügbar', description: 'Keine Beschreibung verfügbar', pastPercentage: 0, futurePercentage: 0 };
        }
    }
    return { title: 'Keine EPG-Daten verfügbar', description: 'Keine Beschreibung verfügbar', pastPercentage: 0, futurePercentage: 0 };
}

// Funktion zum Aktualisieren des Players mit der Programmbeschreibung
function updatePlayerDescription(title, description) {
    document.getElementById('program-title').textContent = title;
    document.getElementById('program-desc').textContent = description;
}

// Funktion zum Extrahieren des Stream-URLs aus der M3U-Datei
function extractStreamURLs(data) {
    const lines = data.split('\n');
    const streamURLs = {};
    let currentChannelId = null;
    lines.forEach(line => {
        if (line.startsWith('#EXTINF')) {
            const idMatch = line.match(/tvg-id="([^"]+)"/);
            currentChannelId = idMatch && idMatch[1];
        } else if (currentChannelId && line.trim()) {
            streamURLs[currentChannelId] = streamURLs[currentChannelId] || [];
            streamURLs[currentChannelId].push(line.trim());
            currentChannelId = null;
        }
    });
    return streamURLs;
}


// Funktion zum Aktualisieren der Sidebar von einer M3U-Datei
function updateSidebarFromM3U(data) {
    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.innerHTML = '';

    const streamURLs = extractStreamURLs(data);
    const lines = data.split('\n');

    lines.forEach(line => {
        if (line.startsWith('#EXTINF')) {
            const idMatch = line.match(/tvg-id="([^"]+)"/);
            const channelId = idMatch && idMatch[1];
            const programInfo = getCurrentProgram(channelId);

            const nameMatch = line.match(/,(.*)$/);
            if (nameMatch && nameMatch.length > 1) {
                const name = nameMatch[1].trim();
                const imgMatch = line.match(/tvg-logo="([^"]+)"/);
                let imgURL = imgMatch && imgMatch[1] || 'default_logo.png';
                const streamURL = streamURLs[channelId] && streamURLs[channelId].shift(); // Nächste URL für den Channel

                if (streamURL) {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <div class="channel-info" data-stream="${streamURL}" data-channel-id="${channelId}">
                            <div class="logo-container">
                                <img src="${imgURL}" alt="${name} Logo">
                            </div>
                            <span class="sender-name">${name}</span>
                            <span class="epg-channel">
                                <span>${programInfo.title}</span>
                                <div class="epg-timeline">
                                    <div class="epg-past" style="width: ${programInfo.pastPercentage}%"></div>
                                    <div class="epg-future" style="width: ${programInfo.futurePercentage}%"></div>
                                </div>
                            </span>
                        </div>
                    `;
                    sidebarList.appendChild(listItem);
                }
            }
        }
    });

    checkStreamStatus();
}


// Funktion zum Überprüfen des Status der Streams
function checkStreamStatus() {
    const sidebarChannels = document.querySelectorAll('.channel-info');
    sidebarChannels.forEach(channel => {
        const streamURL = channel.dataset.stream;
        if (streamURL) {
            fetch(streamURL)
                .then(response => {
                    if (response.ok) {
                        channel.querySelector('.sender-name').classList.add('online');
                    } else {
                        channel.querySelector('.sender-name').classList.remove('online');
                    }
                })
                .catch(error => {
                    console.error('Fehler beim Überprüfen des Stream-Status:', error);
                    channel.querySelector('.sender-name').classList.remove('online');
                });
        }
    });
}

// Ereignisbehandler für Klicks auf Sender
document.addEventListener('DOMContentLoaded', function () {
    loadEPGData();
    updateClock();
    setInterval(updateClock, 1000);
    document.getElementById('myPlaylist').addEventListener('click', loadMyPlaylist);
    document.getElementById('externalPlaylist').addEventListener('click', loadExternalPlaylist);
    document.getElementById('sportPlaylist').addEventListener('click', loadSportPlaylist);

    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.addEventListener('click', function (event) {
        const channelInfo = event.target.closest('.channel-info');
        if (channelInfo) {
            const streamURL = channelInfo.dataset.stream;
            const channelId = channelInfo.dataset.channelId;
            const programInfo = getCurrentProgram(channelId);

            setCurrentChannel(channelInfo.querySelector('.sender-name').textContent, streamURL);
            playStream(streamURL);

            // Aktualisieren der Programmbeschreibung
            updatePlayerDescription(programInfo.title, programInfo.description);
        }
    });

    setInterval(checkStreamStatus, 60000);

    const playButton = document.getElementById('play-button');
    const streamUrlInput = document.getElementById('stream-url');

    const playStreamFromInput = () => {
        const streamUrl = streamUrlInput.value;
        if (streamUrl) {
            playStream(streamUrl);
        }
    };

    playButton.addEventListener('click', playStreamFromInput);

    streamUrlInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            playStreamFromInput();
        }
    });
});



// Funktion zum Setzen des aktuellen Sendernamens und der URL
function setCurrentChannel(channelName, streamUrl) {
    const currentChannelName = document.getElementById('current-channel-name');
    const streamUrlInput = document.getElementById('stream-url');
    currentChannelName.textContent = channelName; // Nur der Sendername
    streamUrlInput.value = streamUrl;
}

// Aktualisierung der Uhrzeit
function updateClock() {
    const now = new Date();
    const tag = now.toLocaleDateString('de-DE', { weekday: 'long' });
    const datum = now.toLocaleDateString('de-DE');
    const uhrzeit = now.toLocaleTimeString('de-DE', { hour12: false });
    document.getElementById('tag').textContent = tag;
    document.getElementById('datum').textContent = datum;
    document.getElementById('uhrzeit').textContent = uhrzeit;
}





        // Funktion zum Abspielen eines Streams im Video-Player
function playStream(streamURL, subtitleURL) {
    const videoPlayer = document.getElementById('video-player');
    const subtitleTrack = document.getElementById('subtitle-track');

    if (subtitleURL) {
        subtitleTrack.src = subtitleURL;
        subtitleTrack.track.mode = 'showing'; // Untertitel anzeigen
    } else {
        subtitleTrack.src = '';
        subtitleTrack.track.mode = 'hidden'; // Untertitel ausblenden
    }

    if (Hls.isSupported() && streamURL.endsWith('.m3u8')) {
        const hls = new Hls();
        hls.loadSource(streamURL);
        hls.attachMedia(videoPlayer);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            videoPlayer.play();
        });
    } else if (typeof dashjs !== 'undefined' && typeof dashjs.MediaPlayer !== 'undefined' && typeof dashjs.MediaPlayer().isTypeSupported === 'function' && dashjs.MediaPlayer().isTypeSupported('application/dash+xml') && streamURL.endsWith('.mpd')) {
        const dashPlayer = dashjs.MediaPlayer().create();
        dashPlayer.initialize(videoPlayer, streamURL, true);
    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayer.src = streamURL;
        videoPlayer.addEventListener('loadedmetadata', function () {
            videoPlayer.play();
        });
    } else if (videoPlayer.canPlayType('video/mp4') || videoPlayer.canPlayType('video/webm')) {
        videoPlayer.src = streamURL;
        videoPlayer.play();
    } else {
        console.error('Stream-Format wird vom aktuellen Browser nicht unterstützt.');
    }
}



// Funktion zum Lesen der SRT-Datei und Anzeigen der griechischen Untertitel
function handleSubtitleFile(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const srtContent = event.target.result;
        const vttContent = convertSrtToVtt(srtContent);
        const blob = new Blob([vttContent], { type: 'text/vtt' });
        const url = URL.createObjectURL(blob);
        const track = document.getElementById('subtitle-track');
        track.src = url;
        track.label = 'Griechisch';
        track.srclang = 'el';
        track.default = true;
    };
    reader.readAsText(file);
}

// Funktion zum Konvertieren von SRT in VTT
function convertSrtToVtt(srtContent) {
    // SRT-Untertitelzeilen in VTT-Format konvertieren
    const vttContent = 'WEBVTT\n\n' + srtContent
        // Ersetze Trennzeichen
        .replace(/\r\n|\r|\n/g, '\n')
        // Ersetze Zeitformate von SRT in VTT
        .replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4');

    return vttContent;
}



        // Event-Listener für den Play-Button und Datei-Eingabe
        document.addEventListener('DOMContentLoaded', function () {
            const playButton = document.getElementById('play-button');
            const streamUrlInput = document.getElementById('stream-url');
            const subtitleFileInput = document.getElementById('subtitle-file');

            const playStreamFromInput = () => {
                const streamUrl = streamUrlInput.value;
                const subtitleFile = subtitleFileInput.files[0];
                if (streamUrl) {
                    if (subtitleFile) {
                        handleSubtitleFile(subtitleFile);
                    }
                    playStream(streamUrl, subtitleFile ? document.getElementById('subtitle-track').src : null);
                }
            };

            playButton.addEventListener('click', playStreamFromInput);

            streamUrlInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    playStreamFromInput();
                }
            });

            subtitleFileInput.addEventListener('change', (event) => {
                const subtitleFile = event.target.files[0];
                if (subtitleFile) {
                    handleSubtitleFile(subtitleFile);
                }
            });
        });
