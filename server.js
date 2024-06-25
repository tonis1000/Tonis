const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/save-url', (req, res) => {
    const url = req.body.url;
    if (!url) {
        return res.status(400).send('URL fehlt');
    }
    
    fs.appendFile('urls.txt', url + '\n', (err) => {
        if (err) {
            console.error('Fehler beim Speichern der URL:', err);
            return res.status(500).send('Fehler beim Speichern der URL');
        }
        console.log('URL erfolgreich gespeichert:', url);
        res.send('URL erfolgreich gespeichert');
    });
});

app.post('/delete-url', (req, res) => {
    const url = req.body.url;
    if (!url) {
        return res.status(400).send('URL fehlt');
    }
    
    fs.readFile('urls.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Fehler beim Lesen der Datei:', err);
            return res.status(500).send('Fehler beim Lesen der Datei');
        }
        
        const urls = data.split('\n').filter(u => u !== url);
        fs.writeFile('urls.txt', urls.join('\n'), (err) => {
            if (err) {
                console.error('Fehler beim Löschen der URL:', err);
                return res.status(500).send('Fehler beim Löschen der URL');
            }
            console.log('URL erfolgreich gelöscht:', url);
            res.send('URL erfolgreich gelöscht');
        });
    });
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
