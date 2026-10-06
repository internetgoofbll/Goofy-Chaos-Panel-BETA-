//THIS ALL GOES IN DEV CONSOLE/INSPECT!!!

(function launchGoofyControlPanel() {
  const existingMenu = document.getElementById('dev-debug-menu-root');
  if (existingMenu) existingMenu.remove();

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function playClickSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  function playExplosionSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    filter.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 2);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start();
    noise.stop(audioCtx.currentTime + 2);
  }

  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.2;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  const menuRoot = document.createElement('div');
  menuRoot.id = 'dev-debug-menu-root';
  Object.assign(menuRoot.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '320px',
    maxHeight: '85vh',
    backgroundColor: '#1b002b',
    color: '#ff0055',
    fontFamily: 'Comic Sans MS, cursive, sans-serif',
    fontSize: '12px',
    border: '2px dashed #00ffcc',
    borderRadius: '12px',
    boxShadow: '0 0 25px #ff00ff',
    zIndex: '2147483647',
    overflowY: 'auto',
    padding: '12px',
    userSelect: 'none'
  });

  const header = document.createElement('div');
  const titleText = document.createElement('strong');
  titleText.textContent = '🤡 GOOFY CHAOS PANEL 🤡';
  header.appendChild(titleText);

  Object.assign(header.style, {
    borderBottom: '2px dashed #00ffcc',
    paddingBottom: '8px',
    marginBottom: '10px',
    color: '#00ffcc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'move'
  });

  const closeBtn = document.createElement('span');
  closeBtn.textContent = '✖';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = () => { playClickSound(); menuRoot.remove(); };
  header.appendChild(closeBtn);
  menuRoot.appendChild(header);

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  header.addEventListener('mousedown', (e) => {
    if (e.target === closeBtn) return;
    isDragging = true;
    offsetX = e.clientX - menuRoot.getBoundingClientRect().left;
    offsetY = e.clientY - menuRoot.getBoundingClientRect().top;
    menuRoot.style.right = 'auto';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    menuRoot.style.left = `${e.clientX - offsetX}px`;
    menuRoot.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener('mouseup', () => { isDragging = false; });

  function createCategory(title) {
    const catDiv = document.createElement('div');
    catDiv.style.marginBottom = '12px';
    const catTitle = document.createElement('div');
    catTitle.textContent = `⚡ ${title.toUpperCase()}`;
    Object.assign(catTitle.style, {
      fontWeight: 'bold',
      color: '#ff00ff',
      borderBottom: '1px solid #ff0055',
      paddingBottom: '2px',
      marginBottom: '6px'
    });
    catDiv.appendChild(catTitle);
    return { container: catDiv, body: catDiv };
  }

  function createButton(label, onClick) {
    const btn = document.createElement('button');
    btn.textContent = label;
    Object.assign(btn.style, {
      width: '100%',
      backgroundColor: '#330044',
      color: '#00ffcc',
      border: '1px solid #ff0055',
      borderRadius: '6px',
      padding: '8px',
      marginBottom: '6px',
      cursor: 'pointer',
      textAlign: 'left',
      fontSize: '11px',
      fontWeight: 'bold'
    });
    btn.onmouseover = () => btn.style.backgroundColor = '#550066';
    btn.onmouseout = () => btn.style.backgroundColor = '#330044';
    btn.onclick = (e) => {
      playClickSound();
      onClick(e);
    };
    return btn;
  }

  // --- CATEGORY 1: DOM EDITING & STEALTH ---
  const catStealth = createCategory('1. Live Editing & Stealth');
  let calcOverlay = null;

  // NEW FEATURE: Live Text Editing Toggle
  let liveEditEnabled = false;
  catStealth.body.appendChild(createButton('✏️ Toggle Live Text Editing', () => {
    liveEditEnabled = !liveEditEnabled;
    document.designMode = liveEditEnabled ? 'on' : 'off';
    alert(`Live Text Editing is now ${liveEditEnabled ? 'ON (click any text on page to edit)' : 'OFF'}.`);
  }));

  catStealth.body.appendChild(createButton('🏫 Enable School Mode (Fake Calc)', () => {
    menuRoot.style.display = 'none';

    calcOverlay = document.createElement('div');
    Object.assign(calcOverlay.style, {
      position: 'fixed',
      top: '50px',
      right: '50px',
      width: '240px',
      backgroundColor: '#222',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
      zIndex: '2147483647',
      fontFamily: 'monospace'
    });

    const display = document.createElement('div');
    display.textContent = '0';
    Object.assign(display.style, {
      textAlign: 'right',
      background: '#000',
      color: '#0f0',
      padding: '10px',
      fontSize: '18px',
      borderRadius: '4px',
      marginBottom: '10px'
    });
    calcOverlay.appendChild(display);

    const btnGrid = document.createElement('div');
    Object.assign(btnGrid.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '6px'
    });

    const buttons = ['7','8','9','/','4','5','6','*','1','2','3','-','0','C','=','+'];
    let currentInput = '';

    buttons.forEach(symbol => {
      const b = document.createElement('button');
      b.textContent = symbol;
      b.onclick = () => {
        if (symbol === 'C') {
          currentInput = '';
          display.textContent = '0';
        } else if (symbol === '=') {
          try {
            display.textContent = eval(currentInput) || '0';
            currentInput = display.textContent;
          } catch {
            display.textContent = 'Error';
            currentInput = '';
          }
        } else {
          currentInput += symbol;
          display.textContent = currentInput;
        }
      };
      btnGrid.appendChild(b);
    });
    calcOverlay.appendChild(btnGrid);

    const exitBtn = document.createElement('button');
    exitBtn.textContent = 'Exit School Mode';
    Object.assign(exitBtn.style, {
      width: '100%',
      marginTop: '10px',
      background: '#444',
      color: '#aaa',
      border: 'none',
      padding: '6px',
      borderRadius: '4px',
      cursor: 'pointer'
    });
    exitBtn.onclick = () => {
      calcOverlay.remove();
      menuRoot.style.display = 'block';
    };
    calcOverlay.appendChild(exitBtn);

    document.body.appendChild(calcOverlay);
  }));

  catStealth.body.appendChild(createButton('🗣 Speak Custom Text (TTS)', () => {
    const text = prompt('Enter text to speak out loud:', 'System override engaged.');
    if (text) speakText(text);
  }));

  menuRoot.appendChild(catStealth.container);

  // --- CATEGORY 2: VISUAL OVERLAYS & FILTERS ---
  const catVisuals = createCategory('2. Visual Overlays & Filters');

  catVisuals.body.appendChild(createButton('💥 LAUNCH NUKE EXPLOSION', () => {
    playExplosionSound();

    const flash = document.createElement('div');
    Object.assign(flash.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#ffffff',
      zIndex: '2147483645',
      transition: 'background-color 2.5s ease-out',
      pointerEvents: 'none'
    });
    document.body.appendChild(flash);

    document.body.style.animation = 'nukeShake 0.1s infinite';
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes nukeShake {
        0% { transform: translate(10px, 10px) rotate(1deg); }
        50% { transform: translate(-10px, -10px) rotate(-1deg); }
        100% { transform: translate(10px, -10px) rotate(0deg); }
      }
    `;
    document.head.appendChild(styleSheet);

    setTimeout(() => { flash.style.backgroundColor = 'rgba(255, 60, 0, 0.8)'; }, 100);

    setTimeout(() => {
      flash.remove();
      styleSheet.remove();
      document.body.style.animation = '';
    }, 2500);
  }));

  let matrixCanvas = null;
  let matrixInterval = null;
  catVisuals.body.appendChild(createButton('🟢 Toggle Matrix Rain Overlay', () => {
    if (matrixCanvas) {
      clearInterval(matrixInterval);
      matrixCanvas.remove();
      matrixCanvas = null;
      return;
    }
    matrixCanvas = document.createElement('canvas');
    Object.assign(matrixCanvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '2147483644'
    });
    document.body.appendChild(matrixCanvas);

    const ctx = matrixCanvas.getContext('2d');
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*';
    const fontSize = 14;
    const columns = Math.floor(matrixCanvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function drawMatrix() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      ctx.fillStyle = '#0f0';
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    matrixInterval = setInterval(drawMatrix, 33);
  }));

  // NEW FEATURE: Invert Colors
  let colorsInverted = false;
  catVisuals.body.appendChild(createButton('🌓 Toggle Invert Colors', () => {
    colorsInverted = !colorsInverted;
    document.documentElement.style.filter = colorsInverted ? 'invert(1) hue-rotate(180deg)' : '';
  }));

  // NEW FEATURE: Party Disco Flash
  let partyInterval = null;
  catVisuals.body.appendChild(createButton('🪩 Toggle Party Disco Flash', () => {
    if (partyInterval) {
      clearInterval(partyInterval);
      partyInterval = null;
      document.body.style.backgroundColor = '';
      return;
    }
    partyInterval = setInterval(() => {
      document.body.style.backgroundColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    }, 100);
  }));

  // NEW FEATURE: Screen Redacted Mode
  let redactedMode = false;
  catVisuals.body.appendChild(createButton('⬛ Toggle Redacted / Censored Mode', () => {
    redactedMode = !redactedMode;
    const styleId = 'redacted-style-override';
    let styleEl = document.getElementById(styleId);
    if (redactedMode) {
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = 'p, h1, h2, h3, h4, span, a, li { background-color: #000 !important; color: #000 !important; }';
        document.head.appendChild(styleEl);
      }
    } else if (styleEl) {
      styleEl.remove();
    }
  }));

  menuRoot.appendChild(catVisuals.container);

  // --- CATEGORY 3: ULTRA GOOFY CHAOS ---
  const catGoofy = createCategory('3. Ultra Goofy Chaos');

  catGoofy.body.appendChild(createButton('🌐 Page Gravity Collapse', () => {
    const elements = Array.from(document.body.querySelectorAll('*')).filter(el => el !== menuRoot && !menuRoot.contains(el));
    elements.forEach(el => {
      const randomRot = Math.floor(Math.random() * 360) - 180;
      const randomY = Math.floor(Math.random() * 800) + 200;
      el.style.transition = 'transform 1.5s cubic-bezier(0.5, 0, 0.5, 1)';
      el.style.transform = `translateY(${randomY}px) rotate(${randomRot}deg)`;
    });
  }));

  let eyesContainer = null;
  let eyeMoveHandler = null;
  catGoofy.body.appendChild(createButton('👀 Toggle Googly Eyes', () => {
    if (eyesContainer) {
      document.removeEventListener('mousemove', eyeMoveHandler);
      eyesContainer.remove();
      eyesContainer = null;
      return;
    }

    eyesContainer = document.createElement('div');
    Object.assign(eyesContainer.style, {
      position: 'fixed',
      top: '10px',
      left: '10px',
      display: 'flex',
      gap: '10px',
      zIndex: '2147483646',
      pointerEvents: 'none'
    });

    for (let i = 0; i < 2; i++) {
      const eye = document.createElement('div');
      Object.assign(eye.style, {
        width: '50px',
        height: '50px',
        backgroundColor: '#fff',
        borderRadius: '50%',
        border: '3px solid #000',
        position: 'relative'
      });
      const pupil = document.createElement('div');
      pupil.className = 'pupil';
      Object.assign(pupil.style, {
        width: '20px',
        height: '20px',
        backgroundColor: '#000',
        borderRadius: '50%',
        position: 'absolute',
        top: '15px',
        left: '15px'
      });
      eye.appendChild(pupil);
      eyesContainer.appendChild(eye);
    }
    document.body.appendChild(eyesContainer);

    eyeMoveHandler = (e) => {
      const pupils = eyesContainer.querySelectorAll('.pupil');
      pupils.forEach(pupil => {
        const rect = pupil.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
        const distance = Math.min(10, Math.hypot(e.clientX - eyeX, e.clientY - eyeY));
        pupil.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
      });
    };
    document.addEventListener('mousemove', eyeMoveHandler);
  }));

  let dvdInterval = null;
  catGoofy.body.appendChild(createButton('📀 Bouncing DVD Panel Mode', () => {
    if (dvdInterval) {
      clearInterval(dvdInterval);
      dvdInterval = null;
      menuRoot.style.position = 'fixed';
      return;
    }

    let posX = 100;
    let posY = 100;
    let dx = 3;
    let dy = 3;
    menuRoot.style.right = 'auto';

    dvdInterval = setInterval(() => {
      const winW = window.innerWidth - menuRoot.offsetWidth;
      const winH = window.innerHeight - menuRoot.offsetHeight;

      posX += dx;
      posY += dy;

      if (posX <= 0 || posX >= winW) {
        dx = -dx;
        menuRoot.style.borderColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      }
      if (posY <= 0 || posY >= winH) {
        dy = -dy;
        menuRoot.style.borderColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      }

      menuRoot.style.left = `${posX}px`;
      menuRoot.style.top = `${posY}px`;
    }, 16);
  }));

  catGoofy.body.appendChild(createButton('✏️ Force Comic Sans Everywhere', () => {
    const style = document.createElement('style');
    style.textContent = '* { font-family: "Comic Sans MS", "Comic Sans", cursive !important; }';
    document.head.appendChild(style);
  }));

  // NEW FEATURE: Upside Down Page
  let pageFlipped = false;
  catGoofy.body.appendChild(createButton('🙃 Toggle Upside Down Page', () => {
    pageFlipped = !pageFlipped;
    document.body.style.transform = pageFlipped ? 'rotate(180deg)' : '';
    document.body.style.transition = 'transform 0.5s ease';
  }));

  // NEW FEATURE: Spinning Elements Hazard
  let spinningActive = false;
  catGoofy.body.appendChild(createButton('🌀 Toggle Spinning Elements', () => {
    spinningActive = !spinningActive;
    const styleId = 'spin-hazard-style';
    let styleEl = document.getElementById(styleId);
    if (spinningActive) {
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = `
          @keyframes spinEverything { 100% { transform: rotate(360deg); } }
          img, button, p, h1, h2 { animation: spinEverything 2s linear infinite !important; }
        `;
        document.head.appendChild(styleEl);
      }
    } else if (styleEl) {
      styleEl.remove();
    }
  }));

  // NEW FEATURE: Earthquake Shake
  let quaking = false;
  catGoofy.body.appendChild(createButton('🫨 Toggle Earthquake Shake', () => {
    quaking = !quaking;
    const styleId = 'earthquake-style';
    let styleEl = document.getElementById(styleId);
    if (quaking) {
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = `
          @keyframes earthQuake {
            0% { transform: translate(3px, 3px) rotate(0deg); }
            20% { transform: translate(-3px, -3px) rotate(-1deg); }
            40% { transform: translate(-3px, 3px) rotate(1deg); }
            60% { transform: translate(3px, 1px) rotate(0deg); }
            80% { transform: translate(1px, -3px) rotate(1deg); }
            100% { transform: translate(-2px, 2px) rotate(-1deg); }
          }
          body { animation: earthQuake 0.15s infinite !important; }
        `;
        document.head.appendChild(styleEl);
      }
    } else if (styleEl) {
      styleEl.remove();
    }
  }));

  // NEW FEATURE: Emoji Cursor Trails
  let trailHandler = null;
  catGoofy.body.appendChild(createButton('✨ Toggle Emoji Cursor Trail', () => {
    if (trailHandler) {
      document.removeEventListener('mousemove', trailHandler);
      trailHandler = null;
      return;
    }
    const emojis = ['✨', '🔥', '🤡', '🍕', '🎉', '💀'];
    trailHandler = (e) => {
      const spark = document.createElement('span');
      spark.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      Object.assign(spark.style, {
        position: 'fixed',
        left: `${e.clientX}px`,
        top: `${e.clientY}px`,
        pointerEvents: 'none',
        zIndex: '2147483646',
        fontSize: '16px',
        transition: 'all 1s linear'
      });
      document.body.appendChild(spark);
      setTimeout(() => {
        spark.style.opacity = '0';
        spark.style.transform = 'translateY(-30px)';
      }, 20);
      setTimeout(() => spark.remove(), 1000);
    };
    document.addEventListener('mousemove', trailHandler);
  }));

  // NEW FEATURE: Swap All Images to Cats
  catGoofy.body.appendChild(createButton('🐱 Swap Images to Cats', () => {
    document.querySelectorAll('img').forEach(img => {
      img.src = `https://cataas.com/cat?${Math.random()}`;
    });
  }));

  // NEW FEATURE: Confetti Cannon
  catGoofy.body.appendChild(createButton('🎊 Fire Confetti Cannon', () => {
    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div');
      Object.assign(piece.style, {
        position: 'fixed',
        left: `${Math.random() * 100}vw`,
        top: '-10px',
        width: '10px',
        height: '10px',
        backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        zIndex: '2147483646',
        pointerEvents: 'none',
        transition: `all ${2 + Math.random() * 2}s ease-out`
      });
      document.body.appendChild(piece);
      setTimeout(() => {
        piece.style.top = '100vh';
        piece.style.transform = `rotate(${Math.random() * 720}deg)`;
        piece.style.opacity = '0';
      }, 20);
      setTimeout(() => piece.remove(), 4000);
    }
  }));

  menuRoot.appendChild(catGoofy.container);

  // --- CATEGORY 4: SCREEN DRAWING ---
  const catDraw = createCategory('4. Screen Canvas & Drawing');
  let drawCanvas = null;
  let isDrawing = false;
  let drawCtx = null;

  catDraw.body.appendChild(createButton('✏️ Toggle Screen Drawing Mode', () => {
    if (drawCanvas) {
      drawCanvas.remove();
      drawCanvas = null;
      return;
    }
    drawCanvas = document.createElement('canvas');
    Object.assign(drawCanvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '2147483643',
      cursor: 'crosshair'
    });
    document.body.appendChild(drawCanvas);

    drawCanvas.width = window.innerWidth;
    drawCanvas.height = window.innerHeight;
    drawCtx = drawCanvas.getContext('2d');
    drawCtx.strokeStyle = '#00ffcc';
    drawCtx.lineWidth = 5;
    drawCtx.lineCap = 'round';

    drawCanvas.onmousedown = (e) => { isDrawing = true; drawCtx.beginPath(); drawCtx.moveTo(e.clientX, e.clientY); };
    drawCanvas.onmousemove = (e) => {
      if (isDrawing) {
        drawCtx.lineTo(e.clientX, e.clientY);
        drawCtx.stroke();
      }
    };
    drawCanvas.onmouseup = () => { isDrawing = false; };
  }));

  catDraw.body.appendChild(createButton('🧼 Clear Drawings', () => {
    if (drawCtx && drawCanvas) {
      drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    }
  }));

  menuRoot.appendChild(catDraw.container);
  document.body.appendChild(menuRoot);
  console.log('[GoofyPanel] Expanded goofy panel loaded!');
})();
