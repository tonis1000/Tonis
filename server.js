// server.js

const express = require('express');
const PORT = 4000;

const app = express();

app.get('/api/subtitles', async (req, res) => {
    const { movieTitle } = req.query;
    const fetch = await import('node-fetch');
    const apiKey = 'IMGtuZZMWcq1BjCy1eGtIXwHsrj6NuK1';
    const searchUrl = `https://api.opensubtitles.com/api/v1/subtitles/${movieTitle}/search?languages=ell`;

    try {
        const response = await fetch.default(searchUrl, {
            headers: {
                'Api-Key': apiKey,
            },
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Suchen von Untertiteln' });
    }
});

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
