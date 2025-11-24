// script.js - Dynamic Effects, Voice, Backend Integration
document.addEventListener('DOMContentLoaded', () => {

  // ===== 1️⃣ Animate Quick Cards =====
  const quickCards = document.querySelectorAll('.hero .quick-cards .card');
  quickCards.forEach((card, index) => {
    card.style.opacity = '0';
    setTimeout(() => {
      card.style.transition = 'all 0.6s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 200 * index);
  });

  // ===== 2️⃣ Animate Grid Cards =====
  const gridCards = document.querySelectorAll('.cards-grid .card');
  gridCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'all 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 150 * index);
  });

  // ===== 3️⃣ Floating Voice Button =====
  const voiceButton = document.createElement('button');
  voiceButton.classList.add('voice-button');
  voiceButton.innerHTML = '🎤';
  document.body.appendChild(voiceButton);

  voiceButton.addEventListener('mouseenter', () => voiceButton.style.transform = 'scale(1.2)');
  voiceButton.addEventListener('mouseleave', () => voiceButton.style.transform = 'scale(1)');

  // ===== 4️⃣ Voice Recognition =====
  const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (recognition) {
    const rec = new recognition();
    rec.continuous = false;
    rec.lang = 'en-US';

    voiceButton.addEventListener('click', () => { rec.start(); voiceButton.innerHTML = '🎙️'; });

    rec.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      console.log('User said:', text);

      // ===== Expenses voice commands =====
      const expMatch = text.match(/add (\d+) for (\w+)/);
      if (expMatch) {
        document.getElementById('expense-amount').value = expMatch[1];
        document.getElementById('expense-name').value = expMatch[2];
        const catSelect = document.getElementById('expense-category');
        catSelect.value = expMatch[2] || 'Other';
        document.getElementById('add-expense')?.click();
      }

      // ===== Health voice commands =====
      const healthMatch = text.match(/water (\d+)|sleep (\d+)|exercise (\d+)/g);
      if (healthMatch) {
        healthMatch.forEach(m => {
          if (m.includes('water')) document.getElementById('water-input').value = m.match(/\d+/)[0];
          if (m.includes('sleep')) document.getElementById('sleep-input').value = m.match(/\d+/)[0];
          if (m.includes('exercise')) document.getElementById('exercise-input').value = m.match(/\d+/)[0];
        });
        document.getElementById('add-health')?.click();
      }

      voiceButton.innerHTML = '🎤';
    };

    rec.onerror = (e) => { console.error(e.error); voiceButton.innerHTML = '🎤'; };
    rec.onend = () => { voiceButton.innerHTML = '🎤'; };

  } else {
    console.warn('Speech Recognition not supported');
  }

  // ===== 5️⃣ Backend Integration =====
  // Use relative API paths so frontend works when served from the backend (single deploy)
  const EXP_API = '/api/expenses';
  const HEALTH_API = '/api/health';

  // ----- Expenses -----
  const addExpenseBtn = document.getElementById('add-expense');
  if (addExpenseBtn) {
    const todayExp = document.getElementById('today-expense');
    const weeklyExp = document.getElementById('weekly-expense');
    const tipsBox = document.getElementById('tips-box');

    addExpenseBtn.addEventListener('click', async () => {
      const name = document.getElementById('expense-name').value;
      const amount = parseInt(document.getElementById('expense-amount').value);
      const category = document.getElementById('expense-category').value;
      if (!name || amount <= 0) return alert('Enter valid expense');

      const headers = Object.assign({'Content-Type':'application/json'}, (typeof getAuthHeader === 'function' ? getAuthHeader() : {}));
      const postRes = await fetch(EXP_API, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, amount, category })
      });

      if (postRes.status === 401) {
        alert('You must be logged in to add expenses. Please login first.');
        return;
      }

      document.getElementById('expense-name').value = '';
      document.getElementById('expense-amount').value = '';
      fetchExpenses();
    });

    async function fetchExpenses() {
      const headers = (typeof getAuthHeader === 'function') ? getAuthHeader() : {};
      const res = await fetch(EXP_API, { headers });

      if (res.status === 401) {
        // Not authorized - show a friendly message and bail out with empty data
        todayExp.textContent = `Login required to view expenses`;
        weeklyExp.textContent = '';
        renderExpenseChart(labels, Array(7).fill(0));
        return;
      }

      let data = [];
      try { data = await res.json(); } catch (e) { data = []; }
      if (!Array.isArray(data)) {
        console.warn('Expenses API returned non-array:', data);
        // Try common response shapes
        if (data && Array.isArray(data.expenses)) data = data.expenses;
        else data = [];
      }

      let todaySum = 0, weekSum = 0;
      const weekData = Array(7).fill(0);
      const labels = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.unshift(d.toLocaleDateString('en-US', { weekday: 'short' }));
      }

      const last7 = new Date(); last7.setDate(last7.getDate() - 6);

      data.forEach(e => {
        const eDate = new Date(e.date);
        if (eDate.toDateString() === new Date().toDateString()) todaySum += e.amount;
        if (eDate >= last7) {
          const idx = 6 - Math.floor((new Date() - eDate) / (1000*60*60*24));
          weekData[idx] += e.amount;
          weekSum += e.amount;
        }
      });

      todayExp.textContent = `Today's Spend: ₹${todaySum}`;
      weeklyExp.textContent = `This Week: ₹${weekSum}`;
      renderExpenseChart(labels, weekData);

      if (weekSum > 5000) tipsBox.textContent = 'Tip: Try cooking at home to save money!';
      else if (weekSum > 2000) tipsBox.textContent = 'Tip: Limit coffee outside, save ₹50-100/day';
      else tipsBox.textContent = 'You are doing great! Keep tracking your expenses.';
    }

    function renderExpenseChart(labels, data) {
      const ctx = document.getElementById('expenseChart').getContext('2d');
      if (window.expChart && typeof window.expChart.destroy === 'function') window.expChart.destroy();
      window.expChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Expenses ₹', data, backgroundColor: ['#6C5CE7','#00B894','#FD79A8','#ffeaa7','#fab1a0','#55efc4','#74b9ff'] }] },
        options: { responsive:true, plugins:{ legend:{ display:false }}, scales:{ y:{ beginAtZero:true }} }
      });
    }

    fetchExpenses();
  }

  // ----- Health -----
  const addHealthBtn = document.getElementById('add-health');
  if (addHealthBtn) {
    const waterCard = document.getElementById('water-card');
    const sleepCard = document.getElementById('sleep-card');
    const exerciseCard = document.getElementById('exercise-card');
    const tipsBoxH = document.getElementById('tips-box');

    addHealthBtn.addEventListener('click', async () => {
      const water = parseInt(document.getElementById('water-input').value);
      const sleep = parseInt(document.getElementById('sleep-input').value);
      const exercise = parseInt(document.getElementById('exercise-input').value);

      if (!water && !sleep && !exercise) return alert('Enter at least one value');

      await fetch(HEALTH_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ water, sleep, exercise })
      });

      document.getElementById('water-input').value = '';
      document.getElementById('sleep-input').value = '';
      document.getElementById('exercise-input').value = '';
      fetchHealth();
    });

    async function fetchHealth() {
      const res = await fetch(HEALTH_API);
      const data = await res.json();

      let totalWater = 0, totalSleep = 0, totalExercise = 0;
      const labels = [];
      const waterData = Array(7).fill(0);
      const sleepData = Array(7).fill(0);
      const exerciseData = Array(7).fill(0);

      for (let i=0;i<7;i++){
        const d = new Date(); d.setDate(d.getDate()-i);
        labels.unshift(d.toLocaleDateString('en-US',{weekday:'short'}));
      }

      const last7 = new Date(); last7.setDate(last7.getDate()-6);

      data.forEach(e => {
        const d = new Date(e.date);
        if (d >= last7) {
          const idx = 6 - Math.floor((new Date() - d) / (1000*60*60*24));
          waterData[idx] += e.water || 0;
          sleepData[idx] += e.sleep || 0;
          exerciseData[idx] += e.exercise || 0;
        }
        totalWater += e.water || 0;
        totalSleep += e.sleep || 0;
        totalExercise += e.exercise || 0;
      });

      waterCard.textContent = `Water: ${totalWater} Glasses`;
      sleepCard.textContent = `Sleep: ${totalSleep} hrs`;
      exerciseCard.textContent = `Exercise: ${totalExercise} mins`;

      renderHealthChart(labels, waterData, sleepData, exerciseData);

      let tips = [];
      if(totalWater<8) tips.push('Drink more water.');
      if(totalSleep<7) tips.push('Get at least 7 hrs sleep.');
      if(totalExercise<30) tips.push('Exercise at least 30 mins.');
      tipsBoxH.textContent = tips.length ? tips.join(' ') : 'Great job! Keep healthy.';
    }

    function renderHealthChart(labels, water, sleep, exercise){
      const ctx = document.getElementById('healthChart').getContext('2d');
      if(window.healthChart && typeof window.healthChart.destroy === 'function') window.healthChart.destroy();
      window.healthChart = new Chart(ctx,{
        type:'line',
        data:{
          labels,
          datasets:[
            {label:'Water', data:water, borderColor:'#00B894', fill:false, tension:0.3},
            {label:'Sleep', data:sleep, borderColor:'#6C5CE7', fill:false, tension:0.3},
            {label:'Exercise', data:exercise, borderColor:'#FD79A8', fill:false, tension:0.3}
          ]
        },
        options:{responsive:true, plugins:{legend:{display:true}}, scales:{y:{beginAtZero:true}}}
      });
    }

    fetchHealth();
  }

});
