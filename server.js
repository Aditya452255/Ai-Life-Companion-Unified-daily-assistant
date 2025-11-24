const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set in .env — populate them before using Spotify APIs');
}

let tokenCache = { token: null, expiresAt: 0 };

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expiresAt > now + 1000) return tokenCache.token;

  if (!CLIENT_ID || !CLIENT_SECRET) throw new Error('Missing Spotify credentials');

  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');

  const res = await axios.post(tokenUrl, params.toString(), {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const data = res.data;
  tokenCache.token = data.access_token;
  tokenCache.expiresAt = now + (data.expires_in * 1000);
  return tokenCache.token;
}

async function spotifySearchTracks(q, limit = 10) {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/search`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: { q, type: 'track', limit }
  });
  return res.data.tracks.items.map(t => ({
    id: t.id,
    title: t.name,
    artists: t.artists.map(a => a.name).join(', '),
    image: t.album.images && t.album.images.length ? t.album.images[0].url : null,
    spotify_url: t.external_urls && t.external_urls.spotify ? t.external_urls.spotify : null
  }));
}

// Map moods to search keywords (simple approach)
const moodMap = {
  happy: 'happy upbeat feel good',
  sad: 'sad mellow',
  energetic: 'energetic dance workout',
  relaxed: 'chill relaxed ambient'
};

app.get('/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });
  try {
    const tracks = await spotifySearchTracks(q, 12);
    res.json({ tracks });
  } catch (err) {
    console.error('Search error:', err.message || err);
    res.status(500).json({ error: 'Spotify search failed', details: err.message });
  }
});

app.get('/mood', async (req, res) => {
  const mood = (req.query.mood || '').toLowerCase();
  const keyword = moodMap[mood] || moodMap['relaxed'];
  try {
    const tracks = await spotifySearchTracks(keyword, 12);
    res.json({ tracks });
  } catch (err) {
    console.error('Mood search error:', err.message || err);
    res.status(500).json({ error: 'Spotify mood search failed', details: err.message });
  }
});

// Serve static frontend from project root
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Spotify proxy server running at http://localhost:${PORT}`);
});
