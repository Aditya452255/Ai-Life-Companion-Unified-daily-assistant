// Simple frontend auth helper
function getToken(){ return localStorage.getItem('authToken'); }
function getUser(){ try{ return JSON.parse(localStorage.getItem('authUser')||'null'); }catch(e){ return null; } }
function setAuth(token, user){ localStorage.setItem('authToken', token); localStorage.setItem('authUser', JSON.stringify(user)); updateUserUI(); }
function clearAuth(){ localStorage.removeItem('authToken'); localStorage.removeItem('authUser'); updateUserUI(); }
function getAuthHeader(){ const t = getToken(); return t ? { Authorization: 'Bearer '+t } : {}; }

function updateUserUI(){
  const up = document.querySelector('.user-profile');
  const user = getUser();
  if(!up) return;
  if(user && user.name){
    // Clean display name: remove trailing 'User' (if someone signed up as 'DiyaUser')
    // and show only the first name for a concise greeting.
    let displayName = String(user.name || '').trim();
    // Remove a trailing 'User' word if present (case-insensitive)
    displayName = displayName.replace(/User$/i, '').trim();
    // Fallback: take the first token (first name) if there are spaces
    if(displayName.indexOf(' ') !== -1) displayName = displayName.split(' ')[0];
    up.innerHTML = `👋 ${displayName} <button id="logout-btn" style="margin-left:10px;padding:4px 8px;border-radius:6px;border:none;cursor:pointer;">Logout</button>`;
    const btn = document.getElementById('logout-btn');
    if(btn) btn.addEventListener('click', ()=>{ clearAuth(); location.href = 'index.html'; });
  } else {
    // If the page defines a per-page default name, use it (e.g., recipes/assistant pages)
    const pageDefault = up.dataset && up.dataset.default ? up.dataset.default : null;
    const fallbackName = pageDefault || 'Guest';
    up.innerHTML = `👋 ${fallbackName} <a href="login.html" style="margin-left:10px;">Login</a>`;
  }
}

document.addEventListener('DOMContentLoaded', updateUserUI);
