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
