// music.js — frontend Spotify integration (calls local backend at same origin)
async function searchSongs(query) {
  if (!query) return;
  const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    console.error('Search failed', await res.text());
    return;
  }
  const data = await res.json();
  displaySongs(data.tracks);
}

async function getMoodSongs(mood) {
  if (!mood) return;
  const res = await fetch(`/mood?mood=${encodeURIComponent(mood)}`);
  if (!res.ok) {
    console.error('Mood request failed', await res.text());
    return;
  }
  const data = await res.json();
  displaySongs(data.tracks);
}

function displaySongs(tracks) {
  const list = document.getElementById('song-list');
  list.innerHTML = '';
  if (!tracks || !tracks.length) {
    list.innerHTML = '<p>No songs found.</p>';
    return;
  }
  tracks.forEach(t => {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `
      <img src="${t.image || 'https://via.placeholder.com/150'}" alt="${t.title}">
      <h4>${t.title}</h4>
      <p>${t.artists}</p>
      <button class="play-btn">Open in Spotify</button>
    `;
    card.querySelector('.play-btn').addEventListener('click', () => {
      if (t.spotify_url) window.open(t.spotify_url, '_blank');
    });
    list.appendChild(card);
  });
}

// wire up UI
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('search-btn')?.addEventListener('click', () => {
    const q = document.getElementById('search-input').value.trim();
    searchSongs(q);
  });

  // mood buttons present in HTML call getMoodSongs directly (existing onclicks)
  // provide convenience listeners for the manual mood buttons
  document.querySelectorAll('.mood-buttons button').forEach(b => {
    b.addEventListener('click', (e) => {
      const mood = e.target.textContent.trim().toLowerCase();
      // map emojis & labels to mood keys
      if (mood.includes('happy')) getMoodSongs('happy');
      else if (mood.includes('sad')) getMoodSongs('sad');
      else if (mood.includes('energetic')) getMoodSongs('energetic');
      else if (mood.includes('relaxed')) getMoodSongs('relaxed');
      else getMoodSongs('relaxed');
    });
  });

  // initial load (relaxed)
  getMoodSongs('relaxed');
});
