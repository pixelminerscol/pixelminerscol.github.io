/* ==========================================================================
   PIXEL MINERS ("MINERS") - JAVASCRIPT SHOWCASE ENGINE
   Features Web Audio Synthesizer, Real GIFs Marquee & Legendary Spotlight
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  let allTokens = [];
  let soundEnabled = true;

  // DOM References
  const spotlightGrid = document.getElementById('spotlight-grid');
  const soundToggleBtn = document.getElementById('sound-toggle');
  const crtToggleBtn = document.getElementById('crt-toggle');

  // Hero Card Elements
  const heroMinerImg = document.getElementById('hero-miner-img');
  const heroMinerTitle = document.getElementById('hero-miner-title');
  const heroMinerRarity = document.getElementById('hero-miner-rarity');
  const heroMinerTraits = document.getElementById('hero-miner-traits');
  const heroRollBtn = document.getElementById('hero-roll-btn');
  const marqueeTrack = document.getElementById('marquee-track');

  // Modal Inspector Elements
  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalRarityBadge = document.getElementById('modal-rarity-badge');
  const modalTraitsMatrix = document.getElementById('modal-traits-matrix');
  const modalHtmlLink = document.getElementById('modal-html-link');

  // =========================================================================
  // 1. 8-BIT RETRO AUDIO SYNTHESIZER (Native Web Audio API)
  // =========================================================================
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'roll') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(660, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'chime') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      // Audio not supported
    }
  }

  // =========================================================================
  // 2. DATA INITIALIZATION
  // =========================================================================
  try {
    const res = await fetch('assets/data.json');
    const data = await res.json();
    allTokens = data.tokens || [];

    initHeroMarquee();
    initHeroFeaturedMiner();
    renderSpotlightGrid();
  } catch (err) {
    console.error('Failed to load assets/data.json:', err);
  }

  // Marquee with real animated GIFs
  function initHeroMarquee() {
    if (!marqueeTrack || allTokens.length === 0) return;
    const sampleMiners = allTokens.slice(0, 30);
    const htmlItems = sampleMiners.map(t => `
      <div class="marquee-miner-thumb" onclick="openInspector(${t.id})" title="${t.name}">
        <img src="${t.gif}" alt="${t.name}" loading="lazy" />
      </div>
    `).join('');
    marqueeTrack.innerHTML = htmlItems + htmlItems;
  }

  // Hero Featured Miner
  function initHeroFeaturedMiner() {
    const legendaries = allTokens.filter(t => t.attributes.some(a => a.trait_type === 'Rarity' && a.value === 'Legendary'));
    const initial = legendaries.length > 0 ? legendaries[0] : allTokens[0];
    if (initial) updateHeroCard(initial);
  }

  function updateHeroCard(token) {
    if (!token || !heroMinerImg) return;
    heroMinerImg.src = token.gif;
    heroMinerTitle.textContent = token.name;

    const attrs = token.attributes || [];
    const rarity = attrs.find(a => a.trait_type === 'Rarity')?.value || 'Common';
    const chassis = attrs.find(a => a.trait_type === 'Chassis')?.value || 'Standard';
    const tool = attrs.find(a => a.trait_type === 'Tool')?.value || 'Tool';
    const strata = attrs.find(a => a.trait_type === 'Strata')?.value || 'Rock';
    const ore = attrs.find(a => a.trait_type === 'Ore')?.value || 'None';

    heroMinerRarity.textContent = rarity.toUpperCase();
    heroMinerRarity.className = `rarity-tag tag-${rarity.toLowerCase()}`;

    heroMinerTraits.innerHTML = `
      <span class="mini-pill">⚙️ ${chassis}</span>
      <span class="mini-pill">⛏️ ${tool}</span>
      <span class="mini-pill">🪨 ${strata}</span>
      <span class="mini-pill">💎 ${ore}</span>
    `;

    heroMinerImg.parentElement.onclick = () => openInspector(token.id);
  }

  // Hero "Roll Random Miner"
  if (heroRollBtn) {
    heroRollBtn.addEventListener('click', () => {
      playSound('roll');
      heroMinerImg.style.filter = 'brightness(2) contrast(1.5)';
      setTimeout(() => {
        const randomToken = allTokens[Math.floor(Math.random() * allTokens.length)];
        updateHeroCard(randomToken);
        heroMinerImg.style.filter = 'none';
      }, 120);
    });
  }

  // =========================================================================
  // 3. LEGENDARY SPOTLIGHT GRID
  // =========================================================================
  function renderSpotlightGrid() {
    if (!spotlightGrid) return;
    const legendaries = allTokens.filter(t => t.attributes.some(a => a.trait_type === 'Rarity' && a.value === 'Legendary'));
    
    spotlightGrid.innerHTML = legendaries.map(token => {
      const attrs = token.attributes || [];
      const chassis = attrs.find(a => a.trait_type === 'Chassis')?.value || 'Standard';
      const tool = attrs.find(a => a.trait_type === 'Tool')?.value || 'Lance';
      const strata = attrs.find(a => a.trait_type === 'Strata')?.value || 'Basalt';

      return `
        <div class="nft-card" onclick="openInspector(${token.id})">
          <div class="nft-thumb-box">
            <img src="${token.gif}" alt="${token.name}" loading="lazy" />
            <span class="rarity-tag tag-legendary">LEGENDARY</span>
          </div>
          <div class="nft-details">
            <div class="nft-name">${token.name}</div>
            <div class="nft-traits-row">
              <span>⚙️ ${chassis}</span> • <span>⛏️ ${tool}</span> • <span>🪨 ${strata}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // 4. MODAL INSPECTOR
  // =========================================================================
  window.openInspector = function(tokenId) {
    playSound('chime');
    const token = allTokens.find(t => t.id === tokenId);
    if (!token || !modalOverlay) return;

    modalImg.src = token.gif;
    modalTitle.textContent = token.name;

    const attrs = token.attributes || [];
    const rarity = attrs.find(a => a.trait_type === 'Rarity')?.value || 'Common';

    modalRarityBadge.textContent = rarity.toUpperCase();
    modalRarityBadge.className = `rarity-tag tag-${rarity.toLowerCase()}`;

    modalTraitsMatrix.innerHTML = attrs.map(a => `
      <div class="trait-cell">
        <div class="trait-label">${a.trait_type}</div>
        <div class="trait-val">${a.value}</div>
      </div>
    `).join('');

    if (modalHtmlLink) {
      modalHtmlLink.href = token.html;
    }

    modalOverlay.classList.add('active');
  };

  function closeModal() {
    playSound('click');
    modalOverlay.classList.remove('active');
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
  });

  // =========================================================================
  // 5. UTILITY TOGGLES (CRT SCREEN & SOUND)
  // =========================================================================
  if (crtToggleBtn) {
    crtToggleBtn.addEventListener('click', () => {
      playSound('click');
      document.body.classList.toggle('crt-active');
      const active = document.body.classList.contains('crt-active');
      crtToggleBtn.style.borderColor = active ? 'var(--neon-cyan)' : 'var(--border-subtle)';
      crtToggleBtn.style.color = active ? 'var(--neon-cyan)' : 'var(--text-secondary)';
    });
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundToggleBtn.textContent = soundEnabled ? '🔊 SFX ON' : '🔇 SFX OFF';
      soundToggleBtn.style.borderColor = soundEnabled ? 'var(--neon-cyan)' : 'var(--border-subtle)';
      if (soundEnabled) playSound('click');
    });
  }
});
