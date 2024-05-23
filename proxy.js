const express = require('express');
const axios = require('axios');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/proxy', async (req, res) => {
  const url = req.query.url; // Παίρνει το URL από το query string
  if (!url) {
    return res.status(400).send('URL parameter is missing');
  }
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    response.data.pipe(res);
  } catch (error) {
    res.status(500).send('Error fetching the URL');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});

// Προηγούμενος κώδικας της εφαρμογής σας...

// Προσθέστε τον κώδικα για να κάνει αίτηση μέσω του proxy server
const proxyUrl = 'http://localhost:3000/proxy'; // Ανάλογα με τη διεύθυνση που λειτουργεί ο proxy server σας
const apiUrl = 'https://api.opensubtitles.com/api/v1/subtitles/playlist_dvr.m3u8/search?languages=ell';
axios.get(proxyUrl, {
  params: {
    url: apiUrl
  }
})
.then(response => {
  // Επεξεργασία της απόκρισης από τον proxy server
  console.log(response.data); // Επιστρέφει τα δεδομένα από τον proxy server
})
.catch(error => {
  // Χειρισμός σφαλμάτων
  console.error('Error:', error);
});

// Προηγούμενος κώδικας της εφαρμογής σας...

