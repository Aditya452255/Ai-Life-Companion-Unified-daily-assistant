// music.js — frontend Spotify integration (calls local backend at same origin)
async function searchSongs(query) {
  if (!query) return;
  const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    console.error('Search failed', await res.text());
    return;
  }
  const data = await res.json();
  displaySongs(data.tracks);
}

async function getMoodSongs(mood) {
  if (!mood) return;
  const res = await fetch(`/api/music/mood?mood=${encodeURIComponent(mood)}`);
  if (!res.ok) {
    console.error('Mood request failed', await res.text());
    return;
  }
  const data = await res.json();
  displaySongs(data.tracks);
}
// Camera-based mood detection using face-api (models loaded from CDN)
async function detectMoodCamera(){
  const list = document.getElementById('song-list');
  list.innerHTML = '<p>Starting camera & detecting mood...</p>';
  try{
    // load models from vladmandic CDN
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
    if(!faceapi){
      list.innerHTML = '<p>Face-api library not loaded.</p>';
      return;
    }
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

    // create video element
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    // request camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    video.srcObject = stream;
    document.body.appendChild(video);

    // wait for video ready
    await new Promise((resolve) => { video.onloadedmetadata = () => { video.play().catch(()=>{}); resolve(); }; });

    // run detection a few times to stabilize
    let bestExpression = null;
    for(let i=0;i<6;i++){
      const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
      if(detection && detection.expressions){
        const expr = detection.expressions;
        // find max expression
        const sorted = Object.keys(expr).sort((a,b)=> expr[b]-expr[a]);
        if(sorted.length) bestExpression = sorted[0];
      }
      await new Promise(r=>setTimeout(r,400));
    }

    // stop video
    try{ stream.getTracks().forEach(t=>t.stop()); }catch(e){}
    video.remove();

    if(!bestExpression){
      list.innerHTML = '<p>Could not detect mood. Try again.</p>';
      return;
    }

    // map face expressions to our mood keys
    let mood = 'relaxed';
    if(bestExpression === 'happy' || bestExpression === 'surprised') mood = 'happy';
    else if(bestExpression === 'sad') mood = 'sad';
    else if(bestExpression === 'angry' || bestExpression === 'disgusted' || bestExpression === 'fearful') mood = 'energetic';
    else mood = 'relaxed';

    list.innerHTML = `<p>Detected mood: ${mood}. Loading recommendations...</p>`;
    await getMoodSongs(mood);
  }catch(err){
    console.error('detectMoodCamera error', err);
    list.innerHTML = '<p>Camera error or permission denied.</p>';
  }
}

function displaySongs(tracks) {
  const list = document.getElementById('song-list');
  list.innerHTML = '';
  if (!tracks || !tracks.length) {
    list.innerHTML = '<p>No songs found.</p>';
    return;
  }
  // allow only one preview playing at a time
  let currentAudio = null;
  let currentBtn = null;
  tracks.forEach(t => {
    const card = document.createElement('div');
    card.className = 'song-card';
    const img = t.image || 'https://via.placeholder.com/150';
    const previewAvailable = !!t.preview_url;
    card.innerHTML = `
      <img src="${img}" alt="${t.title}">
      <h4>${t.title}</h4>
      <p>${t.artists}</p>
      <div style="display:flex;justify-content:center;gap:8px;align-items:center;margin-top:8px;"><button class="open-btn">Open in Spotify</button>${previewAvailable ? '<button class="preview-btn">Play</button>' : '<small>No preview</small>'}</div>
    `;

    // Open in Spotify
    card.querySelector('.open-btn').addEventListener('click', () => {
      if (t.spotify_url) window.open(t.spotify_url, '_blank');
    });

    // Preview play/pause
    if (previewAvailable) {
      const btn = card.querySelector('.preview-btn');
      const audio = document.createElement('audio');
      audio.src = t.preview_url;
      audio.preload = 'none';
      audio.addEventListener('ended', () => {
        btn.textContent = 'Play';
      });

      btn.addEventListener('click', () => {
        try{
          if (currentAudio && currentAudio !== audio) {
            currentAudio.pause();
            if (currentBtn) currentBtn.textContent = 'Play';
          }
          if (audio.paused) {
            audio.play().catch(e=>console.error('Audio play failed', e));
            btn.textContent = 'Pause';
            currentAudio = audio;
            currentBtn = btn;
          } else {
            audio.pause();
            btn.textContent = 'Play';
          }
        }catch(e){ console.error(e); }
      });
    }

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
